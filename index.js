process.on("uncaughtException", console.error);
require("./config");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  MessageRetryMap,
  WAMessageStubType,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion,
  generateForwardMessageContent,
  prepareWAMessageMedia,
  areJidsSameUser,
  generateWAMessageFromContent,
  generateMessageID,
  downloadContentFromMessage,
  makeInMemoryStore,
  jidDecode,
  getAggregateVotesInPollMessage,
  proto,
} = require("@whiskeysockets/baileys");
const fs = require("fs");
const pino = require("pino");
const chalk = require("chalk");
const path = require("path");
const readline = require("readline");
const axios = require("axios");
const FileType = require("file-type");
const expres = require("express");
const app = expres();
const port = process.env.PORT || 3000;
const CFonts = require("cfonts");
const yargs = require("yargs/yargs");
const NodeCache = require("node-cache");
const _ = require("lodash");
const spin = require("spinnies");
const { Boom } = require("@hapi/boom");
const PhoneNumber = require("awesome-phonenumber");
const usePairingCode = false;
const {
  imageToWebp,
  videoToWebp,
  writeExifImg,
  writeExifVid,
} = require("./lib/exif");
const {
  smsg,
  isUrl,
  generateMessageTag,
  getBuffer,
  getSizeMedia,
  fetchJson,
  await,
  sleep,
} = require("./lib/myfunc");

const question = (text) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(text, resolve);
  });
};

const spinnies = new spin();

const spinner = {
  interval: 120,
  frames: [
    "✖ [░░░░░░░░░░░░░░░]",
    "✖ [■░░░░░░░░░░░░░░]",
    "✖ [■■░░░░░░░░░░░░░]",
    "✖ [■■■░░░░░░░░░░░░]",
    "✖ [■■■■░░░░░░░░░░░]",
    "✖ [■■■■■░░░░░░░░░░]",
    "✖ [■■■■■■░░░░░░░░░]",
    "✖ [■■■■■■■░░░░░░░░]",
    "✖ [■■■■■■■■░░░░░░░]",
    "✖ [■■■■■■■■■░░░░░░]",
    "✖ [■■■■■■■■■■░░░░░]",
    "✖ [■■■■■■■■■■■░░░░]",
    "✖ [■■■■■■■■■■■■░░░]",
    "✖ [■■■■■■■■■■■■■░░]",
    "✖ [■■■■■■■■■■■■■■░]",
    "✖ [■■■■■■■■■■■■■■■]",
  ],
};

let globalSpinner;
const getGlobalSpinner = (disableSpins = false) => {
  if (!globalSpinner)
    globalSpinner = new spin({
      color: "blue",
      succeedColor: "green",
      spinner,
      disableSpins,
    });
  return globalSpinner;
};

let spins = getGlobalSpinner(false);
const start = (id, text) => {
  spins.add(id, { text: text });
};

const success = (id, text) => {
  spins.succeed(id, { text: text });
};

var low;
try {
  low = require("lowdb");
} catch (e) {
  low = require("./lib/lowdb");
}
const { Low, JSONFile } = low;
const mongoDB = require("./lib/mongoDB");

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

global.opts = new Object(
  yargs(process.argv.slice(2)).exitProcess(false).parse(),
);
global.db = new Low(
  /https?:\/\//.test(opts["db"] || "")
    ? new cloudDBAdapter(opts["db"])
    : /mongodb/.test(opts["db"])
      ? new mongoDB(opts["db"])
      : new JSONFile(`./src/database.json`),
);
global.DATABASE = global.db; // Backwards Compatibility
global.loadDatabase = async function loadDatabase() {
  if (global.db.READ)
    return new Promise((resolve) =>
      setInterval(function () {
        !global.db.READ
          ? (clearInterval(this),
            resolve(
              global.db.data == null ? global.loadDatabase() : global.db.data,
            ))
          : null;
      }, 1 * 1000),
    );
  if (global.db.data !== null) return;
  global.db.READ = true;
  await global.db.read();
  global.db.READ = false;
  global.db.data = {
    users: {},
    chats: {},
    database: {},
    settings: {},
    thumb: {},
    others: {},
    audio: {},
    owner: [],
    ...(global.db.data || {}),
  };
  global.db.chain = _.chain(global.db.data);
};
loadDatabase();
// save database every 30seconds
if (global.db)
  setInterval(async () => {
    if (global.db.data) await global.db.write();
  }, 30 * 1000);

