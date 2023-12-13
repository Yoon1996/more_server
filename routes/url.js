var express = require('express');
var router = express.Router();

router.post("/send-url", async (req, res) => {
    const urlImg = req.body;
    console.log(req.body)

    try {
        res.json("dddddd")
    }
    catch (err) {
        console.log('err: ', err);

    }
})


module.exports = router;
