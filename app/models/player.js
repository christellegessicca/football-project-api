const mongoose = require('mongoose')

const playerSchema = new mongoose.Schema({
  playerName: {
    type: String,
    required: true
  },
  team: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Player', playerSchema)
