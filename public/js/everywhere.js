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