require("./config");
const {
  proto,
  generateWAMessageFromContent,
  generateWAMessage,
  downloadContentFromMessage,
  getContentType,
  extractUrlFromText,
} = require("@whiskeysockets/baileys");
const fs = require("fs");
const moment = require("moment-timezone");
const util = require("util");
const chalk = require("chalk");
const cheerio = require("cheerio");
const speed = require("performance-now");
const axios = require("axios");
const { uptotelegra } = require("./lib/uploader");
const { exec } = require("child_process");
moment.tz.setDefault("Asia/Jakarta");

//lIB FILE
const {
  formatp,
  clockString,
  getAllCmd,
  getBuffer,
  getCases,
  generateProfilePicture,
  sleep,
  fetchJson,
  runtime,
  isUrl,
  pickRandom,
  getGroupAdmins,
  getRandom,
  FileSize,
  toFirstCase,
  makeId,
  formatNumber,
  durationToSeconds,
} = require("./lib/myfunc");

module.exports = Satzz = async (Satzz, m, chatUpdate, store) => {
  try {
    var body =
      m.mtype === "conversation"
        ? m.message.conversation
        : m.mtype == "imageMessage"
          ? m.message.imageMessage.caption
          : m.mtype == "videoMessage"
            ? m.message.videoMessage.caption
            : m.mtype == "extendedTextMessage"
              ? m.message.extendedTextMessage.text
              : m.mtype == "buttonsResponseMessage"
                ? m.message.buttonsResponseMessage.selectedButtonId
                : m.mtype == "listResponseMessage"
                  ? m.message.listResponseMessage.singleSelectReply
                      .selectedRowId
                  : m.mtype == "templateButtonReplyMessage"
                    ? m.message.templateButtonReplyMessage.selectedId
                    : m.mtype === "editedMessage"
                      ? m.message.editedMessage.message.protocolMessage
                          .editedMessage.extendedTextMessage ||
                        m.message.editedMessage.message.protocolMessage
                          .editedMessage.conversation ||
                        m.text
                      : "";
    var budy = typeof m.text == "string" ? m.text : "";
    var prefix = prefa
      ? /^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi.test(body)
        ? body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi)[0]
        : ""
      : prefa ?? global.prefix;
    global.prefix = prefix;
    const isCmd = body.startsWith(prefix);
    global.chatModifying = "edit: key";
    const command = body
      .replace(prefix, "")
      .trim()
      .split(/ +/)
      .shift()
      .toLowerCase();
    var args = body.trim().split(/ +/).slice(1);
    args = args.concat(["", "", "", "", "", ""]);
    const pushname = m.pushName || "No Name";
    const { type } = m;
    const botNumber = await Satzz.decodeJid(Satzz.user.id);
    const itsMe = m.sender == botNumber ? true : false;
    const from = m.chat;
    const q = args.join(" ").trim();
    const quoted = m.quoted ? m.quoted : m;
    const mime = (quoted.msg || quoted).mimetype || "";
    const qmsg = quoted.msg || quoted;
    const senderNumber = m.sender.split("@")[0];

    const groupMetadata = m.isGroup
      ? await Satzz.groupMetadata(m.chat).catch((e) => {})
      : "";
    const groupName = groupMetadata.subject;
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
      businessMessageForwardInfo: { businessOwnerJid: botNumber },
    };
    const reply = async (teks) => {
      return Satzz.sendMessage(
        m.chat,
        {
          text: teks,
          contextInfo: {
            mentionedJid: [...teks.matchAll(/@([0-9]{5,16}|0)/g)].map(
              (v) => v[1] + "@s.whatsapp.net",
            ) || [m.sender],
            isForwarded: true,
            forwardingScore: 1000,
            forwardedNewsletterMessageInfo: {
              newsletterJid: "120363229748458166@newsletter",
              newsletterName: global.wm,
              serverMessageId: 100,
            },
            businessMessageForwardInfo: { businessOwnerJid: botNumber },
            externalAdReply: {
              title: global.botname,
              mediaType: 1,
              mediaUrl: `https://instagram.com/kurniawansatria.mp4`,
              sourceUrl: `https://instagram.com/kurniawansatria.mp4`,
              thumbnail: fs.readFileSync("./src/thumb.jpeg"),
            },
          },
        },
        { quoted: m },
      );
    };

    if (m.message) {
      console.log(
        chalk.bgCyanBright(chalk.black("[ MESSAGE ]")),
        chalk.green(moment.tz("Asia/Jakarta").format("HH:mm")),
        chalk.blue(`${command} [${budy.length}]`),
        chalk.cyan("dari"),
        chalk.red(`${pushname}`),
        m.isGroup ? `${chalk.red("di gc")} ${chalk.red(groupName)}` : "",
      );
      console.log(
        chalk.bgMagentaBright(chalk.black(`TYPE: ${m.mtype}`)),
        chalk.green(moment.tz("Asia/Jakarta").format("HH:mm")),
      );
      if (type == "editedMessage") {
        console.log(m.message.editedMessage.message);
      }
    }

    //ANTI DELETE
    if (
      m.mtype == "protocolMessage" &&
      !itsMe &&
      !m.key.remoteJid.endsWith("status@broadcast")
    ) {
      let mess = chatUpdate.messages[0].message.protocolMessage;
      let chats = Object.entries(await Satzz.chats).find(
        ([user, data]) => data.messages && data.messages[mess.key.id],
      );
      if (chats[1] == undefined) return;
      if (chats[1] !== undefined) {
        let msg = JSON.parse(JSON.stringify(chats[1].messages[mess.key.id]));
        let mmk = await Satzz.copyNForward(mess.key.remoteJid, msg).catch((e) =>
          console.log(e, msg),
        );
        Satzz.sendMessage(
          mess.key.remoteJid,
          {
            sticker: {
              url: "https://raw.githubusercontent.com/SatganzDevs/DATABASES/main/STC/andel.webp",
            },
            contextInfo,
          },
          { quoted: msg },
        );
      }
    }
    //ANTI VIEWONCE
    if (m.mtype === "viewOnceMessageV2" && !itsMe) {
      await Satzz.sendMessage(m.chat, {
        react: {
          text: "🤨",
          key: {
            remoteJid: m.chat,
            fromMe: false,
            key: m.key,
            id: m.key.id,
            participant: m.sender,
          },
        },
      });
      var view = m.message.viewOnceMessageV2.message;
      let Type = Object.keys(view)[0];
      let media = await downloadContentFromMessage(
        view[Type],
        Type == "imageMessage" ? "image" : "video",
      );
      let buffer = Buffer.from([]);
      for await (const chunk of media) {
        buffer = Buffer.concat([buffer, chunk]);
      }
      if (/video/.test(Type)) {
        Satzz.sendMessage(
          m.chat,
          { video: buffer, caption: view[Type].caption || "", contextInfo },
          { quoted: m },
        );
      } else if (/image/.test(Type)) {
        Satzz.sendMessage(
          m.chat,
          { image: buffer, caption: view[Type].caption || "", contextInfo },
          { quoted: m },
        );
      }
    }
    switch (command) {
      case "tovn":
        {
          if (!itsMe) return;
          if (!/video/.test(mime) && !/audio/.test(mime))
            return reply(
              `Reply Video/Audio Yang Ingin DijaSatzzn VN Dengan Caption ${prefix + command}`,
            );
          reply(`...`);
          let media = await Satzz.downloadMediaMessage(qmsg);
          let { toPTT } = require("./lib/converter");
          let audio = await toPTT(media, "mp4");
          Satzz.sendMessage(
            m.chat,
            {
              audio: audio,
              ptt: true,
              waveform: new Uint8Array(64),
              mimetype: "audio/mpeg",
            },
            { quoted: m },
          );
        }
        break;
      case "setppbot":
        {
          if (!itsMe) return;
          let medis = await Satzz.downloadAndSaveMediaMessage(qmsg, "ppg");
          var { img } = await generateProfilePicture(medis);
          await Satzz.query({
            tag: "iq",
            attrs: { to: botNumber, type: "set", xmlns: "w:profile:picture" },
            content: [
              { tag: "picture", attrs: { type: "image" }, content: img },
            ],
          });
          fs.unlinkSync(medis);
        }
        break;
      default:
    }

    //━━━━━━━━━━━━━━━[ ERROR RESPONSE ]━━━━━━━━━━━━━━━━━//
  } catch (err) {
    const Ownerins = async (teki) => {
      return await Satzz.sendMessage(`6281316701742@s.whatsapp.net`, {
        text: teki,
        contextInfo: {
          externalAdReply: {
            title: "ERROR",
            thumbnail: fs.readFileSync("./src/thumb.jpeg"),
            mediaType: 1,
            renderLargerThumbnail: true,
          },
        },
      });
    };
    console.error(err);
    let tekidum = `]─────「 *SYSTEM-ERROR* 」─────[\n\n${util.format(err)}\n\n© ${botname}`;
    Ownerins(tekidum);
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
