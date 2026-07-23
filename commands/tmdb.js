// Search a movie or tv show
const {
  SlashCommandBuilder,
  MessageFlags,
  ContainerBuilder,
  Colors,
  AttachmentBuilder,
  MediaGalleryBuilder,
} = require("discord.js");
const logger = require("../utils/logger");
const { tmdb, defaultColour } = require("../utils/config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tmdb")
    .setDescription("Search for a movie or tv show")
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

      const first = json.results[0];

      const responseText = [
        `### [${!first.title ? first.original_name : first.title} (${!first.first_air_date ? first.release_date.split("-")[0] : first.first_air_date.split("-")[0]})](<https://www.themoviedb.org/${interaction.options.getString("search_type")}/${first.id}>)`,
        `> ${first.overview}`,
      ];
      if (json.results.length > 1) {
        responseText.push(
          ``,
          `-# _... and ${json.results.length - 1} other results_`,
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
              .setDescription(!first.title ? first.original_name : first.title)
              .setURL(
                `https://image.tmdb.org/t/p/original/${first.poster_path}`,
              ),
          ),
        );

      return await interaction.reply({
        components: [responseContainer],
        flags: MessageFlags.IsComponentsV2,
      });
    } catch (error) {
      logger.error(error, "Failed to search TMDB:");

      return await interaction.reply({
        content: "There was an error searching.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
