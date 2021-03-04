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
        this.PW_REGEX = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,20})");
    }

    async login() {

        // Validation:
        const loginSchema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().pattern(this.PW_REGEX).required()
        });

        const { error } = loginSchema.validate(this.body);
        if(error) return this.showError(400, "Please, provide correct email & password");

        // Searching the db:
        const userModel = new UserModel();
        const user = await userModel.findByEmail(this.body.email);

        if(!user) return this.showError(401);

        // Authorization:
        const token = await userModel.authorize(user, this.body.password);
        if(!token) return this.showError(401);

        return this.res.status(200).json({
            user: user,
            token: token
        });
    }

    async register() {

        // Validation:
        const registerSchema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().pattern(this.PW_REGEX).required(),
            name: Joi.string().min(2).max(20),
            displayedName: Joi.string().min(2).max(20)
        });

        const { error } = registerSchema.validate(this.body);
        if(error) return this.showError(400, error.details);

        const sameMailUser = await this.users.findByEmail(this.body.email);
        if(sameMailUser) return this.showError(400, "User with this email already exists");

        // Add user and hash:
        this.users.addUser(this.body.name, this.body.email, this.body.displayedName)
            .then(user => {
                this.users.addHash(user._id, this.body.password)
                    .then(() => {
                        return this.res.status(201).json({
                            status: "User created",
                            user: user
                        });
                    })
                    .catch(error => {
                        this.users.removeById(user._id)
                        return this.showError(500, error);
                    });
            })
            .catch(error => {
                return this.showError(500, error);
            });
    }

    async forgotPassword() {

        // Validate reqest body:
        const forgotPasswordSchema = Joi.object({
            email: Joi.string().email().required(),
        });

        const { error } = forgotPasswordSchema.validate(this.body);
        if(error) return this.showError(400, "To create new password, you need to provide valid email");
        
        // Check if user with given email exists:
        const userModel = new UserModel();
        const user = await userModel.findByEmail(this.body.email);
        if(!user) return this.showError(400, "You never registered to MovieMatch");
        
        // Create reset token:
        const token = jwt.sign({userId: user._id}, `${process.env.RESET_PASSWORD_KEY}`, { expiresIn: "5m" });
        if(!token) return this.showError(500);
        
        // Add reset token to user:
        const updatedUser = await userModel.addToken(token);
        if(!updatedUser) return this.showError(500);
        
        // Return token:
        return this.res.status(200).json({
            resetToken: token
        });

    }

    resetPassword() {
        
        // Validate reqest body:
        const resetPasswordSchema = Joi.object({
            newPassword: Joi.string().required(),
            repeatNewPassword: Joi.string().valid(Joi.ref('newPassword')).required()
        });

        const { error } = resetPasswordSchema.validate(this.body);
        if(error) return this.showError(400, "Provide valid new password");

        // Verify the token:
        const resetToken = this.req.headers.resettoken;
        jwt.verify(resetToken, process.env.RESET_PASSWORD_KEY, async (err, decodedToken) => {
            
            if(err || !decodedToken) return this.showError(401, "Wrong or expired token");

            // Check if user with sent resetToken exists:
            const userModel = new UserModel();
            const user = await userModel.findByResetToken(resetToken);
    
            if(!user) return this.showError(401, "No user with given token");
            
            // Update user's password:
            const pwUpdated = await userModel.changeHash(user, this.body.newPassword);
            if(!pwUpdated) return this.showError(500, "Password could not have been updated");
            
            // Delete resetToken:
            const tokenDeleted = await userModel.deleteResetToken(user);
            if(!tokenDeleted) return this.showError(500, "Token issue");

            // Send success message:
            return this.res.status(200).json({
                message: "Your password has been updated"
            });
        });
    }
}

module.exports = UserController;