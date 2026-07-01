const { Events } = require(`discord.js`);
const { botResponses, questionResponses, magicball, markpings } = require(
  `../bot-responses.json`,
);

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (
      message.content.toLowerCase().includes("mark") ||
      message.content.includes("<@765796161499824148>")
    ) {
      message.react(`<a:marty_board:1521751800083124366>`);
    }
    if (message.author.bot) return;
    if (message.content.toLowerCase() == "hi mark") {
      message.reply("https://tenor.com/bkJF4.gif");
    } else if (message.content.includes("<@765796161499824148>")) {
      message.reply("https://larry-games.github.io/public/img/mark.gif");
    } else if (
      message.content.split(" ").length > 1 &&
      message.content.slice(-1) == "?" &&
      message.mentions.has(message.client.user.id)
    ) {
      const messageString = message.content
        .toLowerCase()
        .replace(`<@${message.client.user.id}>`, "")
        .trim();

      if (questionResponses[messageString.split(" ")[0]]) {
        const randomIndex = Math.floor(
          Math.random() * questionResponses[messageString.split(" ")[0]].length,
        );
        const randomResponse =
          questionResponses[messageString.split(" ")[0]][randomIndex];
        message.reply(randomResponse);
      } else if (message.content.slice(-3) == "???") {
        const r = Math.floor(Math.random() * magicball.no.length);

        message.reply(magicball.no[r]);
      } else if (message.content.slice(-2) == "??") {
        const r = Math.floor(Math.random() * magicball.yes.length);

        message.reply(magicball.yes[r]);
      } else {
        const t = Math.floor(Math.random() * Object.keys(magicball).length);
        const type = Object.keys(magicball)[t];
        const r = Math.floor(Math.random() * magicball[type].length);

        message.reply(magicball[type][r]);
      }
    } else {
      const autoResponseWords = Object.keys(botResponses);
      if (
        autoResponseWords.some((word) =>
          message.content.toLowerCase().includes(word),
        )
      ) {
        for (let i = 0; i < autoResponseWords.length; i++) {
          if (message.content.toLowerCase().includes(autoResponseWords[i])) {
            if (Array.isArray(botResponses[autoResponseWords[i]])) {
              const randomIndex = Math.floor(
                Math.random() * botResponses[autoResponseWords[i]].length,
              );
              const randomResponse =
                botResponses[autoResponseWords[i]][randomIndex];
              message.reply(randomResponse);
            } else {
              message.reply(botResponses[autoResponseWords[i]]);
            }
          }
        }
      }
    }
  },
};
