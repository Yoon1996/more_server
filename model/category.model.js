const { DataTypes } = require('sequelize');
const { sequelize } = require('../util/database.util')

const Category = sequelize.define('category', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER
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


module.exports = Category
