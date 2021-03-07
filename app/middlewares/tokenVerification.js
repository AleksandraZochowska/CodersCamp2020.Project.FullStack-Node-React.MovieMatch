const jwt = require('jsonwebtoken');

const tokenVerification = (req, res, next) => {

    const token = req.headers.authtoken;
    
    try {
        const decoded = jwt.verify(token, process.env.PRIVATE_KEY);
        if(!decoded.userId) return res.status(500).json({message: "Token error"});
        req.userId = decoded.userId;
        next();
    } catch(error) {
        return res.status(401).json({message: "Access denied, wrong or expired token"});
    }

}

module.exports = tokenVerification;