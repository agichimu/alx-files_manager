import { MongoClient, ObjectId } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    this.client = new MongoClient(`mongodb://${host}:${port}`, { useUnifiedTopology: true });
    this.client.connect().then(() => {
      this.db = this.client.db(database);
    }).catch((err) => {
      console.error('Failed to connect to MongoDB', err);
    });
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    return this.db.collection('users').countDocuments();
  }

  async nbFiles() {
    return this.db.collection('files').countDocuments();
  }

  async getUserByEmail(email) {
    return this.db.collection('users').findOne({ email });
  }

  async getFileById(id) {
    return this.db.collection('files').findOne({ _id: ObjectId(id) });
  }

  async createFile(fileDocument) {
    const result = await this.db.collection('files').insertOne(fileDocument);
    return { id: result.insertedId, ...fileDocument };
  }
}

export const dbClient = new DBClient();
export default dbClient;
