const {
  SlashCommandBuilder,
  ContainerBuilder,
  MessageFlags,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require("discord.js");
const dbTables = require("../utils/database");
const { defaultColour } = require("../utils/config");
const emojiMap = require("../utils/emojiMap");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setContexts(0)
    .setDescription("View yours or someone else's queue")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Which queue?")
        .setRequired(true)
        .addChoices(
          { value: "boardgame", name: "Boardgame" },
          { value: "movie", name: "Movie" },
          { value: "show", name: "TV Show" },
        ),
    )
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to view (optional)")
        .setRequired(false),
    ),
  async execute(interaction) {
    await interaction.deferReply();
    let currentPage = 0;
    const viewUser = !interaction.options.getUser("user")
      ? interaction.user
      : interaction.options.getUser("user");
    let currentType = interaction.options.getString("type");
    const perPage = 10;
    let serverQueue = await dbTables.UserList.findAll({
      where: {
        user_id: viewUser,
        type: currentType,
      },
    });

    const getServerQueueContainer = (withActions = true) => {
      const container = new ContainerBuilder()
        .setAccentColor(defaultColour)
        .addTextDisplayComponents((textDisplay) =>
          textDisplay.setContent(
            `### ${viewUser.username}'s Queue\n-# Page **${currentPage + 1}** of **${serverQueue.length < 1 ? 1 : Math.ceil(serverQueue.length / perPage)}**`,
          ),
        );
      if (serverQueue.length < 1) {
        container.addTextDisplayComponents((textDisplay) =>
          textDisplay.setContent(
            "No items. Use **/watch** or **/play** to add items to your queue.",
          ),
        );
      } else {
        // display items in container
        // Container to display title, year, cover image
        // Do we need a select menu or something to "mark as watched?"
      }

      container.addActionRowComponents((actionRow) =>
        actionRow.setComponents(
          new StringSelectMenuBuilder()
            .setCustomId("select_type")
            .setPlaceholder("Change queue")
            .addOptions(
              new StringSelectMenuOptionBuilder()
                .setValue("boardgame")
                .setLabel("Boardgames")
                .setEmoji(emojiMap.boardgames)
                .setDefault(
                  currentType === "boardgame" && withActions ? true : false,
                ),
              new StringSelectMenuOptionBuilder()
                .setValue("movie")
                .setLabel("Movies")
                .setEmoji(emojiMap.movies)
                .setDefault(
                  currentType === "movie" && withActions ? true : false,
                ),
              new StringSelectMenuOptionBuilder()
                .setValue("show")
                .setLabel("TV Shows")
                .setEmoji(emojiMap.shows)
                .setDefault(
                  currentType === "show" && withActions ? true : false,
                ),
            ),
        ),
      );

      if (serverQueue.length > 0) {
        // Add buttons
        container.addActionRowComponents((actionRow) =>
          actionRow.setComponents(
            new ButtonBuilder()
              .setCustomId("first_page")
              .setStyle(ButtonStyle.Secondary)
              .setEmoji(emojiMap.firstPage)
              .setDisabled(currentPage <= 0 && withActions ? true : false),
            new ButtonBuilder()
              .setCustomId("back_page")
              .setStyle(ButtonStyle.Secondary)
              .setEmoji(emojiMap.backPage)
              .setDisabled(currentPage <= 0 && withActions ? true : false),
            new ButtonBuilder()
              .setCustomId("next_page")
              .setStyle(ButtonStyle.Secondary)
              .setEmoji(emojiMap.nextPage)
              .setDisabled(
                currentPage >= Math.ceil(serverQueue.length / perPage) &&
                  withActions
                  ? true
                  : false,
              ),
            new ButtonBuilder()
              .setCustomId("last_page")
              .setStyle(ButtonStyle.Secondary)
              .setEmoji(emojiMap.lastPage)
              .setDisabled(
                currentPage >= Math.ceil(serverQueue.length / perPage) &&
                  withActions
                  ? true
                  : false,
              ),
          ),
        );
      }

      return container;
    };

    await interaction.followUp({
      components: [getServerQueueContainer()],
      flags: MessageFlags.IsComponentsV2,
    });

    const response = await interaction.fetchReply();

    const collector = response.createMessageComponentCollector({
      time: 120_000,
    });
    collector.on("collect", async (i) => {
      await i.deferUpdate();
      if (i.user.id === interaction.user.id) {
        if (i.customId === "select_type") {
          // Select menu
          currentType = i.values[0];
          serverQueue = await dbTables.UserList.findAll({
            where: {
              user_id: viewUser,
              type: currentType,
            },
          });
          await interaction.editReply({
            components: [getServerQueueContainer()],
          });
        } else {
          // Page button
          switch (i.customId) {
            case "first_page":
              currentPage = 0;
              break;
            case "back_page":
              currentPage--;
              break;
            case "next_page":
              currentPage++;
              break;
            case "last_page":
              serverQueue.length < 1
                ? 0
                : Math.ceil(serverQueue.length / perPage) - 1;
              break;
          }
          await interaction.editReply({
            components: [getServerQueueContainer()],
          });
        }
      } else {
        i.reply({
          content: `These buttons aren't for you!`,
          flags: MessageFlags.Ephemeral,
        });
      }
    });
    collector.on("end", async () => {
      await interaction.editReply({
        components: [getServerQueueContainer(false)],
      });
    });
  },
};
