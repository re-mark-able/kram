const {
  SlashCommandBuilder,
  MessageFlags,
  ContainerBuilder,
} = require("discord.js");
const { defaultColour } = require("../utils/config");

const helpContent = [
  `### Mark's Muckaround Bot`,
  `-# _Nothing fancy. Just trying ideas._`,
  ``,
  `The bot is [open sourced on GitHub](https://github.com/re-mark-able/kram) if you want to be involved.`,
  ``,
  `-# **Available commands:**`,
  `> \`/afk       \` Set AFK on/off`,
  `> \`/calendar  \` View calendar and set your birthday`,
  `> \`/colour    \` Display a hex colour, or a role colour.`,
  `> \`/dictionary\` Get the meaning of a word`,
  `> \`/info      \` Random bot info`,
  `> \`/invite    \` Link for this server`,
  `> \`/name_style\` (admin) Change the font styles for the Bot`,
  `> \`/ping      \` Ping the bot`,
  `> \`/reload    \` (admin) Reload commands`,
  `> \`/role      \` Create your own role with colour`,
  `> \`/temp      \` Convert °C to °F and vice-versa`,
  `> \`/time      \` Convert time`,
  `> \`/tmdb      \` Find movies or TV shows`,
];

module.exports = {
  data: new SlashCommandBuilder().setName("help").setDescription("Help"),
  async execute(interaction) {
    const container = new ContainerBuilder()
      .setAccentColor(defaultColour)
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent(helpContent.join("\n")),
      );

    return await interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  },
};
