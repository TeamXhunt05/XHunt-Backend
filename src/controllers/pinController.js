const db = require('../db/conn');
const { Pin  ,Product, Store , UserLogins} = db;
const Helper = require('../helper/helper');
const getPinHelper = require('../helper/getPinHelper');
let mongoose = require('mongoose')






module.exports = {

  addEditPin: async (req, res, next) => {




try {


  const {  title, description, type,is_published ,discount_unit ,min_transaction_value ,discount_amount ,max_discount_value ,categories  , _id,productPin} = req.body;
  const socket = req.socket;





  let getStore = await Store.findOne({user_id : req.user._id});

  if(!getStore){
  return res.send({ status: false, message: "Store Not Found" });

  }
  let pinData

  if(categories === 'LAST_MINUTE_PIN'){
    pinData = {
      title: title,
      description :description,
      discount_unit:discount_unit,
      min_transaction_value:min_transaction_value,
      discount_amount:discount_amount,
      max_discount_value:max_discount_value,
      categories:categories,
      location: {
        "type": "Point",
        "coordinates": [
          getStore.longitude , getStore.latitude
        ]
      },
    latitude: getStore.latitude,
    longitude: getStore.longitude,
    store_id : getStore._id

      
      

  }

  }else   if(categories === 'FLAT_DISCOUNT_PIN'){
    pinData = {
      title: title,
      description :description,
      categories:categories,
    discount_amount:discount_amount,

      location: {
        "type": "Point",
        "coordinates": [
          getStore.longitude , getStore.latitude
        ]
      },
    latitude: getStore.latitude,
    longitude: getStore.longitude,
    store_id : getStore._id

      
      

  }
  }else if(productPin){
    pinData = {
      title: title,
      location: {
        "type": "Point",
        "coordinates": [
          getStore.longitude , getStore.latitude
        ]
      },
    latitude: getStore.latitude,
    longitude: getStore.longitude,

    is_published :is_published,
      
      

  }

  }



 


  if(_id){


delete pinData.categories


    let updated = await Pin.updateOne({ _id: _id }, pinData).lean().exec();
                        const getAllPin = await getPinHelper()

    socket.emit('show_pins', { status: true, getAllPin: getAllPin })

  return res.send({ status: true, message: 'pin updated successfully' });


  }else{
 


  const resultData = new Pin(pinData);
  await resultData.save();

                      const getAllPin = await getPinHelper()

  socket.emit('show_pins', { status: true, getAllPin: getAllPin })

  return res.send({ status: true, message: 'created successfully' });
  }




} catch (error) {
  return res.send({ status: false, message: error.message });
}
  },
  addEditPinAdmin: async (req, res, next) => {




    try {
      const {  title, description, type,offer_type ,discount_unit ,min_transaction_value ,discount_amount ,max_discount_value ,categories  , _id , user_id ,is_published} = req.body;
      
      const socket = req.socket;
    
    
      let getStore = await Store.findOne({user_id : user_id});
    
      if(!getStore){
      return res.send({ status: false, message: "Please Add Store First" });
      }

      let pinData = {}
    
      if(categories === 'LAST_MINUTE_PIN'){
        pinData = {
          title: title,
          description :description,
          discount_unit:discount_unit,
          min_transaction_value:min_transaction_value,
          discount_amount:discount_amount,
          max_discount_value:max_discount_value,
          categories:categories,
          location: {
            "type": "Point",
            "coordinates": [
              getStore.longitude , getStore.latitude
            ]
          },
        latitude: getStore.latitude,
        longitude: getStore.longitude,
        store_id : getStore._id
    
          
      }
    
      }else   if(categories === 'FLAT_DISCOUNT_PIN'){
        pinData = {
        
          title: title,
          description :description,
          categories:categories,
          location: {
            "type": "Point",
            "coordinates": [
              getStore.longitude , getStore.latitude
            ]
          },
        latitude: getStore.latitude,
        longitude: getStore.longitude,
        store_id : getStore._id,
       discount_amount:discount_amount,
       is_published : is_published
 
    
          
          
    
      }
      }
    
    

    
      if(_id){
    
    
    delete pinData.categories





        let updated = await Pin.updateOne({ _id: _id }, pinData , {new : true})


                            const getAllPin = await getPinHelper()

      socket.emit('show_pins', { status: true, getAllPin: getAllPin })
      return res.send({ status: true, message: 'pin updated successfully' });
    
    
      }else{
     
    
    
      const resultData = new Pin(pinData);
    

      await resultData.save();

                          const getAllPin = await getPinHelper()

  socket.emit('show_pins', { status: true, getAllPin: getAllPin })
      return res.send({ status: true, message: 'pin created successfully' });
      }
    
    
    
    
    } catch (error) {
      return res.send({ status: false, message: error.message });
    }
      },

  getAllList: async (req, res, next) => {
    try {
        let _id = req.body._id;
        const reqBody = req.body;
        let getUser = await UserLogins.findById(req.user._id)
        let query = {} 
        if(getUser?.roles !== "ADMIN") {
         let getStore = await Store.findOne({user_id :  getUser._id});
          query = {store_id : mongoose.Types.ObjectId(getStore._id) , categories : "FLAT_DISCOUNT_PIN"}
        }



        const Limit = reqBody.limit ? parseInt(reqBody.limit) : 10;
        const PageNo = reqBody.page ? parseInt(reqBody.page) : 0;
        const data = await Pin.find(query).sort({ updated_at: -1 }).skip(Limit * PageNo).limit(Limit).lean().exec();
        const count = await Pin.count(query);



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
            from: 'users',
            localField: 'storenInfo.user_id',
            foreignField: '_id',
            as: 'storenInfo.user'
          }
        },
        { $unwind: '$storenInfo.user' },
        
          { $sort: { updated_at: -1 } },
          { $skip: Limit * PageNo },
          { $limit:Limit },


        
        
        ]);



        return res.send({ status: true, data: pin, count: pin.length, message: 'Time_Table Holl List get successfully' });


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




  // view: async (req, res, next) => {

  //   try {
  //     const { id } = req.body;
  //     if (!id) return res.send({ message: "Id is required", status: false });

  //     const fullUrl = await urlForStaticImage(req);

  //     let churchData = await Church.findOne({
  //       include: [
   
  //         {
  //           model: Zone,
  //           required: false
  //         },
  //         {
  //           model: Region,
  //           required: false
  //         },      {
  //           model: Province,
  //           required: false
  //         },

  //       ],
  //       where : { id : id}
  //     })

   

  //     if (!churchData) {
  //       return res.send({ status: false, message: "Church data not found!" })
  //     }

  //     let churchMembers = await Member.findAll({
  //       where: { church_id: id },
  //       attributes: ['id', 'first_name', 'email', 'avatar', 'mobile_no']
  //     })

  //     churchMembers.map((item) => {
  //       item["avatar"] = fullUrl + item.avatar;
  //     });


  //     const days = await convertNumberWeekDays(churchData.visiting_days);
  //     churchData["church_image"] = fullUrl + churchData.church_image;
  //     churchData["visiting_days"] = days;

  //     return res.send({ status: true, data: churchData, churchMembers });
  //   } catch (error) {
  //     return res.send({ error: error.message, status: false });
  //   }

  // },


  deletePin: async (req, res, next) => {
    try {
      const { _id } = req.body;
  const socket = req.socket;


      if (!_id) return res.send({ message: "_id is required", status: false });

      const data = await Pin.deleteOne({
        
          _id: _id
        
      });

      if (!data) return res.send({ message: "Pin not found is required", status: false });

      const getAllPin = await getPinHelper()
      socket.emit('show_pins', { status: true, getAllPin: getAllPin })

      return res.send({ message: "Pin Deleted successfully!", status: true });

    } catch (error) {
      return res.status(400).send({ error: error.message, status: false });
    }
  },
  pinPublished: async (req, res, next) => {
    try {
        let {
            id
        } = req.body;
  const socket = req.socket;


        Pin.findById(id, async function (err, data) {
            data.is_published = !data.is_published;

           


           

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



                      const getAllPin = await getPinHelper()

                    socket.emit('show_pins', { status: true, getAllPin: getAllPin })



                    return res.send({
                        status: true,
                        message: "Pin action changed successfully"
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

view: async (req, res, next) => {
  try {
      let _id = req.body.id;
      const pin = await Pin.aggregate([
        {
            $match: {_id : mongoose.Types.ObjectId(_id)}
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
          from: 'users',
          localField: 'storenInfo.user_id',
          foreignField: '_id',
          as: 'storenInfo.user'
        }
      },
      { $unwind: '$storenInfo.user' },
      
        { $sort: { updated_at: -1 } },
      
      
      ]);

     


let product = await Product.find({store_id : pin[0].store_id })

   


      return res.send({ status: true, detail: pin[0] ,product : product,  message: 'Pin Get Successfully' });


  } catch (error) {


      return res.send({ status: false, message: error.message });
  }
},
};
