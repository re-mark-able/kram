# KRAM Discord bot

A remarkable creation.

## Development

**Prerequisites:**

- You will need your own Discord Application with token. Get one via the [Discord Developer Portal](https://discord.com/developers/home)
- Your own server to test it in
- Create a `.env` file with:

```plaintext
TOKEN={your token}
CLIENT_ID={your client id}
GUILD_ID={your guild id}
ADMIN={your user id}
```

**Running the bot in development:**

- Fork repository
- `npm install`
- `npm run dev`
- The bot will use an SQLite database for development.

**Pull requests**
On creation of a pull request to main, it will commence lint checks. You can do the check manually before commits by using:
`npm run lint`

## Deployment

When merged with the `main` branch, it will immediately deploy the update to the bot.
