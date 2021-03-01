class Controller {
  
    constructor(req, res) {
        this.req = req;
        this.res = res;
        this.body = req.body;

    }

    showError(code, message) {

        return this.res.status(code).json({ "Error Message": message ? message : this.errorMessage(code) });
    }

    errorMessage(code) {

        switch(code) {
            case 301:
                return "Moved Permanently";
            case 400:
                return "Bad Request";
            case 401:
                return "Unauthorized";
            case 404:
                return "Not Found";
            case 410:
                return "Gone";
            case 500:
                return "Internal Server Error";
            case 502:
                return "Bad Gateway";
            default:
                return "Internal Server Error";
        }
    }
}

module.exports = Controller;