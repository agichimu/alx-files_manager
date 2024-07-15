import Bull from 'bull';
import dbClient from './utils/db';
import imageThumbnail from 'image-thumbnail';
import fs from 'fs';
import path from 'path';

const fileQueue = new Bull('fileQueue');

fileQueue.process(async (job, done) => {
  const { userId, fileId } = job.data;

  if (!fileId) {
    throw new Error('Missing fileId');
  }

  if (!userId) {
    throw new Error('Missing userId');
  }

  const file = await dbClient.db.collection('files').findOne({ _id: ObjectId(fileId), userId: ObjectId(userId) });

  if (!file) {
    throw new Error('File not found');
  }

  try {
    const sizes = [500, 250, 100];
    const filePath = file.localPath;

    for (const size of sizes) {
      const options = { width: size };
      const thumbnail = await imageThumbnail(filePath, options);
      const thumbPath = `${filePath}_${size}`;
      fs.writeFileSync(thumbPath, thumbnail);
    }

    done();
  } catch (error) {
    done(new Error('Failed to generate thumbnails'));
  }
});

export { fileQueue };
