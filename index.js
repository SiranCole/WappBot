const fs = require("fs");
const dotenv = require("dotenv");
const qrcode = require("qrcode-terminal");

const { Client, LocalAuth } = require("whatsapp-web.js");

const client = new Client({
  authStrategy: new LocalAuth(),
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Tamo conectaos papito");
});

// CONDICIONAL @everyone
const everyoneCond = async (message) => {
  if (message.body.includes("@everyone")) {
    const chat = await message.getChat();

    let text = "";
    let mentions = [];

    for (let participant of chat.participants) {
      mentions.push(`${participant.id.user}@c.us`);
      text += `@${participant.id.user} `;
    }

    await chat.sendMessage(text, { mentions });
  }
};
// CONDICIONAL 💩
const responsesCond = async (message) => {
  if (message.body.includes("!comandos")) {
    const chat = await message.getChat();

    await chat.sendMessage(`Lista de comandos: 
    
    -@ everyone`);
  }
};

// OBTENER PERMISOS
let permisos = { todos: [everyoneCond] };
let hay_permisos = false;

if (fs.existsSync(".env")) {
  dotenv.config();
  const requiredVariables = [
    "PRUEBA_CHAT_ID",
    "CAMARONES_CHAT_ID",
    "CAMARONES_CAGAN_CHAT_ID",
    "GODSIPS_CHAT_ID",
  ];
  for (const variable of requiredVariables) {
    if (!process.env[variable]) {
      console.error(`La variable de entorno ${variable} no está definida.`);
      process.exit(1);
    }
  }
  permisos[process.env.PRUEBA_CHAT_ID] = [everyoneCond, responsesCond];
  permisos[process.env.CAMARONES_CHAT_ID] = [everyoneCond];
  permisos[process.env.CAMARONES_CAGAN_CHAT_ID] = [everyoneCond];
  permisos[process.env.GODSIPS_CHAT_ID] = [everyoneCond];

  hay_permisos = true;
}

// MENSAJE RECIBIDO
client.on("message", async (message) => {});

// MENSAJE CREADO;
client.on("message_create", async (message) => {
  let funcsPermitidas;
  console.log(message.id.remote);
  console.log(message.body);
  chatId = message.id.remote;
  if (hay_permisos) {
    if (permisos[chatId]) {
      funcsPermitidas = permisos[chatId];
    } else {
      funcsPermitidas = [];
    }
  } else {
    funcsPermitidas = permisos["todos"];
  }

  for (const func of funcsPermitidas) {
    func(message);
  }
});

client.initialize();
