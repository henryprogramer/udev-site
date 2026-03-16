#!/usr/bin/env python3
"""Entry-point do Django."""

import os
import sys
from pathlib import Path

from dotenv import load_dotenv


def main() -> None:
    root_dir = Path(__file__).resolve().parents[1]
    load_dotenv(root_dir / ".env")

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError("Django nao instalado no ambiente virtual.") from exc

    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
