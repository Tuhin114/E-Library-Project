/**
 * Triggers a browser "save file" for an in-memory Blob. Same
 * createObjectURL → temp <a> → click → revokeObjectURL sequence
 * `components/reader/DownloadButton.jsx` already does inline for book
 * file downloads — extracted here since Phase 5 M5's CSV export needed
 * the identical logic a second time.
 */
export const downloadBlob = (blob, filename) => {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
};
