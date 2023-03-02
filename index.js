const discord=require("discord.js")
const client=new discord.Client()
questions=require("./questions.json").questions
var gtts = require('node-gtts')('en');
var path = require('path');
var filepath = path.join(__dirname, 'hello.wav');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('production.sqlite3');

terminated={}
starters={}

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS points (id TEXT, points TEXT)");
});

gtts.save(filepath, 'hello', function() {
  console.log('save done');
})
const prefix="q!"
debounce={"1035638742628696074":true}
client.on('message', (message) => {
  if(debounce[message.author.id]==undefined || debounce[message.author.id]==false){
    if(message.guild.id=="824081229519257661"){
    if(message.author.id!="288481481477586954"){
  //  message.channel.send("Hi <@"+message.author.id+">")
    }else{
     // message.channel.send("<@288481481477586954>, NSHS #1\nhttps://img1.wsimg.com/isteam/ip/1e52ba43-73e2-4074-8386-a9985886305f/Lettermark.png")
    }
   // debounce[message.author.id]=true
    setTimeout(function(){
      debounce[message.author.id]=false
    },30000)
  }
  }
})

client.on("ready",()=>{
  console.log(`Logged in as ${client.user.username}#${client.user.discriminator}`)
  client.user.setActivity('q!start', { type: 'LISTENING' }) //PLAYING, STREAMING, LISTENING, WATCHING, CUSTOM_STATUS
  .then(presence => console.log(`Activity set to: LISTENING ${presence.activities[0].name}`))
  .catch(console.error)
})
scores={}
end={}
session={}
function getQuestion(category){
  question=questions[Math.floor(Math.random()*questions.length)];
  if(category){
  if(category.toUpperCase()==question["category"].toUpperCase()){
  if(question["tossup_answer"].split(" ").length>=3 || question["tossup_question"].split(".").length>1 || question["tossup_answer"].split(".").length>1 || question["tossup_answer"].replace(/[Aa][Cc][Cc][Ee][Pp][Tt]/)!=question["tossup_answer"] || question["category"]=="MATH" || question.tossup_question.split("\n").length>5){

    return getQuestion(category)
    
  }
  else if((question["tossup_format"]=="SHORT ANSWER" || question["tossup_format"]=="Short Answer" || question["tossup_format"]=="short answer") && question["tossup_answer"].split(" ").length>1){
    return getQuestion(category)
  }
  else{
    return question
  }
}
else{
  return getQuestion(category)
}
}
else{
  if(question["tossup_answer"].split(" ").length>=3 || question["tossup_question"].split(".").length>1 || question["tossup_answer"].split(".").length>1 || question["tossup_answer"].replace(/[Aa][Cc][Cc][Ee][Pp][Tt]/)!=question["tossup_answer"] || question["category"]=="MATH" || question.tossup_question.split("\n").length>5){

    return getQuestion()
    
  }
  else if((question["tossup_format"]=="SHORT ANSWER" || question["tossup_format"]=="Short Answer" || question["tossup_format"]=="short answer") && question["tossup_answer"].split(" ").length>1){
    return getQuestion()
  }
  else{
    return question
  }
}
}
scores={}
function ask_question(message,connected=null,index=0, category=null){
  if(terminated[message.guild.id]==true){
    terminated[message.guild.id]=null 
    session[message.guild.id]=false
    client.channels.fetch(connected).then(async channel=>{
    channel.leave()
    })
    const embed1=new discord.MessageEmbed()
    .setColor("7f95e6")
    .setTitle("Game Ended.")
    str=[":crown: Final Leaderboard:"]
    Object.keys(scores[message.guild.id]).forEach(key=>{
      str.push("<@"+key+"> - "+scores[message.guild.id][key])
      db.all("select*from points where id= "+key,(err,rows)=>{
      user=rows[0]
      if(user){
        db.run(`update points set points='${parseInt(user.points)+scores[message.guild.id][key]}' where id='${key}'`)
      }
      else{
        db.run(`insert into points values ('${key}','${scores[message.guild.id][key]}')`)
      }
    })
    })
    embed1.setDescription(str.join("\n"))
    message.channel.send(embed1)

    return;
  }
  const embed=new discord.MessageEmbed()
  embed.setTitle("Scoreboard")
  embed.setAuthor(`Questions Heard: ${index}`)
  str=[":crown: Leaderboard:"]
  Object.keys(scores[message.guild.id]).forEach(key=>{
    str.push("<@"+key+"> - "+scores[message.guild.id][key])
  })
  embed.setDescription(str.join("\n"))
  .setColor("#7f95e6")
  message.channel.send(embed)
  index+=1
  question=getQuestion(category)
  var filepath = path.join(__dirname, message.guild.id+'start.wav');
  gtts.save(filepath, question.tossup_format+" "+question.category.toLowerCase()+" tossup ", async function() {
    console.log('Text has been saved to hello.wav.')
   finished=false
   if(connected==null){
     connected=message.member.voice.channel.id
   }
   await client.channels.fetch(connected).then(async channel=>{
    const connection = await channel.join(); 
   const dispatcher = connection.play(message.guild.id+'start.wav');
    
    dispatcher.on('start', () => {
      console.log('audio.mp3 is now playing!');
    });

    await dispatcher.on('finish', () => {
  console.log(question)
  parts=question["tossup_question"].split("\n")
  var filepath = path.join(__dirname, 'hello.wav');
  gtts.save(filepath, parts.shift(), async function() {
    console.log('Text has been saved to hello.wav.')
   finished=false

    const dispatcher = connection.play('hello.wav');

    dispatcher.on('start', () => {
      console.log('audio.mp3 is now playing!');
    });

    await dispatcher.on('finish', () => {
      console.log('audio.mp3 has finished playing!');
      sum=0
      parts.forEach((part,index)=>{
        console.log(index)
        setTimeout(async ()=>{
          console.log(part)
        var filepath = path.join(__dirname, message.member.guild.id+"-"+index+'.wav');
        gtts.save(filepath, part, async function() {
          console.log('Text has been saved to hello.wav.')
         finished=false
          const dispatcher = connection.play(filepath);
  
          dispatcher.on('start', () => {
            console.log('audio.mp3 is now playing!');
          });
  
           dispatcher.on('finish', () => {
            console.log('audio.mp3 has finished playing!');
          });
        })
      },sum)
      sum+=500+part.length*120
    });
    console.log("bye")
    dispatcher.on('error', console.error);
    setTimeout(function(){
      finished=false
      knocked_out={}
      const filter = m => m.member.voice.channel.id==connected
      
      const collector = message.channel.createMessageCollector(filter, { time: 15000,max: channel.members.size });
      
      collector.on('collect', m => {
        if((scores[m.guild.id][m.author.id]==null || scores[m.guild.id][m.author.id]==undefined) && client.user.id!=m.author.id){
          scores[m.guild.id][m.author.id]=0
        }
        if(m.content.split(" ")[0]=='q!a'){
        console.log(`Collected ${m.content}`);
        answer=[question["tossup_answer"].replace("--",")").toUpperCase()]
        if(answer[0].split(")").length>1){
          answer.push(answer[0].slice(0,1).toUpperCase())
          answer.push(answer[0].split(" ")[1])
        }
        console.log(answer)
        console.log(answer.find(z =>{
          return m.content.split(" ")[1].toUpperCase()==z
                  }))
        if(knocked_out[m.author.id]==null && finished==false){
        if(answer.find(z =>{
return m.content.split(" ")[1].toUpperCase()==z
        })!=undefined){
          finished=true
          if(scores[m.guild.id][m.author.id]){
          scores[m.guild.id][m.author.id]+=1
          }else{
            if(client.user.id!=m.author.id){
            scores[m.guild.id][m.author.id]=1
            }
          }
          em=new discord.MessageEmbed()
          em.setColor("GREEN")
          em.setTitle("Correct!")
          m.reply(em)
          collector.stop()
          var filepath = path.join(__dirname,m.member.guild.id+'c.wav');
          gtts.save(filepath, m.author.username.replace(/[^A-Za-z0-9 ]/,"")+" guessed it correctly, the answer was "+question["tossup_answer"].toLowerCase(), async function() {
          const dispatcher = connection.play(filepath);
  
          dispatcher.on('start', () => {
            console.log('audio.mp3 is now playing!');
          });
  
          dispatcher.on('finish', () => {
            setTimeout(function(){
              ask_question(message,connected,index,category)
              },1000)
          })
        })
        }
        else{
          em=new discord.MessageEmbed()
          em.setColor("RED")
          em.setTitle("Incorrect!")
          m.reply(em)
          knocked_out[m.author.id]=true
          
        }
      }

    }
      });
      
      collector.on('end', collected => {
        if(!finished){
          var filefpath = path.join(__dirname, message.member.guild.id+'c.wav');
          gtts.save(filepath, "No one got it, the answer was "+question["tossup_answer"].toLowerCase(), async function() {
          const dispatcher = connection.play(filepath);
  
          dispatcher.on('start', () => {
            console.log('audio.mp3 is now playing!');
          });
  
          dispatcher.on('finish', () => {
            setTimeout(function(){
            if(channel.members.size==1){
              session[message.guild.id]=false
              channel.leave()
              const embed1=new discord.MessageEmbed()
              .setColor("7f95e6")
              .setTitle("Game Ended.")
              str=[":crown: Final Leaderboard:"]
              Object.keys(scores[message.guild.id]).forEach(key=>{
                str.push("<@"+key+"> - "+scores[message.guild.id][key])
                user=db.all("select*from points where id= "+key)[0] 
                console.log(user)
                if(user){
                  db.run(`update points set points='${parseInt(user.points)+scores[message.guild.id][key]}' where id='${key}'`)
                }
                else{
                  db.run(`insert into points values ('${key}','${scores[message.guild.id][key]}')`)
                }

              })
              embed1.setDescription(str.join("\n"))
              message.channel.send(embed1)
            }else{
              ask_question(message,connected,index,category)
            }
            },1000)
          })
        })
        }
        console.log(`Collected ${collected.size} items`);
      });

    },sum)
  })
})
})
})
  })
}


