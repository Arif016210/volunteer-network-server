const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();



const app = express()
app.use(bodyParser.json());
app.use(cors());
const port = 5000



var serviceAccount = require("./volunteer-network-2020-firebase-adminsdk-narv8-b41020ac4e.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://volunteer-network-2020.firebaseio.com"
});


const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://volunteerUser:wasim123@cluster0.5wsjo.mongodb.net/volunteerNetworkProject?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const registration = client.db("volunteerNetworkProject").collection("volunteerInfo");

    app.post('/addRegister', (req, res) => {
        const newRegister = req.body;
        registration.insertOne(newRegister)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
        // console.log(newRegister);
    })
    app.get('/registerUser', (req, res) => {
        const bearer = req.headers.authorization;
        if (bearer && bearer.startsWith('Bearer ')) {
            const idToken = bearer.split(' ')[1]
            console.log({ idToken });

            // idToken comes from the client app
            admin.auth().verifyIdToken(idToken)
                .then(function (decodedToken) {
                    const tokenEmail = decodedToken.email;
                    const queryEmail = req.query.email;
                    console.log(tokenEmail, queryEmail);

                    if (tokenEmail == req.query.email) {
                        registration.find({ email: req.query.email })
                            .toArray((err, document) => {
                                res.status(200).send(document);
                            })
                    }
                    else {
                        res.status(401).send('un authorization access');
                    }
                    // ...
                }).catch(function (error) {
                    res.status(401).send('un authorization access');
                });


        }
        else {
            res.status(401).send('un authorization access');
        }

    })


});






app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(process.env.PORT || port)