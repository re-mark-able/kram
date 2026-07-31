// Search a movie or tv show
const {
  SlashCommandBuilder,
  MessageFlags,
  ContainerBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ComponentType,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const logger = require("../utils/logger");
const { tmdb, defaultColour } = require("../utils/config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("watch")
    .setDescription("Search for a movie or tv show, rate it or queue it.")
    .addStringOption((option) =>
      option
        .setName("search_type")
        .setDescription("Movie or Show")
        .addChoices(
          { name: "Movie", value: "movie" },
          { name: "Show", value: "tv" },
        )
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("search_string")
        .setDescription("The string to search")
        .setRequired(true),
    ),
  async execute(interaction) {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/${interaction.options.getString("search_type")}?include_adult=false&language=en-US&page=1&query=${interaction.options.getString("search_string")}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${tmdb.token}`,
          },
        },
      );

      const json = await res.json();

      if (json.results.length < 1) {
        // no results
        return await interaction.reply({
          content: "No results found",
          flags: MessageFlags.Ephemeral,
        });
      }

      const results = json.results;

      results.sort(
        (b, a) =>
          parseInt(
            !a.first_air_date
              ? a.release_date.split("-")[0]
              : a.first_air_date.split("-")[0],
          ) -
          parseInt(
            !b.first_air_date
              ? b.release_date.split("-")[0]
              : b.first_air_date.split("-")[0],
          ),
      );

      let currentResult = results[0];

      const getResultContainer = (withActions = true) => {
        const responseText = [
          `### [${!currentResult.title ? currentResult.original_name : currentResult.title} (${!currentResult.first_air_date ? currentResult.release_date.split("-")[0] : currentResult.first_air_date.split("-")[0]})](<https://www.themoviedb.org/${interaction.options.getString("search_type")}/${currentResult.id}>)`,
          `> ${currentResult.overview}`,
        ];
        if (results.length > 1) {
          responseText.push(
            ``,
            `-# _... and ${results.length - 1} other results_`,
          );
        }

        const responseContainer = new ContainerBuilder()
          .setAccentColor(defaultColour)
          .addTextDisplayComponents((textDisplay) =>
            textDisplay.setContent(responseText.join("\n")),
          )
          .addMediaGalleryComponents((mediaGallery) =>
            mediaGallery.addItems((mediaGalleryItem) =>
              mediaGalleryItem
                .setDescription(
                  !currentResult.title
                    ? currentResult.original_name
                    : currentResult.title,
                )
                .setURL(
                  `https://image.tmdb.org/t/p/original/${currentResult.poster_path}`,
                ),
            ),
          );

        if (results.length > 1 && withActions === true) {
          // add select menu with extras
          const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("change_title")
            .setPlaceholder("Change result");

          for (const [id, result] of results.entries()) {
            const option = new StringSelectMenuOptionBuilder()
              .setValue(id.toString())
              .setDefault(result.id === currentResult.id ? true : false)
              .setLabel(
                `${!result.title ? result.original_name : result.title} [${!result.first_air_date ? result.release_date.split("-")[0] : result.first_air_date.split("-")[0]}]`,
              );

            selectMenu.addOptions(option);
          }
          responseContainer.addActionRowComponents((actionRow) =>
            actionRow.setComponents(selectMenu),
          );
        }
        responseContainer.addActionRowComponents((actionRow) =>
          actionRow.setComponents(
            new ButtonBuilder()
              .setCustomId("watch")
              .setLabel("Mark as Watched")
              .setDisabled(!withActions ? true : false)
              .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
              .setCustomId("server_watch")
              .setLabel("Mark as Server Watched")
              .setDisabled(!withActions ? true : false)
              .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
              .setCustomId("queue")
              .setLabel("Add to queue")
              .setDisabled(!withActions ? true : false)
              .setStyle(ButtonStyle.Success),
          ),
        );
        return responseContainer;
      };

      const response = await interaction.reply({
        components: [await getResultContainer()],
        flags: MessageFlags.IsComponentsV2,
        withResponse: true,
      });

      const responseFilter = (i) => i.user.id === interaction.user.id;

      const collector =
        response.resource.message.createMessageComponentCollector({
          componentType: ComponentType.StringSelect,
          time: 60_000,
          filter: responseFilter,
        });
      collector.on("collect", async (i) => {
        await i.deferUpdate();

        currentResult = results[parseInt(i.values[0])];

        await interaction.editReply({
          components: [await getResultContainer()],
        });
      });

      collector.on("end", async () => {
        await interaction.editReply({
          components: [await getResultContainer(false)],
        });
      });

      return;
    } catch (error) {
      logger.error(error, "Failed to search TMDB:");

      return await interaction.reply({
        content: "There was an error searching.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
