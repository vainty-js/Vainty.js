const { Snowflake } = require("../util/Snowflake");
const Constants = require("../util/Constants");
const fs = require("fs").promises;
const path = require("path");

class Database {

  constructor(client) {

    this.client = client;

    this.data_path = null;

    this.cache = new Map();

    this.writeQueue = Promise.resolve();

  }

  async initData(dirPath, dataName) {

    try {

      const directory = path.resolve(__dirname, dirPath);

      await fs.mkdir(directory, { recursive: true });

      this.data_path = directory;

      const filePath = this.getFilePath(dataName);

      try {

        await fs.access(filePath);

      } catch {

        await fs.writeFile(filePath, "{}");

      }

      const raw = await fs.readFile(filePath, "utf8");

      const data = JSON.parse(raw);

      this.cache.set(dataName, data);

      this._debug(`Initialized database file ${dataName}`);

    } catch (error) {

      this._error(`Error initializing database file ${dataName}`, error);

    }

  }

  getFilePath(dataName) {

    if (!this.data_path)
      throw new Error("Database not initialized");

    return path.resolve(this.data_path, `${dataName}.json`);

  }

  clone(data) {

    if (global.structuredClone)
      return structuredClone(data);

    return JSON.parse(JSON.stringify(data));

  }

  async writeFileAtomic(filePath, data) {

    const tempPath = filePath + ".tmp";

    await fs.writeFile(tempPath, JSON.stringify(data, null, 2));

    await fs.rename(tempPath, filePath);

  }

  async getDataFile(dataName) {

    if (!this.data_path)
      throw new Error("Database not initialized");

    if (this.cache.has(dataName))
      return this.clone(this.cache.get(dataName));

    let data;

    try {

      const raw = await fs.readFile(this.getFilePath(dataName), "utf8");

      data = JSON.parse(raw);

    } catch {

      data = {};

      await this.setDataFile(dataName, data);

    }

    this.cache.set(dataName, data);

    return this.clone(data);

  }

  async getAllData(dataName) {

    return this.getDataFile(dataName);

  }

  async setDataFile(dataName, data) {

    if (typeof data !== "object" || data === null)
      throw new Error("Data must be an object");

    this.writeQueue = this.writeQueue.then(async () => {

      const filePath = this.getFilePath(dataName);

      this.cache.set(dataName, this.clone(data));

      await this.writeFileAtomic(filePath, data);

    });

    return this.writeQueue;

  }

  async setData(dataName, key, value) {

    this.writeQueue = this.writeQueue.then(async () => {

      const filePath = this.getFilePath(dataName);

      const current = this.clone(this.cache.get(dataName) || {});

      current[key] = value;

      this.cache.set(dataName, current);

      await this.writeFileAtomic(filePath, current);

    });

    return this.writeQueue;

  }

  async deleteData(dataName, key) {

    this.writeQueue = this.writeQueue.then(async () => {

      const filePath = this.getFilePath(dataName);

      const current = this.clone(this.cache.get(dataName) || {});

      delete current[key];

      this.cache.set(dataName, current);

      await this.writeFileAtomic(filePath, current);

    });

    return this.writeQueue;

  }

  async clearData(dataName) {

    this.writeQueue = this.writeQueue.then(async () => {

      const filePath = this.getFilePath(dataName);

      const empty = {};

      this.cache.set(dataName, empty);

      await this.writeFileAtomic(filePath, empty);

    });

    return this.writeQueue;

  }

  async hasData(dataName, key) {

    const data = await this.getDataFile(dataName);

    return data[key] !== undefined;

  }

  async deleteDataFile(dataName) {

    this.writeQueue = this.writeQueue.then(async () => {

      const filePath = this.getFilePath(dataName);

      await fs.unlink(filePath).catch(() => {});

      this.cache.delete(dataName);

    });

    return this.writeQueue;

  }

  async clearAllData() {

    this.writeQueue = this.writeQueue.then(async () => {

      const keys = Array.from(this.cache.keys());

      for (const key of keys) {

        const filePath = this.getFilePath(key);

        await fs.unlink(filePath).catch(() => {});

      }

      this.cache.clear();

    });

    return this.writeQueue;

  }

  _debug(message) {

    if (this.client?.emit)
      this.client.emit(Constants.Events.DEBUG, message);
    else
      console.info(message);

  }

  _error(message, error) {

    if (this.client?.emit)
      this.client.emit(Constants.Events.ERROR, new Error(`${message}: ${error.message}`));
    else
      console.error(`${message}:`, error);

  }

}

module.exports = Database;
