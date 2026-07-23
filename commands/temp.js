const {
  SlashCommandBuilder,
  MessageFlags,
  ContainerBuilder,
} = require("discord.js");
const { defaultColour } = require("../utils/config");
const zeroPad = require("../utils/zeroPad");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("temp")
    .setDescription("Convert °C to °F and vice versa")
    .addIntegerOption((option) =>
      option.setName("amount").setDescription("The amount").setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("format")
        .setDescription("Is the amount in °C or °F?")
        .setRequired(true)
        .addChoices(
          { name: "Celcius", value: "c" },
          { name: "Fahrenheit", value: "f" },
        ),
    ),
  async execute(interaction) {
    const amount = interaction.options.getInteger("amount");
    const format = interaction.options.getString("format");

    const celcius = format !== "c" ? ((amount - 32) * 5) / 9 : amount;
    const fahrenheight = format !== "f" ? amount * 1.8 + 32 : amount;
    const kelvin = celcius + 273.15;
    const responseContent = [
      `### Temperature Conversion`,
      `> \`${zeroPad(celcius.toFixed(2), 8)}\`°C`,
      `> \`${zeroPad(fahrenheight.toFixed(2), 8)}\`°F`,
      `> \`${zeroPad(kelvin.toFixed(2), 8)}\`K`,
    ];

    const container = new ContainerBuilder()
      .setAccentColor(defaultColour)
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent(responseContent.join("\n")),
      );
    return await interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  },
};
