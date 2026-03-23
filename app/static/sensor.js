
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


function splitByDepth(data) {
    const result = {}

    for (let i = 0; i < data.length; i++) {
        const m = data[i];
        const dyb = Number(m.depth); //Number i tilfelle dybde kommer som en string

        //Dersom dybden er 0.35, 0.5, eller 0.75 skal måleverdien legges i listen resultat
        if (dyb === 0.25 || dyb === 0.5 || dyb === 0.75) {
            
            if (!result[dyb]) {
                result[dyb] =[];
            }

            result[dyb].push(m);
        }
    }
    return result; // Skal returnere {0.25: [{},{}], 0.5: [], 0.75: []}
}



// Simple Moving Average (SMA) N: antall målinger per gjennomsnitt
function simpleMovingAverage(values, N) {
    const newValues = [];

    for (let i = 0; i <= values.length - N; i++) {
        let sum = 0;

        for (let j = 0; j < N; j++) {
            sum += values[i+j];
        }

        let average = sum / N;
        newValues.push(average);
    }
    return newValues;
}

// TEMPERATUR

fetch("/api/data").then(response => response.json()).then(data => {
    const temperaturData = data.filter(m => m.sensor_name === "Temperatur");
    const timeSplit = splitBytime(temperaturData); //output timeSplit.day og timeSplit.week
    const dayDepthSplit = splitByDepth(timeSplit.day);
    const weekDepthSplit = splitByDepth(timeSplit.week);


    // Temperaturgraf for siste døgn
    const dayLabels = [];
    const dayDataset = [];

    let dayMeasurement = [];
    if (dayDepthSplit[0.25]) {
        dayMeasurement = dayDepthSplit[0.25];
    } else if (dayDepthSplit[0.5]) {
        dayMeasurement = dayDepthSplit[0.5];
    } else if (dayDepthSplit[0.75]) {
        dayMeasurement = dayDepthSplit[0.75];
    }

    // Løkke som endrer formatering av timestamp
    for (let i = 0; i < dayMeasurement.length; i++) {
        dayLabels.push(new Date(dayMeasurement[i].ts.replace(" ", "T")).toLocaleTimeString());
    }


    //Løkke som fordeler data i ulike datasets basert på dybde
    for (const dyb in dayDepthSplit) {
        const measurement = dayDepthSplit[dyb];

        let color = "DeepPink"
        if (dyb == 0.5) {color = "Crimson"}
        if (dyb == 0.75) {color = "DarkRed"}

        dayDataset.push({
            label: "Dybde " + dyb,
            data: simpleMovingAverage(measurement.map(objekt => objekt.sensor_value), 5),

            borderColor: color,
            backgroundColor: color
        });
    }

    const temperaturDag = document.getElementById("temperaturDagChart");

    new Chart(temperaturDag, {
        type: "line",
        data: {
            labels: dayLabels,
            datasets: dayDataset
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
    }
    });

    // Temperaturgraf for siste uke
    const weekLabels = [];
    const weekDataset = [];

    let weekMeasurement = [];
    if (weekDepthSplit[0.25]) {
        weekMeasurement = weekDepthSplit[0.25];
    } else if (weekDepthSplit[0.5]) {
        weekMeasurement = weekDepthSplit[0.5];
    } else if (weekDepthSplit[0.75]) {
        weekMeasurement = weekDepthSplit[0.75];
    }

    // Løkke som endrer formatering av timestamp
    for (let i = 0; i < weekMeasurement.length; i++) {
        let m = weekMeasurement[i];
        weekLabels.push(new Date(m.ts.replace(" ", "T")).toLocaleTimeString());
    }

    //Løkke som fordeler data i ulike datasets basert på dybde
    for (const dyb in weekDepthSplit) {
        const measurement = weekDepthSplit[dyb];

        let color = "DeepPink"
        if (dyb == 0.5) {color = "Crimson"}
        if (dyb == 0.75) {color = "DarkRed"}
    
        weekDataset.push({
            label: "Dybde " + dyb,
            data: simpleMovingAverage(measurement.map(objekt => objekt.sensor_value), 20),

            borderColor: color,
            backgroundColor: color
        });
    }



    const temperaturUke = document.getElementById("temperaturUkeChart");
    
    new Chart(temperaturUke, {
        type: "line",
        data: {
            labels: weekLabels,
            datasets: weekDataset
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
    const timeSplit = splitBytime(tdsData); //output timeSplit.day og timeSplit.week
    const dayDepthSplit = splitByDepth(timeSplit.day);
    const weekDepthSplit = splitByDepth(timeSplit.week);

    // TDSgraf for siste døgn
    const dayLabels = [];
    const dayDataset = [];

    let dayMeasurement = [];
    if (dayDepthSplit[0.25]) {
        dayMeasurement = dayDepthSplit[0.25];
    } else if (dayDepthSplit[0.5]) {
        dayMeasurement = dayDepthSplit[0.5];
    } else if (dayDepthSplit[0.75]) {
        dayMeasurement = dayDepthSplit[0.75];
    }

    for (let i = 0; i < dayMeasurement.length; i++) {
        let m = dayMeasurement[i];
        dayLabels.push(new Date(m.ts.replace(" ", "T")).toLocaleTimeString());
    }

    for (const dyb in dayDepthSplit) {
        const measurement = dayDepthSplit[dyb];

        let color = "DeepPink"
        if (dyb == 0.5) {color = "Crimson"}
        if (dyb == 0.75) {color = "DarkRed"}

        dayDataset.push({
            label: "Dybde " + dyb,
            data: simpleMovingAverage(measurement.map(objekt => objekt.sensor_value), 5),

            borderColor: color,
            backgroundColor: color
        });
    }

    const tdsDag = document.getElementById("tdsDagChart");

    new Chart(tdsDag, {
        type: "line",
        data: {
            labels: dayLabels,
            datasets: dayDataset
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
    }
    });

    // TDSgraf for siste uke
    const weekLabels = [];
    const weekDataset = [];

    let weekMeasurement = [];
    if (weekDepthSplit[0.25]) {
        weekMeasurement = weekDepthSplit[0.25];
    } else if (weekDepthSplit[0.5]) {
        weekMeasurement = weekDepthSplit[0.5];
    } else if (weekDepthSplit[0.75]) {
        weekMeasurement = weekDepthSplit[0.75];
    }

    //Bruker nå den første målingen i grafen, bør endres til midt måling
    for (let i = 0; i < weekMeasurement.length - 20; i++) {
        weekLabels.push(weekMeasurement[i].ts);
    }

    for (const dyb in weekDepthSplit) {
        const measurement = weekDepthSplit[dyb];

        let color = "DeepPink"
        if (dyb == 0.5) {color = "Crimson"}
        if (dyb == 0.75) {color = "DarkRed"}

        weekDataset.push({
            label: "Dybde " + dyb,
            data: simpleMovingAverage(measurement.map(objekt => objekt.sensor_value), 20),

            borderColor: color,
            backgroundColor: color
        });
    }

    const tdsUke = document.getElementById("tdsUkeChart");
    
    new Chart(tdsUke, {
        type: "line",
        data: {
            labels: weekLabels,
            datasets: weekDataset
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    }); 
});

/*

//TURBIDITET

fetch("/api/data").then(response => response.json()).then(data => {
    const turbiditetData = data.filter(m => m.sensor_name === "Turbiditet");
    const timeSplit = splitBytime(turbiditetData); //output timeSplit.day og timeSplit.week

    alert("Turbiditet-blokka kjører");

    // Turbiditetgraf for siste døgn
    const dayLabels = [];
    const dayValues = [];

    for (let i = 0; i < timeSplit.day.length; i++) {
        let m = timeSplit.day[i];
        dayLabels.push(new Date(m.ts.replace(" ", "T")).toLocaleTimeString());
        dayValues.push(m.sensor_value);
    }

    const turbiditetDag = document.getElementById("turbiditetDagChart");

    new Chart(turbiditetDag, {
        type: "line",
        data: {
            labels: dayLabels,
            datasets: [{
                label: "Turbiditet siste døgn",
                data: dayValues
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
    }
    });

    // Turbiditetgraf for siste uke
    const weekLabels = [];
    const weekValues = [];

    for (let i = 0; i < timeSplit.week.length; i++) {
        let m = timeSplit.week[i];
        weekLabels.push(m.ts);
        weekValues.push(m.sensor_value);
    }

    const turbiditetUke = document.getElementById("turbiditetUkeChart");
    
    new Chart(turbiditetUke, {
        type: "line",
        data: {
            labels: weekLabels,
            datasets: [{
                label: "Turbiditet siste uke",
                data: weekValues
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    }); 
});

*/