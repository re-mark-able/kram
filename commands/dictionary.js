const { SlashCommandBuilder } = require("discord.js");
const wordChecker = require(`../utils/wordChecker.js`);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dictionary")
    .setContexts(0)
    .setDescription("Check the meaning of a word")
    .addStringOption((option) =>
      option
        .setName("word")
        .setDescription("The word to check")
        .setRequired(true),
    ),
  async execute(interaction) {
    const checked = await wordChecker(interaction.options.getString(`word`));
    await interaction.reply(
      `**${interaction.options.getString(`word`).toUpperCase()}** was ${!checked ? `NOT ` : ``} found.${
        !checked ? `` : `\n> _${checked}_`
      }`,
    );
  },
};
