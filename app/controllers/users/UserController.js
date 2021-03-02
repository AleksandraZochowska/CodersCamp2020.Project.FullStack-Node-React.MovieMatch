const UserModel = require("../../models/users/UserModel");
const Controller = require("../Controller");
const Joi = require("@hapi/joi");
const StatusCodes = require("http-status-codes").StatusCodes;
const jwt = require('jsonwebtoken');

class UserController extends Controller {
    constructor(req, res) {
        super(req, res);
        this.users = new UserModel();
        this.PW_MIN_LENGTH = 8;
        this.PW_MAX_LENGTH = 32;

    }

    async login() {

        // Validation
        const loginSchema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().required()
        });

        const { error } = loginSchema.validate(this.body);
        if(error) return this.showError(400, error.details);

        // Searching the db
        const userModel = new UserModel();
        const user = await userModel.findByEmail(this.body.email);

        if(!user) return this.showError(401);

        // Authorization
        const token = await userModel.authorize(user, this.body.password);
        if(!token) return this.showError(401);

        return this.res.status(200).json({
            user: user,
            token: token
        });
    }

    async register() {

        if(!this.body.name){
            return this.res.status(StatusCodes.BAD_REQUEST).json({
                error: "Name not provided"
            });
        }

        if(!this.body.mail){
            return this.res.status(StatusCodes.BAD_REQUEST).json({
                error: "Email adress not provided"
            });
        }

        if(!this.body.password){
            return this.res.status(StatusCodes.BAD_REQUEST).json({
                error: "Password not provided"
            });
        }

        if(!this.body.displayedName){
            return this.res.status(StatusCodes.BAD_REQUEST).json({
                error: "Displayed Name not provided"
            });
        }

        this.body.email = this.body.email.trim().toLowerCase();

        let error;
        (this.body.password.length < this.PW_MIN_LENGTH) ? error = "short" : (this.body.password.length > this.PW_MAX_LENGTH) ? error = "long" : error = false;
        if(error) {
            return this.res.status(StatusCodes.BAD_REQUEST).json({
                error: "Password too " + error
            });
        } 

        const sameMailUsers = await this.users.findByEmail(this.body.email);
        if(sameMailUsers) {
            return this.res.status(StatusCodes.CONFLICT).json({
                error: "User with this email already exists"
            });
        }

        let userId;

        try {
            userId = await this.users.addUser(this.body.name, this.body.email, this.body.password, this.body.displayedName);
        } catch(error) {
            return this.res.status(StatusCodes.BAD_REQUEST).json({
                error: error
            });
        }

        this.res.status(StatusCodes.CREATED).json({
            status: "User created",
            id: userId
        });
    }

    async forgotPassword() {

        // Validate reqest body
        const forgotPasswordSchema = Joi.object({
            email: Joi.string().email().required(),
        });

        const { error } = forgotPasswordSchema.validate(this.body);
        if(error) return this.showError(400, error.details);
        
        // Check if user with given email exists
        const userModel = new UserModel();
        const user = await userModel.findByEmail(this.body.email);
        if(!user) return this.showError(400);
        
        // create token & data to be send via email:
        const token = jwt.sign({userId: user._id}, `${process.env.RESET_PASSWORD_KEY}`, { expiresIn: "20m" });
        if(!token) return this.showError(500);
        
        const data = {
            from: process.env.DOMAIN_EMAIL,
            to: this.body.email,
            subject: "Movie Match | Forgot Password - Reset Link",
            html: `
            <h1>To reset password, copy the link below into the browser</h1>
            <p>${process.env.CLIENT_URL}/resetpassword/${token}</p>
            `
        }
        
        // add reset token to user:
        
        const update = await userModel.addToken(token);
        if(!update) return this.showError(401);
        
        // send message to user: wydzielić osobny kontroler do wysyłania maili
        
        mg.messages().send(data, (error, result) => {
            if(error || !result) return this.showError(401);
            return this.res.status(200).json("message": "Resetting email has been sent to you.")
        });

    }

    resetPassword() {
        
        // Validate reqest body:
        const resetPasswordSchema = Joi.object({
            newPassword: Joi.string().required(),
            repeatNewPassword: Joi.string().valid(Joi.ref('newPassword')).required()
        });

        const { error } = resetPasswordSchema.validate(this.body);
        if(error) return this.showError(400, error.details);

        // Verify the token:
        
        jwt.verify(this.req.params.resetPasswordToken, process.env.RESET_PASSWORD_KEY, (err, decodedToken) => {
            
            if(err || !decodedToken) return this.showError(401, "Wrong or expired token");

            // Check if user with sent resetToken exists:
        
            const userModel = new UserModel();
            const user = await userModel.findByResetToken(decodedToken);
    
            if(!user) return this.showError(400);

            // Here token is valid & there is a user which it belongs to. We can update users password:
            
            // usunąć klucz z tokenem z usera

            //...

            return this.res.status(200).json({
                message: "Your password has been updated"
            });
        });
        
    }
}

module.exports = UserController;