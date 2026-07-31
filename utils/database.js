const { Sequelize, DataTypes } = require("sequelize");
const logger = require("../utils/logger");
const { testMode, databaseUrl } = require("../utils/config");

const sequelize =
  testMode || !databaseUrl
    ? new Sequelize({
        dialect: "sqlite",
        storage: "db/database.sqlite",
        logging: false,
      })
    : new Sequelize(databaseUrl, {
        dialect: "postgres",
        logging: false,
        timezone: "+08:00",
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
    gmt_offset: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }),
  UserList: sequelize.define("UserList", {
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("boardgame", "movie", "show"),
      allowNull: false,
    },
    item_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    last: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    in_queue: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    currently_watching: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    rating: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    last_episode: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    comments: {
      type: DataTypes.JSON,
      defaultValue: null,
    },
    users: {
      type: DataTypes.JSON,
      defaultValue: null,
    },
  }),
  ServerList: sequelize.define("ServerList", {
    guild_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("boardgame", "movie", "show"),
      allowNull: false,
    },
    item_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    last: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    in_queue: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    currently_watching: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    rating: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    last_episode: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    comments: {
      type: DataTypes.JSON,
      defaultValue: null,
    },
    users: {
      type: DataTypes.JSON,
      defaultValue: null,
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
