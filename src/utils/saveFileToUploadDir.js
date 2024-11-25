import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { env } from './env.js';
import { TEMP_UPLOAD_DIR, UPLOADS_DIR } from '../constants/index.js';

export const saveFileToUploadDir = async (file) => {
  await fs.rename(file.path, path.join(UPLOADS_DIR, file.filename));

  return `${env('APP_DOMAIN')}/uploads/${file.filename}`;
};
