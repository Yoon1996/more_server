const authGuard = (req, res, next) => {
    if(!req?.userInfo?.id){
        res.status(401).json({statusMessage: 'Unauthorization'})
        return
    } else {
        next()
    }
}

module.exports = {
    authGuard
}