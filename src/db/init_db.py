"""Initialize the SQLite database and create tables."""

import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "greenhouse.db"
SCHEMA_PATH = Path(__file__).parent / "schema.sql"


def init_db(db_path: Path = DB_PATH) -> None:
    schema = SCHEMA_PATH.read_text()
    with sqlite3.connect(db_path) as conn:
        conn.executescript(schema)
        conn.commit()
    print(f"Database initialized at {db_path}")


if __name__ == "__main__":
    init_db()
