const { DataTypes } = require('sequelize');
const { sequelize } = require('../util/database.util');
const User = require('./user.model');

const Bookmark = sequelize.define('bookmark', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER
    },
    recipeId: {
        type: DataTypes.INTEGER
    },
    createdAt: {
        type: DataTypes.DATE
    },
    updatedAt: {
        type: DataTypes.DATE
    }


}, { freezeTableName: true }) // table 이름 고정 (변형위험있음)




module.exports = Bookmark
