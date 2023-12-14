var express = require("express");
const Recipe = require('../model/recipe.model');
const Ingredient = require('../model/ingredient.model');
const User = require("../model/user.model");
const Category = require("../model/category.model");
const { resolveInclude } = require("ejs");
const { sequelize } = require("../util/database.util");
const { where } = require("sequelize");
const Bookmark = require("../model/bookmark.model");
var router = express.Router();

//레시피 생성
router.post("/create_recipe", async (req, res) => {

  const userId = req.userInfo.id
  const { name, ingredientList, categoryName, view } = req.body;

  try {
    if (!name && !categoryName && !ingredientList) throw "ALL_EMPTY"
    //카테고리 아이디를 만들기 위한 변수
    const categoryId = await Category.findOne({
      where: {
        userId: userId,
        name: categoryName
      }
    })
    const makeCategoryId = categoryId.id
    if (!makeCategoryId) throw "NO_CATEGORY"
    const recipe = await Recipe.findOne({ where: { name } })
    if (recipe) throw "DUPLICATED_NAME"
    // 레시피 등록
    const createRecipe = await Recipe.create({
      name: name,
      categoryName: categoryName,
      categoryId: makeCategoryId,
      userId: userId,
      view: 0,
    });

    //재료 등록
    if (ingredientList?.length) {
      const ingredientsWithRecipeId = ingredientList.map((ingredient) => ({
        ...ingredient,
        recipeId: createRecipe.id
      }));

      await Ingredient.bulkCreate(
        ingredientsWithRecipeId
      )
    }
    const currentRecipe = await Recipe.findAll({
      where: {
        userId: userId
      }
    })
    res.json(currentRecipe)
  }
  catch (error) {
    console.log('error: ', error);
    if (error === 'DUPLICATED_NAME') {
      res.status(409).json({ statusMessage: "DUPLICATED_NAME" })
    } else if (error === 'ALL_EMPTY') {
      res.status(409).json({ statusMessage: "ALL_EMPTY" })
    }
    else {
      res.status(500).json({ statusMessage: "SERVER_ERROR" })
    }
  }

});

//레시피 보여주기
router.get("/recipes", async (req, res, next) => {
  console.log(req.query.filter)
  const userId = req.userInfo.id
  try {
    const findParams = {
      where: {
        userId: userId
      },
      include: [
        {
          model: Bookmark,
          attributes: ['userId', "recipeId"],
          as: 'Bookmarks'
        }
      ],
    }
    if (!req?.userInfo) throw 'NoUser'
    else if (req.query.filter === '최신순') {
      const recentRecipe = await Recipe.findAll({
        ...findParams,
        order: [["createdAt", "desc"]]
      })
      res.json(recentRecipe)
    }
    else if (req.query.filter === '조회순') {
      const viewRecipe = await Recipe.findAll({
        ...findParams,
        order: [["view", "desc"]]
      })
      res.json(viewRecipe)
    }
    else if (req.query.filter === '북마크') {

      // findParams.include[0].required = true
      const bookmarkRecipe = await Recipe.findAll({
        ...findParams,
        include: [{ ...findParams.include[0], required: true }]
      })
      res.json(bookmarkRecipe)
    } else if (req.query.filter === '오래된 순') {
      const longTimeRecipe = await Recipe.findAll({
        ...findParams,
        order: [["createdAt", "asc"]]
      })
      res.json(longTimeRecipe)
    }
    else {
      const userId = req.userInfo.id
      const recipe = await Recipe.findAll({
        ...findParams,
      })
      res.json(recipe)
    }

  } catch (err) {
    console.log('err: ', err);
    res.status(401).json({ statusMessage: 'Unauthorized' })
  }

})
//레시피 검색 기능
router.get("/recipes", async (req, res) => {

  console.log(req)
  try {
    res.json("dddd")
  }
  catch (err) {
    console.log('err: ', err);
  }
})

