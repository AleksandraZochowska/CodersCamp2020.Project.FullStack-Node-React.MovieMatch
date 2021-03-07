const UserModel = require("../../models/users/UserModel");
const Controller = require("../Controller");
const Joi = require("@hapi/joi");
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
            password: Joi.string().required()
        });

        const { error } = loginSchema.validate(this.body);
        if(error) return this.showError(400, "Please, provide correct email & password");

        const userModel = new UserModel();
        
        try {
            // Searching the db:
            const user = await userModel.findByEmail(this.body.email);
            if(!user) return this.showError(401);

            // Authorization:
            const token = await userModel.authorize(user, this.body.password);
            if(!token) return this.showError(401);
            return this.success({
                user: user,
                token: token
            });
        } catch(error) {
            return this.showError(500, "Error");
        }
    }

    async register() {

        // Validation:
        const registerSchema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().pattern(this.PW_REGEX).required(),
            name: Joi.string().min(2).max(20).required(),
            displayedName: Joi.string().min(2).max(20).required()
        });

        const { error } = registerSchema.validate(this.body);
        if(error) return this.showError(400, error.details);

        try {

            const sameMailUser = await this.users.findByEmail(this.body.email);
            if(sameMailUser) return this.showError(400, "User with this email already exists");

        } catch(error) {

            return this.showError(500);
        }
        
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
                        this.users.removeUserById(user._id)
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
        try {

            const user = await userModel.findByEmail(this.body.email);
            if(!user) return this.showError(400, "You never registered to MovieMatch");
            
            // Create reset token:
            const token = jwt.sign({userId: user._id}, `${process.env.RESET_PASSWORD_KEY}`, { expiresIn: "5m" });
            if(!token) return this.showError(500);
            
            // Add reset token to user:
            const updatedUser = await userModel.addToken(token);
            if(!updatedUser) return this.showError(500);
            
            // Return token:
            return this.success({ resetToken: token });

        } catch(error) {

            return this.showError(500);

        }

    }

    resetPassword() {
        
        // Validate reqest body:
        const resetPasswordSchema = Joi.object({
            newPassword: Joi.string().pattern(this.PW_REGEX).required(),
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

            try {
                
                const user = await userModel.findByResetToken(resetToken);
        
                if(!user) return this.showError(401, "Invalid token");
                
                // Update user's password:
                const pwUpdated = await userModel.changeHash(user._id, this.body.newPassword);
                if(!pwUpdated) return this.showError(500, "Password could not have been updated");
                
                // Delete resetToken:
                const tokenDeleted = await userModel.deleteResetToken(user);
                if(!tokenDeleted) return this.showError(500, "Token issue"); //do zmiany na maila do admina
                
                // Send success message:
                return this.success({ message: "Your password has been updated" });

            } catch(error) {

                return this.showError(500);

            }
        });
    }

    async searchUser() {

        // Validation:
        const searchUserSchema = Joi.alternatives().try(
            Joi.object({
                displayedName: Joi.string().required()
            }),
            Joi.object({
                email: Joi.string().email().required()
            })
        );

        const { error } = searchUserSchema.validate(this.body);
        if(error) return this.showError(400, "Please, provide one of two: email or displayedName");

        const userModel = new UserModel();
        
        try {

            if(this.body.email) {
                const user = await userModel.findByEmail(this.body.email);
                if(!user) return this.showError(400, "User with the specified email does not exist!");
                return this.success({
                    user: user
                });
            }

            if(this.body.displayedName) {
                const user = await userModel.findByDisplayedName(this.body.displayedName);
                if(!user) return this.showError(400, "User with the specified displayedName does not exist!");
                return this.success({
                    user: user
                });
            }

        } catch(error) {
            return this.showError(500, "Error");
        }
    }

    async editPassword() {

        // Validate reqest body:
        const resetPasswordSchema = Joi.object({
            oldPassword: Joi.string().required(),
            newPassword: Joi.string().pattern(this.PW_REGEX).required(),
            repeatNewPassword: Joi.string().valid(Joi.ref('newPassword')).required()
        });

        const { error } = resetPasswordSchema.validate(this.body);
        if(error) return this.showError(400, "Provide valid new password");

        const userModel = new UserModel();
        try {
            
            // Check if old password is correct:
            const pwCorrect = await userModel.checkHash(this.req.userId, this.body.oldPassword);
            if(!pwCorrect) return this.showError(401, "Old password incorrect");

            // Update user's password:
            const pwUpdated = await userModel.changeHash(this.req.userId, this.body.newPassword);
            if(!pwUpdated) return this.showError(500, "Password could not have been updated");
            
            // Send success message:
            return this.success({ message: "Your password has been updated" });

        } catch(error) {

            return this.showError(500);
        }
    }

    async editUserData() {

        // Validation:
        const editDataSchema = Joi.alternatives().try(
            Joi.object({
                newName: Joi.string().required()
            }),
            Joi.object({
                newDisplayedName: Joi.string().required()
            }),
            Joi.object({
                password: Joi.string().required(),
                newEmail: Joi.string().email().required()
            })
        );

        const { error } = editDataSchema.validate(this.body);
        if(error) return this.showError(400, "Validation error - provide required data in correct format");
        
        const userModel = new UserModel();
        try {
            
            if(this.body.newName) {

                // Change user's name
                const changeName = await userModel.changeUserName(this.req.userId, this.body.newName);
                if(!changeName) return this.showError(404, "User not found, cannot update name");
                
                return this.success({ message: `Name changed to: ${this.body.newName}` });
            }
            
            if(this.body.newDisplayedName) {

                // Change user's displayed name
                const changeDisplayedName = await userModel.changeUserDisplayedName(this.req.userId, this.body.newDisplayedName);
                if(!changeDisplayedName) return this.showError(404, "User not found, cannot update displayed name");

                return this.success({ message: `Displayed name changed to: ${this.body.newDisplayedName}` });
            }
            
            if(this.body.newEmail) {

                if (!this.body.password) return this.showError(401, "Provide password to change account email");

                // Check if given password is correct:
                const pwCorrect = await userModel.checkHash(this.req.userId, this.body.password);
                if(!pwCorrect) return this.showError(401, "Password incorrect");

                // Change user's email
                const changeEmail = await userModel.changeUserEmail(this.req.userId, this.body.newEmail);
                if(!changeEmail) return this.showError(404, "User not found, cannot update email");

                return this.success({ message: `Email changed to: ${this.body.newEmail}` });
            }

            return this.showError(400);

        } catch(error) {

            return this.showError(500);
        }
    }
}

module.exports = UserController;