const { users, files, redisUtils, dbUtils } = require('../utils/redis');

const AppController = {
  getStatus: (req, res) => {
    const redisStatus = redisUtils.checkRedisStatus();
    const dbStatus = dbUtils.checkDBStatus();

    if (redisStatus && dbStatus) {
      res.status(200).json({ redis: true, db: true });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  getStats: (req, res) => {
    const userCount = users.count();
    const fileCount = files.count();

    res.status(200).json({ users: userCount, files: fileCount });
  }
};

module.exports = AppController;