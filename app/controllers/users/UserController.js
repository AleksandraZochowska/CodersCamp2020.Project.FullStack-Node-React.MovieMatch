const UserModel = require("../../models/users/UserModel");
const Controller = require("../Controller");
const Joi = require("@hapi/joi");

class UserController extends Controller {
    constructor(req, res) {
        super(req, res);
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
}

module.exports = UserController;