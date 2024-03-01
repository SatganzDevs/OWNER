require("./config");
const {
proto, 
generateWAMessageFromContent, 
generateWAMessage, 
downloadContentFromMessage, 
getContentType, 
extractUrlFromText } = require("@whiskeysockets/baileys");
const fs = require("fs")
const moment = require("moment-timezone");
const util = require("util");
const chalk = require("chalk");
const cheerio = require("cheerio") 
const speed = require("performance-now");
const axios = require("axios");
const { uptotelegra } = require("./lib/uploader");
const { exec  } = require("child_process");
moment.tz.setDefault('Asia/Jakarta');






//lIB FILE
const { formatp, clockString, getAllCmd, getBuffer, getCases, generateProfilePicture, sleep, fetchJson, runtime,  isUrl,  pickRandom, getGroupAdmins, getRandom,  FileSize, toFirstCase, makeId, formatNumber, durationToSeconds } = require("./lib/myfunc")




module.exports = Satzz = async (Satzz, m, chatUpdate, store) => {
try {
var body = m.mtype === "conversation" ? m.message.conversation : m.mtype == "imageMessage" ? m.message.imageMessage.caption : m.mtype == "videoMessage" ? m.message.videoMessage.caption : m.mtype == "extendedTextMessage" ? m.message.extendedTextMessage.text : m.mtype == "buttonsResponseMessage" ? m.message.buttonsResponseMessage.selectedButtonId : m.mtype == "listResponseMessage" ? m.message.listResponseMessage.singleSelectReply.selectedRowId : m.mtype == "templateButtonReplyMessage" ? m.message.templateButtonReplyMessage.selectedId : m.mtype === "editedMessage" ?m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage || m.message.editedMessage.message.protocolMessage.editedMessage.conversation ||  m.text : "";
var budy = typeof m.text == "string" ? m.text : "";
var prefix = prefa ? /^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi.test(body) ? body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi)[0] : "" : prefa ?? global.prefix;
global.prefix = prefix;
const isCmd = body.startsWith(prefix);
global.chatModifying = "edit: key";
const command = body.replace(prefix, "").trim().split(/ +/).shift().toLowerCase();
var args = body.trim().split(/ +/).slice(1);
args = args.concat(["", "", "", "", "", ""]);
const pushname = m.pushName || "No Name";
const { type  } = m;
const botNumber = await Satzz.decodeJid(Satzz.user.id);
const itsMe = m.sender == botNumber ? true : false;
const from = m.chat;
const q = args.join(" ").trim();
const quoted = m.quoted ? m.quoted : m
const mime = (quoted.msg || quoted).mimetype || ''
const qmsg = (quoted.msg || quoted)
const senderNumber = m.sender.split("@")[0];








const groupMetadata = m.isGroup ? await Satzz.groupMetadata(m.chat).catch((e) => { }) : ""; 
const groupName = groupMetadata.subject
const participants = m.isGroup ? await groupMetadata.participants : "";
const groupAdmins = m.isGroup ? await getGroupAdmins(participants) : "";
const isBotAdmins = m.isGroup ? groupAdmins.includes(botNumber) : false;
const isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false;
///// FUNCTION \\\\\
//=================================================//
const contextInfo = {
isForwarded: true, 
forwardingScore: 1000,
forwardedNewsletterMessageInfo: {
newsletterJid: "120363229748458166@newsletter",
newsletterName: global.wm,
serverMessageId: 100,
},
businessMessageForwardInfo: {businessOwnerJid: botNumber},
}
const reply = async (teks) => {
return Satzz.sendMessage(m.chat, { text: teks,
contextInfo: { 
mentionedJid: [...teks.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + "@s.whatsapp.net") || [m.sender], 
isForwarded: true, 
forwardingScore: 1000,
forwardedNewsletterMessageInfo: {
newsletterJid: "120363229748458166@newsletter", newsletterName: global.wm, serverMessageId: 100, }, businessMessageForwardInfo: {businessOwnerJid: botNumber}, externalAdReply: { title: global.botname, mediaType: 1,  mediaUrl: `https://instagram.com/kurniawansatria.mp4`, sourceUrl:`https://instagram.com/kurniawansatria.mp4`, thumbnail: fs.readFileSync("./src/thumb.jpeg")
},
}},{ quoted: m });
}

if (m.message) {
console.log(chalk.bgCyanBright(chalk.black("[ MESSAGE ]")),
chalk.green(moment.tz('Asia/Jakarta').format('HH:mm')),
chalk.blue(`${command} [${budy.length}]`), 
chalk.cyan('dari'),
chalk.red(`${pushname}`), m.isGroup? `${chalk.red('di gc')} ${chalk.red(groupName)}` : "")
console.log(chalk.bgMagentaBright(
chalk.black(`TYPE: ${m.mtype}`)),
chalk.green(moment.tz('Asia/Jakarta').format('HH:mm')))
if (type == 'editedMessage') {
console.log(m.message.editedMessage.message)
}
}
Satzz.sendPresenceUpdate('available', from)
await sleep(1000)
Satzz.sendPresenceUpdate('composing', from)
await sleep(1000)
Satzz.sendPresenceUpdate('unavailable', from)
//ANTI DELETE
if(m.mtype == 'protocolMessage' && !itsMe && !m.key.remoteJid.endsWith('status@broadcast')) {
let mess = chatUpdate.messages[0].message.protocolMessage
let chats = Object.entries(await Satzz.chats).find(([user, data]) => data.messages && data.messages[mess.key.id])
if(chats[1] == undefined) return
if(chats[1] !== undefined){
let msg = JSON.parse(JSON.stringify(chats[1].messages[mess.key.id]))
let mmk = await Satzz.copyNForward(mess.key.remoteJid, msg).catch(e => console.log(e, msg))
Satzz.sendMessage(mess.key.remoteJid, {sticker: {url: 'https://raw.githubusercontent.com/SatganzDevs/DATABASES/main/STC/andel.webp'}, contextInfo },{quoted:msg})
}
}
//ANTI VIEWONCE 
if (m.mtype === "viewOnceMessageV2" && !itsMe)  {
await Satzz.sendMessage(m.chat, {react: {text: "🤨", key: {remoteJid: m.chat, fromMe: false, key: m.key, id: m.key.id, participant: m.sender}}})
var view = m.message.viewOnceMessageV2.message
let Type = Object.keys(view)[0]
let media = await downloadContentFromMessage(view[Type], Type == 'imageMessage' ? 'image' : 'video')
let buffer = Buffer.from([])
for await (const chunk of media) {
buffer = Buffer.concat([buffer, chunk])
}
if (/video/.test(Type)) {
Satzz.sendMessage(m.chat, {video: buffer, caption:view[Type].caption || '', contextInfo},{quoted: m})
} else if (/image/.test(Type)) {
Satzz.sendMessage(m.chat, {image: buffer, caption:view[Type].caption || '', contextInfo},{quoted: m})
}
}
switch (command) {
case "send": case "kirim":{
Satzz.sendMessage(from, {video: await getBuffer(q), contextInfo})
}
break
//━━━━━━━━━━━━━━━[ INFO MENU ]━━━━━━━━━━━━━━━━━\\
case "runtime":{
if (!itsMe) return
reply(runtime(process.uptime()));
}
break;
case "speed":{
const timestampp = speed();
const latensi = speed() - timestampp
reply(`Speed: ${latensi.toFixed(4)} Second`)
}
break
//━━━━━━━━━━━━━━━[ CONVERTER MENU ]━━━━━━━━━━━━━━━━━//
case "toimg":
case "toimage":{
if (!itsMe) return
if (!/webp/.test(mime)) return reply(`Reply sticker dengan caption *${prefix + command}*`);
try {
let media = await Satzz.downloadAndSaveMediaMessage(qmsg);
let ran = await getRandom(".png");
exec(`ffmpeg -i ${media} ${ran}`, (err) => {
fs.unlinkSync(media);
if (err) throw err;
let buffer = fs.readFileSync(ran);
Satzz.sendMessage(m.chat, { image: buffer, contextInfo }, { quoted: m });
});
} catch {
let media = await Satzz.downloadAndSaveMediaMessage(qmsg);
let ran = await getRandom(".mp4");
exec(`ffmpeg -i ${media} ${ran}`, (err) => {
fs.unlinkSync(media);
if (err) throw err;
let buffer = fs.readFileSync(ran);
Satzz.sendMessage(m.chat, { video: buffer }, { quoted: m });
});
} 
}
break;
case "toaudio":{
if (!itsMe) return
if (!/video/.test(mime) && !/audio/.test(mime)) return reply(`Kirim/Reply Video/Audio Yang Ingin DijaSatzzn Audio Dengan Caption ${prefix + command
}`);
reply(mess.wait)
let media = await Satzz.downloadMediaMessage(qmsg);
let { toAudio } = require("../lib/converter");
let audio = await toAudio(media, "mp4");
await Satzz.sendMessage(m.chat,
{ audio: audio, mimetype: "audio/mpeg" },{ quoted: m }); 
}
break;
case "tomp3":{
if (!itsMe) return
if (!/video/.test(mime) && !/audio/.test(mime)) return reply(`Kirim/Reply Video/Audio Yang Ingin DijaSatzzn MP3 Dengan Caption ${prefix + command}`);
reply(mess.wait)
let media = await Satzz.downloadMediaMessage(qmsg);
let { toAudio } = require("../lib/converter");
let audio = await toAudio(media, "mp4");
Satzz.sendMessage(m.chat, { document: audio, mimetype: "audio/mpeg", fileName: `Convert By Satzz.mp3` },{ quoted: m }); 
}
break;
case "tovn":{
if (!itsMe) return
if (!/video/.test(mime) && !/audio/.test(mime)) return reply(`Reply Video/Audio Yang Ingin DijaSatzzn VN Dengan Caption ${prefix + command}`);
reply(mess.wait)
let media = await Satzz.downloadMediaMessage(qmsg);
let { toPTT } = require("../lib/converter");
let audio = await toPTT(media, "mp4");
Satzz.sendMessage(m.chat, {audio: audio, ptt: true, waveform: new Uint8Array(64), mimetype: "audio/mpeg", },{ quoted: m }) 
}
break;
case "togif":{
if (!itsMe) return
if (!/webp/.test(mime)) return reply(`Reply stiker dengan caption *${prefix + command}*`);
reply(mess.wait)
let { webp2mp4File } = require("../lib/uploader");
let media = await Satzz.downloadAndSaveMediaMessage(qmsg);
let webpToMp4 = await webp2mp4File(media);
await Satzz.sendMessage(m.chat, { video: {url: webpToMp4.result, caption: "Convert Webp To Video",streamingSidecar: new Uint8Array(300),},gifPlayback: true, contextInfo },{ quoted: m });
await fs.unlinkSync(media) 
}
break;
case "sticker": case "stiker": case "s":{
if (!itsMe) return
if (/image/.test(mime)) {
let media = await Satzz.downloadMediaMessage(qmsg);
let memek = await Satzz.sendImageAsSticker(m.chat, media, m, {pack: global.packname, author: global.author, isAvatar:true});
await fs.unlinkSync(memek);
} else if (/video/.test(mime)) {
let media = await Satzz.downloadMediaMessage(qmsg);
let encmedia = await Satzz.sendVideoAsSticker(m.chat, media, m, {pack: global.packname, author: global.author, isAvatar:true});
await fs.unlinkSync(encmedia);
} else reply(`Kirim/reply gambar/video/gif dengan caption ${prefix + command}\nDurasi Video/Gif 1-9 Detik`);
}
break;
case "smeme":{
if (!itsMe) return
if (!q) return reply(`Balas Image Dengan Caption ${prefix + command}`);
if (!quoted) return reply(`Balas Image Dengan Caption ${prefix + command}`);
if (/image/.test(mime)) {
mee = await Satzz.downloadAndSaveMediaMessage(quoted);
mem = await uptotelegra(mee);
let kaytid 
if (q.includes("|")) {
kaytid = await getBuffer(`https://api.memegen.link/images/custom/${q.split("|")[0]}/${q.split("|")[1]}.png?background=${mem}`);
} else kaytid = await getBuffer(`https://api.memegen.link/images/custom/-/${q}.png?background=${mem}`);
Satzz.sendImageAsSticker(m.chat, kaytid, m, {packname: global.packname,author: global.author,isAvatar:true});
} else return reply("hanya bisa membuat smeme dari foto");
}
break;
case "tohd":
case "remini":
case "hd": {
if (!itsMe) return
if (/image/.test(mime)) {
reply(mess.wait)
const { remini } = require('../lib/remini');
let media = await Satzz.downloadMediaMessage(qmsg);
let resultan = await remini(media, "enhance");
await Satzz.sendMessage(m.chat, { image: resultan, caption: "ɴɪʜ ᴋᴀᴋ ʜᴀꜱɪʟɴʏᴀ (*^ ‿ <*)♡", mimetype: "image/jpeg", contextInfo },{ quoted: m });
} else return reply('Bot Hanya Bisa Enhance Image/gambar.') 
}
break;
case ">":{
if (!itsMe) return
const evalAsync = () => {
return new Promise(async (resolve, reject) => {
try {
let evaled = await eval(budy.slice(2));
if (typeof evaled !== "string")
evaled = require("util").inspect(evaled);
resolve(evaled) } catch (err) { reject(err) }
})};
evalAsync().then((result) => m.reply(result)).catch((err) => reply(String(err)));    
}
break
case "$":{
if (!itsMe) return
reply("Executing...");
exec(budy.slice(2), async (err, stdout) => {
if (err) return m.reply(`${err}`);
if (stdout) return m.reply(stdout);
});      
}
break
default:
}




//━━━━━━━━━━━━━━━[ ERROR RESPONSE ]━━━━━━━━━━━━━━━━━// 
} catch (err) {
const Ownerins = async (teki) => {
return await Satzz.sendMessage(`6281316701742@s.whatsapp.net`, {text: teki, contextInfo: {externalAdReply: {title: "ERROR", thumbnail: fs.readFileSync("./src/thumb.jpeg"), mediaType: 1, renderLargerThumbnail: true}}})
}
console.error(err);
let tekidum =`]─────「 *SYSTEM-ERROR* 」─────[\n\n${util.format(err)}\n\n© ${botname}`
Ownerins(tekidum)
m.reply(`Someting went Wrong`);
}
};


















//━━━━━━━━━━━━━━━[ DETECT FILE UPDATE ]━━━━━━━━━━━━━━━━━\\
let file = require.resolve(__filename);
fs.watchFile(file, () => {
fs.unwatchFile(file);
console.log(chalk.blueBright(`「 Updated 」 ${__filename}`));
delete require.cache[file];
require(file);
});
