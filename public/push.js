var settings = {
  public:
    "BBYExARNSP_S6BmNzkYO61bgWUZi_Z9GHvsrgd3RzTUrlWwFeGnFn9fGQTy_JBbuZkh3QxaEYs9v2oAJLPTdAzk",
  pushSubscription: "",
};

// 2. Função auxiliar do professor para converter a chave VAPID para Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// 3. Função principal que você vai chamar para registrar o Push no navegador
async function inicializarNotificacoes() {
  // Solicita permissão nativa ao usuário
  const permissao = await Notification.requestPermission();

  if (permissao !== "granted") {
    console.warn("Permissão de notificação negada pelo usuário.");
    return;
  }

  try {
    // Espera o Service Worker estar ativo e pronto
    // const registroSW = await navigator.serviceWorker.ready;
    let registroSW = await navigator.serviceWorker.getRegistration();

    if (!registroSW) {
      // Se por algum motivo o navegador ainda não carregou o contexto do worker, aguarda o status ready
      registroSW = await navigator.serviceWorker.ready;
    }

    // Configura a chave pública
    const opcoesInscricao = {
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(settings.public),
    };

    // Gera a assinatura digital única do navegador
    const assinatura = await registroSW.pushManager.subscribe(opcoesInscricao);

    // Guarda a assinatura gerada dentro do objeto 'settings' como o professor estruturou
    settings.pushSubscription = assinatura;

    // Pega o e-mail do usuário logado na memória do seu app
    const emailLogado = localStorage.getItem("usuario_email");

    if (emailLogado) {
      // Dispara a função do professor enviando o e-mail do usuário logado como identificador
      await cadastraPWAservidor(emailLogado);
    } else {
      console.warn(
        "Usuário não identificado. Assinatura não enviada ao banco de dados."
      );
    }
  } catch (erro) {
    console.error("Erro ao assinar o serviço de Push:", erro);
  }
}

// 4. Função que envia a credencial diretamente para o seu backend salvar
async function cadastraPWAservidor(email) {
  console.log("Cadastrando PWA no servidor para o usuário:", email);
  let key = settings.pushSubscription;

  console.log("pushSubscription:", key);

  // Faz a requisição POST para a sua rota do backend (ou a rota padrão /cadastra se você manteve assim)
  try {
    const res = await fetch("/notifications/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Passa o e-mail no parâmetro 'nome' e a assinatura JSON em 'key'
      body: JSON.stringify({
        email: email,
        key: JSON.stringify(key),
      }),
    });

    if (res.ok) {
      console.log(
        "Assinatura de Push cadastrada com sucesso no banco de dados!"
      );
    } else {
      console.error("Erro ao salvar assinatura no servidor.");
    }
  } catch (error) {
    console.error("Falha na comunicação com o servidor:", error);
  }
}
