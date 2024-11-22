const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
port = process.env.PORT || 8000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// Middleware__
app.use(
  cors({
    origin: "http://localhost:5173",
    optionsSuccessStatus: 200,
  })
);
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.g4yea9q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const productCollection = client.db("solemart").collection("products");
    const userCollection = client.db("solemart").collection("users");



    // Post signup users__ __ __!
    app.post("/user", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await userCollection.insertOne(user);
      res.send(result);
    });



    // Get user data__ __ __!
    app.get("/user-data/:email", async (req, res) => {
      const user = req.params.email;
      const query = { userEmail: user };
      const result = await userCollection.findOne(query);
      res.send(result);
    });



    // Fing all category__ __ __!
    app.get("/all-categorys", async (req, res) => {
      const result = await productCollection
        .aggregate([
          { $group: { _id: "$category" } },
          { $project: { _id: 0, category: "$_id" } },
        ])
        .toArray();
      res.send(result);
    });


    // Post new product__ __ __!
    app.post("/add-product", async (req, res) => {
      const item = req.body;
      const result = await productCollection.insertOne(item)
      res.send(result);
    })


    // Get all products__ __ __!
    app.get("/all-products", async (req, res) => {
      const { name, category, sort } = req.query;
      const query = {};

      if (name) {
        query.name = { $regex: name, $options: "i" };
      }

      if (category) {
        query.category = category;
      }

      const sortOptions = sort === "asc" ? 1 : -1;

      const result = await productCollection
        .find(query)
        .sort({ newPrice: sortOptions })
        .toArray();
      res.json(result);
    });

    // Get seller product__ __ __!
    app.get("/seller-product/:email", async (req, res) => {
      const sellerEmail = req.params.email;
      const query = {sellerEmail: sellerEmail};
      const result = await productCollection.find(query).toArray();
      res.send(result);
    })

    // Delete product__ __ __!
    app.delete("/product-delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await productCollection.deleteOne(query);
      res.send(result);
    })




    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  const result = "SOLE_MART server is running";
  res.send(result);
});

app.listen(port, () => {
  console.log(`The SOLE_MART server is running on ${port} port`);
});
