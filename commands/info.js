const {
  SlashCommandBuilder,
  ContainerBuilder,
  Colors,
  MessageFlags,
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

    let totalSeconds = interaction.client.uptime / 1000;

    // Calculate time units
    const days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const cpuStats = await si.cpu();
    const cpuTemp = await si.cpuTemperature();
    const os = await si.osInfo();
    const mem = await si.mem();
    const currentLoad = await si.currentLoad();
    const processes = await si.processLoad();
    const nodeProcess = processes.find((p) => p.proc == "node");
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
      `> \`OS:       \`: ${os.distro} ${os.release}`,
      `> \`Node:     \`: ${process.version}`,
      `> \`Discord.js\`: ${packageJSON.dependencies["discord.js"].replace("^", "")}`,
      // `> \`Memory    \`: ${(nodeProcess.mem / 1024 / 1024).toFixed(2)} (${((nodeProcess.mem / mem.total) * 100).toFixed(2)}%)`,
      // `> \`CPU       \`: ${nodeProcess.cpu.toFixed(2)}%`,
      `-# 🤖 **${interaction.client.user.username}**`,
      `> \`Guilds    \`: ${interaction.client.guilds.cache.size}`,
      `> \`Users     \`: ${interaction.client.users.cache.size}`,
      `> \`Ping      \`: ${websocketPing}ms`,
      `> \`Shards    \`: ${interaction.client.ws.totalShards}`,
      `> \`Uptime:   \`: ${days}d ${hours}h ${minutes}m ${seconds}s`,
    ];

    const outputContainer = new ContainerBuilder()
      .setAccentColor(Colors.DarkAqua)
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent(output.join("\n")),
      );

    await interaction.followUp({
      components: [outputContainer],
      flags: MessageFlags.IsComponentsV2,
    });
  },
};
