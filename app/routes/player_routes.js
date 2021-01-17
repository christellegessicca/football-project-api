// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for players
const Player = require('../models/player')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.player`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /players
router.get('/players', requireToken, (req, res, next) => {
  Player.find({ owner: req.user._id})
    .then(players => players.map(player => player.toObject()))
  .then(players => res.status(200).json({ players: players }))
    .catch(next)
})

// SHOW
// GET /players
router.get('/players/:id', requireToken, (req, res, next) => {
const id = req.params.id
  Player.findOne({owner: req.user._id, _id: id})
    .then(handle404)
    .then(player => res.status(200).json({ player: player.toObject() }))

    .catch(next)
})

// CREATE
// POST /players
router.post('/players', requireToken, (req, res, next) => {

  const playerData = req.body.player

  playerData.owner = req.user._id
// saves the event to Mongoose
  Player.create(playerData)

    .then(player => {
      res.status(201).json({ player: player.toObject() })
    })
    .then(player => console.log(player))

    .catch(next)
})

// UPDATE
// PATCH /players/
router.patch('/players/:id', requireToken, removeBlanks, (req, res, next) => {
// get id of player
const id = req.params.id
// get player data from request
  const playerData = req.body.player

  Player.findOne({_id:id, owner:req.user._id})
  // if event is not found handle 404 error
    .then(handle404)
    .then(player => {
      requireOwnership(req, player)
    return player.updateOne(playerData)
})
    .then(() => res.sendStatus(204))
    .catch(next)
})

// DESTROY
// DELETE /players/
router.delete('/players/:id', requireToken, (req, res, next) => {
  Player.findById({
    _id: req.params.id, owner: req.user._id})
    .then(handle404)
    .then(player =>  requireOwnership(req, player))
    .then(player => {
      player.deleteOne()
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

module.exports = router
