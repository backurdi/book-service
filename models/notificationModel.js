const mongoose = require('mongoose');

const nofificationSchema = new mongoose.Schema({
  read: { type: Boolean, default: false },
  type: { type: String, enum: ['post', 'comment'] },
  post: {
    type: mongoose.Schema.ObjectId,
    ref: 'Posts',
  },
  club: {
    type: mongoose.Schema.ObjectId,
    ref: 'Clubs',
  },
  createdBy: {
    type: {
      _id: { type: mongoose.Schema.ObjectId, ref: 'Users' },
      name: String,
      photo: String,
    },
  },
  receiver: {
    type: {
      _id: { type: mongoose.Schema.ObjectId, ref: 'Users' },
      name: String,
      photo: String,
    },
  },
  createdAt: {
    required: true,
    type: Date,
    set: Date.now,
    default: Date.now,
  },
});

const Notifications = mongoose.model('Notifications', nofificationSchema);

module.exports = Notifications;
