var nodemailer = require('nodemailer');
var appRoot = require('app-root-path');
var fs = require('fs');


require('dotenv').config()


const SENDGRID_SECRET_KEY = process.env.SENDGRID_SECRET_KEY
const SENDGRID_EMAIL = process.env.SENDGRID_EMAIL

let auth = {
    user: 'apikey',
    pass:  SENDGRID_SECRET_KEY,


}

var transporterAdmin = nodemailer.createTransport({
    // service: 'gmail',
    service: 'SendGrid',
    port: 465, // 587 or 25 or 2525
    // secure: true,
    auth: auth
});


const Helper = {

    sendEmail(email, subject, msg_body) {
        // email sending
        var mailOptions = {
            from: SENDGRID_EMAIL,
            to: email,
            subject: subject,
            html: msg_body
        };
        transporterAdmin.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    },



    async urlForStaticImage(req) {
        return req.protocol + '://' + req.get('host') + '/api/';
    },
    removeFile(filePath) {
        try {
            filePath = appRoot + filePath;
          


            if (fs.existsSync(filePath)) {

                try {
                    fs.unlinkSync(filePath);
                    console.log('File is deleted.')

                } catch (err) {
                    console.log("Could not delete the file. " + err)
                }



            }

        } catch (e) {
            console.log('error in remove file', e.message)
        }
    },

     jsonify(...args) {
        let indent = null;
        let separators = [",", ":"];
        
        if (current_app.config["JSONIFY_PRETTYPRINT_REGULAR"] || current_app.debug) {
          indent = 2;
          separators = [", ", ": "];
        }
        
        let data;
        
        if (args.length && Object.keys(args[0]).length === 0) {
          data = args[0];
        } else {
          data = args.length ? args[0] : args[1];
        }
        
        return new current_app.response_class(
          JSON.stringify(data, null, indent).concat("\n"),
          current_app.config["JSONIFY_MIMETYPE"]
        );
      }
      



}

module.exports = Helper;