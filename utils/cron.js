const cron = require("node-cron");
const updatePresence = require("./updatePresence");

module.exports = (client) => {
  // Run immediately
  updatePresence(client);

  // Every 15 minute tasks
  cron.schedule("*/15 * * * *", () => {
    updatePresence(client);
  });
};
