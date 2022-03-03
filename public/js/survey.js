//If the user is not finished with this survey after 60 seconds -> go back to home page
setTimeout(function () {
    document.location.href="/";
}, 60000);


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
        document.getElementById("prevBtn").style.display = "inline";
    }
    if (n == (x.length - 1)) {
        document.getElementById("nextBtn").innerHTML = "إرسال";
    } else {
        document.getElementById("nextBtn").innerHTML = "التالي";
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

function submitWithPhoneNumber()
{
    console.log("with");
    const userPhone = document.querySelector('#user-phone');
    const phoneInputField = document.querySelector('#phoneid');
    phoneInputField.value = userPhone.value;
    document.getElementById("feedbackForm").submit();

}

function submitWithoutPhoneNumber()
{
    console.log("without");
    document.getElementById("feedbackForm").submit();
}
