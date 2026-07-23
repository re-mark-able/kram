const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ContainerBuilder,
  MessageFlags,
} = require("discord.js");

const getRGB = (colourStr) => {
  const cleanHex = colourStr.replace("#", "");

  // Parse the 2-digit chunks for R, G, and B
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  return { r: r, g: g, b: b };
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("colour")
    .setContexts(0)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDescription("View colour info")
    .addStringOption((option) =>
      option
        .setName("hex_code")
        .setDescription("Input hex to display (optional)")
        .setRequired(false),
    ),
  async execute(interaction) {
    let currentHex = !interaction.options.getString("hex_code")
      ? "#000000"
      : interaction.options.getString("hex_code");

    if (currentHex.charAt(0) !== "#") {
      currentHex = "#" + currentHex;
    }

    const rgb = getRGB(currentHex);
    const responseContent = [
      `### ${currentHex}`,
      `> **RGB:** \`rgb(${rgb.r},${rgb.g},${rgb.b})\``,
    ];

    const responseContainer = new ContainerBuilder()
      .setAccentColor(currentHex.replace("#", "0x"))
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent(responseContent.join("\n")),
      );

    return await interaction.reply({
      components: [responseContainer],
      flags: MessageFlags.IsComponentsV2,
    });
  },
};
