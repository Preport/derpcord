//Discord Stuff

const Discord = require('discord.js');

const [config, checkNameOrPicture] = require('./configParser');

const axios = checkNameOrPicture ? require('axios') : null;

const discord_client = new Discord.Client();

// TODO CHANGE ^^ THIS

//Steam Stuff

const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const format = require('tf2-item-format');
const steam_client = new SteamUser();
let steam_login_flag = false;
const logInOptions = {
    accountName: config.STEAM_ACCOUNT_NAME,
    password: config.STEAM_PASSWORD,
    twoFactorCode: SteamTotp.generateAuthCode(config.STEAM_SHARED_SECRET)
};

//Logging in...

async function logInEvents() {
    discord_client.login(config.DISCORD_TOKEN);
    await new Promise(resolve => discord_client.once('ready', resolve));
    console.log('Discord Bot has logged in!');
    steam_client.logOn(logInOptions);

    await new Promise(resolve => {
        steam_client.once('loggedOn', resolve);
        steam_client.on('error', err => {
            channel_name.send(
                discordMessage(
                    'Error!',
                    `I have failed to log on to Steam! Error is ${err}. Retrying in 30 seconds...`,
                    'red'
                )
            );
            setTimeout(steam_client.logOn, 30000, logInOptions);
        });
        steam_client.on('steamGuard', function (_domain, callback, lastCodeWrong) {
            setTimeout(() => callback(SteamTotp.generateAuthCode(config.STEAM_SHARED_SECRET)), lastCodeWrong ? 30000 : 5000);
        });
    });
    steam_client.setPersona(SteamUser.EPersonaState.Online);
    steam_client.gamesPlayed(440);
    console.log('Steam Bot is now online and game has been set to TF2!');
    steam_login_flag = true;

    const allBots = Object.keys(config.BOTS);
    // Update bot's pictures and names if they are empty :)
    await new Promise((resolve, reject) => {

        let totalAmt = allBots.length;
        allBots.forEach(id => {
            const bot = config.BOTS[id];
            bot.id = id;
            if (!(bot.name && bot.picture)) {
                axios.get(`https://steamcommunity.com/profiles/${id}?xml=1&l=english`)
                    .then(resp => {
                        if (resp.data.includes('The specified profile could not be found.')) return reject(`The profile with the steamID: ${id} doesn't exist`)

                        const lines = resp.data.split('\n')

                        if (!bot.name) {
                            const nameLine = lines.find(i => i.trim().startsWith('<steamID><!'))
                            bot.name = nameLine.substring(nameLine.search('\\\[CDATA\\\[') + 7, nameLine.search(']]></'));
                        }
                        if (!bot.picture) {
                            const picLine = lines.find(i => i.trim().startsWith('<avatarFull><!'))
                            bot.picture = picLine.substring(picLine.search('\\\[CDATA\\\[') + 7, picLine.search(']]></'));
                        }
                        if (--totalAmt === 0) resolve();
                    })
                    .catch(err => {
                        reject(`Couldn't fetch the picture or/and name of a bot: ${err}`)
                    })
            } else if (--totalAmt === 0) resolve();
        })
    })

    let channel_name = discord_client.channels.cache.get(config.DISCORD_BOT_COMMAND_CHANNEL);
    if (!channel_name) throw new Error(`Discord bot does not have permission to channel ${config.DISCORD_BOT_COMMAND_CHANNEL}`);
    channel_name.send(
        discordMessage('Steam Login', 'Logged in to Steam and set my game to TF2! :white_check_mark:', 'green')
    );
}

//Discord Message Embeds Functions
const colors = Object.freeze({
    green: '#00ff00',
    red: '#ff0000',
    orange: '#ff4500'
});

