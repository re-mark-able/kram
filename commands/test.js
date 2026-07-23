const {
  SlashCommandBuilder,
  MessageFlags,
  PermissionFlagsBits,
  userMention,
  AttachmentBuilder,
  MediaGalleryBuilder,
  ContainerBuilder,
} = require("discord.js");
const { defaultColour } = require("../utils/config");
const path = require("path");
const absolutePath = path.join(__dirname, "..", "img");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("test")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDescription("Mark's test command"),
  async execute(interaction) {
    const member = interaction.member;
    const welcomeChannel = interaction.channel;
    if (member.user.bot) return;
    const allCommands = await member.client.application.commands.fetch();
    const roleCommand = allCommands.findKey((c) => c.name === "role");
    const welcomeContent = [
      `### Welcome to the server, ${userMention(member.user.id)}!`,
      `Have fun and enjoy your stay. Use </role:${roleCommand}> to create your own role and set your role color.`,
      `-# Member number **${member.guild.memberCount}**`,
    ];

    const file = new AttachmentBuilder(`${absolutePath}/they_found_me.gif`);

    const welcomeContainer = new ContainerBuilder()
      .setAccentColor(defaultColour)
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
