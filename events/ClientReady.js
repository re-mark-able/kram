const { Events } = require(`discord.js`);
const logger = require(`../utils/logger.js`);
const { connectToDatabase } = require(`../utils/database.js`);

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    await connectToDatabase();
    logger.info(`** Ready! Logged in as ${client.user.username}`);
  },
};
