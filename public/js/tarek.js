console.log("tarek is working");

const happyBtn = document.querySelector('#happy');
const sadBtn = document.querySelector('#sad');
const neutralBtn = document.querySelector('#neutral');

happyBtn.addEventListener('click', async () => {
    await SaveFeedbackAPI("happy");
});

sadBtn.addEventListener('click', async () => {
    await SaveFeedbackAPI("sad");
});

neutralBtn.addEventListener('click', async () => {
    await SaveFeedbackAPI("neutral");
});



const SaveFeedbackAPI = async (mood) => {
    console.log(mood);

    let utcDate = new Date();
    let niceDate = utcDate.toLocaleString('en-GB');

    // Call data storage API and store happy, UTC timestamp and local timestamp
    await axios.post('/', {
        timestamp: utcDate,
        timestamp_local: niceDate,
        mood: mood
    }).catch(function (error) {
        if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
        }
    });

}