# Database Schema

## Tables

### users
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | VARCHAR(255) | Unique email |
| password_hash | VARCHAR(255) | bcrypt hash |
| role | VARCHAR(20) | admin/viewer |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### downloads
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| url | TEXT | YouTube URL |
| title | VARCHAR(500) | Video title |
| format | VARCHAR(10) | mp4/mp3/m4a/webm/mkv |
| quality | VARCHAR(10) | best/1080p/720p/480p/360p |
| status | VARCHAR(20) | pending/processing/completed/failed |
| progress | INTEGER | 0-100 |
| file_size | DOUBLE | Bytes |
| r2_key | TEXT | R2 object key |
| error_message | TEXT | |
| processing_time_ms | INTEGER | |
| ip_address | VARCHAR(45) | |
| user_agent | TEXT | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### jobs
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| download_id | UUID | FK to downloads |
| queue | VARCHAR(50) | Queue name |
| bull_job_id | VARCHAR(255) | BullMQ job ID |
| status | VARCHAR(20) | pending/processing/completed/failed |
| attempts | INTEGER | Retry count |
| max_attempts | INTEGER | Max retries (5) |
| last_error | TEXT | |
| result | TEXT | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### analytics
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| date | DATE | Unique per day |
| total_downloads | INTEGER | |
| successful_downloads | INTEGER | |
| failed_downloads | INTEGER | |
| avg_processing_time_ms | DOUBLE | |
| top_formats | JSONB | |
| top_qualities | JSONB | |

### settings
| Column | Type | Description |
|--------|------|-------------|
| key | VARCHAR(255) | Setting key |
| value | TEXT | Setting value |
| updated_at | TIMESTAMP | |

### worker_logs
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| level | VARCHAR(10) | info/error/warn |
| message | TEXT | |
| meta | JSONB | |
| job_id | VARCHAR(255) | |
| worker_id | VARCHAR(255) | |
| created_at | TIMESTAMP | |

### cookies
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Cookie profile name |
| profile | VARCHAR(100) | Cookie profile key |
| content | TEXT | Netscape format cookies |
| is_active | BOOLEAN | Only one active at a time |
| expires_at | TIMESTAMP | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

## Migrations

```bash
# Generate migration
cd backend && pnpm drizzle-kit generate

# Apply migration
cd backend && pnpm drizzle-kit migrate

# Push schema directly
cd backend && pnpm drizzle-kit push
```
