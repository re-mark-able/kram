const {
  Events,
  ChannelType,
  time,
  ContainerBuilder,
  PermissionsBitField,
  MessageFlags,
} = require(`discord.js`);

const responses = [
  `It is certain`,
  `It is decidedly so`,
  `Without a doubt`,
  `Most likely`,
  `Outlook good`,
  `Yes`,
  `Signs point to yes`,
  `Don't count on it`,
  `My reply is no`,
  `My sources say no`,
  `Outlook not so good`,
  `Very doubtful`,
  `You know I can't answer that.`,
  `Reply hazy, try again`,
  `Ask again later`,
  `Better not tell you now`,
  `Cannot predict now`,
  `Concentrate and ask again`,
];

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;

    if (message.content.toLowerCase() == "hi mark") {
      message.reply("https://tenor.com/bkJF4.gif");
    } else if (message.content.includes("<@765796161499824148>")) {
      message.reply("https://larry-games.github.io/public/img/mark.gif");
    } else if (
      message.mentions.has(message.client.user.id) &&
      message.content.charAt(message.content.length - 1) == "?"
    ) {
      const randomIndex = Math.floor(Math.random() * responses.length);
      const randomResponse = responses[randomIndex];
      message.reply(randomResponse);
    }
  },
};
