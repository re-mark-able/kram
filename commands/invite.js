const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Replies with invite link to share"),
  async execute(interaction) {
    try {
      const invite = await interaction.channel.createInvite({
        maxAge: 0, // never expires
        maxUses: 0, // unlimited uses
        unique: false, // reuse an existing similar invite if one exists
      });

      await interaction.reply(`https://discord.gg/${invite.code}`);
    } catch (error) {
      console.error("Failed to create invite:", error);
      await interaction.reply({
        content: "I don't have permission to create an invite for this server.",
        ephemeral: true,
      });
    }
  },
};
