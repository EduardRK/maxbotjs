{
  "dashboard": {
    "id": null,
    "title": "Todo App Monitoring",
    "tags": [ "todo", "postgres" ],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "Database Connections",
        "type": "stat",
        "targets": [
          {
            "expr": "pg_stat_database_numbackends{datname=\"maxbot\"}",
            "legendFormat": "Active Connections"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "color": {
              "mode": "palette-classic"
            },
            "thresholds": {
              "steps": [
                {
                  "color": "green",
                  "value": null
                },
                {
                  "color": "red",
                  "value": 10
                }
              ]
            }
          }
        }
      },
      {
        "id": 2,
        "title": "Tasks Statistics",
        "type": "bargauge",
        "targets": [
          {
            "expr": "count(pg_stat_user_tables)",
            "legendFormat": "Total Tables"
          }
        ]
      }
    ],
    "time": {
      "from": "now-6h",
      "to": "now"
    }
  }
}