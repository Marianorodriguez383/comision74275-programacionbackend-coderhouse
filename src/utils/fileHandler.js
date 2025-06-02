import fs from 'fs/promises';

export async function readJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error leyendo archivo JSON:', error);
    return null; // o []
  }
}

export async function writeJSON(filePath, content) {
  try {
    await fs.writeFile(filePath, JSON.stringify(content, null, 2));
  } catch (error) {
    console.error('Error escribiendo archivo JSON:', error);
  }
}
