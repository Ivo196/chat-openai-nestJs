import { config } from "dotenv";
import { Client } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import OpenAI from "openai";

config();
const api = process.env.API_KEY;
const assistant_id= process.env.ID


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

const thread = await openai.beta.threads.create();
async function runCompletion(messages) {

    const message = await openai.beta.threads.messages.create(
      thread.id,
      {role: "user", content: messages}
    );
    let run = await openai.beta.threads.runs.createAndPoll(
        thread.id,
        { 
          assistant_id: assistant_id,
          instructions: messages,
          // max_completion_tokens: 100,
          // max_prompt_tokens: 100
        }
      );
      if (run.status === 'completed') {
        const messages = await openai.beta.threads.messages.list(
          run.thread_id
        );
        let response = "";
        for (const message of messages.data.reverse()) {
          response +=`${message.role} > ${message.content[0].text.value}`;
        }
        return response
      } else {
        return run.status
      }
  
    
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
