import Sequelize from 'sequelize';
import mongoose from 'mongoose';
import dataBaseConfig from '../config/database';
import User from '../app/models/User';
import File from '../app/models/File';
import Appointment from '../app/models/Appointment';

const models = [User, File, Appointment];

class DataBase {
  constructor() {
    this.init();
    this.mongo();
  }

  init() {
    this.connections = new Sequelize(dataBaseConfig);
    models
      .map((model) => model.init(this.connections))
      .map(
        (model) => model.associate && model.associate(this.connections.models)
      );
  }

  mongo() {
    this.mongoConnection = mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useFindAndModify: true,
      useUnifiedTopology: true,
    });
  }
}

export default new DataBase();
