//If the user has not chosen a location after 10 seconds -> go back to home page
setTimeout(function () {
    document.location.href="/";
}, 10000);