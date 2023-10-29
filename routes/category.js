var express = require('express');
const Category = require('../model/category.model');
const Recipe = require('../model/recipe.model');
var router = express.Router();

//카테고리 생성
router.post('/create_category', async (req, res) => {

  const userId = req.userInfo.id

  const { category } = req.body;



  try {

    const alreadyCategory = await Category.findOne({ where: { name: req.body.category, userId: userId } })


    //카테고리 빈값
    if (category.length === 0) {
      res.json({ isEmpty: true })
      return
    }


    //카테고리 name 중복 로직
    if (alreadyCategory) {
      res.json({ isDuplicated: true })
      return
    }

    //카테고리 생성 로직
    const categoryWithUserId = ({
      name: category,
      userId: userId
    })

    const createCategory = await Category.create(
      categoryWithUserId
    )

    createCategory

    const currentCategory = await Category.findAll({ where: { userId } })

    res.json(currentCategory)
  }
  catch (error) {
    console.log('error: ', error);
  }

})

//카테고리 보여주기
router.get('/categories', async (req, res) => {
  //현재 접속한 아이디의 카테고리를 보여주기
  const userId = req.userInfo.id //현재 접속한 유저의 아이디
  console.log('req.userInfo: ', req.userInfo);
  const categoryList = await Category.findAll({ where: { userId } })
  res.json(categoryList)
})

//카테고리 삭제하기
router.delete('/delete_category/:categoryId', async (req, res) => {
  const categoryId = req.params.categoryId
  const userId = req.userInfo.id;

  try {
    //카테고리 목록에 포함된 레시피가 있으면 삭제 불가
    const recipeInCategory = await Recipe.findOne({
      where: {
        userId: userId,
        categoryId: categoryId
      }
    })

    if (!recipeInCategory) {
      const destroyCategory = await Category.destroy({
        where:
        {
          id: categoryId,
          userId: userId
        }
      })

      destroyCategory

      const categoryList = await Category.findAll({ where: { userId } })
      res.json(categoryList)
      return
    } else {
      res.json({ isInclude: true })
    }





  }

  catch (error) {
    console.log('error: ', error);
  }



})

module.exports = router;
