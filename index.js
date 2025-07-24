const { create } = require('@open-wa/wa-automate');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

create({
    sessionId: 'listener',
    authStrategy: 'local',
    sessionDataPath: './session',
    headless: 'new',
    args: ['--no-sandbox'],
    qrTimeout: 0,
    qrRefreshS: 60,
    authTimeout: 90,
    autoRefresh: true,
    qrCallback: (qrCode) => {
        console.log("Bitte scanne diesen QR-Code mit WhatsApp:");
        qrcode.generate(qrCode, { small: false });
    }
}).then(client => {
    console.log("WhatsApp-Client gestartet");

    client.onStateChanged(state => {
        console.log("Verbindungsstatus:", state);
    });

    client.onAnyMessage(async message => {
        if (message.isGroupMsg) {
            const payload = {
                group: message.chat.name,
                from: message.sender.pushname || message.sender.formattedName || "Ich",
                text: message.body,
                timestamp: message.timestamp
            };

            console.log(`[📨] ${payload.group}: ${payload.from} > ${payload.text}`);

            try {
                await axios.post('http://localhost:8300/log', payload);
            } catch (err) {
                console.error("Fehler beim Senden an Logger:", err.message);
            }
        }
    });
}).catch(err => {
    console.error("Fehler beim Starten des WhatsApp-Clients:", err);
});
