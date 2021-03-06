const UserModel = require("../../models/users/UserModel");
const FileModel = require("../../models/files/fileModel");
const Controller = require("../Controller");
const Joi = require("@hapi/joi");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const fileSchema = require("../../models/files/fileSchema");
const Mailer = require("../../helpers/Mailer");


class UserController extends Controller {
    constructor(req, res) {
        super(req, res);
        this.users = new UserModel();
        this.files = new FileModel();
        this.PW_MIN_LENGTH = 8;
        this.PW_MAX_LENGTH = 32;
        this.PW_REGEX = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,20})");
        this.ALLOWED_FILETYPES = ["image/png", "image/jpg", "image/png"];
        this.mailer = new Mailer();
        this.template = {
            RESET_PASSWORD: "resetpw",
            REGISTER: "register"
        }

    }

    async login() {

        // Validation:
        const loginSchema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().required()
        });

        const { error } = loginSchema.validate(this.body);
        if (error) return this.showError(400, "Please, provide correct email & password");

        const userModel = new UserModel();

        try {
            // Searching the db:
            const user = await userModel.findByEmail(this.body.email);
            if (!user) return this.showError(401);
            const usersProfile = (({ _id, email, name, displayedName }) => ({ _id, email, name, displayedName }))(user);

            // Check if user has been activated:
            if (!user.active) return this.showError(401, "User has not been activated");

            // Authorization:
            const token = await userModel.authorize(user, this.body.password);
            if (!token) return this.showError(401);
            return this.success({
                token: token,
                user: usersProfile
            });
        } catch (error) {
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
        if (error) return this.showError(400, error.details);

        try {
            const userModel = new UserModel();

            // Check if noone had previously registered with given email:
            const sameMailUser = await userModel.findByEmail(this.body.email);
            if (sameMailUser) return this.showError(400, "User with this email already exists");

            // Add user and hash:
            userModel.addUser(this.body.name, this.body.email, this.body.displayedName)
                .then(user => {
                    userModel.addHash(user._id, this.body.password)
                        .then(async () => {
                            // Create registration confirmation token:
                            const token = jwt.sign({ userId: user._id }, `${process.env.CONFIRM_KEY}`, { expiresIn: "2 days" });
                            if (!token) return this.showError(500);

                            // Send email for user to confirm registration:
                            const messageSent = await this.mailer.sendEmail({
                                recipient: user.email, name: user.name, token: token, template: this.template.REGISTER
                            });
                            if (!messageSent) this.showError(500, "Message couldn't have been sent");

                            return this.success({ message: `Registration email has been sent to ${this.body.email}` });
                        })
                        .catch(error => {

                            userModel.removeUserById(user._id)
                            return this.showError(500);
                        });
                })
                .catch(error => {

                    return this.showError(500);
                });

        } catch (error) {

            return this.showError(500);
        }
    }

    confirmRegistration() {

        // Verify the token:
        const registrationToken = this.params.registrationtoken;
        jwt.verify(registrationToken, process.env.CONFIRM_KEY, async (err, decodedToken) => {

            if (err || !decodedToken) return this.showError(401, "Wrong or expired token");
            const userModel = new UserModel();

            try {

                // Find user connected to the received registration token:
                const user = await userModel.findById(decodedToken.userId);
                if (!user) return this.showError(404, "User not found");

                // Update user's "active" flag:
                const active = await userModel.changeActivation(user._id, true);
                if (!active) return this.showError(500, "User could not have been activated");

                // Send success message:
                return this.success({ message: "Your account has been activated" });

            } catch (error) {

                return this.showError(500);
            }
        });
    }

    async forgotPassword() {

        // Validate reqest body:
        const forgotPasswordSchema = Joi.object({
            email: Joi.string().email().required(),
        });

        const { error } = forgotPasswordSchema.validate(this.body);
        if (error) return this.showError(400, "To create new password, you need to provide valid email");

        // Check if user with given email exists:
        const userModel = new UserModel();
        try {

            const user = await userModel.findByEmail(this.body.email);
            if (!user) return this.showError(400, "You never registered to MovieMatch or your account has already been deleted");

            // Create reset token:
            const token = jwt.sign({ userId: user._id }, `${process.env.RESET_PASSWORD_KEY}`, { expiresIn: "5m" });
            if (!token) return this.showError(500);

            // Add reset token to user:
            const updatedUser = await userModel.addToken(token);
            if (!updatedUser) return this.showError(500);

            // Send email with reset token:
            const messageSent = await this.mailer.sendEmail({
                recipient: this.body.email, name: user.name, token: token, template: this.template.RESET_PASSWORD
            });
            if (!messageSent) this.showError(500, "No message sent");

            return this.success({ message: `Email has been sent to ${this.body.email}` });

        } catch (error) {

            return this.showError(500);
        }
    }

    resetPassword() {

        // Validate reqest body:
        const resetPasswordSchema = Joi.object({
            newPassword: Joi.string().pattern(this.PW_REGEX).required()
        });

        const { error } = resetPasswordSchema.validate(this.body);
        if (error) return this.showError(400, "Provide valid new password: at least one small letter, one big letter, one digit & one special character");

        // Verify the token:
        const resetToken = this.params.resettoken;
        jwt.verify(resetToken, process.env.RESET_PASSWORD_KEY, async (err, decodedToken) => {

            if (err || !decodedToken) return this.showError(401, "Wrong or expired token");

            const userModel = new UserModel();

            try {
                // Check if user with sent resetToken exists:
                const user = await userModel.findByResetToken(resetToken);
                if (!user) return this.showError(401, "Invalid token");

                // Update user's password:
                const pwUpdated = await userModel.changeHash(user._id, this.body.newPassword);
                if (!pwUpdated) return this.showError(500, "Password could not have been updated");

                // Delete resetToken:
                const tokenDeleted = await userModel.deleteResetToken(user);
                if (!tokenDeleted) return this.showError(500, "Token issue"); //do zmiany na maila do admina

                // Send success message:
                return this.success({ message: "Your password has been updated" });

            } catch (error) {

                return this.showError(500);

            }
        });
    }

    async searchUser() {

        try {
            //return user data from token if no params:
            if(!this.query.displayedName && !this.query.email) {
                const user = await this.users.findById(this.req.userId);
                if(!user) return this.showError(400);
                
                const usersProfile = (({ _id, email, name, displayedName }) => ({ _id, email, name, displayedName }))(user);
                return this.success(usersProfile);
            }

            const user = await this.users.findAllUsers(this.query);
            const page = this.query.page || 1;
            const limit = this.query.limit || 10;

            if (this.query.displayedName || this.query.email) {

                const qKey = this.query.displayedName ? 'displayedName' : 'email';

                const filters = this.users.usersFilter(this.query);
                const filteredItemsList = this.users.searchUsersByFilter(filters, this.query);
                const filteredUsers = await this.users.findByFilter(qKey, this.query.displayedName, filteredItemsList);
                const results = this.users.paginationModel(page, limit, filteredUsers);
                const filteredUsersProfile = [];

                results['results'].forEach(user => {
                    const usersProfile = (({ _id, name, displayedName }) => ({ _id, name, displayedName }))(user);
                    filteredUsersProfile.push(usersProfile);
                })

                return this.success({ users: filteredUsersProfile });

            } else {

                const results = this.users.paginationModel(page, limit, user);
                const filteredUsersProfile = [];

                results['results'].forEach(user => {
                    const usersProfile = (({ _id, name, displayedName }) => ({ _id, name, displayedName }))(user);
                    filteredUsersProfile.push(usersProfile);
                })

                return this.success(filteredUsersProfile);
            }

        } catch (error) {
            return this.showError(500);
        }
    }

    async editPassword() {

        // Validate reqest body:
        const resetPasswordSchema = Joi.object({
            oldPassword: Joi.string().required(),
            newPassword: Joi.string().pattern(this.PW_REGEX).required(),
        });

        const { error } = resetPasswordSchema.validate(this.body);
        if (error) return this.showError(400, "Provide valid new password & repeat it");

        if (this.params.id !== this.req.userId) return this.showError(401, "You are not authorized to edit data on this account");

        const userModel = new UserModel();
        try {

            // Check if old password is correct:
            const pwCorrect = await userModel.checkHash(this.req.userId, this.body.oldPassword);
            if (!pwCorrect) return this.showError(401, "Old password incorrect");

            // Update user's password:
            const pwUpdated = await userModel.changeHash(this.req.userId, this.body.newPassword);
            if (!pwUpdated) return this.showError(500, "Password could not have been updated");

            // Send success message:
            return this.success({ message: "Your password has been updated" });

        } catch (error) {

            return this.showError(500);
        }
    }

    async deleteUser() {

        // Validate reqest body:
        const deleteUserSchema = Joi.object({
            password: Joi.string().required()
        });

        const { error } = deleteUserSchema.validate(this.body);
        if (error) return this.showError(400, "Please, provide password");

        const userModel = new UserModel();
        try {
            if (this.params.id !== this.req.userId) return this.showError(401, "You are not authorized to remove this account");

            // Check if password is correct:
            const pwCorrect = await userModel.checkHash(this.params.id, this.body.password);
            if (!pwCorrect) return this.showError(401, "Password incorrect");

            // Drop user & hash
            await userModel.removeUserById(this.params.id);
            await userModel.removeUserHashId(this.params.id);

            // Send success message:
            return this.success({ message: "Your account has been deleted" });

        } catch (error) {

            return this.showError(500);
        }
    }

    async editUserData() {

        // Validation:
        const editDataSchema = Joi.alternatives().try(
            Joi.object({
                name: Joi.string().required()
            }),
            Joi.object({
                displayedName: Joi.string().required()
            }),
            Joi.object({
                email: Joi.string().email().required()
            })
        );

        const { error } = editDataSchema.validate(this.body);
        if (error) return this.showError(400, "Validation error - provide required data in correct format");

        if (this.params.id !== this.req.userId) return this.showError(401, "You are not authorized to edit data on this account");

        const userModel = new UserModel();
        try {
            if (this.body.name) {

                // Change user's name
                const changeName = await userModel.changeUserName(this.req.userId, this.body.name);
                if (!changeName) return this.showError(404, "User not found, cannot update name");

                return this.success({ message: `Name changed to: ${this.body.name}` });
            }

            if (this.body.displayedName) {

                // Change user's displayed name
                const changeDisplayedName = await userModel.changeUserDisplayedName(this.req.userId, this.body.displayedName);
                if (!changeDisplayedName) return this.showError(404, "User not found, cannot update displayed name");

                return this.success({ message: `Displayed name changed to: ${this.body.displayedName}` });
            }

            if (this.body.email) {

                // Change user's email
                const changeEmail = await userModel.changeUserEmail(this.req.userId, this.body.email);
                if (!changeEmail) return this.showError(404, "User not found, cannot update email");

                return this.success({ message: `Email changed to: ${this.body.email}` });
            }

            return this.showError(400);

        } catch (error) {

            return this.showError(500);
        }
    }

    async getAvatar() {

        try {

            const user = await this.users.findById(this.params.userid);
            if (!user) return this.showError(404, "User not found");

            const fileEntry = await this.files.findByHash(user.avatar, user._id);
            if (!fileEntry) return this.showError(404, "Avatar not found");

            const savePath = path.join(process.cwd(), process.env.FILE_STORAGE, `${user._id}`, `${user.avatar}`);

            this.res.sendFile(savePath)

        } catch (error) {
            return this.showError(500, error);
        }
    }

    async setAvatar() {

        try {

            if (!this.req.files) return this.showError(400, "No file uploaded");

            const user = await this.users.findById(this.req.userId);
            if (!user) return this.showError(404, "User not found");

            const avatar = this.req.files.avatar;
            if (!avatar || !this.ALLOWED_FILETYPES.includes(avatar.mimetype)) return this.showError(400, "Wrong file format")

            const fileEntry = await this.files.addFile(avatar, user);
            const hash = fileEntry.hash;

            await this.users.changeAvatar(user._id, hash);

            const savePath = path.join(process.cwd(), process.env.FILE_STORAGE, `${user._id}`);
            if (!fs.existsSync(path.join(process.cwd(), process.env.FILE_STORAGE))) fs.mkdirSync(path.join(process.cwd(), process.env.FILE_STORAGE));
            if (!fs.existsSync(savePath)) fs.mkdirSync(savePath);
            avatar.mv(path.join(savePath, hash));

            console.log(user._id);

            return this.success({ success: "avatar added" });

        } catch (error) {

            return this.showError(500, error);
        }
    }
}

module.exports = UserController;
