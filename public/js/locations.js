//If the user has not chosen a location after 10 seconds -> go back to home page
setTimeout(function () {
  Cookies.set('language', 'ar', { path: '/' });
    document.location.href = "/";
}, 10000);


//------------ Language stuff ----------------
const lang = Cookies.get('language');
document.getElementById("home_page_title").innerHTML = "اختر المكان";
document.getElementById("restaurant-loc").innerHTML = "المطعم";
document.getElementById("wc-loc").innerHTML = "الحمامات";
document.getElementById("slides-loc").innerHTML = "السحاسيل";
document.getElementById("bbq-loc").innerHTML = "منطقة الشواء";
document.getElementById("other-loc").innerHTML = "بدون تحديد مكان";
if (lang) {
    console.log("yeah there is a lang cookie: " + lang);
    if (lang == "en") {
        document.getElementById("home_page_title").innerHTML = "Please choose a location";
        document.getElementById("restaurant-loc").innerHTML = "Restaurant";
        document.getElementById("wc-loc").innerHTML = "WC";
        document.getElementById("slides-loc").innerHTML = "Slides";
        document.getElementById("bbq-loc").innerHTML = "BBQ area";
        document.getElementById("other-loc").innerHTML = "General";
    }
}
else {
}
//---------------------------------------
