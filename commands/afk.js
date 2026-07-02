const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("afk")
    .setContexts(0)
    .setDescription("Mark yourself as AFK")
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Will be displayed when you are @ping'ed"),
    ),
  async execute(interaction) {
    if (interaction.client.afk.has(interaction.user.id)) {
      interaction.client.afk.delete(interaction.user.id);
      await interaction.reply(`You are no longer AFK.`);
    } else {
      interaction.client.afk.set(interaction.user.id, {
        reason: interaction.options.getString("reason"),
        since: new Date(),
      });
      await interaction.reply(
        `You are now AFK.${!interaction.options.getString("reason") ? "" : `..\n> _${interaction.options.getString("reason")}_`}`,
      );
    }
  },
};
