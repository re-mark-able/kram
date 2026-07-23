# KRAM Discord bot

A remarkable creation.
PROD Bot invite: https://discord.com/oauth2/authorize?client_id=1515144863006330880

Kram utilises Discord.JS v14. You can find more infomation and examples for use at https://discordjs.guide

## Development

**Prerequisites:**

- You will need your own Discord Application with token. Get one via the [Discord Developer Portal](https://discord.com/developers/home)
- Your own server to test it in
- Create a `.env` file with:

```plaintext
TESTMODE=1
TOKEN={your token}
CLIENT_ID={your client id}
GUILD_ID={your guild id}
ADMIN={your user id}
```

**Environment Variabes**
Store in `utils/config.js` and refer to any process.env

**Running the bot in development:**

- Fork repository
- `npm install`
- `npm run dev`
- The bot will use an SQLite database if TESTMODE is set above.

**Pull requests**
On creation of a pull request to main, it will commence lint checks. You should check manually before submitting by using:
`npm run lint`

## Deployment

When merged with the `main` branch, it will immediately deploy the update to the bot.

## Logging

Avoid `console.log` and `console.error`. To utilise pino, use `logger.info` and `logger.error`
