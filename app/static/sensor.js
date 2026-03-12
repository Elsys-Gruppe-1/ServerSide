
function splitBytime(data) {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 *1000);
    const oneWeekAgo = new Date(now.getTime()- 24 * 60 * 60 * 1000 * 7);

    const dayData = [];
    const weekData = [];

    for (let i = 0; 1 < data.length; i++) {
        let m = data[i];
        let tidspunkt = new Date(m.ts.replace(" ", "T"));

        if (tidspunkt >= oneDayAgo) {
            dayData.push(m);
        }
        if (tidspunkt <= oneWeekAgo) {
            weekData.push(m);
        }
    }

    return {
        day: dayData,
        week: weekData
    };
}


fetch("/api/data").then(response => response.json()).then(data => {const temperaturData = data.filter(m => m.sensor_name === "Temperatur");
    const timeSplit = splitBytime(temperaturData); //output timeSplit.day og timeSplit.week

    // Temperaturgraf for siste døgn
    const dayLabels = [];
    const dayValues = [];

    for (let i = 0; i < timeSplit.day.length; i++) {
        let m = timeSplit.day[i];
        dayLabels.push(m.ts)
        dayValues.push(m.sensor_value);
    }

    const temperaturDay = document.getElementById("temperaturDagChart");

    new Chart(temperaturDay, {
        type: "line",
        data: {
            labels: dayLabels,
            datasets: [{
                label: "Temperatur",
                data: dayValues
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
    }
    });

    // Temperaturgraf for siste uke
    const weekLabels = [];
    const weekValues = [];

    for (let i = 0; i < timeSplit.week.length; i++) {
        let m = timeSplit.week[i];
        weekLabels.push(m.ts);
        weekValues.push(m.sensor_value);
    }

    const temperaturWeek = document.getElementById("temperaturUkeChart");
    
    new Chart(temperaturWeek, {
        type: "line",
        data: {
            labels: weekLabels,
            datasets: [{
                label: "Temperatur",
                data: weekValues
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
    }
    }); 
*/


const labels = ["13:00", "13:10", "13:20", "13:30"];
const values = [22.1, 22.3, 22.2, 22.4];

const temp = document.getElementById("temperaturDagChart");

new Chart(temp, {
    type: "line",
    data: {
        labels: labels,
        datasets: [{
            label: "Temperatur",
            data: values
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false
    }
});
