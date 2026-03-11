
const PLAYER_ID = 'mainPlayer';
const FPS = 30;
let socket = null;
let confidenceChartInstance = null;
let isVideo = false;

// Define the 4 species based on predict.py
const ALL_SPECIES = ["Pukkel laks", "Ørret", "Laks", "Ingen Fisk"];

// Store all aggregated data by Fish ID
const fishTracker = new Map(); 

document.querySelectorAll('.example-btn').forEach(button => {
    button.addEventListener('click', async function() {
        const fileUrl = this.getAttribute('data-url');
        const statusDiv = document.getElementById('statusUpdate');
        
        try {
            statusDiv.innerText = "Henter eksempelfil...";
            
            // 1. Fetch the file from the static folder
            console.log("Fetching example file from:", fileUrl);
            const response = await fetch(fileUrl);
            console.log("Fetch response:", response);
            const blob = await response.blob();
            console.log("Fetched blob:", blob);
            // 2. Create a "File" object from the blob
            const fileName = fileUrl.split('/').pop();
            const file = new File([blob], fileName, { type: blob.type });
            console.log("Created File object:", file);
            // 3. Trigger your existing analysis function
            // We pass the file directly to a slightly modified version of your upload logic
            processFile(file);
            
        } catch (error) {
            console.error("Error loading example:", error);
            statusDiv.innerText = "Kunne ikke laste eksempelfil.";
        }
    });
});

// Helper function to bridge the gap
function processFile(file) {
  const statusDiv = document.getElementById('statusUpdate');
    isVideo = file.type.startsWith('video/');
    statusDiv.innerText = "Konverterer fil og klargjør analyse...";
    
    const reader = new FileReader();
    reader.onload = function () {
      const base64Data = reader.result;

      // Swap UI states immediately
      document.getElementById('upload-section').style.display = 'none';
      document.getElementById('resetBtn').style.display = 'block';
      document.getElementById('results-section').style.display = 'flex';

      if (window.setVideoOverlaySource) {
        window.setVideoOverlaySource(PLAYER_ID, base64Data, file.type);
      }

      fetch('/upload-and-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          media: base64Data,
          filename: file.name,
          filetype: file.type
        })
      })
      .then(r => r.json())
      .then(data => {
        if (socket && data.request_id) {
          socket.emit('join', { room: data.request_id });
        }
        if (data.boxes) {
          window.setVideoOverlayBoxes(PLAYER_ID, data.boxes);
        }
      })
      .catch(err => {
        console.error(err);
        alert("Feil under opplasting av media.");
      });
    };
    reader.readAsDataURL(file);
}

(function () {
  function initSocket() {
    try {
      socket = io();
      socket.on('station_count_update', function(data) {
        const el = document.getElementById('unit-count');
        if (el) el.innerText = data.count;
      });

      socket.on('data', function(payload) {
        let p = window.getVideoOverlay(PLAYER_ID);
        if (p) p.fps = payload.fps || p.fps;
        window.handleSocketBoxData(payload.result);
      });
    } catch (e) {
      console.warn("Socket init failed", e);
    }
  }

  function uploadMedia() {
    const fileInput = document.getElementById('mediaInput');
    const statusDiv = document.getElementById('statusUpdate');
    const file = fileInput.files[0];

    isVideo = file.type.startsWith('video/');
    statusDiv.innerText = "Konverterer fil og klargjør analyse...";
    
    const reader = new FileReader();
    reader.onload = function () {
      const base64Data = reader.result;

      // Swap UI states immediately
      document.getElementById('upload-section').style.display = 'none';
      document.getElementById('resetBtn').style.display = 'block';
      document.getElementById('results-section').style.display = 'flex';

      if (window.setVideoOverlaySource) {
        window.setVideoOverlaySource(PLAYER_ID, base64Data, file.type);
      }

      fetch('/upload-and-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          media: base64Data,
          filename: file.name,
          filetype: file.type
        })
      })
      .then(r => r.json())
      .then(data => {
        if (socket && data.request_id) {
          socket.emit('join', { room: data.request_id });
        }
        if (data.boxes) {
          window.setVideoOverlayBoxes(PLAYER_ID, data.boxes);
        }
      })
      .catch(err => {
        console.error(err);
        alert("Feil under opplasting av media.");
      });
    };
    reader.readAsDataURL(file);
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (window.initVideoOverlay) {
      window.initVideoOverlay({ playerId: PLAYER_ID, fps: FPS, boxes: [] });
    }
    initSocket();
    
    // Auto trigger upload when file is selected
    const fileInput = document.getElementById('mediaInput');
    if (fileInput) {
      fileInput.addEventListener('change', uploadMedia);
    }
  });

})();

