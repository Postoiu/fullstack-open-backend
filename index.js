require('dotenv').config();
const express = require('express');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT;

const Person = require('./models/person');

morgan.token('body', (req, res) => JSON.stringify(req.body))

app.use(express.json());
app.use(express.static('dist'));
app.use(
    morgan((tokens, req, res) => {
        const result = [
            tokens.method(req, res),
            tokens.url(req, res),
            tokens.status(req, res),
            tokens.res(req, res, 'content-length'), '-',
            tokens['response-time'](req, res), 'ms'
        ];

        if(req.method === 'POST') {
            result.push(tokens.body(req, res));
        }

        return result.join(' ');
    })
);

app.get('/', (request, response) => {
    response.send('<h1>Phonebook API</h1>');
})

app.get('/info', (request, response) => {
    Person.countDocuments({}).then(count => 
        response.send(
            `<p>Phonebook has info for ${count} people</p>
            <p>${new Date()}</p>`
        )
    )
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons);
    })
})

app.post('/api/persons', (request, response) => {
    const body = request.body;

    if(!body.name || !body.number) {
        return response.status(400).json({
            error: 'Name or phone number is missing!'
        })
    }

    // if(persons.find(p => p.name === body.name)) {
    //     return response.status(400).json({
    //         error: 'Name must be unique'
    //     })
    // }

    const person = new Person({...body});

    person.save().then(savedPerson => {
        response.json(savedPerson);
    })

})

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id)
        .then(person => {
            response.json(person);
        });

    // if(!person) {
    //     return response.status(404).json();
    // }
})

app.delete('/api/persons/:id', (request, response) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(200).json(result);
        })

})

app.put('/api/persons/:id', (request, response) => {
    Person.findByIdAndUpdate(request.params.id, request.body, { new: true })
        .then(result => {
            response.json(result);
        })
})

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
})