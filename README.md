# Derpcord!
A new way to interact with your TF2Autobots!

Completely open-source! I used this project to learn a bit more about nodejs, and decided to make a full fledged project about it! I am still learning more about this project as I go, so there are bound to be issues with the bot. If there any, feel free to join my Discord [here](https://discord.gg/YD2tyYF), and let me know!

This project was heavily inspired by [tf2autocord](https://github.com/Gobot1234/tf2-autocord), where a user can interact with their tradebots from the comfort of Discord and not having to log in to Steam and send commands to their bots like that.


## Features
- Able to get some basic info about your Discord Server, how many members there are, etc.
- Ability to get info about yourself, such as your name on Discord and what your Unique Discord ID is.
- Ping -> Pong! 😃
- If you have multiple bots, you can send each bot a message **INDIVIDUALLY!** For example:

![image](https://user-images.githubusercontent.com/31774135/120798328-d408b100-c55a-11eb-875e-1c5590d64e99.png)

- However, if you want to send one message to all your bots, that is possible too! Example: 

![image](https://user-images.githubusercontent.com/31774135/120798505-13cf9880-c55b-11eb-9185-6a6d0ec5f095.png)

- Don't know the name of your item, but you have the SKU for it? Or you have the name of the item, but don't know the SKU? Got you covered!

![image](https://user-images.githubusercontent.com/31774135/120798632-44173700-c55b-11eb-8aaf-cf21908c1788.png)

- **More features to come!** I will try to implment more features while I have free time, so stay tuned™!

## Ready to get started?

- There are some prerequisites before you can get started. 
  - You will need a spare Steam account with access to the account's Shared Secret. I recommend using [Steam Desktop Authenticator](https://github.com/Jessecar96/SteamDesktopAuthenticator) to obtain the requirements for this.
  - You will also need your own Discord server and you will need to set up a new Discord Bot in the app's Developer Portal. To do this, follow this [guide.](https://discordjs.guide/preparations/setting-up-a-bot-application.html)
  - I will already assume that you have a TF2Autobot set up and running without any issues. If you have, then well and good, if not, shame on you. 😠 Anyway, you will need to add the Derpcord's Steam Bot's ID64 you to your `ADMINS` section, if you have not added it already. **IF YOU DO NOT DO THIS, THEN YOU WILL NOT BE ABLE TO INTERACT WITH YOUR TRADE BOT. THIS STEP IS ESSENTIAL.**
- Next, you will need to install NodeJS. Download and install it according to the OS you're running [here.](https://nodejs.org/en/download/)
- Awesome! Now, you will need to configure some settings for the bot to run. Head over to the config folder, under which you will find two files, namely: `discord_config.json` and `steam_config.json`.
- Open `discord_config.json` in your favorite text editor, and you will see 2 variables.

  - `prefix`: This is a character that the bot will use to recognise that commands are meant for it. You can set it to anything, such as '.' or ',' or '!' and so on. If you have other bots in your Discord Server, make sure that the prefix does not conflict with the prefix for those bots.
  - `token` : This is the token you generate while creating your Discord bot earlier. Think of it like the password that your bot will use to log in to Discord. Remember, **DO NOT SHARE THIS WITH ANYONE.** Save the file contents, and you're good to go! 😁

- Great! Now open `steam_config.json`. Here, you will see 3 variables. Another disclaimer: **DO NOT SHARE THIS WITH ANYONE AS WELL.**
  - Under `accountName`, fill in the name of the Steam Account you just created/already had.
  - `password`: Self-explanatory.
  - `sharedSecret`: Paste the shared secret value here. If you do not have this, your bot will be unable to log in to Steam, which beats the purpose of this bot as a whole. 😛

- Alright. You've got the easy stuff out of the way now. Now you get to the lil' bit more complicated stuff.
  - Open the `discord_bot.js` file in a text editor. We will need to add some stuff here as well. 
    - You will see a variable called `commands_channel_id`. This is the variable that controls where you can send commands to your bot, and where you can see responses from the bot. Create a text channel in your Discord Server, and then right click on the channel's name. Click on 'Copy ID' as shown in the picture, and then paste that value in quotes here.
    ![image](https://user-images.githubusercontent.com/31774135/120828531-4210a080-c57a-11eb-9663-9ff3051c63ba.png)
    
    - Next, you will need to enter your own ID. You will see a variable called `bot_owner_id`. This will let the bot know that you are the owner, and only you can access the commands that will be sent to the Trade Bot, and no one else. Other people can use the `help`, `serverinfo`, `userinfo` and `get` commands, but the `send` command will only apply to you. To get your ID, right click on your name and click on 'Copy ID' as shown in the image below. Then, paste that value in quotes to this variable.
    ![image](https://user-images.githubusercontent.com/31774135/120828838-9f0c5680-c57a-11eb-823a-cb67b5a2f4c7.png)
    
    - Now we get into the nitty-gritty stuff 😛
      - Below `bot_owner_id`, you will see `const bot_ids`. This where you will set the names to call your bots along with the Steam ID64 of the bots. For example, I have 2 bots, named herpatron and derpatron. Therefore, my `bot_ids` will look like shown:

      ![image](https://user-images.githubusercontent.com/31774135/120829494-17731780-c57b-11eb-99a5-39a44a344605.png)

      - Once you've filed up that, lets move on over to `const bot_pictures`. Here, you will upload a profile picture for each bot somewhere, where the URL ends with a .jpg or a .png. I suggest using Discord's service for this, but this should in theory work for other services where the URL ends as intended. Once you've uploaded them, add the same bot's names as shown above, followed by the URLs of the images, like the example image shown below:
      
      ![image](https://user-images.githubusercontent.com/31774135/120829836-7cc70880-c57b-11eb-80fb-d3518c8e717a.png)

      - Sweet! Now, onward to the last checkpoint! Moving to `const bot_trade_offer`. This variable is just to show the trade offer URL in the message for each bot, along with a link to each of the bot's backpack.tf profile pages. Example shown below:

      ![image](https://user-images.githubusercontent.com/31774135/120830180-dcbdaf00-c57b-11eb-99a5-db3c3dd47004.png)
      
      - Remember to use the same names of the bots, and set their trade offer URLs as shown:
      
      ![image](https://user-images.githubusercontent.com/31774135/120830331-024ab880-c57c-11eb-8723-d17945d0c612.png)

Save and exit the file now.

- Voila! You're good to go! (Almost)
- There's 2 more things left to do.
- Once you've finished editing all the required stuff, you will need to install pm2 and the required packages for the bot to run. To do this, run the following commands:
  - `npm install -g latest pm2`
  - Navigate to the directory where you've downloaded the bot and run this command: `npm i`
- Awesome! Now, to finally run the bot. Navigate to the folder where the bot files are located, open up command prompt/terminal, and run the following command:
  `pm2 start discord_bot.js --name discord_bot && pm2 logs discord_bot`
  If all is good and there are no issues, you will see the following output:
  
  ![image](https://user-images.githubusercontent.com/31774135/120831348-12af6300-c57d-11eb-95fe-21cbf148e314.png)

**SUCCESS!** Your Discord Bot is now up and running!

If you are still facing any issues, please join my Discord and let me know. We can try and fix it! 🙂

## Feedback

Got any ideas and features you want me to add? Go for it, join my Discord and let me know! 
