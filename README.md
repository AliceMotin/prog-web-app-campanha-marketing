# App PWA - Campanha de Marketing

Trabalho desenvolvido para a disciplina de **Programação para Web** da Universidade Federal de Santa Catarina (UFSC) - Campus Araranguá.

## Sobre o Projeto

O projeto consiste no desenvolvimento de um aplicativo móvel estruturado como **Progressive Web App (PWA)** para uma campanha promocional de uma fábrica de biscoitos. 

O sistema permite que os clientes escaneiem e cadastrem os **QR-Codes** presentes nas embalagens dos produtos adquiridos. O usuário pode consultar a qualquer momento os códigos já resgatados em sua conta. Ao final da campanha, os códigos sorteados geram **notificações push** automáticas para avisar os vencedores dos prêmios. O projeto também conta com uma ferramenta de linha de comando (`CLI`) no backend para o disparo manual/administrativo das mensagens de premiação.

---

## Funcionalidades

* **Leitura de QR-Code:** Integração com a câmera do dispositivo via biblioteca `html5-qrcode` para captura dos códigos das embalagens.
* **Gestão de Cupons:** Armazenamento e consulta dos QR-Codes cadastrados vinculados à conta do cliente.
* **Notificações Push (Web Push):** Sistema de alertas integrado para avisar os clientes contemplados no sorteio promocional.
* **Ferramenta CLI no Backend:** Script em Node.js para notificar clientes com base no QR-Code sorteado:
  ```bash
  nodejs manda_msg <codigo_qrcode> "Mensagem de premiação"

---

## Tecnologias Utilizadas

* **Front-end / PWA:** HTML, CSS, JavaScript, Service Workers e html5-qrcode.
* **Back-end:** Node.js, Express e biblioteca web-push.
* **Banco de Dados:** MongoDB.

---

## Como Executar o Projeto

### Pré-requisitos
* Node.js instalado na máquina.

### 1. Clonar o repositório
```bash
git clone [https://github.com/AliceMotin/prog-web-app-campanha-marketing.git](https://github.com/AliceMotin/prog-web-app-campanha-marketing.git)
cd prog-web-app-campanha-marketing
```
### 2. Configurar o Servidor e o Banco de Dados
```bash
cd server
npm install
npm start
```
### 3. Disparar Notificações via CLI (Backend)
```bash
nodejs manda_msg 123 "Parabéns, você foi sorteado na promoção dos produtos X, entre em contato para receber seu prêmio"
```

## 👩‍💻 **Desenvolvido por:**  
| [<img loading="lazy" src="https://avatars.githubusercontent.com/u/112569754?v=4" width=115><br><sub>Alice Motin</sub>](https://github.com/AliceMotin) | 
| :---: |
