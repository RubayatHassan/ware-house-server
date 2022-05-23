const express = require('express')
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const port =process.env.PORT || 5000

app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jooei.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        const ProductsCollection = client.db('computer_parts_manufacturer').collection('products')

        app.get('/product', async(req, res) =>{
            const query = {};
            const cursor = ProductsCollection.find(query);
            const products = (await cursor.toArray()).reverse();
            res.send(products)

            // find one
            app.get('/product/:id', async(req, res)=>{
              const id = req.params.id;
              console.log(id);
              const query = {_id: Object(id)};
              const product = await ProductsCollection.findOne(query);
              res.send(product);
            })
        })
    }
    finally{

    }

}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('computer parts manufacturer!')
})

app.listen(port, () => {
  console.log(`hello i am from ${port}`)
})