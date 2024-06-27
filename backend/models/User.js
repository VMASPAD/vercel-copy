// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  pass: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    unique: true
  }
});

module.exports = mongoose.model('User', userSchema);
