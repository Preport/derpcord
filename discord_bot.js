//Discord Stuff

const Discord = require('discord.js');
const {prefix, token} = require('./config/discord_config');
const discord_client = new Discord.Client();
const commands_channel_id = '<enter id of the channel where you want to send commands to the bot to>';
const bot_owner_id = '<enter your id here>';

const bot_ids = {
    '<what you want to call your bot here>' : '<steam id64 of your bot>'
};

const bot_pictures = {
    '<what you call your bot here, same as above>' : '<url of your bots profile picture, make sure it ends in .jpg or .png>'
};

const bot_trade_offer = {
    '<what you call your bot>' : '<trade offer url of your bot>'
};


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
        steam_client.on('error', (err) => {
            let err_embed = new Discord.MessageEmbed()
            .setTitle("Error!")
            .setColor('#ff0000')
            .setDescription(`I have failed to log on to Steam! Error is ${err}. Retrying in 30 seconds...`);
           channel_name.send(err_embed);
           setTimeout(steam_client.logOn, 30000, logInOptions);
        });
    });
    steam_client.setPersona(SteamUser.EPersonaState.Online);
    steam_client.gamesPlayed(440);
    console.log('Steam Bot is now online and game has been set to TF2!');
    steam_login_flag = true;

    schemaManager.init(function(err) {
        if (err) {
            throw err;
        }
    });
    let channel_name = discord_client.channels.cache.get(commands_channel_id);
    let embed = new Discord.MessageEmbed()
    .setTitle("Steam Login")
    .setColor('#00ff00')
    .setDescription('Logged in to Steam and set my game to TF2! :white_check_mark:');
    channel_name.send(embed);
}


//Discord Message Embeds Functions

function greenDiscordMessage(embed_title, bot_reply){
    let embed = new Discord.MessageEmbed()
    .setColor('#00ff00')
    .setTitle(embed_title)
    .setDescription(bot_reply);
    return embed;
}

function orangeDiscordMessage(embed_title, bot_reply){
    let embed = new Discord.MessageEmbed()
    .setColor('#ff4500')
    .setTitle(embed_title)
    .setDescription(bot_reply);
    return embed;
}

function redDiscordMessage(embed_title, bot_reply){
    let embed = new Discord.MessageEmbed()
    .setColor('#ff0000')
    .setTitle(embed_title)
    .setDescription(bot_reply);
    return embed;
}

function complexEmbed(embed_title, bot_reply, bot){
    bot = bot.toLowerCase();
    let embed = new Discord.MessageEmbed()
    .setTitle(embed_title)
    .setThumbnail(bot_pictures[bot])
    .setColor('#00ff00')
    .setDescription(bot_reply)
    .addFields({
        name: 'Backpack', value: `[Click Here](https://backpack.tf/profiles/${bot_ids[bot]})`, inline: true
    },
    {
        name: 'Trade Offer', value: `[Send me an offer](${bot_trade_offer[bot]})`, inline: true
    }
    )
    .setTimestamp();
    return embed;
}

//Miscellaneous Functions

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
  }

function isSku(str){
    var specialChars = ";";
    for(let i = 0; i < specialChars.length;i++){
        if(str.indexOf(specialChars[i]) > -1){
            return true;
        }
        else{
            return false;
        }
    }
}


//Message functions

