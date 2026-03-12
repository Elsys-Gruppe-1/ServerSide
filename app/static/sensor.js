
/*fetch("/api/data").then(response => response.json()).then(data => 
    {const temperaturData = data.filter(m => m.sensor_name === "Temperatur");

    const labels = [];
    const values = [];

    for (let i = 0; i < temperaturData.length; i++) {
        let m = temperaturData[i];
        labels.push(m.ts)
        values.push(m.sensor_value);
    }

    const temp = document.getElementById("temperaturChart");

    new Chart(temp, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Temperatur",
                data: values
            }]
        }
    });
    
    }); */


alert("sensor.js kjører");

const labels = ["13:00", "13:10", "13:20", "13:30"];
const values = [22.1, 22.3, 22.2, 22.4];

const temp = document.getElementById("temperaturChart");

new Chart(temp, {
    type: "line",
    data: {
        labels: labels,
        datasets: [{
            label: "Temperatur",
            data: values
        }]
    }
});