client.on("message",async (message)=>{

  params=message.content.split(" ")
  switch(params[0]){
    case (prefix+"end"):
      if(starters[message.guild.id]==message.author.id){
        terminated[message.guild.id]=true
        message.reply("The round will end after this question.")
      }else{
        message.reply("You didn't start this round! Ask <@"+starters[message.guild.id]+"> or an administrator to end it!")
      }
    break;
    case (prefix+"start"):
      console.log("hello")
      if(!session[message.guild.id]){
      if (message.member.voice.channel) {
        session[message.guild.id]=true
        scores[message.guild.id]={}
        starters[message.guild.id]=message.author.id
        console.log("continued")
        const embed=new discord.MessageEmbed()
        embed.setTitle("Starting Quiz Competition")
        .setColor("#7f95e6")
        .setDescription("The bot will ask you questions. Respond with `q!a <answer>` after the bot has fully read out the question. If you would like to view the scores, use `q!scores`")
        .setTimestamp()
        .setFooter("QuizMe")
      message.reply(embed)
        finished=true
        params.shift()
       ask_question(message,null,0,category=(params.join(" ") || null))
  }
      else {
        console.log("failed")
        const embed=new discord.MessageEmbed()
        .setColor("RED")
        .setTitle("No Channel")
        .setDescription("Join a voice channel first!")
        message.reply(embed)
	    }
    }else{
      message.reply("A quiz competition is already going on in this server!")
    }
    break;
    case (prefix+"scores"):
      if(scores[message.guild.id]){
        const embed=new discord.MessageEmbed()
        embed.setTitle("Scoreboard")
        str=[":crown: Leaderboard:"]
        Object.keys(scores[message.guild.id]).forEach(key=>{
          str.push("<@"+key+"> - "+scores[message.guild.id][key])
        })
        embed.setDescription(str.join("\n"))
        .setColor("#7f95e6")
        message.reply(embed)
      }
    break;
    case (prefix+"global"):
      const embed=new discord.MessageEmbed()
      embed.setTitle("Global Leaderboard")
      str=[":crown: Leaderboard:"]
      db.all("SELECT * FROM points ORDER BY points DESC limit 10;", async function(err, rows) {  
      
        console.log(err)
        console.log(rows)
     message.channel.send("Loading...").then(message1=>{
        rows.forEach(async function (row) {  
        console.log(err)
        console.log(row)
        user=await client.users.fetch(row.id)
        usr="<@"+row.id+">"
        if(user!=undefined){
          usr=user.username+"#"+user.discriminator
        }
        str.push(usr+" - "+row.points+" problems.")
      }) 
      setTimeout(function(){
      embed.setDescription(str.join("\n"))
      .setColor("#7f95e6")
      message1.edit("<@"+message.author.id+">",embed)
   
    },2000)
  })
  })
    break;
  }
  
})
client.login(process.env.token)