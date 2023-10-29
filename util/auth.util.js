const jwt = require("jsonwebtoken")
const { jwtSecret } = require("../config/jwt.config")

const tokenSign = (userInfo) => {
    return jwt.sign(userInfo, jwtSecret, {
        expiresIn: '3d'
        // expiresIn: '1s'
    })
}

//토큰 검증
const tokenValidation = (token) => {
    return jwt.verify(token, jwtSecret)
}

module.exports = {
    tokenSign,
    tokenValidation
}