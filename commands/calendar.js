const {
  SlashCommandBuilder,
  MessageFlags,
  time,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  ComponentType,
  Colors,
  userMention,
  ModalBuilder,
  TextInputStyle,
  StringSelectMenuOptionBuilder,
} = require(`discord.js`);
const dbTables = require(`../utils/database.js`);
const { Op } = require(`sequelize`);
const dayjs = require(`dayjs`);
const weekOfYear = require(`dayjs/plugin/weekOfYear`);
const logger = require("../utils/logger.js");
const setOrdinal = require("../utils/setOrdinal.js");

dayjs.extend(weekOfYear);

const dayList = [
  `Sunday`,
  `Monday`,
  `Tuesday`,
  `Wednesday`,
  `Thursday`,
  `Friday`,
  `Saturday`,
];
const monthList = [
  `January`,
  `February`,
  `March`,
  `April`,
  `May`,
  `June`,
  `July`,
  `August`,
  `September`,
  `October`,
  `November`,
  `December`,
];

const birthdayModal = async (interaction) => {
  const modal = new ModalBuilder()
    .setCustomId(`user_birthday`)
    .setTitle(`Set Birthday`)
    .addTextDisplayComponents((textDisplay) =>
      textDisplay.setContent(`Once set, your birthday cannot be changed.`),
    )
    .addLabelComponents(
      (label) =>
        label
          .setLabel(`Day:`)
          .setDescription(`The day. Must be valid.`)
          .setTextInputComponent((textInput) =>
            textInput
              .setCustomId(`birth_date`)
              .setStyle(TextInputStyle.Short)
              .setMinLength(1)
              .setMaxLength(2)
              .setRequired(true)
              .setPlaceholder(new Date().getDate().toString()),
          ),
      (label) =>
        label
          .setLabel(`Month:`)
          .setDescription(`Select from below`)
          .setStringSelectMenuComponent((stringSelect) =>
            stringSelect
              .setCustomId(`birth_month`)
              .setPlaceholder(`Select month`)
              .setRequired(true)
              .setMaxValues(1)
              .addOptions(
                new StringSelectMenuOptionBuilder()
                  .setLabel(`January`)
                  .setDefault(new Date().getMonth() === 0 ? true : false)
                  .setValue(`1`),
                new StringSelectMenuOptionBuilder()
                  .setLabel(`February`)
                  .setDefault(new Date().getMonth() === 1 ? true : false)
                  .setValue(`2`),
                new StringSelectMenuOptionBuilder()
                  .setLabel(`March`)
                  .setDefault(new Date().getMonth() === 2 ? true : false)
                  .setValue(`3`),
                new StringSelectMenuOptionBuilder()
                  .setLabel(`April`)
                  .setDefault(new Date().getMonth() === 3 ? true : false)
                  .setValue(`4`),
                new StringSelectMenuOptionBuilder()
                  .setLabel(`May`)
                  .setDefault(new Date().getMonth() === 4 ? true : false)
                  .setValue(`5`),
                new StringSelectMenuOptionBuilder()
                  .setLabel(`June`)
                  .setDefault(new Date().getMonth() === 5 ? true : false)
                  .setValue(`6`),
                new StringSelectMenuOptionBuilder()
                  .setLabel(`July`)
                  .setDefault(new Date().getMonth() === 6 ? true : false)
                  .setValue(`7`),
                new StringSelectMenuOptionBuilder()
                  .setLabel(`August`)
                  .setDefault(new Date().getMonth() === 7 ? true : false)
                  .setValue(`8`),
                new StringSelectMenuOptionBuilder()
                  .setLabel(`September`)
                  .setDefault(new Date().getMonth() === 8 ? true : false)
                  .setValue(`9`),
                new StringSelectMenuOptionBuilder()
                  .setLabel(`October`)
                  .setDefault(new Date().getMonth() === 9 ? true : false)
                  .setValue(`10`),
                new StringSelectMenuOptionBuilder()
                  .setLabel(`November`)
                  .setDefault(new Date().getMonth() === 10 ? true : false)
                  .setValue(`11`),
                new StringSelectMenuOptionBuilder()
                  .setLabel(`December`)
                  .setDefault(new Date().getMonth() === 11 ? true : false)
                  .setValue(`12`),
              ),
          ),

      (label) =>
        label
          .setLabel(`Year:`)
          .setDescription(`Optional`)
          .setTextInputComponent((textInput) =>
            textInput
              .setCustomId(`birth_year`)
              .setStyle(TextInputStyle.Short)
              .setMinLength(4)
              .setMaxLength(4)
              .setRequired(false)
              .setPlaceholder(new Date().getFullYear().toString()),
          ),
    );

  await interaction.showModal(modal);

  interaction
    .awaitModalSubmit({ time: 60_000 })
    .then(async (newI) => {
      const birthDate = newI.fields.getTextInputValue(`birth_date`);
      const birthMonth = newI.fields.getStringSelectValues(`birth_month`);
      const birthYear = newI.fields.getTextInputValue(`birth_year`);

      if (
        !dayjs(
          `${!birthYear ? 2000 : birthYear}-${parseInt(birthMonth) < 10 ? `0` + birthMonth : birthMonth}-${birthDate}`,
          `YYYY-MM-DD`,
          true,
        ).isValid()
      ) {
        // Only use 2000 in birth year to validate date when year not provided. Does not get saved.
        newI.reply({
          content: `☠️ Invalid birth date`,
          flags: MessageFlags.Ephemeral,
        });
      } else {
        const [viewPlayer] = await dbTables.User.findOrCreate({
          where: {
            user_id: interaction.user.id,
          },
        });
        await viewPlayer.update({
          birthday: `${!birthYear ? `0000` : birthYear}-${birthMonth}-${birthDate}`,
        });
        await viewPlayer.reload();

        newI.reply({
          content: `✅ Your birthday has been set.`,
          flags: MessageFlags.Ephemeral,
        });
      }
    })
    .catch((err) => {
      logger.error(err, "Set birthday error");
    });
};

