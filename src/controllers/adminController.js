const db = require('../db/conn');
const { UserLogins, Store , Pin , Product , Business} = db;





module.exports = {
    //Users//
    dashBoard: async (req, res, next) => {
        try {


            const reqBody = req.body;
            let user_id = reqBody.user_id

            let get_UserInfo = await UserLogins.findOne({ _id: user_id }).lean().exec();
            const Pending_Approval = await Business.aggregate([
                {
                    $match: {is_approve: false }
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
                    },
          
                },
               


            ]);

            

            let Total_Pins = []
            let Total_Products = []
            let Total_Store = []
            let isStore = false
            let isStoreVerifed = false




if(get_UserInfo.roles === "ADMIN"){
     Total_Pins = await Pin.find()
     Total_Products = await Product.find();
     Total_Store = await Store.find();
     isStore  = true
     isStoreVerifed  = true

}else{
    Total_Store = await Store.find({user_id :user_id });
    Get_Total_Store = await Store.find({user_id :user_id })
   
    if(Get_Total_Store.length > 0){
       
        Total_Pins = await Pin.find({store_id : Get_Total_Store[0]._id});
        Total_Products = await Product.find({store_id : Get_Total_Store[0]._id});
        isStore  = true

        let getBusiness = await Business.findOne({store_id:Get_Total_Store[0]._id ,user_id :user_id })
        console.log("🚀 ~ file: adminController.js:47 ~ dashBoard: ~ getBusiness:", getBusiness.is_approve)
        if(getBusiness.is_approve){

           
     isStoreVerifed  = true


        }
 
    }
    
}


            const Total_Users = await UserLogins.find({ roles: { $ne: 'ADMIN' } }).count();






            const DBdata = {
                GetTotalUsers: Total_Users,
                get_UserInfo: get_UserInfo,
                Total_Store: Total_Store.length,
                Total_Pins:Total_Pins.length,
                Total_Products:Total_Products.length,
                isStore : isStore ,
                isStoreVerifed : isStoreVerifed ,
                Store_List: Total_Store,
                Pins_List :Total_Pins,
                Products_List :Total_Products,

                Pending_Approval: Pending_Approval,




            };


            return res.send({
                status: true,
                countData: DBdata,

            });
        } catch (e) {
            res.send({ status: false, message: e.message })
        }
    },


}