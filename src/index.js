const express = require("express");
const { v4: uuidV4 } = require("uuid");
const app = express();

app.use(express.json());

const customerList = [];

function verifyIfExists(request, response, next) {
  const { cpf } = request.headers;

  const customer = customerList.find((customer) => customer.cpf == cpf);

  if (!customer) return response.status(400).json({ error: "customer not found" });

  request.customer = customer;
  return next();
}

function getBalance(statement) {
  statement.reduce((acc, operation) => {
    if (operation === 'credit') {
      return acc + operation.amount;
    } else if (operation === 'debit') {
      return acc - operation.amount;
    }
    else return;
  })
}

app.post("/account", (request, response) => {
  const { cpf, name } = request.body;

  const alreadyExists = customerList.some(
    (customer) => customer.cpf === cpf
  )

  if (alreadyExists) return response.status(400).json({ error: "customer already exists" })

  customerList.push({
    cpf,
    name,
    id: uuidV4(),
    statement: []
  });

  return response.status(201).send();
});

app.get("/statement", verifyIfExists, (request, response) => {

  return response.json(request.customer.statement);
});

app.post("/deposit", verifyIfExists, (request, response) => {
  const { description, amount } = request.body;
  const { customer } = request;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit"
  };

  customer.statement.push(statementOperation);

  return response.status(201).send();
});

app.post("/withdraw", verifyIfExists, (request, response) => {
  const { amount } = request.body;
  const { customer } = request;

  const balance = getBalance(customer.statement);

  if (balance < amount) {
    return response.status(400).json({ error: "insufficient funds" })
  }

  const statementOperation = {
    amount,
    created_at: new Date(),
    type: "debit"
  };

  customer.statement.push(statementOperation);

  return response.status(201).send();
})

app.get("/statement/:startDate", verifyIfExists, (request, response) => {
  const { customer } = request;
  const { date } = request.query;

  const dateFormated = new Date(date + "00:00");

  const statement = customer.statement.filter((statement) => statement.created_at.toDateString() === new Date(dateFormated).toDateString());

  return response.json(statement);
});

app.put("/account", verifyIfExists, (request, response) => {
  const { name } = request.body;
  const { customer } = request;

  customer.name = name;

  return response.status(201).send();
});

app.get("/account", verifyIfExists, (request, response) => {
  const { customer } = request;

  return response.status(201).json(customer);
});

app.delete("/account", verifyIfExists, (request, response) => {
  const { customer } = request;

  customerList.splice(customer, 1);

  return response.status(204).send();
});

app.listen(3333);
