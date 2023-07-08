const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const { ChromaClient } = require("chromadb");
const client = new ChromaClient();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello World!!");
});

app.post("/search", (req, res) => {});

// make embegings pass text in body
app.post("/embedings", (req, res) => {
  const text = req.body.text;

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
          Authorization: "Bearer <your key>",
        },
      }
    )
    .then((response) => {
      res.send(response.data);
    })
    .catch((err) => {
      res.send("error");
    });
});

// create a collection in qdrant
app.post("/create", (req, res) => {
  axios
    .put(
      "http://localhost:6333/collections/test_collection",
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      res.send(response.data);
    })
    .catch((err) => {
      res.send("error");
    });
});




app.listen(8000, () => {
  console.log("Server is running on port 8000");
});

// see this for search and adding vector as per need


// https://qdrant.github.io/qdrant/redoc/index.html#section/Examples