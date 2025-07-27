# Backup-Skript für Logverzeichnisse

Dieses Skript sichert `.log`- und `.txt`-Dateien aus einem Quellverzeichnis in ein Zielverzeichnis. Es ist generisch und kann auf beliebige Logverzeichnisse angewendet werden. Das Backup erfolgt differenziell mittels `rsync` und ist für den täglichen automatisierten Einsatz per `cron` vorgesehen.

## Voraussetzungen

- Linux-Betriebssystem
- Bash (Standard-Shell)
- `rsync` installiert
- Benutzer hat Lesezugriff auf das Quellverzeichnis und Schreibzugriff auf das Zielverzeichnis

## Skriptinhalt: `backup-logs.sh`

```bash
#!/bin/bash

# === Konfiguration ===

# Quellverzeichnis (z. B. logs)
SOURCE_DIR="${1:-/path/to/source/logs}"

# Zielverzeichnis für Backups
DEST_DIR="${2:-/path/to/backup}"

# Nur diese Dateitypen sollen gesichert werden
INCLUDE_PATTERN="*.log *.txt"

# Logdatei für dieses Backupskript
LOGFILE="$HOME/backup-logs.log"

# === Startlog ===

echo "[ $(date '+%Y-%m-%d %H:%M:%S') ] Starte Backup von $SOURCE_DIR nach $DEST_DIR" >> "$LOGFILE"

# === rsync-Aufruf mit Filter ===

# Temporäre Dateien und alles andere ausschließen
# Nur explizit erlaubte Dateitypen sichern
rsync -av \
  --include="*/" \
  $(for ext in $INCLUDE_PATTERN; do echo "--include=$ext"; done) \
  --exclude="*" \
  "$SOURCE_DIR"/ "$DEST_DIR"/ >> "$LOGFILE" 2>&1

# === Ergebnisprüfung ===
RC=$?
if [ $RC -eq 0 ]; then
  echo "[ $(date '+%Y-%m-%d %H:%M:%S') ] Backup erfolgreich abgeschlossen" >> "$LOGFILE"
else
  echo "[ $(date '+%Y-%m-%d %H:%M:%S') ] Fehler beim Backup (Exit-Code $RC)" >> "$LOGFILE"
fi
````

## Installation

1. Skript z. B. unter `~/scripts/backup-logs.sh` speichern
2. Ausführbar machen:

```bash
chmod +x ~/scripts/backup-logs.sh
```

3. Testlauf (manuell):

```bash
~/scripts/backup-logs.sh /home/<user>/js_whatsapp_listener/logs /mnt/sata/backup
```

## Einbindung in `cron`

1. Crontab öffnen:

```bash
crontab -e
```

2. Beispiel: Täglich um 03:00 Uhr ausführen:

```cron
0 3 * * * /home/<user>/scripts/backup-logs.sh /home/<user>/js_whatsapp_listener/logs /mnt/sata/backup >> /home/<user>/cron-backup.log 2>&1
```

> Die Umleitung `>> ... 2>&1` stellt sicher, dass die Standard- und Fehlerausgabe mitprotokolliert werden.

## Hinweise

* Es werden nur Dateien mit den Endungen `.log` und `.txt` gesichert.
* Die Struktur der Quellverzeichnisse bleibt im Ziel erhalten.
* Es werden nur neue oder geänderte Dateien übertragen (differenziell).
* Nicht passende Dateien werden ignoriert.
* Der `rsync`-Befehl verwendet `--exclude="*"` und selektiert aktiv nur die gewünschten Dateitypen.  


