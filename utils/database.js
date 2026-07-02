const { Sequelize, DataTypes } = require("sequelize");
const logger = require("../utils/logger");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "db/database.sqlite",
  logging: false,
});

const dbTables = {
  User: sequelize.define("User", {
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      primaryKey: true,
    },
    role_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    birthday: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }),
};

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info("[DATABASE] Connection has been established successfully.");
    await sequelize.sync({ alter: true });
  } catch (error) {
    logger.error(error, "[DATABASE] Unable to connect");
  }
};

module.exports = { ...dbTables, connectToDatabase };
