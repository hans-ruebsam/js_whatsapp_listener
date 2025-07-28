const express = require("express");
const bodyParser = require("body-parser");
const winston = require("winston");
require("winston-daily-rotate-file");
const fs = require("fs");
const path = require("path");

// Get log file extension from command line argument or default to .log
const logExtension = process.argv[2] || ".log";
// Ensure extension starts with a dot
const fileExtension = logExtension.startsWith('.') ? logExtension : '.' + logExtension;

const app = express();
app.use(bodyParser.json());

const logDir = "logs";
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const transport = new winston.transports.DailyRotateFile({
    filename: path.join(logDir, `%DATE%${fileExtension}`),
    datePattern: "YYYY-MM-DD",
    zippedArchive: false,
    maxSize: "5m",
    maxFiles: "14d"
});

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf(info => `[${info.timestamp}] ${info.message}`)
    ),
    transports: [transport]
});

app.post("/log", (req, res) => {
    const data = req.body;
    const msg = `${data.group} | ${data.from}: ${data.text}`;
    logger.info(msg);
    console.log("Eingegangen:", msg);
    res.send("OK");
});

const PORT = process.env.PORT || 8300;
app.listen(PORT, () => {
    console.log(`Log-Server läuft auf http://localhost:${PORT}/log`);
    console.log(`Log files will be saved with extension: ${fileExtension}`);
});
