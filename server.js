const express = require('express');
const path = require('path');
//An addition to ejs to be able to create a 'layout' for all pages (optional)
const ejsMate = require('ejs-mate');
const mongoose = require('mongoose');
const Feedback = require('./mongoose models/feedback');

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}



const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // to be able to parse JSON body submitted to POST request

app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));

// To serve the public folder that has css, js files
app.use(express.static(path.join(__dirname + '/public')));

app.use("/css", express.static(path.join(__dirname, "node_modules/bootstrap/dist/css")));
app.use("/js", express.static(path.join(__dirname, "node_modules/bootstrap/dist/js")));
app.use("/js", express.static(path.join(__dirname, "node_modules/jquery/dist")));

console.log("we are in " + process.env.NODE_ENV + " mode");


//----- Connect to MongoDB -------
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/jerichoWavesDB';
mongoose.connect(dbUrl)
    .then(() => {
        console.log("MongoDB is connected");
    })
    .catch(err => {
        console.log(`MongoDB: there is an error:${err}`);
    });


//-----GET all emails in the Database-----
app.get('/', (req, res) => {
    try {
        res.render('home');
    }
    catch (e) {
        console.log(e);
        res.status(500).send("Internal error");
    }
});

app.post('/', async (req, res) => {
    try{
        let data = req.body;

        console.log(data);
   
        let newfeedback = new Feedback(data);
    
        let saveToDbResult = await newfeedback.save();
        res.send(saveToDbResult);
    }
    catch(e)
    {
        console.log(e);
        res.status(500).send("Internal error");
    }
});


//-----Page not found------
app.use((req, res) => {
    res.status(404).send('PAGE NOT FOUND!');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});



