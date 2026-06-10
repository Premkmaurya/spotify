const jwt = require("jsonwebtoken");
const _config = require("../../config/config");

const userValidate = (req, res, next) => {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, _config.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Token is not valid" });
    }
};

const artistValidate = (req, res, next) => {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, _config.JWT_SECRET);
        if (decoded.role !== "artist") {
            return res.status(403).json({ message: "Access denied" });
        }
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Token is not valid" });
    }
};

module.exports = {
    userValidate,
    artistValidate
}