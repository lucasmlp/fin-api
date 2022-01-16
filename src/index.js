const express = require("express");
const { v4: uuidV4 } = require("uuid");
const app = express();

app.use(express.json());

const customerList = [];

function verifyIfExists(request, response, next) {
  const { cpf } = request.headers;

  console.log("customerList: ", customerList)
  console.log("cpf: ", cpf)

  const customer = customerList.find((customer) => customer.cpf == cpf);

  if (!customer) return response.status(400).json({ error: "customer not found" });

  request.customer = customer;
  return next();
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
    statement: [],
  });

  return response.status(201).send();
});



app.get("/statement", verifyIfExists, (request, response) => {


  console.log("customer: ", request.customer)

  return response.json(request.customer.statement);
});

app.post("/deposit", verifyIfExists, (request, response) => {
  const { description, amount } = request.body;
  const { customer } = request;

  const statementOperation = {
    description,
    amount,
    created_At: new Date(),
    type: "credit"
  };

  customer.statement.push(statementOperation);

  return response.status(201).send();
});
app.listen(3333);
