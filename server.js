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

const optionsDB = {
    "wc": [{ "text": "النظافة", "id": "wc1" }, { "text": "الاضاءة", "id": "wc2" }, { "text": "الخدمات", "id": "wc3" }, { "text": "الديكور", "id": "wc4" }, { "text": "text-wc5", "id": "wc5" }, { "text": "text-wc6", "id": "wc6" }, { "text": "text-wc7", "id": "wc7" }],
    "bbq": [{ "text": "النظافة", "id": "bbq1" }, { "text": "وجود اماكن مظللة", "id": "bbq2" }, { "text": "اماكن الجلوس والطاولات", "id": "bbq3" }, { "text": "الاجواء العائلية", "id": "bbq4" }],
    "restaurant": [{ "text": "النظافة", "id": "res1" }, { "text": "موظفين ودودين", "id": "res2" }, { "text": "قائمة الطعام", "id": "res3" }, { "text": "الديكور", "id": "res4" }],
    "slides": [{ "text": "تجربة آمنة", "id": "slides1" }, { "text": "ممتعة", "id": "slides2" }, { "text": "موظفين ودودين", "id": "slides3" }],
    "other": [{ "text": "النظافة", "id": "other1" }, { "text": "موظفين ودودين", "id": "other2" }, { "text": "النظافة", "id": "other3" }, { "text": "النظافة", "id": "other4" }, { "text": "النظافة", "id": "other5" }, { "text": "النظافة", "id": "other6" }, { "text": "النظافة", "id": "other7" }, { "text": "النظافة", "id": "other8" }, { "text": "النظافة", "id": "other9" }, { "text": "النظافة", "id": "other10" }]
}

let hashTable = {};
let locs = Object.keys(optionsDB);
locs.forEach((loc) => {
    optionsDB[loc].forEach((obj) => {
        hashTable[obj["id"]] = obj["text"];
    });
});

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

        if ('location' in req.query) {
            location = req.query.location;
            app.set('device_location', location);
        }
        else if (typeof (app.get('device_location')) !== "undefined") {
            location = app.get('device_location');
        }

        res.render('home', { location, pageTitle });
    }
    catch (e) {
        console.log(e);
        res.status(500).send("Internal error");
    }
});

app.get('/survey/:mood', (req, res) => {
    let mood = req.params.mood;
    try {
        let location = "def";
        let pageTitle = "اختر المكان";
        if (mood !== "happy") {
            res.render("locations", { location, pageTitle, mood });
        }
        else {
            res.redirect('/');
        }

    }
    catch (e) {
        console.log(e);
        res.status(500).send("Internal error");
    }
});

app.get('/survey/:mood/:loc', (req, res) => {
    try {
        let mood = req.params.mood;
        let location = req.params.loc;

        console.log(`you are ${mood} about ${location}`);

        let pageTitle = "ما الذي جعلك غير راض؟";
        if (mood === "happy") {
            pageTitle = "ما الذي جعلك راض؟";
        }
        if (mood === "neutral") {
            pageTitle = "ما الذي ربما جعلك غير راض؟";
        }

        let options = optionsDB[location];
        res.render("survey", { location, pageTitle, mood, options });
    }
    catch (e) {
        console.log(e);
        res.status(500).send("Internal error");
    }
});

app.post('/', async (req, res) => {
    try {
        let data = req.body;
        console.log(data);
        let mood = data.mood;
        delete data.mood; //delete the fname field
        let location = data.location;
        delete data.location;
        let items = Object.keys(data);

        const entry = {
            timestamp: new Date(),
            mood,
            location,
            checkboxes: items
        }
        console.log(entry);
        let newfeedback = new Feedback(entry);
        let saveToDbResult = await newfeedback.save();

        console.log(saveToDbResult);
        res.redirect('/');
    }
    catch (e) {
        console.log(e);
        res.status(500).send("Internal error");
    }
});


app.get('/dashboard', async (req, res) => {
    try {
        const countHappy = await Feedback.countDocuments({ "mood": "happy" });
        const countNeutral = await Feedback.countDocuments({ "mood": "neutral" });
        const countSad = await Feedback.countDocuments({ "mood": "sad" });
        const wcNeutral = await findTotals("neutral", "wc");
        const wcSad = await findTotals("sad", "wc");

        res.render('dashboard', { hashTable, countHappy, countNeutral, countSad , wcNeutral, wcSad});
    }
    catch (e) {
        console.log(e);
        res.status(500).send("Internal error");
    }
});


//This guy counts all accourances of items in optionsDB
app.get('/counteach', async (req, res) => {
    try {
        let wcNeutral = await findTotals("neutral", "wc");
        let wcSad = await findTotals("sad", "wc");

        res.send([wcNeutral, wcSad]);
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

const findTotals = async (mood, location) => {
    let config = [
        { $match: { $and: [{ "mood": mood }, { "location": location }] } },
        { $unwind: '$checkboxes' },
        { $group: { _id: { 'item': '$checkboxes' }, 'count': { $sum: 1 } } }
    ];

    let result = await Feedback.aggregate(config);

    return result;
}

