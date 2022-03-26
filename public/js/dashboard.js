let allData = [];
let allHappy;
let allNeutral;
let allSad;
let allRestaurant;
let allWc;
let allSlides;
let allBbq;
let allOther;
let hashTable;


const happySpan = document.getElementById("happyTotal");
const neutralSpan = document.getElementById("neutralTotal");
const sadSpan = document.getElementById("sadTotal");
const restaurantSpan = document.getElementById("restaurantTotal");
const wcSpan = document.getElementById("wcTotal");
const slidesSpan = document.getElementById("slidesTotal");
const bbqSpan = document.getElementById("bbqTotal");
const otherSpan = document.getElementById("otherTotal");
const filterSpan = document.getElementById("filterMsg");

const filterBtn = document.getElementById("filterBtn");

filterBtn.addEventListener('click', () => {
    const filterDate = document.getElementById("dateSelect");
    if (filterDate.value.length !== 0) {
        const filteredData = allData.filter((item) => {
            const itemTimestamp = item.timestamp.substr(0, 10);
            return itemTimestamp === filterDate.value;
        });
        if(filteredData.length === 0)
        {
            filterSpan.innerHTML = "لا يوجد بيانات في هذا التاريخ";
        }
        else
        {
            filterSpan.innerHTML = "";
        }

        fillTheData(filteredData);
    }
});

axios.get('/dashboard-hashtable', {
})
    .then(function (response) {
        hashTable = response.data;

        axios.get('/dashboard-all-data', {
        })
            .then(function (response) {
                allData = response.data;
                fillTheData(allData);
            })
            .catch(function (error) {
                console.log(error);
            });
    })
    .catch(function (error) {
        console.log(error);
    });



const fillTheData = (allData) => {
    allHappy = allData.filter((item) => {
        return item.mood === "happy";
    });
    allNeutral = allData.filter((item) => {
        return item.mood === "neutral";
    });
    allSad = allData.filter((item) => {
        return item.mood === "sad";
    });
    allRestaurant = allData.filter((item) => {
        return item.location === "restaurant";
    });
    allWc = allData.filter((item) => {
        return item.location === "wc";
    });
    allSlides = allData.filter((item) => {
        return item.location === "slides";
    });
    allBbq = allData.filter((item) => {
        return item.location === "bbq";
    });
    allOther = allData.filter((item) => {
        return item.location === "other";
    });

    happySpan.textContent = allHappy.length;
    neutralSpan.textContent = allNeutral.length;
    sadSpan.textContent = allSad.length;
    restaurantSpan.textContent = allRestaurant.length;
    wcSpan.textContent = allWc.length;
    slidesSpan.textContent = allSlides.length;
    bbqSpan.textContent = allBbq.length;
    otherSpan.textContent = allOther.length;



    let restaurantData = getAllAxes(allRestaurant);
    let wcData = getAllAxes(allWc);
    let slidesData = getAllAxes(allSlides);
    let bbqData = getAllAxes(allBbq);
    let otherData = getAllAxes(allOther);

    drawPieChart('moodsChart', ["سعيد", "متوسط", "حزين"], [allHappy.length, allNeutral.length, allSad.length]);
    drawColumnGraph('restaurantChart', restaurantData);
    drawColumnGraph('wcChart', wcData);
    drawColumnGraph('slidesChart', slidesData);
    drawColumnGraph('bbqChart', bbqData);
    drawColumnGraph('otherChart', otherData);
}

const getAllCheckboxes = (arrayOfObj) => {
    let allBoxes = arrayOfObj.map((item) => {
        return item.checkboxes;
    });
    //Spread them in one array:
    let allBoxesClean = [].concat.apply([], allBoxes);
    return allBoxesClean;
}

const getArabicBoxes = (boxesId) => {
    return boxesId.map((itemId) => {
        if (String(hashTable[itemId]) === "undefined") {
            return "غير ذلك";
        }
        return hashTable[itemId];
    });
}



const drawColumnGraph = (chartId, dataz) => {
    const ctx = document.getElementById(chartId).getContext('2d');

    let chartStatus = Chart.getChart(chartId);
    if (chartStatus != undefined) {
        chartStatus.destroy();
    }

    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            //labels: xAxis,
            datasets: [{
                label: 'عدد الاصوات',
                data: dataz,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

const drawPieChart = (chartId, labels, data) => {
    const ctx = document.getElementById(chartId).getContext('2d');
    let chartStatus = Chart.getChart(chartId);
    if (chartStatus != undefined) {
        chartStatus.destroy();
    }
    const myChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels,
            datasets: [{
                label: 'My First Dataset',
                data,
                backgroundColor: [
                    'rgb(102, 255, 102)',
                    'rgb(102, 255, 255)',
                    'rgb(255, 102, 140)'
                ],
                hoverOffset: 4
            }]
        }
    });
}


function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}


const getAllCounts = (array) => {
    const counts = {};
    for (const num of array) {
        counts[num] = counts[num] ? counts[num] + 1 : 1;
    }
    return counts;
}

const getAllAxes = (allStuff) => {

    let allBoxes = getAllCheckboxes(allStuff);
    let arabicBoxes = getArabicBoxes(allBoxes);
    let getCounts = getAllCounts(arabicBoxes);

    return getCounts;
}