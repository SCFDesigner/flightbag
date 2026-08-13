#!/usr/bin/env python3
"""serve.py — serves the CFI Condenser folder as static files AND exposes
POST /tts for neural text-to-speech via Microsoft Edge's Read-Aloud voices
(edge-tts) — the same "Andrew" voice as the FOI study tool.

Run with the BookScraper venv python (it has edge-tts installed):

    /Users/collinfagan/Desktop/BookScraper/venv/bin/python serve.py

Or double-click "Start CFI Condenser.command".

POST /tts
  Body (JSON): {"text": "...", "voice": "en-US-AndrewMultilingualNeural"}
  Response: audio/mpeg bytes, 400 on bad input, 502 on synth failure.

CORS is wide open so index.html also works opened as a file:// URL.
"""
import asyncio
import json
import sys
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

try:
    import edge_tts
except ImportError:
    edge_tts = None
    print("[warn] edge-tts not importable with this python — /tts will return 502.\n"
          "       Run with: /Users/collinfagan/Desktop/BookScraper/venv/bin/python serve.py",
          file=sys.stderr)

HERE = Path(__file__).resolve().parent
HOST, PORT = "0.0.0.0", 5602
DEFAULT_VOICE = "en-US-AndrewNeural"
MAX_TEXT_CHARS = 6000


async def synthesize(text: str, voice: str) -> bytes:
    communicate = edge_tts.Communicate(text, voice)
    buf = bytearray()
    async for chunk in communicate.stream():
        if chunk.get("type") == "audio" and chunk.get("data"):
            buf.extend(chunk["data"])
    return bytes(buf)


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(HERE), **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        # Local study tool: always serve fresh files so edits to index.html /
        # custom.js show up on a plain reload instead of a stale cached copy.
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        if self.path.startswith("/tts"):
            self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        if self.path.rstrip("/") != "/tts":
            self.send_error(404, "Not found")
            return
        self._handle_tts()

    def _send_json_error(self, code, message):
        body = json.dumps({"error": message}).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _handle_tts(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
        except ValueError:
            length = 0
        raw = self.rfile.read(length) if length > 0 else b""
        try:
            payload = json.loads(raw.decode("utf-8")) if raw else {}
        except (json.JSONDecodeError, UnicodeDecodeError):
            self._send_json_error(400, "Invalid JSON body")
            return

        text = (payload.get("text") or "").strip()
        voice = (payload.get("voice") or DEFAULT_VOICE).strip() or DEFAULT_VOICE
        if not text:
            self._send_json_error(400, '"text" is required')
            return
        if len(text) > MAX_TEXT_CHARS:
            self._send_json_error(400, f'"text" exceeds {MAX_TEXT_CHARS} chars')
            return
        if edge_tts is None:
            self._send_json_error(502, "edge-tts not installed for this python")
            return
        try:
            audio = asyncio.run(synthesize(text, voice))
        except Exception as e:  # noqa: BLE001
            print(f"[tts] synthesis failed: {e}", file=sys.stderr)
            self._send_json_error(502, f"TTS synthesis failed: {e}")
            return
        if not audio:
            self._send_json_error(502, "TTS synthesis produced no audio")
            return
        self.send_response(200)
        self.send_header("Content-Type", "audio/mpeg")
        self.send_header("Content-Length", str(len(audio)))
        self.end_headers()
        self.wfile.write(audio)

    def log_message(self, fmt, *args):
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))


if __name__ == "__main__":
    print(f"CFI Condenser at http://localhost:{PORT}  (neural /tts {'ready' if edge_tts else 'UNAVAILABLE'})")
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