discord_client.on('message', message => {
    if (message.author.bot) return;
    if(!message.content.startsWith(prefix)) return;
    if(message.channel.id != commands_channel_id){
        if (message.author.bot) return;
        let channel_name = message.guild.channels.cache.get(commands_channel_id).toString();
        let embed = redDiscordMessage("Error!", `You are not allowed to send commands here, ${message.author}! Please use ${channel_name} to send commands to me.`);
        message.channel.send(embed);
        if (message.author.bot) return;
    }
    else{
        if (!message.content.startsWith(prefix) || message.author.bot) return;
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();
        console.debug(`Message received from user ${message.author.id}: ${message}`);
        //All commands go here
        if(command === `help`) {
            let embed = greenDiscordMessage('List of Commands', '1) `.beep` -> Boop!\n2) `.serverinfo` -> Basic server info\n3) `.userinfo` -> Basic account info about yourself\n');
            message.channel.send(embed);
        }
        else if(command === `beep`){
            let embed = greenDiscordMessage('', '**Boop!**\t  :white_check_mark:');
            message.channel.send(embed);
        }
        else if(command === `serverinfo`){
            let embed = new Discord.MessageEmbed()
            .setTitle('Server Information')
            .setColor('#7851a9')
            .setDescription(`Server name is: ${message.guild.name}\nTotal number of members are: ${message.guild.memberCount}`);
            message.channel.send(embed);
        }
        else if(command === `userinfo`){
            let embed = orangeDiscordMessage('User Information', `Your Discord name is: ${message.author.username}, and your Unique ID is: ${message.author.id}`);
            message.channel.send(embed);
        }
        else if(command === `send`){
            if(message.member.roles.cache.has(bot_owner_id)){
                if(!args.length){
                    return message.channel.send(`No arguments were provided, ${message.author}!`);
                }
                else{
                    let bot_message = args.slice(1).join(' ');
                    if(args[0] == 'all'){
                        for(let bot in bot_ids){
                            if(steam_login_flag){
                                let bot_id = bot_ids[bot];
                                steam_client.chatMessage(bot_id, bot_message);
                                bot = bot.charAt(0).toUpperCase() + bot.slice(1);
                                let embed = complexEmbed('Steam Message Sent!', `Message sent to ${bot} with the message: \`${bot_message}\``, bot);
                                message.channel.send(embed);
                                }
                            }
                        return;
                    }
                    else{
                        let single_bot_id = String(bot_ids[args[0]]);
                        //console.log(bot_id);
                        if (!(args[0] in bot_ids)){
                            let embed = redDiscordMessage('Error!', 'This bot does not exist, please try again.');
                            message.channel.send(embed);
                            return;
                        }
                        if(steam_login_flag){
                            steam_client.chatMessage(single_bot_id, bot_message);
                            let bot_name = getKeyByValue(bot_ids, single_bot_id);
                            bot_name = bot_name.charAt(0).toUpperCase() + bot_name.slice(1);
                            let embed = complexEmbed('Steam Message Sent!', `\`${bot_message}\` sent to ${bot_name}!`, bot_name);
                            message.channel.send(embed);
                            }
                        else{
                            let embed = redDiscordMessage('Steam Message Error!', `I am unable to send a message as I have not logged in to steam!`);
                            message.channel.send(embed);
                            return;
                        }
                    }
                }
            }
            else{
                message.reply(`you are not allowed to use that command.`);
                return;
            }
        }
        else if (command === `get`){
            if(!args.length){
                return message.channel.send(`No arguments were provided, ${message.author}!`);
            }
            let len = args.length;
            if(len == 1){
                if(isSku(args[0])){
                    //console.log('Entering to check SKU');
                    let item_sku = args[0];
                    let item_name = '';
                    try{
                        var attributes = format.parseSKU(item_sku);
                        item_name = format.stringify(attributes);
                    }
                    catch(e){
                        let embed = redDiscordMessage("Error fetching item name!", `Unable to fetch the name for ${args[0]}, the error was ${e}`);
                        message.channel.send(embed);
                        return;
                    }
                    console.log(item_name);
                    let embed = greenDiscordMessage("Item from SKU", `The name SKU: ${args[0]} is: ${item_name}`);
                    return message.channel.send(embed);
                }
                else{
                    let item_sku = "";
                    try{
                        let item_attributes = format.parseString(args[0], true, true);
                        item_sku = format.toSKU(item_attributes);
                    }
                    catch(e){
                        let embed = redDiscordMessage("Error fetching item SKU!", `Unable to fetch the SKU for ${args[0]}, the error was ${e}`);
                        return message.channel.send(embed);
                    }
                    if(item_sku == 'null;null'){
                        let embed = redDiscordMessage("Invalid SKU!", `Unable to fetch the SKU for ${args[0]}`);
                        return message.channel.send(embed);
                    }
                    let embed = greenDiscordMessage("SKU Value", `The SKU of ${args[0]} is ${item_sku}`);
                    return message.channel.send(embed);
                }
            }
            else{
                //Change array of strings to single string
                let full_item_name = args.join(' ');
                console.log(full_item_name);
                let item_sku = '';
                try{
                    let item_attributes = format.parseString(full_item_name, true, true);
                    item_sku = format.toSKU(item_attributes);
                }
                catch(e){
                    let embed = redDiscordMessage("Error fetching item SKU!", `Unable to fetch the SKU for ${args[0]}, the error was ${e}`);
                    return message.channel.send(embed);
                }
                if(item_sku == 'null;null'){
                    let embed = redDiscordMessage("Invalid SKU!", `Unable to fetch the SKU for ${args[0]}`);
                    return message.channel.send(embed);
                }
                let embed = greenDiscordMessage("SKU Value", `The SKU of ${full_item_name} is ${item_sku}`);
                    return message.channel.send(embed);
            }
        }
    }
});

steam_client.on('friendMessage', function(steamID, response){
    let channel = discord_client.channels.cache.get(commands_channel_id);
    //console.log(String(steamID));
    var bot_name = getKeyByValue(bot_ids, String(steamID));
    bot_name = bot_name.charAt(0).toUpperCase() + bot_name.slice(1);
    let embed = complexEmbed(`Steam Message Received!`, `Message received from ${bot_name}!\n${response}`, bot_name);
   channel.send(embed);
});

logInEvents();