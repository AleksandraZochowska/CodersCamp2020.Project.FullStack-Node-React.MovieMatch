const mongoose = require('mongoose');
const invitationSchema = require("./invitationSchema");


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

    createInvitation(user, friend) {
        return new Promise((resolve, reject) => {

            const invitation = new this.Invitation({
                sender: {
                    _id: user._id,
                    name: user.name,
                    displayedName: user.displayedName
                },
                reciver: {
                    _id: friend._id,
                    name: friend.name,
                    displayedName: friend.displayedName
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

    findInvitation(user, friend) {
        return new Promise((resolve, reject) => {

            this.Invitation.findOne({"sender._id": user._id, "reciver._id": friend._id}, (error, invitation) => {
                if(error) reject(error);
                this.invitation = invitation;
                resolve(invitation);
            });

        });
    }
}

module.exports = FriendModel;
