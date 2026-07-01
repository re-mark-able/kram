const { Events } = require(`discord.js`);

const logger = require(`../utils/logger.js`);

module.exports = {
  name: Events.Error,
  async execute(m) {
    logger.error(m, `Error Event`);
  },
};
