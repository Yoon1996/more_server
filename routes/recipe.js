var express = require("express");
const Recipe = require('../model/recipe.model');
const Ingredient = require('../model/ingredient.model');
const User = require("../model/user.model");
const Category = require("../model/category.model");
const { resolveInclude } = require("ejs");
const { sequelize } = require("../util/database.util");
const { where } = require("sequelize");
var router = express.Router();

//레시피 생성
router.post("/create_recipe", async (req, res) => {


  const userId = req.userInfo.id
  const { id, name, ingredientList, categoryName } = req.body;


  try {
    if (!name) throw "EMPTY_NAME"


    //카테고리 아이디를 만들기 위한 변수
    const categoryId = await Category.findOne({
      where: {
        userId: userId,
        name: categoryName,
      }
    })

    const makeCategoryId = categoryId.id
    const recipe = await Recipe.findOne({ where: { name } })

    if (recipe) throw "DUPLICATED_NAME"

    //레시피 등록
    const createRecipe = await Recipe.create({
      id,
      name,
      userId,
      categoryName,
      categoryId: makeCategoryId,
    });

    //재료 등록
    const ingredientsWithRecipeId = ingredientList.map((ingredient) => ({
      ...ingredient,
      recipeId: createRecipe.id
    }));

    await Ingredient.bulkCreate(
      ingredientsWithRecipeId
    )
    res.json(createRecipe)
  }
  catch (error) {
    console.log('error: ', error);
    if (error === 'EMPTY_NAME') {
      res.status(400).json({ statusMessage: "EMPTY_NAME" })
    } else if (error === 'DUPLICATED_NAME') {
      res.status(409).json({ statusMessage: "DUPLICATED_NAME" })
    } else {
      res.status(500).json({ statusMessage: "SERVER_ERROR" })
    }
  }

});

//레시피 보여주기
router.get("/recipes", async (req, res, next) => {
  try {

    if (!req?.userInfo) throw 'NoUser'
    else {
      const userId = req.userInfo.id
      const recipe = await Recipe.findAll({ where: { userId } })
      res.json(recipe)
    }

  } catch (err) {
    console.log('err: ', err);
    res.status(401).json({ statusMessage: 'Unauthorized' })
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
    console.log('recipeId: ', recipeId);



    const currentRecipe = await Recipe.findOne({
      where: {
        id: recipeId
      },
      include: [
        { model: Ingredient, as: "Ingredients", attributes: ["id", "recipeId", "name", "ea", "unit"] }
      ]

    })


    res.json(currentRecipe)
  }
  catch (error) {
    console.log('error: ', error);

  }
})

//레시피 수정하기
router.put("/recipes/:recipeId", async (req, res) => {

  const t = await sequelize.transaction();

  try {

    const userId = req.userInfo.id
    const recipeId = req.params.recipeId
    const newTitle = req.body.recipeName
    const newCategoryName = req.body.categoryName
    const newIngredientList = req.body.ingredientList

    //수정 된 레시피의 카테고리 아이디를 구하는 로직
    const updateCategory = await Category.findOne({
      where: {
        userId: userId,
        name: newCategoryName
      }
    })
    const updateRecipe = await Recipe.update({ name: newTitle, categoryName: newCategoryName, categoryId: updateCategory.id }, {
      where: {
        userId: userId,
        id: recipeId,
      },
      transaction: t, //이 쿼리를 트랜잭션 처리
    })

    const currentIngredients = newIngredientList.map((ingredient, index) => {
      Ingredient.findAll({
        where: {
          recipeId: recipeId
        }
      })
    })

    const updateIngredientPromiseList = newIngredientList.map((ingredient) => {
      const updateParams = { name: ingredient.name, ea: ingredient.ea, unit: ingredient.unit }
      return Ingredient.update(updateParams, {
        where: { id: ingredient.id, recipeId: recipeId },
        transaction: t, //이 쿼리를 트랜잭션 처리
      })
    })

    const updateRes = await Promise.all(updateIngredientPromiseList)
    // await 
    // Ingredient.update(updateIngredientList, {
    //   where: { recipeId: recipeId },
    //   transaction: t, //이 쿼리를 트랜잭션 처리
    // })



    // updateRecipe
    // updateIngredientList

    await t.commit(); //트랜잭션 문제없으면 커밋

    const currentRecipe = await Recipe.findAll({
      where: {
        userId: userId,

      }
    })

    res.json(currentRecipe)

  }
  catch (error) {
    console.log('error: ', error);
    await t.rollback(); //중간에 failed 나면 트랜잭션 롤백

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
