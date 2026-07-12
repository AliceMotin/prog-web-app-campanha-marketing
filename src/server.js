var express = require("express");
var app = express();

const { MongoClient } = require("mongodb");

var db;
var clientes;
var client;
var dispositivos;

async function conecta() {
  client = new MongoClient("mongodb://127.0.0.1:27017");
  await client.connect();
  db = await client.db("PESSOAS");
  clientes = await db.collection("clientes");
  dispositivos = await db.collection("dispositivos");
  console.log("conectado no mongoDB");
}

app.use(express.json());

app.post("/cadastro", async function (req, res) {
  const { nome, email, senha } = req.body;

  let registro = {};
  registro.nome = nome;
  registro.email = email;
  registro.senha = senha;

  if (!nome) {
    return res.status(403).send("Acesso negado: Insira um Nome");
  }

  if (!email) {
    return res.status(403).send("Acesso negado: Insira um email");
  }

  if (!senha) {
    return res.status(403).send("Acesso negado: Insira uma senha");
  }

  const cliente = await clientes.findOne({ email: email });

  if (cliente) {
    return res
      .status(403)
      .send("Acesso negado: Esse email já foi cadastrado anteriormente!");
  }

  await clientes.insertOne(registro);
  res
    .status(201)
    .send("O usuário foi criado com sucesso, pode prosseguir para o login");
});

app.post("/login", async function (req, res) {
  let { email, senha } = req.body;
  let registro = {};
  registro.email = email;
  registro.senha = senha;

  const usuario = await clientes.findOne(registro);
  if (usuario) {
    res.status(200).send("O usuário foi achado com sucesso");
  } else {
    res.status(401).send("O usuário não foi achado");
  }
});

conecta();

app.listen(7000, function () {
  console.log("SERVIDOR WEB na porta 7000");
});

module.exports = app;
