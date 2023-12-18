const { DataTypes } = require('sequelize');
const { sequelize } = require('../util/database.util');
const Bookmark = require('./bookmark.model');
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
    },
    url: {
        type: DataTypes.STRING
    }


}, { freezeTableName: true }) // table 이름 고정 (변형위험있음)



module.exports = Recipe
