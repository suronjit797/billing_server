const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express()
const port = process.env.PORT || 5000
const saltRounds = 7;

app.use(express.json())
app.use(cors())



// jwt verify
const jwtVerify = async (req, res, next) => {
    const authHeaders = req.headers.authorization
    if (!authHeaders) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeaders.split(' ')[1]
    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded
        next()
    })
}

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

        // register
        app.post('/api/registration', async (req, res) => {
            const { name, email, password } = req.body
            const isUser = await userCollection.findOne({ email })
            if (!!isUser) {
                return res.status(406).send({ message: "User Already Exist" })
            }

            bcrypt.hash(password, saltRounds, async (err, hash) => {
                if (err) {
                    return res.status(500).send({ message: "Server Error Occurred" })
                }
                const result = await userCollection.insertOne({ name, email, password: hash })
                if (result) {
                    const token = jwt.sign({ name, email, isAuth: true }, process.env.TOKEN_SECRET);
                    res.send({ token })
                }
            });
        })

        // login
        app.post('/api/login', async (req, res) => {
            const { email: userEmail, password: userPassword } = req.body
            const isUser = await userCollection.findOne({ email: userEmail })
            if (!isUser) {
                return res.status(401).send({ message: "User Not Found" })
            }
            const { name, email, password } = isUser
            const match = await bcrypt.compare(userPassword, password);
            if (!match) {
                return res.status(401).send({ message: "Password does not match" })
            }
            const token = jwt.sign({ name, email, isAuth: true }, process.env.TOKEN_SECRET);
            res.send({ token })
        })

        // jwt

        app.get('/jwt-verify', jwtVerify, async (req, res) => {
            const decoded = req.decoded
            res.send(decoded)
        })

        /*******************
        ****** bills *******
        *******************/
        app.get('/api/billing-list', jwtVerify, async (req, res) => {
            const limit = 10
            const skip = req.query.skip || 0
            const result = await billsCollection.find().sort({ _id: -1 }).skip(parseInt(skip)).limit(limit).toArray()
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

        // total amount
        app.get('/api/total-amount', jwtVerify, async (req, res) => {
            const { email } = req.decoded
            const result = await billsCollection.find().toArray()
            let totalAmount = 0
            result.forEach(bill => totalAmount += parseInt(bill.amount))
            res.send({ totalAmount })
        })

        // for pagination
        app.get('/api/db-length', jwtVerify, async (req, res) => {
            const { email } = req.decoded
            const result = await billsCollection.countDocuments()
            res.send({ result })
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

