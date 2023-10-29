const { DataTypes } = require('sequelize');
const { sequelize } = require('../util/database.util');
const Ingredient = require('./ingredient.model');

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


}, { freezeTableName: true }) // table 이름 고정 (변형위험있음)

/* user.js */

Recipe.hasMany(Ingredient, {
    as: "Ingredients",
    foreignKey: 'recipeId', // This links the recipeId column in the Ingredient model to the Recipe model
    onDelete: 'CASCADE', // If a Recipe is deleted, its associated Ingredients will also be deleted
    onUpdate: 'CASCADE', // If a Recipe's ID is updated, its associated Ingredients will also be updated
});

module.exports = Recipe
