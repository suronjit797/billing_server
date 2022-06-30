const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express()
const port = process.env.PORT || 5000

app.use(cors())



// monogpDB

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.bupbu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const productsCollection = client.db("sapphire").collection("products");


// main function
async function run() {

    try {

        // connect with server
        await client.connect()
        console.log('database connected....')

    }
    finally {

    }

}

run().catch(console.dir)







// base api
app.get('/', (req, res) => {
    res.json({ message: 'Billing server is online' })
})

// listening...
app.listen(port, () => {
    console.log(`Server is online on port ${port} ...`);
})

