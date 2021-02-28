const StatusCodes = require("http-status-codes").StatusCodes;
const Controller = require("../Controller");
const UserModel = require("../../models/users/UserModel")

class UserController extends Controller {
    constructor(req, res) {
        super(req, res);
        this.users = new UserModel();
    }

    login() {
        
    }

    async register() {
        const userData = {...this.req.body};

        const sameMailUser = await this.users.findByEmail(userData.email);
        if(sameMailUser.length > 0) {
            return this.res.status(StatusCodes.CONFLICT).json({
                error: "User with this email already exists"
            });
        }

        const userId = this.users.addUser(userData.name, userData.email, userData.password, userData.displayedName);
        this.res.status(StatusCodes.CREATED).json({
            status: "User created",
            id: userId
        });
    }
}

module.exports = UserController;