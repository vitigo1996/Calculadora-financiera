import { Capacitor } from '@capacitor/core';

/** Convierte un Blob a base64 (sin el prefijo data:...;base64,). */
async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < buffer.length; i += chunk) {
    binary += String.fromCharCode(...buffer.subarray(i, i + chunk));
  }
  return btoa(binary);
}

/**
 * Entrega un archivo al usuario:
 * - Android (Capacitor): lo escribe en la caché de la app y abre el menú "Compartir"
 *   (guardar en Drive, Archivos, WhatsApp, correo, etc.). El WebView no procesa descargas de Blob.
 * - Navegador: descarga directa mediante un enlace temporal.
 */
export async function saveFile(blob: Blob, fileName: string, dialogTitle: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    // Carga diferida: estos plugins solo se usan en Android
    const [{ Filesystem, Directory }, { Share }] = await Promise.all([
      import('@capacitor/filesystem'),
      import('@capacitor/share')
    ]);
    const written = await Filesystem.writeFile({
      path: fileName,
      data: await blobToBase64(blob),
      directory: Directory.Cache
    });
    await Share.share({ title: fileName, url: written.uri, dialogTitle });
    return;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revocar después de que el navegador inicie la descarga
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
