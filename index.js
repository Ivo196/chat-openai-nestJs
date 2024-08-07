import { config } from "dotenv";
import { Client } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import OpenAI from "openai";

config();
const api = process.env.API_KEY;

const client = new Client();

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});
client.on("ready", () => {
  console.log("Client is ready");
});
client.on("auth_failure", (msg) => {
  // Fired if session restore was unsuccessful
  console.error("AUTHENTICATION FAILURE", msg);
});
client.initialize();

const openai = new OpenAI({
  apiKey: api,
});

async function runCompletion(messages) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 100,
    temperature: 0.7,
    messages: [
      { role: "system",content: "Vas a responder con el nombre que te envian"},
      { role: "system", content: "Eres un experto en nutricion" },
      { role: "user", content: messages },
    ],
  });
  return response.choices[0].message.content;
}

const targetNumber = "4591957608@c.us";
client.on("message", async (message) => {
  if (message.from === targetNumber) {
    const contact = await client.getContactById(targetNumber);
    const contactName =
      contact.pushname || contact.verifiedName || contact.name || "Sin Nombre";
    console.log(`Mensaje de ${contactName} : ${message.body}`);
    runCompletion(`Mensaje de ${contactName} : ${message.body}`).then(
      (result) => {
        console.log(result);
        message.reply(result);
      }
    );
  }
});
