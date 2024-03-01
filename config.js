const fs = require('fs')
const chalk = require('chalk')
const moment = require("moment-timezone");
const { pickRandom } = require('./lib/myfunc')
moment.tz.setDefault('Asia/Jakarta');
let d = new Date
let locale = 'id'
let gmt = new Date(0).getTime() - new Date('1 Januari 2021').getTime()




global.weton = ['Pahing', 'Pon','Wage','Kliwon','Legi'][Math.floor(((d * 1) + gmt) / 84600000) % 5]
global.week = d.toLocaleDateString(locale, { weekday: 'long' })
global.calender = d.toLocaleDateString("id", {day: 'numeric', month: 'long', year: 'numeric'})
global.owner = ['6281316701742'] 
global.botname = 'SatganzDevs'
global.packname = '' 
global.author = "Crafted With ❤️ By kurniawansatria"
global.prefa = ['','!','.',',','🐤','🗿']
global.sessionName = 'session' 




let file = require.resolve(__filename);
fs.watchFile(file, () => {
fs.unwatchFile(file);
console.log(chalk.blueBright(`「 Updated 」 ${__filename}`));
delete require.cache[file];
require(file);
});