const db = require('../db/conn');
const { Order ,UserLogins , Pin , Store,Business , Notification } = db;
const Helper = require('../helper/helper');
const UserLoginInfoModel = require('../models/authentication/UserLoginInfotModel');
let mongoose = require('mongoose')





const Order_DELETE_PATH = "/public/Orders/"

async function deleteOrder(_id) {

  const OrderData = await Order.findById(_id);
  if (OrderData) {
    let values = OrderData.images[0].url;
    let filePath = Order_DELETE_PATH + values.split('/')[5];

    Helper.removeFile(filePath);
  }
}


module.exports = {


  getAllOrderList: async (req, res, next) => {
    try {
        let _id = req.body._id;
        const reqBody = req.body;
        let getUser = await UserLogins.findById(req.user._id)
        let getStore = await Store.findOne({user_id : getUser._id })

       

        let query = {} 
        if(getUser?.roles !== "ADMIN") {
          query = {store_id : mongoose.Types.ObjectId(getStore._id)}
        }
      

        const Limit = reqBody.limit ? parseInt(reqBody.limit) : 10;
        const PageNo = reqBody.page ? parseInt(reqBody.page) : 0;

        const datas = await Order.find(query).sort({ updated_at: -1 }).skip(Limit * PageNo).limit(Limit).lean().exec();
      
        const data = await Order.aggregate([
          {
              $match: query
          },
          {
              $lookup: {
                  from: 'users',
                  localField: 'user_id',
                  foreignField: "_id",
                  as: "customerInfo"
              }
          },
          {
              $lookup: {
                  from: 'storemodels',
                  localField: 'store_id',
                  foreignField: "_id",
                  as: "storeInfo"
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
        $lookup: {
            from: 'payments',
            localField: 'payment_id',
            foreignField: "_id",
            as: "paymentInfo"
        }
    },


  //   {
  //     $lookup: {
  //         from: 'storemodels',
  //         localField: 'store_id',
  //         foreignField: "_id",
  //         as: "storeInfo"
  //     }
  // },

  

          {
      
            
            $unwind: {
              path: '$customerInfo',
              preserveNullAndEmptyArrays: true
          },
        



   
          },
          {
      
            
           
          $unwind: {
            path: '$storeInfo',
            preserveNullAndEmptyArrays: true
        },
      



   
          },
          {
      
            
          
        $unwind: {
          path: '$pinInfo',
          preserveNullAndEmptyArrays: true
      },
    



   
          },
 
          {
      
            

            $unwind: {
              path: '$paymentInfo',
              preserveNullAndEmptyArrays: true
          },
      
      
      
         
                },
  
  
  
          { $sort: { updated_at: -1 } },
          {
            $skip: (Limit * PageNo)
        },
        {
            $limit: Limit
        }
  
  
  
      ]);
       
      return res.send({ status: true, data: data, count: data.length, message: 'Order get successfully' });


    } catch (error) {


        return res.send({ status: false, message: error.message });
    }
},


view: async (req, res, next) => {

  try {
    const { id } = req.body;
   
    if (!id) return res.send({ message: "Id is required", status: false });



   let query = {_id : mongoose.Types.ObjectId(id)}
   const data = await Order.aggregate([
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
      
  
 

    if (data.length === 0) {
      return res.send({ status: false, message: "Order data not found!" })
    }


    return res.send({ status: true, data: data[0] });
  } catch (error) {
    return res.send({ error: error.message, status: false });
  }

},

  addEditOrder: async (req, res, next) => {

try {

  const { visiting_days, title, cuisine, open_time, close_time, description, postal,state ,city ,status ,location ,latitude , longitude,_id ,address , Order_category } = req.body;

  let getUser = await UserLoginInfoModel.findById(req.user._id)
  if(!getUser){
  return res.send({ status: false, message: "User Not Found"});

  }

  let OrderData = {
      visiting_days: visiting_days.split(","),
      cuisine: cuisine.split(","),
      title: title,
      open_time:open_time,
      close_time: close_time,
      description :description,
      postal : postal,
      state: state,
      city:city,
      // status:status,
      location: {
          "type": "Point",
          "coordinates": [
            longitude , latitude
          ]
        },
      latitude:latitude,
      longitude:longitude,
      // user_id :req.user._id ,
      address : address,
      Order_category : Order_category


      

  }

  if(getUser.roles === "Order"){
    OrderData.user_id = req.user._id
  }




  if(_id){

    if(req.file !== undefined){
  const {originalname , filename} = req.file;

      deleteOrder(_id);
      let imageUrl = await Helper.urlForStaticImage(req);
      const image = {
        title : originalname ,
        url : `${imageUrl}Orders/${filename}`
      }
      OrderData['images'] = [image] 
  

    }
    let updated = await Order.updateOne({ _id: _id }, OrderData).lean().exec();

    let getPins =  await Pin.find({ Order_id: _id });
    let pinLocation =     {  location: {
      "type": "Point",
      "coordinates": [
        longitude , latitude
      ]
    },
  latitude:latitude,
  longitude:longitude
}
    if (getPins.length > 0) {
      let pinLocation =     {  location: {
        "type": "Point",
        "coordinates": [
          longitude , latitude
        ]
      },
    latitude:latitude,
    longitude:longitude
  }
      await Pin.updateOne({ Order_id: _id }, pinLocation).lean().exec();
    }






    //PIN LOCATION UPDATE
  return res.send({ status: true, message: 'updated successfully' });


  }else{
  const {originalname , filename} = req.file;
    
    let imageUrl = await Helper.urlForStaticImage(req);
    const image = {
      title : originalname ,
      url : `${imageUrl}Orders/${filename}`
    }
  

    OrderData['images'] = [image] 

 
  const resultData = new Order(OrderData);
  await resultData.save()



  // NOTIFY ADMIN
  let BusinessModel = {
    user_id :getUser._id,
    Order_id :resultData._id,
  }

  let NotificationModel = {
    for_notification : "ADMIN",
    message :`${getUser.email} is send a request for a business verification.`,
    notification_type : "business_verify",

  }
  console.log("🚀 ~ file: OrderController.js:152 ~ addEditOrder: ~ NotificationModel:", NotificationModel)

  let addNotification = await Notification.create(NotificationModel);
  
  let addBusiness = await Business.create(BusinessModel);

  return res.send({ status: true, message: 'created successfully' });
  }



} catch (error) {
  return res.send({ status: false, message: error.message });
}
  },
  addEditOrderAdmin: async (req, res, next) => {


    try {
      
    
      const { visiting_days, title, cuisine, open_time, close_time, description, postal,state ,city ,status ,location ,latitude , longitude,_id ,address , Order_category,user_id } = req.body;
    
      let getUser = await UserLoginInfoModel.findById(user_id)
      
      if(!getUser){
      return res.send({ status: false, message: "User Not Found"});
    
      }
    
      let OrderData = {
          visiting_days: visiting_days.split(","),
          cuisine: cuisine.split(","),
          title: title,
          open_time:open_time,
          close_time: close_time,
          description :description,
          postal : postal,
          state: state,
          city:city,
          status:status,
          location: {
              "type": "Point",
              "coordinates": [
                longitude , latitude
              ]
            },
          latitude:latitude,
          longitude:longitude,
          user_id :user_id ,
          address : address,
          Order_category : Order_category ,
          user_id  : user_id ,
          is_approve  : true
    
    
      }
    

    
    
    
      if(_id){
        
     
    
        if(req.file !== undefined){
      const {originalname , filename} = req.file;
    
          deleteOrder(_id);
          let imageUrl = await Helper.urlForStaticImage(req);
          const image = {
            title : originalname ,
            url : `${imageUrl}Orders/${filename}`
          }
          OrderData['images'] = [image] 
      
    
          
        }


       delete OrderData.user_id

        let updated = await Order.updateOne({ _id: _id }, OrderData).lean().exec();


    
        let getPins =  await Pin.find({ Order_id: _id });
        let pinLocation =     {  location: {
          "type": "Point",
          "coordinates": [
            longitude , latitude
          ]
        },
      latitude:latitude,
      longitude:longitude
    }
        if (getPins.length > 0) {
          let pinLocation =     {  location: {
            "type": "Point",
            "coordinates": [
              longitude , latitude
            ]
          },
        latitude:latitude,
        longitude:longitude
      }
          await Pin.updateOne({ Order_id: _id }, pinLocation).lean().exec();
        }
    
    
    
    
    
    
        //PIN LOCATION UPDATE
      return res.send({ status: true, message: 'Order updated successfully' });
    
    
      }else{
      const {originalname , filename} = req.file;
        
        let imageUrl = await Helper.urlForStaticImage(req);
        const image = {
          title : originalname ,
          url : `${imageUrl}Orders/${filename}`
        }
      
    
        OrderData['images'] = [image] 
        
      const resultData = new Order(OrderData);
      await resultData.save();


          // NOTIFY ADMIN
    let BusinessModel = {
      user_id :getUser._id,
      Order_id :resultData._id,
      is_approve  : true
    }
  let addBusiness = await Business.create(BusinessModel);
      return res.send({ status: true, message: 'Order created successfully' });
      }
    
    
    
    } catch (error) {
      return res.send({ status: false, message: error.message });
    }
      },


getAllApproveOrderList: async (req, res, next) => {
  try {
      let _id = req.body._id;
      const reqBody = req.body;
      let getUser = await UserLogins.findById(req.user._id)
      let query = {} 
      if(getUser?.roles !== "ADMIN") {
        query = {user_id : getUser._id}
      }


      const Limit = reqBody.limit ? parseInt(reqBody.limit) : 10;
      const PageNo = reqBody.page ? parseInt(reqBody.page) : 0;

      // const data = await Order.find(query).sort({ updated_at: -1 }).skip(Limit * PageNo).limit(Limit).lean().exec();
      const count = await Order.count(query);

     
      
      const data = await Business.aggregate([
        {
            $match: query
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
                from: 'Ordermodels',
                localField: 'Order_id',
                foreignField: "_id",
                as: "OrderInfo"
            }
        },

        {
            $unwind: {
                path: '$userInfo',
                preserveNullAndEmptyArrays: true
            },
    
        },
        {
  
          $unwind: {
              path: '$OrderInfo',
              preserveNullAndEmptyArrays: true
          }
      },


        {
          $project: {
              Order_id: 1,
              user_id: 1,
              is_approve: 1,
              created_at: 1,
              updated_at: 1,
              'title': "$OrderInfo.title",
              'images': "$OrderInfo.images",
              'address': "$OrderInfo.address",



              'email': "$userInfo.email",
              'mobile_number': "$userInfo.mobile_number",
              'userInfo': 1,
              'OrderInfo': 1,



          }
      },

        { $sort: { updated_at: -1 } },
        {
          $skip: (Limit * PageNo)
      },
      {
          $limit: Limit
      }



    ]);


      return res.send({ status: true, data: data, count: data.length, message: 'Order get successfully' });


  } catch (error) {


      return res.send({ status: false, message: error.message });
  }
},

  // getAllChurch: async (req, res, next) => {
  //   try {

  //     let [limit, pageNo] = await Helper.getDefaultLimitOrPage(req, Church);

  //     console.log("limit ::--", limit, pageNo)

  //     Church.hasMany(Member, {
  //       foreignKey: {
  //         name: 'church_id'
  //       }
  //     });
  //     const AllChurches = await Church.findAll({
  //       order: [
  //         ['createdAt', 'DESC'],
  //       ],
  //       limit: limit,
  //       offset: limit * pageNo,
  //       include: [
  //         {
  //           model: Member,
  //           attributes: ["id", "email"],
  //         },
  //       ]
  //     })

  //     AllChurches.map((item) => {
  //       item = item.dataValues;
  //       item["member_count"] = item.Members.length;
  //       delete item.Members
  //       return item;
  //     })


  //     const count = await Church.count();

  //     return res.send({ status: true, data: AllChurches, count: count, message: 'All Church get successfully', });

  //   } catch (error) {
  //     return res.send({ status: false, message: error.message });
  //   }
  // },






  deleteOrder: async (req, res, next) => {
    try {
      const { _id } = req.body;

      if (!_id) return res.send({ message: "_id is required", status: false });
      deleteOrder(_id);

      const data = await Order.deleteOne({
        
          _id: _id
        
      });

      if (!data) return res.send({ message: "Order not found is required", status: false });

      

      return res.send({ message: "Order Deleted successfully!", status: true });

    } catch (error) {
      return res.status(400).send({ error: error.message, status: false });
    }
  },
  OrderStatus: async (req, res, next) => {
    try {
        let {
            id
        } = req.body;

        Order.findById(id, async function (err, data) {
            data.status = !data.status;

           


           

            data.save(async (err, result) => {
                if (result) {
                    // let status = result.is_published ? 'Published' : 'UnPublished';
                    // let msg_body = 'Hi, <br />';
                    // msg_body += `Your account has been ${status} by your university<br />`;
                    // // await Helper.sendEmail(result.email, 'Vivaquad App', msg_body)
                    // let title = `Hi ${result.username}!`;
                    // let body = `Your account has been ${status} by your university`;
                    // let type = status
                    // await sendPushNotificationToSingleUser("207", title, body, result.firebase_token, type);
                    // let notificationData = {
                    //     user_id: result._id,
                    //     title: title,
                    //     message: body,
                    //     type: 'Verification',

                    // }

                    // const notificationModel = new Notification(notificationData);
                    // await notificationModel.save();





                    return res.send({
                        status: true,
                        message: "Order action changed successfully"
                    });
                } else {
                    return res.send({
                        status: false,
                        message: err
                    });
                }
            })
        });

    } catch (e) {
        console.log(e);
        return res.send({
            status: false,
            message: e.message
        });
    }
},

OrderStatusApprove: async (req, res, next) => {
  try {
      let {
          id
      } = req.body;



      Order.findById(id, async function (err, data) {


          // data.status = !data.status;
          data.is_approve = true;
          // console.log("data.status:", data.status)


         


         

          data.save(async (err, result) => {
              if (result) {
                  let status = result.is_approve ? 'Approved' : 'Not Approved';

                  
                  let msg_body = 'Hi, <br />';
                  msg_body += `Your Order has been ${status} by admin<br />`;

                  let getUser = await UserLogins.findById(result.user_id)
                  await Helper.sendEmail(getUser.email, 'Order Approval', msg_body);


    
  let NotificationModel = {
    for_notification : "Order",
    message :`Your Order Approved by Admin`,
    notification_type : "business_verify",
    user_id : result.user_id

  }

  let addNotification = await Notification.create(NotificationModel);
  let addBusiness = await Business.updateOne({Order_id : result._id} , {is_approve :true});





                  return res.send({
                      status: true,
                      message: "Business action changed successfully"
                  });
              } else {
                  return res.send({
                      status: false,
                      message: err
                  });
              }
          })
      });

  } catch (e) {
      console.log(e);
      return res.send({
          status: false,
          message: e.message
      });
  }
},
};
