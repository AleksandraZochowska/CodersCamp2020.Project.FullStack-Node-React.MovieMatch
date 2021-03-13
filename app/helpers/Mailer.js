const fs = require("fs");
const nodemailer = require('nodemailer');
const ejs = require("ejs");

class Mailer {

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: process.env.DOMAIN_EMAIL,
                pass: process.env.DOMAIN_EMAIL_PASS
            }
        });
    }
    
    sendEmail({name, token, recipient, template}) {

        return new Promise((resolve, reject) => {

            ejs.renderFile(__dirname + `/templates/${template}.ejs`, { name: name, token: token }, (err, renderedFile) => {

                if(err) reject(error);
                if(!renderedFile) resolve(false);

                let mailOptions = {
                    from: `"MovieMatch" <${process.env.DOMAIN_EMAIL}>`,
                    to: `${recipient}`,
                    subject: `MovieMatch | ${template === "resetpw" ? "Reset password"
                        : template === "register" ? "Confirm Registration"
                        : "Newsletter"}`,
                    html: renderedFile
                };
    
                this.transporter.sendMail(mailOptions, (error, info) => {
                    
                    if(error) reject(error);
                    if(!info) resolve(false);
                    resolve(info);
                });
            });
        });
    }
}

module.exports = Mailer;