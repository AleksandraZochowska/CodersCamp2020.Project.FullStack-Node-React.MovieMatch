const fs = require("fs");
const nodemailer = require('nodemailer');
const ejs = require("ejs");

class Mailer {

    constructor() {

        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.DOMAIN_EMAIL,
                pass: process.env.DOMAIN_EMAIL_PASS
            },
            requireTLS: true,
            tls: {
                rejectUnauthorized: false
            },
        });
    }
    
    sendEmail({name, token, recipient, template}) {

        return new Promise((resolve, reject) => {

            ejs.renderFile(__dirname + `/templates/${template}.ejs`, { name: name, token: token }, (error, renderedFile) => {

                if(error) reject(error);
                if(!renderedFile) resolve(false);

                const mailOptions = {
                    from: `"MovieMatch" <${process.env.DOMAIN_EMAIL}>`,
                    to: `${process.env.DEBUG_RECIPIENT || recipient}`,
                    subject: `MovieMatch | ${template === "resetpw" ? "Reset password"
                        : template === "register" ? "Confirm Registration"
                        : "Newsletter"}`,
                    html: renderedFile
                };
    
                this.transporter.sendMail(mailOptions, (err, info) => {
                    
                    if(err) reject(err);
                    if(!info) resolve(false);
                    resolve(info);
                });
            });
        });
    }
}

module.exports = Mailer;