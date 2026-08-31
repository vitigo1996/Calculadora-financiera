import http.server
import socketserver
import webbrowser
import os
import sys
import threading
import time
import socket

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def find_available_port(start_port=3000):
    port = start_port
    while port < start_port + 50:
        if not is_port_in_use(port):
            return port
        port += 1
    return start_port

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dist_dir = os.path.join(base_dir, 'dist')

    if not os.path.exists(dist_dir):
        print("Carpeta 'dist' no encontrada. Compilando aplicacion...")
        os.system('npm.cmd run build')

    os.chdir(dist_dir)
    port = find_available_port(3000)
    url = f"http://localhost:{port}"

    class CustomHandler(http.server.SimpleHTTPRequestHandler):
        def log_message(self, format, *args):
            pass  # Keep console clean

    print("=" * 60)
    print("      APP DE FINANZAS PERSONALES Y HOGAR")
    print("=" * 60)
    print(f"\n-> Servidor iniciado correctamente en: {url}")
    print("-> Abriendo tu navegador web predeterminado...")
    print("\nPuedes dejar esta ventana abierta mientras usas la app.")
    print("Para cerrarla, simplemente presiona Ctrl + C o cierra esta ventana.\n")
    print("=" * 60)

    # Open browser after a brief delay to ensure server is accepting connections
    def open_browser():
        time.sleep(0.6)
        webbrowser.open(url)

    threading.Thread(target=open_browser, daemon=True).start()

    with socketserver.TCPServer(("", port), CustomHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor detenido. ¡Hasta pronto!")

if __name__ == '__main__':
    main()
