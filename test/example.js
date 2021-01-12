process.env.TESTENV = true

let user = require('../app/models/user.js')
let User = require('../app/models/user')

const crypto = require('crypto')

let chai = require('chai')
let chaiHttp = require('chai-http')
let server = require('../server')
chai.should()

chai.use(chaiHttp)

const token = crypto.randomBytes(16).toString('hex')
let userId
let userId

describe('users', () => {
  const userParams = {
    title: '13 JavaScript tricks SEI instructors don\'t want you to know',
    text: 'You won\'believe number 8!'
  }

  before(done => {
    user.deleteMany({})
      .then(() => User.create({
        email: 'caleb',
        hashedPassword: '12345',
        token
      }))
      .then(user => {
        userId = user._id
        return user
      })
      .then(() => user.create(Object.assign(userParams, {owner: userId})))
      .then(record => {
        userId = record._id
        done()
      })
      .catch(console.error)
  })

  describe('GET /users', () => {
    it('should get all the users', done => {
      chai.request(server)
        .get('/users')
        .set('Authorization', `Token token=${token}`)
        .end((e, res) => {
          res.should.have.status(200)
          res.body.users.should.be.a('array')
          res.body.users.length.should.be.eql(1)
          done()
        })
    })
  })

  describe('GET /users/:id', () => {
    it('should get one user', done => {
      chai.request(server)
        .get('/users/' + userId)
        .set('Authorization', `Token token=${token}`)
        .end((e, res) => {
          res.should.have.status(200)
          res.body.user.should.be.a('object')
          res.body.user.title.should.eql(userParams.title)
          done()
        })
    })
  })

  describe('DELETE /users/:id', () => {
    let userId

    before(done => {
      user.create(Object.assign(userParams, { owner: userId }))
        .then(record => {
          userId = record._id
          done()
        })
        .catch(console.error)
    })

    it('must be owned by the user', done => {
      chai.request(server)
        .delete('/users/' + userId)
        .set('Authorization', `Bearer notarealtoken`)
        .end((e, res) => {
          res.should.have.status(401)
          done()
        })
    })

    it('should be succesful if you own the resource', done => {
      chai.request(server)
        .delete('/users/' + userId)
        .set('Authorization', `Bearer ${token}`)
        .end((e, res) => {
          res.should.have.status(204)
          done()
        })
    })

    it('should return 404 if the resource doesn\'t exist', done => {
      chai.request(server)
        .delete('/users/' + userId)
        .set('Authorization', `Bearer ${token}`)
        .end((e, res) => {
          res.should.have.status(404)
          done()
        })
    })
  })

  describe('POST /users', () => {
    it('should not POST an user without a title', done => {
      let noTitle = {
        text: 'Untitled',
        owner: 'fakedID'
      }
      chai.request(server)
        .post('/users')
        .set('Authorization', `Bearer ${token}`)
        .send({ user: noTitle })
        .end((e, res) => {
          res.should.have.status(422)
          res.should.be.a('object')
          done()
        })
    })

    it('should not POST an user without text', done => {
      let noText = {
        title: 'Not a very good user, is it?',
        owner: 'fakeID'
      }
      chai.request(server)
        .post('/users')
        .set('Authorization', `Bearer ${token}`)
        .send({ user: noText })
        .end((e, res) => {
          res.should.have.status(422)
          res.should.be.a('object')
          done()
        })
    })

    it('should not allow a POST from an unauthenticated user', done => {
      chai.request(server)
        .post('/users')
        .send({ user: userParams })
        .end((e, res) => {
          res.should.have.status(401)
          done()
        })
    })

    it('should POST an user with the correct params', done => {
      let validuser = {
        title: 'I ran a shell command. You won\'t believe what happened next!',
        text: 'it was rm -rf / --no-preserve-root'
      }
      chai.request(server)
        .post('/users')
        .set('Authorization', `Bearer ${token}`)
        .send({ user: validuser })
        .end((e, res) => {
          res.should.have.status(201)
          res.body.should.be.a('object')
          res.body.should.have.property('user')
          res.body.user.should.have.property('title')
          res.body.user.title.should.eql(validuser.title)
          done()
        })
    })
  })

  describe('PATCH /users/:id', () => {
    let userId

    const fields = {
      title: 'Find out which HTTP status code is your spirit animal',
      text: 'Take this 4 question quiz to find out!'
    }

    before(async function () {
      const record = await user.create(Object.assign(userParams, { owner: userId }))
      userId = record._id
    })

    it('must be owned by the user', done => {
      chai.request(server)
        .patch('/users/' + userId)
        .set('Authorization', `Bearer notarealtoken`)
        .send({ user: fields })
        .end((e, res) => {
          res.should.have.status(401)
          done()
        })
    })

    it('should update fields when PATCHed', done => {
      chai.request(server)
        .patch(`/users/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ user: fields })
        .end((e, res) => {
          res.should.have.status(204)
          done()
        })
    })

    it('shows the updated resource when fetched with GET', done => {
      chai.request(server)
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .end((e, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.user.title.should.eql(fields.title)
          res.body.user.text.should.eql(fields.text)
          done()
        })
    })

    it('doesn\'t overwrite fields with empty strings', done => {
      chai.request(server)
        .patch(`/users/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ user: { text: '' } })
        .then(() => {
          chai.request(server)
            .get(`/users/${userId}`)
            .set('Authorization', `Bearer ${token}`)
            .end((e, res) => {
              res.should.have.status(200)
              res.body.should.be.a('object')
              // console.log(res.body.user.text)
              res.body.user.title.should.eql(fields.title)
              res.body.user.text.should.eql(fields.text)
              done()
            })
        })
    })
  })
})
