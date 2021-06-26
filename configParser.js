const fs = require('fs');
let checkProfile = false;

if (!fs.existsSync('./config/config.json')) throw new Error('Missing config.json check README for instuctions on how to create one.');

const config = require('./config/config.json');

if (!config.STEAM_ACCOUNT_NAME.match(/^[a-zA-Z0-9_]+$/)) throw new Error('STEAM_ACCOUNT_NAME can not contain anything other than a-z, A-Z, 0-9 and _')

if (!config.STEAM_SHARED_SECRET.match(/=$/)) throw new Error('STEAM_SHARED_SECRET should end with an equals (`=`) operator')

if (config.DISCORD_TOKEN.match(/\./g).length !== 2) throw new Error('DISCORD_TOKEN should have 2 dots in it.')

if (!config.DISCORD_BOT_COMMAND_CHANNEL.match(/^[0-9]+$/)) throw new Error('DISCORD_BOT_COMMAND_CHANNEL can only have numbers.')

if (!config.DISCORD_BOT_OWNER_ID.match(/^[0-9]+$/)) throw new Error('DISCORD_BOT_OWNER_ID can only have numbers.')

for (const key in config.BOTS) {
    if (!key.match(/^[0-9]+$/)) throw new Error('STEAMID64 of BOTS can only have numbers.')

    if (!(config.BOTS[key].picture && config.BOTS[key].name)) checkProfile = true;
}

module.exports = [config, checkProfile];