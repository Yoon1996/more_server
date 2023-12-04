var express = require('express');
const Category = require('../model/category.model');
const Recipe = require('../model/recipe.model');
var router = express.Router();
const categoryList = [
  {
    name: '한식',
    categoryId: 0
  },
  {
    name: '일식',
    categoryId: 1
  },
  {
    name: '양식',
    categoryId: 2
  },
  {
    name: '중식',
    categoryId: 3
  },
  {
    name: '제과',
    categoryId: 4
  },
  {
    name: '제빵',
    categoryId: 5
  },

]

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
  try {
    res.json(categoryList)
  }
  catch (err) {
    console.log('err: ', err);
  }
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

//카테고리

module.exports = router;
