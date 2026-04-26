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

                row.innerHTML = `
                    <div>
                        <p><strong>Fish ID:</strong> ${d.fish_id}</p>
                        <p><strong>Pi ID:</strong> ${d.pi_id}</p>
                        <p><strong>Tid:</strong> ${d.ts}</p>
                        <p><strong>Image path:</strong> ${d.image_path}</p>

                        <p>Tester bilde direkte:</p>
                        <img src="${d.image_path}" class="detection-img">

                        <p>Tester med /static/ foran:</p>
                        <img src="/static/${d.image_path}" class="detection-img">

                        <p>Tester med / foran:</p>
                        <img src="/${d.image_path}" class="detection-img">
                    </div>
                `;

                container.appendChild(row);
            });
        });
}

document.addEventListener("DOMContentLoaded", loadDetections);