//레시피 필터링
router.get("/recipes/:categoryId", async (req, res) => {


  const categoryId = req.params.categoryId
  const userId = req.userInfo.id

  try {
    const recipeFilter = await Recipe.findAll({
      where: {
        userId: userId,
        categoryId: categoryId
      }
    })
    res.json(recipeFilter)
  }
  catch (error) {
    console.log('error: ', error);
    res.status(400).json({ statusMessage: "failed" })
  }
})

//레시피 컴포넌트 정보 가져오기
router.get("/recipe-component/:recipeId", async (req, res) => {
  try {
    const recipeId = req.params.recipeId
    const currentRecipe = await Recipe.findOne({
      where: {
        id: recipeId
      },
      include: [
        { model: Ingredient, as: "Ingredients", attributes: ["id", "recipeId", "name", "ea", "unit"] },
      ]
    })
    if (currentRecipe) {
      await currentRecipe.increment("view", { by: 1 })
    }
    res.json(currentRecipe)
  }
  catch (error) {
    console.log('error: ', error);

  }
})

//레시피 수정하기
router.put("/recipes/:recipeId", async (req, res) => {
  const userId = req.userInfo.id
  const recipeId = req.body.recipeId
  const newTitle = req.body.recipeName
  const newCategoryName = req.body.categoryName
  const newIngredientList = req.body.ingredientList
  const newCategoryId = req.body.categoryId

  //들어온 재료 리스트가 현재 있는 재료 리스트의 개수랑 같으면 업데이트.
  //선택된 레시피의 현재 레시피 개수를 나타내는 로직
  const currentIngredientList = await Ingredient.findAll({
    where: {
      recipeId: recipeId
    }
  })

  const newAddArray = newIngredientList.filter((received) => {
    return !currentIngredientList.some((current) => {
      return received.id === current.id
    })
  })
  const newMinusArray = currentIngredientList.filter((current) => {
    return !newIngredientList.some((received) => {
      return received.id === current.id
    })
  })

  try {
    await Recipe.update({ name: newTitle, categoryName: newCategoryName, categoryId: newCategoryId }, {
      where: {
        userId: userId,
        id: recipeId,
      },
    })
    if (currentIngredientList.length === newIngredientList.length) {
      const updateIngredientPromiseList = newIngredientList.map((ingredient) => {
        const updateParams = { name: ingredient.name, ea: ingredient.ea, unit: ingredient.unit }
        return Ingredient.update(updateParams, {
          where: { id: ingredient.id, recipeId: recipeId },
        })
      })
      await Promise.all(updateIngredientPromiseList)
      //들어온 재료 리스트가 현재 있는 재료 리스트보다 많으면 추가생성
    } else if (currentIngredientList.length < newIngredientList.length) {
      const ingredientsWithRecipeId = newAddArray.map((ingredient) => ({
        ...ingredient,
        recipeId: recipeId,
      }));

      await Ingredient.bulkCreate(
        ingredientsWithRecipeId
      )
    } else if (currentIngredientList.length > newIngredientList.length) {
      await Promise.all(newMinusArray.map(obj => obj.destroy()))
    }
    const currentRecipe = await Recipe.findAll({
      where: {
        userId: userId,
      }
    })
    res.json(currentRecipe)
  }
  catch (error) {
    console.log('error: ', error);
    // await t.rollback(); //중간에 failed 나면 트랜잭션 롤백

  }
})

//레시피 삭제 api
router.delete('/recipes/:recipeId', async (req, res) => {

  const userInfo = req.userInfo.id
  const recipeId = req.params.recipeId

  try {
    await Recipe.destroy({
      where: { id: recipeId, userId: userInfo }
    })
    await Ingredient.destroy({
      where: {
        recipeId
      }
    })

    const recipes = await Recipe.findAll({
      where: {
        userId: userInfo,
      }
    })

    res.json(recipes)
  }

  catch (error) {
    console.log('error: ', error);
    res.status(500).json({ statusMessage: "SERVER_ERROR" })
  }



})
module.exports = router;
