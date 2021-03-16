const supertest = require("supertest");
const Server = require("../server");

const connectionString = process.env.TEST_DB_STRING;

console.log(connectionString);
const server = new Server(connectionString);

const request = supertest(server.app);
describe('Our user', () => {

    it("creates", async done => {

        // const res = await request.post("/api/users/register")
        // .send({
        //     email: "victor@example.com",
        //     name: "Victor",
        //     displayedName: "xXxMonser_SlayerxXx",
        //     password: "Victor123*"
        // });

        const res = await request.get("/api/users");

        console.log(res);

        done();
    });
});