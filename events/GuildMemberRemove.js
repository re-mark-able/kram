const {
  Events,
  ContainerBuilder,
  Colors,
  MessageFlags,
  MediaGalleryBuilder,
  AttachmentBuilder,
} = require("discord.js");
const config = require("../utils/config.js");
const { dbTables } = require("../utils/database.js");

module.exports = {
  name: Events.GuildMemberRemove,
  async execute(member) {
    if (member.user.bot) return;
    const welcomeChannel = member.guild.channels.cache.get(
      config.channels.welcome,
    );

    const file = new AttachmentBuilder("./img/see_you_in_the_future.gif");

    const welcomeContainer = new ContainerBuilder()
      .setAccentColor(Colors.Green)
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent(
          `### ${member.displayName} has left the server.\n-# The member count is now **${member.guild.memberCount}**`,
        ),
      )
      .addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems((mediaItem) =>
          mediaItem.setURL("attachment://see_you_in_the_future.gif"),
        ),
      );

    welcomeChannel.send({
      files: [file],
      components: [welcomeContainer],
      flags: MessageFlags.IsComponentsV2,
    });

    await dbTables.User.destroy({
      where: { user_id: member.user.id },
    });
  },
};
