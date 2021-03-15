const supertest = require("supertest");
const Server = require("../server");
const server = new Server();

const request = supertest(server.app);
describe('Our user', () => {

    it("works", async done => {

        const res = await request.get("/api/users");
        console.log(res);

        done();
    });
});