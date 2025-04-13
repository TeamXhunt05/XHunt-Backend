const firebase = require("firebase-admin");
const db = require('../../db/conn');
const UserLogins = db.UserLogins;
const serviceAccount = require('./secret.json');
module.exports = {
  sendPushNotificationToSingleUser(status,title,body, firebase_token ,type) {

    return new Promise(async (resolve, reject) => {
        try {
            if (['', undefined, null].includes(firebase_token)) {
                return resolve(false);
            }
  
            if (!firebase.apps.length) {
              firebase.initializeApp({
                credential: firebase.credential.cert(serviceAccount),
              });}
            

              const payload = {
                notification: {
                  title: title,
                  sound: "default",
                  body: body,
                 
                },
                data: {
                  status:status,  
                  type: type,
                }
              };
        
              const options = {
                priority: 'high',
                timeToLive: 60 * 60 * 24, // 1 day
              };

            firebase.messaging().sendToDevice(firebase_token, payload, options).then((response) => {
                console.log('Successfully sent message:', response);
                console.log('Successfully sent message:', response.results);
                data = { message: "successfully send message" }
                return resolve(data);
            })
                .catch((error) => {
                    console.log('Error sending message:', error);
                    return resolve(false);
                });



        } catch (error) {
            console.log("error", error);
            return resolve(false);
        }
    });
},


sendPushNotificationSwipe(status,title,body, firebase_token ,meal) {

  return new Promise(async (resolve, reject) => {
      try {
          if (['', undefined, null].includes(firebase_token)) {
              return resolve(false);
          }


          if (!firebase.apps.length) {
            firebase.initializeApp({
              credential: firebase.credential.cert(serviceAccount),
            });}
          

            const payload = {
              notification: {
               
                title: title,
                sound: "default",
                body: body,
                channel_id : '123456567890'
                

                
              },
              data: { 
                status:status,  
                type: 'Swipe',
                meal : String(meal)

              }
            };
      
            const options = {
              priority: 'high',
              timeToLive: 60 * 60 * 24, // 1 day
            };

          firebase.messaging().sendToDevice(firebase_token, payload, options).then((response) => {

              console.log('Successfully sent message:', response);
              console.log('Successfully sent message:', response.results);
              data = { message: "successfully send message" }
              return resolve(data);
          })
              .catch((error) => {
                  console.log('Error sending message:', error);

                  return resolve(false);
              });



      } catch (error) {
          console.log("error", error);
          return resolve(false);
      }
  });
},

  sendSingleNotification(status,title, firebase_token,) {

    try {
      if (!firebase.apps.length) {
      firebase.initializeApp({
        credential: firebase.credential.cert(serviceAccount),
      });
    }

      const payload = {
        notification: {
          
          title: title,
          sound: "default",
          click_action: "FLUTTER_NOTIFICATION_CLICK",
          
        },
        data: {
          status:status,  
        }
      };

      const options = {
        priority: 'high',
        timeToLive: 60 * 60 * 24, // 1 day
      };

      if (firebase_token !== null || firebase_token !== undefined) {
        firebase.messaging().sendToDevice(firebase_token, payload, options).then(function (response) {
          return console.log("Successfully sent message: ", response);
        })
          .catch(function (error) {
            return console.log("Error sending message: ", error);
          });
      }

      data = { message: "successfully send message" }

      return data;
    } catch (e) {
      console.log("error", e);
      return e;
    }
  },
  sendNotificationAnnouncement(status ,title,message , firebaseArray) {
    return new Promise(async (resolve, reject) => {
      try {



        firebaseArray.map((data) => {
      
 
            if (!firebase.apps.length) {
              firebase.initializeApp({
                credential: firebase.credential.cert(serviceAccount),
              });
            }

        
            const payload = {
              notification: {
               
                title: title,
                sound: "default",
                body: message,
                channel_id : '123456567890'
                
              },
              data: {
                status:status,  
              }
            };
      
            const options = {
              priority: 'high',
              timeToLive: 60 * 60 * 24, // 1 day
            };

            const firebase_token = data.firebase_token;
            const username = data.username;

            if (firebase_token !== null || firebase_token !== undefined) {
              console.log('firebase_token' , firebase_token)
              console.log('username' , username)
              firebase.messaging().sendToDevice(firebase_token, payload, options).then(function (response) {
                return console.log("Successfully sent message: ", response);
              })
                .catch(function (error) {
                  return console.log("Error sending message: ", error);
                }); 
            }

          

          data = { message: "successfully send message" }

          return resolve(data);
        })

      } catch (error) {
        console.log("error", error);

        return resolve(false);
      }
    });
  },
  sendNotificationClass(status ,title,message , firebaseArray , type) {
    return new Promise(async (resolve, reject) => {
      try {



        firebaseArray.map((data) => {
      
 
            if (!firebase.apps.length) {
              firebase.initializeApp({
                credential: firebase.credential.cert(serviceAccount),
              });
            }

        
            const payload = {
              notification: {
               
                title: title,
                sound: "default",
                body: message,
                channel_id : String(data._id)
                
              },
              data: {
                status:status,
                type: type,  
              }
            };
      
            const options = {
              priority: 'high',
              timeToLive: 60 * 60 * 24, // 1 day
            };

            const firebase_token = data.firebase_token;

            if (firebase_token !== null || firebase_token !== undefined) {
              // console.log('firebase_token' , firebase_token)
              // console.log('username' , username)
              firebase.messaging().sendToDevice(firebase_token, payload, options).then(function (response) {
                // return console.log("Successfully sent message: ", response);
              })
                .catch(function (error) {
                  return console.log("Error sending message: ", error);
                }); 
            }

          

          data = { message: "successfully send message" }
          

          return resolve(data);
        })

      } catch (error) {
        console.log("error", error);

        return resolve(false);
      }
    });
  },



}