const handleBirthday = async (interaction) => {
  // We don't check year, so we need to just double check the month has that date
  // Just assume Feb 29 will work.
  await interaction.deferReply();
  const now = new Date();
  const birthdayCountdown = new Date();

  const allBirthdays = await dbTables.User.findAll({
    where: {
      birthday: {
        [Op.not]: null,
      },
    },
  });
  const currentBirthday = allBirthdays.find(
    (b) => b.user_id === interaction.user.id,
  );
  const alter = {
    day: 0,
    month: 0,
  };

  let ageNext = 0;
  if (currentBirthday) {
    const birthdayObject = currentBirthday.birthday.split("-");

    birthdayCountdown.setMonth(parseInt(birthdayObject[1]) - 1);
    birthdayCountdown.setDate(parseInt(birthdayObject[2]));

    if (
      birthdayCountdown.getMonth() < now.getMonth() ||
      (birthdayCountdown.getMonth() == now.getMonth() &&
        birthdayCountdown.getDate() < now.getDate())
    ) {
      birthdayCountdown.setFullYear(birthdayCountdown.getFullYear() + 1);
    }

    if (birthdayObject[0] !== "0000") {
      const birthYear = parseInt(birthdayObject[0]);
      ageNext = birthdayCountdown.getFullYear() - birthYear;
    }
  }

  const getBirthdayContainer = async () => {
    const calendarContainer = new ContainerBuilder().setAccentColor(
      Colors.Aqua,
    );

    const headerContent = [
      `### Calendar`,
      `> -# Your ${ageNext > 0 ? setOrdinal(ageNext) + " " : ""}birthday is ${!currentBirthday ? "not set" : `${time(birthdayCountdown, `R`)}`}`,
    ];

    if (!currentBirthday) {
      calendarContainer.addSectionComponents((section) =>
        section
          .addTextDisplayComponents((textDisplay) =>
            textDisplay.setContent(headerContent.join("\n")),
          )
          .setButtonAccessory((button) =>
            button
              .setCustomId("set_birthday")
              .setLabel("Set Birthday")
              .setStyle(ButtonStyle.Primary),
          ),
      );
    } else {
      calendarContainer.addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent(headerContent.join("\n")),
      );
    }

    calendarContainer.addActionRowComponents((actionRow) =>
      actionRow.setComponents(
        new ButtonBuilder()
          .setCustomId(`previous`)
          .setEmoji(`🔼`)
          .setLabel(`Day`)
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`previous_week`)
          .setEmoji(`🔼`)
          .setLabel(`Week`)
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`previous_month`)
          .setEmoji(`🔼`)
          .setLabel(`Month`)
          .setStyle(ButtonStyle.Secondary),
      ),
    );

    for (let c = alter.day; c < alter.day + 7; c++) {
      const adjustDate = new Date();
      adjustDate.setDate(now.getDate() + c);
      if (alter.month && alter.month > 0) {
        adjustDate.setMonth(adjustDate.getMonth() + alter.month);
      }
      const birthdayUsers = allBirthdays.filter(
        (b) =>
          b.birthday.split(`-`)[0] == adjustDate.getDate() &&
          parseInt(b.birthday.split(`-`)[1]) - 1 == adjustDate.getMonth(),
      );
      const birthdayRows = [];

      for (const b of Object.keys(birthdayUsers)) {
        birthdayRows.push(`🎂` + userMention(birthdayUsers[b].user_id));
      }

      calendarContainer
        .addSeparatorComponents((separator) => separator)
        .addTextDisplayComponents((textDisplay) =>
          textDisplay.setContent(
            `**${dayList[adjustDate.getDay()]}, ${adjustDate.getDate()} ${
              monthList[adjustDate.getMonth()]
            } ${adjustDate.getFullYear()}**\n${birthdayRows.join(`\n`)}`,
          ),
        );
    }
    calendarContainer
      .addSeparatorComponents((separator) => separator)
      .addActionRowComponents((actionRow) =>
        actionRow.setComponents(
          new ButtonBuilder()
            .setCustomId(`next`)
            .setEmoji(`🔽`)
            .setLabel(`Day`)
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId(`next_week`)
            .setEmoji(`🔽`)
            .setLabel(`Week`)
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId(`next_month`)
            .setEmoji(`🔽`)
            .setLabel(`Month`)
            .setStyle(ButtonStyle.Secondary),
        ),
      );
    return calendarContainer;
  };

  // send message
  // start collector

  let birthdayContainer = await getBirthdayContainer();
  const response = await interaction.followUp({
    flags: MessageFlags.IsComponentsV2,
    components: [birthdayContainer],
    withResponse: true,
  });

  const collector = response.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 120000,
  });

  collector.on(`collect`, async (i) => {
    if (i.user.id !== interaction.user.id) {
      await i.reply({
        content: `You cannot use this.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    } else if (i.customId === "set_birthday") {
      birthdayModal(i);
    } else {
      await i.deferUpdate();

      if (i.customId == `next`) {
        alter.day = alter.day + 1;
      } else if (i.customId == `previous`) {
        alter.day = alter.day - 1;
      } else if (i.customId == `previous_week`) {
        alter.day = alter.day - 7;
      } else if (i.customId == `next_week`) {
        alter.day = alter.day + 7;
      } else if (i.customId == `previous_month`) {
        alter.month = alter.month - 1;
      } else if (i.customId == `next_month`) {
        alter.month = alter.month + 1;
      }
      birthdayContainer = await getBirthdayContainer();
      await interaction.editReply({
        components: [birthdayContainer],
      });
    }
  });

  collector.on(`end`, async () => {
    birthdayContainer.components.splice(1, 1); // remove top actions
    birthdayContainer.components.pop(); // remove bottom actions
    await interaction.editReply({
      components: [birthdayContainer],
    });
  });
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName(`calendar`)
    .setDescription(`View calendar`)
    .setContexts(0),

  async execute(interaction) {
    handleBirthday(interaction);
  },
};
