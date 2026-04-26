function loadDetections() {
    fetch("/api/detections")
        .then(response => response.json())
        .then(detections => {
            const container = document.getElementById("detections-table");
            if (!container) return;

            container.innerHTML = "";

            // Gruppér på fish_id (nyeste per fisk)
            const grouped = {};

            detections.forEach(d => {
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

                    row.innerHTML = `
                        <img src="${d.image_url}" class="detection-img">

                        <div>
                            <p><strong>Fish ID:</strong> ${d.fish_id}</p>
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