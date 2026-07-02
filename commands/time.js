const {
  SlashCommandBuilder,
  MessageFlags,
  ContainerBuilder,
  Colors,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const dbTables = require("../utils/database");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("time")
    .setContexts(0)
    .setDescription("Check sometime's current time")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("the user to check. Leave blank for yours."),
    ),
  async execute(interaction) {
    const checkUser = !interaction.options.getUser("user")
      ? interaction.user
      : interaction.options.getUser("user");

    const dbUser = await dbTables.User.findOne({
      where: { user_id: checkUser.id },
    });

    if (!dbUser || !dbUser.gmt_offset) {
      await interaction.reply({
        content: `${checkUser} does not have a time set.`,
        flags: MessageFlags.Ephemeral,
      });
    } else {
      const outputContent = [`### ${checkUser}'s Current Time`];
      if (dbUser.gmt_offset.includes("/")) {
        // assume its a timezone
        const displayTime = dayjs().tz(dbUser.gmt_offset);
        outputContent.push(`> ${displayTime.format("YYYY-MM-DD HH:mm:ss")}`);
      } else {
        // its a GMT +00:00
        const displayTime = dayjs().utcOffset(dbUser.gmt_offset);
        outputContent.push(`> ${displayTime.format("YYYY-MM-DD HH:mm:ss")}`);
      }

      const outputContainer = new ContainerBuilder()
        .setAccentColor(Colors.Aqua)
        .addTextDisplayComponents((textDisplay) =>
          textDisplay.setContent(outputContent.join("\n")),
        );

      if (checkUser.id === interaction.user.id) {
        // Add button to change time
        outputContainer.addActionRowComponents((actionRow) =>
          actionRow.setComponents(
            new ButtonBuilder()
              .setCustomId("set_timezone")
              .setLabel("Set Time")
              .setStyle(ButtonStyle.Primary),
          ),
        );
      }

      await interaction.reply({
        components: [outputContainer],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: {},
      });
    }
  },
};
