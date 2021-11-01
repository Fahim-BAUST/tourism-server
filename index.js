const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require("cors");
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rbwav.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {

        await client.connect();
        const database = client.db("caring_crossing");
        const servicesCollection = database.collection("services");
        const orderCollection = database.collection("order");

        // GET API 
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/services/:id',async(req,res)=>{
            const id= req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await servicesCollection.findOne(query);
            res.send(result);
        })

        app.get('/allOrders', async (req, res) => {
            const cursor = orderCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        })
        //  search order by email
        app.get('/allOrders/:email', async (req, res) => {
            const email= req.params.email;
            const query = { email: email};
            const cursor = orderCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })


        
        // Add Orders API
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result);
        })


        // POST API 


        app.post('/addService', async (req, res) => {
            const newService = req.body;
            const result = await servicesCollection.insertOne(newService);
            res.json(result);
           
        })

        // put api:  update 

        app.put('/updateStatus/:id',async(req,res)=>{
            const id = req.params.id;
            const status=req.body;
            
            const filter = { _id: ObjectId(id) };
            
            const options = { upsert: true };
            
            const updateDoc = {
                $set: {
                    orderStatus: status.status
                }
            };
            const result = await orderCollection.updateOne(filter, updateDoc, options);
            res.json(result);     

        })

        // DELETE API 
        app.delete('/allOrders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.json(result);
        })

    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!')
})



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})