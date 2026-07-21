const { Events, AttachmentBuilder, userMention, time } = require(`discord.js`);
const { botResponses, questionResponses, magicball, soloResponses } = require(
  `../bot-responses.json`,
);
const path = require("path");
const logger = require("../utils/logger");
const absolutePath = path.join(__dirname, "..", "img");

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;
    if (
      message.content.toLowerCase().includes("mark") ||
      message.content.includes("<@765796161499824148>")
    ) {
      message.react(`<a:marty_board:1521751800083124366>`);
    }

    for (const [userId, afk] of message.client.afk) {
      if (message.content.includes(userId)) {
        await message.reply({
          content: `${userMention(userId)} is AFK (since ${time(afk.since, "R")}).${!afk.reason ? `` : `..\n> _${afk.reason}_`}`,
          allowedMentions: {},
        });
      } else if (message.author.id === userId) {
        message.client.afk.delete(userId);
        await message.reply(`You are no longer AFK.`);
        try {
          await message.member.setNickname(
            message.member.displayName.replace("[AFK] ", ""),
          );
        } catch (err) {
          logger.error(err, "Cannot change nickname on AFK");
        }
      }
    }

    if (
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
    } else if (soloResponses[message.content.split(" ")[0]]) {
      message.reply(soloResponses[message.content.split(" ")[0]]);
    } else {
      const response = Object.keys(botResponses).find((word) =>
        message.content
          .toLowerCase()
          .replace(/[^a-zA-Z0-9 ]/g, "")
          .includes(word),
      );

      if (!response) return;
      if (Array.isArray(botResponses[response])) {
        const randomIndex = Math.floor(
          Math.random() * botResponses[response].length,
        );
        const randomResponse = botResponses[response][randomIndex];

        if (randomResponse.includes("attachment://")) {
          const file = new AttachmentBuilder(
            randomResponse.replace("attachment://", absolutePath + "/"),
          );
          message.reply({ files: [file] });
        } else {
          message.reply(randomResponse);
        }
      } else if (botResponses[response].includes("attachment://")) {
        const file = new AttachmentBuilder(
          botResponses[response].replace("attachment://", absolutePath + "/"),
        );
        message.reply({ files: [file] });
      } else {
        message.reply(botResponses[response]);
      }
    }
  },
};
