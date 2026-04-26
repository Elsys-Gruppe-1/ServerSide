const all_species = ["Pukkel laks", "Ørret", "Laks", "Ingen fisk", "Ukjent fisk"];

function getBestSpecies(detection) {
    let bestSpecies = "Ukjent";
    let bestConf = 0;

    const speciesData = detection.data.Species_data;

    for (const [species, conf] of Object.entries(speciesData)) {
        if (conf > bestConf) {
            bestConf = conf;
            bestSpecies = species;
        }
    }

    return { bestSpecies, bestConf };
}

function loadDetections() {
    fetch("/api/detections")
        .then(response => response.json())
        .then(detections => {
            const container = document.getElementById("detections-table");
            if (!container) return;

            container.innerHTML = "";

            const grouped = {};

            detections.forEach(d => {
                const current = getBestSpecies(d);

                if (!grouped[d.fish_id]) {
                    grouped[d.fish_id] = d;
                } else {
                    const saved = getBestSpecies(grouped[d.fish_id]);

                    if (current.bestConf > saved.bestConf) {
                        grouped[d.fish_id] = d;
                    }
                }
            });

            Object.values(grouped)
                .sort((a, b) => Number(b.ts) - Number(a.ts))
                .slice(0, 6)
                .forEach(d => {
                    const row = document.createElement("div");
                    row.className = "detection-row";

                    const { bestSpecies, bestConf } = getBestSpecies(d);

                    let readableTime = d.ts;
                    if (!isNaN(Number(d.ts))) {
                        readableTime = new Date(Number(d.ts) * 1000).toLocaleString();
                    }

                    row.innerHTML = `
                        <img src="${d.image_url}" class="detection-img">

                        <div>
                            <p><strong>Fish ID:</strong> ${d.fish_id}</p>
                            <p><strong>Art:</strong> ${bestSpecies} (${(bestConf * 100).toFixed(1)}%)</p>
                            <p><strong>Tid:</strong> ${readableTime}</p>
                        </div>
                    `;

                    container.appendChild(row);
                });
        })
        .catch(err => {
            console.error("Feil ved henting av detections:", err);
        });
}

document.addEventListener("DOMContentLoaded", loadDetections);