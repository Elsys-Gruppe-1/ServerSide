
function splitBytime(data) {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 *1000);
    const oneWeekAgo = new Date(now.getTime()- 24 * 60 * 60 * 1000 * 7);

    const dayData = [];
    const weekData = [];

    for (let i = 0; i < data.length; i++) {
        let m = data[i];
        let tidspunkt = new Date(m.ts.replace(" ", "T"));

        if (tidspunkt >= oneDayAgo) {
            dayData.push(m);
        }
        if (tidspunkt >= oneWeekAgo) {
            weekData.push(m);
        }
    }

    return {
        day: dayData,
        week: weekData
    };
}

// TEMPERATUR

fetch("/api/data").then(response => response.json()).then(data => {
    const temperaturData = data.filter(m => m.sensor_name === "Temperatur");
    const timeSplit = splitBytime(temperaturData); //output timeSplit.day og timeSplit.week

    // Temperaturgraf for siste døgn
    const dayLabels = [];
    const dayValues = [];

    for (let i = 0; i < timeSplit.day.length; i++) {
        let m = timeSplit.day[i];
        dayLabels.push(new Date(m.ts.replace(" ", "T")).toLocaleTimeString());
        dayValues.push(m.sensor_value);
    }

    const temperaturDay = document.getElementById("temperaturDagChart");

    new Chart(temperaturDay, {
        type: "line",
        data: {
            labels: dayLabels,
            datasets: [{
                label: "Temperatur siste døgn",
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
                label: "Temperatur siste uke",
                data: weekValues
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    }); 
});



// STRØMNING

