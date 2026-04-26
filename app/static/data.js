function loadDetections() {
    fetch("/api/detections")
        .then(response => response.json())
        .then(detections => {
            const container = document.getElementById("detections-table");
            if (!container) return;

            container.innerHTML = "";

            detections.forEach(d => {
                const row = document.createElement("div");

                row.innerHTML = `
                    <img src="${d.image_path}" width="120">
                    <p>Fish ID: ${d.fish_id}</p>
                    <p>Tid: ${d.ts}</p>
                `;

                container.appendChild(row);
            });
        });
}

document.addEventListener("DOMContentLoaded", loadDetections);