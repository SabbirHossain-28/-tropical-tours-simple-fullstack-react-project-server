const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.7nkbk6a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db("toruismSpotsDB");
    const spotCollection = database.collection("spots");
    const countriesCollection = database.collection("countries");

    app.get("/spots", async (req, res) => {
      const cursor = spotCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/countries", async (req, res) => {
      const cursor = countriesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/spoots", async (req, res) => {
      try {
        const country_name = req.query.country_name;
        console.log(country_name);
        const query = { country_name:country_name};
        const cursor = spotCollection.find(query);
        const result = await cursor.toArray(); 
        res.send(result);
      } catch (error) {
        console.error("Error fetching spots by country name:", error);
        res.status(500).send("Internal Server Error");
      }
    });
    

    app.get("/spots/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await spotCollection.findOne(query);
      res.send(result);
    });

    

    app.post("/spots", async (req, res) => {
      const spotsData = req.body;
      const result = await spotCollection.insertOne(spotsData);
      res.send(result);
    });

    app.put("/spots/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const newSpotData = req.body;
      const updatedSpotData = {
        $set: {
          photo: newSpotData.photo,
          spot: newSpotData.spot,
          time: newSpotData.time,
          visitors: newSpotData.visitors,
          cost: newSpotData.cost,
          location: newSpotData.location,
          season: newSpotData.season,
          description: newSpotData.description,
          country_name: newSpotData.country_name,
        },
      };
      const result = await spotCollection.updateOne(
        filter,
        updatedSpotData,
        options
      );
      res.send(result);
    });

    app.delete("/spots/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await spotCollection.deleteOne(query);
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Tropical Tours server is ready to use");
});
app.listen(port, () => {
  console.log(`Tropical Tours server is running on port: ${port}`);
});
