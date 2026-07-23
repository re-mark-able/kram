const { ActivityType } = require(`discord.js`);
const botActivities = require("../json/bot-activities.json");

module.exports = (client) => {
  client.user.setPresence({
    activities: [
      {
        type: ActivityType.Custom,
        name: botActivities[Math.floor(Math.random() * botActivities.length)],
      },
    ],
  });
};
