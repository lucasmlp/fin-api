const express = require("express");
const { v4: uuidV4 } = require("uuid");
const app = express();

app.use(express.json());

const customerList = [];

app.post("/account", (request, response) => {
  const { cpf, name } = request.body;

  const alreadyExists = customerList.some(
    (customer) => customer.cpf === cpf
  )

  if (alreadyExists) return response.status(400).json({error: "customer already exists"})

  customerList.push({
    cpf,
    name,
    id: uuidV4(),
    statement: []
  });

  return response.status(201).send();
});

app.listen(3333);
