import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def translate_path(self, path):
        # 干净 URL 回退：无扩展名且文件不存在时尝试加 .html / .htm
        p = super().translate_path(path)
        if os.path.isdir(p):
            return p
        if os.path.exists(p):
            return p
        if "." not in os.path.basename(p):
            for ext in (".html", ".htm"):
                cand = p + ext
                if os.path.exists(cand):
                    return cand
        return p

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, *a):
        pass

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8099"))
    srv = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    print(f"serving {ROOT} on http://127.0.0.1:{port}")
    srv.serve_forever()
