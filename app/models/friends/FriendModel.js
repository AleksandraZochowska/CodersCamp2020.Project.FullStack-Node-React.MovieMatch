const mongoose = require('mongoose');
const invitationSchema = require("./invitationSchema");
const userSchema = require("../users/userSchema");

class FriendModel {

    constructor() {
        this.Invitation = mongoose.model("Invitation", invitationSchema);
        this.invitationStatus = {
            PENDING: 'pending', 
            ACCEPTED: 'accepted', 
            DECLINED: 'declined'
        }
        this.invitation;
    }

    createInvitation(sender, receiver) {
        return new Promise((resolve, reject) => {

            const invitation = new this.Invitation({
                sender: {
                    _id: sender._id,
                    name: sender.name,
                    displayedName: sender.displayedName
                },
                receiver: {
                    _id: receiver._id,
                    name: receiver.name,
                    displayedName: receiver.displayedName
                },
                status: this.invitationStatus.PENDING,
                resolved: false
            });

            invitation.save()
            .then((invitation) => {
                resolve(invitation);
            })
            .catch((error) => {
                reject(error);
            });
        });
    }

    findInvitation(sender, receiver) {

        return new Promise((resolve, reject) => {

            this.Invitation.findOne({"sender._id": sender._id, "receiver._id": receiver._id}, (error, invitation) => {
                if(error) reject(error);
                this.invitation = invitation;
                resolve(invitation);
            });

        });
    }

    findInvitationById(id) {

        return new Promise((resolve, reject) => {

            if(!mongoose.Types.ObjectId.isValid(id)) resolve("invalid");

            this.Invitation.findById(id, (error, invitation) => {
                if(error) return reject(error);
                this.invitation = invitation;
                resolve(invitation);
            });
        });
    }

    updateInvitation(status, resolved) {
        
        return new Promise((resolve, reject) => {

            this.invitation.status = status;
            this.invitation.resolved = resolved;
            
            this.invitation.save((err, savedInvitation) => {
                if(err) reject(err);
                resolve(savedInvitation);
            });
        });
    }

    addToFriends(user, friend) {

        return new Promise((resolve, reject) => {

            const userCard = {
                _id: user._id,
                name: user.name,
                displayedName: user.displayedName
            };
            const friendCard = {
                _id: friend._id,
                name: friend.name,
                displayedName: friend.displayedName
            };
            
            user.friends.push(friendCard);
            friend.friends.push(userCard);

            user.save((err, savedUser) => {
                if(err) reject(err);
                if(!savedUser) resolve(savedUser);
                
                friend.save((error, savedFriend) => {
                    // const uIndex = user.friends.indexOf(friendCard);
                    // const fIndex = friend.friends.indexOf(userCard);
                    // if(error || !savedFriend) {
                    //     if (uIndex !== -1) user.friends.splice(uindex, 1);
                    //     if (fIndex !== -1) friend.friends.splice(findex, 1);
                    // }
                    if(error) reject(error);
                    // TODO: remove friendCard from user.friends if there was an error!
                    if(!savedFriend) resolve(savedFriend);
                    resolve({
                        "usersNewFriend": savedUser.friends[savedUser.friends.length - 1],
                        "friendsNewFriend": savedFriend.friends[savedFriend.friends.length -1]
                    });
                });
            });
        });
    }

}

module.exports = FriendModel;
