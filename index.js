const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
const jwt = require('jsonwebtoken');
require("dotenv").config()
//const res = require('express/lib/response');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
app.use(cors());
app.use(express.json());
function verifyJwt(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauhorized user" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET_KEY, (error, decoded) => {
    if (error) {
      return res.status(403).send({ message: "forbidden access" })
    }
    req.decoded = decoded;
    next();

  });
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ngj4j.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
  try {
    await client.connect();
    const carCollection = client.db('car').collection('collection');
    //auth token

    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, `${process.env.JWT_SECRET_KEY}`, {
        expiresIn: '1d'
    });
      res.send({ accessToken });
    });
    

    //same email
    app.get("/personalData", verifyJwt, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      if (email === decodedEmail) {
        const queryy = { email: email };
        const cursor = carCollection.find(queryy);
        const result = await cursor.toArray();
        res.send(result);
      } else {
        res.status(403).send({ message: "Forbidden access" });
      }
    });

    app.get('/item', async (req, res) => {
      const query = {};
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
    //update data for item
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
    //root
    app.get('/',(req,res)=>{
      res.send("hello i can learn code");
    })

  }
  finally {
    //await client.close()


  }
}
run().catch(console.dir);




app.listen(port, () => {
  console.log('singing', port)
})