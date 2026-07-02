const {
  SlashCommandBuilder,
  ContainerBuilder,
  Colors,
  PermissionFlagsBits,
  MessageFlags,
  MediaGalleryBuilder,
  AttachmentBuilder,
} = require("discord.js");
const config = require("../utils/config.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("test")
    .setContexts(0)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDescription("test"),
  async execute(interaction) {
    const member = interaction.member;
    const welcomeChannel = member.guild.channels.cache.get(
      config.channels.welcome,
    );

    const allCommands = await member.client.application.commands.fetch();
    const roleCmd = allCommands.findKey((c) => c.name == "role");

    const welcomeContent = [
      `### Welcome to the server, ${member.displayName}!`,
      `Have fun and enjoy your stay. Use </role:${roleCmd}> to create your own role and set your role color.`,
      `-# Member number **${member.guild.memberCount}**`,
    ];

    const file = new AttachmentBuilder("./img/they_found_me.gif");

    const welcomeContainer = new ContainerBuilder()
      .setAccentColor(Colors.Green)
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent(welcomeContent.join("\n")),
      )
      .addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems((mediaItem) =>
          mediaItem.setURL("attachment://they_found_me.gif"),
        ),
      );

    welcomeChannel.send({
      components: [welcomeContainer],
      files: [file],
      flags: MessageFlags.IsComponentsV2,
    });
  },
};
