
fetch("/api/data").then(response => response.json()).then(data => 
    {const temperaturData = data.filter(m => m.sensor_name === "Temperatur");

    const labels = [];
    const values = [];

    for (let i = 0; i < temperaturData.length; i++) {
        let m = temperaturData[i];
        labels.push(i.ts)
        values.push(i.sensor_value);
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
    
    });
