/* Resources:
Working offline:
https://itnext.io/how-to-make-your-website-work-offline-b5be47b92adc
https://medium.com/swlh/how-to-make-your-web-apps-work-offline-be6f27dd28e

For storing data offline (to later send it when we back online):
check: IndexedDB API
and: https://www.npmjs.com/package/idb
and: https://developer.chrome.com/docs/devtools/storage/indexeddb/?utm_source=devtools

*/

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

app.use("/css", express.static(path.join(__dirname, "node_modules/bootstrap-v4-rtl/dist/css")));
app.use("/js", express.static(path.join(__dirname, "node_modules/bootstrap-v4-rtl/dist/js")));
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


//-----Show the feedback main screen-----
app.get('/', (req, res) => {
    try {
        let location = "default";
        let pageTitle = "رايك يهمنا";

        if('location' in req.query)
        {
            location = req.query.location;
            app.set('device_location', location);
        }
        else if(typeof(app.get('device_location')) !== "undefined")
        {
            location = app.get('device_location');
        }

        res.render('home', {location, pageTitle});
    }
    catch (e) {
        console.log(e);
        res.status(500).send("Internal error");
    }
});

app.get('/survey/:mood', (req, res) => {
    let mood = req.params.mood;
    let location = "default";
    try {
        if(typeof(app.get('device_location')) !== "undefined")
        {
            location = app.get('device_location');
        }

        let pageTitle = "ما الذي جعلك غير راض؟";

        if(mood === "happy")
        {
            pageTitle = "ما الذي جعلك راض؟";
        }
        
        res.render('survey', {location, mood, pageTitle});
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


app.get('/dashboard', async (req, res) => {
    try {
        const countHappy = await Feedback.countDocuments({"mood":"happy"});
        const countNeutral = await Feedback.countDocuments({"mood":"neutral"});
        const countSad = await Feedback.countDocuments({"mood":"sad"});

        res.render('dashboard', {countHappy, countNeutral, countSad});
    }
    catch (e) {
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



