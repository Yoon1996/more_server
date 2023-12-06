const { DataTypes } = require('sequelize');
const { sequelize } = require('../util/database.util');

const Withdraw = sequelize.define('withdraw', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    message: {
        type: DataTypes.STRING,
    },
    buttonMessage: {
        type: DataTypes.STRING,
    },
    createdAt: {
        type: DataTypes.DATE
    },
    updatedAt: {
        type: DataTypes.DATE
    }


}, { freezeTableName: true }) // table 이름 고정 (변형위험있음)

module.exports = Withdraw