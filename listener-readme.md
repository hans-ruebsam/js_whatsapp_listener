# WhatsApp Listener HTTP Logger

A Node.js HTTP server that receives WhatsApp group messages and logs them to rotating daily files using Winston.

## 📋 Overview

The `listener.js` script creates an Express HTTP server that:
- Listens for POST requests on `/log` endpoint
- Receives WhatsApp message data in JSON format
- Writes messages to daily rotating log files
- Supports configurable log file extensions

## 🚀 Usage

### Basic Usage (Default .log extension)
```bash
node listener.js
```
Creates log files like: `2025-07-28.log`

### Custom Log File Extension
```bash
# With dot prefix
node listener.js .txt
node listener.js .csv
node listener.js .tsv

# Without dot prefix (automatically added)
node listener.js txt
node listener.js csv
node listener.js out
```

### Examples
| Command | Result File |
|---------|-------------|
| `node listener.js` | `2025-07-28.log` |
| `node listener.js .txt` | `2025-07-28.txt` |
| `node listener.js csv` | `2025-07-28.csv` |
| `node listener.js .out` | `2025-07-28.out` |

## 🔧 Configuration

### Environment Variables
- `PORT`: HTTP server port (default: 8300)

### Command Line Arguments
- **Argument 1**: Log file extension (default: `.log`)

### Example with custom port and extension
```bash
PORT=9000 node listener.js .txt
```

## 📡 API Endpoint

### POST /log
Receives WhatsApp message data and logs it to file.

**Request Body:**
```json
{
  "group": "Group Name",
  "from": "Sender Name",
  "text": "Message content",
  "timestamp": 1690552800000
}
```

**Response:**
```
OK
```

**Log Format:**
```
[2025-07-28 14:42:03] Group Name | Sender Name: Message content
```

## 📁 File Structure

```
logs/
├── 2025-07-28.log    # (or custom extension)
├── 2025-07-29.log
└── ...
```

### Log Rotation Settings
- **File Pattern**: `YYYY-MM-DD.{extension}`
- **Max File Size**: 5MB
- **Retention**: 14 days
- **Compression**: Disabled

## 🔧 Integration with WhatsApp Client

This listener is designed to work with the WhatsApp client (`index.js`) that sends HTTP requests:

```javascript
// In index.js
const payload = {
    group: message.chat.name,
    from: message.sender.pushname,
    text: message.body,
    timestamp: message.timestamp
};

await axios.post('http://localhost:8300/log', payload);
```

## 🖥 System Service Integration

### systemd Service Example
```ini
[Unit]
Description=WhatsApp Listener HTTP Logger
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/js_whatsapp_listener
ExecStart=/usr/bin/node listener.js .log
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=8300

[Install]
WantedBy=multi-user.target
```

### With Custom Extension
```ini
ExecStart=/usr/bin/node listener.js .txt
```

## 📊 Monitoring

### Check Server Status
```bash
curl http://localhost:8300/log -X POST -H "Content-Type: application/json" -d '{"group":"Test","from":"System","text":"Health check","timestamp":1690552800000}'
```

### View Logs
```bash
# Real-time log monitoring
tail -f logs/$(date +%Y-%m-%d).log

# With custom extension
tail -f logs/$(date +%Y-%m-%d).txt
```

### Service Logs (if using systemd)
```bash
journalctl -u whatsapp-listener -f
```

## 🔍 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   Error: listen EADDRINUSE :::8300
   ```
   Solution: Change port with `PORT=8301 node listener.js`

2. **Permission denied on logs directory**
   ```bash
   mkdir: cannot create directory 'logs': Permission denied
   ```
   Solution: Ensure write permissions in working directory

3. **Invalid extension handling**
   - Extensions automatically get dot prefix if missing
   - Empty string defaults to `.log`

### Debug Mode
Add console logging for debugging:
```javascript
console.log(`Received data:`, req.body);
```

## 🏗 Dependencies

Required npm packages:
- `express`: HTTP server framework
- `body-parser`: JSON request parsing
- `winston`: Logging library
- `winston-daily-rotate-file`: Daily log rotation

## 📝 Example Output

### Console Output
```
Log-Server läuft auf http://localhost:8300/log
Log files will be saved with extension: .txt
Eingegangen: Family Group | John Doe: Hello everyone!
Eingegangen: Work Team | Jane Smith: Meeting at 3 PM
```

### Log File Content (`2025-07-28.txt`)
```
[2025-07-28 14:42:03] Family Group | John Doe: Hello everyone!
[2025-07-28 15:30:15] Work Team | Jane Smith: Meeting at 3 PM
[2025-07-28 16:45:22] Friends | Alice: Anyone up for dinner?
```

## 🔒 Security Considerations

- Server only accepts JSON POST requests
- No authentication implemented (intended for localhost use)
- Log files contain message content - secure appropriately
- Consider firewall rules if exposing beyond localhost

## 🚫 Limitations

- Single endpoint (`/log`) only
- No message filtering or processing
- No real-time message broadcasting
- No database storage (file-based only)
