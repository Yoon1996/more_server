const { DataTypes } = require('sequelize');
const { sequelize } = require('../util/database.util');
const Category = require('./category.model');

const User = sequelize.define('user', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nickname: {
        type: DataTypes.STRING
    },
    password: {
        type: DataTypes.TEXT
    },
    email: {
        type: DataTypes.STRING
    },
    name: {
        type: DataTypes.STRING
    },
    birth: {
        type: DataTypes.STRING
    },
    provider: {
        type: DataTypes.STRING
    },
    createdAt: {
        type: DataTypes.DATE
    },
    updatedAt: {
        type: DataTypes.DATE
    },
    withDraw: {
        type: DataTypes.TINYINT
    }


}, { freezeTableName: true }) // table 이름 고정 (변형위험있음)

User.hasMany(Category, {
    foreignKey: 'userId', // This links the recipeId column in the Ingredient model to the Recipe model
    onDelete: 'CASCADE', // If a Recipe is deleted, its associated Ingredients will also be deleted
    onUpdate: 'CASCADE', // If a Recipe's ID is updated, its associated Ingredients will also be updated
});

module.exports = User