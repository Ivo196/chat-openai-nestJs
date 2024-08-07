import { config } from "dotenv";
import { Client } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

config();

const numberClient = "4591957608@c.us";

const client = new Client();

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});
client.on("ready", () => {
  console.log("Client is ready");
});
client.on("auth_failure", (msg) => {
  console.error("AUTHENTICATION FAILURE", msg);
});

client.on("message", async (message) => {
  if (message.from === numberClient) {
    const contact = await client.getContactById(numberClient);
    const contactName = contact.pushname || contact.verifiedName || contact.name || 'sin nombre';
            
    console.log(`Mensaje de ${contactName}: ${message.body}`);
    // console.log("Hola desde: ", numberClient);
    // console.log("Mensaje: ", message.body);
  }
});
client.initialize(); //Inicializa el cliente de WhatsApp Web, iniciando el proceso de autenticación.
