const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express()
const port = process.env.PORT || 5000

app.use(express.json())
app.use(cors())



// monogoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.bupbu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const userCollection = client.db("powerHack").collection("user");
const billsCollection = client.db("powerHack").collection("bills");


// main function
async function run() {

    try {

        // connect with server
        await client.connect()
        console.log('database connected....')

        /*******************
        ****** user *******
        *******************/
        app.post('/api/registration', async (req, res) => {
            res.send({ message: 'auth' })
        })
        app.post('/api/login', async (req, res) => {
            res.send({ message: 'auth' })
        })

        /*******************
****** user *******
*******************/
        app.get('/api/billing-list', async (req, res) => {
            const result = await billsCollection.find().toArray()
            res.send(result)
        })

        app.post('/api/add-billing', async (req, res) => {
            const data = req.body
            console.log(data)
            res.send({ message: 'bill' })
        })

        app.post('/api/add-billing', async (req, res) => {
            res.send({ message: 'bill' })
        })

        app.post('/api/update-billing/:id', async (req, res) => {
            res.send({ message: 'bill' })
        })

        app.post('/api/delete-billing/:id', async (req, res) => {
            res.send({ message: 'bill' })
        })

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

