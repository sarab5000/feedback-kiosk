console.log("home script is working");

const tabletId = window.localStorage.getItem("tabletId");
console.log("Hi, the tablet id is: " + tabletId);

//Language stuff:
const lang = Cookies.get('language');
document.getElementById("home_page_title").innerHTML = "رايك يهمنا - كيف كانت تجربتك؟";
if (lang) {
  console.log("yeah there is a lang cookie: " + lang);
  if (lang == "en") {
    document.getElementById("home_page_title").innerHTML = "Your Opinion Matters";
  }
}
else {
  lang = "ar";
}


//Run this after the page is fully loaded:
// window.onload = () => {
//   if (!navigator.onLine) {
//     const statusElem = document.getElementById("page-status");
//     statusElem.innerHTML = 'offline'
//   }
// }

//To prevent spamming the emojis with repeated clicks
let safeToClick = true;

const happyBtn = document.querySelector('#happyFace');

if (happyBtn != null) {
  happyBtn.addEventListener('click', (event) => {
    if (safeToClick) {
      safeToClick = false;
      event.target.classList.add('box', 'bounce-5');

      let dataToSend = {
        timestamp: new Date(),
        mood: 'happy',
        location: 'overall',
        tabletId: tabletId
      }

      // send message to service worker via postMessage
      let msg = {
        'form_data': dataToSend
      }

      try{
        navigator.serviceWorker.controller.postMessage(msg)  // <-This line right here sends our data to sw.js
      }
      catch(e){
        
      }
      

      axios.post('/', dataToSend)
        .then(function (response) {
          console.log(response);
        })
        .catch(function (error) {
          console.log(error);
        });

      setTimeout(() => {
        console.log("Now it is safe to click");
        event.target.classList.remove('box', 'bounce-5');
        safeToClick = true;
      }, 2000);

    }
  });

}


document.addEventListener("click", handler, true);

function handler(e) {
  if (!safeToClick) {
    e.stopPropagation();
    e.preventDefault();
  }
}


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
