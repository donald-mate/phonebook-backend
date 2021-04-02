require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");

app.use(express.static("build"));
app.use(express.json());
app.use(morgan("tiny"));
app.use(cors());

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.get("/info", (request, response) => {
  Person.find({}).then((persons) => {
    response.send(
      `<p>Phonebook has info for ${persons.length} people</p> <p>${Date()}<p>`
    );
  });
});

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({
      error: "name missing",
    });
  } else if (!body.number) {
    return response.status(400).json({
      error: "number missing",
    });
  }

  Person.find({}).then((persons) => {
    const duplicate = persons.find((person) => person.name === body.name);
    if (duplicate !== undefined) {
      return response.status(400).json({
        error: "name must be unique",
      });
    } else {
      const person = new Person({
        name: body.name,
        number: body.number,
      });

      person.save().then((savedPerson) => {
        response.json(savedPerson);
      });
    }
  });
});

app.put("/api/persons/:id"),
  (request, response, next) => {
    const body = request.body;

    const person = {
      name: body.name,
      number: body.number,
    };

    Person.findByIdAndUpdate(request.params.id, person, { new: true })
      .then((updatedPerson) => {
        response.json(updatedPerson);
        console.log(updatedPerson);
      })
      .catch((error) => next(error));
  };

app.delete("/api/persons/:id", (request, response) => {
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }
  next(error);
};
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
