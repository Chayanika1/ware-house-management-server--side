const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
const jwt = require('jsonwebtoken');
//const res = require('express/lib/response');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
app.use(cors());
app.use(express.json());


const uri = "mongodb+srv://flower:y8uqXpfW0PqFFGDd@cluster0.ngj4j.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
  try {
    await client.connect();
    const carCollection = client.db('car').collection('collection');
    //auth token
    
    app.post('/login', async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, `${process.env.JWT_SECRET_KEY}`, {
          expiresIn: '1d'
      });
      res.send({ accessToken });
  })

    app.get('/item', async (req, res) => {
      const query = { };
      const cursor = carCollection.find(query);
      const items = await cursor.toArray();
      res.send(items);
    });
    app.get('/item/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const item = await carCollection.findOne(query);

      res.send(item);
    })
    //delete button for item
    app.delete('/item/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await carCollection.deleteOne(query);
      res.send(result)
    })
    //add data for item
    app.post("/item", async (req, res) => {
      const newUser = req.body;
      const result = await carCollection.insertOne(newUser);
      res.send(result)
    })
    //update data
    app.put("/item/:id", async (req, res) => {
      const id = req.params.id;
      const prevQuantity = parseInt(req.query.prevQuantity);
      console.log(prevQuantity);
      const user = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const doc = {
        $set: {
          quantity: parseInt(user.quantity) + parseInt(prevQuantity)
        },
      }
      const result = await carCollection.updateOne(filter, doc, options);
      res.send(result)
    })
    //decrease  value for a product
    app.put("/items/:id", async (req, res) => {
      const id = req.params.id;
      const prevQuantity = parseInt(req.query.prevQuantity);
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const doc = {
        $set: {
          quantity: (parseInt(prevQuantity) - 1),
        },
      };
      const result = await carCollection.updateOne(filter, doc, options);
      res.send(result);
    });

  }
  finally {
    //await client.close()


  }
}
run().catch(console.dir);




app.listen(port, () => {
  console.log('singing', port)
})