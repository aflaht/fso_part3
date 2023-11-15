require('dotenv').config()
const express = require('express')
const tz = require('timezone-support');
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

app.use(cors())
app.use(express.json())
app.use(morgan(morgan_custom_format))
app.use(express.static('dist'))

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
    response.json(person)
  })
})

app.get('/info', (request,response) => {
  const totalPerson = persons.length

  //formatting time
  const currentDate = new Date();
  const serverTimeZoneOffset = currentDate.getTimezoneOffset();
  const offsetHours = Math.abs(serverTimeZoneOffset) / 60;
  const offsetSign = serverTimeZoneOffset < 0 ? '+' : '-';
  const offsetString = `GMT ${offsetSign}${offsetHours.toString().padStart(3, '0')}`;
  const options = {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric', 
    minute: 'numeric',
    second: 'numeric',
  };
  const timezoneName = tz.findTimeZone(options.timeZone).name;
  const formattedDateTime = currentDate.toLocaleString('en-GB', options);
  
  response.send(`<p>Phonebook has info for ${totalPerson} people<br/>${formattedDateTime} ${offsetString} ${timezoneName}</p>`)
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)

  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const body = request.body
  if(body.number === undefined || body.name === undefined){
    return response.status(400).json({ 
      error: 'name or number is missing' 
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})