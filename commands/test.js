const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  REST,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("test")
    .setContexts(0)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDescription("test"),
  async execute(interaction) {
    const fontId = 3; // https://docs.discord.food/resources/user#display-name-font
    const effectId = 2; // https://docs.discord.food/resources/user#display-name-effect
    const colors = [16737752, 9702211]; // The colors to use encoded as an array of integers representing hexadecimal color codes (max 2)
    const rest = new REST().setToken(process.env.TOKEN);
    await rest.patch(`/guilds/${interaction.guild.id}/members/@me`, {
      body: {
        display_name_font_id: fontId,
        display_name_effect_id: effectId,
        display_name_colors: colors,
      },
    });

    await interaction.reply("Done");
  },
};
