const jwt = require("jsonwebtoken");

const generateRefreshToken= (id) =>{
    return jwt.sign({id},"mysecrete",{expiresIn:"1d"})
}

module.exports= {generateRefreshToken}
