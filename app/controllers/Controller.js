class Controller {
  
    constructor(req, res) {
        this.req = req;
        this.res = res;
        this.body = req.body;
        this.params = req.params;
        this.query = req.query;
    }

    success(message) {

        return this.res.status(200).json(message);
    }

    showError(code, message) {

        return this.res.status(code).json({ error: message ? message : this.errorMessage(code) });
    }

    errorMessage(code) {

        switch(code) {
            case 400:
                return "Bad Request";
            case 401:
                return "Unauthorized";
            case 404:
                return "Not Found";
            case 500:
                return "Internal Server Error";
            default:
                return "Internal Server Error";
        }
    }
}

module.exports = Controller;