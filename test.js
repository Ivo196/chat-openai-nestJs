import { config } from "dotenv";
import OpenAI from "openai";

config();
const api = process.env.API_KEY;

const openai = new OpenAI({
  apiKey: api,
});

async function runCompletion(messages) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 200,
    temperature: 0.7,
    messages: [{ role: "user", content: messages }],
  });
  return response.choices[0].message.content;
}

const response = await runCompletion("Hola mi nombre es ivo");
console.log(response);
