var express = require("express");
var router = express.Router();

router.get('/', (req, res) => {
    req.userInfo
    console.log('req.userInfo: ', req.userInfo);
    res.json({message: 'good'})
})

module.exports = router;
