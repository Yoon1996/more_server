var express = require('express');
const Bookmark = require('../model/bookmark.model');
var router = express.Router();

router.post("/save-bookmark", async (req, res) => {
    const userId = req.userInfo.id
    const { id, params } = req.body
    const recipeId = req.body.recipeId
    if (!userId) throw 'not user'
    try {
        const saveBookmark = await Bookmark.create({
            id,
            userId: userId,
            recipeId: recipeId
        })
        await saveBookmark.save()
        res.json(saveBookmark)
    }
    catch (err) {
        console.log('err: ', err);
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
