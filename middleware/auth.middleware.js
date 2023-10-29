const { tokenValidation } = require("../util/auth.util")

const authMiddleware = (req, res, next) => {
  try {
    if (!req?.headers?.authorization) throw 'Unauthorized'

    const tokenList = req.headers.authorization.split(' ')

    if (tokenList.length < 1) throw 'Unauthorized'

    const token = tokenList[1]
    const userInfo = tokenValidation(token)

    req.userInfo = userInfo


  } catch (error) {
    console.log('error: ', error);
  } finally {
    next()
  }
}

module.exports = {
  authMiddleware
}