// models/Repository.js
const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema({
  userGit: {
    type: String,
    required: true,
  },
  nameArchive: {
    type: String,
    required: true,
  },
  port: {
    type: Number,
  },
  idMail: {
    type: String
  },
  command: {
    type: String
  }
});

module.exports = mongoose.model('Repository', repositorySchema);
