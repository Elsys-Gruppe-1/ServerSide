const all_species = ["Pukkel laks", "Ørret", "Laks", "Røye", "Ingen fisk", "Ukjent fisk"]; //Liste med alle mulige arter

function getBestSpecies(detection) { //Skal velge arten det er størst sannsynlighet for
    let bestSpecies = "Ukjent"; //Dersom ingen art finnes, "Ukjent, 0%"
    let bestConf = 0;

    const speciesData = detection.data.Species_data; //Henter data som ligger inni data.Species_data

    for (const species of all_species) {
        const conf = speciesData[species]; //Sannsynlighet for den arten

        if (conf > bestConf) { //Sammenligner med tidligere deteksjoner av samme fish-id
            bestConf = conf;
            bestSpecies = species;
        }
    }

    return {bestSpecies, bestConf}; //Returnere arten med høyest sannsynlighet
}

function loadDetections() {
    fetch("/api/detections") //hente data fra Flask-route /api/detections
        .then(response => response.json()) //Endrer til js
        .then(detections => {
            const container = document.getElementById("detections-table"); //Hvor deteksjonen skla vises
            if (!container) return;

            container.innerHTML = ""; //Tømmer elementet

            const grouped = {}; //All deteksjoner med samme fish.id skal samles her

            detections.forEach(d => {
                const current = getBestSpecies(d);

                if (!grouped[d.fish_id]) {
                    grouped[d.fish_id] = d; //deteksjonen skal lagres dersom den ikke er allerede
                } else {
                    const saved = getBestSpecies(grouped[d.fish_id]);

                    if (current.bestConf > saved.bestConf) { //Den nye deteksjonen erstatter den gamle dersom sannsynligheten er høyere 
                        grouped[d.fish_id] = d;
                    }
                }
            });

            Object.values(grouped) //objekt endres til liste
                .sort((a, b) => Number(b.ts) - Number(a.ts)) //Sorterer list
                .slice(0, 6) //Antall vi vil vise på nettsiden
                .forEach(d => {
                    const row = document.createElement("div");
                    row.className = "detection-row"; //Knytter til css klasse

                    const best = getBestSpecies(d); //Skal skrive beste art til nettsiden. Derfor defineres her

                    let readableTime = d.ts;
                    if (!isNaN(Number(d.ts))) { //Gjør timestamo leselig
                        readableTime = new Date(Number(d.ts) * 1000).toLocaleString();
                    }
          
                    //Drt som skla vises per fisk på nettsiden
                    row.innerHTML = ` 
                        <img src="${d.image_url}" class="detection-img">

                        <div>
                            <p><strong>Fish ID:</strong> ${d.fish_id}</p>
                            <p><strong>Art:</strong> ${bestSpecies} (${(bestConf * 100).toFixed(1)}%)</p>
                            <p><strong>Tid:</strong> ${readableTime}</p>
                        </div>
                    `;

                    container.appendChild(row); //Legger rad til på nettsiden
                });
        })
        .catch(err => {
            console.error("Feil ved henting av detections:", err); //Feilmeldning
        });
}

document.addEventListener("DOMContentLoaded", loadDetections); //Kjører loadDetections() når HTML er ferdig lastet
