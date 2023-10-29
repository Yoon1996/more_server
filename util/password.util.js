//crypto 사용
// const crypto = require("crypto");

// const getHash = (password) => {
//     return crypto.createHash("sha512").update(password).digest("base64");

// }

// const salt = crypto.randomBytes(16).toString('hex');
//솔트 생성

// const passwordCheck = (hashedPassword, password) => {
//     return crypto.check
// }

// 8/20 becrypt 사용 
const bcrypt = require('bcrypt');

//hash password 생성
const getHash =  (password) => {
    return bcrypt.hashSync(password, 12);
}

//원래 비밀번호와 hash 처리된 비밀번호
const compare = (originPassword, hashedPassword) => {
    return bcrypt.compareSync(originPassword, hashedPassword);
}
module.exports ={
    getHash, compare
}