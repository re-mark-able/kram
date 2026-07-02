const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Replies with invite link to share"),
  async execute(interaction) {
    await interaction.reply("https://discord.gg/R4dEX47JDY");
  },
};
