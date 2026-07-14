const { MongoClient } = require("mongodb");
const webpush = require("web-push");

// 1. Configurar as chaves VAPID do seu projeto (Chave pública e privada)
// NOTA: Insira uma identificação (mailto) e a sua chave privada correspondente à chave pública do seu push.js
const chavesVapid = {
  subject: "mailto:alicemotin19@gmail.com",
  publicKey:
    "BBYExARNSP_S6BmNzkYO61bgWUZi_Z9GHvsrgd3RzTUrlWwFeGnFn9fGQTy_JBbuZkh3QxaEYs9v2oAJLPTdAzk",
  privateKey: "Ufq4CrNDRkxqiudRvHyVZjgxKwYAvrs2pwk13QQ58d8",
};

webpush.setVapidDetails(
  chavesVapid.subject,
  chavesVapid.publicKey,
  chavesVapid.privateKey
);

// 2. Capturar os argumentos do terminal (CLI)
// O array process.argv contém: [0] caminho do node, [1] caminho do script, [2] qrcode, [3] mensagem
const codigoQrCode = process.argv[2];
const mensagemCustomizada = process.argv[3] || "Parabéns! Você é o vencedor!";

if (!codigoQrCode) {
  console.error("Erro: Você deve passar o código do QR Code como argumento!");
  console.log('Exemplo de uso: node manda_msg <codigo_qrcode> "sua mensagem"');
  process.exit(1);
}

async function enviarNotificacao() {
  const client = new MongoClient("mongodb://127.0.0.1:27017");

  try {
    // Conecta ao MongoDB (mesmo banco do seu server.js)
    await client.connect();
    const db = client.db("PESSOAS");
    const clientes = db.collection("clientes");

    console.log(`Buscando o dono do QR Code: "${codigoQrCode}"...`);

    // Busca o cliente que possui o código enviado dentro do seu array de qrCodes
    const usuarioDono = await clientes.findOne({ qrCodes: codigoQrCode });

    if (!usuarioDono) {
      console.log(
        `Nenhum usuário encontrado com o QR Code "${codigoQrCode}" cadastrado.`
      );
      await client.close();
      return;
    }

    console.log(
      `Usuário encontrado: ${usuarioDono.nome} (${usuarioDono.email})`
    );

    // Recupera o vetor de assinaturas (notificationSubscription) do usuário
    const inscricoes = usuarioDono.notificationSubscription;

    if (!inscricoes || inscricoes.length === 0) {
      console.log(
        `O usuário ${usuarioDono.nome} não possui nenhum dispositivo registrado para notificações.`
      );
      await client.close();
      return;
    }

    console.log(
      `Enviando notificação para os ${inscricoes.length} dispositivo(s) cadastrado(s)...`
    );

    // Payload (mensagem) formatado em JSON que o seu Service Worker espera receber
    const payload = JSON.stringify({
      message: mensagemCustomizada,
    });

    // Percorre cada assinatura ativa do usuário e envia o push
    for (const inscricao of inscricoes) {
      // Reconstrói a estrutura da assinatura de acordo com o que foi salvo no banco
      const pushSubscription = {
        endpoint:
          inscricao.endpoint || (inscricao.keys && inscricao.keys.endpoint),
        keys: {
          p256dh: inscricao.keys?.p256dh || inscricao.keys?.keys?.p256dh,
          auth: inscricao.keys?.auth || inscricao.keys?.keys?.auth,
        },
      };

      try {
        await webpush.sendNotification(pushSubscription, payload);
        console.log(
          `Notificação enviada com sucesso para o endpoint: ${pushSubscription.endpoint.substring(
            0,
            40
          )}...`
        );
      } catch (err) {
        console.error(
          `Falha ao enviar para o endpoint: ${pushSubscription.endpoint.substring(
            0,
            40
          )}... Erro:`,
          err.message
        );
        // Opcional: Se der erro de expiração (status 410), você poderia remover a assinatura inválida do banco
      }
    }
  } catch (error) {
    console.error("Ocorreu um erro durante a execução do script:", error);
  } finally {
    await client.close();
    console.log("Conexão com o MongoDB encerrada.");
  }
}

enviarNotificacao();
