import OpenAI from "openai";
import { config } from "dotenv";

config(); 
const api = process.env.API_KEY;
const assistant_id= process.env.ID

const openai = new OpenAI({
  apiKey: api,
  
});

async function main() {
  const thread = await openai.beta.threads.create();

  const message = await openai.beta.threads.messages.create(
    thread.id,
    {
      role: "user",
      content: "Cuanto debo a la constructora? y cuales son los periodos de vencimiento?"
    }
  );

  // We use the stream SDK helper to create a run with
  // streaming. The SDK provides helpful event listeners to handle 
  // the streamed response.
  const run = openai.beta.threads.runs.stream(thread.id, {
    assistant_id: assistant_id
  })
    .on('textCreated', (text) => process.stdout.write('\nassistant > '))
    .on('textDelta', (textDelta, snapshot) => process.stdout.write(textDelta.value))
    .on('toolCallCreated', (toolCall) => process.stdout.write(`\nassistant > ${toolCall.type}\n\n`))
    .on('toolCallDelta', (toolCallDelta, snapshot) => {
      if (toolCallDelta.type === 'code_interpreter') {
        if (toolCallDelta.code_interpreter.input) {
          process.stdout.write(toolCallDelta.code_interpreter.input);
        }
        if (toolCallDelta.code_interpreter.outputs) {
          process.stdout.write("\noutput >\n");
          toolCallDelta.code_interpreter.outputs.forEach(output => {
            if (output.type === "logs") {
              process.stdout.write(`\n${output.logs}\n`);
            }
          });
        }
      }
    });
}

main().catch(console.error);
