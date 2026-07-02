const { Events, ActivityType } = require(`discord.js`);
const logger = require(`../utils/logger.js`);
const { connectToDatabase } = require(`../utils/database.js`);

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    await connectToDatabase();
    client.user.setPresence({
      activities: [
        {
          type: ActivityType.Custom,
          name: `Doin' stuff`,
        },
      ],
    });
    logger.info(`** Ready! Logged in as ${client.user.username}`);
  },
};
