var express = require("express");
var app = express();

const { MongoClient } = require("mongodb");

var db;
var clientes;
var client;
var qrCodes;

async function conecta() {
  client = new MongoClient("mongodb://127.0.0.1:27017");
  await client.connect();
  db = await client.db("PESSOAS");
  clientes = await db.collection("clientes");
  qrCodes = await db.collection("qrCodes");
  console.log("conectado no mongoDB");
}

app.use(express.json());

const path = require("path");

app.use(express.static(path.join(__dirname, "..", "public")));

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

app.post("/qrcodes", async function (req, res) {
  let { email, codigo } = req.body;

  const cliente = await clientes.findOne({ email: email });

  if (!cliente) {
    return res
      .status(403)
      .send(
        "Acesso negado: Não é possível add um qr code de um email inválido!"
      );
  }

  //   let novoQrCode = {};
  //   novoQrCode.email = email;
  //   novoQrCode.codigo = codigo;

  //   await qrCodes.insertOne(novoQrCode);

  //   //Atualizar
  //   await db
  //     .collection("clientes")
  //     .updateOne({ email: email }, { $push: { qrCodes: novoQrCode.codigo } });

  await db.collection("clientes").updateOne(
    { email: email },
    {
      $push: {
        qrCodes: codigo,
      },
    }
  );

  res.status(200).send("Inscrição salva!");
});

app.get("/qrcodes", async function (req, res) {
  try {
    let email = req.query.email;

    let cliente = await clientes.findOne({ email: email });

    if (!cliente) {
      return res.status(404).send({ erro: "Cliente não encontrado" });
    }

    let listaQrCodes = cliente.qrCodes || [];
    res.status(200).send(listaQrCodes);
  } catch (erro) {
    res.status(500).send({ erro: "Erro interno do servidor" });
  }
});

app.post("/notifications/subscribe", async function (req, res) {
  let { email, key } = req.body;

  // 2. Validação inicial: se não veio o email (nome) ou a assinatura (key)
  if (!email || !key) {
    return res
      .status(400)
      .send("Dados de assinatura inválidos ou incompletos.");
  }

  // 3. Procuramos o cliente usando o email correto (que veio no campo 'nome')
  const cliente = await clientes.findOne({ email: email });

  if (!cliente) {
    return res.status(403).send("Acesso negado: email inválido!");
  }

  try {
    // 4. Transformamos a string 'key' de volta no objeto JSON de assinatura que o navegador gerou
    const assinaturaCompleta = JSON.parse(key);

    // 5. Criamos o registro exatamente no formato que você quer guardar
    let registro = {
      endpoint: assinaturaCompleta.endpoint,
      //expirationTime: assinaturaCompleta.expirationTime,
      keys: assinaturaCompleta.keys,
    };
    // 6. Atualiza o banco adicionando o registro ao array de assinaturas do cliente
    await db.collection("clientes").updateOne(
      { email: email }, // Busca pelo email que estava no 'nome'
      {
        $push: {
          notificationSubscription: registro, // Adiciona ao array existente
        },
      }
    );

    console.log(assinaturaCompleta);

    res.status(200).send("Inscrição salva!");
  } catch (error) {
    console.error("Erro ao processar assinatura:", error);
    res.status(500).send("Erro interno ao salvar inscrição.");
  }
});

conecta();

app.listen(7000, function () {
  console.log("SERVIDOR WEB na porta 7000");
});

module.exports = app;
