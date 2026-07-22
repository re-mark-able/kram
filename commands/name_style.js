const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  REST,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("name_style")
    .setContexts(0)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDescription("name_style")
    .addStringOption((option) =>
      option.setName("hex_one").setDescription("First hex").setRequired(false),
    )
    .addStringOption((option) =>
      option.setName("hex_two").setDescription("Second hex").setRequired(false),
    )
    .addIntegerOption((option) =>
      option
        .setName("font_number")
        .setDescription("Display font number")
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(12),
    )
    .addIntegerOption((option) =>
      option
        .setName("font_effect")
        .setDescription("Display font effect")
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(6),
    ),
  async execute(interaction) {
    const fontId = !interaction.options.getInteger("font_number")
      ? 8
      : interaction.options.getInteger("font_number"); // https://docs.discord.food/resources/user#display-name-font
    const effectId = !interaction.options.getInteger("font_effect")
      ? 4
      : interaction.options.getInteger("font_effect"); // https://docs.discord.food/resources/user#display-name-effect

    const colors = [
      !interaction.options.getString("hex_one")
        ? 1
        : parseInt(
            interaction.options.getString("hex_one").replace(/^#/, ""),
            16,
          ),
      !interaction.options.getString("hex_two")
        ? 1
        : parseInt(
            interaction.options.getString("hex_two").replace(/^#/, ""),
            16,
          ),
    ]; // The colors to use encoded as an array of integers representing hexadecimal color codes (max 2)
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
