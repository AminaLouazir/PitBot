import { DataAPIClient } from '@datastax/astra-db-ts';
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import OpenAI from 'openai';
import 'dotenv/config';

type SimilarityMetric = 'dot_product' | 'cosine' | 'euclidean';

// fetching all the env variables
const {
    ASTRA_DB_NAMESPACE,
    ASTRA_DB_COLLECTION,
    ASTRA_DB_API_ENDPOINT,
    ASTRA_DB_APPLICATION_TOKEN,
    OPENAI_API_KEY
} = process.env;

const openai = new OpenAI({apiKey : OPENAI_API_KEY})

const f1Data = [
    'https://en.wikipedia.org/wiki/Formula_One',
    'https://www.skysports.com/f1',
    'https://www.skysports.com/f1/news/12433/13284600/lewis-hamilton-new-ferrari-driver-celebrates-40th-birthday-ahead-of-fresh-f1-adventure-in-2025',
    'https://www.formula1.com/en/latest/all',
    'https://www.formula1.com/en/latest/article/the-beginners-guide-to-the-formula-1-weekend.5RFZzGXNhEi9AEuMXwo987',
    'https://www.redbull.com/ie-en/f1-24-tips-guide',
    'https://www.formula1.com/en/racing/2023',
    'https://www.formula1.com/en/racing/2023/United_States.html',
    'https://www.formula1.com/en/racing/2022',
];

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, {
    namespace: ASTRA_DB_NAMESPACE,
});

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const createCollection = async (
    similarityMetric: SimilarityMetric = "dot_product"
  ) => {
    const res = await db.createCollection(ASTRA_DB_COLLECTION, {
      vector: {
        dimension: 1536,
        metric: similarityMetric,
      },
    });
    console.log(res);
  
    await sleep(2000);
  };


  const loadSampleData = async () => {
    const collection = await db.collection(ASTRA_DB_COLLECTION);
    for await (const url of f1Data) {
      const content = await scrapePage(url);
      const chunks = await splitter.splitText(content);
      for await (const chunk of chunks) {
        const embedding = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: chunk,
          encoding_format: "float",
        });
  
        const vector = embedding.data[0].embedding;
  
        const res = await collection.insertOne({
          $vector: vector,
          text: chunk,
        });
        console.log(res);
      }
    }
  };

  const scrapePage = async (url: string) => {
    const loader = new PuppeteerWebBaseLoader(url, {
      launchOptions: {
        headless: true,
      },
      gotoOptions: {
        waitUntil: "domcontentloaded",
      },
      evaluate: async (page, browser) => {
        const result = await page.evaluate(() => document.body.innerHTML);
        await browser.close;
        return result;
      },
    });
    return (await loader.scrape())?.replace(/<[^.]*.?/gm, "");
  };
  
  createCollection().then(() => loadSampleData());