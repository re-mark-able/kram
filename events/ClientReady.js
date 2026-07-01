const { Events } = require(`discord.js`);
const logger = require(`../utils/logger.js`);

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    logger.info(`** Ready! Logged in as ${client.user.username}`);
  },
};
