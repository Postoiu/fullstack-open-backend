const express = require('express');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3001;

morgan.token('body', (req, res) => JSON.stringify(req.body))

app.use(express.json());
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

let persons = [
    { 
        "id": "1",
        "name": "Arto Hellas", 
        "number": "040-123456"
      },
      { 
        "id": "2",
        "name": "Ada Lovelace", 
        "number": "39-44-5323523"
      },
      { 
        "id": "3",
        "name": "Dan Abramov", 
        "number": "12-43-234345"
      },
      { 
        "id": "4",
        "name": "Mary Poppendieck", 
        "number": "39-23-6423122"
      }
];

const generateId = () => {
    const minVal = Math.max(...persons.map(p => Number(p.id)));
    const maxVal = 1000;

    return String(Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal);
}

app.get('/', (request, response) => {
    response.send('<h1>Phonebook API</h1>');
})

app.get('/info', (request, response) => {
    response.send(
        `<p>Phonebook has info for ${persons.length} people</p>
        <p>${new Date()}</p>`
    )
})

app.get('/api/persons', (request, response) => {
    response.json(persons);
})

app.post('/api/persons', (request, response) => {
    const body = request.body;

    if(!body.name || !body.number) {
        return response.status(400).json({
            error: 'Name or phone number is missing!'
        })
    }

    if(persons.find(p => p.name === body.name)) {
        return response.status(400).json({
            error: 'Name must be unique'
        })
    }

    const newPerson = {id: generateId(), ...body}

    persons = persons.concat(newPerson);

    response.json(newPerson);
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id;
    const person = persons.find(p => p.id === id);

    if(!person) {
        return response.status(404).json();
    }

    response.json(person);
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id;
    const person = persons.find(p => p.id === id);
    console.log(person);

    persons = persons.filter(p => p.id !== id);

    response.status(200).json(person);
})

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
})