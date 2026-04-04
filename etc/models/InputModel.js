const { DataTypes } = require('sequelize');

const InputModel = {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  deviceName: { type: DataTypes.STRING, allowNull: false, unique: true },
  type: { type: DataTypes.STRING, allowNull: false },
  voltage: { type: DataTypes.STRING, defaultValue: '220V' },
  startedAt: { type: DataTypes.STRING, allowNull: false },
};

module.exports = (sequelize) => sequelize.define('input', InputModel);