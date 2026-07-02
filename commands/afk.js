const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const logger = require("../utils/logger");

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
      try {
        await interaction.member.setNickname(
          interaction.member.displayName.replace("[AFK] ", ""),
        );
      } catch (err) {
        logger.error(err, "Cannot change nickname on AFK");
      }
    } else {
      interaction.client.afk.set(interaction.user.id, {
        reason: interaction.options.getString("reason"),
        since: new Date(),
      });
      await interaction.reply(
        `You are now AFK.${!interaction.options.getString("reason") ? "" : `..\n> _${interaction.options.getString("reason")}_`}`,
      );
      try {
        await interaction.member.setNickname(
          `[AFK] ${interaction.member.displayName}`,
        );
      } catch (err) {
        logger.error(err, "Cannot change nickname on AFK");
      }
    }
  },
};
