import path from 'path';
import url from 'url';

export function currDir(fileUrl: string) {
    const __filename = url.fileURLToPath(fileUrl);
    return path.dirname(__filename);
}