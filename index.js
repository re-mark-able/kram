const { Client, Options, GatewayIntentBits, Partials, Collection } = require(
  `discord.js`,
);
const logger = require(`./utils/logger.js`);
const path = require(`node:path`);
const fs = require(`node:fs`);

/*
process.on(`uncaughtException`, (err) => {
  logger.error(err, `Uncaught Exception`);
});
*/

logger.info(`*** BOT STARTING ***`);

const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.GuildMember,
    Partials.User,
  ],
  sweepers: {
    ...Options.DefaultSweeperSettings,
    messages: {
      interval: 3_600, // Every hour.
      lifetime: 1_800, // Remove messages older than 30 minutes.
    },
    users: {
      interval: 3_600, // Every hour.
      filter: () => (user) => user.bot && user.id !== user.client.user.id, // Remove all bots.
    },
  },
  rest: {
    makeRequest: (url, init) => fetch(url, init),
  },
});

/* Setup collections */
client.commands = new Collection();

/* Setup commands */
const commandsPath = path.join(__dirname, "commands");

const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  // Set a new item in the Collection with the key as the command name and the value as the exported module
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
    logger.info(`Loaded command: ${command.data.name}`);
  } else {
    logger.warn(
      `The command at ${filePath} is missing a required "data" or "execute" property.`,
    );
  }
}

/* Setup events */
const eventsPath = path.join(__dirname, `events`);
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(`.js`));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.login(process.env.TOKEN);
