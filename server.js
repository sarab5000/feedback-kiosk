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
    "wc": [{ "en-text": "Hygiene", "ar-text": "النظافة", "id": "wc1" }, { "en-text": "lighting", "ar-text": "الاضاءة", "id": "wc2" }, { "en-text": "Services", "ar-text": "الخدمات", "id": "wc3" }, { "en-text": "Dicoration", "ar-text": "الديكور", "id": "wc4" }],
    "bbq": [{ "en-text": "Hygiene", "ar-text": "النظافة", "id": "bbq1" }, { "en-text": "No areas with shades", "ar-text": "عدم وجود اماكن مظللة", "id": "bbq2" }, { "en-text": "Sitting places and tables", "ar-text": "اماكن الجلوس والطاولات", "id": "bbq3" }, { "en-text": "Not a family friendly enviroment", "ar-text": "الاجواء غير عائلية", "id": "bbq4" }],
    "restaurant": [{ "ar-text": "النظافة", "id": "res1" }, { "ar-text": "موظفين غير ودودين", "id": "res2" }, { "ar-text": "قائمة الطعام", "id": "res3" }, { "ar-text": "الديكور", "id": "res4" }],
    "slides": [{ "ar-text": "تجربة غير آمنة", "id": "slides1" }, { "ar-text": "غير ممتعة", "id": "slides2" }, { "ar-text": "موظفين غير ودودين", "id": "slides3" }],
    "other": [{  "en-text": "Hygiene", "ar-text": "النظافة", "id": "other1" }, {  "en-text": "Mean employees", "ar-text": "موظفين غير ودودين", "id": "other2" }, {  "en-text": "other3", "ar-text": "شيء3", "id": "other3" }, {  "en-text": "other4", "ar-text": "شيء4", "id": "other4" }, {  "en-text": "other5", "ar-text": "شيء5", "id": "other5" }]
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
        let phone = data.phone;
        delete data.phone;
        let items = Object.keys(data);

        const entry = {
            timestamp: new Date(),
            mood,
            location,
            phone,
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
        
        const restNeutral = await findTotals("neutral", "restaurant");
        const wcNeutral = await findTotals("neutral", "wc");
        const slidesNeutral = await findTotals("neutral", "slides");
        const bbqNeutral = await findTotals("neutral", "bbq");


        const restSad = await findTotals("sad", "restaurant");
        const wcSad = await findTotals("sad", "wc");
        const slidesSad = await findTotals("sad", "slides");
        const bbqSad = await findTotals("sad", "bbq");

        const statsObj = {
            restNeutral,
            wcNeutral,
            slidesNeutral,
            bbqNeutral,
            restSad,
            wcSad,
            slidesSad,
            bbqSad
        }

        res.render('dashboard', { hashTable, countHappy, countNeutral, countSad , statsObj});
    }
    catch (e) {
        console.log(e);
        res.status(500).send("Internal error");
    }
});

//dashboard.js should call this API, and it should return all relevant data
app.get('getDashboardData', (req, res)=>{
    
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

