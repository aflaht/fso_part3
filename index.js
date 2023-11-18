require('dotenv').config()
const express = require('express')
const tz = require('timezone-support')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')


const morgan_custom_format = (tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    JSON.stringify(req.body)
  ].join(' ')
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(cors())
app.use(express.json())
app.use(morgan(morgan_custom_format))
app.use(express.static('dist'))

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.get('/info', (request,response) => {
  Person.find({}).then(persons => {
    const totalPerson = persons.length

    //formatting time
    const currentDate = new Date()
    const serverTimeZoneOffset = currentDate.getTimezoneOffset()
    const offsetHours = Math.abs(serverTimeZoneOffset) / 60
    const offsetSign = serverTimeZoneOffset < 0 ? '+' : '-'
    const offsetString = `GMT ${offsetSign}${offsetHours.toString().padStart(3, '0')}`
    const options = {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    }
    const timezoneName = tz.findTimeZone(options.timeZone).name
    const formattedDateTime = currentDate.toLocaleString('en-GB', options)

    response.send(`<p>Phonebook has info for ${totalPerson} people<br/>${formattedDateTime} ${offsetString} ${timezoneName}</p>`)
  })
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  }).catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(
    request.params.id,
    person,
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})