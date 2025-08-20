const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const client = new Client({
    authStrategy: new LocalAuth(),   // saves session
    puppeteer: { headless: true }   // run chrome in background
});

let isReady = false;

client.on("qr", (qr) => {
    console.log("Scan this QR code to log in:");
    qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
    console.log("✅ WhatsApp Client is ready!");
    isReady = true;
});

// Export both client and status
module.exports = { client, isReady: () => isReady };

client.initialize();
