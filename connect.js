const axios = require("axios").default;
const makeWASocket = require("@adiwajshing/baileys").default;
const { DisconnectReason } = require("@adiwajshing/baileys");

const connectToWhatsApp = () => {
  const sock = makeWASocket({
    // can provide additional config here
    printQRInTerminal: false,
  });

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;
      console.log(
        "connection closed due to ",
        lastDisconnect.error,
        ", reconnecting ",
        shouldReconnect
      );
      // reconnect if not logged out
      if (shouldReconnect) {
        connectToWhatsApp();
      }
    } else if (connection === "open") {
      console.log("opened connection");
    }
  });
};

module.exports = () => {
  connectToWhatsApp();
};
