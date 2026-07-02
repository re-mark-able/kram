const {
  SlashCommandBuilder,
  ContainerBuilder,
  Colors,
  MessageFlags,
  userMention,
  time,
} = require("discord.js");
const si = require("systeminformation");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("info")
    .setContexts(0)
    .setDescription("Bot info"),
  async execute(interaction) {
    await interaction.deferReply();

    const websocketPing = interaction.client.ws.ping;

    const uptime = new Date();
    uptime.setSeconds(uptime.getSeconds() - interaction.client.uptime / 1000);

    const cpuStats = await si.cpu();
    const cpuTemp = await si.cpuTemperature();
    const os = await si.osInfo();
    const mem = await si.mem();
    const currentLoad = await si.currentLoad();
    // const processes = await si.processLoad();
    // const nodeProcess = processes.find((p) => p.proc == "node");
    const packageJSON = require("../package.json");

    const output = [
      `### Info`,
      `-# 💻 **CPU**`,
      `> \`Type      \`: ${cpuStats.manufacturer} ${cpuStats.brand}`,
      `> \`Cores     \`: ${cpuStats.cores}`,
      `> \`Temp      \`: ${cpuTemp.main}°C`,
      `> \`Usage     \`: ${currentLoad.currentLoad.toFixed(2)}%`,
      `-# 🧠 **Memory**`,
      `> \`Total     \`: ${(mem.total / 1024 / 1024 / 1024).toFixed(2)}GB`,
      `> \`Used      \`: ${(mem.active / 1024 / 1024 / 1024).toFixed(2)}GB (${((mem.active / mem.total) * 100).toFixed(2)}%)`,
      `-# ⚡ **Process**`,
      `> \`OS:       \`: ${os.distro} ${os.release.replace("v", "")}`,
      `> \`Node:     \`: ${process.version.replace("v", "")}`,
      `> \`Discord.js\`: ${packageJSON.dependencies["discord.js"].replace("^", "")}`,
      // `> \`Memory    \`: ${(nodeProcess.mem / 1024 / 1024).toFixed(2)} (${((nodeProcess.mem / mem.total) * 100).toFixed(2)}%)`,
      // `> \`CPU       \`: ${nodeProcess.cpu.toFixed(2)}%`,
      `-# 🤖 **${interaction.client.user.username}**`,
      `> \`Guilds    \`: ${interaction.client.guilds.cache.size}`,
      `> \`Users     \`: ${interaction.client.users.cache.size}`,
      `> \`Ping      \`: ${websocketPing}ms`,
      `> \`Shards    \`: ${interaction.client.ws.totalShards}`,
      `> \`Uptime:   \`: ${time(uptime, "R")}`,
      `-# 🤖 **${interaction.guild.name}**`,
      `> \`Channels  \`: ${interaction.guild.channels.cache.size}`,
      `> \`Members   \`: ${interaction.guild.memberCount}`,
      `> \`Owner     \`: ${userMention(interaction.guild.ownerId)}`,
      `> \`Level     \`: ${interaction.guild.premiumTier}`,
      `> \`Created:  \`: ${time(interaction.guild.createdAt, "R")}`,
      `> \`Joined:   \`: ${time(interaction.guild.joinedAt, "R")}`,
    ];

    const outputContainer = new ContainerBuilder()
      .setAccentColor(Colors.DarkAqua)
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent(output.join("\n")),
      );

    await interaction.followUp({
      components: [outputContainer],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: {},
    });
  },
};
