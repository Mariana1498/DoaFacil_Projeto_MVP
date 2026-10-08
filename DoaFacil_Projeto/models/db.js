const path = require('path');
const { Sequelize } = require('sequelize');

// SQLite: o banco é um arquivo local (database.sqlite), criado sozinho na primeira execução.
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite'),
  logging: false,
});

module.exports = sequelize;
