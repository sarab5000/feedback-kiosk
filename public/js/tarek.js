console.log("tarek is working");

let safeToClick = true;

if (!navigator.onLine) {
  const statusElem = document.querySelector('.page-status')
  statusElem.innerHTML = 'offline'
}

const happyBtn = document.querySelector('#happyFace');

happyBtn.addEventListener('click', (event) => {
  if (safeToClick) {
    safeToClick = false;
    event.target.classList.add('box', 'bounce-5');
    setTimeout(() => {
      event.target.classList.remove('box', 'bounce-5');
      safeToClick = true;
    }, 3000);

  }
});

// const happyBtn = document.querySelector('#happy');
// const sadBtn = document.querySelector('#sad');
// const neutralBtn = document.querySelector('#neutral');

// const locationTxt = document.querySelector('#device_location');

// happyBtn.addEventListener('click', async () => {
//     await SaveFeedbackAPI("happy");
// });

// sadBtn.addEventListener('click', async () => {
//     await SaveFeedbackAPI("sad");
// });

// neutralBtn.addEventListener('click', async () => {
//     await SaveFeedbackAPI("neutral");
// });



// const SaveFeedbackAPI = async (mood) => {
//     console.log(mood);
//     console.log(locationTxt.value);

//     let utcDate = new Date();
//     let niceDate = utcDate.toLocaleString('en-GB');

//     const feedbackObj = {
//         timestamp: utcDate,
//         timestamp_local: niceDate,
//         mood: mood,
//         location: locationTxt.value
//     };

//     // Call data storage API and store happy, UTC timestamp and local timestamp
//     await axios.post('/', feedbackObj).catch(function (error) {
//         if (error.response) {
//             console.log(error.response.data);
//             console.log(error.response.status);
//             console.log(error.response.headers);
//         }
//     });

// }