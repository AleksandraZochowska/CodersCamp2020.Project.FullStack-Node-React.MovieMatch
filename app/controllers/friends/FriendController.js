const Controller = require("../Controller");
const UserModel = require('../../models/users/UserModel');
const FriendModel = require('../../models/friends/FriendModel');

class FriendController extends Controller {
    constructor(req, res) {
        super(req, res);
        this.userModel = new UserModel();
        this.friendModel = new FriendModel();
    }

    async sendInvitation() {
        try {
            // Find logged in user by id:
            const user = await this.userModel.findById(this.req.userId);
            if(!user) return this.showError(404, "User not found");
            
            // Find "friend" by id:
            const friend = await this.userModel.findById(this.params.friendid);
            if(!friend) return this.showError(404, "Invited user not found");

            // Check if invitation hadn't been already created:
            const alreadyInvited = await this.friendModel.findInvitation(user, friend);
            if(alreadyInvited) return this.showError(409, "Friend already invited");
            
            // Create invitation document:
            const invitation = await this.friendModel.createInvitation(user, friend);
            if(!invitation) return this.showError(500, "Cannot create friend request right now. Try again later.");

            return this.success(invitation);
        
        } catch(error) {
            return this.showError(500, error.message);
        }
    }
}

module.exports = FriendController;
