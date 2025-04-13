const db = require('../db/conn');
const { Pin , StoreReview ,Cart} = db;
let mongoose = require('mongoose')


const getPins = async (type, _id ,user_id) => {
 
let query = {is_published : true}

if(type === 'detail'){
    query = {_id : _id ,is_published : true}
}
    const pin = await Pin.aggregate([
        {
            $match: query
        },


        {
            $lookup: {
                from: 'storemodels',
                localField: 'store_id',
                foreignField: "_id",
                as: "storenInfo"
            }
        },

        
      
        {
            $unwind: {
                path: '$storenInfo',
                preserveNullAndEmptyArrays: true
            },
        },

        { $lookup: {
            from: 'productmodels',
            localField: 'storenInfo._id',
            foreignField: 'store_id',
            // as: 'productList.user'
            as: 'productList'

          }
        },
      
        { $lookup: {
          from: 'users',
          localField: 'storenInfo.user_id',
          foreignField: '_id',
          as: 'storenInfo.user'
        }
      },
      { $unwind: '$storenInfo.user' },


   

      
        { $sort: { updated_at: -1 } },
      
      
      ]);
    

      let newPin = []

      if(pin.length > 0) {
       let newPinlist =  await Promise.all(pin.map(async(item) => {

            

            let findReview = await StoreReview.aggregate([
                {
                    $match: {store_id : item?.store_id}
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
                    $unwind: {
                        path: '$userInfo',
                        preserveNullAndEmptyArrays: true
                    },
                },
            ])     
            
            

              //Find Wave Review
        let avg_rating = 0.0
        if (findReview.length !== 0) {
            let toatlWaveRating = 0;
            findReview.map(async (review) => {
              return toatlWaveRating = toatlWaveRating + parseFloat(review.rating_number);
            })
            let num = (toatlWaveRating / findReview.length).toFixed(1);
            avg_rating = Number(num);
  
          } else {
            
          }



          if(item.productList.length > 0){



       let productListNew =  await Promise.all(item.productList.map(async(val) =>{

               
                if(type === 'detail'){
                    let getQty = await Cart.findOne({product_id :val._id ,user_id:user_id})
                   
                    val.cartQuantity = 0
                    val.cart_id = ''
                    if(getQty){
                        let qty = getQty.quantity != undefined ? getQty.quantity : 0       
                        val.cartQuantity = qty
                        val.cart_id = getQty._id
     
                    }
                   
                }

                return val
                

            }))


          let newProdulist =   item.productList.filter(val => val.is_published === true)
          item.productList = newProdulist
       

          }

         
            
         
          item.storenInfo.avg_rating = avg_rating
            item.storenInfo.store_review = findReview

            return item
     
        }))


        newPin =  newPinlist.filter((item) => {

            return item.storenInfo.is_approve == true && item.storenInfo.status == true
        })

      }

      return newPin
}


module.exports = getPins