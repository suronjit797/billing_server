const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');

const app = express()
const port = process.env.PORT || 5000
const saltRounds = 7;

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

        // get all user
        app.get('/api/users', async (req, res) => {
            const result = await userCollection.find().toArray()
            res.send(result)
        })
        app.post('/api/registration', async (req, res) => {
            const { name, email, password } = req.body
            // -------------------------------password has----------------------------------------------------
            const user = { name, email, password }
            const isUser = await userCollection.findOne({ email })
            if (isUser) {
                return res.status(406).send({ message: "User Already Exist" })
            }

            bcrypt.hash(password, saltRounds, async (err, hash) => {
                if(err) {
                    return res.status(500).send({ message: "Server Error Occurred" })
                }
                const result = await userCollection.insertOne({ name, email, password: hash })
                res.send(result)
            });



        })
        app.post('/api/login', async (req, res) => {
            res.send({ message: 'auth' })
        })

        /*******************
****** user *******
*******************/
        app.get('/api/billing-list', async (req, res) => {
            const limit = 10
            const skip = req.query.skip || 0

            const result = await billsCollection.find().skip(parseInt(skip)).limit(limit).toArray()
            res.send(result)
        })

        app.post('/api/add-billing', async (req, res) => {
            const data = req.body
            const result = await billsCollection.insertOne(data)
            res.send(result)
        })

        app.put('/api/update-billing/:id', async (req, res) => {
            const { name, email, phone, amount } = req.body
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const result = await billsCollection.updateOne(filter, { $set: { name, email, phone, amount } }, { upsert: true })
            res.send({ message: 'bill' })
        })

        app.delete('/api/delete-billing/:id', async (req, res) => {
            const id = req.params.id
            const result = await billsCollection.deleteOne({ _id: ObjectId(id) })
            res.send(result)
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

