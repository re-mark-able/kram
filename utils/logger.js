const pino = require(`pino`);

const transport = pino.transport({
  targets: [
    {
      target: `pino-pretty`,
      options: {
        translateTime: `SYS:yyyy-mm-dd HH:MM:ss`,
        colorize: true,
        ignore: `pid,hostname`,
      },
    },
  ],
});

module.exports = pino(
  {
    level: [`info`],
  },
  transport,
);
