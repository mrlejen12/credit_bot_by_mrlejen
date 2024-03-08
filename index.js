const { Client, ActivityType  , 
    GatewayIntentBits,SlashCommandBuilder, 
    EmbedBuilder,REST, Routes  } = require('discord.js');
    const info = require('./config.js')
  const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  presence: {
    activities: [{
      type: ActivityType.Custom, 
      name: info.name, 
      state: info.state,
    }],
  },
  });
  const { Captcha } = require('captcha-canvas');

  
  const fs = require('fs');
  client.login(info.token).catch(error => console.log(`
You forgot to write a [token]`))

client.on('ready', () => {
    console.log(`${client.user.username} Is Online !`);
  });

const private = info.private;
const servers = info.servers;

  const captcha = new Captcha(); 
  captcha.async = false
  captcha.addDecoy();
  captcha.drawTrace(); 
  captcha.drawCaptcha(); 



  client.on('guildCreate',async (guild) =>{
    if(private == true){
        if (servers.includes (guild.id)) return;
        else{
            guild.leave();
        }
           }
           else if(private == false){
            return;
        }
    })

    client.on(`ready`, () => {
    client.guilds.cache.forEach(guild => {
 if(private == true){
    if (servers.includes (guild.id)) return;
    else{
        guild.leave();
    }
       }
       else if(private == false){
        return;
    }
    });
    }); 
    

  
client.on("ready", () => {
    const cmdsg = [];


    let slh = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("ping command")
    let cre = new SlashCommandBuilder()
    .setName("credit")
    .setDescription("credit command")
    .addUserOption(p =>
        p.setName("credit_user")
                    .setDescription("select user to transfer credit"))
                    .addNumberOption(p2 =>
            p2.setName("credit_amount")
            .setDescription("How many credit? you want transfer"))
            .addStringOption(p3 =>
                p3.setName("credit_comment")
                .setDescription("what is the comment? "))
    cmdsg.push(slh);
    cmdsg.push(cre);
    const rest = new REST({version: 9}).setToken(info.token);

    try {

    rest.put(
    Routes.applicationCommands(client.user.id),
    { body: cmdsg },
    )
} catch (error) {
    console.error("error")
    }
    })






    client.on("interactionCreate", async message => {
        if (!message.isCommand()) return;

  const { commandName } = message;
  if(commandName === 'ping'){
    const embed = new EmbedBuilder()
    .setDescription(`**
    my ping : \`${client.ws.ping}\`
  **`)       
 message.reply({embeds : [embed]})
                            }
if (commandName === 'credit') {
    let mm = message.options.getMember("credit_user");
    let nn = message.options.getNumber("credit_amount");
    let ms = message.options.getString("credit_comment");
    userId = message.user.id;


        let data = fs.readFileSync('credits.json');
        let jsonData = JSON.parse(data);

        if (!mm && !nn && !ms) {
            let userPoints = jsonData[userId] ? jsonData[userId].credits : 0;
            message.reply({ content: `:bank:| Your account balance is \`${userPoints}.\``, ephemeral: true });
        } else {
            if (!mm && nn) {
                message.reply({ content: `Please mention someone.`, ephemeral: true });
                return;
            }
            if (ms && !mm) {
                message.reply({ content: `Please mention someone`, ephemeral: true });
                return;
            }
            if (ms && !nn) {
                message.reply({ content: `Please provide a credit amount.`, ephemeral: true });
                return;
            }
            if (mm && mm.user.bot && !nn && !ms) {
                message.reply({ content: `Bots don't have credit.`, ephemeral: true });
                return;
            } else if (mm && !nn && !ms) {
                let userPoints2 = jsonData[mm.user.id] ? jsonData[mm.user.id].credits : 0;
                message.reply({ content: `:bank:| ${mm}'s account balance is \`${userPoints2}.\``, ephemeral: true });
                return;
            }
            if (mm && nn) {
                const newCaptcha = new Captcha();
                newCaptcha.async = false;
                newCaptcha.addDecoy();
                newCaptcha.drawTrace();
                newCaptcha.drawCaptcha();
              
                let userPoints = jsonData[userId] ? jsonData[userId].credits : 0;
                let targetUserId = mm.user.id;
                let targetUserPoints = jsonData[targetUserId] ? jsonData[targetUserId].credits : 0;
            
                let transferFee = Math.ceil(nn * 0.05);
                let totalTransferAmount = nn - transferFee;
            
                if (mm && mm.user.bot) {
                    message.reply({ content: `Bots don't have credit.`, ephemeral: true });
                    return;
                }
                if (mm.user.id === message.user.id) {
                    message.reply({ content: `You can't transfer credits to yourself.`, ephemeral: true });
                    return;
                }
            
                if (userPoints < totalTransferAmount) {
                    message.reply({ content: `You don't have enough credit.`, ephemeral: true });
                    return;
                } else {
                    
               
                    
                    try {
                         await message.reply({ files: [newCaptcha.png], content: newCaptcha.text });
                         const filter = (responseMessage) => {
                            if (responseMessage.author.id === userId) {
                                if (responseMessage.content !== newCaptcha.text) {
                                   message.deleteReply()
                                } else {
                                   
                                    return true;
                                    
                                }
                            }
                        };
                        
                        const response = await message.channel.awaitMessages({
                            filter,
                            max: 1,
                            time: 10000,
                            errors: ["time"]
                        });
            
                        if (response) {
                            
                            let updatedUserPoints = userPoints - totalTransferAmount;
                            let updatedTargetUserPoints = targetUserPoints + totalTransferAmount;
            
                            jsonData[userId] = { credits: updatedUserPoints };
                            jsonData[targetUserId] = { credits: updatedTargetUserPoints };
            
                            fs.writeFileSync('credits.json', JSON.stringify(jsonData));
            
                          
                message.channel.send({ content: `Transferred ${totalTransferAmount} credits to  <@${mm.user.id}>.`, ephemeral: true });
                            mm.send(`** :atm: | Transfer Receipt **\n\`\`\`\nYou have received ${totalTransferAmount} from user ${message.user.username} (ID: ${message.user.id})\nReason: ${ms || "No reason provided"}\n\`\`\``);
                            return;
                        }
            
                       
                    } catch (err) {
                        
                        message.channel.send({ content: `timeout`, ephemeral: true });
                        
                    }
                }
            }

            
        
             
            
            
            
        

                

                
            
            
        }
   
}


        


                            
                        })
//token: 'OTUwNjIzMTI3MzAwMzcwNDUy.GmiAzP.tgdpCssr3FT4Sz1Gr63RyrG3qgdVLLAJMEefAM' ,
