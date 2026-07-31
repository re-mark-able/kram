// Search a movie or tv show
const {
  SlashCommandBuilder,
  MessageFlags,
  ContainerBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const logger = require("../utils/logger");
const { defaultColour } = require("../utils/config");
const dbTables = require("../utils/database");
const tmdb = require("../utils/tmdb");
const watchModal = require("../utils/watchModal");

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
    let results = await tmdb.search(
      interaction.options.getString("search_string"),
      interaction.options.getString("search_type"),
    );

    if (results.length < 1) {
      // no results
      return await interaction.reply({
        content: "No results found",
        flags: MessageFlags.Ephemeral,
      });
    }

    let serverQueue = await dbTables.ServerList.findAll({
      where: {
        guild_id: interaction.guild.id,
      },
    });

    let userQueue = await dbTables.UserList.findAll({
      where: {
        user_id: interaction.user.id,
      },
    });

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
              .setURL(`${tmdb.imgURLprefix}${currentResult.poster_path}`),
          ),
        );

      if (results.length > 1 && withActions === true) {
        // add select menu with extras
        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId("change_title")
          .setPlaceholder("Change result");

        for (const result of results) {
          const option = new StringSelectMenuOptionBuilder()
            .setValue(result.id.toString())
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

      const userFound = userQueue.find(
        (item) => item.item_id == currentResult.id,
      );
      const serverFound = serverQueue.find(
        (item) => item.item_id == currentResult.id,
      );
      if (withActions) {
        responseContainer
          .addTextDisplayComponents((textDisplay) =>
            textDisplay.setContent(`-# **${interaction.user.username}:**`),
          )
          .addActionRowComponents((actionRow) =>
            actionRow.setComponents(
              new ButtonBuilder()
                .setCustomId("user_queue")
                .setLabel(
                  !userFound
                    ? "Add to your queue"
                    : !userFound.rating || userFound.rating === 0
                      ? "Remove from your queue"
                      : "Add to your queue (rewatch)",
                )
                .setDisabled(!withActions ? true : false)
                .setStyle(
                  !userFound
                    ? ButtonStyle.Primary
                    : !userFound.rating || userFound.rating === 0
                      ? ButtonStyle.Danger
                      : ButtonStyle.Secondary,
                ),
              new ButtonBuilder()
                .setCustomId("user_watch")
                .setLabel(
                  !userFound || userFound.rating === 0
                    ? "Mark as user watched"
                    : "Mark as user unwatched",
                )
                .setDisabled(!withActions ? true : false)
                .setStyle(
                  !userFound || userFound.rating === 0
                    ? ButtonStyle.Primary
                    : ButtonStyle.Danger,
                ),
            ),
          );
        responseContainer
          .addTextDisplayComponents((textDisplay) =>
            textDisplay.setContent(`-# **${interaction.guild.name}:**`),
          )
          .addActionRowComponents((actionRow) =>
            actionRow.setComponents(
              new ButtonBuilder()
                .setCustomId("server_queue")
                .setLabel(
                  !serverFound || (!serverFound.rating && !serverFound.in_queue)
                    ? "Add to server queue"
                    : !serverFound.rating || serverFound.rating === 0
                      ? "Remove from server queue"
                      : "Add to server queue (rewatch)",
                )
                .setDisabled(!withActions ? true : false)
                .setStyle(
                  !serverFound || (!serverFound.rating && !serverFound.in_queue)
                    ? ButtonStyle.Primary
                    : !serverFound.rating || serverFound.rating === 0
                      ? ButtonStyle.Danger
                      : ButtonStyle.Secondary,
                ),
              new ButtonBuilder()
                .setCustomId("server_watch")
                .setLabel(
                  !serverFound || serverFound.rating === 0
                    ? "Mark as server watched"
                    : "Mark as server unwatched",
                )
                .setDisabled(!withActions ? true : false)
                .setStyle(
                  !serverFound || serverFound.rating === 0
                    ? ButtonStyle.Primary
                    : ButtonStyle.Danger,
                ),
            ),
          );
      }
      return responseContainer;
    };

    const response = await interaction.reply({
      components: [await getResultContainer()],
      flags: MessageFlags.IsComponentsV2,
      withResponse: true,
    });

    const responseFilter = (i) => i.user.id === interaction.user.id;

    const collector = response.resource.message.createMessageComponentCollector(
      {
        time: 60_000,
        filter: responseFilter,
      },
    );
    collector.on("collect", async (i) => {
      if (i.customId === "change_title") {
        await i.deferUpdate();
        currentResult = results.find((r) => r.id === i.values[0]);

        await interaction.editReply({
          components: [await getResultContainer()],
        });
      } else if (i.customId === "server_queue") {
        await i.deferUpdate();
        const serverItem = serverQueue.find(
          (r) => r.item_id == currentResult.id,
        );
        if (!serverItem) {
          await dbTables.ServerList.create({
            in_queue: true,
            item_id: currentResult.id,
            guild_id: interaction.guild.id,
            type: interaction.options.getString("search_type"),
          });
        } else {
          await dbTables.ServerList.update(
            { in_queue: !serverItem.in_queue },
            {
              where: {
                item_id: currentResult.id,
                guild_id: interaction.guild.id,
                type: interaction.options.getString("search_type"),
              },
            },
          );
        }
        serverQueue = await dbTables.ServerList.findAll({
          where: {
            guild_id: interaction.guild.id,
          },
        });
        await interaction.editReply({
          components: [await getResultContainer()],
        });
      } else if (i.customId === "user_queue") {
        await i.deferUpdate();
        const userItem = userQueue.find((r) => r.item_id == currentResult.id);
        if (!userItem) {
          await dbTables.UserList.create({
            in_queue: true,
            item_id: currentResult.id,
            user_id: interaction.user.id,
            type: interaction.options.getString("search_type"),
          });
        } else {
          await dbTables.UserList.update(
            { in_queue: !userItem.in_queue },
            {
              where: {
                item_id: currentResult.id,
                user_id: interaction.user.id,
                type: interaction.options.getString("search_type"),
              },
            },
          );
        }
        userQueue = await dbTables.UserList.findAll({
          where: {
            user_id: interaction.user.id,
          },
        });
        await interaction.editReply({
          components: [await getResultContainer()],
        });
      } else if (i.customId === "server_watch") {
        const modal = watchModal({
          title: !currentResult.title
            ? currentResult.original_name
            : currentResult.title,
          year: !currentResult.first_air_date
            ? currentResult.release_date.split("-")[0]
            : currentResult.first_air_date.split("-")[0],
        });
        await i.showModal(modal);
      } else if (i.customId === "user_watch") {
        const modal = watchModal({
          title: !currentResult.title
            ? currentResult.original_name
            : currentResult.title,
          year: !currentResult.first_air_date
            ? currentResult.release_date.split("-")[0]
            : currentResult.first_air_date.split("-")[0],
        });
        await i.showModal(modal);
      }
    });

    collector.on("end", async () => {
      await interaction.editReply({
        components: [await getResultContainer(false)],
      });
    });

    return;
  },
};
