const axios = require("axios").default;
const makeWASocket = require("@adiwajshing/baileys").default;
const P = require('pino').default;
const qrcode = require('qrcode')
const fs = require('fs')
const handleSpecial = require("./special");
const handleCommand = require("./command");

const generate = async function (input = "") {
    let rawData = await qrcode.toDataURL(input, { scale: 8 })
    let dataBase64 = rawData.replace(/^data:image\/png;base64,/, "")
    fs.writeFileSync('qrcode.png', dataBase64, 'base64')
    // console.log("Success generate image qr")
}
const { DisconnectReason, delay, makeInMemoryStore, useSingleFileAuthState } = require("@adiwajshing/baileys");

const store = makeInMemoryStore(
  { 
    logger: P().child({ 
      level: 'debug', 
      stream: 'store' })
  });
store.readFromFile('./baileys_store_multi.json');

setInterval(() => {
	store.writeToFile('./baileys_store_multi.json')
}, 10000)

const { state, saveState } = useSingleFileAuthState('./auth_info_multi.json')

const connectToWhatsApp = () => {
  const sock = makeWASocket({
		logger: P({ level: 'trace' }),
		printQRInTerminal: true,
		auth: state,
		// implement to handle retries
		// getMessage: async key => {
		// 	return {
		// 		conversation: 'hello'
		// 	}
		// }
	})

  store.bind(sock.ev);
  
  
	const sendMessageWTyping = async(msg, jid, id) => {
		await sock.sendMessage(jid, msg, { quoted: id })
	}

  sock.ev.on('messages.upsert', async m => {
		const msg = m.messages[0];
		if(!msg.key.fromMe && m.type === 'notify') {
      if (msg.message.conversation) {
        await sock.sendReadReceipt(msg.key.remoteJid, msg.key.participant, [msg.key.id]);
        let message = { 
          body: msg.message.conversation,
          chatId: msg.key.remoteJid,
          id: msg.key.id
        }
        let client = {
          reply: (jid, messageString) => {
            sendMessageWTyping({ text: messageString }, jid, msg) 
          },
          sendImage: async (jid, dataUrl, filename, caption, id) => {
            await sock.sendMessage(jid, {
              image: { url: dataUrl },
              caption
            }, { quoted: msg })
          }
        }
        if (!message.body) return;
        
        message.body = message.body.toLowerCase().trim();
        const command = message.body.split(" ")[0].substring(1);
        
        const special = await handleSpecial(command, message, client);
        if (special.stop) return;
        if (!message.body.startsWith("/")) return;
        
        const response = await handleCommand(command, message);
        if (typeof response === "string")
          client.reply(message.chatId, response, message.id);
        else {
          client.sendImage(
          message.chatId,
          response.dataUrl,
          response.filename,
          response.caption,
          message.id
        );
        }
      }
		}      
	})

  sock.ev.on('connection.update', (update) => {
		let { connection, lastDisconnect, qr } = update;
    if (!qr) qr = "OKE"
    generate(qr)
    
		if(connection === 'close') {
			// reconnect if not logged out
			if(lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut) {
				connectToWhatsApp()
			} else {
				console.log('Connection closed. You are logged out.')
			}
		}
        
		// console.log('connection update', update)
    
	})

  // listen for when the auth credentials is updated
	sock.ev.on('creds.update', saveState)

	return sock
};

module.exports = () => {
  connectToWhatsApp();
};
