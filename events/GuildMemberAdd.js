const {
  Events,
  ContainerBuilder,
  Colors,
  MessageFlags,
  MediaGalleryBuilder,
  AttachmentBuilder,
} = require("discord.js");
const config = require("../utils/config.js");

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    if (member.user.bot) return;
    const welcomeChannel = member.guild.channels.cache.get(
      config.channels.welcome,
    );

    const welcomeContent = [
      `### Welcome to the server, ${member.displayName}!`,
      `Have fun and enjoy your stay. Use </role:1522045744989605993> to create your own role and set your role color.`,
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