const commandMap = {
    help: {
        title: 'List of Commands',
        message: () => Object.keys(commandMap)
            .map((cmd, index) => `${index + 1}) \`${config.DISCORD_PREFIX + cmd}\` -> ${commandMap[cmd].description}`)
            .join('\n'),
        color: 'green',
        description: 'Shows this message'
    },
    beep: {
        title: '',
        message: '**Boop!**\t  :white_check_mark:',
        color: 'green',
        description: 'Boop!'
    },
    serverinfo: {
        title: 'Server Information',
        message: message =>
            `Server name is: ${message.guild.name}\nTotal number of members are: ${message.guild.memberCount}`,
        color: '#7851a9',
        description: 'Basic server info!'
    },
    userinfo: {
        title: 'User Information',
        message: message =>
            `Your Discord name is: ${message.author.username}, and your Unique ID is: ${message.author.id}`,
        color: 'orange',
        description: 'Basic account info about yourself'
    },
    send: {
        message: sendCommand,
        description: 'Send a command to the bot',
        useArgs: true
    },
    get: {
        message: getCommand,
        description: 'Get the name of an item',
        useArgs: true
    },
    list: {
        title: 'List of Bots',
        message: () => getAllTheBots().map((bot, ind) => `${ind + 1}) ${bot.name} | ${bot.id}`).join('\n'),
        color: 'green',
        description: 'Lists the current bots that can be messaged'
    }
};
function discordMessage(embed_title, bot_reply, embed_color) {
    return new Discord.MessageEmbed()
        .setColor(colors[embed_color] || embed_color)
        .setTitle(embed_title)
        .setDescription(bot_reply);
}

function complexEmbedBotInfo(embed_title, bot_reply, bot) {
    const fields = [{
        name: 'Backpack',
        value: `[Click Here](https://backpack.tf/profiles/${bot.id})`,
        inline: true
    }]
    bot.tradeOfferURL ? fields.push({
        name: 'Trade Offer',
        value: `[Send me an offer](${bot.tradeOfferURL})`,
        inline: true
    }) : null;
    return discordMessage(embed_title, bot_reply, 'green')
        .setThumbnail(bot.picture)
        .addFields(...fields)
        .setTimestamp();
}

function isSkin(attributes) {
    return !!attributes.wear;
}
function getStatsPage(sku) {
    //console.log(sku);
    var attributes = format.parseSKU(sku);
    var listingAttributes = format.createBPListing(attributes);
    var path = '' + listingAttributes.quality;
    if (isSkin(attributes)) {
        if (listingAttributes.quality === 'Unusual') {
            path = 'Decorated Weapon';
        }
        path += '/';
        if (attributes.killstreak) {
            path += attributes.killstreak + ' ';
        }
        path += attributes.texture + ' | ' + attributes.name + ' (' + attributes.wear + ')';
    }
    else {
        path += '/' + listingAttributes.item_name;
    }
    path += '/Tradable';
    path += attributes.craftable ? '/Craftable' : '/Non-Craftable';
    if (listingAttributes.priceindex) {
        path += '/' + listingAttributes.priceindex;
    }
    return 'https://backpack.tf/stats/' + path;
}

function itemStats(embed_title, bot_reply, sku) {
    let item_stats = encodeURI(getStatsPage(sku));
    console.log(item_stats);
    return discordMessage(embed_title, bot_reply, 'green')
        .addFields(
            {
                name: 'backpack.tf',
                value: `[Click Here](${item_stats})`,
                inline: true
            },
            {
                name: 'marketplace.tf',
                value: `[Click Here](https://marketplace.tf/items/tf2/${sku})`,
                inline: true
            }
        )
        .setTimestamp();
}

//Message functions

