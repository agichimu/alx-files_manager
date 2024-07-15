import fs from 'fs';
import { promisify } from 'util';
import mime from 'mime-types';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

class FilesController {
  static async postUpload(req, res) {
    const token = req.header('X-Token');
    const userId = await redisClient.get(`auth_${token}`);

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { name, type, parentId = 0, isPublic = false, data } = req.body;
    if (!name) return res.status(400).json({ error: 'Missing name' });
    if (!type || !['folder', 'file', 'image'].includes(type)) return res.status(400).json({ error: 'Missing type' });
    if (type !== 'folder' && !data) return res.status(400).json({ error: 'Missing data' });

    if (parentId !== 0) {
      const parentFile = await dbClient.getFileById(parentId);
      if (!parentFile) return res.status(400).json({ error: 'Parent not found' });
      if (parentFile.type !== 'folder') return res.status(400).json({ error: 'Parent is not a folder' });
    }

    const fileDocument = {
      userId,
      name,
      type,
      isPublic,
      parentId,
    };

    if (type !== 'folder') {
      const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
      await mkdirAsync(folderPath, { recursive: true });
      const localPath = `${folderPath}/${uuidv4()}`;
      await writeFileAsync(localPath, Buffer.from(data, 'base64'));
      fileDocument.localPath = localPath;
    }

    const newFile = await dbClient.createFile(fileDocument);
    return res.status(201).json(newFile);
  }
}

export default FilesController;
