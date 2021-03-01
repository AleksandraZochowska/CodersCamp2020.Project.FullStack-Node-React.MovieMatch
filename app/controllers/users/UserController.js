const StatusCodes = require("http-status-codes").StatusCodes;
const Controller = require("../Controller");
const UserModel = require("../../models/users/UserModel")

class UserController extends Controller {
    constructor(req, res) {
        super(req, res);
        this.users = new UserModel();

        this.PW_MIN_LENGTH = 8;
        this.PW_MAX_LENGTH = 32;
    }

    login() {
        
    }

    async register() {

        const userData = {...this.req.body};

        let error;
        (this.body.password.length < this.PW_MIN_LENGTH) ? error = "short" : (this.body.password.length > this.PW_MAX_LENGTH) ? error = "long" : error = false;
        if(error) {
            return this.res.status(StatusCodes.BAD_REQUEST).json({
                        error: "Password too " + error
                    });
        } 

        const sameMailUsers = await this.users.findByEmail(this.body.email);
        if(sameMailUsers.length > 0) {
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