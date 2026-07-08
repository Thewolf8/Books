import RNFS from 'react-native-fs';

const APP_DIR = RNFS.DocumentDirectoryPath;
const COVERS_DIR = `${APP_DIR}/covers`;
const PDFS_DIR = `${APP_DIR}/pdfs`;

/**
 * Initialize app directories
 */
export const initDirectories = async (): Promise<void> => {
  const dirs = [COVERS_DIR, PDFS_DIR];
  for (const dir of dirs) {
    const exists = await RNFS.exists(dir);
    if (!exists) {
      await RNFS.mkdir(dir);
    }
  }
};

/**
 * Copy a file to app storage
 */
export const copyToAppStorage = async (
  sourceUri: string,
  destDir: 'covers' | 'pdfs',
  fileName?: string,
): Promise<string> => {
  const dir = destDir === 'covers' ? COVERS_DIR : PDFS_DIR;
  await RNFS.mkdir(dir);

  const name = fileName || `file_${Date.now()}`;
  const destPath = `${dir}/${name}`;

  await RNFS.copyFile(sourceUri, destPath);
  return destPath;
};

/**
 * Delete a file from app storage
 */
export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    const exists = await RNFS.exists(filePath);
    if (exists) {
      await RNFS.unlink(filePath);
    }
  } catch (err) {
    console.error('Failed to delete file:', err);
  }
};

/**
 * Get file size in human readable format
 */
export const getFileSize = async (filePath: string): Promise<string> => {
  try {
    const info = await RNFS.stat(filePath);
    const bytes = info.size;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  } catch {
    return 'Unknown';
  }
};

/**
 * Check if a file exists
 */
export const fileExists = async (filePath: string): Promise<boolean> => {
  return RNFS.exists(filePath);
};
