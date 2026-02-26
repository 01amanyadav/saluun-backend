const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {

    try{

        const token = req.headers.authorization;

        if(!token){
            return res.status(401).json("No Token");
        }

        const verified = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = verified;

        next();

    }
    catch(err){

        return res.status(401).json("Invalid Token");

    }

};

module.exports = authMiddleware;