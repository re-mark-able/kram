module.exports = {
  testMode: process.env.TESTMODE || undefined,
  databaseUrl: process.env.DATABASE_URL || undefined,
  guildId: process.env.GUILD_ID,
  channels: {
    welcome: "1521811800713068645",
    development: "1521698516819251272",
    botLogs: "1529025931195191326",
  },
  tmdbKey: process.env.TMDB_KEY || undefined,
  tmdbToken: process.env.TMDB_TOKEN || undefined,
  bggToken: process.env.BGG_TOKEN || undefined,
  defaultColour: 0xffd1a5,
};
