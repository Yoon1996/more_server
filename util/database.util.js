const { Sequelize } = require('sequelize');
const { getDatabaseConfig } = require('../config/database.config');

const databaseConfig = getDatabaseConfig()

const sequelize = new Sequelize(
  databaseConfig.databaseName,
  databaseConfig.userName,
  databaseConfig.password,
  {
    host: databaseConfig.host,
    dialect: databaseConfig.type
  });



module.exports = { sequelize }