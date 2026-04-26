function loadDetections() {
    fetch("/api/detections")
        .then(response => response.json())
        .then(detections => {
            const container = document.getElementById("detections-table");
            if (!container) return;

            container.innerHTML = "";

            detections.forEach(d => {
                const row = document.createElement("div");
                row.className = "detection-row";

                // Prøv å lage riktig bilde-path
                let imgSrc = d.image_path;

                if (!imgSrc.startsWith("/")) {
                    // prøv vanlig static-path
                    imgSrc = "/static/" + imgSrc;
                }

                // gjør timestamp lesbart
                let readableTime = d.ts;
                if (!isNaN(d.ts)) {
                    const date = new Date(d.ts * 1000);
                    readableTime = date.toLocaleString();
                }

                row.innerHTML = `
                    <img src="${imgSrc}" class="detection-img"
                         onerror="this.src='/static/default.png'">

                    <div>
                        <p><strong>Fish ID:</strong> ${d.fish_id}</p>
                        <p><strong>Pi ID:</strong> ${d.pi_id}</p>
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