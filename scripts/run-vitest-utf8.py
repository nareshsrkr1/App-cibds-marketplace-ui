"""Run vitest and emit ASCII-only output for Windows cp1252 MCP shells."""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NODE = Path(r"C:\Program Files\nodejs\node.exe")
VITEST = ROOT / "node_modules" / "vitest" / "vitest.mjs"

DEFAULT_TESTS = [
    "src/components/feedback/Spinner/Spinner.test.tsx",
    "src/features/landing/LandingPage.test.tsx",
    "src/features/workspace/WorkspacePage.test.tsx",
    "src/app/App.test.tsx",
]


def ascii_safe(text: str) -> str:
    return text.encode("ascii", "replace").decode("ascii")


def main() -> int:
    tests = sys.argv[1:] or DEFAULT_TESTS
    if not NODE.exists():
        sys.stderr.write("ERROR: node.exe not found at Program Files\\nodejs\\node.exe\n")
        return 127
    if not VITEST.exists():
        sys.stderr.write("ERROR: vitest.mjs missing — run npm install\n")
        return 127

    proc = subprocess.run(
        [str(NODE), str(VITEST), "run", *tests],
        cwd=ROOT,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    # MCP captures via cp1252 on Windows — never emit non-ASCII.
    sys.stdout.write(ascii_safe(proc.stdout or ""))
    sys.stderr.write(ascii_safe(proc.stderr or ""))
    return int(proc.returncode)


if __name__ == "__main__":
    raise SystemExit(main())
