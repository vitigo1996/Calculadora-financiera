#!/usr/bin/env bash
set -euo pipefail

# Carpeta "aplicación finanzas" en Google Drive
DRIVE_FOLDER_ID="1xAjyqkuep0l-6wTRC-aAKN5tb4KNlB88"
APK_FILE_ID="10tCI43CehajQBIKRgN9rZhw1PQZSox8w"
AAB_FILE_ID="14obXTO1fO2eHGvG2ZQXX_264shHkh5-v"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# Binarios generados por Gradle (ya no se versionan en git). Se pueden sobrescribir por variable de entorno.
APK_PATH="${APK_PATH:-${REPO_ROOT}/android/app/build/outputs/apk/release/app-release.apk}"
AAB_PATH="${AAB_PATH:-${REPO_ROOT}/android/app/build/outputs/bundle/release/app-release.aab}"

if [[ ! -f "${APK_PATH}" ]]; then
  echo "Error: No se encontró ${APK_PATH}" >&2
  exit 1
fi

if [[ ! -f "${AAB_PATH}" ]]; then
  echo "Error: No se encontró ${AAB_PATH}" >&2
  exit 1
fi

echo "Subiendo $(basename "${APK_PATH}") a la carpeta 'aplicación finanzas' (${DRIVE_FOLDER_ID})..."
if ! gdrive mutate update "${APK_FILE_ID}" "${APK_PATH}" --mime-type "application/vnd.android.package-archive"; then
  gdrive mutate upload "${APK_PATH}" --parent "${DRIVE_FOLDER_ID}" --mime-type "application/vnd.android.package-archive"
fi

echo "Subiendo $(basename "${AAB_PATH}") a la carpeta 'aplicación finanzas' (${DRIVE_FOLDER_ID})..."
if ! gdrive mutate update "${AAB_FILE_ID}" "${AAB_PATH}" --mime-type "application/x-zip"; then
  gdrive mutate upload "${AAB_PATH}" --parent "${DRIVE_FOLDER_ID}" --mime-type "application/x-zip"
fi

echo "Archivos actualizados exitosamente en la carpeta 'aplicación finanzas':"
gdrive readonly ls "${DRIVE_FOLDER_ID}"
