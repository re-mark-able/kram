const { SlashCommandBuilder } = require("discord.js");
const dbTables = require("../utils/database");
const logger = require("../utils/logger");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("role")
    .setContexts(0)
    .setDescription("Create role or set your role color.")
    .addStringOption((option) =>
      option
        .setName("primary_colour")
        .setDescription("The primarycolour for your role.")
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName("secondary_colour")
        .setDescription("The colour for your role (if gradients enabled).")
        .setRequired(false),
    ),
  async execute(interaction) {
    const [currentRole, created] = await dbTables.User.findOrCreate({
      where: { user_id: interaction.user.id },
    });

    let failed = false;
    let role;
    if (created) {
      try {
        role = await interaction.guild.roles.create({
          name: interaction.user.username,
          colors: {
            primaryColor: !interaction.options.getString("primary_colour")
              ? undefined
              : interaction.options.getString("primary_colour"),
            secondaryColor: !interaction.options.getString("secondary_colour")
              ? undefined
              : interaction.options.getString("secondary_colour"),
          },
          reason: `Role created for ${interaction.user.username}`,
        });
      } catch (error) {
        failed = true;
        logger.error(error, "Role create error");
      }
      try {
        await interaction.member.roles.add(role);
      } catch (error) {
        failed = true;
        logger.error(error, "Role add error");
      }
    } else {
      role = await interaction.guild.roles.fetch(currentRole.role_id);
      if (!interaction.member.roles.cache.has(role.id)) {
        try {
          await interaction.member.roles.add(role);
        } catch (error) {
          failed = true;
          logger.error(error, "Role add error");
        }
      }
      try {
        await role.setColors({
          primaryColor: !interaction.options.getString("primary_colour")
            ? undefined
            : interaction.options.getString("primary_colour"),
          secondaryColor: !interaction.options.getString("secondary_colour")
            ? undefined
            : interaction.options.getString("secondary_colour"),
        });
      } catch (error) {
        failed = true;
        logger.error(error, "Role update error");
      }
    }

    await interaction.reply(
      `${!failed ? `${role} updated.` : "There was an error updating your role."}`,
    );
  },
};
