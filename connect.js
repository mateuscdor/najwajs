const axios = require("axios").default;
const makeWASocket = require("@adiwajshing/baileys").default;
const P = require('pino').default;
const { DisconnectReason, makeInMemoryStore, useSingleFileAuthState } = require("@adiwajshing/baileys");

const store = makeInMemoryStore(
  { 
    logger: P().child({ 
      level: 'debug', 
      stream: 'store' })
  });
store.readFromFile('./baileys_store_multi.json');

setInterval(() => {
	store.writeToFile('./baileys_store_multi.json')
}, 10_000)

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

  sock.ev.on('messages.upsert', async m => {
		console.log(JSON.stringify(m, undefined, 2))
        
		const msg = m.messages[0]
		if(!msg.key.fromMe && m.type === 'notify') {
			console.log('replying to', m.messages[0].key.remoteJid)
			await sock.sendReadReceipt(msg.key.remoteJid, msg.key.participant, [msg.key.id])
			await sendMessageWTyping({ text: 'Hello there!' }, msg.key.remoteJid)
		}      
	})

  sock.ev.on('connection.update', (update) => {
		const { connection, lastDisconnect } = update
		if(connection === 'close') {
			// reconnect if not logged out
			if(lastDisconnect.error.output?.statusCode !== DisconnectReason.loggedOut) {
				connectToWhatsApp()
			} else {
				console.log('Connection closed. You are logged out.')
			}
		}
        
		console.log('connection update', update)
	})

  // listen for when the auth credentials is updated
	sock.ev.on('creds.update', saveState)

	return sock
};

module.exports = () => {
  connectToWhatsApp();
};