(function () {
  const incomingBuffer = [];
  let scheduled = false;

  function onSocketData(payload) {
    const boxes = Array.isArray(payload) ? payload : [payload];
    
    boxes.forEach(b => {
      if (!b) return;
      if (b.Box && !Array.isArray(b.Box)) {
        try {
          const text = String(b.Box).replace(/[()]/g, '');
          b.Box = text.split(',').map(s => Number(s.trim()));
        } catch (e) {}
      }
      aggregateFishData(b);
    });

    incomingBuffer.push(...boxes);

    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(processBufferedBoxes);
    }
  }

  function aggregateFishData(box) {
    if (box.ID === undefined) return;
    
    if (!fishTracker.has(box.ID)) {
      fishTracker.set(box.ID, {
        id: box.ID,
        frames: [],
        bestSpecies: "Unknown",
        maxSpeciesConf: 0,
        bestImg: null,
      });
    }

    const fish = fishTracker.get(box.ID);
    
    let imgSrc = box.Box_image;
    if (imgSrc && !imgSrc.startsWith('data:')) imgSrc = 'data:image/jpeg;base64,' + imgSrc;
    box.Box_image_src = imgSrc;

    let topSpeciesFrame = "Unknown";
    let topSpeciesConfFrame = 0;
    
    if (box.Species_data) {
      for (const [species, conf] of Object.entries(box.Species_data)) {
        if (conf > topSpeciesConfFrame) {
          topSpeciesFrame = species;
          topSpeciesConfFrame = conf;
        }
      }
    }

    // Keep the single best crop as the thumbnail reference
    if (topSpeciesConfFrame > fish.maxSpeciesConf) {
      fish.maxSpeciesConf = topSpeciesConfFrame;
      fish.bestSpecies = topSpeciesFrame;
      if (imgSrc) fish.bestImg = imgSrc;
    }

    fish.frames.push(box);
    renderFishList(); 
  }

  function processBufferedBoxes() {
    scheduled = false;
    if (incomingBuffer.length === 0) return;

    let playerState = window.getVideoOverlay(PLAYER_ID);
    if (!playerState) return;

    const existing = Array.isArray(playerState.boxesData) ? playerState.boxesData.slice() : [];
    const map = new Map();
    for (const e of existing) map.set(`${e.Frame}_${e.ID}`, e);
    
    while (incomingBuffer.length) {
      const newBox = incomingBuffer.shift();
      if (!newBox || newBox.ID === undefined || newBox.Frame === undefined) continue;
      map.set(`${newBox.Frame}_${newBox.ID}`, newBox);
    }

    const merged = Array.from(map.values());
    merged.sort((a, b) => (a.Frame - b.Frame) || (a.ID - b.ID));

    if (typeof window.setVideoOverlayBoxes === 'function') {
      window.setVideoOverlayBoxes(PLAYER_ID, merged);
    } else if (playerState.setBoxes) {
      playerState.setBoxes(merged);
    }
  }

  window.onOverlayBoxClick = function(playerId, id, data) {
    renderDetailsPanel(id, data);
  };

  window.handleSocketBoxData = onSocketData;
})();

function renderFishList() {
  const container = document.getElementById('fish-list');
  if (!container) return;
  container.innerHTML = ''; 

  fishTracker.forEach((fish) => {
    const timeOnScreen = (fish.frames.length / FPS).toFixed(2);
    
    const div = document.createElement('div');
    div.className = 'fish-list-item';
    div.onclick = () => renderDetailsPanel(fish.id);

    const img = document.createElement('img');
    img.src = fish.bestImg || '';



  let bestAvgSpecies = "Unknown";
  let bestAvgConf = 0;
  
  if (fish.frames.length > 0) {
      let sums = { "Pukkel laks": 0, "Ørret": 0, "Laks": 0, "Ingen Fisk": 0 };
      
      // Summer opp all sikkerhet
      fish.frames.forEach(frame => {
          ALL_SPECIES.forEach(sp => {
              sums[sp] += (frame.Species_data && frame.Species_data[sp]) ? frame.Species_data[sp] : 0;
          });
      });

      // Finn snittet og den vinnende arten
      ALL_SPECIES.forEach(sp => {
          let avg = sums[sp] / fish.frames.length;
          if (avg > bestAvgConf) {
              bestAvgConf = avg;
              bestAvgSpecies = sp;
          }
      });
  }






    const info = document.createElement('div');
    info.innerHTML = `
      <strong style="font-size: 15px; color: #2d3748;">ID: ${fish.id} - ${bestAvgSpecies}</strong><br>
      <span style="font-size: 13px; color: #718096;">Sannsynlighet: ${(bestAvgConf * 100).toFixed(1)}% | Tid: ${timeOnScreen} sek</span>
    `;

    div.appendChild(img);
    div.appendChild(info);
    container.appendChild(div);
  });
}

