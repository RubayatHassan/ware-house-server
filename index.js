const express = require('express')
const cors = require('cors');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const { MongoClient, ObjectId } = require('mongodb');

const app = express()
const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json())

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'unauthorized access' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: 'Forbidden access' });
    }
    console.log('decoded', decoded);
    req.decoded = decoded;
    next();
  })
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jooei.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
    await client.connect();
    const ProductsCollection = client.db('computer_parts_manufacturer').collection('products')
    const bookingCollection = client.db('computer_parts_manufacturer').collection('booking')
    const userCollection = client.db('computer_parts_manufacturer').collection('users');
    const reviewsCollection = client.db('computer_parts_manufacturer').collection('reviews');

    app.get('/product', async (req, res) => {
      const query = {};
      const cursor = ProductsCollection.find(query);
      const products = (await cursor.toArray()).reverse();
      res.send(products)
    })

    // find one
    app.get('/product/:id', async (req, res) => {
      const id = req.params;
      const query = { _id: ObjectId(id) };
      const product = await ProductsCollection.findOne(query);
      res.send(product);
    })

    
    
    app.post('/order', async (req, res) => {
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking)
      res.send({ success: true, message: "Successfully ordered ", result });
    })
    
    
    app.get('/review', async(req, res)=>{
      const query = {}
      const result = await reviewsCollection.find(query).toArray()
      res.send(result)
    }
    )

    app.post('/review', async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review)
      res.send({ success: true, message: "reviews added ", result });
    })

    app.post('/product', async (req, res) => {
      const newProduct = req.body;
      const result = await ProductsCollection.insertOne(newProduct)
      res.send({ success: true, message: "product added ", result });
    })




    app.get('/order', verifyJWT, async (req, res) => {
      const orders = req.query.email;
      const decodedEmail = req.decoded.email;
      if (orders === decodedEmail) {
        const query = { email: orders };
        const result = await bookingCollection.find(query).toArray();
        res.send(result)
        return;
      }
      return res.status(403).send({ message: 'forbidden access' })
    })

    app.put('/user/admin/:email', verifyJWT, async (req, res) => {
      const email = req.params.email;
      const requester = req.decoded.email;
      const requesterAccount = await userCollection.findOne({ email: requester });
      if (requesterAccount.role === 'admin') {
        const filter = { email: email };
        const updateDoc = {
          $set: { role: 'admin' },
        };
        const result = await userCollection.updateOne(filter, updateDoc);
        res.send({success:true, message:'admin added' , result});
        return;
      }
      else (
        res.status(403).send({ message: 'forbidden access' })
      )

    })

    app.get('/admin/:email', async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const user = await userCollection.findOne({ email: email });
      const isAdmin = user.role === 'admin';
      res.send({ admin: isAdmin })
    })

    app.put('/user/:email', async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const user = req.body;
      console.log(user);
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
      res.send({ result, token });
    })

    app.get('/user', async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    })

    //delete item
    app.delete('/items/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    })

  }
  finally {

  }

}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('computer parts manufacturer!')
})

app.listen(port, () => {
  console.log(`hello i am from ${port}`)
})