// {
//   "type": "service_account",
//   "project_id": "vivaquad-c14f8",
//   "private_key_id": "1729fbd9c236a2f32fb4527e49a26df460948e25",
//   "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDgeCg+SlgGg7qY\n4adXfscZP2rA/vQaZxRQE/kFiv0hCtmSxuj1gRIIpIx74/xjUlfzCpyaxWAFCmaW\n7/27shjVuFPbtSTeIC+WNCs7VZhD2tl2Er0Z2OiAsEoAy5l0P59veRPbzaCWXBWM\n9QrVaOWcALrQC0jG+IoMy+QpYufBB1Pm9bKcfSx8ZZ4zx9e/ryrCiYpE9oCZbxCC\nT23Zg/uZiKkH2xUh8qm0CyWgUcKvGDSuPsKojCcEMxYMOS6FtgjvgsZevuMdTk1O\n0vzBO0PqFxR/+ZRC/NOPNd3THI5V0usvVnYx6o8CHduvep5wbfvpP8VYVldOFeaB\nKxoqtScpAgMBAAECggEAVBV+kbLcnXgb3mfs/Q/++dyxGyGGBBvn1oVcy3BAmO+N\nB/fdzRUv0a/99ey1nuj6DA9GEY3tBYZbXqAArp4swmY9d3g4GsL4wG3DYgMSuhxR\nSHMFhhikI4yl8/1QeuTYTvQOddBlnt1Yr0gdakrUc+csE4GenfX9FIUN71je0oW+\nFkkDM9O7KlhiWysaPz75+BVTdrA2dOMRXbTfvtWi+YqxRYhJKGqNVBGWUFaw8mD8\nIpfRJzaJRR+PA2Gn1vLg2AWq4yydXSCSVVjXfvuYMKbsvK7zslCFL9tRAXF8MmUp\nBkYWPsOUBPoI2aL9J8V6DjOFMnqVdk67eDnVuWAwzwKBgQDwtm+r+WEmkN9xFm2F\nBru7OWL7sSLScjEmQ0c0qQgTY1TomGDbB5zTazEKPf3VZEVfqTJXO9Odrx51YTRl\nERxHmOYFPeADR77XN2SJxVOTDdgzMOy/K7RfG1s3csuCighVVNJyPWVsTYsZmmya\nrpkgRaNSs6iA2t0jeqVjAv1jXwKBgQDuuaJGd9LrF+pMNyGMnAAuewiKKpInrdsC\nRO6Lj//r1A7ha/vGsJrB/Zg5gteOMw3JQZftRyb+iQIV2jFb1hAT4v959E/m7t/0\naoTq8CbfLF9b50UDlhLgU0r8a2AflZKqocK34UBJnH/4BieqDwsnFqFUQvYdObcJ\nJKfjY13KdwKBgQDDjdLnSa/NXwDHpMrQuYmmLpbllyCNC0w2o42jkHcJGTePxstY\n5bRYZcrvYTFoPQ/HCXPmPqpKfkwmXBPuz5nD6MlmFMB6qby2pz+8VVzyKNstq1+K\nZ30fjt/qCg6fPHhMqp5VRN+yvsR0xmnYuGOaPjjTJTWNiUECY88cwv8LzQKBgQDd\nMI0GA/Iet9r0YUSplsWoS4EfG9CuCS1ajeoE0BjNNn/PKBFyCKJryf+oke4NqIpG\nhosxY/LidqnC+5cuQ0pEUthp9A+wpnZFbgjX8kniEKgObFuKthupVCOvfAHlYd4y\nUY0seP3q9qGvemx36lZoElTK0PxfGeHZC+ivDJuTgwKBgHQE8LlBPWuqu1X/wTnu\n1muIRGCnk+khPlZkN9opRI22U1BRAf4XUiiY3SxPIwAkHDSQfz5QmUFULAlMSB5j\nDKWZ3OzrkgX4wumhEkHMG8A58gfexL/Ifjx4CBvmg/CPuPGIyURs4Nzd85fGgFLa\nom1Y6595T9tpIM1X86bM6QyD\n-----END PRIVATE KEY-----\n",
//   "client_email": "firebase-adminsdk-7xwz5@vivaquad-c14f8.iam.gserviceaccount.com",
//   "client_id": "112249748745643487152",
//   "auth_uri": "https://accounts.google.com/o/oauth2/auth",
//   "token_uri": "https://oauth2.googleapis.com/token",
//   "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
//   "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-7xwz5%40vivaquad-c14f8.iam.gserviceaccount.com"
// }
