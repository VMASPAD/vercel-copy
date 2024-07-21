// models/Repository.js
const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema({
  usergit: {
    type: String,
    required: true,
  },
  namearchive: {
    type: String,
    required: true,
  },
  port: {
    type: Number,
  },
  email: {
    type: String
  },
  idmail: {
    type: String
  },
  command: {
    type: String
  }
});

module.exports = mongoose.model('Repository', repositorySchema);
