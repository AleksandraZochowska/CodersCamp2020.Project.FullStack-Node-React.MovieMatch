const supertest = require("supertest");
// const mongoose = require('mongoose');
const userModel = require("../app/models/users/UserModel")
const Server = require("../server");

const dbName = "testDB";
const server = new Server(dbName);

const request = supertest(server.app);

const users = new userModel();
const newUser = {
    email: "tester@example.com",
    name: "tester",
    displayedName: "tester",
    password: "Tester123*",
}


afterAll(done => {
    
    server.mongoConnection.connection.db.dropDatabase((err, result) => {
        if(err) throw new Error(err);
        console.log(result);
        server.close();
        done();
    }); 
})

describe('User', () => {

    it("registers", async done => {

        const res = await request.post("/api/users/register")
        .send({
            email: newUser.email,
            name: newUser.name,
            displayedName: newUser.displayedName,
            password: newUser.password
        });

        expect(res.statusCode).toBe(200);

        done();
    });

    it("cant register again", async done => {

        const res = await request.post("/api/users/register")
        .send({
            email: newUser.email,
            name: newUser.name,
            displayedName: newUser.displayedName,
            password: newUser.password
        });

        expect(res.statusCode).toBe(400);

        done();
    });

    it("cannot log in prior to activation", async done => {

        const res = await request.post("/api/users/login")
        .send({
            email: newUser.email,
            password: newUser.password
        });

        expect(res.statusCode).toBe(401);

        done();
    });

    it("can log in after activation is complete", async done => {

        //activation is done by email, this is simple workaround:
        const user = await users.findByEmail(newUser.email);
        await users.changeActivation(user._id, true);

        const res = await request.post("/api/users/login")
        .send({
            email: newUser.email,
            password: newUser.password
        });

        expect(res.statusCode).toBe(200);

        done();
    });
});