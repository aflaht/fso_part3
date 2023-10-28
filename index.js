const express = require('express')
const tz = require('timezone-support');

const app = express()
app.use(express.json())

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)
  response.json(person)
})

app.get('/info', (request,response) => {
  const totalPerson = persons.length

  //formatting time
  const currentDate = new Date();
  console.log(currentDate.toUTCString())
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
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const person = request.body
  if(person.number === '' || person.name === ''){
    return response.status(400).json({ 
      error: 'name or number is missing' 
    })
  }
  const existed = persons.filter(p => p.name.toLowerCase() === person.name.toLowerCase())
  if(existed.length > 0){
    return response.status(409).json({ 
      error: 'name is already exist' 
    })
  }
  person.id =  Math.floor(Math.random() * 1000)
  persons.push(person)
  response.json(person)
})


const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})