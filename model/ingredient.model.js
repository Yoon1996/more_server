const { DataTypes } = require('sequelize');
const { sequelize } = require('../util/database.util');
const Recipe = require('./recipe.model');

const Ingredient = sequelize.define('ingredient', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    recipeId: {
        type: DataTypes.INTEGER
    },
    name: {
        type: DataTypes.STRING
    },
    ea: {
        type: DataTypes.INTEGER
    },
    unit: {
        type: DataTypes.STRING
    },
    createdAt: {
        type: DataTypes.DATE
    },
    updatedAt: {
        type: DataTypes.DATE
    },


}, { freezeTableName: true }) // table 이름 고정 (변형위험있음)

// Ingredient.belongsTo(Recipe, { foreignKey: 'id' })

module.exports = Ingredient
