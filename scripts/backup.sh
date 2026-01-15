#!/bin/bash
# ============================================
# FlowAutomator - Database Backup Script
# ============================================
# Run: chmod +x backup.sh && ./backup.sh
# Cron: 0 2 * * * /path/to/backup.sh >> /var/log/flowautomator-backup.log 2>&1

set -e

# Configuration
BACKUP_DIR="/var/backups/flowautomator"
DB_CONTAINER="flowautomator-db"
DB_USER="${DB_USER:-flowautomator}"
DB_NAME="${DB_NAME:-flowautomator}"
RETENTION_DAYS=7

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql.gz"

echo "=========================================="
echo "FlowAutomator Database Backup"
echo "=========================================="
echo "Time: $(date)"
echo "Backup file: $BACKUP_FILE"

# Create backup
echo "Creating backup..."
docker exec $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME | gzip > "$BACKUP_FILE"

# Check backup size
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "Backup size: $BACKUP_SIZE"

# Delete old backups
echo "Cleaning old backups (older than $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# List remaining backups
echo ""
echo "Current backups:"
ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null || echo "No backups found"

echo ""
echo "Backup completed successfully!"
echo "=========================================="

# Optional: Upload to cloud storage
# Uncomment and configure as needed:

# AWS S3
# aws s3 cp "$BACKUP_FILE" s3://your-bucket/flowautomator-backups/

# Google Cloud Storage
# gsutil cp "$BACKUP_FILE" gs://your-bucket/flowautomator-backups/

# Restic (to any storage)
# restic -r /path/to/repo backup "$BACKUP_FILE"
