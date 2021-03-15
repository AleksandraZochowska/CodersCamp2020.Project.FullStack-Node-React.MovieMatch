const mongoose = require('mongoose');
const { nanoid } = require("nanoid");
const fileSchema = require("./fileSchema");

class fileModel {

    constructor() {
        this.File = mongoose.model("File", fileSchema);
    }

    addFile(file, userId) {

            return new Promise((resolve, reject) => {

                const newFile = new this.File({
                    type: file.mimetype,
                    name: file.name,
                    hash: nanoid(),
                    userId: userId

                });
                newFile.save()
                    .then((file) => {
                        resolve(file);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            });
    }

    findById(fileId) {
        
        return new Promise((resolve, reject) => {

            this.File.findById(fileId, (error, file) => {

                if(error) reject(error);
                resolve(file);
            });
        });
    }

    findByHash(hash, userId) {
        
        return new Promise((resolve, reject) => {

            this.File.findOne({userId: userId, hash: hash}, (error, file) => {
                if(error) reject(error);
                resolve(file);
            });
        });
    }
}

module.exports = fileModel