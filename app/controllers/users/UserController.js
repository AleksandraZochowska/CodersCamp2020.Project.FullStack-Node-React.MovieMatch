const UserModel = require("../../models/users/UserModel");
const Controller = require("../Controller");
const Joi = require("@hapi/joi");
const StatusCodes = require("http-status-codes").StatusCodes;

class UserController extends Controller {
    constructor(req, res) {
        super(req, res);
        this.users = new UserModel();
        this.PW_MIN_LENGTH = 8;
        this.PW_MAX_LENGTH = 32;
        this.PW_REGEX = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,20})");
    }

    async login() {

        // Validation
        const loginSchema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().pattern(this.PW_REGEX).required()
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

        //Validation
        const registerSchema = Joi.object({
            email: Joi.string()
                .email()
                .required(),
            password: Joi.string()
                .pattern(this.PW_REGEX)
                .required(),
            name: Joi.string()
                .min(2)
                .max(20),
            displayedName: Joi.string()
                .min(2)
                .max(20)
        });

        const { error } = registerSchema.validate(this.body);
        if(error) return this.showError(400, error.details);

        const sameMailUser = await this.users.findByEmail(this.body.email);
        if(sameMailUser) return this.showError(400, "User with this email already exists");

        //Add user and hash
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
}

module.exports = UserController;