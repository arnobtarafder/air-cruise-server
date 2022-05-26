const { MongoClient, ServerApiVersion } = require('mongodb');
require("dotenv").config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');


const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json())


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next();
    });
}



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.otcue.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
});


async function run() {
    try {
        await client.connect()
        const productCollection = client.db("air_cruise").collection("products");
        const orderCollection = client.db("air_cruise").collection("orders");
        const userCollection = client.db("air_cruise").collection("users");
        const reviewCollection = client.db("air_cruise").collection("reviews");
        const paymentCollection = client.db("air_cruise").collection("payments");


        const verifyAdmin = async (req, res, next) => {
            const requester = req.decoded.email;
            const requesterAccount = await userCollection.findOne({ email: requester });
            if (requesterAccount.role === "admin") {
                next();
            }
            else {
                return res.status(403).send({ message: 'Forbidden access' })
            }
        }

        // PRODUCTS
        app.get("/products", async (req, res) => {
            const products = await productCollection.find({}).toArray();
            res.send(products);
        })


        console.log("connected to database");
    }

    finally {

    }
}

run().catch(console.dir)




app.get("/", (req, res) => {
    res.send("Hello! I Am Mr.Developer From Air-Cruise Corporation")
})

app.listen(port, () => {
    console.log(`listening to the port: ${port}`);
})