import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { DataAPIClient } from "@datastax/astra-db-ts";

const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  OPENAI_API_KEY,
} = process.env;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);

const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const latestMessage = messages[messages.length - 1]?.content;

    let docContext = "";

    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: latestMessage,
      encoding_format: "float",
    });

    try {
      const collection = await db.collection(ASTRA_DB_COLLECTION);
      const cursor = collection.find(null, {
        sort: {
          $vector: embedding.data[0].embedding,
        },
        limit: 10,
      });

      const documents = await cursor.toArray();

      const docsMap = documents?.map((doc) => doc.text);

      docContext = JSON.stringify(docsMap);
    } catch {
      console.log("Error querying db...");
      docContext = "";
    }

    const template = {
      role: "system",
      content: `You are a knowledgeable Formula One expert with deep insights into the sport's history, teams, drivers, technical regulations, and race dynamics. 

Your primary objective is to provide accurate, comprehensive, and engaging responses about Formula One.

Key Guidelines:
- keep the responses short 
- Synthesize information from the provided context seamlessly with your existing knowledge
- Prioritize the context if specific details are present
- Ensure responses are precise, well-structured, and informative
- Use markdown formatting to enhance readability
- Include relevant technical details, historical context, or statistical insights where appropriate

Context Provided:
${docContext}

Question to Address:
${latestMessage}

Respond as a passionate and authoritative F1 analyst, drawing from both the given context and comprehensive F1 expertise.`,
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      stream: true,
      messages: [template, ...messages],
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (err) {
    console.log(`Error!!! ${err}`);
  }
}