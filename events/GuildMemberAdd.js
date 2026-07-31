const {
  Events,
  ContainerBuilder,
  MessageFlags,
  MediaGalleryBuilder,
  AttachmentBuilder,
  userMention,
} = require("discord.js");
const config = require("../utils/config.js");

const path = require("path");
const absolutePath = path.join(__dirname, "..", "img");

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    if (member.user.bot) return;
    if (member.guild.id !== config.guildId) return;
    const welcomeChannel = member.guild.channels.cache.get(
      config.channels.welcome,
    );

    const allCommands = await member.client.application.commands.fetch();
    const roleCommand = allCommands.findKey((c) => c.name === "role");

    const welcomeContent = [
      `### Welcome to the server, ${userMention(member.user.id)}!`,
      `Have fun and enjoy your stay. Use </role:${roleCommand}> to create your own role and set your role color.`,
      `-# Member number **${member.guild.memberCount}**`,
    ];

    const file = new AttachmentBuilder(`${absolutePath}/they_found_me.gif`);

    const welcomeContainer = new ContainerBuilder()
      .setAccentColor(config.defaultColour)
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
