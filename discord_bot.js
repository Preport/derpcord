//Discord Stuff

const Discord = require('discord.js');
const { prefix, token } = require('./config/discord_config');
const discord_client = new Discord.Client();
const commands_channel_id = '<enter id of the channel where you want to send commands to the bot to>';
const bot_owner_id = '<enter your id here>';

const bot_ids = {
    '<what you want to call your bot here>': '<steam id64 of your bot>'
};

const bot_pictures = {
    '<what you call your bot here, same as above>':
        '<url of your bots profile picture, make sure it ends in .jpg or .png>'
};

const bot_trade_offer = {
    '<what you call your bot>': '<trade offer url of your bot>'
};

// TODO CHANGE ^^ THIS

//Steam Stuff

const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const steam_config = require('./config/steam_config');
const format = require('tf2-item-format');
const steam_client = new SteamUser();
let steam_login_flag = false;
const logInOptions = {
    accountName: steam_config.accountName,
    password: steam_config.password,
    twoFactorCode: SteamTotp.generateAuthCode(steam_config.sharedSecret)
};

//Logging in...

async function logInEvents() {
    discord_client.login(token);
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
    });
    steam_client.setPersona(SteamUser.EPersonaState.Online);
    steam_client.gamesPlayed(440);
    console.log('Steam Bot is now online and game has been set to TF2!');
    steam_login_flag = true;

    let channel_name = discord_client.channels.cache.get(commands_channel_id);
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
        message: Object.keys(commandMap)
            .map((cmd, index) => `${index + 1}) \`${prefix + cmd}\` -> ${commandMap[cmd].description}`)
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
    }
};
function discordMessage(embed_title, bot_reply, embed_color) {
    return new Discord.MessageEmbed()
        .setColor(colors[embed_color] || embed_color)
        .setTitle(embed_title)
        .setDescription(bot_reply);
}

function complexEmbedBotInfo(embed_title, bot_reply, bot) {
    bot = bot.toLowerCase();

    return discordMessage(embed_title, bot_reply, 'green')
        .setThumbnail(bot_pictures[bot])
        .addFields(
            {
                name: 'Backpack',
                value: `[Click Here](https://backpack.tf/profiles/${bot_ids[bot]})`,
                inline: true
            },
            {
                name: 'Trade Offer',
                value: `[Send me an offer](${bot_trade_offer[bot]})`,
                inline: true
            }
        )
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

//Miscellaneous Functions

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

//Message functions

discord_client.on('message', message => {
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    if (message.channel.id != commands_channel_id) {
        let channel_name = message.guild.channels.cache.get(commands_channel_id).toString();
        let embed = discordMessage(
            'Error!',
            `You are not allowed to send commands here, ${message.author}! Please use ${channel_name} to send commands to me.`,
            'red'
        );
        return message.channel.send(embed);
    }

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    console.debug(`Message received from user ${message.author.id}: ${message}`);
    //All commands go here
    const commandObject = commandMap[command];
    if (!commandObject) return message.reply(`Unknown command type \`${prefix}help\` to see available commands.`);

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

    if (message.author.id !== bot_owner_id) return errMessage('you are not allowed to use that command.');
    if (!args.length) return errMessage(`No arguments were provided!`);

    const botMessage = args.slice(1).join(' ');

    //filter undefined
    const bots = (args[0] === 'all' ? bot_ids : [bot_ids[args[0]]]).map(i => i);

    if (!bots.length) return errMessage('This bot does not exist, please try again.', 'Error!');
    if (!steam_login_flag) { return errMessage('I am unable to send a message as I have not logged in to steam!', 'Steam Message Error!'); }

    for (let bot in bots) {
        const botID = bots[bot];

        steam_client.chatMessage(botID, botMessage);
        bot = bot.charAt(0).toUpperCase() + bot.slice(1);
        message.channel.send(
            discordMessage('Steam Message Sent!', `Message sent to ${bot} with the message: \`${botMessage}\``, 'green')
        );
    }
}

steam_client.on('friendMessage', function (steamID, response) {
    let channel = discord_client.channels.cache.get(commands_channel_id);
    //console.log(String(steamID));
    var bot_name = getKeyByValue(bot_ids, String(steamID));
    bot_name = bot_name.charAt(0).toUpperCase() + bot_name.slice(1);
    let embed = complexEmbedBotInfo(
        `Steam Message Received!`,
        `Message received from ${bot_name}!\n${response}`,
        bot_name
    );
    channel.send(embed);
});

logInEvents();
