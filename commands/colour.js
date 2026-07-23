const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ContainerBuilder,
  MessageFlags,
  AttachmentBuilder,
  SectionBuilder,
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
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
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

      return await interaction.reply({
        files: files,
        components: components,
        flags: MessageFlags.IsComponentsV2,
      });
    } catch (err) {
      logger.error(err, "Colour display error:");
      return await interaction.reply({
        content: "There was an error",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
