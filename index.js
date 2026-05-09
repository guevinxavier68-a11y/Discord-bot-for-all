require('dotenv').config();
const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.GuildMember],
});

client.commands = new Collection();

const commandFolders = fs.readdirSync(path.join(__dirname, 'src/commands'));
for (const folder of commandFolders) {
  const commandFiles = fs
    .readdirSync(path.join(__dirname, `src/commands/${folder}`))
    .filter((f) => f.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./src/commands/${folder}/${file}`);
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
    }
  }
}

const eventFiles = fs
  .readdirSync(path.join(__dirname, 'src/events'))
  .filter((f) => f.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(`./src/events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

client.login(process.env.DISCORD_TOKEN);