function renderDetailsPanel(fishId, specificFrameData = null) {
  const fish = fishTracker.get(fishId);
  if (!fish) return;

  document.getElementById('details-placeholder').style.display = 'none';
  const content = document.getElementById('details-content');
  content.style.display = 'block';

  const displayData = specificFrameData || fish.frames.find(f => f.Box_image_src === fish.bestImg) || fish.frames[0];

  const mainImg = document.getElementById('detail-main-img');
  mainImg.src = displayData.Box_image_src || '';

  let speciesHtml = "";
  if (displayData.Species_data) {
    for (const [sp, conf] of Object.entries(displayData.Species_data)) {
      speciesHtml += `<li style="margin-bottom: 2px;">${sp}: ${(conf * 100).toFixed(1)}%</li>`;
    }
  } else {
    speciesHtml = "<li>Ingen data</li>";
  }

  let bestAvgSpecies = "Unknown";
  let bestAvgConf = 0;
  
  if (fish.frames.length > 0) {
      let sums = { "Pukkel laks": 0, "Ørret": 0, "Laks": 0, "Ingen Fisk": 0 };
      
      // Summer opp all sikkerhet
      fish.frames.forEach(frame => {
          ALL_SPECIES.forEach(sp => {
              sums[sp] += (frame.Species_data && frame.Species_data[sp]) ? frame.Species_data[sp] : 0;
          });
      });

      // Finn snittet og den vinnende arten
      ALL_SPECIES.forEach(sp => {
          let avg = sums[sp] / fish.frames.length;
          if (avg > bestAvgConf) {
              bestAvgConf = avg;
              bestAvgSpecies = sp;
          }
      });
  }

  const statsDiv = document.getElementById('detail-stats');
  statsDiv.innerHTML = `
    <div style="background: #f7fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
      <strong style="color: #2d3748;">ID:</strong> ${fish.id}<br>
      <strong style="color: #2d3748;">Sannsynlig Art (Totalt):</strong> ${bestAvgSpecies} ${(bestAvgConf * 100).toFixed(1)}%<br>
    </div>
    <div style="margin-top: 15px;">
      <strong style="color: #2d3748;">For valgt bildeutklipp:</strong><br>
      YOLO Konfidens: ${(displayData.Conf * 100).toFixed(1)}%<br>
      Artsklassifisering:
      <ul style="margin-top: 5px; padding-left: 20px; color: #4a5568;">${speciesHtml}</ul>
    </div>
  `;

  const thumbsContainer = document.getElementById('detail-thumbnails');
  thumbsContainer.innerHTML = '';
  fish.frames.forEach(frame => {
    if (!frame.Box_image_src) return;
    const img = document.createElement('img');
    img.className = 'thumbnail-img';
    img.src = frame.Box_image_src;
    img.onclick = () => renderDetailsPanel(fish.id, frame); 
    thumbsContainer.appendChild(img);
  });

  if (isVideo) {
    document.getElementById('chart-container').style.display = 'block';
    renderChart(fish);
  } else {
    document.getElementById('chart-container').style.display = 'none';
  }
}

function renderChart(fish) {
  const ctx = document.getElementById('confidenceChart').getContext('2d');
  
  if (confidenceChartInstance) {
    confidenceChartInstance.destroy();
  }

  const sortedFrames = [...fish.frames].sort((a, b) => a.Frame - b.Frame);
  const labels = [];
  
  // Track running sums for the average calculation
  const runningSums = { "Pukkel laks": 0, "Ørret": 0, "Laks": 0, "Ingen Fisk": 0 };
  
  // Prepare data arrays for each species
  const speciesData = {
    "Pukkel laks": [],
    "Ørret": [],
    "Laks": [],
    "Ingen Fisk": []
  };

  sortedFrames.forEach((frame, index) => {
    labels.push(`Frame ${frame.Frame}`);
    const N = index + 1; // Current number of frames processed

    ALL_SPECIES.forEach(sp => {
      let p = (frame.Species_data && frame.Species_data[sp]) ? frame.Species_data[sp] : 0;
      runningSums[sp] += p;
      
      // Calculate running average up to this frame
      const currentAvg = runningSums[sp] / N;
      speciesData[sp].push((currentAvg * 100).toFixed(2));
    });
  });

  // Chart styling colors
  const colors = {
    "Pukkel laks": "rgb(236, 72, 153)", // Pink
    "Ørret": "rgb(16, 185, 129)",   // Emerald Green
    "Laks": "rgb(245, 158, 11)",      // Amber/Orange
    "Ingen Fisk": "rgb(139, 69, 19)"   // SaddleBrown
  };

  const datasets = ALL_SPECIES.map(sp => ({
    label: sp,
    data: speciesData[sp],
    borderColor: colors[sp],
    backgroundColor: 'transparent',
    borderWidth: 2,
    tension: 0.3,
    pointRadius: 0 // Hide dots for a cleaner line graph
  }));

  confidenceChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Gjennomsnittlig Sikkerhet per Art Over Tid',
          font: { size: 13 }
        },
        legend: {
          labels: { boxWidth: 12, font: { size: 11 } }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: { display: true, text: 'Sikkerhet (%)', font: { size: 11 } }
        },
        x: {
          ticks: { maxTicksLimit: 10 }
        }
      }
    }
  });
}