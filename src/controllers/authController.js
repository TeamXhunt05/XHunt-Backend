const db = require('../db/conn');
const UserLogins = db.UserLogins;
const School = db.School;
const Role = db.Role;
const Meal_History = db.Meal_History;
const Notification = db.Notification;
const StripePayment = db.StripePayment;
const Lunch = db.Lunch;
const Time_Table = db.Time_Table;
const Stream = db.Stream;
const Plan = db.Plan;




const otp = db.Otp;
const generateOTP = require('../helper/otp_generate');
const accessTokenSecret = require('../../config.json').jwd_secret;
var ROLES = require('../../config.json').ROLES;
const jwt = require('jsonwebtoken');
let mongoose = require('mongoose')
let bcrypt = require('bcrypt');
const Helper = require('../helper/helper');
const imagePath = require('../helper/imagePath');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const {
    sendNotificationAnnouncement,
    sendSingleNotification,
    sendPushNotificationSwipe
} = require('../helper/firebase/firebase');
const moment = require('moment');
const uuid = require("uuid").v4
//USE FOR ENV
require('dotenv').config()
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const stripe = require('stripe')(STRIPE_SECRET_KEY)


let saltRounds = 10;
let block_user_messsage = `Your Account has been deactivated.`;


module.exports = {

    apis: async (req, res, next) => {
        try {





            return res.render('pages/apis')




        } catch (error) {
            console.log('catch error', error)
            return res.status(400).send({ status: false, message: error.message });
        }
    },

    //Users//
    signup: async (req, res, next) => {
        try {
            const {

                email,
                password,
                roleType,
                name,
                dob,
                mobile_number,
                firebase_token,
                school_id
            } = req.body;





            if (!email)
                return res.send({
                    status: 400,
                    message: "Email is required"
                });

            if (!password)
                return res.send({
                    status: 400,
                    message: "Password is required"
                });
            const hash = bcrypt.hashSync(password, saltRounds);

            const data = {
                email: email,
                dob: dob,
                username: name,
                mobile_number: mobile_number,
                password: hash,
                roles: roleType,
                isEmailVerified: true,
                firebase_token: firebase_token,
                school_id: school_id
            };


            //Multer
            //         let filename;
            //         let id_card_front;
            //         let id_card_back;


            //         if(req.files.length > 0) {

            //             req.files.forEach(E => {
            //                 var filePath = path.join(__dirname, '../../public/users/');
            //                 if (!fs.existsSync(filePath)) {
            //                 fs.mkdirSync(filePath);
            //             }

            //             const fileUrl = filePath + E.filename;
            //             sharp(E.path).toFile(fileUrl, function (err) {
            //                 if (err) {
            //                     // console.log(err)
            //                 }
            //             });      
            //             let imageUrl 

            //             if(req.hostname == 'Huntbackend.plenumnetworks.com'){
            //                 imageUrl = `${req.protocol}://${req.hostname}`
            //             }else{
            //                 imageUrl = `${req.protocol}://${req.hostname}:4000`

            //             }
            // if(E.fieldname === 'id_card_front'){ 
            //     id_card_front = `${imageUrl}/users/${E.filename}`;

            // }else
            //  if(E.fieldname === 'id_card_back'){
            //     id_card_back = `${imageUrl}/users/${E.filename}`;
            // }else 
            // if(E.fieldname === 'avatar'){
            //     filename = `${imageUrl}/users/${E.filename}`;
            // }



            //             });
            //         }


            //         data.avatar = filename
            //         data.id_card = [{id_card_front : id_card_front} ,{id_card_back : id_card_back}]




            // Multer S3 Bucket  
            let filename;
            let id_card_front;
            let id_card_back;
            if (req.files && req.files[0] && req.files[0].location) {

                req.files.map((E) => {


                    if (E.fieldname === 'id_card_front') {
                        id_card_front = E.location;

                    } else
                        if (E.fieldname === 'id_card_back') {
                            id_card_back = E.location;
                        } else
                            if (E.fieldname === 'avatar') {
                                filename = E.location;
                            }

                })



            }

            data.avatar = filename
            data.id_card = [{ id_card_front: id_card_front }, { id_card_back: id_card_back }]

            console.log(data)


            const isUser = await UserLogins
                .findOne({
                    $or: [{
                        email: email
                    }]
                })
                .lean().exec();

            const isUserMobile = await UserLogins
                .findOne({
                    $or: [{
                        mobile_number: mobile_number
                    }]
                })
                .lean().exec();

            if (isUser) {
                let msg = 'This';
                if (isUser.email === email) {
                    msg += ' Email';
                }
                msg += ' is already registered';

                return res.send({
                    status: 400,
                    message: msg
                });
            }

            if (isUserMobile) {
                let msg = 'This';
                if (isUserMobile.mobile_number === mobile_number) {
                    msg += ' Mobile No.';
                }
                msg += ' is already registered';

                return res.send({
                    status: 400,
                    message: msg
                });
            }





            let userLoginCreate = await (new UserLogins(data)).save();
            const getSchool = await School.findById(school_id);

            let isUser1 = await UserLogins.findOne({
                $or: [{
                    email: userLoginCreate.email
                }]
            }).lean().exec();

            isUser1 = {
                username: isUser1.email,
                _id: isUser1._id,
                time: new Date().getTime(),
                role: isUser1.roles
            };

            let userInfo = await UserLogins.findOne({
                $or: [{
                    email: userLoginCreate.email
                }]
            }).lean().exec();
            userInfo.schoolInfo = getSchool

            const accessToken = jwt.sign(isUser1, accessTokenSecret);
            let msg_body = 'Hi, <br />';
            msg_body += 'Your account has been added on Hunt App <br />';
            msg_body += 'Please find below your login credentials:<br />';
            msg_body += 'Email: ' + email + '<br />';
            msg_body += 'Password: ' + password + '<br />';
            msg_body += '<br />Thanks,<br />Hunt Team';
            await Helper.sendEmail(email, 'Hunt App', msg_body);


            console.log(userInfo)
            console.log(userInfo.roles)


            return res.send({
                status: 200,
                user: userInfo,
                accessToken: accessToken,
                message: `${roleType} Sign Up Successfully`
            });


        } catch (error) {
            if (error.errmsg && error.errmsg.indexOf('E11000') > -1) {
                return res.send({
                    status: 403,
                    message: "User Already Exist, Please try with other username or email"
                })
            }

            return res.send({
                status: 400,
                message: error.message
            })
        }
    },


    sendOtp: async (req, res, next) => {

        console.log("sendOtp", req.body)
        try {

            const {
                email,
                type
            } = req.body;
            if (!email)
                return res.send({
                    status: 400,
                    message: "Email is required"
                });
            const userOtp = generateOTP();
            let msg_body = 'Hi, <br />';
            msg_body += ' your OTP(One Time Password) is ' + userOtp;
            msg_body += '<br />Thanks,<br />';
            console.log('userOtp', userOtp)
            const isUser = await UserLogins.findOne({
                $or: [{
                    email: email
                }]
            }).lean().exec();
            if (!isUser && type === 'register') {


                await Helper.sendEmail(email, 'New Signup', msg_body);
                return res.send({
                    status: 200,
                    Otp: userOtp
                });
            } else if (isUser && type === 'register') {

                return res.send({
                    status: 400,
                    message: "user already registered on this email!"
                });
            }
            if (isUser && type === 'forgot') {


                await Helper.sendEmail(email, 'Forgot Password', msg_body);
                return res.send({
                    status: 200,
                    Otp: userOtp
                });

            } else {
                console.log(true)
                return res.send({
                    status: 400,
                    message: "user not registered on this email!"
                });
            }


        } catch (error) {

            return res.send({
                status: 400,
                err: error.message
            })
        }

    },






    loginUser: async (req, res, next) => {
        const {
            email,
            password,
            firebase_token
        } = req.body;
        let userData = {}



        UserLogins.findOne({
            $or: [{
                email: email,
            }]
        }).then(async (data) => {
            if (data && data._id) {
                // let userDetails= await UserLogins.findOne( {_id : data._id , user_status : true ,isAccountVerified : true}).lean().exec();
                let userDetails = await UserLogins.findOne({
                    $or: [{
                        _id: data._id, user_status: true, isAccountVerified: true
                    }, {
                        _id: data._id, user_status: false, isAccountVerified: true
                    }]
                }).lean().exec();


                if (!userDetails) {
                    return res.send({
                        status: 400,
                        message: "your account is deactivated"
                    });
                }

                const getSchool = await School.findById(userDetails.school_id);
                const getRole = await Role.findOne({ _id: userDetails.employee_type });
                let getStream = await Stream.findOne({
                    _id: userDetails.stream_id
                });

                userDetails.schoolInfo = getSchool





                if (getRole && getRole.roles === 'Lunch Worker') {
                    userDetails.isLunchWorker = true
                } else {
                    userDetails.isLunchWorker = false
                }



                userData = userDetails
                userData.stream_name = getStream?.name

                let user = {
                    mobile_number: data.mobile_number,
                    avatar: data.avatar,
                    email: data.email,
                    username: data.username,
                    _id: data._id,
                    time: new Date().getTime(),
                    role: data.roles,
                    dob: data.dob,
                    firebase_token: data.firebase_token,
                    school_id: data.school_id,
                    employee_type: data.employee_type,
                };





                const accessToken = jwt.sign(user, accessTokenSecret);
                let compare = bcrypt.compareSync(password, data.password);
                if (!compare) {
                    if (data.password === password) {
                        UserLogins.updateOne({
                            _id: data._id
                        }, {
                            $set: {
                                last_login_time: new Date(),
                                firebase_token: firebase_token
                            }
                        }).then({});



                        res.json({
                            status: 200,
                            accessToken,
                            user: userData,

                        });
                        return;
                    }

                    res.send({
                        status: 400,
                        message: "Invalid password!"
                    });
                } else {
                    UserLogins.updateOne({
                        _id: data._id
                    }, {
                        $set: {
                            last_login_time: new Date(),
                            firebase_token: firebase_token

                        }
                    }).then({})

                    return res.json({
                        status: 200,
                        accessToken,
                        user: userData,
                    });

                }

            } else {
                res.send({
                    status: 400,
                    message: "User not registered on this email"
                });
            }
        })

    },

    userActive: async (req, res, next) => {
        let _id = req.body._id


        let isuser = await UserLogins.findById({
            _id
        });
        if (isuser) {
            if (isuser.user_status === "active") {
                res.send({
                    status: 200,
                    user_status: isuser.user_status

                });
            } else {
                res.send({
                    status: 400,
                });
            }
        } else {
            res.send({
                status: 400,
            });
        }



    },


    sendOtpToUser: async (req, res, next) => {
        try {
            const reqBody = req.body;
            const Email = reqBody.email;
            const Username = reqBody.username;
            const mobileNumber = reqBody.mobile_number;

            if (!Email && !Username && !mobileNumber) {
                return res.send({
                    status: 400,
                    message: "Required parameter missing, Please provide email username or mobile number"
                });
            }

            const userOtp = generateOTP();

            if (Email || Username) {
                const isUser = await UserLogins.findOne({
                    $or: [{
                        email: Email
                    }, {
                        username: Username
                    }]
                });
                if (!isUser) {
                    return res.send({
                        status: 400,
                        message: "User not found"
                    });
                }

                if (isUser && isUser.deactive) {
                    return res.send({
                        status: 400,
                        message: block_user_messsage
                    });
                }


                let msg_body = `Hi, ${isUser.username} <br />`;
                msg_body += 'Your One Time Password is ' + userOtp;
                msg_body += '<br />Thanks,<br />Gali Nukkad Team';

                await UserLogins.findByIdAndUpdate(isUser._id, {
                    otp: userOtp
                }).lean().exec();
                Helper.sendEmail(isUser.email, "OTP Verification", msg_body);

                return res.send({
                    status: 200,
                    message: "OTP send to your email"
                });
            } else if (mobileNumber) {
                const isUser = await UserLogins.findOne({
                    mobile_number: mobileNumber
                });

                if (isUser && isUser.deactive) {
                    return res.send({
                        status: 400,
                        message: block_user_messsage
                    });
                }

                if (!isUser) {
                    return res.send({
                        status: 400,
                        message: "User not found"
                    });
                }

                await sendSms(mobileNumber, `${userOtp} is your OTP for Login Transaction on Galinukkad and valid till 10 minutes. Do not share this OTP to anyone for security reasons.`);

                await UserLogins.findByIdAndUpdate(isUser._id, {
                    mobile_otp: userOtp
                }).lean().exec();
                return res.send({
                    status: 200,
                    message: "OTP send to your Phone No."
                });
            } else {
                return res.send({
                    status: 400,
                    message: "Something went wrong"
                });
            }

        } catch (error) {
            return res.send({
                status: 400,
                err: e.message
            });
        }
    },

    sendOtpCustomer: async (req, res, next) => {

        console.log(req.body);
        try {

            let {
                phone,
                email
            } = req.body;

            let mobileVerified = await UserLogins.findOne({
                mobile_number: phone,
                isMobileVerified: true
            });

            if (mobileVerified) {
                return res.send({
                    status: 400,
                    message: "Mobile number already registered."
                });
            }

            let user = await UserLogins.find({
                email: email
            });
            if (user) {
                const generated_otp = generateOTP();
                await sendSms(phone, generated_otp + ' is your OTP for Login Transaction on Galinukkad and valid till 10 minutes. Do not share this OTP to anyone for security reasons.');

                let set_update = {
                    mobile_otp: generated_otp,
                    mobile_number: phone,
                }

                let user_login_id = await UserLogins.updateOne({
                    email: email
                }, {
                    $set: set_update
                }).then({});

                return res.send({
                    status: 200,
                    message: "OTP has been send successfully."
                });
            }
        } catch (e) {
            console.log(e);
            return res.send({
                status: 400,
                message: e.message
            });
        }
    },


    verifyOTPCustomer: async (req, res, next) => {


        try {

            let {
                phone,
                email,
                mobile_otp
            } = req.body;
            console.log(req.body);

            let user_find = await UserLogins.find({
                email: email,
                mobile_otp: mobile_otp
            });

            if (user_find != undefined && user_find != "" && user_find != null) {
                await UserLogins.updateOne({
                    email: email,
                    mobile_number: phone,
                    mobile_otp: mobile_otp
                }, {
                    $set: {
                        isMobileVerified: true
                    }
                }).then({});
                return res.send({
                    status: 200,
                    message: "Mobile number verified successfully"
                });
            } else {
                return res.send({
                    status: 400,
                    message: "Please enter valid otp"
                });
            }
        } catch (e) {
            console.log(e);
            return res.send({
                status: 400,
                message: e.message
            });
        }
    },


    userActiveDeactiveStatus: async (req, res, next) => {
        try {
            let {
                id
            } = req.body;

            UserLogins.findById(id, function (err, data) {
                data.user_status = !data.user_status;
                data.save((err, result) => {
                    if (result) {
                        return res.send({
                            status: 200,
                            message: "User action changed successfully"
                        });
                    } else {
                        return res.send({
                            status: 400,
                            message: err
                        });
                    }
                })
            });

        } catch (e) {
            console.log(e);
            return res.send({
                status: 400,
                message: e.message
            });
        }
    },


    recoverPasswordUser: async (req, res, next) => {
        try {
            const {
                email,
                password,
            } = req.body;
            if (!email || !password) {
                return res.status(500).send({
                    status: 400,
                    message: "please provide required params"
                })
            }

            const isUser = await UserLogins.findOne({
                email: email
            });


            if (!isUser) {
                return res.send({
                    status: 400,
                    message: "User not found"
                });
            }

            const hashPassword = bcrypt.hashSync(password, saltRounds);

            await UserLogins.findByIdAndUpdate(isUser._id, {
                password: hashPassword
            });


            return res.send({
                status: 200,
                message: 'Password updated successfully Please Login !'
            });

        } catch (error) {
            return res.send({
                status: 400,
                message: error.message
            });
        }

    },
    getalluser: async (req, res, next) => {

        try {
            const reqBody = req.body;
            const Limit = reqBody.limit ? parseInt(reqBody.limit) : 10;
            const PageNo = reqBody.page ? parseInt(reqBody.page) : 0;
            const sortColumn = reqBody.sortColumn ? reqBody.sortColumn : 'updated';
            const sortType = reqBody.sortType ? (reqBody.sortType == 'asc' ? 1 : -1) : -1;
            let role = reqBody.role;

            if (role && !ROLES.includes(role)) {
                return res.send({
                    status: 400,
                    message: "Not valid role"
                });
            }

            const MATCH = {};
            MATCH.$or = [];
            MATCH.$and = [];

            if (role) {
                MATCH.$and.push({
                    roles: role
                });
            }

            if (!MATCH.$or.length) {
                delete MATCH.$or;
            }
            if (!MATCH.$and.length) {
                delete MATCH.$and;
            }

            const data = await UserLogins.aggregate([{
                $lookup: {
                    from: 'profiles',
                    localField: '_id',
                    foreignField: "loginid",
                    as: "profileInfo"
                }
            },
            {
                $lookup: {
                    from: 'shops',
                    localField: '_id',
                    foreignField: "user_id",
                    as: "shopInfo"
                }
            },

            {
                $unwind: {
                    path: '$profileInfo',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    roles: 1,
                    id: 1,
                    email: 1,
                    gstin: 1,
                    fssai: 1,
                    mobile_number: 1,
                    isEmailVerified: 1,
                    username: 1,
                    'shop_name': "$shopInfo.shop_name",

                    'name': "$profileInfo.name",
                    'photo': "$profileInfo.photo",
                    'create': "$profileInfo.create",
                    'updated': "$profileInfo.updated",
                    user_status: 1,
                }
            },
            {
                $match: MATCH
            },
            {
                $sort: {
                    [sortColumn]: sortType
                }
            },
            {
                $skip: (Limit * PageNo)
            },
            {
                $limit: Limit
            }
            ]);

            const countUser = await UserLogins.aggregate([{
                $lookup: {
                    from: 'profiles',
                    localField: '_id',
                    foreignField: "loginid",
                    as: "profileInfo"
                }
            },
            {
                $unwind: {
                    path: '$profileInfo',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    roles: 1,
                    id: 1,
                    email: 1,
                    gstin: 1,
                    fssai: 1,
                    mobile_number: 1,
                    isEmailVerified: 1,
                    isBussinessVerified: 1,
                    username: 1,
                    'name': "$profileInfo.name",
                    'photo': "$profileInfo.photo",
                    'create': "$profileInfo.create",
                    'user_status': {
                        $cond: {
                            if: {
                                $eq: ["$user_status", "deactive"]
                            },
                            then: "deactive",
                            else: "active"
                        }
                    },
                }
            },
            {
                $match: MATCH
            },
            ]);


            return res.send({
                status: 200,
                data: data,
                total: countUser.length,
                message: 'Users get successfully'
            });
        } catch (error) {
            return res.send({
                status: 400,
                message: error.message
            });
        }
    },

    deleteuser: async (req, res, next) => {
        try {
            const {
                _id
            } = req.body;
            if (!_id) {
                res.send({
                    status: 400,
                    message: "Not valid id"
                });
                return;
            }

            const deleteUser = await UserLogins.findByIdAndDelete(_id);
            if (!deleteUser) {
                return res.send({
                    status: 400,
                    message: 'User not found'
                })
            }
            const deleteProfile = await Profile.findOneAndDelete({
                loginid: _id
            });
            return res.send({
                status: 200,
                message: 'User deleted successfully'
            });

        } catch (error) {
            return res.send({
                status: 400,
                message: error.message
            })
        }
    },

    forgotpassword: async (req, res, next) => {
        try {
            const {
                username
            } = req.body;
            console.log()
            const newOtp = generateOTP();


            if (!username) {
                return res.send({
                    status: false,
                    message: "please provide email"
                });
            }

            const isUser = await UserLogins.findOne({
                $or: [{
                    email: username
                }]
            });

            if (!isUser) {
                return res.send({
                    status: false,
                    message: "User not found"
                });
            }
           



            const isOtp = await UserLogins.findOneAndUpdate({
                _id: isUser._id
            }, {
                otp: newOtp
            });

 if (!isOtp) {
                const json = {
                    loginid: isUser._id,
                    otp: newOtp
                };
            }

            Helper.sendEmail(isUser.email, `Your Verification code`, `Your verification code to reset your password is ${newOtp}.`);
            return res.send({
                status: 200,
                message: "Otp sent to your email address"
            });

        } catch (error) {
            return res.send({
                status: 400,
                message: error.message
            });
        }


    },

    forgotpasswordmobile: async (req, res, next) => {
        try {
            const {
                username
            } = req.body;
            const newOtp = generateOTP();

            if (!username) {
                return res.send({
                    status: 400,
                    message: "please provide email"
                });
            }

            const isUser = await UserLogins.findOne({
                $or: [{
                    email: username
                }]
            });

            if (!isUser) {
                return res.send({
                    status: 400,
                    message: "User not found"
                });
            }
            if (isUser && isUser.deactive) {
                return res.send({
                    status: 400,
                    message: block_user_messsage
                });
            }

            if (isUser.deactive && isUser.roles != "ADMIN") {
                return res.send({
                    status: 400,
                    message: block_user_messsage
                });
            }

            const isOtp = await otp.findOneAndUpdate({
                loginid: isUser._id
            }, {
                $inc: {
                    attempt: 1
                },
                otp: newOtp
            });

            if (!isOtp) {
                const json = {
                    loginid: isUser._id,
                    otp: newOtp
                };
                await (new otp(json)).save();
            }

            let msg_body = `Hi, ${isUser.username}<br />`;
            msg_body += 'Please hit the Below link <br />';
            msg_body += `<a href="http://13.234.31.171/api/resetPasswordView/mobile?q=${isUser._id}">reset password</a>:<br />`;


            await Helper.sendEmail(isUser.email, `Your Verification code`, `Your verification code to reset your password is ${newOtp}`)

            // await Helper.sendEmail(isUser.email, 'Reset Password', msg_body);

            return res.send({
                status: 200,
                message: "Otp sent to your email address",
                otp: newOtp
            });

        } catch (error) {
            return res.status(500).send({
                status: 500,
                message: error.message
            });
        }


    },




    recoverpasswordfrommobile: async (req, res, next) => {
        try {

            const {
                id,
                password,
                confirm_password
            } = req.body;

            if (!password) {
                return res.send({
                    status: 400,
                    message: "please provide required params"
                })
            }

            if (password === confirm_password) {
                const isUser = await UserLogins.findOne({
                    $or: [{
                        _id: id
                    }]
                });

                if (!isUser) {
                    return res.send({
                        status: 400,
                        message: "User not found"
                    });
                }

                let current_password = isUser.password;

                const hashPassword = bcrypt.hashSync(password, saltRounds);
                await UserLogins.findByIdAndUpdate(isUser._id, {
                    password: hashPassword
                });
                return res.send({
                    status: 200,
                    message: 'Password updated successfully Please Login !'
                });
            } else {
                return res.send({
                    status: 200,
                    message: 'Password and Confirm password does not match!'
                });
            }



        } catch (error) {
            return res.send({
                status: 400,
                message: error.message
            });
        }



    },
    recoverpasswordmobileview: async (req, res, next) => {

        const {
            q
        } = req.query;

        res.render('resetPassword', {
            id: q,
        });

    },

    changepassword: async (req, res, next) => {
        try {



            const {
                _id,
                old_password,
                password
            } = req.body;



            if (!_id || !password || !old_password) {
                return res.send({
                    status: 400,
                    message: "please provide required params"
                })
            }

            const isUser = await UserLogins.findOne({
                $or: [{
                    _id: _id
                }]
            });

            if (!isUser) {
                return res.send({
                    status: 400,
                    message: "User not found"
                });
            }


            let current_password = isUser.password;

            const checkPassword = await bcrypt.compare(old_password, current_password);
            if (checkPassword == false) {
                return res.send({
                    status: 400,
                    message: 'Current password not matched for your old password'
                });
            }


            const hashPassword = bcrypt.hashSync(password, saltRounds);
            await UserLogins.findByIdAndUpdate(isUser._id, {
                password: hashPassword
            });

            return res.send({
                status: 200,
                message: 'Password updated successfully'
            });



        } catch (error) {
            return res.send({
                status: 400,
                message: error.message
            });
        }


    },





    crateprofile: (req, res, next) => {

        const {
            email,
            phone,
            name,
            gender,
            dob,
            photo
        } = req.body;
        if (!email || !phone || !name || !gender || !dob || !photo) {
            res.send({
                status: 400,
                message: "Required Parameter is missing"
            });
            return;
        }

        Profile.create({
            email,
            phone,
            name,
            gender,
            dob,
            photo,
            loginid: req.user._id
        }).then((data) => {
            res.send({
                status: 200,
                data
            })
            return;
        }).catch((err) => {
            res.send({
                status: 400,
                message: "error Occured While create profile"
            })
            return;
        });

    },

    logout: (req, res, next) => {
        try {
            if (req.user) {
                req.user = null;
                return res.send({
                    status: 200,
                    message: 'Logout Successfully'
                });
            }
        } catch (error) {
            return res.send({
                status: 400,
                message: error.message
            });
        }
    },


    //ADMIN
    subadminSignup: async (req, res, next) => {




        try {
            const {

                user_name,
                password,
                roleType,
                mobile_number,
                firebase_token,
                email,

            } = req.body;
            const userOtp = generateOTP();


            if (!email)
                return res.send({
                    status: false,
                    message: "Email is required"
                });

            if (!password)
                return res.send({
                    status: false,
                    message: "Password is required"
                });
            const hash = bcrypt.hashSync(password, saltRounds);

            const data = {
                email: email,
                username: user_name,
                mobile_number: mobile_number,
                password: hash,
                roles: roleType,
                firebase_token: firebase_token,
                otp: userOtp
            };



            //Multer
            // let filename;
            // if(req.files.length > 0) {

            //     req.files.forEach(E => {
            //         var filePath = path.join(__dirname, '../../public/users/');
            //         if (!fs.existsSync(filePath)) {
            //         fs.mkdirSync(filePath);
            //     }

            //     const fileUrl = filePath + E.filename;
            //     sharp(E.path).toFile(fileUrl, function (err) {
            //         if (err) {
            //             console.log(err)
            //         }
            //     });      
            //     let imageUrl

            //     if(req.hostname == 'Huntbackend.plenumnetworks.com' || req.hostname == 'Huntbackend.plenumnetworks.com'){
            //         imageUrl = `${req.protocol}://${req.hostname}`
            //     }

            //     else{
            //         imageUrl = `${req.protocol}://${req.hostname}:4000`
            //     }

            //     filename = `${imageUrl}/users/${E.filename}`;

            //     });
            // }



            // Multer S3 Bucket   
            // let filename;

            // if (req.files && req.files[0] && req.files[0].location) {
            //     filename = req.files[0].location;
            // }

            const isUser = await UserLogins
                .findOne({
                    $or: [{
                        email: email
                    }]
                })
                .lean().exec();



            const isUserMobile = await UserLogins
                .findOne({
                    $or: [{
                        mobile_number: mobile_number
                    }]
                })
                .lean().exec();

            if (isUser) {
                let msg = 'This';
                if (isUser.email === email) {
                    msg += ' Email';
                }
                msg += ' is already registered';

                return res.send({
                    status: false,
                    message: msg
                });
            }





            if (isUserMobile) {
                let msg = 'This';
                if (isUserMobile.mobile_number === mobile_number) {
                    msg += ' Mobile No.';
                }
                msg += ' is already registered';

                return res.send({
                    status: false,
                    message: msg
                });
            }


            if(data.roles !== "STORE"){
                return res.send({
                    status: false,
                    message: "something went wrong!"
                });

            }
            const userLoginCreate = await (new UserLogins(data)).save();
            let isUser1 = await UserLogins.findOne({
                $or: [{
                    email: userLoginCreate.email
                }]
            }).lean().exec();

            isUser1 = {
                username: isUser1.email,
                _id: isUser1._id,
                time: new Date().getTime(),
                role: isUser1.roles
            };

            const accessToken = jwt.sign(isUser1, accessTokenSecret);
            let msg_body = 'Hi, <br />';
            msg_body += ' your OTP(One Time Password) is ' + userOtp;
            console.log("🚀 ~ file: authController.js:1512 ~ subadminSignup: ~ userOtp:", userOtp)
            await Helper.sendEmail(email, 'New Signup', msg_body);
            return res.send({
                status: true,
                user: userLoginCreate,
                accessToken: accessToken,
                message: `${roleType} Sign Up Successfully`
            });


        } catch (error) {

            console.log(error)


            return res.send({
                status: false,
                message: error.message
            })
        }
    },
    adminLogin: async (req, res, next) => {

        const {
            username,
            password,
            isOtp
        } = req.body;


        if (!isOtp) {
            res.send({
                status: false,
                message: "please provide isOtp"
            });
        } else {
            if (isOtp == 0) { // if is otp is false
                UserLogins.findOne({
                    $or: [{
                        email: username
                    },]
                }).then(async (data) => {

                    if (data && data._id) {



                        if (!data.isEmailVerified) {

                            const emailOtp = generateOTP();
                            let msg_body = `Hi, ${data.username} <br />`;
                            msg_body += 'Your One Time Password is ' + emailOtp;
                            msg_body += '<br />Thanks,<br />Hunt Team';



                            await UserLogins.findByIdAndUpdate(data._id, { otp: emailOtp }).lean().exec();
                            Helper.sendEmail(data.email, "OTP Verification", msg_body);
                            await UserLogins.findByIdAndUpdate(data._id, { otp_time: new Date() });


                            data.otp = emailOtp


                            return res.send({ status: false, user_detail: data, email: data.email, message: "Your account is not verified" });
                        }





                        let user_detail = data;

                        let user = {
                            username: data.email,
                            _id: data._id,
                            time: new Date().getTime(),
                            role: data.roles
                        };
                        const accessToken = jwt.sign(user, accessTokenSecret);

                        let compare = bcrypt.compareSync(password, data.password);
                        if (!compare) {
                            if (data.password === password) {
                                UserLogins.updateOne({
                                    _id: data._id
                                }, {
                                    $set: {
                                        last_login_time: new Date()
                                    }
                                }).then({});
                                res.json({
                                    status: true,
                                    accessToken,
                                    user: data,
                                    user_detail: user_detail,
                                });
                                return;
                            }
                            res.send({
                                status: false,
                                message: "Invalid password!"
                            });
                        } else {
                            UserLogins.updateOne({
                                _id: data._id
                            }, {
                                $set: {
                                    last_login_time: new Date()
                                }
                            }).then({})
                            return res.json({
                                status: true,
                                accessToken,
                                user,
                                user_detail: user_detail,
                            });
                        }

                    } else {
                        res.send({
                            status: false,
                            message: "email not found"
                        });
                    }
                })
            } else if (isOtp == 1) { // if login by otp is true
                // let otp = Math.floor(1000 + Math.random() * 9000);
                console.log('otp is not false')
                let otp = generateOTP();

                if (username) {
                    UserLogins.findOne({
                        $or: [{
                            email: username
                        }]
                    }).then((data) => {
                        UserLogins.updateOne({
                            email: username
                        }, {
                            $set: {
                                otp: otp
                            }
                        }).then(user => {

                        }).catch(err => {
                            res.send({
                                status: false,
                                err: "An Error Occured"
                            })
                            return;
                        })
                    }).catch(err => {
                        res.send({
                            status: false,
                            err: "An Error Occured"
                        })
                        return;
                    });

                } else if (mobile_number) {
                    UserLogins.findOne({
                        $or: [{
                            mobile_number: mobile_number
                        }]
                    }).then((data) => {
                        UserLogins.updateOne({
                            mobile_number: mobile_number
                        }, {
                            $set: {
                                otp: otp
                            }
                        }).then(async user => {
                            await sendSms(mobile_number, generateOTP() + ' is your OTP for Login Transaction on Galinukkad and valid till 10 minutes. Do not share this OTP to anyone for security reasons.');


                            res.send({
                                status: true,
                                message: "Otp sent!"
                            })
                            return;
                        }).catch(err => {
                            res.send({
                                status: false,
                                err: "An Error Occured"
                            })
                            return;
                        })
                    }).catch(err => {
                        res.send({
                            status: false,
                            err: "An Error Occured"
                        })
                        return;
                    });
                }
            }
        }
    },
    adminrecoverpassword: async (req, res, next) => {
        try {
            const {
                username,
                old_password,
                password,
                otpchk
            } = req.body;



            if (!username || !password || !otpchk) {
                return res.send({
                    status: false,
                    message: "please provide required params"
                })
            }

            const isUser = await UserLogins.findOne({
                $or: [{
                    email: username
                }, {
                    username: username
                }]
            });

            if (!isUser) {
                return res.send({
                    status: false,
                    message: "User not found"
                });
            }

            let current_password = isUser.password;

            if (old_password === undefined) {

                // let otpverify = await otp.findOne({
                //     loginid: isUser._id,
                //     otp: otpchk
                // })
                let otpverify = await UserLogins.findOne({
                    _id: isUser._id,
                    otp: otpchk
                })
                if (otpverify) {
                    const hashPassword = bcrypt.hashSync(password, saltRounds);
                    await UserLogins.findByIdAndUpdate(isUser._id, {
                        password: hashPassword
                    });



                    return res.send({
                        status: true,
                        message: 'Password updated successfully'
                    });
                } else {
                    return res.send({
                        status: false,
                        message: 'Otp Not valid'
                    });

                }






            } else {

                const checkPassword = await bcrypt.compare(old_password, current_password);
                console.log(checkPassword);
                if (checkPassword == false) {
                    return res.send({
                        status: false,
                        message: 'Current password not matched for your old password'
                    });
                }


                const hashPassword = bcrypt.hashSync(password, saltRounds);
                await UserLogins.findByIdAndUpdate(isUser._id, {
                    password: hashPassword
                });

                return res.send({
                    status: true,
                    message: 'Password updated successfully'
                });

            }

        } catch (error) {
            return res.send({
                status: false,
                message: error.message
            });
        }

    },
    adminforgotpassword: async (req, res, next) => {
        try {
            const {
                username
            } = req.body;
            console.log()
            const newOtp = generateOTP();


            if (!username) {
                return res.send({
                    status: false,
                    message: "please provide email"
                });
            }

            const isUser = await UserLogins.findOne({
                $or: [{
                    email: username
                }]
            });

            if (!isUser) {
                return res.send({
                    status: false,
                    message: "User not found"
                });
            }
            if (isUser && isUser.deactive) {
                return res.send({
                    status: false,
                    message: block_user_messsage
                });
            }

            if (isUser.deactive && isUser.roles != "ADMIN") {
                return res.send({
                    status: false,
                    message: block_user_messsage
                });
            }



            const isOtp = await UserLogins.findOneAndUpdate({
                _id: isUser._id
            }, {
                otp: newOtp
            });



            // const isOtp = await otp.findOneAndUpdate({
            //     loginid: isUser._id
            // }, {
            //     $inc: {
            //         attempt: 1
            //     },
            //     otp: newOtp
            // });

            if (!isOtp) {
                const json = {
                    loginid: isUser._id,
                    otp: newOtp
                };
            }

            Helper.sendEmail(isUser.email, `Your Verification code`, `Your verification code to reset your password is ${newOtp}.`);
            return res.send({
                status: true,
                message: "Otp sent to your email address"
            });

        } catch (error) {
            return res.send({
                status: false,
                message: error.message
            });
        }


    },
    adminverifyOtp: async (req, res, next) => {
        try {
            const {
                mobile_number,
                userName,
                email,
                otp
            } = req.body;
            let isUser;


            if (!email && !userName && !mobile_number) {
                return res.send({
                    status: false,
                    message: "Required parameter missing, Please provide email  or mobile number"
                });
            }


            if (!otp) {
                return res.send({
                    status: false,
                    message: "OTP is required"
                });
            }

            if (email || userName) {
                isUser = await UserLogins.findOne({
                    $or: [{
                        email: email
                    }, {
                        username: userName
                    }]
                }).lean().exec();
                if (!isUser) {
                    return res.send({
                        status: false,
                        message: "User not found"
                    });
                }




                if (isUser.otp == otp || isUser.mobile_otp == otp) {
                    await UserLogins.findByIdAndUpdate(isUser._id, {
                        isEmailVerified: true,
                        user_status: true,


                    });

                    if (isUser.roles !== ROLES[3]) {
                        const accessToken = jwt.sign(isUser, accessTokenSecret);
                        return res.send({
                            status: true,
                            message: "OTP Verified",
                            accessToken: accessToken,
                            userId: isUser._id
                        });
                    } else {
                        const userData = {
                            username: isUser.email,
                            _id: isUser._id,
                            time: new Date().getTime(),
                            role: isUser.roles
                        };
                        const accessToken = jwt.sign(userData, accessTokenSecret);

                        await UserLogins.findByIdAndUpdate(isUser._id, {
                            $inc: {
                                no_of_loggedin: 1
                            },
                            last_login_time: new Date()
                        });
                        return res.send({
                            status: true,
                            user: isUser,
                            accessToken: accessToken
                        });
                    }

                } else {

                    return res.send({
                        status: false,
                        message: "OTP Not Verified"
                    });
                }

            } else if (mobile_number) {
                const isUser = await UserLogins.findOne({
                    mobile_number: mobile_number
                }).lean().exec();

                if (!isUser) {
                    return res.send({
                        status: false,
                        message: "User not found"
                    });
                }


                if (isUser.mobile_otp === otp) {
                    await UserLogins.findByIdAndUpdate(isUser._id, {
                        isMobileVerified: true
                    });

                    if (isUser.roles !== ROLES[3]) {
                        const accessToken = jwt.sign(isUser, accessTokenSecret);
                        return res.send({
                            status: true,
                            message: "OTP Verified",
                            accessToken: accessToken,
                            userId: isUser._id
                        });
                    } else {
                        const userData = {
                            username: isUser.email,
                            _id: isUser._id,
                            time: new Date().getTime(),
                            role: isUser.roles
                        };
                        const accessToken = jwt.sign(isUser, accessTokenSecret);

                        await UserLogins.findByIdAndUpdate(isUser._id, {
                            $inc: {
                                no_of_loggedin: 1
                            },
                            last_login_time: new Date()
                        });
                        return res.send({
                            status: true,
                            user: userData,
                            accessToken: accessToken
                        });
                    }

                } else {
                    return res.send({
                        status: false,
                        message: "OTP Not Verified"
                    });
                }
            } else {
                return res.send({
                    status: false,
                    message: "Something went wrong"
                });
            }


        } catch (e) {
            console.log(e)
            return res.send({
                status: false,
                err: e.message
            })
        }
    },
    getAllSchools: async (req, res, next) => {
        try {

            const getActiveSubAdmin = await UserLogins.find({ roles: 'SUBADMIN', user_status: true });
            const getActiveId = getActiveSubAdmin.map((user) => user._id)
            const getSchoolList = await School.find({ loginid: { $in: getActiveId } });
            return res.send({
                status: 200,
                schools: getSchoolList,
                message: 'get all schools list'
            })

        } catch (error) {

            return res.send({
                status: 400,
                err: e.message
            })
        }

    },
    getUserProfile: async (req, res, next) => {


        try {
            let user = await UserLogins.findById(req.body.user_id).lean().exec();
            console.log('user', user.school_id)

            if (user) {
                const getSchool = await School.findById(user.school_id);
                const getRole = await Role.findOne({ _id: user.employee_type });

                if (getRole && getRole.roles === 'Lunch Worker') {
                    user.isLunchWorker = true
                } else {
                    user.isLunchWorker = false
                }

                let getStream = await Stream.findOne({
                    _id: user.stream_id
                });
                user.stream_name = getStream?.name
                user.schoolInfo = getSchool






                return res.send({
                    status: 200,
                    user: user,
                });
            } else {
                return res.send({
                    status: 400,
                    user: 'user not found',
                });
            }


        } catch (e) {
            console.log(e.message)

            return res.send({
                status: 400,
                message: e.message
            });
        }

    },
    getStudentProfile: async (req, res, next) => {

        try {
            let user = await UserLogins.findById(req.body.user_id).lean().exec();
            let emp_user = await UserLogins.findById(req.user._id).lean().exec();
            if (user.school_id === emp_user.school_id) {
                return res.send({
                    status: 400,
                    message: 'school not match',
                });

            }




            if (user) {
                const getSchool = await School.findById(user.school_id);
                const getRole = await Role.findOne({ _id: user.employee_type });

                if (getRole && getRole.roles === 'Lunch Worker') {
                    user.isLunchWorker = true
                } else {
                    user.isLunchWorker = false
                }

                let getStream = await Stream.findOne({
                    _id: user.stream_id
                });
                user.stream_name = getStream?.name
                user.schoolInfo = getSchool




                return res.send({
                    status: 200,
                    user: user,
                });
            } else {
                return res.send({
                    status: 400,
                    message: 'user not found',
                });
            }


        } catch (e) {
            console.log(e.message)

            return res.send({
                status: 400,
                message: e.message
            });
        }

    },
    updateProfile: async (req, res, next) => {
        // console.log('body' ,req.body)
        // console.log('file' ,req.files)
        // return;


        try {

            const { _id, user_name, mobile_number, email, dob, roleType } = req.body;
            UserLogins.findOne({
                _id: _id
            }).then(async (data) => {

                if (data && data._id) {
                    let userData = {}

                    if (roleType === 'EMPLOYEE') {
                        userData = {
                            username: user_name,
                            dob: dob,
                            mobile_number: mobile_number,
                            email: email

                        }

                    } else {

                        userData = {
                            username: user_name,
                            dob: dob,
                            mobile_number: mobile_number,
                            email: email

                        }

                    }




                    //Multer
                    // let filename;
                    // let id_card_front;
                    // let id_card_back;

                    // if(req.files.length > 0) {

                    //     req.files.forEach(E => {
                    //         var filePath = path.join(__dirname, '../../public/users/');
                    //         if (!fs.existsSync(filePath)) {
                    //         fs.mkdirSync(filePath);
                    //     }

                    //     const fileUrl = filePath + E.filename;
                    //     sharp(E.path).toFile(fileUrl, function (err) {
                    //         if (err) {
                    //             // console.log(err)
                    //         }
                    //     });      
                    //     let imageUrl 

                    //     if(req.hostname == 'Huntbackend.plenumnetworks.com'){
                    //         imageUrl = `${req.protocol}://${req.hostname}`
                    //     }else{
                    //         imageUrl = `${req.protocol}://${req.hostname}:4000`

                    //     }
                    //     if(E.fieldname === 'id_card_front'){ 
                    //         id_card_front = `${imageUrl}/users/${E.filename}`;

                    //     }else
                    //      if(E.fieldname === 'id_card_back'){
                    //         id_card_back = `${imageUrl}/users/${E.filename}`;
                    //     }else 
                    //     if(E.fieldname === 'avatar'){
                    //         filename = `${imageUrl}/users/${E.filename}`;
                    //     }




                    //     });
                    // }




                    // Multer S3 Bucket  
                    let filename;
                    let id_card_front;
                    let id_card_back;
                    if (req.files && req.files[0] && req.files[0].location) {

                        req.files.map((E) => {


                            if (E.fieldname === 'id_card_front') {
                                id_card_front = E.location;

                            } else
                                if (E.fieldname === 'id_card_back') {
                                    id_card_back = E.location;
                                } else
                                    if (E.fieldname === 'avatar') {
                                        filename = E.location;
                                    }

                        })



                    }





                    if (req.files.length > 0) {

                        if (filename) {
                            console.log('filename', filename)
                            userData.avatar = filename

                        }
                        if (id_card_front) {


                            userData["id_card.0.id_card_front"] = id_card_front


                        }

                        if (id_card_back) {
                            userData["id_card.1.id_card_back"] = id_card_back

                        }

                    }




                    let result = await UserLogins.findByIdAndUpdate({ _id: _id }, userData)
                    let user = await UserLogins.findOne({
                        _id: _id
                    }).lean().exec();

                    const getRole = await Role.findOne({ _id: user.employee_type });
                    let getStream = await Stream.findOne({
                        _id: user.stream_id
                    });
                    user.stream_name = getStream?.name

                    if (getRole && getRole.roles === 'Lunch Worker') {
                        user.isLunchWorker = true
                    } else {
                        user.isLunchWorker = false
                    }


                    console.log('user', user)
                    return res.send({
                        status: 200,
                        user: user,
                        message: "User Profile updated successfully"
                    });


                }

            });

        } catch (error) {
            return res.send({
                status: false,
                message: error.message
            });
        }

    },




    swipeMeal: async (req, res, next) => {
        try {
            let { user_id, swiper_id, hall_id } = req.body;

            UserLogins.updateOne({ "_id": user_id }, { "$inc": { meal: -1 } }).then(async (data) => {
                const swiperInfo = await UserLogins.findById(swiper_id);
                const userInfo = await UserLogins.findById(user_id);
                let findLunch = await Lunch.findById(swiperInfo.hall_id)

                let Meal_Data = {
                    user_id: user_id,
                    swiper_id: swiper_id,
                    hall_id: swiperInfo.hall_id,
                }
                let Notification_Data = {
                    user_id: user_id,
                    title: 'yehh!',
                    message: `Meal Swiped Successfully at ${findLunch.hall_name}`,
                    type: 'Meal',

                }
                let mealModal = await (new Meal_History(Meal_Data)).save();
                let notificationModel = await (new Notification(Notification_Data)).save();


                await sendPushNotificationSwipe("207", 'yehh!', `Meal Swipe Successfully at ${findLunch.hall_name}`, userInfo.firebase_token, userInfo.meal);
                // await sendPushNotificationSwipe("207", 'yehh!', `Meal Swipe Successfully at ${findLunch.hall_name}` , swiperInfo.firebase_token);


                return res.send({
                    status: 200,
                    data,
                    message: 'Meal updated successfully'
                });





            }).catch((err) => {

                console.error(err.message);
                return res.send({
                    status: 400,
                    message: err.errmsg
                });

            });

        } catch (e) {
            console.log(e);
            return res.send({
                status: 400,
                message: e.message
            });
        }
    },
    userMealList: async (req, res, next) => {
        try {
            let { user_id } = req.body;
            console.log(user_id)

            const data = await Meal_History.aggregate([{
                $match: { user_id: mongoose.Types.ObjectId(user_id) }
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
                    from: 'users',
                    localField: 'swiper_id',
                    foreignField: "_id",
                    as: "swiperInfo"
                }
            },
            {
                $lookup: {
                    from: 'lunch_holls',
                    localField: 'hall_id',
                    foreignField: "_id",
                    as: "hallInfo"
                }
            },

            {
                $unwind: {
                    path: '$userInfo',
                    preserveNullAndEmptyArrays: false
                }, $unwind: {
                    path: '$swiperInfo',
                    preserveNullAndEmptyArrays: false
                }, $unwind: {
                    path: '$hallInfo',
                    preserveNullAndEmptyArrays: false
                }
            },

            { $sort: { created_at: -1 } }

            ]);

            let mealList = data && data.map((val, item) => {
                let formatData = [item + 1, val.swiperInfo[0].username, val.hallInfo.hall_name, moment(val.created_at).format('DD MMM yyyy')]
                return formatData
            })



            const userInfo = await UserLogins.findById(user_id);
            return res.send({
                status: 200,
                message: 'Meal History Get Successfully',
                list: mealList,
                count: userInfo.meal,
            });
        } catch (e) {
            console.log(e);
            return res.send({
                status: 400,
                message: e.message
            });
        }
    },

    getSecurityNumber: async (req, res, next) => {
        try {
            let { school_id } = req.body;
            const getRole = await Role.findOne({ roles: 'Security Officer' });
            const getMobile = await UserLogins.find({ school_id: school_id, roles: 'EMPLOYEE', employee_type: getRole._id }).lean().exec();
            console.log(getMobile.lenght)

            if (getMobile) {
                return res.send({
                    status: 200,
                    message: 'security officer number found',
                    user: getMobile,
                });
            } else {
                return res.send({
                    status: 200,
                    user: {},
                    message: 'security officer number not found '
                });
            }

        } catch (e) {
            console.log(e);
            return res.send({
                status: 400,
                message: e.message
            });
        }
    },

    accountDeactivated: async (req, res, next) => {
        let user_id = req.body._id

        const getUser = await UserLogins.findById(user_id)
        if (!getUser) {
            return res.send({ status: 400, message: 'User not found' })
        }

        // Detele User Account
        await UserLogins.deleteOne({ _id: user_id })

        // Detele Meal History
        await Meal_History.deleteMany({ $or: [{ user_id: user_id }, { swiper_id: user_id }] })
        // Detele User Check In 
        await Notification.deleteMany({ user_id: user_id })

        //Remove Time Table Name
        await Time_Table.updateMany({}, { $pull: { remove_user_id: user_id } },)

        return res.send({
            status: 200,
            message: 'your account deleted successfully'
        });

    },


    stripeAmountPay: async (req, res, next) => {
        try {
            const { user } = req.body;

            const unique_key = uuid();
            let price = await Plan.findOne().lean().exec();
            // let stripe_amounts
            // if(price){
            //     stripe_amounts = price.plan_price;

            // }else{
            //     stripe_amounts = 100;
            // }
            
            let stripe_amount = price.plan_price;

           
            


            // INITIAL STRIPE PAYMENT DETAILS AND REDIRECT TO STRIPE PAYMENT SCREEN
            const paymentIntent = await stripe.paymentIntents.create({
                amount: stripe_amount * 100,
                currency: "usd",
                payment_method_types: ["card"],
                metadata: {
                    name: user.name,
                    email: user.email,
                    type: "ADD_CASH",
                },
            });

            console.log('paymentIntent ---', paymentIntent)

            const clientSecret = paymentIntent.client_secret;

            // req.body["payment_intent_id"] = paymentIntent.id;
            // req.body["currency"] = paymentIntent.currency;

            console.log('paymentIntent.payment_method_details', paymentIntent.payment_method_details)

            let data = {
                user_id: user._id,
                payment_status: "PENDING",
                amount: stripe_amount,
                currency: paymentIntent.currency,
                payment_intent_id: paymentIntent.id,
                client_secret: clientSecret,
                email: user.email,
                payment_method_details: paymentIntent.payment_method_details || "",
            }

            console.log('data ---', data)
            await StripePayment(data).save();

            let stripeData = {
                stripe_payment_id: paymentIntent.id,
                clientSecret
            };


            return res.status(200).send({ status: true, stripeData });
        } catch (e) {
            console.log('catch error', e)
            return res.status(400).send({ status: 400, message: e });
        }
    },



    stripeAmountPayCallback: async (req, res, next) => {
        try {
            const { stripe_payment_id, status } = req.body;

            console.log('req.body', req.body)

            await StripePayment.findOneAndUpdate({ payment_intent_id: stripe_payment_id }, {$set : { payment_status: status }});

            if(status === "FAILED") {
                return res.status(200).send({ status: true, message: "Payment Failed." });
            }

            let stripePayment = await StripePayment.findOne({ payment_intent_id: stripe_payment_id });
            if(status === "SUCCESS") {
                await UserLogins.updateOne({ _id: stripePayment.user_id }, { $set: { payment_status: true, user_status: true } });
                return res.status(200).send({ status: true, message: "Your Payment Successful Please Login." });
            }


            return res.status(200).send({ status: true, message: "Something Went Wrong." });

            // // return ;
            // const customer = await stripe.customers.create({
            //     email: token.email,
            //     source: token.id
            // })

            // const unique_key = uuid();

            // let price = await Plan.findOne().lean().exec();
            // let stripe_amount = price.plan_price


            // console.log('stripe_amount________________________________________________________________', stripe_amount)

            // const charge = await stripe.charges.create(
            //     {
            //         amount: stripe_amount * 100,
            //         currency: "USD",
            //         customer: customer.id,
            //         receipt_email: token.email,
            //         description: `Plan purchase`,
            //         shipping: {
            //             name: token.card.name,
            //             address: {
            //                 linel: token.card.address_linel,
            //                 line2: token.card.address_line2,
            //                 city: token.card.address_city,
            //                 country: token.card.address_country,
            //                 postal_code: token.card.address_zip
            //             }
            //         }
            //     },
            //     {
            //         idempotencyKey: unique_key
            //     }
            // );

            // console.log('CHARGE')
            // console.log(charge)

            // let data = {
            //     user_id: user._id,
            //     payment_status: charge.paid,
            //     amount: charge.amount / 100,
            //     email: user.email,
            //     payment_method_details: charge.payment_method_details.type,
            //     stripe_id: charge.id,
            //     balance_transaction: charge.balance_transaction,
            //     currency: charge.currency,
            //     receipt_url: charge.receipt_url
            // }

            // await StripePayment(data).save();


        } catch (e) {
            console.log('catch error', e)
            return res.status(400).send({ status: 400, message: e });
        }
    },




    stripePaymentList: async (req, res, next) => {
        try {
            let stripePayments = await StripePayment.find({});

            return res.status(200).send({ status: true, stripePayments: stripePayments.reverse() });
        } catch (e) {
            console.log('catch error', e)
            return res.status(400).send({ status: 400, message: e });
        }


    },

    imageUpload: async (req, res, next) => {
        try {

            console.log('req', req.files)
            return res.send({ message: 'successfully uploaded' })

        } catch (error) {


            return res.send({
                status: 400,
                message: error.message
            })
        }
    },



    sendOtpVerify: async (req, res, next) => {
        try {

           

            const {
                email,
                type
            } = req.body;
            if (!email)
                return res.send({
                    status: false,
                    message: "Email is required"
                });

            const userOtp = generateOTP();
  
   

            let msg_body = 'Hi, <br />';
            msg_body += ' your OTP(One Time Password) is ' + userOtp;
            msg_body += '<br />Thanks!<br />';
            await Helper.sendEmail(email, 'Resend OTP', msg_body);
            await UserLogins.updateOne({email : email}, { otp: userOtp ,otp_time: new Date()}).lean().exec();




            return res.send({
                status: true,
                message: "OTP Resend Successfully"
            });

           
        } catch (error) {
console.log(error.message);
            return res.send({
                status: false,
                err: error.message
            })
        }

    },

}


