const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const dbTables = require("../utils/database");
const logger = require("../utils/logger");
const isValidHex = require("../utils/isValidHex");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("role")
    .setContexts(0)
    .setDescription("Create role or set your role color.")
    .addStringOption((option) =>
      option
        .setName("primary_colour")
        .setDescription("The primary colour for your role.")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("secondary_colour")
        .setDescription(
          "The secondary colour for your role (if gradients enabled).",
        )
        .setRequired(false),
    ),
  async execute(interaction) {
    if (!isValidHex(interaction.options.getString("primary_colour"))) {
      return await interaction.reply({
        content: `${interaction.options.getString("primary_colour")} is not a valid hex code.`,
        flags: MessageFlags.Ephemeral,
      });
    } else if (!isValidHex(interaction.options.getString("secondary_colour"))) {
      return await interaction.reply({
        content: `${interaction.options.getString("primary_colour")} is not a valid hex code.`,
        flags: MessageFlags.Ephemeral,
      });
    } else {
      try {
        const [currentRole, created] = await dbTables.User.findOrCreate({
          where: { user_id: interaction.user.id },
        });

        if (created) {
          const role = await interaction.guild.roles.create({
            name: interaction.user.username,
            colors: {
              primaryColor: !interaction.options.getString("primary_colour")
                ? undefined
                : `${interaction.options.getString("primary_colour") && !interaction.options.getString("primary_colour").charAt(0) !== "#" ? "#" : ""}${interaction.options.getString(
                    "primary_colour",
                  )}`,
              secondaryColor: !interaction.options.getString("secondary_colour")
                ? null
                : `${interaction.options.getString("secondary_colour") && !interaction.options.getString("secondary_colour").charAt(0) !== "#" ? "#" : ""}${interaction.options.getString(
                    "secondary_colour",
                  )}`,
            },
            reason: `Role created for ${interaction.user.username}`,
          });

          await currentRole.update({ role_id: role.id });

          await interaction.member.roles.add(role);
          await interaction.reply(`${role} created.`);
        } else {
          const role = await interaction.guild.roles.fetch(currentRole.role_id);
          if (!interaction.member.roles.cache.has(role.id)) {
            await interaction.member.roles.add(role);
          }

          await role.setColors({
            primaryColor: !interaction.options.getString("primary_colour")
              ? undefined
              : interaction.options.getString("primary_colour"),
            secondaryColor: !interaction.options.getString("secondary_colour")
              ? undefined
              : interaction.options.getString("secondary_colour"),
          });
          await interaction.reply(`${role} updated.`);
        }
      } catch (error) {
        logger.error(error, "Role create error");
        await interaction.reply({
          content: `There was an error updating your role.`,
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
};
