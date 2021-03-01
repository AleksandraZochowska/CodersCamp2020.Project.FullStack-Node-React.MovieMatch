class Controller {
    constructor(req, res) {
        this.req = req;
        this.res = res;
        this.body = req.body;
    }
}

module.exports = Controller;