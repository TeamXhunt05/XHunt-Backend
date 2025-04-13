const db = require('../db/conn');
const { Store ,UserLogins , Pin , Business , Notification  ,StoreReview  ,MostLovedPin ,UserWallet ,Cart} = db;
const Helper = require('../helper/helper');
const UserLoginInfoModel = require('../models/authentication/UserLoginInfotModel');






const STORE_DELETE_PATH = "/public/stores/"

async function deleteStore(_id) {

  const storeData = await Store.findById(_id);
  if (storeData) {
    let values = storeData.images[0].url;
    let filePath = STORE_DELETE_PATH + values.split('/')[5];

    Helper.removeFile(filePath);
  }
}


module.exports = {

  addEditStore: async (req, res, next) => {

try {

  const { visiting_days, title, cuisine, open_time, close_time, description, postal,state ,city ,status ,location ,latitude , longitude,_id ,address , store_category } = req.body;

  let getUser = await UserLoginInfoModel.findById(req.user._id)
  if(!getUser){
  return res.send({ status: false, message: "User Not Found"});

  }

  let storeData = {
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
      store_category : store_category


      

  }

  if(getUser.roles === "STORE"){
    storeData.user_id = req.user._id
  }




  if(_id){

    if(req.file !== undefined){
  const {originalname , filename} = req.file;

      deleteStore(_id);
      let imageUrl = await Helper.urlForStaticImage(req);
      const image = {
        title : originalname ,
        url : `${imageUrl}stores/${filename}`
      }
      storeData['images'] = [image] 
  

    }
    let updated = await Store.updateOne({ _id: _id }, storeData).lean().exec();

    let getPins =  await Pin.find({ store_id: _id });
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
      await Pin.updateOne({ store_id: _id }, pinLocation).lean().exec();
    }






    //PIN LOCATION UPDATE
  return res.send({ status: true, message: 'updated successfully' });


  }else{
  const {originalname , filename} = req.file;
    
    let imageUrl = await Helper.urlForStaticImage(req);
    const image = {
      title : originalname ,
      url : `${imageUrl}stores/${filename}`
    }
  

    storeData['images'] = [image] 

 
  const resultData = new Store(storeData);
  await resultData.save()



  // NOTIFY ADMIN
  let BusinessModel = {
    user_id :getUser._id,
    store_id :resultData._id,
  }

  let NotificationModel = {
    for_notification : "ADMIN",
    message :`${getUser.email} is send a request for a business verification.`,
    notification_type : "business_verify",

  }
  console.log("🚀 ~ file: storeController.js:152 ~ addEditStore: ~ NotificationModel:", NotificationModel)

  let addNotification = await Notification.create(NotificationModel);
  
  let addBusiness = await Business.create(BusinessModel);

  return res.send({ status: true, message: 'created successfully' });
  }



} catch (error) {
  return res.send({ status: false, message: error.message });
}
  },
  addEditStoreAdmin: async (req, res, next) => {


    try {
      
    
      const { visiting_days, title, cuisine, open_time, close_time, description, postal,state ,city ,status ,location ,latitude , longitude,_id ,address , store_category,user_id } = req.body;
    
      let getUser = await UserLoginInfoModel.findById(user_id)
      
      if(!getUser){
      return res.send({ status: false, message: "User Not Found"});
    
      }
    
      let storeData = {
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
          store_category : store_category ,
          user_id  : user_id ,
          is_approve  : true
    
    
      }
    

    
    
    
      if(_id){
        
     
    
        if(req.file !== undefined){
      const {originalname , filename} = req.file;
    
          deleteStore(_id);
          let imageUrl = await Helper.urlForStaticImage(req);
          const image = {
            title : originalname ,
            url : `${imageUrl}stores/${filename}`
          }
          storeData['images'] = [image] 
      
    
          
        }


       delete storeData.user_id

        let updated = await Store.updateOne({ _id: _id }, storeData).lean().exec();


    
        let getPins =  await Pin.find({ store_id: _id });
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
          await Pin.updateOne({ store_id: _id }, pinLocation).lean().exec();
        }
    
    
    
    
    
    
        //PIN LOCATION UPDATE
      return res.send({ status: true, message: 'store updated successfully' });
    
    
      }else{
      const {originalname , filename} = req.file;
        
        let imageUrl = await Helper.urlForStaticImage(req);
        const image = {
          title : originalname ,
          url : `${imageUrl}stores/${filename}`
        }
      
    
        storeData['images'] = [image] 
        
      const resultData = new Store(storeData);
      await resultData.save();


          // NOTIFY ADMIN
    let BusinessModel = {
      user_id :getUser._id,
      store_id :resultData._id,
      is_approve  : true
    }
  let addBusiness = await Business.create(BusinessModel);
      return res.send({ status: true, message: 'store created successfully' });
      }
    
    
    
    } catch (error) {
      return res.send({ status: false, message: error.message });
    }
      },

  getAllStoreList: async (req, res, next) => {
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

        const data = await Store.find(query).sort({ updated_at: -1 }).skip(Limit * PageNo).limit(Limit).lean().exec();
        const count = await Store.count(query);


        return res.send({ status: true, data: data, count: count, message: 'Store get successfully' });


    } catch (error) {


        return res.send({ status: false, message: error.message });
    }
},
getAllApproveStoreList: async (req, res, next) => {
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

      // const data = await Store.find(query).sort({ updated_at: -1 }).skip(Limit * PageNo).limit(Limit).lean().exec();
      const count = await Store.count(query);

     
      
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
                from: 'storemodels',
                localField: 'store_id',
                foreignField: "_id",
                as: "storeInfo"
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
              path: '$storeInfo',
              preserveNullAndEmptyArrays: true
          }
      },


        {
          $project: {
              store_id: 1,
              user_id: 1,
              is_approve: 1,
              created_at: 1,
              updated_at: 1,
              'title': "$storeInfo.title",
              'images': "$storeInfo.images",
              'address': "$storeInfo.address",



              'email': "$userInfo.email",
              'mobile_number': "$userInfo.mobile_number",
              'userInfo': 1,
              'storeInfo': 1,



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


      return res.send({ status: true, data: data, count: data.length, message: 'Store get successfully' });


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




  view: async (req, res, next) => {

    try {
      const { id } = req.body;
      console.log("🚀 ~ file: storeController.js:353 ~ view: ~ id:", id)

     
      if (!id) return res.send({ message: "Id is required", status: false });


      let storeData = await Store.findById(id).populate('user_id' , 'email mobile_number')

   

      if (!storeData) {
        return res.send({ status: false, message: "Store data not found!" })
      }


      return res.send({ status: true, data: storeData });
    } catch (error) {
      return res.send({ error: error.message, status: false });
    }

  },


  deleteStore: async (req, res, next) => {
    try {
      const { _id } = req.body;
      if (!_id) return res.send({ message: "_id is required", status: false });






      const data = await Store.deleteOne({  _id: _id});

      if (!data) return res.send({ message: "Store not found is required", status: false });
      let getPins =  await Pin.find({ store_id: _id });

      await Pin.deleteMany({  store_id: _id});
      await StoreReview.deleteMany({  store_id: _id});
      await Business.deleteMany({  store_id: _id});
      await MostLovedPin.deleteMany({  pin_id: getPins._id});
      await UserWallet.deleteMany({  pin_id: getPins._id});
      await Cart.deleteMany({  pin_id: getPins._id});









      

      return res.send({ message: "Store Deleted successfully!", status: true });

    } catch (error) {
      return res.status(400).send({ error: error.message, status: false });
    }
  },
  storeStatus: async (req, res, next) => {
    try {
        let {
            id
        } = req.body;

        Store.findById(id, async function (err, data) {
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
                        message: "Store action changed successfully"
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

storeStatusApprove: async (req, res, next) => {
  try {
      let {
          id
      } = req.body;



      Store.findById(id, async function (err, data) {


          // data.status = !data.status;
          data.is_approve = true;
          // console.log("data.status:", data.status)


         


         

          data.save(async (err, result) => {
              if (result) {
                  let status = result.is_approve ? 'Approved' : 'Not Approved';

                  
                  let msg_body = 'Hi, <br />';
                  msg_body += `Your store has been ${status} by admin<br />`;

                  let getUser = await UserLogins.findById(result.user_id)
                  await Helper.sendEmail(getUser.email, 'Store Approval', msg_body);


    
  let NotificationModel = {
    for_notification : "STORE",
    message :`Your Store Approved by Admin`,
    notification_type : "business_verify",
    user_id : result.user_id

  }

  let addNotification = await Notification.create(NotificationModel);
  let addBusiness = await Business.updateOne({store_id : result._id} , {is_approve :true});





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
