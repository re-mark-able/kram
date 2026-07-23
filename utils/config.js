module.exports = {
  testMode: process.env.TESTMODE || undefined,
  databaseUrl: process.env.DATABASE_URL || undefined,
  channels: {
    welcome: "1521811800713068645",
    development: "1521698516819251272",
  },
  tmdb: {
    key: process.env.TMDB_KEY || undefined,
    token: process.env.TMDB_TOKEN || undefined,
  },
  defaultColour: 0xffd1a5,
};
