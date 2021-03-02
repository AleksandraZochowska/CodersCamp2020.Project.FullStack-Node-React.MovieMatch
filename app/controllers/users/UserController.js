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

    }

    async login() {

        // Validation
        const loginSchema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required()
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

        if(!this.body.email){
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
}

module.exports = UserController;