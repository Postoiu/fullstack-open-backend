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

const errorHandler = (error, request, response, next) => {
    console.error(error.message);

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' });
    } else if (error.name === 'ValidationError') {
        return response.status(400).json(error);
    }

    next(error);
}

app.get('/', (request, response) => {
    response.send('<h1>Phonebook API</h1>');
})

app.get('/info', (request, response, next) => {
    Person.countDocuments({})
        .then(count => 
            response.send(
                `<p>Phonebook has info for ${count} people</p>
                <p>${new Date()}</p>`
            )
        )
        .catch(error => next(error));
})

app.get('/api/persons', (request, response, next) => {
    Person.find({})
        .then(persons => {
            response.json(persons);
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body;

    if(!body.name || !body.number) {
        return response.status(400).json({
            error: 'Name or phone number is missing!'
        })
    }

    const person = new Person({...body});

    person.save()
        .then(savedPerson => {
            response.json(savedPerson);
        })
        .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if(person) {
                response.json(person);
            } else {
                response.status(404).end();
            }
        })
        .catch(error => next(error));
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(200).json(result);
        })
        .catch(error => next(error))

})

app.put('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndUpdate(request.params.id, request.body, { new: true })
        .then(result => {
            response.json(result);
        })
        .catch(error => next(error))
})

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
})