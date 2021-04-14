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
            // Check if user is not inviting oneself:
            if(this.req.userId === this.params.friendid) return this.showError(400, "You cannot send yourself a friend request");

            // Find logged in user by id:
            const user = await this.userModel.findById(this.req.userId);
            if(!user) return this.showError(404, "User not found");
            // Find "friend" by id:
            const friend = await this.userModel.findById(this.params.friendid);
            if(!friend) return this.showError(404, "Invited user not found");
            
            // Check if user & the other person are not friends already:
            const alreadyFriends = await this.checkIfFriends(user, friend);
            if(alreadyFriends) return this.showError(409, "User is already friends with this person");

            // Check if user had already invited this person before:
            const alreadyInvited = await this.friendModel.findInvitation(user, friend);
            if(alreadyInvited) {
                
                // If status is pending:
                if(alreadyInvited.status === this.friendModel.invitationStatus.PENDING) return this.showError(409, "Friend already invited");
                
                // If invitation already existed before but it's not pending, change it's status & flag:
                const updatedInvitation = await this.friendModel.updateInvitation(this.friendModel.invitationStatus.PENDING, false);
                if(!updatedInvitation) return this.showError(500, "Cannot update. Try again later.");
                return this.success(`You have invited ${updatedInvitation.receiver.displayedName} to friends`);
            }

            // Check if user had already been invited by this person & status is pending:
            const alreadyBeenInvited = await this.friendModel.findInvitation(friend, user);
            if(alreadyBeenInvited && alreadyBeenInvited.status === this.friendModel.invitationStatus.PENDING) {
                return this.showError(409, "User had already been invited by this person");
            }

            // Create invitation document:
            const invitation = await this.friendModel.createInvitation(user, friend);
            if(!invitation) return this.showError(500, "Cannot create friend request right now. Try again later.");
            
            return this.success(`You have invited ${invitation.receiver.displayedName} to friends`);
            
        } catch(error) {
            return this.showError(500);
        }
    }
    
    async acceptInvitation() {
        try {
            // Find invitation:
            const invitation = await this.friendModel.findInvitationById(this.params.invitationid);
            if(invitation === "invalid") return this.showError(400, "Provide valid invitation ID"); 
            if(!invitation) return this.showError(404, "Invitation not found");
            
            // Check if user is permitted to accept the invitation (is the receiver)
            if(`${invitation.sender._id}` === this.req.userId) return this.showError(401, "You cannot accept an invitation you sent");
            if(`${invitation.receiver._id}` !== this.req.userId) return this.showError(401, "User did not receive such invitation");
            
            // Check if invitation hadn't already been resolved:
            if(invitation.resolved === true) return this.showError(409, "Invitation had already been accepted or declined");

            // Find logged in user by id:
            const user = await this.userModel.findById(this.req.userId);
            if(!user) return this.showError(404, "User not found");
            // Find invitation sender (friend wannabe) by id:
            const sender = await this.userModel.findById(invitation.sender._id);
            if(!sender) return this.showError(404, "Invited user not found");

            // Add users to each other's friends lists:
            const addedToFriends = await this.friendModel.addToFriends(user, sender);
            if(!addedToFriends) return this.showError(500, "Cannot add to friends. Try again later.");
            
            // Change status & "resolved" flag of invitation:
            const updatedInvitation = await this.friendModel.updateInvitation(this.friendModel.invitationStatus.ACCEPTED, true);
            if(!updatedInvitation) return this.showError(500, "Cannot update. Try again later.");

            return this.success(`Invitation from ${invitation.sender.displayedName} has been accepted`);

        } catch(error) {
            return this.showError(500);
        }
    }
    
    async declineInvitation() {
        try {
            // Find invitation:
            const invitation = await this.friendModel.findInvitationById(this.params.invitationid);
            if(invitation === "invalid") return this.showError(400, "Provide valid invitation ID"); 
            if(!invitation) return this.showError(404, "Invitation not found");
            
            // Check if user is permitted to decline the invitation (is the receiver)
            if(`${invitation.sender._id}` === this.req.userId) return this.showError(401, "You cannot decline an invitation you sent");
            if(`${invitation.receiver._id}` !== this.req.userId) return this.showError(401, "User did not receive such invitation");
            
            // Check if invitation hadn't already been resolved:
            if(invitation.resolved === true) return this.showError(409, "Invitation had already been accepted or declined");

            // Change status & "resolved" flag of invitation:
            const updatedInvitation = await this.friendModel.updateInvitation(this.friendModel.invitationStatus.DECLINED, true);
            if(!updatedInvitation) return this.showError(500, "Cannot update. Try again later.");

            return this.success(`Invitation from ${invitation.sender.displayedName} has been declined`);

        } catch(error) {
            return this.showError(500);
        }
    }

    async showFriendsProfile() {
        try {
            // Find logged in user by id:
            const user = await this.userModel.findById(this.req.userId);
            if(!user) return this.showError(404, "User not found");
            // Find friend by id:
            const friend = await this.userModel.findById(this.params.friendid);
            if(friend === "invalid") return this.showError(400, "Provide valid friend ID");
            if(!friend) return this.showError(404, "Friend not found");

            // If user searches own id:
            // if(`${friend.id}` === this.req.userId) return this.showError(400);

            // Check if user & the person whose profile they want to see are friends:
            const alreadyFriends = await this.checkIfFriends(user, friend);
            if(!alreadyFriends && `${friend.id}` !== this.req.userId) return this.showError(401, "You cannot see profile, you are not friends with this person.");

            const friendsProfile = (({ _id, name, displayedName }) => ({ _id, name, displayedName }))(friend);
            return this.success(friendsProfile);
            
        } catch(error) {
            return this.showError(500);
        }
    }
    
    checkIfFriends(user, friend) {
        return user.friends.some((el) => {
            return (`${el._id}` == `${friend._id}`);
        });
    }

    async showFriends() {

        try {

            const user = await this.userModel.findById(this.req.userId);
            const filters = this.userModel.usersFilter(this.query);
            const filteredItemsList  = this.userModel.searchUsersByFilter(filters, this.query);

            const page = this.query.page || 1;
            const limit = this.query.limit || 10;
             
            if(this.query.displayedName || this.query.name) { 

                const filteredFriends = user.friends.filter(friend => {
                    const friendName = this.query.displayedName ? friend.displayedName : friend.name;
                    return friendName.match(filteredItemsList[0]['$regex']);
                });

                const results = this.userModel.paginationModel(page, limit, filteredFriends);
                return this.success(results);

            } else {

                const userFriends = user.friends;
                const results = this.userModel.paginationModel(page, limit, userFriends);
                return this.success(results);
            }

        } catch(error) {
            return this.showError(500, error.message);
        }

    }
}

module.exports = FriendController;
