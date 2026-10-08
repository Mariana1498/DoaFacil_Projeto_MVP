const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const Doacao = sequelize.define('Doacao', {
  nomeDoador: { type: DataTypes.STRING(80), allowNull: false },
  telefone: { type: DataTypes.STRING(20), allowNull: false },
  email: { type: DataTypes.STRING(120) },
  alimento: { type: DataTypes.STRING(80), allowNull: false },
  categoria: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'Não perecível' },
  quantidade: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  unidade: { type: DataTypes.STRING(10), allowNull: false, defaultValue: 'kg' },
  bairro: { type: DataTypes.STRING(60), allowNull: false },
  validade: { type: DataTypes.DATEONLY },
  observacao: { type: DataTypes.STRING(240) },
  // disponivel -> reservada -> entregue
  status: { type: DataTypes.STRING(12), allowNull: false, defaultValue: 'disponivel' },
  retiradoPor: { type: DataTypes.STRING(80) },
});

module.exports = Doacao;
