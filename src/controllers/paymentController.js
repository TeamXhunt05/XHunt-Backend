const db = require('../db/conn');
const { Pin, Cart, UserLogins  ,PickupOTP,Product,Store ,Order ,Payment} = db;
let mongoose = require('mongoose')
const moment = require('moment');
const scheduler = require('../helper/scheduler');
const { PAYMENT_UNPAID  ,PAYMENT_SUCCESS ,PAYMENT_FAILED, PRODUCT_ORDER_INITIATED ,ORDER_RECEIVED} = require('../constant/constant');
const uuid = require("uuid").v4
const Razorpay = require("razorpay");
const { jsonify } = require('../helper/helper');









module.exports = {

    //Time_Table Model

    
    addToCart: async (req, res, next) => {



        try {

            const {pin_id  ,product_id ,quantity} = req.body
            const {_id : user_id } = req.user
            req.body.user_id = user_id
            console.log("🚀 ~ file: paymentController.js:28 ~ addToCart: ~ user_id:", user_id)
      
      
        const getUser = await UserLogins.findById(user_id);
        const getPin = await Pin.findById(pin_id);
        const getProduct = await Product.findById(product_id);

      
        if(!getUser){
          return res.send({ status: 400, message: "user not found" });
        }

        if(!getPin){
            return res.send({ status: 400, message: "pin not found" });
          }

          if(!getProduct){
            return res.send({ status: 400, message: "product not found" });
          }
      
        
          if(quantity > getProduct.number_of_pieces){
            return res.send({ status: 400, message: "product quantity not available" });

          }

          let getCart = await Cart.findOne({pin_id ,user_id ,product_id })
          if(getCart){
            return res.send({ status: 400, message: "product is already into cart" });

          }
         





            const response = await Cart.create(req.body);
            return res.send({ message: "product added successfully into cart", status: 200  ,product :response});
           
        
          } catch (e) {
            return  res.send({ status: 400, message: e });
          }
    },
    removeToCart: async (req, res, next) => {



        try {

            const {cart_id } = req.body
      
      
        const getCart = await Cart.findById(cart_id);
     

      
        if(!getCart){
          return res.send({ status: 400, message: "product not in cart" });
        }


        
       

            const response = await Cart.findByIdAndRemove(cart_id);
            return res.send({ message: "product removed successfully from cart", status: 200 });
           
        
          } catch (e) {
            return  res.send({ status: 400, message: e });
          }
    },
    updateQty: async (req, res, next) => {


        try {

            const {cart_id ,quantity} = req.body
      
      
            const getCart = await Cart.findById(cart_id);
     

      
            if(!getCart){
              return res.send({ status: 400, message: "product not in cart" });

              
            }

            const getProduct = await Product.findById(getCart.product_id);
            if(!getProduct){
                return res.send({ status: 400, message: "product not found" });
              }

                      if(quantity > getProduct.number_of_pieces){
            return res.send({ status: 400, message: "product quantity not available" });

          }
        
            const response = await Cart.updateOne({_id : cart_id}, {quantity : quantity});
           
    
            if (response) {
              return res.send({ message: "quantity update successfully into cart", status: 200 , product :response });
            }
        
          } catch (e) {
            return  res.send({ status: 400, message: e });
          }
    },
    myCart: async (req, res, next) => {


        try {

            
            const {_id : user_id } = req.user

      if(!user_id){
        return res.send({ status: 400, message: "user_id is required" });
      }

      let getUser  = await UserLogins.findById(user_id)
      if(!getUser){
        return res.send({ status: 400, message: "user not found" });
      }
      
      const cart = await Cart.aggregate([
        {
            $match: {user_id : mongoose.Types.ObjectId(user_id)}
        },


        {
            $lookup: {
                from: 'users',
                localField: 'user_id',
                foreignField: "_id",
                as: "userInfo"
            }
        },
        {
            $lookup: {
                from: 'productmodels',
                localField: 'product_id',
                foreignField: "_id",
                as: "productInfo"
            }
        },
        {
            $lookup: {
                from: 'pinmodels',
                localField: 'pin_id',
                foreignField: "_id",
                as: "pinInfo"
            }
        },

      

        {
            $unwind: {
                path: '$userInfo',
                preserveNullAndEmptyArrays: true
            },
            $unwind: {
                path: '$productInfo',
                preserveNullAndEmptyArrays: true
            }, 
            $unwind: {
                path: '$pinInfo',
                preserveNullAndEmptyArrays: true
            } ,
    
            
        },

        { $lookup: {
            from: 'storemodels',
            localField: 'pinInfo.store_id',
            foreignField: '_id',
            as: 'storeInfo'

          }
        },
      
        {        $unwind: {
            path: '$storeInfo',
            preserveNullAndEmptyArrays: true
        } ,}
        ,
        {
            $addFields: {
              'productInfo.cartQuantity': '$quantity' ,
              'productInfo.cart_id': '$_id' , 
            }
          },  
        { $sort: { updated_at: -1 } },
      
      
      ]);

      const cartPaymentInfo = await Cart.aggregate([
        {
            $match: {user_id : mongoose.Types.ObjectId(user_id)}
        },
        {
            $lookup: {
                from: 'productmodels',
                localField: 'product_id',
                foreignField: "_id",
                as: "productInfo"
            }
        },
        {
            
            $unwind: {
                path: '$productInfo',
            }
        }, 
        {
            $project : {
                price : "$productInfo.price" ,
                discount_amount : "$productInfo.discount_amount" ,
                quantity : 1

            }
        } ,

        {
            $group: {
              _id: null,
              totalAmount: { $sum: { $multiply: [ "$price", "$quantity" ] } },
              payableAmount: { $sum: { $multiply: [ "$discount_amount", "$quantity" ] } },
              totalOfferDiscount: { $sum: { $multiply: [ { $subtract: [ "$price", "$discount_amount" ] }, "$quantity" ] } }


            }
          } ,
          {
            $project : {
                _id : 0,

            }
        } , 
      ]);


      let paymentInfo = cartPaymentInfo.length === 0 ? {} : cartPaymentInfo



      let cart_by_shop = cart.reduce((cartData, item) => ({
        ...cartData,
        [item.pinInfo.store_id]: [...(cartData[item.pinInfo.store_id] || []), item] 
      }), {});
      let shop_keys = Object.keys(cart_by_shop)




//       if(shop_keys.length !== 0){
//         let payInfoArray = []

//       let data = shop_keys.map(async(val) => {
//           let cart_item = cart_by_shop[val]
          
// let cart_ids = []
//           cart_item.map(async(cart) => {
//             cart_ids.push(mongoose.Types.ObjectId(cart.productInfo[0].cart_id))
//           })




//           const cartPaymentInfoData = await Cart.aggregate([
//             {
//                 $match: {_id : { $in:cart_ids }}
//             },
//             {
//                 $lookup: {
//                     from: 'productmodels',
//                     localField: 'product_id',
//                     foreignField: "_id",
//                     as: "productInfo"
//                 }
//             },
//             {
                
//                 $unwind: {
//                     path: '$productInfo',
//                 }
//             }, 
//             {
//                 $project : {
//                     price : "$productInfo.price" ,
//                     discount_amount : "$productInfo.discount_amount" ,
//                     quantity : 1
    
//                 }
//             } ,
    
//             {
//                 $group: {
//                   _id: null,
//                   totalAmount: { $sum: { $multiply: [ "$price", "$quantity" ] } },
//                   payableAmount: { $sum: { $multiply: [ "$discount_amount", "$quantity" ] } },
//                   totalOfferDiscount: { $sum: { $multiply: [ { $subtract: [ "$price", "$discount_amount" ] }, "$quantity" ] } }
    
    
//                 }
//               } ,
//               {
//                 $project : {
//                     _id : 0,
    
//                 }
//             } , 
//           ]);

//           payInfoArray.push(cartPaymentInfoData[0])
//           console.log("🚀 PaymentInfoData:",payInfoArray )

//         })

       

//       }





           return res.send({ message: "my cart list", status: 200 ,count : cart.length , paymentInfo  ,shop_keys ,cart_by_shop   });
           


        
          } catch (e) {
            return  res.send({ status: 400, message: e });
          }
    },

    StoreBillingPayment: async (req, res, next) => {


        try {

            
            const {_id : user_id } = req.user
           
            const {pin_id,reference_id ,totalAmount ,payableAmount ,totalOfferDiscount} = req.body
            const order_id = uuid();
            let transaction_status  = PAYMENT_UNPAID
           
            if(!user_id){
                return res.send({ status: 400, message: "user_id is required" });
              }
        
              let getUser  = await UserLogins.findById(user_id)
             let getPin = await Pin.findById(pin_id)
            if(!getPin){
                return res.send({ status: 400, message: "pin not found" });
            }
            if(!getUser){
                return res.send({ status: 400, message: "user not found" });
              }


        
              const cartPaymentInfo = await Cart.aggregate([
                {
                    $match: {user_id : mongoose.Types.ObjectId(user_id)}
                },
                {
                    $lookup: {
                        from: 'productmodels',
                        localField: 'product_id',
                        foreignField: "_id",
                        as: "productInfo"
                    }
                },
               
              
        
                {
                    
                    $unwind: {
                        path: '$productInfo',
                    }
                }, 
                {
                    $project : {
                        price : "$productInfo.price" ,
                        discount_amount : "$productInfo.discount_amount" ,
                        quantity : 1
        
                    }
                } ,
        
                {
                    $group: {
                      _id: null,
                      totalAmount: { $sum: { $multiply: [ "$price", "$quantity" ] } },
                      payableAmount: { $sum: { $multiply: [ "$discount_amount", "$quantity" ] } },
                      totalOfferDiscount: { $sum: { $multiply: [ { $subtract: [ "$price", "$discount_amount" ] }, "$quantity" ] } }
        
        
                    }
                  } ,
                  {
                    $project : {
                        _id : 0,
        
                    }
                } ,
              
                 
        
              
              ]);
        
        
              let paymentInfo = cartPaymentInfo.length === 0 ? {} : cartPaymentInfo


              if(totalAmount <= 0){
                transaction_status = PAYMENT_SUCCESS
              }



           

            let newBody = {
                pin_id :pin_id,
                store_id : getPin.store_id,
                user_id : user_id,
                total_amount :totalAmount,
                reference_id :reference_id,
                payment_status :transaction_status ,
                max_discount_value : totalAmount,
                min_transaction_value :totalAmount,
                discounted_amount :totalOfferDiscount,
                discount_unit : 0,
                discount :totalOfferDiscount,
                payable_amount :payableAmount,
                is_storebilling :true,
                order_id : order_id ,
                order_type : getPin.categories


            }
           

           let createOrder = await Order.create(newBody)
          let data = {
            "paymentid": createOrder._id,
            "totalamout": totalAmount,
            "discount": totalOfferDiscount,
            "order_number":createOrder.order_id,
        }
           
           return res.send({ message: "create storebillingpayment", data:data ,status: 200 , });

         


        
          } catch (e) {
            return  res.send({ status: 400, message: e.message });
          }
    },
    StoreBillingPaymentList: async (req, res, next) => {


        try {

            
            const {_id : user_id } = req.user
            const store_bill_list = await Order.aggregate([
                {
                    $match: {user_id : mongoose.Types.ObjectId(user_id)}
                },
                {
                    $lookup: {
                        from: 'pinmodels',
                        localField: 'pin_id',
                        foreignField: "_id",
                        as: "pinInfo"
                    }
                },
               
              
        
                {
                    
                    $unwind: {
                        path: '$pinInfo',
                    }
                }, 


                {
                  $lookup: {
                      from: 'pickupotpmodels',
                      localField: '_id',
                      foreignField: "order_id",
                      as: "otpInfo"
                  }
              },

              {
                    
                $unwind: {
                    path: '$otpInfo',
                    preserveNullAndEmptyArrays: true

                }
            }, 


                { $lookup: {
                  from: 'storemodels',
                  localField: 'pinInfo.store_id',
                  foreignField: '_id',
                  as: 'storenInfo'
                }
              },


              { $unwind: '$storenInfo' },
              { $lookup: {
                from: 'payments',
                localField: '_id',
                foreignField: 'order_id',
                as: 'paymentInfo'
              }
            },
            { $unwind: '$paymentInfo' },

           
             


                {
                  $lookup: {
                    from: "productmodels", // Name of the Product collection
                    localField: "products.product_id", // Field in the Order collection
                    foreignField: "_id", // Field in the Product collection
                    as: "productDetail" // New field to store product information
                  }
                },
                {
                  $addFields: {
                    products: {
                      $map: {
                        input: "$products",
                        as: "product",
                        in: {
                          $mergeObjects: [
                            "$$product",
                            {
                              $let: {
                                vars: {
                                  matchedProduct: {
                                    $arrayElemAt: [
                                      "$productDetail",
                                      { $indexOfArray: ["$productDetail._id", "$$product.product_id"] }
                                    ]
                                  }
                                },
                                in: {
                                  productDetail: "$$matchedProduct"
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                },
                {
                  $project: {
                    productDetail: 0 // Exclude the productDetail field from the final output
                  }
                }
             
        

    
              
                 
        
              
              ]);
        
        


           

           return res.send({ message: "storebill list get successfully", store_bill_list:store_bill_list ,status: 200 , });

         


        
          } catch (e) {
            return  res.send({ status: 400, message: e });
          }
    },
    StoreBillingPaymentListView: async (req, res, next) => {


      try {

          
          const {_id : user_id } = req.user
          const {order_id } = req.body


          let query = {_id : mongoose.Types.ObjectId(order_id)}
          const store_bill_list = await Order.aggregate([
              {
                  $match: query
              },
              {
                  $lookup: {
                      from: 'pinmodels',
                      localField: 'pin_id',
                      foreignField: "_id",
                      as: "pinInfo"
                  }
              },
             
            
      
              {
                  
                  $unwind: {
                      path: '$pinInfo',
                  }
              }, 


              {
                $lookup: {
                    from: 'pickupotpmodels',
                    localField: '_id',
                    foreignField: "order_id",
                    as: "otpInfo"
                }
            },

            {
                  
              $unwind: {
                  path: '$otpInfo',
                  preserveNullAndEmptyArrays: true

              }
          }, 


              { $lookup: {
                from: 'storemodels',
                localField: 'pinInfo.store_id',
                foreignField: '_id',
                as: 'storenInfo'
              }
            },
            { $unwind: '$storenInfo' },

            { $lookup: {
              from: 'payments',
              localField: '_id',
              foreignField: 'order_id',
              as: 'paymentInfo'
            }
          },
          
        {
          $unwind: {
              path: '$paymentInfo',
              preserveNullAndEmptyArrays: true
          },
   
      },
           


              {
                $lookup: {
                  from: "productmodels", // Name of the Product collection
                  localField: "products.product_id", // Field in the Order collection
                  foreignField: "_id", // Field in the Product collection
                  as: "productDetail" // New field to store product information
                }
              },
              {
                $addFields: {
                  products: {
                    $map: {
                      input: "$products",
                      as: "product",
                      in: {
                        $mergeObjects: [
                          "$$product",
                          {
                            $let: {
                              vars: {
                                matchedProduct: {
                                  $arrayElemAt: [
                                    "$productDetail",
                                    { $indexOfArray: ["$productDetail._id", "$$product.product_id"] }
                                  ]
                                }
                              },
                              in: {
                                productDetail: "$$matchedProduct"
                              }
                            }
                          }
                        ]
                      }
                    }
                  }
                }
              },
              {
                $project: {
                  productDetail: 0 // Exclude the productDetail field from the final output
                }
              }
           
      

  
            
               
      
            
            ]);
      
      


         

         return res.send({ message: "storebill list get successfully", store_bill_list:store_bill_list ,status: 200 , });

       


      
        } catch (e) {
          return  res.send({ status: 400, message: e });
        }
  },
    UpdateHandlePayment: async (req, res, next) => {


        try {
            const {_id : user_id } = req.user;
            const {HANDLE_PAYMENTID ,rezorpay_error_code,rezorpay_error_message,rezorpay_external_wallet,rezorpay_payment_id,rezorpay_signature,rezorpay_order_id} = req.body;

     

let paymentData = await Payment.findById(HANDLE_PAYMENTID)    


      if(!paymentData){
        return res.send({ status: 400, message: "Not found id in handle payment model" });
      }

      if(paymentData.status === PAYMENT_SUCCESS){
        return res.send({ status: 400, message: "Already Payment" });
      }

      let updatePaymentData = {
        rezorpay_error_code,
        rezorpay_error_message,
        rezorpay_external_wallet,
        rezorpay_payment_id,
        rezorpay_signature,
        rezorpay_order_id,

      }

      let updateResult = await Payment.updateOne({_id : HANDLE_PAYMENTID}, updatePaymentData)

      let order_id = paymentData.order_id
      const getOrder = await Order
      .findOne({
          $or: [{
            order_id: order_id
          },
          {
            _id: order_id
          }]
      });


      
      if(!getOrder){
        return res.send({ status: 400, message: "Not found id in handle order model" });
      }

      // if (rezorpay_payment_id !== null && rezorpay_signature !== null && rezorpay_order_id !== null){}


      if (rezorpay_payment_id !== null || rezorpay_signature !== null || rezorpay_order_id !== null){
        await Order.updateOne({_id : order_id}, {payment_status :PAYMENT_SUCCESS})
        await Payment.updateOne({_id : HANDLE_PAYMENTID}, {status :PAYMENT_SUCCESS})
        return  res.send({ status: 200, message: "Payment update" });


      }else{

        await Order.updateOne({_id : order_id}, {payment_status :PAYMENT_FAILED})
        await Payment.updateOne({_id : HANDLE_PAYMENTID}, {status :PAYMENT_FAILED})

        return  res.send({ status: 400, message: "Payment Inpaid" });
      }



      


        



          } catch (e) {
            return  res.send({ status: 400, message: e });
          }
    },
    CheckOrder: async (req, res, next) => {


        try {

            
            const {_id : user_id } = req.user
            const {order_id } = req.body


      if(!user_id){
        return res.send({ status: 400, message: "user_id is required" });
      }
      
      if(!order_id){
        return res.send({ status: 400, message: "order_id is required" });
      }

      let getUser  = await UserLogins.findById(user_id)
      let getOrder  = await x.findOne({order_id :order_id})

      if(!getUser){
        return res.send({ status: 400, message: "user not found" });
      }
      if(!getOrder){
        return res.send({ status: 400, message: "No Found Order Number" });
      }
      



           return res.send({ message: "order get successfully", status: 200 ,data :getOrder    });


        
          } catch (e) {
            return  res.send({ status: 400, message: e.message });
          }
    },
    HandlePayment: async (req, res, next) => {


        try {      
            const {_id : user_id } = req.user
            const {order_id } = req.body


      if(!user_id){
        return res.send({ status: 400, message: "user_id is required" });
      }

      if(!order_id){
        return res.send({ status: 400, message: "user_id is required" });
      }

      const getUser  = await UserLogins.findById(user_id)
      const getOrder = await Order
      .findOne({
          $or: [{
            order_id: order_id
          },
          {
            _id: order_id
          }]
      })
      .lean().exec();
      if(!getUser){
        return res.send({ status: 400, message: "user not found" });
      }
      if(!getOrder){
        return res.send({ status: 400, message: "order not found" });
      }
      
      const paymentdata = await Payment.findOne({order_id:order_id,amount : getOrder.payable_amount})

      if(paymentdata){
if (      paymentdata.status === PAYMENT_SUCCESS ) {
    return  res.send({ status: 400, message :"Payment is all ready paid", });
    
}  else{
    return  res.send({ status: 400, message :"something went wrong", });

}      
      }
      

      let paymentData = {
        order_id:order_id ,
        amount : getOrder.payable_amount,
        
      }

      const handlepayment = await Payment.create(paymentData)
      let response = {
        amount : getOrder.payable_amount,
        txn_id: handlepayment._id,
    }


           return res.send({ message: "payment successfull", status: 200 ,data : response   });


        
          } catch (e) {
            return  res.send({ status: 400, message: e });
          }
    },
    PaymentApi: async (req, res, next) => {


        try {

            
            const {_id : user_id } = req.user
            console.log("🚀 ~ file: paymentController.js:147 ~ myCart: ~ user_id:", user_id)

      if(!user_id){
        return res.send({ status: 400, message: "user_id is required" });
      }

      let getUser  = await UserLogins.findById(user_id)
      if(!getUser){
        return res.send({ status: 400, message: "user not found" });
      }
      
      const cart = await Cart.aggregate([
        {
            $match: {user_id : mongoose.Types.ObjectId(user_id)}
        },


        {
            $lookup: {
                from: 'users',
                localField: 'user_id',
                foreignField: "_id",
                as: "userInfo"
            }
        },
        {
            $lookup: {
                from: 'productmodels',
                localField: 'product_id',
                foreignField: "_id",
                as: "productInfo"
            }
        },
        {
            $lookup: {
                from: 'pinmodels',
                localField: 'pin_id',
                foreignField: "_id",
                as: "pinInfo"
            }
        },
      

        {
            $unwind: {
                path: '$userInfo',
                preserveNullAndEmptyArrays: true
            },
            $unwind: {
                path: '$productInfo',
                preserveNullAndEmptyArrays: true
            }, $unwind: {
                path: '$pinInfo',
                preserveNullAndEmptyArrays: true
            }
        },

        {
            $addFields: {
              'productInfo.cartQuantity': '$quantity' ,
              'productInfo.cart_id': '$_id' , 
            }
          },

      

      
        { $sort: { updated_at: -1 } },
      
      
      ]);

      const cartPaymentInfo = await Cart.aggregate([
        {
            $match: {user_id : mongoose.Types.ObjectId(user_id)}
        },
        {
            $lookup: {
                from: 'productmodels',
                localField: 'product_id',
                foreignField: "_id",
                as: "productInfo"
            }
        },
       
      

        {
            
            $unwind: {
                path: '$productInfo',
            }
        }, 
        {
            $project : {
                price : "$productInfo.price" ,
                discount_amount : "$productInfo.discount_amount" ,
                quantity : 1

            }
        } ,

        {
            $group: {
              _id: null,
              totalAmount: { $sum: { $multiply: [ "$price", "$quantity" ] } },
              payableAmount: { $sum: { $multiply: [ "$discount_amount", "$quantity" ] } },
              totalOfferDiscount: { $sum: { $multiply: [ { $subtract: [ "$price", "$discount_amount" ] }, "$quantity" ] } }


            }
          } ,
          {
            $project : {
                _id : 0,

            }
        } ,
      
         

      
      ]);


      let paymentInfo = cartPaymentInfo.length === 0 ? {} : cartPaymentInfo


           return res.send({ message: "my cart list", status: 200 ,paymentInfo  ,cart   });


        
          } catch (e) {
            return  res.send({ status: 400, message: e });
          }
    },
    OrderApi: async (req, res, next) => {


        try {

            
            const {_id : user_id } = req.user
            const {cart_id ,totalAmount,reference_id ,payableAmount ,totalOfferDiscount} = req.body;
            let transaction_status  = PAYMENT_UNPAID
            const order_id = uuid();


            if(!user_id){
              return res.send({ status: 400, message: "user_id is required" });
            }
      
            let getUser  = await UserLogins.findById(user_id)
           if(!getUser){
              return res.send({ status: 400, message: "user not found" });
            }
            
        let cart_ids = JSON.parse(cart_id)
        let convert_cart_ids = cart_ids.map(value =>  mongoose.Types.ObjectId(value))
        const cartPaymentInfoData = await Cart.aggregate([
          {
            $match: {_id : { $in:convert_cart_ids }}
        },
            {
                $lookup: {
                    from: 'productmodels',
                    localField: 'product_id',
                    foreignField: "_id",
                    as: "productInfo"
                }
            },
            {
                
                $unwind: {
                    path: '$productInfo',
                }
            }, 
          ]);
        console.log("🚀 ~ file: paymentController.js:1152 ~ OrderApi: ~ cartPaymentInfoData:", cartPaymentInfoData)


          let getPin = await Pin.findById(cartPaymentInfoData[0].pin_id)
          if(!getPin){
            return res.send({ status: 400, message: "pin not found" });
        }
 
        let cartIds = []
          let embeddedProduct = cartPaymentInfoData.map((val) => {

            cartIds.push(val._id);
            
            product = {
              product_id : val.product_id ,
              quantity : val.quantity ,
              status : PRODUCT_ORDER_INITIATED
            }
            return product
          })
          
   

          if(totalAmount <= 0){
            transaction_status = PAYMENT_SUCCESS
          }

     


          
          let newBody = {
            pin_id : getPin._id,
            store_id : getPin.store_id,
            user_id : user_id,
            total_amount :totalAmount,
            reference_id :reference_id,
            payment_status :transaction_status ,
            max_discount_value : totalAmount,
            min_transaction_value :totalAmount,
            discounted_amount :totalOfferDiscount,
            discount_unit : 0,
            discount :totalOfferDiscount,
            payable_amount :payableAmount,
            is_storebilling :false,
            order_id : order_id ,
            order_type : "LAST_MINUTE_PIN" ,
            products : embeddedProduct
        }
        console.log("🚀 ~ file: paymentController.js:1201 ~ OrderApi: ~ newBody.getPin:", getPin)
 
            







        let createOrder = await Order.create(newBody)
        let data = {
          "paymentid": createOrder._id,
          "totalamout": totalAmount,
          "discount": totalOfferDiscount,
          "order_number":createOrder.order_id,
      }

         const deleteResult = await Cart.deleteMany({ _id: { $in: cartIds } });
         console.log("🚀 ~ file: paymentController.js:1005 ~ OrderApi: ~ deleteResult:", deleteResult)
         
         return res.send({ message: "create order successfull", data:data ,status: 200 , });


        




        
          } catch (e) {
            return  res.send({ status: 400, message: e.message});
          }
    },
    RefundApi: async (req, res, next) => {



        try {





            const { stream_id, year, class_name, subject_id, teacher_id, date, time_range,class_location ,days ,section } = req.body;
            const getSchool = await School.findOne({ loginid: req.user._id });

            let tableData = {
                teacher_id: teacher_id,
                school_id: getSchool._id,
                subject_id: subject_id,
                stream_id: stream_id,
                year: year,
                class: class_name,
                startTime: time_range[0],
                endTime: time_range[1],
                startDate : date[0],
                endDate :  date[1],
                class_location: class_location,
                days:days,
                section:section
                
                

            }

           

            function getDaysBetweenDates(start, end, days) {
                var result = []; 
                days.map((val)=>{
                    var current = new Date(start);
                    // Shift to next of required days
                    current.setDate(current.getDate() + (val - current.getDay() + 7) % 7);
                    // While less than end date, add dates to result array
                    while (current <= end) {
                      result.push(new Date(+current));
                      current.setDate(current.getDate() + 7);
                    }
                }
                )
               
                // Copy start date
            
                return result;  
              }
              
            let allDate = getDaysBetweenDates( moment(tableData.startDate),moment(tableData.endDate),  days)
            tableData.all_dates = allDate
              
             

            // let findTime_Table = await Time_Table.find({hall_name , user_id : _id})
            // if(findTime_Table.length > 0){
            //     res.send({ status: false, message: "Time_Table Already Exits"});
            //     return false;
            // }
            const Time_TableModel = new Time_Table(tableData);
            await Time_TableModel.save();
            scheduler.scheduleAllJobs()
            return res.send({ status: true, message: 'created successfully' });

        } catch (error) {


            return res.send({ status: false, message: error.message });
        }
    },
    PickupOtpApi: async (req, res, next) => {

try {
  
  const {_id : user_id } = req.user
      const {order_id} = req.body;

          
      const getUser = await UserLogins.findById(user_id);
      const getOrder = await Order.findById(order_id);
      const getOtp = await PickupOTP.findOne({order_id : order_id});
  


    
      if(!getUser){
        return res.send({ status: 400, message: "user not found" });
      }
      
      if(!getOrder){
        return res.send({ status: 400, message: "order not found" });
      }
          const otp_generate = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
          if (getOrder.status === ORDER_RECEIVED ) {
            return res.send({ staus : 400 , message: "Order already received, please contact admin." });
          }
        
      
        const expiry_time = new Date();
        expiry_time.setHours(expiry_time.getHours() + 4);

        
      
        let PickupOTPModel = {
          user_id: user_id,
          expiry: expiry_time,
          otp: otp_generate,
          order_id: order_id
        }


        // delete previous otp 

        if(getOtp){
          await PickupOTP.deleteOne({order_id : order_id});
          await PickupOTP.create(PickupOTPModel);
          return res.send({
            message: "Resend otp successfully",
            data: { otp: otp_generate, expiry: expiry_time },
            status: 200
          });
        }else {
          await PickupOTP.create(PickupOTPModel);
       
      
          return res.send({
            message: "Otp generated successfully",
            data: { otp: otp_generate, expiry: expiry_time },
            status: 200
          });
        }

      
} catch (error) {
  
  return res.send({
    message: error.message, 
    status: 400
  });
  
}
      
    
      
    },
    
    VerifyPickupOtpApi: async (req, res, next) => {




    try {

      

      const {_id : user_id } = req.user
      const {order_id ,otp} = req.body;
  
          
      const getUser = await UserLogins.findById(user_id);
      const getOrder = await Order.findById(order_id);


      
  


    
      if(!getUser){
        return res.send({ status: false, message: "user not found" });
      }
      
      if(!getOrder){
        return res.send({ status: false, message: "order not found" });
      }


      const getOtp = await PickupOTP.findOne({order_id : order_id , otp :otp });


      if(getOtp){
        const currentTime = new Date();
        const expiryTime = getOtp.expiry




        
  
        if (currentTime < expiryTime) {

          if(getOrder.status === ORDER_RECEIVED){
            return res.send({
              message: "Otp is already verified",
              status: false
            });
          }


          await Order.updateOne({_id : order_id}, {status :ORDER_RECEIVED})


          
          
          return res.send({
            message: "Otp verified",
            status: true
          })

        }else{
          return res.send({
            message: "Otp is expired",
            status: false
          });

        }

      }else {
        return res.send({
          message: "Otp is not valid",
          status: false
        });
      }

      
    } catch (error) {
      return res.send({
        message: error.message,
        status: false
      });
    }
      
      
      
    },
    GenereateToken: async (req, res) => {

        try {
            const {amount ,receipt} = req.body;

            const client = new Razorpay({
                key_id: 'rzp_live_gXE5z3i5UKskgS',
                key_secret: '4vS93eUoMID6Zo72KRSUnqCv',
              });
           
    
            const paymentData = {
                amount: Math.round(amount), // Amount in paise (e.g., 1000 paise = Rs. 10)
                currency: 'INR',
                receipt: receipt, // Unique identifier for the order
                // payment_capture: 1, // 1 - capture the payment immediately, 0 - authorize only
              }
            console.log("🚀 ~ file: paymentController.js:1218 ~ GenereateToken: ~ paymentData:", paymentData)
    
    
              client.orders.create(paymentData, (err, payment) => {
                if (err) {
                  return res.status(500).json({ error: err.message });
                } else {
              
                  return res.json({data :  payment  });
                }
              });
    
        }catch (error) {


            return res.send({ status: false, message: error.message });
        }
    
 









       

      },
      
      
      

    TestGenereateToken: async (req, res, next) => {
        try {


            const { stream_id, year, class_name, subject_id, teacher_id, date, time_range, _id,class_location ,days ,section} = req.body;

            let tableData = {
                teacher_id: teacher_id,
                subject_id: subject_id,
                stream_id: stream_id,
                year: year,
                class: class_name,
                startTime: time_range[0],
                endTime: time_range[1],
                startDate : date[0],
                endDate :  date[1],
                class_location: class_location,
                days:days,
                section:section
                

            }

            let findTime_Table = await Time_Table.findById(_id);
            

          

            if (!_id) {
                return res.send({ status: false, message: 'Id is required' });
            }

                function getDaysBetweenDates(start, end, days) {
                    var result = []; 
                    days.map((val)=>{
                        var current = new Date(start);
                        // Shift to next of required days
                        current.setDate(current.getDate() + (val - current.getDay() + 7) % 7);
                        // While less than end date, add dates to result array
                        while (current <= end) {
                          result.push(new Date(+current));
                          current.setDate(current.getDate() + 7);
                        }
                    }
                    )
                   
                    // Copy start date
                
                    return result;  
                    
                  }


                  
                  
                let allDate = getDaysBetweenDates( moment(tableData.startDate),moment(tableData.endDate),  days)
                tableData.all_dates = allDate


          
            let updated = await Time_Table.updateOne({ _id: _id }, tableData).lean().exec();
            scheduler.scheduleAllJobs()


            return res.send({ status: true, message: 'updated successfully' });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

    getAllTimeTableList: async (req, res, next) => {
        try {

            const { stream_id, year, class_name, subject_id, teacher_id, date } = req.body;
           
            const getSchool = await School.findOne({ loginid: req.user._id });
            let match = { school_id: getSchool._id }
          
            if (stream_id) {
                match.stream_id = mongoose.Types.ObjectId(stream_id)
            }
            if (year) {
                match.year = year
            }
            if (class_name) {
                match.class = class_name
            }
            if (subject_id) {
                match.subject_id = mongoose.Types.ObjectId(subject_id)
            }
            if (teacher_id) {
                match.teacher_id = mongoose.Types.ObjectId(teacher_id)
            }
            if (date) {
                let dateFormat = moment(date).format("yyyy-MM-DD");

                // match.date = {
                //     $gte: new Date(`${dateFormat}T00:00:00.000Z`),
                //     $lt: new Date(`${dateFormat}T23:59:59.999Z`),
                // }

                match.all_dates = {
                    "$elemMatch": {   $gte: new Date(`${dateFormat}T00:00:00.000Z`),
                                     $lt: new Date(`${dateFormat}T23:59:59.999Z`),  }
                  }

            }


console.log('match' ,match)

            const listData = await Time_Table.aggregate([
                {
                    $match: match
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'teacher_id',
                        foreignField: "_id",
                        as: "userInfo"
                    }
                },
                {
                    $lookup: {
                        from: 'streams',
                        localField: 'stream_id',
                        foreignField: "_id",
                        as: "streamInfo"
                    }
                },
                {
                    $lookup: {
                        from: 'subjects',
                        localField: 'subject_id',
                        foreignField: "_id",
                        as: "subjectInfo"
                    }
                },
                {
                    $unwind: {
                        path: '$userInfo',
                        preserveNullAndEmptyArrays: true
                    },
                    $unwind: {
                        path: '$streamInfo',
                        preserveNullAndEmptyArrays: true
                    }, $unwind: {
                        path: '$subjectInfo',
                        preserveNullAndEmptyArrays: true
                    }
                },
                { $sort: { updated_at: -1 } },


            ]);








            return res.send({ status: true, data: listData, message: 'get successfully' });

        } catch (error) {


            return res.send({ status: false, message: error.message });
        }
    },

    getAllTime_TableList: async (req, res, next) => {
        try {
            let _id = req.body._id;
            const reqBody = req.body;



            const Limit = reqBody.limit ? parseInt(reqBody.limit) : 10;
            const PageNo = reqBody.page ? parseInt(reqBody.page) : 0;
            const data = await Time_Table.find({ user_id: _id }).sort({ updated_at: -1 }).skip(Limit * PageNo).limit(Limit).lean().exec();
            const count = await Time_Table.count({ user_id: _id });


            return res.send({ status: true, data: data, count: count, message: 'Time_Table Holl List get successfully' });


        } catch (error) {


            return res.send({ status: false, message: error.message });
        }
    },




    deleteTimeTable: async (req, res, next) => {
        try {
            const reqQuery = req.query;
            const _id = reqQuery.slug;



            if (!_id) {
                return res.send({ status: false, message: '_id is required' });
            }


            const deleted = await Time_Table.findOneAndRemove({ _id: _id }).lean().exec();

            if (!deleted) {
                return res.send({ status: false, message: 'not found' });
            }


            //Remove Schedule from timetable
            scheduler.removeScheduledJob(String(_id))

            return res.send({ status: true, message: 'deleted successfully' });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

    getTimeTable: async (req, res, next) => {

        try {
            const reqQuery = req.query;
            const _id = reqQuery.slug;
            console.log(_id)

            if (!_id) {
                return res.send({ status: false, message: '_id is required' });
            }

            const data = await Time_Table.find({ _id: _id }).lean().exec();






            return res.send({ status: true, data: data, message: 'get successfully' });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },


    getUserTimeTable: async (req, res, next) => {

        try {
            const { user_id, date } = req.body;
            const get_user = await UserLogins.findById(user_id);

            if (!user_id) {
                return res.send({ status: 400, message: 'user_id is required' });
            }
            let match = {
                school_id: mongoose.Types.ObjectId(get_user.school_id),
                stream_id: mongoose.Types.ObjectId(get_user.stream_id),
                year: get_user.year,
                class: {$in : get_user.class_name },
                // class:  get_user.class_name ,

                remove_user_id : {$nin : [user_id] }
            }

            if (date) {
                let dateNew = new Date(date)
                let dateFormat = moment(dateNew).format("yyyy-MM-DD");
                match.all_dates = {
                    "$elemMatch": {   $gte: new Date(`${dateFormat}T00:00:00.000Z`),
                                     $lt: new Date(`${dateFormat}T23:59:59.999Z`),  }
                  }
            }



            const data = await Time_Table.aggregate([
                {
                    $match: match
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'teacher_id',
                        foreignField: "_id",
                        as: "teacherInfo"
                    }
                },
                {
                    $lookup: {
                        from: 'streams',
                        localField: 'stream_id',
                        foreignField: "_id",
                        as: "streamInfo"
                    }
                },
                {
                    $lookup: {
                        from: 'subjects',
                        localField: 'subject_id',
                        foreignField: "_id",
                        as: "subjectInfo"
                    }
                },
                {
                    $unwind: {
                        path: '$teacherInfo',
                        preserveNullAndEmptyArrays: true
                    },
                    $unwind: {
                        path: '$streamInfo',
                        preserveNullAndEmptyArrays: true
                    }, $unwind: {
                        path: '$subjectInfo',
                        preserveNullAndEmptyArrays: true
                    }
                },

                {$sort: {created_at: -1}}
            ]);






            


            return res.send({ status: 200, list: data, message: 'get successfully' });

        } catch (error) {
            return res.send({ status: 400, message: error.message });
        }
    },

    removeUserTimeTable: async (req, res, next) => {


        try {  
            const {_id } =req.body

          

            if (!_id) {
                return res.send({ status: 400, message: '_id is required' });
            }

          let updateTimeTable =   await Time_Table.findOneAndUpdate(  { _id: _id },   { $push: { remove_user_id: req.user._id  } },)

       
         return res.send({ status: 200, message: 'removed successfully' });

        } catch (error) {
            return res.send({ status: 400, message: error.message });
        }
    },

    createTimeTableCopy: async (req, res, next) => {
  

        try {


            const { stream_id, year, class_name, subject_id, teacher_id, date, time_range ,class_location } = req.body;
            const getSchool = await School.findOne({ loginid: req.user._id });

            let tableData = {
                teacher_id: teacher_id,
                school_id: getSchool._id,
                subject_id: subject_id,
                stream_id: stream_id,
                year: year,
                class: class_name,
                startTime: time_range[0],
                endTime: time_range[1],
                date: date,
                class_location : class_location

            }
            let dateFormat = moment(date).format("yyyy-MM-DD");
            let mytimeval;




            let findTime_Table = await Time_Table.find({ school_id: getSchool._id, stream_id: stream_id, year: year, class: class_name, date: { $gte: new Date(`${dateFormat}T00:00:00.000Z`), $lt: new Date(`${dateFormat}T23:59:59.999Z`) } })
            const gettimewithmap = findTime_Table.map((time,i)=>{
             
              const time1=moment(time?.startTime).format("HH:mm")+" "+"-"+" "
              const time2=moment(time?.endTime).format("HH:mm")
           
                return  time1+time2
              })

              let start = moment(time_range[0]).format("HH:mm")+" "+"-"+" ";
              let end = moment(time_range[1]).format("HH:mm");
              const arr=[`${start}${end}`]

              console.log('pervious' , gettimewithmap)
              console.log('new' , arr)


            

              const timeval=(val)=>{
                console.log('last val',val)
               let vali=val.map((value)=>{
                 let n=8
                   let newval=value.substring(0,5)
                   let newval2=value.substring(8,14)
     
                   let newvalmin =Number(newval.substring(0,2)*60)+Number(newval.substring(3,5))
                   let newval2min =Number(newval2.substring(0,2)*60)+Number(newval2.substring(3,5))
                  
                   const subarrstring=arr[0].substring(0,5)
                   const subarrstring2=arr[0].substring(8,14)
                   
                   let subarrstringmin=Number(subarrstring.substring(0,2)*60)+Number(subarrstring.substring(3,5))
                   let subarrstringmin2=Number(subarrstring2.substring(0,2)*60)+Number(subarrstring2.substring(3,5))
                  
             if(newval2min>subarrstringmin2){
              
               if(newvalmin<subarrstringmin2 && subarrstringmin2<newval2min  ){
                
                 return 'not1'
               
               
               }else{
                return 'add1'
                 
               }
             }else{
             
               if(newvalmin<subarrstringmin && subarrstringmin<newval2min  ){
                
                 //console.log('not adding2')
                 return 'not2'
               
               }else{
                 
                
                 return 'add2'
               }
             }
                  
                   
               })
                console.log('vali',vali)
                if(vali.includes('not1')||vali.includes('not2')){
                  console.log('add nhi hoga')
                }else{
                 gettimewithmap.indexOf(arr) === -1 ? gettimewithmap.push(arr[0]) : console.log("This item already exists");
                 
                 mytimeval=gettimewithmap
                }
              } 


              let checkAdd = timeval(gettimewithmap)
            //   console.log('mytimeval',([...new Set (mytimeval)]))
              const finaltime=[...new Set (mytimeval)]

              console.log('finaltime', finaltime)
            


              
          
            if (findTime_Table.length > 0) {
                res.send({ status: false, message: "Time_Table Already Exits" });
                return false;
            } else {
                return res.send({ status: false, message: "success" });

            }
            const Time_TableModel = new Time_Table(tableData);
            await Time_TableModel.save();
            scheduler.scheduleAllJobs()
            return res.send({ status: true, message: 'created successfully' });

        } catch (error) {


            return res.send({ status: false, message: error.message });
        }
    },



}

