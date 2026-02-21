# Analytics Module Documentation

The Analytics module tracks user visits and page engagement (duration) using SQLite for storage.

## Architecture

- **Controller**: `MetricsController` - Exposes REST endpoints for client-side tracking.
- **Service**: `MetricsService` - Handles data persistence, duplicate detection, and statistics calculation.
- **Entity**: `MetricEntity` - TypeORM entity defining the `metrics` table in SQLite.
- **Database**: SQLite (file-based) for high performance and zero-config in the target environment.

## API Endpoints

### 1. Log Page View
`POST /metrics/page-view`

Registers a new page visit. Includes basic GeoIP and browser/OS/device information.
- **Duplicate Protection**: Ignores requests for the exact same URL + SessionID within a 5-second window.

### 2. Log Duration
`POST /metrics/duration`

Updates the time spent on a page. Usually called via `navigator.sendBeacon` when a user leaves a page.
- **Logic**: Updates the `durationSeconds` field of the *latest* visit record for that session/URL.

### 3. Summary Stats
`GET /metrics/stats/summary`

Returns overall metrics for a given period (default: last 30 days).
- **Output**: Total views, Unique visitors (count), Average duration per page.

### 4. Popular Pages
`GET /metrics/stats/pages`

Returns a list of top 10 most visited URLs with their visit counts and average engagement time.

## Storage & Persistence

### SQLite
Data is stored in an SQLite file. The path is configurable via environment variables:
- **Variable**: `SQLITE_DB_PATH`
- **Container Default**: `/app/data/analytics.sqlite`
- **Local Default**: `data/analytics.sqlite`

### Docker Persistence (CI/CD)
The database is persisted across deployments using **Docker Volumes**.
- **Volume Mount**: `./data` (host) maps to `/app/data` (container).
- Ensure the `data` directory exists and is writable by the container user.

## Implementation Details

- **GeoIP**: Uses `geoip-lite` for country/city/timezone lookup.
- **User-Agent**: Uses `ua-parser-js` for browser/OS/device classification.
- **Aggregations**: Optimized SQL queries via TypeORM Query Builder for statistics.
