const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const input_name = process.argv[3]
const input_number = process.argv[4]

const url =
  `mongodb+srv://aflaht:${password}@fsocluster0.resupuh.mongodb.net/personApp?retryWrites=true&w=majority`

mongoose.set('strictQuery',false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

const person = new Person({
  name: input_name,
  number: input_number,
})

person.save().then(result => {
  console.log(`added ${result.name} number ${result.number} to phonebook`)
  console.log('phonebook:')
  Person
    .find({})
    .then(persons => {
      persons.map(p => console.log(`${p.name} ${p.number}`))
      mongoose.connection.close()
    })
})