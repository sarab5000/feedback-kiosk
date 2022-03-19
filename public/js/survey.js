//If the user is not finished with this survey after 60 seconds -> go back to home page
setTimeout(function () {
    Cookies.set('language', 'ar', { path: '/' });
    document.location.href = "/";
}, 60000);


//------------ Language stuff ----------------
const lang = Cookies.get('language');
document.getElementById("home_page_title").innerHTML = "ما الذي ربما لم يعجك؟";

if (lang) {
    console.log("yeah there is a lang cookie: " + lang);
    if (lang == "en") {
        document.getElementById("home_page_title").innerHTML = "What are the things you did NOT like";
        document.getElementById("cancel-btn").innerHTML = "Cancel";
    }
}
else {
}
//---------------------------------------


const ar_options = document.getElementById("ar-options");
const en_options = document.getElementById("en-options");

//Remove not compatibale language options:
if (lang) {
    console.log("yeah there is a lang cookie");
    if (lang == "en") {
        ar_options.remove();
    }
    else {
        en_options.remove();
    }
}
else {
    en_options.remove();
}


var currentTab = 0; // Current tab is set to be the first tab (0)
showTab(currentTab); // Display the current tab

function showTab(n) {
    // This function will display the specified tab of the form ...
    var x = document.getElementsByClassName("tab");
    x[n].style.display = "block";
    x[n].className += " d-flex flex-wrap";
    // ... and fix the Previous/Next buttons:
    if (n == 0) {
        document.getElementById("prevBtn").style.display = "none";
    } else {
        if (lang == "en") {
            document.getElementById("prevBtn").innerHTML = "Back";
        }
        document.getElementById("prevBtn").style.display = "inline";
    }
    if (n == (x.length - 1)) {
        document.getElementById("nextBtn").innerHTML = "إرسال";
        if (lang == "en") {
            document.getElementById("nextBtn").innerHTML = "Send";
        }
    } else {
        document.getElementById("nextBtn").innerHTML = "التالي";
        if (lang == "en") {
            document.getElementById("nextBtn").innerHTML = "Next";
        }
    }

}

function nextPrev(n) {
    // This function will figure out which tab to display
    var x = document.getElementsByClassName("tab");

    // if you have reached the end of the form... :
    if (currentTab + n >= x.length) {
        //...the form gets submitted:
        document.getElementById("feedbackForm").onclick = () => {
            console.log("hey man");
            $("#exampleModalCenter").modal({
                backdrop: 'static',
                keyboard: false
            });
            $("#exampleModalCenter").modal('show');
            setTimeout(function () {
                const tabletId = window.localStorage.getItem("tabletId");
                const tabletInputField = document.querySelector('#tabletid');
                tabletInputField.value = tabletId;
                Cookies.set('language', 'ar', { path: '/' });
                document.getElementById("feedbackForm").submit();
            }, 40000);
        }
        return false;
    }

    // Hide the current tab:
    x[currentTab].classList.remove("d-flex");
    x[currentTab].classList.remove("flex-wrap");
    x[currentTab].style.display = "none";

    // Increase or decrease the current tab by 1:
    currentTab = currentTab + n;

    // Otherwise, display the correct tab:
    showTab(currentTab);
}

function submitWithPhoneNumber() {
    console.log("with");
    const userPhone = document.querySelector('#user-phone');
    const phoneInputField = document.querySelector('#phoneid');
    phoneInputField.value = userPhone.value;

    const tabletId = window.localStorage.getItem("tabletId");
    const tabletInputField = document.querySelector('#tabletid');
    tabletInputField.value = tabletId;

    Cookies.set('language', 'ar', { path: '/' });
    sendDataToServer();
}

function submitWithoutPhoneNumber() {
    console.log("without");

    const tabletId = window.localStorage.getItem("tabletId");
    const tabletInputField = document.querySelector('#tabletid');
    tabletInputField.value = tabletId;

    Cookies.set('language', 'ar', { path: '/' });
    sendDataToServer();
}


function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function sendDataToServer() {
    const formPairs = $('#feedbackForm').serializeArray();
    let objToSend = {};
    formPairs.forEach((item) => {
        objToSend[item.name] = item.value;
    });

    console.log(objToSend);

    // send message to service worker via postMessage
    let msg = {
        'form_data': objToSend
    }
    navigator.serviceWorker.controller.postMessage(msg)  // <-This line right here sends our data to sw.js

    try{
        axios.post('/', objToSend)
        .then(function (response) {
            console.log(response);
            document.location.href = "/";
        })
        .catch(function (error) {
            console.log(error);
            document.location.href = "/#error";
        });
    }catch(e){
        document.location.href = "/";
    }
    
}