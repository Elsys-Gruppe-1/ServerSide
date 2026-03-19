
alert("sensor.js lastet");
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

    const temperaturDag = document.getElementById("temperaturDagChart");

    new Chart(temperaturDag, {
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

    const temperaturUke = document.getElementById("temperaturUkeChart");
    
    new Chart(temperaturUke, {
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


// TDS

fetch("/api/data").then(response => response.json()).then(data => {
    const tdsData = data.filter(m => m.sensor_name === "TDS");
    alert("Før splitByTime")
    const timeSplit = splitBytime(tdsData); //output timeSplit.day og timeSplit.week
    alert("etter splitBytime");

    // TDSgraf for siste døgn
    const dayLabels = [];
    const dayValues = [];

    for (let i = 0; i < timeSplit.day.length; i++) {
        let m = timeSplit.day[i];
        dayLabels.push(new Date(m.ts.replace(" ", "T")).toLocaleTimeString());
        dayValues.push(m.sensor_value);
    }

    const tdsDag = document.getElementById("tdsDagChart");
    alert(document.getElementById("tdsDagChart"));

    new Chart(tdsDag, {
        type: "line",
        data: {
            labels: dayLabels,
            datasets: [{
                label: "TDS siste døgn",
                data: dayValues
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
    }
    });

    // TDSgraf for siste uke
    const weekLabels = [];
    const weekValues = [];

    for (let i = 0; i < timeSplit.week.length; i++) {
        let m = timeSplit.week[i];
        weekLabels.push(m.ts);
        weekValues.push(m.sensor_value);
    }

    const tdsUke = document.getElementById("tdsUkeChart");
    alert(document.getElementById("tdsUkeChart"));
    
    new Chart(tdsUke, {
        type: "line",
        data: {
            labels: weekLabels,
            datasets: [{
                label: "TDS siste uke",
                data: weekValues
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    }); 
});