import { runInBrowser } from './utils/browser';

export default function downloadBlob(blob: Blob, filename: string) {
  runInBrowser(() => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.click();

    link.remove();
    URL.revokeObjectURL(url);
  });
}
