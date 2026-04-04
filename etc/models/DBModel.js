const { Sequelize } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './data/storage.db'
});
module.exports = sequelize;