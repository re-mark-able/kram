const {
  SlashCommandBuilder,
  MessageFlags,
  ContainerBuilder,
  Colors,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputStyle,
  ComponentType,
} = require("discord.js");
const dbTables = require("../utils/database");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const logger = require("../utils/logger");

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
    const setTimeModal = new ModalBuilder()
      .setCustomId("setTimeModal")
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent(
          "[Click here to find your timezone]<https://en.wikipedia.org/wiki/List_of_tz_database_time_zones>",
        ),
      )
      .addLabelComponents((label) =>
        label
          .setLabel("What is your timezone?")
          .setDescription("Must be from list above or GMT offset: +00:00")
          .setTextInputComponent((textInput) =>
            textInput
              .setCustomId("timeInput")
              .setStyle(TextInputStyle.Short)
              .setRequired(true),
          ),
      );

    const checkUser = !interaction.options.getUser("user")
      ? interaction.user
      : interaction.options.getUser("user");

    const dbUser = await dbTables.User.findOne({
      where: { user_id: checkUser.id },
    });

    const outputContent = [`### ${checkUser}'s Current Time`];
    if (!dbUser || !dbUser.gmt_offset) {
      // None
      outputContent.push(`> Not set`);
    } else if (dbUser.gmt_offset.includes("/")) {
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

    if (checkUser.id === interaction.user.id && !dbUser.gmt_offset) {
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

    if (interaction.user.id === checkUser.id) {
      const collectorFilter = (i) => {
        i.deferUpdate();
        return i.user.id === interaction.user.id;
      };

      const response = await interaction.fetchReply();

      response
        .awaitMessageComponent({
          filter: collectorFilter,
          componentType: ComponentType.Button,
          time: 60_000,
        })
        .then(async (i) => {
          outputContainer.components[1].accessory.setDisabled(true);
          await interaction.editReply({ components: [outputContainer] });
          await i.showModal(setTimeModal);

          i.awaitModalSubmit({ time: 60_000 })
            .then(async (mi) => {
              const timezone = mi.fields.getTextInputValue(`timeInput`);
              if (timezone.includes("/") && dayjs().tz(timezone)) {
                // valid
                await dbUser.update({ gmt_offset: timezone });
                await mi.reply({
                  content: `Your timezone has been set.`,
                  flags: MessageFlags.Ephemeral,
                });
              } else if (
                timezone.charAt(0) === "+" &&
                timezone.charAt(3) === ":" &&
                timezone.length === "6" &&
                dayjs().utcOffset(timezone)
              ) {
                // valid
                await dbUser.update({ gmt_offset: timezone });
                await mi.reply({
                  content: `Your timezone has been set.`,
                  flags: MessageFlags.Ephemeral,
                });
              } else {
                // invalid
                await mi.reply({
                  content: `Format provided was invalid. It must be either timezone or GMT offset such as:\n> Australia/Perth\n> +08:00`,
                  flags: MessageFlags.Ephemeral,
                });
              }
            })
            .catch((mErr) => logger.error(mErr, "Time modal error"));
        })
        .catch(async (err) => {
          // remove button
          outputContainer.components[1].accessory.setDisabled(true);
          await interaction.editReply({ components: [outputContainer] });
          logger.error(err, "Time modal error");
        });
    }
  },
};
