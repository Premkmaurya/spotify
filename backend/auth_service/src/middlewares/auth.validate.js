const jwt = require("jsonwebtoken");
const _config = require("../config/config");

const authValidate = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }
    try {
        const decoded = jwt.verify(token, _config.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        res.status(401).json({ message: "Token is not valid" });
    }
};

module.exports = authValidate;