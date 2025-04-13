const schedule = require('node-schedule')
const db = require('../db/conn');
const { Time_Table, UserLogins, Subject, Stream, Notification } = db;
let mongoose = require('mongoose')
let moment = require('moment')
const { sendNotificationClass } = require('./firebase/firebase');


module.exports = {
    scheduleAllJobs: async () => {
        try {


            //Get This Year Time Table
            const time_tabel_list = await Time_Table.find().lean().exec();

            if (time_tabel_list.length > 0) {
                time_tabel_list.map((item) => {

                    item.all_dates.map((dates) => {
                        //Get Start Date
                        const date = moment(dates).format('DD/MM/YYYY')
                        const allocateDate = date.split('/')
                        let current_year = moment().year();
                        let date_year = allocateDate[2];

                        // console.log(date_year , current_year ,date_year == current_year)
                        if (date_year == current_year) {
                            //Get Time
                            const startTime = moment(item.startTime)
                            const time = moment.duration("00:30:00");
                            const lessTime = startTime.subtract(time).format("HH:mm");
                            const arrayTime = lessTime.split(':')






                            //Send DateTime 
                            const dateTime = `${arrayTime[1]} ${arrayTime[0]} ${allocateDate[0]} ${allocateDate[1]} *`

                            // Get Schedule Id 
                            let Schedule_id = String(item._id)

                            //Test Schedule
                            const startTimeTest = moment(item.startTime)
                            const lessTimeTest = startTimeTest.subtract(time).format("hh:mm a");
                            let time_show = `${allocateDate[0]}-${allocateDate[1]}-${allocateDate[2]} , , ${lessTimeTest} `
                            // console.log(  "\u001b[1;36m ",allocateDate[0],"-",allocateDate[1],"-",allocateDate[2],"\u001b[1;32m " ,lessTimeTest );

                          





                            //Schedule Jobs
                            var jobs = schedule.scheduleJob(Schedule_id, dateTime, async (fireDate) => {
                                console.log('fireDate', fireDate)


                                //Get Student With Class
                               
                                
                                const getClassStudent = await UserLogins.find({ _id: { $nin: item.remove_user_id }, school_id: item.school_id, roles: 'STUDENT',  stream_id: item.stream_id, year: item.year, class_name:  { $in : [item.class]}, 'firebase_token': { $ne: null } }).lean().exec();
                                const getClassStudentActive = await UserLogins.find({  isNotification : true,_id: { $nin: item.remove_user_id }, school_id: item.school_id, roles: 'STUDENT',  stream_id: item.stream_id, year: item.year, class_name:  { $in : [item.class]}, 'firebase_token': { $ne: null } }).lean().exec();

                                console.log("getClassStudent", getClassStudent);
                                // console.log('item', item.remove_user_id)

                                //   console.log('getClassStudent')
                                //   console.log('item' ,item.remove_user_id)

                                const getSubject = await Subject.findById(item.subject_id);
                                const getStream = await Stream.findById(item.stream_id);
                                if (getClassStudent.length > 0) {
                                
                                
                                   


                                    //Save notification
                                    getClassStudent.map(async (value) => {
                                        let Notification_Data = {
                                            user_id: value._id,
                                            title: `Class Update`,
                                            message: `Your ${getSubject.subject_name} Class is about to start in 30 minutes.`,
                                            type: 'Class Update'
                                        }

                                        let notificationModel = await (new Notification(Notification_Data)).save();
                                    })


                                    if (getClassStudentActive.length > 0) {
                                        let data = {
                                            title: `Class Update`,
                                            message: `Your ${getSubject.subject_name} Class is about to start in 30 minutes.`,
                                            tokenArray: getClassStudentActive,
                                            type: 'Class Update'
                                        }
    
    
                                        //Send Push NotificationS
                                        let result = await sendNotificationClass("207", data.title, data.message, data.tokenArray, data.type);
                                        console.log('result', result)
                                    }

                                  


                                }


                            });
                        }








                    })




                })




            }


        } catch (error) {
            console.log(error)
        }
    },
    removeScheduledJob: async (id) => {
        var myjob = schedule.scheduledJobs[id]
        console.log('myjob.pendingInvocations.length', myjob.pendingInvocations.length)
        myjob.cancel()
        console.log(myjob.pendingInvocations.length)
    },



    job: async () => {

        schedule.scheduleJob('*/5 * * * * *', function (fireDate) {
            const date = new Date(2022, 05, 13, 07, 40, 00);

            console.log(date, 'The answer to life, the universe, and everything!', fireDate, new Date());
        });
        // job = schedule.scheduleJob('*/1 * * * *', function(fireDate){
        //     console.log('This job was supposed to run at ' + fireDate + ', but actually ran at ' + new Date());
        //   });
        const date = new Date(2022, 05, 13, 07, 40);

        job = schedule.scheduleJob(date, function (fireDate) {
            console.log('The world is going to end today.fireDate', fireDate, date);
        });



    },
    scheduleAllJobsCopy: async () => {



        try {
            let start_date = moment().startOf('year').format("yyyy-MM-DD");
            let end_date = moment().endOf('year').format("yyyy-MM-DD");

            //Get This Year Time Table
            const time_tabel_list = await Time_Table.find().lean().exec();





            time_tabel_list.map((val) => {

                let result = val.all_dates.map((date) => {
                    let data = val
                    data.date = date

                    return data

                })


                return result

            })





            if (time_tabel_list.length > 0) {
                time_tabel_list.map(async (item) => {

                    //Get Date
                    const date = moment(item.date).format('DD/MM/YYYY')
                    const allocateDate = date.split('/')

                    //Get Time
                    const startTime = moment(item.startTime)
                    const time = moment.duration("00:30:00");
                    const lessTime = startTime.subtract(time).format("HH:mm");
                    const arrayTime = lessTime.split(':')


                    //Send DateTime 
                    const dateTime = `${arrayTime[1]} ${arrayTime[0]} ${allocateDate[0]} ${allocateDate[1]} *`
                    // console.log(dateTime)



                    // Get Schedule Id 
                    let Schedule_id = String(item._id)

                    //Schedule Jobs
                    var jobs = schedule.scheduleJob(Schedule_id, dateTime, async (fireDate) => {

                        //Get Student With Class
                        const getClassStudent = await UserLogins.find({ school_id: item.school_id, roles: 'STUDENT', class_name: item.class, stream_id: item.stream_id, year: item.year, 'firebase_token': { $ne: null } });
                        console.log('getClassStudent', getClassStudent.length)
                        const getSubject = await Subject.findById(item.subject_id);
                        const getStream = await Stream.findById(item.stream_id);
                        if (getClassStudent.length > 0) {
                            let data = {
                                title: `Class Update`,
                                message: `Your ${getSubject.subject_name} Class is about to start in 30 minutes.`,
                                tokenArray: getClassStudent,
                            }

                            await sendNotificationClass("207", data.title, data.message, data.tokenArray);


                        }


                    });

                })
            }


        } catch (error) {
            console.log(error)
        }
    },
}