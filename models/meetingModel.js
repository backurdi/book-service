const Mongoose = require('mongoose');

const meetingSchema = new Mongoose.Schema({
  mail: String,
});

const Meetings = Mongoose.model('Meetings', meetingSchema);

module.exports = Meetings;
