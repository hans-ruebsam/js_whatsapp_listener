

## 🛠 systemd-Service: `whatsapp-client.service`

```ini
[Unit]
Description=WhatsApp Client Node.js Service
After=network.target

[Service]
ExecStart=/usr/bin/node /home/<user_name>/js_whatsapp_listener/index.js
Restart=always
RestartSec=10
User=<user_name>
Environment=NODE_ENV=production
WorkingDirectory=/home/<user_name>/js_whatsapp_listener

[Install]
WantedBy=multi-user.target
```

---

## 🛠 systemd-Service: `whatsapp-listener.service`

```ini
[Unit]
Description=WhatsApp Listener Node.js Service (Log-HTTP-Server)
After=network.target

[Service]
ExecStart=/usr/bin/node /home/<user_name>/js_whatsapp_listener/listener.js
Restart=always
RestartSec=10
User=<user_name>
Environment=NODE_ENV=production
WorkingDirectory=/home/<user_name>/js_whatsapp_listener

[Install]
WantedBy=multi-user.target
```

## Services aktivieren

```bash
sudo cp whatsapp-client.service /etc/systemd/system/
sudo cp whatsapp-listener.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable whatsapp-client.service
sudo systemctl enable whatsapp-listener.service
sudo systemctl start whatsapp-listener.service
sudo systemctl start whatsapp-client.service
```

## Erste Anmeldung

```bash
sudo systemctl stop whatsapp-client.service
node index.js   # QR-Code scannen
# Nach "CONNECTED" mit Ctrl+C beenden
sudo systemctl start whatsapp-client.service
```

## Logs anzeigen

```bash
sudo journalctl -u whatsapp-client -f
sudo journalctl -u whatsapp-listener -f
```

## Logfiles

Tägliche rotierende Textlogs befinden sich im Verzeichnis `logs/`.
