const { Events } = require(`discord.js`);

const logger = require(`../utils/logger.js`);

module.exports = {
  name: Events.Warn,
  async execute(m) {
    logger.warn(m);
  },
};
