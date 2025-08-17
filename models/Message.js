const mongoose = require("mongoose");

const mongooseSchema = new mongoose.Schema({
  username: String, // who sent the message
  message: String, // message text
  time: { type: Date, default: Date.now }, // timestamp
});

module.exports = mongoose.model('Message', mongooseSchema);
