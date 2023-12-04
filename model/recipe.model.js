const { DataTypes } = require('sequelize');
const { sequelize } = require('../util/database.util');
const Ingredient = require('./ingredient.model');
const Bookmark = require('./bookmark.model');
const User = require('./user.model');

const Recipe = sequelize.define('recipe', {


    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER
    },
    categoryId: {
        type: DataTypes.INTEGER
    },
    categoryName: {
        type: DataTypes.STRING
    },
    name: {
        type: DataTypes.STRING
    },
    createdAt: {
        type: DataTypes.DATE
    },
    updatedAt: {
        type: DataTypes.DATE
    },
    view: {
        type: DataTypes.INTEGER
    }


}, { freezeTableName: true }) // table 이름 고정 (변형위험있음)

/* user.js */


// Recipe.belongsTo(User)
// Recipe.hasMany(Bookmark, {
//     as: "Bookmarks",
//     foreignKey: "recipeId"
// })
// Recipe.hasOne(Bookmark)


module.exports = Recipe
