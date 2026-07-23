const {
  SlashCommandBuilder,
  ContainerBuilder,
  MessageFlags,
  AttachmentBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ComponentType,
  ActionRowBuilder,
} = require("discord.js");
const colourNames = require("../json/colours.json");
const { createCanvas } = require("@napi-rs/canvas");
const logger = require("../utils/logger");

const createColourImage = (hex) => {
  const canvas = createCanvas(180, 180);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = hex;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  return new AttachmentBuilder(canvas.toBuffer(`image/png`), {
    name: `${hex.replace("#", "")}.png`,
  });
};

const hexStringToARGB = (hexString) => {
  let clean = hexString.replace("#", "");
  // Handle shorthand (e.g., #F00 -> #FF0000)
  if (clean.length === 3) {
    clean = clean
      .split("")
      .map((c) => c + c)
      .join("");
  }
  // Extract RGB
  const r = parseInt(clean.substr(0, 2), 16);
  const g = parseInt(clean.substr(2, 2), 16);
  const b = parseInt(clean.substr(4, 2), 16);
  // Combine into 0xRRGGBB format (or 0xAABBGGRR if needed)
  return (r << 16) | (g << 8) | b;
};

const getRGB = (colourStr) => {
  let cleanHex;
  if (typeof colourStr !== "string") {
    if (colourStr < 0) {
      colourStr = 0xffffffff + colourStr + 1;
    }

    // Convert to hex and pad with leading zeros to ensure 6 characters
    let hex = colourStr.toString(16);
    while (hex.length < 6) {
      hex = "0" + hex;
    }
    cleanHex = hex.replace("0x", "");
  } else {
    cleanHex = colourStr.replace("#", "");
  }

  // Parse the 2-digit chunks for R, G, and B
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  return { r: r, g: g, b: b, hex: cleanHex };
};

const getHexName = (hex) => {
  const foundHex = Object.keys(colourNames).find(
    (c) => colourNames[c] === hex.toLowerCase(),
  );

  return !foundHex ? null : foundHex;
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("colour")
    .setContexts(0)
    .setDescription("View colour info")
    .addStringOption((option) =>
      option
        .setName("display_colour")
        .setDescription("Input hex (#) or name to display (optional)")
        .setRequired(false),
    )
    .addRoleOption((role) =>
      role
        .setName("role")
        .setDescription("Select to display the role's colour.")
        .setRequired(false),
    ),
  async execute(interaction) {
    const components = [];
    const files = [];

    const getHexSection = async (hex) => {
      let currentHex = hex;
      if (typeof currentHex === "string" && currentHex.charAt(0) !== "#") {
        // assume it's a name
        if (!colourNames[currentHex.toLowerCase()]) {
          return null;
        }
        currentHex = colourNames[currentHex.toLowerCase()];
      }

      const rgb = getRGB(currentHex);
      const responseContent = [
        `### ${currentHex.toUpperCase()}${!getHexName(currentHex) ? "" : " (" + getHexName(currentHex).toUpperCase() + ")"}`,
        `> **HEX:** \`${currentHex}\``,
        `> **RGB:** \`rgb(${rgb.r},${rgb.g},${rgb.b})\``,
      ];

      const responseContainer = new ContainerBuilder()
        .setAccentColor(hexStringToARGB(currentHex))
        .addSectionComponents((section) =>
          section
            .addTextDisplayComponents((textDisplay) =>
              textDisplay.setContent(responseContent.join("\n")),
            )
            .setThumbnailAccessory((thumbnail) =>
              thumbnail.setURL(
                `attachment://${currentHex.replace("#", "")}.png`,
              ),
            ),
        );
      files.push(await createColourImage(currentHex));
      components.push(responseContainer);
    };

    try {
      if (interaction.options.getRole("role")) {
        const role = interaction.options.getRole("role");
        const primary = getRGB(role.colors.primaryColor);
        await getHexSection("#" + primary.hex);
        if (role.colors.secondaryColor) {
          const secondary = getRGB(role.colors.secondaryColor);
          await getHexSection("#" + secondary.hex);
        }
        if (role.colors.tertiaryColor) {
          const tertiary = getRGB(role.colors.tertiaryColor);
          await getHexSection("#" + tertiary.hex);
        }
      } else {
        const currentHex = !interaction.options.getString("display_colour")
          ? "#000000"
          : interaction.options.getString("display_colour");
        await getHexSection(currentHex);
      }

      const allOptions = [];
      for (let i = 0; i < Object.keys(colourNames).length; i += 20) {
        allOptions.push(Object.keys(colourNames).slice(i, i + 20));
      }
      let selectedPage = 0;
      let selectedOption = null;

      const createColourMenu = () => {
        const menu = new StringSelectMenuBuilder()
          .setCustomId("select_colour")
          .setPlaceholder("Select a colour to view");

        if (selectedPage > 0) {
          menu.addOptions(
            new StringSelectMenuOptionBuilder()
              .setLabel("Back page")
              .setEmoji("🔼")
              .setValue("back"),
          );
        }

        for (const option of allOptions[selectedPage]) {
          menu.addOptions(
            new StringSelectMenuOptionBuilder()
              .setDefault(selectedOption === option ? true : false)
              .setLabel(option)
              .setValue(option),
          );
        }

        if (selectedPage < allOptions.length - 1) {
          menu.addOptions(
            new StringSelectMenuOptionBuilder()
              .setLabel("Next page")
              .setEmoji("🔽")
              .setValue("next"),
          );
        }
        components.push(new ActionRowBuilder().setComponents(menu));
      };

      await createColourMenu();

      // Add a select menu to change colour from names

      const response = await interaction.reply({
        files: files,
        components: components,
        flags: MessageFlags.IsComponentsV2,
        withResponse: true,
      });

      const responseFilter = (i) => i.user.id === interaction.user.id;

      const collector =
        response.resource.message.createMessageComponentCollector({
          componentType: ComponentType.StringSelect,
          time: 120_000,
          filter: responseFilter,
        });

      collector.on("collect", async (i) => {
        await i.deferUpdate();

        if (i.values[0] === "back") {
          selectedPage--;
          components.pop();
          await createColourMenu();
          return await interaction.editReply({ components: components });
        } else if (i.values[0] === "next") {
          selectedPage++;
          components.pop();
          await createColourMenu();
          return await interaction.editReply({ components: components });
        } else {
          // select the colour
          while (components.length > 0) {
            components.pop();
          }
          while (files.length > 0) {
            files.pop();
          }
          selectedOption = i.values[0];
          const currentHex = colourNames[selectedOption];

          await getHexSection(currentHex);
          await createColourMenu();

          return await interaction.editReply({
            components: components,
            files: files,
          });
        }
      });

      collector.on("end", async () => {
        components[0].components.pop();
        await interaction.editReply({ components: components });
      });

      return;
    } catch (err) {
      logger.error(err, "Colour display error:");
      return await interaction.reply({
        content: "There was an error",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
