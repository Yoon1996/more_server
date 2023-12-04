var express = require('express');
const Bookmark = require('../model/bookmark.model');
var router = express.Router();

router.post("/bookmark-toggle", async (req, res) => {
    try {
        const userId = req.userInfo.id
        const { id, params } = req.body
        const recipeId = req.body.recipeId
        const alreadyBoomark = await Bookmark.findOne({
            where: {
                userId: userId,
                recipeId: recipeId
            }
        })
        console.log('alreadyBoomark: ', alreadyBoomark);
        //북마크가 테이블에 없을 경우 생성
        if (!alreadyBoomark) {
            await Bookmark.create({
                id,
                userId: userId,
                recipeId: recipeId
            })
            res.json({ statusMessage: "CreateBookmark" })
        } else {
            await Bookmark.destroy({
                where: {
                    userId: userId,
                    recipeId: recipeId
                }
            })
            res.json({ statusMessage: "DeleteBookmark" })
        }
    }
    catch (err) {
        console.log(err)
    }
})

router.delete('/delete-bookmark/:id', async (req, res) => {
    const userId = req.userInfo.id
    const recipeId = req.params.id

    if (!userId) throw 'not user'
    try {
        await Bookmark.destroy({
            where: {
                userId: userId,
                recipeId: recipeId
            }
        })
        res.json("Dd")
    }
    catch (err) {
        console.log('err: ', err);
    }
})


module.exports = router;
