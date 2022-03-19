console.log("everywhere is up and running");

function changeLanguage(lang) {
  Cookies.set('language', lang, { path: '/' });
  if (lang == 'en') {
    document.getElementById("arabic-lang-btn").style.visibility = 'hidden';
  }
  else {
    document.getElementById("english-lang-btn").style.visibility = 'hidden';
  }
  location.reload();
}

(function() {
  if(window.localStorage)
    console.log("Local Storage Supported")
  else
    console.log("Local Storage Not Supported")
})();

// Detect offline/online mode in simple way.
// window.addEventListener('online',  updateOnlineStatus);
// window.addEventListener('offline', updateOnlineStatus);

// function updateOnlineStatus(event) {
//   console.log(`Are you online: ${navigator.onLine}`);
// }
