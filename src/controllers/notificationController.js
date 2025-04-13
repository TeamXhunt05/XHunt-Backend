const db = require('../db/conn');
const {Notification,UserLogins,Meal_History} = db;






module.exports = { 




    getNotificationList: async(req, res, next) => {
        try{
        const { user_id } = req.body;

        if (!user_id) {
            res.send({ status: 400, message: "Required Parameter is missing" });
            return;
        }


        let conditions = { user_id: user_id } 
        let update = { $set: { status: 1 }}

    Notification.updateMany(conditions, update).then(async(updatedRows)=>{

       
    const NotificationList = await Notification.find(conditions).sort({ created_at: -1 })










res.send({ status: 200, notification : NotificationList,message: `Get NotificationList Successfully` })



  
}).catch(err=>{
    return res.send({ status: 400, message: err.message });

  
})


}catch(error){
    return res.send({status: 400, message: error.message})
}

    },



    
    deleteNotification: async (req, res, next) => {
    try {
        const { _id} = req.body;

      
        if (!_id) {
            return res.send({ status: 200, message: '_id is required' });
        }


        const deleted = await Notification.findOneAndRemove({ _id : _id}).lean().exec();

        if (!deleted) {
            return res.send({ status: 200, message: 'Notification not found' });
        }

        return res.send({ status: 200, message: 'Notification deleted successfully' });

    } catch (error) {
        return res.send({ status: 200, message: error.message });
    }
},

getMyUnreadNotification: async(req, res, next) => {
    try{
    const { user_id } = req.body;

    if (!user_id) { 
        res.send({ status: 400, message: "Required Parameter is missing" });
        return;
    }


    let conditions = { user_id: user_id ,  status: 0} 

    const NotificationList = await Notification.find(conditions).sort({ created_at: -1 })
    const NotificationCount = await Notification.find(conditions).countDocuments()

    res.send({ status: 200, NotificationCount: NotificationCount ,NotificationList : NotificationList,message: `Get Unread NotificationList Successfully` })


}catch(error){
res.send({status: 400, message: error.message})
return;
}

},

notificationChangeStatus: async (req, res, next) => {
    let {user_id  , status} = req.body
    let message = status ? 'Notification Activated Successfully' : 'Notification Deactivated Successfully'
   
    


    let isuser = await UserLogins.findById({
        _id : user_id
    });
    if(!isuser){
        return res.send({
            status: 400,
            message: "user not found"
        });
    }

        await UserLogins.findByIdAndUpdate(user_id, {
            isNotification: status
        }).lean().exec();
        
        return res.send({
            status: 200,
            message:message
        });

   
  




},





    
    
}

