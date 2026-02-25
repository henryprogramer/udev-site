#!/usr/bin/env python3
"""API simples com SQLite para conteúdo do site UDEV.

Rotas:
- GET  /health
- GET  /api/content
- PUT  /api/content
"""

import json
import os
import sqlite3
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "udev_content.db")
SCHEMA_PATH = os.path.join(BASE_DIR, "schema.sql")
HOST = os.environ.get("UDEV_API_HOST", "0.0.0.0")
PORT = int(os.environ.get("UDEV_API_PORT", "8787"))


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with get_conn() as conn:
        with open(SCHEMA_PATH, "r", encoding="utf-8") as file:
            conn.executescript(file.read())


def default_content() -> dict:
    return {
        "meta": {
            "published": False,
            "updatedAt": "",
            "siteName": "",
        },
        "hero": {
            "eyebrow": "",
            "headline": "",
            "subheadline": "",
            "points": [],
        },
        "company": {
            "name": "",
            "summary": "",
            "email": "",
            "instagram": "",
            "whatsapp": "",
            "whatsappUrl": "",
        },
        "support": {
            "email": "",
            "phone": "",
            "hours": "",
        },
        "developer": {
            "name": "",
            "role": "",
            "email": "",
            "phone": "",
        },
        "sales": {
            "line": "",
        },
        "services": [],
        "banners": [],
        "products": [],
    }


def read_content() -> dict:
    with get_conn() as conn:
        row = conn.execute("SELECT content_json FROM site_content WHERE id = 1").fetchone()

        if not row:
            return default_content()

        try:
            return json.loads(row["content_json"])
        except json.JSONDecodeError:
            return default_content()


def write_content(payload: dict) -> None:
    normalized = payload if isinstance(payload, dict) else default_content()

    with get_conn() as conn:
        conn.execute(
            """
            INSERT INTO site_content (id, content_json, updated_at)
            VALUES (1, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              content_json = excluded.content_json,
              updated_at = excluded.updated_at
            """,
            (json.dumps(normalized, ensure_ascii=False), utc_now_iso()),
        )


class Handler(BaseHTTPRequestHandler):
    server_version = "UdevSQLiteAPI/1.0"

    def _set_headers(self, status: int = 200, content_type: str = "application/json; charset=utf-8") -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,PUT,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def _json(self, payload: dict, status: int = 200) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self._set_headers(status)
        self.wfile.write(body)

    def do_OPTIONS(self):
        self._set_headers(204)

    def do_GET(self):
        path = urlparse(self.path).path

        if path == "/health":
            self._json({"ok": True, "service": "udev-sqlite-api"})
            return

        if path == "/api/content":
            self._json(read_content())
            return

        self._json({"error": "not_found"}, 404)

    def do_PUT(self):
        path = urlparse(self.path).path

        if path != "/api/content":
            self._json({"error": "not_found"}, 404)
            return

        content_length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(content_length) if content_length > 0 else b"{}"

        try:
            payload = json.loads(raw.decode("utf-8"))
        except json.JSONDecodeError:
            self._json({"error": "invalid_json"}, 400)
            return

        if not isinstance(payload, dict):
            self._json({"error": "invalid_payload"}, 400)
            return

        write_content(payload)
        self._json({"ok": True, "updatedAt": utc_now_iso()})


def main() -> None:
    init_db()
    server = HTTPServer((HOST, PORT), Handler)
    print(f"[udev-sqlite-api] running at http://{HOST}:{PORT}")
    server.serve_forever()


if __name__ == "__main__":
    main()
