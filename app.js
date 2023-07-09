const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
import { QdrantClient } from "@qdrant/js-client-rest";

const client = new QdrantClient({ host: "127.0.0.1", port: 6333 });

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello World!!");
});

const embed = (text) => {
  return new Promise((resolve, reject) => {
    axios
      .post(
        "https://api.openai.com/v1/embeddings",
        {
          input: text,
          model: "text-embedding-ada-002",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer <key>", // place key here
          },
        }
      )
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const setupQuadrant = async () => {
  try {
    const response = await client.getCollections();

    const collectionNames = response.collections.map(
      (collection) => collection.name
    );

    if (!collectionNames.includes("tenders")) {
      await client.createCollection("tenders", {
        vectors: {
          distance: "Cosine",
        },
        optimizers_config: {
          default_segment_number: 2,
        },
        replication_factor: 2,
      });

      await client.createPayloadIndex("tenders", {
        field_name: "employee_count",
        field_schema: "keyword",
        wait: "true",
      });

      await client.createPayloadIndex("tenders", {
        field_name: "industry",
        field_schema: "keyword",
        wait: true,
      });

      await client.createPayloadIndex("tenders", {
        field_name: "Turnover",
        field_schema: "integer",
        wait: true,
      });

      await client.createPayloadIndex("tenders", {
        field_name: "pricing_range",
        field_name: "keyword",
        wait: true,
      });
    }
    return;
  } catch (err) {
    console.log(err);
    return;
  }
};

const insertdata = (points, payload) => {
  try {
    client.upsert("tenders", {
      wait: true,
      id: payload.id,
      vectors: points,
      payload: payload,
    });

    return;
  } catch (err) {
    console.log(err);
    return;
  }
};

const tranformer = async (aboutBussiness, probelmsSolving) => {
  // do something to combine results or keywords extraction
};

// sample response needed to store in vector db
// payload={
//   userId:""
//   aboutBussiness:"",
//   probelmsSolving:"",
//   employeeCount:"",
//   industry:"",
//   turnover:0,
//   pricingRange:"",
// }

app.post("/add", async (req, res) => {
  // store in vector db
  try {
    const payload = req.body;

    const text = tranformer(payload.aboutBussiness, payload.probelmsSolving);

    embedings = await embed(text);

    const newPayload = {
      userId: payload.userId,
      employeeCount: payload.employeeCount,
      industry: payload.industry,
      turnover: payload.turnover,
      pricingRange: payload.pricingRange,
    };

    insertdata(embedings, newPayload);
  } catch (err) {
    console.log(err);
  }
});

payload = {
  requirements: "",
  industry: "",
  budgetRange: "",
  turnover: 0,
  employeeCount: "",
  pricingRange: "",
};

const tranformer2 = async (requirements) => {
  // do something to  keywords extraction
  return requirements;
};

app.post("/search", async (req, res) => {
  try {
    const payload = req.body;

    payload.requirements = tranformer2(payload.requirements);

    const embedings = await embed(payload.requiements);

    const response = await client.search("tenders", {
      vectors: embedings,
      filters: {
        employeeCount: payload.employeeCount,
        industry: payload.industry,
        industry: payload.industry,
        turnover: payload.turnover,
        pricingRange: payload.pricingRange,
      },
    });

    res.send(response);
  } catch (err) {
    console.log(err);
  }
});

app.listen(8000, () => {
  setupQuadrant();
  console.log("Server is running on port 8000");
});
