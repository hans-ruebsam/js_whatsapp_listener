
# WhatsApp-Gruppen-Logger mit Node.js

Dieses Projekt besteht aus zwei gekoppelten Node.js-Diensten, die gemeinsam WhatsApp-Gruppennachrichten auslesen und in rotierende Logdateien schreiben – vollständig automatisiert und über systemd verwaltbar.

---

## 📦 Komponenten

### 1. `index.js` – WhatsApp-Client

- Baut eine Verbindung zu WhatsApp Web via [@open-wa/wa-automate](https://openwa.dev/) auf
- Zeigt bei Bedarf einen QR-Code zur Authentifizierung im Terminal (z. B. via `journalctl`)
- Liest eingehende **Gruppennachrichten**
- Sendet die Nachrichtendaten lokal per HTTP an den Logger

### 2. `listener.js` – HTTP-Logger

- Startet einen Express.js-Server auf Port `8300` (oder konfigurierbar via `.env`)
- Schreibt eingehende Nachrichten in **rollierende Logdateien pro Tag**
- Logs befinden sich im Verzeichnis `logs/`

---

## 🖥 Systemvoraussetzungen

- Linux-Server mit systemd
- Node.js 18+
- Chromium (wird automatisch von Puppeteer heruntergeladen)
- Keine Desktop-Oberfläche erforderlich (Headless-Betrieb)

---

## 🛠 Installation

### 1. (a) Repository klonen und vorbereiten

```bash
git clone <REPO_URL> js_whatsapp_listener
cd js_whatsapp_listener
npm install
````

### 1. (b) Loakles npm Setup

```bash
npm init -y  

npm install @open-wa/wa-automate puppeteer axios express body-parser winston winston-daily-rotate-file qrcode-terminal  

npm install dotenv
````

### 2. Dienste installieren

```bash
sudo cp whatsapp-client.service /etc/systemd/system/
sudo cp whatsapp-listener.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable whatsapp-client.service
sudo systemctl enable whatsapp-listener.service
```

---

## 🚀 Erstinbetriebnahme (mit QR-Scan)

Da WhatsApp beim ersten Start eine Authentifizierung per QR verlangt:

1. Stelle sicher, dass der Dienst **nicht** läuft:

```bash
sudo systemctl stop whatsapp-client
```

2. Starte den WhatsApp-Client **manuell**:

```bash
node index.js
```

3. Scanne den angezeigten QR-Code mit WhatsApp auf deinem Smartphone
   (unter "Verknüpfte Geräte")

4. Warte auf die Meldung:

```
📶 Verbindungsstatus: CONNECTED
```

5. Beende mit `CTRL+C`

6. Starte den systemd-Dienst:

```bash
sudo systemctl start whatsapp-client
```

---

## 📡 Dienste verwalten

```bash
# starten
sudo systemctl start whatsapp-client
sudo systemctl start whatsapp-listener

# stoppen
sudo systemctl stop whatsapp-client
sudo systemctl stop whatsapp-listener

# Neustart
sudo systemctl restart whatsapp-client
sudo systemctl restart whatsapp-listener

# Logs anzeigen
sudo journalctl -u whatsapp-client -f
sudo journalctl -u whatsapp-listener -f
```

---

## 📁 Projektstruktur

```
js_whatsapp_listener/
├── index.js                   # WhatsApp-Client (QR, Nachrichtenerfassung)
├── listener.js                # HTTP-Server zum Loggen
├── session/                   # gespeicherte WhatsApp-Session
├── logs/                      # rotierende Tages-Logdateien
├── .env                       # (optional) Portkonfiguration
├── package.json               # Abhängigkeiten
├── whatsapp-client.service    # systemd-Dienst für index.js
├── whatsapp-listener.service  # systemd-Dienst für listener.js
└── README.md
```

---

## ⚙️ Ports & Konfiguration (optional via `.env`)

Der `listener.js`-Service kann den HTTP-Port aus einer `.env`-Datei lesen:

```env
PORT=8300
```

In `listener.js`:

```js
require('dotenv').config();
const PORT = process.env.PORT || 8300;
```

> Die Datei `.env` sollte in `.gitignore` enthalten sein.

---

## 🧾 Beispielhafte Logzeile

```
[2025-07-22 14:42:03] Gruppenname | Max Mustermann: Hallo zusammen!
```

---

## 🚫 Was das Projekt **nicht** tut

* keine Antwort- oder Chatbot-Logik
* keine Verarbeitung von Direktnachrichten
* kein Zugriff auf Medien oder Dateien

---

## 🧩 Hinweise zur Sicherheit

* Die WhatsApp-Web-Session wird lokal im Verzeichnis `./session` gespeichert
* **Sichere das Session-Verzeichnis regelmäßig** (z. B. per `cron`)
* Bei Sicherheitsproblemen auf WhatsApp-Seite kann die Session ungültig werden – in dem Fall einfach QR erneut scannen (s. o.)