discord_client.on('message', message => {
    if (message.author.bot || !message.content.startsWith(config.DISCORD_PREFIX)) return;

    if (message.channel.id != config.DISCORD_BOT_COMMAND_CHANNEL) {
        let channel_name = message.guild.channels.cache.get(config.DISCORD_BOT_COMMAND_CHANNEL).toString();
        let embed = discordMessage(
            'Error!',
            `You are not allowed to send commands here, ${message.author}! Please use ${channel_name} to send commands to me.`,
            'red'
        );
        return message.channel.send(embed);
    }

    const args = message.content.slice(config.DISCORD_PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    console.debug(`Message received from user ${message.author.id}: ${message}`);
    //All commands go here
    const commandObject = commandMap[command];
    if (!commandObject) return message.reply(`Unknown command type \`${config.DISCORD_PREFIX}help\` to see available commands.`);

    if (commandObject.title === undefined) {
        const recCommand = commandObject.message(message, commandObject.useArgs ? args : undefined);
        // We've received null or undefined
        if (!recCommand) return;
        Object.assign(commandObject, recCommand);
    }
    else if (typeof commandObject.message === 'function') {
        commandObject.message = commandObject.message(message, commandObject.useArgs ? args : undefined);
    }

    if (commandObject.reply) message.reply(commandObject.message);
    else message.channel.send(discordMessage(commandObject.title, commandObject.message, commandObject.color));
});

function getCommand(message, args) {
    function errMessage(msg, title) {
        return Object.assign(
            { message: msg, reply: true },
            title
                ? {
                    title,
                    color: 'red',
                    reply: false
                }
                : {}
        );
    }

    if (!args.length) return errMessage(`No arguments were provided!`);

    const itemName = args.filter(i => i).join(' ');
    const isSKU = itemName.includes(';');

    try {
        let attributes;
        if (isSKU) {
            attributes = format.parseSKU(itemName);
            const item_name = format.stringify(attributes);
            message.channel.send(itemStats('Item from SKU', `The name SKU: ${itemName} is: ${item_name}`, itemName));
        }
        else {
            attributes = format.parseString(itemName, true, true);
            const sku = format.parseSKU(attributes);
            if (format.parseSKU(attributes) == 'null;null') { return errMessage(`Unable to fetch SKU for ${itemName}`, 'Invalid SKU!'); }

            message.channel.send(itemStats('SKU Value', `The SKU of ${itemName} is ${sku}`, sku));
        }
    }
    catch (e) {
        return errMessage(`Unable to fetch the ${isSKU ? 'sku' : 'name'} for ${itemName}, the error was ${e}`);
    }
}
function sendCommand(message, args) {
    // if we want to send an embed title should be defined
    function errMessage(msg, title) {
        return Object.assign(
            { message: msg, reply: true },
            title
                ? {
                    title,
                    color: 'red',
                    reply: false
                }
                : {}
        );
    }

    if (message.author.id !== config.DISCORD_BOT_OWNER_ID) return errMessage('you are not allowed to use that command.');
    if (!args.length) return errMessage(`No arguments were provided!`);

    //filter undefined
    const [bots, cmdIndex] = (args[0] === 'all' ? [getAllTheBots(), 1] : matchBot(args).map((botOrIndex, index) => index ? botOrIndex : [botOrIndex]))
    //console.log(bots);
    if (!bots[0]) return errMessage('This bot does not exist, please try again.', 'Error!');
    if (!steam_login_flag) return errMessage('I am unable to send a message as I have not logged in to steam!', 'Steam Message Error!');

    const botMessage = args.slice(cmdIndex).join(' ');
    for (let bot of bots) {
        steam_client.chatMessage(bot.id, botMessage);
        const name = bot.name.charAt(0).toUpperCase() + bot.name.slice(1);
        message.channel.send(
            complexEmbedBotInfo('Steam Message Sent!', `\`${botMessage}\` sent to ${name}!`, bot)
        );
    }
}

steam_client.on('friendMessage', function (steamID, response) {
    let channel = discord_client.channels.cache.get(config.DISCORD_BOT_COMMAND_CHANNEL);
    //console.log(String(steamID));
    const bot = config.BOTS[steamID];
    const bot_name = bot.name.charAt(0).toUpperCase() + bot.name.slice(1);
    let embed = complexEmbedBotInfo(
        `Steam Message Received!`,
        `Message received from ${bot_name}!\n${response}`,
        bot_name
    );
    channel.send(embed);
});


// returns [BOT Object, the starting point of the command] or void
// priority order index first then ID then NAME
function matchBot(args) {
    const allTheBots = getAllTheBots()

    if (args[0] > 0 && parseInt(args[0]) <= allTheBots.length) return [allTheBots[args[0] - 1], 1];

    if (!isNaN(args[0]) && config.BOTS[args[0]]) return [config.BOTS[args[0]], 1];

    const names = allTheBots.map(bot => bot.name);
    for (let i = 1; i <= args.length; i++) {
        const match = names.find(name => name === args.slice(0, i).join(' '));
        if (match) return [allTheBots.find(bot => bot.name === match), i];
    }
    return [null, -1]
}

function getAllTheBots() {
    return Object.keys(config.BOTS).map(id => config.BOTS[id]);
}
logInEvents().catch(err => { throw err });
