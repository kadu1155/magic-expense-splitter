const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  logging: false
});

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

const Expense = sequelize.define('Expense', {
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: 'General'
  },
  splitType: {
    type: DataTypes.STRING,
    defaultValue: 'equal' // equal, percentage, exact
  },
  isPending: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

const Participant = sequelize.define('Participant', {
  share: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  isPayer: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

// Relationships
User.hasMany(Expense, { as: 'PaidExpenses', foreignKey: 'payerId' });
Expense.belongsTo(User, { as: 'Payer', foreignKey: 'payerId' });

Expense.hasMany(Participant, { as: 'Participants', foreignKey: 'expenseId' });
Participant.belongsTo(Expense, { foreignKey: 'expenseId' });

User.hasMany(Participant, { foreignKey: 'userId' });
Participant.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Expense,
  Participant
};
