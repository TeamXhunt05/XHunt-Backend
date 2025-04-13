const db = require('../db/conn');
const { Product , Store ,UserLogins , Pin } = db;
const Helper = require('../helper/helper');
const appRoot = require('app-root-path');




const Product_DELETE_PATH = "/public/products/"

async function deleteProduct(_id) {

  const ProductData = await Product.findById(_id);
  if (ProductData) {
    let values = ProductData.images[0].url;
    let filePath = Product_DELETE_PATH + values.split('/')[5];
    console.log("🚀 ~ file: productController.js:16 ~ deleteProduct ~ filePath:", filePath)

    Helper.removeFile(filePath);
  }
}


module.exports = {

  addEditProduct: async (req, res, next) => {




try {

  const { item_unit, title, price, discount_amount, number_of_pieces, description, is_published, _id ,pin_title , user_id} = req.body;
  let userId = ''

if(user_id){
  userId = user_id
}else{
  userId = req.user._id

}

  let getStore = await Store.findOne({user_id : userId});


if(!_id){
  if(!getStore){
    return res.send({ status: false, message: "Store Not Found" });
  
    }
  
}

  
  let ProductData = {
      item_unit: item_unit,
      price: price,
      title: title,
      discount_amount:discount_amount,
      number_of_pieces: number_of_pieces,
      description :description,
      is_published : is_published,
      // store_id :

    
  }


  if(_id){

    if(req.file !== undefined){
  const {originalname , filename} = req.file;

      deleteProduct(_id);
      let imageUrl = await Helper.urlForStaticImage(req);
      const image = {
        title : originalname ,
        url : `${imageUrl}products/${filename}`
      }
      ProductData['images'] = [image] 
     

    }
    let updated = await Product.updateOne({ _id: _id }, ProductData).lean().exec();
  return res.send({ status: true, message: 'updated successfully' });


  }else{
  const {originalname , filename} = req.file;
    
    let imageUrl = await Helper.urlForStaticImage(req);
    const image = {
      title : originalname ,
      url : `${imageUrl}products/${filename}`
    }
  

    ProductData['images'] = [image] 
    ProductData['store_id'] = getStore._id
  
    
  const resultData = new Product(ProductData);
  await resultData.save();

let getLastPin = await Pin.findOne({categories: "LAST_MINUTE_PIN" ,store_id : getStore._id})


  if(pin_title){

    if(getLastPin){
      let updatePin = await Pin.updateOne({_id : getLastPin._id} , {title : pin_title })
      console.log("🚀 ~ file: productController.js:97 ~ addEditProduct: ~ updatePin:", updatePin)
    }else{
      let pinModal = {
        title: pin_title,
        description :'',
        categories: "LAST_MINUTE_PIN",
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

      let createPin = await Pin.create(pinModal)
      console.log("🚀 ~ file: productController.js:111 ~ addEditProduct: ~ createPin:", createPin)
    }




  }



  return res.send({ status: true, message: 'product added successfully' });
  }



} catch (error) {
  return res.send({ status: false, message: error.message });
}
  },
  addEditAdminProduct: async (req, res, next) => {




    try {

    
      const { item_unit, title, price, discount_amount, number_of_pieces, description, is_published, _id ,pin_title ,user_id} = req.body;
      let getStore = await Store.findOne({user_id : user_id});
    
      if(!getStore){
      return res.send({ status: false, message: "Store Not Found" });
    
      }
    
      let ProductData = {
          item_unit: item_unit,
          price: price,
          title: title,
          discount_amount:discount_amount,
          number_of_pieces: number_of_pieces,
          description :description,
          is_published : is_published,
          store_id : getStore._id
    
        
      }
    
    
      if(_id){
    
        if(req.file !== undefined){
      const {originalname , filename} = req.file;
    
          deleteProduct(_id);
          let imageUrl = await Helper.urlForStaticImage(req);
          const image = {
            title : originalname ,
            url : `${imageUrl}products/${filename}`
          }
          ProductData['images'] = [image] 
         
    
        }
        let updated = await Product.updateOne({ _id: _id }, ProductData).lean().exec();
      return res.send({ status: true, message: 'updated successfully' });
    
    
      }else{
      const {originalname , filename} = req.file;
        
        let imageUrl = await Helper.urlForStaticImage(req);
        const image = {
          title : originalname ,
          url : `${imageUrl}products/${filename}`
        }
      
    
        ProductData['images'] = [image] 
      
        
      const resultData = new Product(ProductData);
      await resultData.save();
    
    let getLastPin = await Pin.findOne({categories: "LAST_MINUTE_PIN" ,store_id : getStore._id})
    
    
      if(pin_title){
    
        if(getLastPin){
          let updatePin = await Pin.updateOne({_id : getLastPin._id} , {title : pin_title })
          console.log("🚀 ~ file: productController.js:97 ~ addEditProduct: ~ updatePin:", updatePin)
        }else{
          let pinModal = {
            title: pin_title,
            description :'',
            categories: "LAST_MINUTE_PIN",
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
    
          let createPin = await Pin.create(pinModal)
          console.log("🚀 ~ file: productController.js:111 ~ addEditProduct: ~ createPin:", createPin)
        }
    
    
    
    
      }
    
    
    
      return res.send({ status: true, message: 'product added successfully' });
      }
    
    
    
    } catch (error) {
      return res.send({ status: false, message: error.message });
    }
      },

  getAllProductList: async (req, res, next) => {
    try {
        let _id = req.body._id;
        const reqBody = req.body;
        const reqUser = req.user;


        let user_id = ''
       

        if(reqUser.role === 'ADMIN'){
          user_id  = req.body.user_id;
            
        }else {
          user_id = req.user._id;
        }



  
     

        let getUser = await UserLogins.findById(user_id)

        let query = {} 
        let pin_detail = {}
        if(getUser?.roles !== "ADMIN") {
         let getStore = await Store.findOne({user_id :  getUser._id});
          query = {store_id : getStore._id}
           pin_detail = await Pin.findOne({ store_id :  getStore._id , categories: "LAST_MINUTE_PIN",})
        }




        const Limit = reqBody.limit ? parseInt(reqBody.limit) : 10;
        const PageNo = reqBody.page ? parseInt(reqBody.page) : 0;
        const data = await Product.find(query).sort({ updated_at: -1 }).skip(Limit * PageNo).limit(Limit).lean().exec();
        const count = await Product.count(query);
    


        return res.send({ status: true, data: data, count: count,pin_detail : pin_detail, message: 'Product List get successfully' });


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


  deleteProduct: async (req, res, next) => {
    try {
      const { _id } = req.body;

      if (!_id) return res.send({ message: "_id is required", status: false });
      deleteProduct(_id);

      const data = await Product.deleteOne({
        
          _id: _id
        
      });

      if (!data) return res.send({ message: "Product not found is required", status: false });

      

      return res.send({ message: "Product Deleted successfully!", status: true });

    } catch (error) {
      return res.status(400).send({ error: error.message, status: false });
    }
  },
  prductPublished: async (req, res, next) => {
    try {
        let {
            id
        } = req.body;

        Product.findById(id, async function (err, data) {
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





                    return res.send({
                        status: true,
                        message: "Product action changed successfully"
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
