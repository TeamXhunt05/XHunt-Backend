const jwt = require('jsonwebtoken');
const accessTokenSecret = require('../../config.json').jwd_secret;
const db = require('./../db/conn');
const { UserLogins } = db;



const Authenticate = (req, res, next) => {

    const authHeader = req.headers.authorization;
    
   


    
    if (authHeader) {
        // const token = authHeader.split(' ')[2]; 
        const token = authHeader.split(' ')[1]; 

       
      
       

        if (token) {
         
          
            jwt.verify(token, accessTokenSecret, async (err, user) => {
            
              
              
                if (err) {
                    return res.sendStatus(403);
                }




              
                if (!user || !user._id) {
                    return res.send({
                        status: false,
                        message: 'Not Authorized'
                    });
                }


                // if (user.roles != "ADMIN") {
                //     return res.send({
                //         status: false,
                //         message: 'Your Account has been deactivated.'
                //     });
                // }

                if(user._id){ 
    let getUser = await UserLogins.findById(user._id)
    if(getUser === null){
        return res.send({
            status: false,
            message: 'Your Account has been deleted by your admin.'
        });
    }
}
               

                req.user = user;
                next();
            });
        } else {
            return res.send({
                status: false,
                message: 'Not Authorized'
            });
        }
    } else {
        console.log('Not Authorized')
        res.sendStatus(401);
    }
};

module.exports = Authenticate;