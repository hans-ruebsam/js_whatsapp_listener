#!/bin/bash

# Quellverzeichnis (z. B. logs)
SOURCE_DIR="${1:-/path/to/source/logs}"
# Zielverzeichnis für Backups
DEST_DIR="${2:-/path/to/backup}"

# Nur diese Dateitypen sollen gesichert werden
INCLUDE_PATTERN="*.log *.txt"

# Logdatei für dieses Backupskript
LOGFILE="$HOME/backup-script/logs/backup-logs.log"

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
