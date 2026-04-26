// Henter og viser deteksjoner
function loadDetections() {
    fetch("/api/detections")
        .then(response => response.json()) // Endre svar fra flask til js
        .then(detections => {
            const container = document.getElementById("detections-table");
            if (!container) return;

            container.innerHTML = ""; // For å unngå duplikater

            const grouped = {}; // Objekt hvor alle deteksjoner med samme fish-id skal samles

            detections.forEach(d => { // Her beholdes kun nyeste måling for hver fisk
                if (!grouped[d.fish_id] || Number(d.ts) > Number(grouped[d.fish_id].ts)) {
                    grouped[d.fish_id] = d;
                }
            });

            // Sorter og ta 6 nyeste fisk
            Object.values(grouped)
                .sort((a, b) => Number(b.ts) - Number(a.ts))
                .slice(0, 6)
                .forEach(d => {

                    const row = document.createElement("div");
                    row.className = "detection-row";

                    let readableTime = d.ts;
                    if (!isNaN(Number(d.ts))) {
                        readableTime = new Date(Number(d.ts) * 1000).toLocaleString();
                    }

                    let bestSpecies = "Ukjent";
                    let bestConf = 0;

                    if (d.data) {
                        for (const [species, conf] of Object.entries(d.data)) {
                            if (conf > bestConf) {
                                bestConf = conf;
                                bestSpecies = species;
                            }
                        }
                    }

                    row.innerHTML = `
                        <img src="${d.image_url}" class="detection-img">

                        <div>
                            <p><strong>Fish ID:</strong> ${d.fish_id}</p>
                            <p><strong>Art:</strong> ${bestSpecies} ($(bestConf * 100).toFixed(1)}%)</p>
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