//Function Auto delete sampah
setInterval(() => {
  let directoryPath = path.join();
  fs.readdir(directoryPath, async function (err, files) {
    var filteredArray = await files.filter(
      (item) =>
        item.endsWith("jpeg") ||
        item.endsWith("gif") ||
        item.endsWith("png") ||
        item.endsWith("mp3") ||
        item.endsWith("mp4") ||
        item.endsWith("jpg") ||
        item.endsWith("webp") ||
        item.endsWith("webm") ||
        item.endsWith("zip"),
    );
    if (filteredArray.length > 0) {
      let teks = `Terdeteksi ${filteredArray.length} file sampah`;
      console.log(teks);
      setInterval(() => {
        if (filteredArray.length == 0)
          return console.log("File sampah telah hilang");
        filteredArray.forEach(function (file) {
          let sampah = fs.existsSync(file);
          if (sampah) fs.unlinkSync(file);
        });
      }, 15_000);
    }
  });
}, 30_000);

CFonts.say("SATZZ - MD", {
  font: "chrome",
  align: "left",
  gradient: ["red", "magenta"],
});

async function connectToWhatsApp() {
  async function getMessage(key) {
    if (store) {
      const msg = await store.loadMessage(key.remoteJid, key.id, undefined);
      return msg?.message || undefined;
    }
    return proto.Message.fromObject({});
  }
  const { state, saveCreds } = await useMultiFileAuthState(global.sessionName);
  const store = makeInMemoryStore({
    logger: pino().child({ level: "fatal", stream: "store" }),
  });
  const msgRetryCounterCache = new NodeCache();
  const satria = makeWASocket({
    logger: pino({ level: "fatal" }),
    printQRInTerminal: !usePairingCode,
    auth: state,
    browser: ["Safari (Linux)", "", ""],
    getMessage,
    MessageRetryMap,
    msgRetryCounterCache,
    keepAliveIntervalMs: 20000,
    defaultQueryTimeoutMs: undefined, // for this issues https://github.com/WhiskeySockets/Baileys/issues/276
    connectTimeoutMs: 30000,
    emitOwnEvents: true,
    fireInitQueries: true,
    generateHighQualityLinkPreview: true,
    syncFullHistory: true,
    markOnlineOnConnect: true,
  });

  store?.bind(satria.ev);

  satria.ev.on("creds.update", saveCreds);

  satria.getMessage = (key) => {
    return getMessage(key);
  };
  satria.ev.on("messages.upsert", async (chatUpdate) => {
    try {
      mek = chatUpdate.messages[0];
      if (!mek.message) return;
      mek.message =
        Object.keys(mek.message)[0] === "ephemeralMessage"
          ? mek.message.ephemeralMessage.message
          : mek.message;
      if (mek.key.remoteJid.endsWith("status@broadcast"))
        return satria.readMessages([mek.key]);
      if (mek.key.id.startsWith("BAE5") && mek.key.id.length === 16) return;
      m = smsg(satria, mek, store);
      require("./case.js")(satria, m, chatUpdate, store);
    } catch (err) {
      console.log(err);
    }
  });

  satria.ev.on("call", async (celled) => {
    let botNumber = await satria.decodeJid(satria.user.id);
    for (let kopel of celled) {
      if (kopel.isGroup == false) {
      }
    }
  });

  satria.ev.on("contacts.update", (update) => {
    for (let contact of update) {
      let id = satria.decodeJid(contact.id);
      if (store && store.contacts)
        store.contacts[id] = { id, name: contact.notify };
    }
  });

  satria.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
      if (reason === DisconnectReason.badSession) {
        console.log(`Bad Session File, Please Delete Session and Scan Again`);
        process.exit();
      } else if (reason === DisconnectReason.connectionClosed) {
        console.log("Connection closed, reconnecting....");
        connectToWhatsApp();
      } else if (reason === DisconnectReason.connectionLost) {
        console.log("Connection Lost from Server, reconnecting...");
        connectToWhatsApp();
      } else if (reason === DisconnectReason.connectionReplaced) {
        console.log(
          "Connection Replaced, Another New Session Opened, Please Restart Bot",
        );
        process.exit();
      } else if (reason === DisconnectReason.loggedOut) {
        console.log(
          `Device Logged Out, Please Delete Folder Session yusril and Scan Again.`,
        );
        process.exit();
      } else if (reason === DisconnectReason.restartRequired) {
        console.log("Restart Required, Restarting...");
        connectToWhatsApp();
      } else if (reason === DisconnectReason.timedOut) {
        console.log("Connection TimedOut, Reconnecting...");
        connectToWhatsApp();
      } else {
        console.log(`Unknown DisconnectReason: ${reason}|${connection}`);
        connectToWhatsApp();
      }
    } else if (connection === "connecting") {
      console.log(
        chalk.magenta(`]─`),
        `「`,
        chalk.red(`SATZZ`),
        `」`,
        chalk.magenta(`─[`),
      );
      start(`1`, `Connecting...`);
    } else if (connection === "open") {
      success(`1`, `[■■■■■■■■■■■■■■■] Connected`);
      await satria.sendMessage("6281316701742@s.whatsapp.net", {
        text: "im online!",
      });
    }
  });

  //LOAD MESSAGES
  satria.loadMessage = (messageID) => {
    return Object.entries(satria.chats)
      .filter(([_, { messages }]) => typeof messages === "object")
      .find(([_, { messages }]) =>
        Object.entries(messages).find(
          ([k, v]) => k === messageID || v.key?.id === messageID,
        ),
      )?.[1].messages?.[messageID];
  };

  satria.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {};
      return (
        (decode.user && decode.server && decode.user + "@" + decode.server) ||
        jid
      );
    } else return jid;
  };

  if (satria.user && satria.user.id)
    satria.user.jid = satria.decodeJid(satria.user.id);

  satria.chats = {};

  satria.contacts = {};

  satria.saveName = async (id, name = "") => {
    if (!id) return;
    id = satria.decodeJid(id);
    let isGroup = id.endsWith("@g.us");
    if (
      id in satria.contacts &&
      satria.contacts[id][isGroup ? "subject" : "name"] &&
      id in satria.chats
    )
      return;
    let metadata = {};
    if (isGroup) metadata = await satria.groupMetadata(id);
    let chat = {
      ...(satria.contacts[id] || {}),
      id,
      ...(isGroup
        ? { subject: metadata.subject, desc: metadata.desc }
        : { name }),
    };
    satria.contacts[id] = chat;
    satria.chats[id] = chat;
  };

  satria.getName = async (jid = "", withoutContact = false) => {
    let myUser = Object.keys(db.data.users);
    let nana = myUser.includes(jid)
      ? "User terdeteksi"
      : "User tidak terdeteksi";
    let jod = jid;

    jid = satria.decodeJid(jid);
    withoutContact = satria.withoutContact || withoutContact;
    let v;
    if (jid.endsWith("@g.us"))
      return new Promise(async (resolve) => {
        v = satria.chats[jid] || {};
        if (!(v.name || v.subject)) v = (await satria.groupMetadata(jid)) || {};
        resolve(
          v.name ||
            v.subject ||
            PhoneNumber("+" + jid.replace("@s.whatsapp.net", "")).getNumber(
              "international",
            ),
        );
      });
    else
      v =
        jid === "0@s.whatsapp.net"
          ? {
              jid,
              vname: "WhatsApp",
            }
          : areJidsSameUser(jid, satria.user.id)
            ? satria.user
            : satria.chats[jid] || {};
    return (
      (withoutContact ? "" : v.name) ||
      v.subject ||
      v.vname ||
      v.notify ||
      v.verifiedName ||
      (myUser.includes(jod)
        ? db.data.users[jod].name
        : PhoneNumber("+" + jid.replace("@s.whatsapp.net", ""))
            .getNumber("international")
            .replace(new RegExp("[()+-/ +/]", "gi"), ""))
    );
  };

  satria.serializeM = (m) => smsg(satria, m, store);
  satria.processMessageStubType = async (m) => {
    if (!m.messageStubType) return;
    const chat = satria.decodeJid(
      m.key.remoteJid || m.message?.senderKeyDistributionMessage?.groupId || "",
    );
    if (!chat || chat === "status@broadcast") return;
    const emitGroupUpdate = (update) => {
      ev.emit("groups.update", [{ id: chat, ...update }]);
    };
    console.log({
      messageStubType: m.messageStubType,
      messageStubParameters: m.messageStubParameters,
      type: WAMessageStubType[m.messageStubType],
    });
    const isGroup = chat.endsWith("@g.us");
    if (!isGroup) return;
    let chats = satria.chats[chat];
    if (!chats) chats = satria.chats[chat] = { id: chat };
    chats.isChats = true;
    const metadata = await satria.groupMetadata(chat).catch((_) => null);
    if (!metadata) return;
    chats.subject = metadata.subject;
    chats.metadata = metadata;
  };

  satria.insertAllGroup = async () => {
    const groups =
      (await satria.groupFetchAllParticipating().catch((_) => null)) || {};
    for (const group in groups)
      satria.chats[group] = {
        ...(satria.chats[group] || {}),
        id: group,
        subject: groups[group].subject,
        isChats: true,
        metadata: groups[group],
      };
    return satria.chats;
  };

  satria.pushMessage = async (m) => {
    if (!m) return;
    if (!Array.isArray(m)) m = [m];
    for (const message of m) {
      try {
        if (!message) continue;
        if (
          message.messageStubType &&
          message.messageStubType != WAMessageStubType.CIPHERTEXT
        )
          satria.processMessageStubType(message).catch(console.error);
        const _mtype = Object.keys(message.message || {});
        const mtype =
          (!["senderKeyDistributionMessage", "messageContextInfo"].includes(
            _mtype[0],
          ) &&
            _mtype[0]) ||
          (_mtype.length >= 3 &&
            _mtype[1] !== "messageContextInfo" &&
            _mtype[1]) ||
          _mtype[_mtype.length - 1];
        const chat = satria.decodeJid(
          message.key.remoteJid ||
            message.message?.senderKeyDistributionMessage?.groupId ||
            "",
        );
        if (message.message?.[mtype]?.contextInfo?.quotedMessage) {
          let context = message.message[mtype].contextInfo;
          let participant = satria.decodeJid(context.participant);
          const remoteJid = satria.decodeJid(context.remoteJid || participant);
          let quoted = message.message[mtype].contextInfo.quotedMessage;
          if (remoteJid && remoteJid !== "status@broadcast" && quoted) {
            let qMtype = Object.keys(quoted)[0];
            if (qMtype == "conversation") {
              quoted.extendedTextMessage = { text: quoted[qMtype] };
              delete quoted.conversation;
              qMtype = "extendedTextMessage";
            }
            if (!quoted[qMtype].contextInfo) quoted[qMtype].contextInfo = {};
            quoted[qMtype].contextInfo.mentionedJid =
              context.mentionedJid ||
              quoted[qMtype].contextInfo.mentionedJid ||
              [];
            const isGroup = remoteJid.endsWith("g.us");
            if (isGroup && !participant) participant = remoteJid;
            const qM = {
              key: {
                remoteJid,
                fromMe: areJidsSameUser(satria.user.jid, remoteJid),
                id: context.stanzaId,
                participant,
              },
              message: JSON.parse(JSON.stringify(quoted)),
              ...(isGroup ? { participant } : {}),
            };
            let qChats = satria.chats[participant];
            if (!qChats)
              qChats = satria.chats[participant] = {
                id: participant,
                isChats: !isGroup,
              };
            if (!qChats.messages) qChats.messages = {};
            if (!qChats.messages[context.stanzaId] && !qM.key.fromMe)
              qChats.messages[context.stanzaId] = qM;
            let qChatsMessages;
            if ((qChatsMessages = Object.entries(qChats.messages)).length > 40)
              qChats.messages = Object.fromEntries(
                qChatsMessages.slice(30, qChatsMessages.length),
              );
          }
        }
        if (!chat || chat === "status@broadcast") continue;
        const isGroup = chat.endsWith("@g.us");
        let chats = satria.chats[chat];
        if (!chats) {
          if (isGroup) await satria.insertAllGroup().catch(console.error);
          chats = satria.chats[chat] = {
            id: chat,
            isChats: true,
            ...(satria.chats[chat] || {}),
          };
        }
        let metadata, sender;
        if (isGroup) {
          if (!chats.subject || !chats.metadata) {
            metadata =
              (await satria.groupMetadata(chat).catch((_) => ({}))) || {};
            if (!chats.subject) chats.subject = metadata.subject || "";
            if (!chats.metadata) chats.metadata = metadata;
          }
          sender = satria.decodeJid(
            (message.key?.fromMe && satria.user.id) ||
              message.participant ||
              message.key?.participant ||
              chat ||
              "",
          );
          if (sender !== chat) {
            let chats = satria.chats[sender];
            if (!chats) chats = satria.chats[sender] = { id: sender };
            if (!chats.name) chats.name = message.pushName || chats.name || "";
          }
        } else if (!chats.name)
          chats.name = message.pushName || chats.name || "";
        if (
          ["senderKeyDistributionMessage", "messageContextInfo"].includes(mtype)
        )
          continue;
        chats.isChats = true;
        if (!chats.messages) chats.messages = {};
        const fromMe =
          message.key.fromMe || areJidsSameUser(sender || chat, satria.user.id);
        if (
          !["protocolMessage"].includes(mtype) &&
          !fromMe &&
          message.messageStubType != WAMessageStubType.CIPHERTEXT &&
          message.message
        ) {
          delete message.message.messageContextInfo;
          delete message.message.senderKeyDistributionMessage;
          chats.messages[message.key.id] = JSON.parse(
            JSON.stringify(message, null, 2),
          );
          let chatsMessages;
          if ((chatsMessages = Object.entries(chats.messages)).length > 40)
            chats.messages = Object.fromEntries(
              chatsMessages.slice(30, chatsMessages.length),
            );
        }
      } catch (e) {
        console.error(e);
      }
    }
  };
  satria.downloadMediaMessage = async (message) => {
    let mime = (message.msg || message).mimetype || "";
    let messageType = message.mtype
      ? message.mtype.replace(/Message/gi, "")
      : mime.split("/")[0];
    const stream = await downloadContentFromMessage(message, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
  };

  satria.sendContact = async (jid, kon, quoted = "", opts = {}) => {
    let list = [];
    for (let i of kon) {
      list.push({
        displayName: await satria.getName(i + "@s.whatsapp.net"),
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await satria.getName(i + "@s.whatsapp.net")}\nFN:${await satria.getName(i + "@s.whatsapp.net")}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Ponsel\nitem2.EMAIL;type=INTERNET:aplusscell@gmail.com\nitem2.X-ABLabel:Email\nitem3.URL:https://chat.whatsapp.com/HbCl8qf3KQK1MEp3ZBBpSf\nitem3.X-ABLabel:Instagram\nitem4.ADR:;;Indonesia;;;;\nitem4.X-ABLabel:Region\nEND:VCARD`,
      });
    }

    satria.sendMessage(
      jid,
      {
        contacts: { displayName: `${list.length} Kontak`, contacts: list },
        ...opts,
      },
      { quoted },
    );
  };

  satria.sendPoll = (jid, name = "", values = [], selectableCount = 1) => {
    return satria.sendMessage(jid, { poll: { name, values, selectableCount } });
  };

  satria.public = true;

  satria.fuck = async (jid, teks, title, thumbnail) => {
    return satria.sendMessage(jid, {
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
        businessMessageForwardInfo: { businessOwnerJid: satria.user.id },
        externalAdReply: {
          title,
          body: global.botname,
          previewType: 1,
          mediaType: 1,
          mediaUrl: `https://instagram.com/kurniawansatria.mp4`,
          sourceUrl: `https://instagram.com/kurniawansatria.mp4`,
          thumbnail,
        },
      },
    });
  };

  satria.downloadMediaMessage = async (message) => {
    let mime = (message.msg || message).mimetype || "";
    let messageType = message.mtype
      ? message.mtype.replace(/Message/gi, "")
      : mime.split("/")[0];
    const stream = await downloadContentFromMessage(message, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
  };

  satria.sendImage = async (jid, path, caption = "", quoted = "", options) => {
    let buffer = Buffer.isBuffer(path)
      ? path
      : /^data:.*?\/.*?;base64,/i.test(path)
        ? Buffer.from(path.split`,`[1], "base64")
        : /^https?:\/\//.test(path)
          ? await await getBuffer(path)
          : fs.existsSync(path)
            ? fs.readFileSync(path)
            : Buffer.alloc(0);
    return await satria.sendMessage(
      jid,
      { image: buffer, caption: caption, ...options },
      { quoted },
    );
  };

  satria.sendText = (jid, text, quoted = "", options) =>
    satria.sendMessage(jid, { text: text, ...options }, { quoted });

  satria.sendTextWithMentions = async (jid, text, quoted, options = {}) =>
    satria.sendMessage(
      jid,
      {
        text: text,
        contextInfo: {
          mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(
            (v) => v[1] + "@s.whatsapp.net",
          ),
        },
        ...options,
      },
      { quoted },
    );

  satria.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
    let mime = "";
    let res = await axios.head(url);
    mime = res.headers["content-type"];
    if (mime.split("/")[1] === "gif") {
      return satria.sendMessage(
        jid,
        {
          video: await getBuffer(url),
          caption: caption,
          gifPlayback: true,
          ...options,
        },
        { quoted },
      );
    }
    let type = mime.split("/")[0] + "Message";
    if (mime === "application/pdf") {
      return satria.sendMessage(
        jid,
        {
          document: await getBuffer(url),
          mimetype: "application/pdf",
          caption: caption,
          ...options,
        },
        { quoted },
      );
    }
    if (mime.split("/")[0] === "image") {
      return satria.sendMessage(
        jid,
        { image: await getBuffer(url), caption: caption, ...options },
        { quoted },
      );
    }
    if (
      mime.split("/")[0] === "video" ||
      mime.split("/")[1] === "octet-stream"
    ) {
      return satria.sendMessage(
        jid,
        {
          video: await getBuffer(url),
          caption: caption,
          mimetype: "video/mp4",
          ...options,
        },
        { quoted },
      );
    }
    if (mime.split("/")[0] === "audio") {
      return satria.sendMessage(
        jid,
        {
          audio: await getBuffer(url),
          caption: caption,
          mimetype: "audio/mpeg",
          ...options,
        },
        { quoted },
      );
    } else return console.error(mime);
  };

  satria.sendContactArray = async (jid, data, quoted, options) => {
    let contacts = [];
    for (let [number, name, isi, isi1, isi2, isi3, isi4, isi5] of data) {
      number = number.replace(/[^0-9]/g, "");
      let contextInfo = {
        //mentionedJid: [sender],
        externalAdReply: {
          showAdAttribution: true,
          mediaType: 1,
          renderLargerThumbnail: true,
          thumbnailUrl: "https://telegra.ph/file/c8b52ca0d1cf33667b565.jpg",
        },
      };
      let vcard = `
BEGIN:VCARD
VERSION:3.0
N:Sy;Bot;;;
FN:${name.replace(/\n/g, "\\n")}
item.ORG:${isi}
item1.TEL;waid=${number}:${PhoneNumber("+" + number).getNumber("international")}
item1.X-ABLabel:${isi1}
item2.EMAIL;type=INTERNET: satria@gmail.com
item2.X-ABLabel:📧 Email
item3.ADR:;; Pekanbaru;;;;
item3.X-ABADR:ac
item3.X-ABLabel:📍 Region
item4.URL:https://itsme.satria.tech
item4.X-ABLabel:Website
item5.X-ABLabel:bot ini di dengan tangan yang belum pernah kau genggam. -Satzz
END:VCARD`.trim();
      contacts.push({ contextInfo, vcard, displayName: name });
    }
    return await satria.sendMessage(
      jid,
      {
        contacts: {
          displayName:
            (contacts.length > 1 ? `2013 kontak` : contacts[0].displayName) ||
            null,
          contacts,
        },
      },
      {
        quoted,
        ...options,
      },
    );
  };

  satria.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
    let buff = Buffer.isBuffer(path)
      ? path
      : /^data:.*?\/.*?;base64,/i.test(path)
        ? Buffer.from(path.split`,`[1], "base64")
        : /^https?:\/\//.test(path)
          ? await await getBuffer(path)
          : fs.existsSync(path)
            ? fs.readFileSync(path)
            : Buffer.alloc(0);
    let buffer;
    if (options && (options.packname || options.author)) {
      buffer = await writeExifImg(buff, options);
    } else {
      buffer = await imageToWebp(buff);
    }
    await satria.sendMessage(
      jid,
      { sticker: { url: buffer }, ...options },
      { quoted },
    );
    return buffer;
  };

  satria.sendSticker = (teks) => {
    satria.sendMessage(m.chat, { sticker: { url: teks } }, { quoted: m });
  };

  satria.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
    let buff = Buffer.isBuffer(path)
      ? path
      : /^data:.*?\/.*?;base64,/i.test(path)
        ? Buffer.from(path.split`,`[1], "base64")
        : /^https?:\/\//.test(path)
          ? await await getBuffer(path)
          : fs.existsSync(path)
            ? fs.readFileSync(path)
            : Buffer.alloc(0);
    let buffer;
    if (options && (options.packname || options.author)) {
      buffer = await writeExifVid(buff, options);
    } else {
      buffer = await videoToWebp(buff);
    }
    await satria.sendMessage(
      jid,
      { sticker: { url: buffer }, ...options },
      { quoted },
    );
    return buffer;
  };

  satria.downloadAndSaveMediaMessage = async (
    message,
    filename,
    attachExtension = true,
  ) => {
    let quoted = message.msg ? message.msg : message;
    let mime = (message.msg || message).mimetype || "";
    let messageType = message.mtype
      ? message.mtype.replace(/Message/gi, "")
      : mime.split("/")[0];
    const stream = await downloadContentFromMessage(quoted, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    let type = await FileType.fromBuffer(buffer);
    trueFileName = attachExtension ? filename + "." + type.ext : filename;
    await fs.writeFileSync(trueFileName, buffer);
    return trueFileName;
  };

  satria.cMod = (
    jid,
    copy,
    text = "",
    sender = satria.user.id,
    options = {},
  ) => {
    let mtype = Object.keys(copy.message)[0];
    let isEphemeral = mtype === "ephemeralMessage";
    if (isEphemeral) {
      mtype = Object.keys(copy.message.ephemeralMessage.message)[0];
    }
    let msg = isEphemeral
      ? copy.message.ephemeralMessage.message
      : copy.message;
    let content = msg[mtype];
    if (typeof content === "string") msg[mtype] = text || content;
    else if (content.caption) content.caption = text || content.caption;
    else if (content.text) content.text = text || content.text;
    if (typeof content !== "string")
      msg[mtype] = {
        ...content,
        ...options,
      };
    if (copy.key.participant)
      sender = copy.key.participant = sender || copy.key.participant;
    else if (copy.key.participant)
      sender = copy.key.participant = sender || copy.key.participant;
    if (copy.key.remoteJid.includes("@s.whatsapp.net"))
      sender = sender || copy.key.remoteJid;
    else if (copy.key.remoteJid.includes("@broadcast"))
      sender = sender || copy.key.remoteJid;
    copy.key.remoteJid = jid;
    copy.key.fromMe = sender === satria.user.id;
    return proto.WebMessageInfo.fromObject(copy);
  };
  satria.sendFile = async (jid, PATH, fileName, quoted = {}, options = {}) => {
    let types = await satria.getFile(PATH, true);
    let { filename, size, ext, mime, data } = types;
    let type = "",
      mimetype = mime,
      pathFile = filename;
    if (options.asDocument) type = "document";
    if (options.asSticker || /webp/.test(mime)) {
      let { writeExif } = require("./lib/sticker.js");
      let media = { mimetype: mime, data };
      pathFile = await writeExif(media, {
        packname: global.packname,
        author: global.packname2,
        categories: options.categories ? options.categories : [],
      });
      await fs.promises.unlink(filename);
      type = "sticker";
      mimetype = "image/webp";
    } else if (/image/.test(mime)) type = "image";
    else if (/video/.test(mime)) type = "video";
    else if (/audio/.test(mime)) type = "audio";
    else type = "document";
    await satria.sendMessage(
      jid,
      { [type]: { url: pathFile }, mimetype, fileName, ...options },
      { quoted, ...options },
    );
    return fs.promises.unlink(pathFile);
  };
  satria.parseMention = async (text) => {
    return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(
      (v) => v[1] + "@s.whatsapp.net",
    );
  };

  satria.copyNForward = async (
    jid,
    message,
    forceForward = false,
    options = {},
  ) => {
    let vtype;
    if (options.readViewOnce) {
      message.message =
        message.message &&
        message.message.ephemeralMessage &&
        message.message.ephemeralMessage.message
          ? message.message.ephemeralMessage.message
          : message.message || undefined;
      vtype = Object.keys(message.message.viewOnceMessage.message)[0];
      delete (message.message && message.message.ignore
        ? message.message.ignore
        : message.message || undefined);
      delete message.message.viewOnceMessage.message[vtype].viewOnce;
      message.message = {
        ...message.message.viewOnceMessage.message,
      };
    }
    let mtype = Object.keys(message.message)[0];
    let content = await generateForwardMessageContent(message, forceForward);
    let ctype = Object.keys(content)[0];
    let context = {};
    if (mtype != "conversation") context = message.message[mtype].contextInfo;
    content[ctype].contextInfo = {
      ...context,
      ...content[ctype].contextInfo,
    };
    const waMessage = await generateWAMessageFromContent(
      jid,
      content,
      options
        ? {
            ...content[ctype],
            ...options,
            ...(options.contextInfo
              ? {
                  contextInfo: {
                    ...content[ctype].contextInfo,
                    ...options.contextInfo,
                  },
                }
              : {}),
          }
        : {},
    );
    await satria.relayMessage(jid, waMessage.message, {
      messageId: waMessage.key.id,
    });
    return waMessage;
  };

  satria.getFile = async (PATH, save) => {
    let res;
    let data = Buffer.isBuffer(PATH)
      ? PATH
      : /^data:.*?\/.*?;base64,/i.test(PATH)
        ? Buffer.from(PATH.split`,`[1], "base64")
        : /^https?:\/\//.test(PATH)
          ? await (res = await getBuffer(PATH))
          : fs.existsSync(PATH)
            ? ((filename = PATH), fs.readFileSync(PATH))
            : typeof PATH === "string"
              ? PATH
              : Buffer.alloc(0);
    let type = (await FileType.fromBuffer(data)) || {
      mime: "application/octet-stream",
      ext: ".bin",
    };
    filename = path.join(
      __filename,
      "../src/" + new Date() * 1 + "." + type.ext,
    );
    if (data && save) fs.promises.writeFile(filename, data);
    return {
      res,
      filename,
      size: await getSizeMedia(data),
      ...type,
      data,
    };
  };

  return satria;
}
connectToWhatsApp();

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Update ${__filename}`));
  delete require.cache[file];
  require(file);
});
