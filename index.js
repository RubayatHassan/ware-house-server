const express = require('express')
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const port =process.env.PORT || 5000

app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jooei.mongodb.net/?retryWrites=true&w=majority`;
    console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        const ProductsCollection = client.db('computer_parts_manufacturer').collection('products')

        app.get('/product', async(req, res) =>{
            const query = {};
            const cursor = ProductsCollection.find(query);
            const products = await (await cursor.toArray()).reverse()
            res.send(products)
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