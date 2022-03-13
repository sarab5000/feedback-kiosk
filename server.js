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

// To easily convert it to CSV: https://www.convertcsv.com/json-to-csv.htm
const optionsDB = {
    "wc": [{ "en-text": "Hygiene", "ar-text": "النظافة", "id": "wc1" }, { "en-text": "Employees are not friendly", "ar-text": "موظفين غير ودودين", "id": "wc2" }, { "en-text": "Problems with the toilets (shattaf/flush/sink)", "ar-text": "مشكلة بالادوات الصحية (السيفون/الشطافة/المغاسل)", "id": "wc3" }, { "en-text": "lighting", "ar-text": "الاضاءة", "id": "wc4" }, { "en-text": "Services", "ar-text": "الخدمات", "id": "wc5" }, { "en-text": "Decoration", "ar-text": "الديكور", "id": "wc6" }, { "en-text": "Other things", "ar-text": "غير ذلك", "id": "wc99" }],
    "bbq": [{ "en-text": "Hygiene", "ar-text": "النظافة", "id": "bbq1" }, { "en-text": "Employees are not friendly", "ar-text": "موظفين غير ودودين", "id": "bbq2" }, { "en-text": "No shaded places", "ar-text": "عدم وجود اماكن مظللة", "id": "bbq3" }, { "en-text": "Sitting places and tables", "ar-text": "اماكن الجلوس والطاولات", "id": "bbq4" }, { "en-text": "Not a family friendly enviroment", "ar-text": "الاجواء غير عائلية", "id": "bbq5" }, { "en-text": "Other things", "ar-text": "غير ذلك", "id": "bbq99" }],
    "restaurant": [{ "en-text": "Hygiene", "ar-text": "النظافة", "id": "res1" }, { "en-text": "Employees are not friendly", "ar-text": "موظفين غير ودودين", "id": "res2" }, { "en-text": "The food menu", "ar-text": "قائمة الطعام", "id": "res3" }, { "en-text": "The decoration", "ar-text": "الديكور", "id": "res4" }, { "en-text": "Not enough food/drinks options", "ar-text": "عدم وجود خيارات طعام/شراب كافية", "id": "res6" }, { "en-text": "Other things", "ar-text": "غير ذلك", "id": "res99" }],
    "slides": [{ "en-text": "Hygiene", "ar-text": "النظافة", "id": "slides1" }, { "en-text": "Employees are not friendly", "ar-text": "موظفين غير ودودين", "id": "slides2" }, { "en-text": "Not safe", "ar-text": "تجربة غير آمنة", "id": "slides3" }, { "en-text": "Not fun", "ar-text": "غير ممتعة", "id": "slides4" }, { "en-text": "Other things", "ar-text": "غير ذلك", "id": "slides99" }],
    "other": [{ "en-text": "Hygiene", "ar-text": "النظافة", "id": "other1" }, { "en-text": "Employees are not friendly", "ar-text": "موظفين غير ودودين", "id": "other2" }, { "en-text": "Not safe", "ar-text": "المكان غير آمن", "id": "other3" }, { "en-text": "Not fun", "ar-text": "المكان غير ممتع", "id": "other4" }, { "en-text": "Expensive", "ar-text": "الاسعار غير معقولة", "id": "other5" }, { "en-text": "Food", "ar-text": "الطعام", "id": "other6" }, { "en-text": "No shaded places", "ar-text": "عدم وجود اماكن مظللة", "id": "other7" }, { "en-text": "Other things", "ar-text": "غير ذلك", "id": "other99" }]
}

let hashTable = {};
let locs = Object.keys(optionsDB);
locs.forEach((loc) => {
    optionsDB[loc].forEach((obj) => {
        hashTable[obj["id"]] = obj["ar-text"];
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
        let tabletId = req.query.tabletId;
        if (typeof tabletId === "undefined") {
            tabletId = "unknown";
        }
        console.log(`tablet ID is ${tabletId}`);
        let pageTitle = "رايك يهمنا";
        res.render('home', { pageTitle, tabletId });
    }
    catch (e) {
        console.log(e);
        res.status(500).send("Internal error");
    }
});

app.get('/survey/:mood', (req, res) => {
    let mood = req.params.mood;
    try {
        let pageTitle = "اختر المكان";
        if (mood !== "happy") {
            res.render("locations", { pageTitle, mood });
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
        let tabletId = data.tabletId;
        delete data.tabletId;
        let items = Object.keys(data);

        const entry = {
            timestamp: new Date(),
            mood,
            location,
            phone,
            tabletId,
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


// app.get('/dashboard', async (req, res) => {
//     try {
//         const countHappy = await Feedback.countDocuments({ "mood": "happy" });
//         const countNeutral = await Feedback.countDocuments({ "mood": "neutral" });
//         const countSad = await Feedback.countDocuments({ "mood": "sad" });

//         const restNeutral = await findTotals("neutral", "restaurant");
//         const wcNeutral = await findTotals("neutral", "wc");
//         const slidesNeutral = await findTotals("neutral", "slides");
//         const bbqNeutral = await findTotals("neutral", "bbq");


//         const restSad = await findTotals("sad", "restaurant");
//         const wcSad = await findTotals("sad", "wc");
//         const slidesSad = await findTotals("sad", "slides");
//         const bbqSad = await findTotals("sad", "bbq");

//         const statsObj = {
//             restNeutral,
//             wcNeutral,
//             slidesNeutral,
//             bbqNeutral,
//             restSad,
//             wcSad,
//             slidesSad,
//             bbqSad
//         }

//         res.render('dashboard', { hashTable, countHappy, countNeutral, countSad , statsObj});
//     }
//     catch (e) {
//         console.log(e);
//         res.status(500).send("Internal error");
//     }
// });



//dashboard.js should call this API, and it should return all relevant data
app.get('/dashboard', async (req, res) => {
    try {
        res.render('dashboard');
    }
    catch (e) {
        console.log(e);
        res.status(500).send("Internal error");
    }
});

app.get('/dashboard-all-data', async (req, res) => {
    try {
        const allData = await Feedback.find({});
        res.send(allData);
    }
    catch (e) {
        console.log(e);
        res.status(500).send("Internal error");
    }

});

app.get('/dashboard-hashtable', (req, res) => {
    try {
        res.send(hashTable);
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

app.get('/deleteall', async (req, res) => {
    let result = await Feedback.remove({
        "timestamp": {
            $lt: new Date("2022-03-10T01:00:00.000Z")
        }
    })
    res.send(result);
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

