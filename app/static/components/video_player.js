// static/components/video_player.js
(function () {
  const players = new Map();

  function clearBoxes() {
  // remove DOM nodes
  for (const node of state.boxPool.values()) {
    try { node.remove(); } catch (e) { /* ignore */ }
  }
  state.boxPool.clear();

  // clear data structures
  state.boxesData = [];
  state.framesMap.clear();

  // force re-render next time (so lastRenderedFrame doesn't block)
  state.lastRenderedFrame = null;

  // also clear overlay children as a safety (keeps overlay clean)
  try {
    // Don't remove overlay itself; remove its children only
    while (overlay.firstChild) overlay.removeChild(overlay.firstChild);
  } catch (e) { /* ignore */ }
}
    window.clearBoxes = clearBoxes;
  function initVideoOverlay({ playerId, fps = 30, boxes = [] } = {}) {
    if (!playerId) throw new Error('playerId required');
    if (players.has(playerId)) return players.get(playerId);

    const state = {
      playerId,
      fps,
      boxesData: boxes.slice(),
      framesMap: new Map(),
      boxPool: new Map(),
      urlToRevoke: null,
      lastRenderedFrame: null,
      rafId: null,
    };

    function buildFramesMap() {
      state.framesMap.clear();
      for (const it of state.boxesData) {
        const f = it.Frame ?? 0;
        if (!state.framesMap.has(f)) state.framesMap.set(f, []);
        state.framesMap.get(f).push(it);
      }
    }
    buildFramesMap();

    const video = document.getElementById(`${playerId}-video`);
    const img = document.getElementById(`${playerId}-img`);
    const overlay = document.getElementById(`${playerId}-overlay`);
    if (!overlay) throw new Error('overlay element not found: ' + playerId);

    // helper: create box DOM
    function createBoxNode(id) {
      const el = document.createElement('div');
      el.className = 'bbox';
      el.dataset.boxId = id;
      el.style.position = 'absolute';
      el.style.boxSizing = 'border-box';
      el.style.border = '2px solid rgba(255,0,0,0.9)';
      el.style.background = 'rgba(255,0,0,0.03)';
      el.style.pointerEvents = 'auto';
      el.style.cursor = 'pointer';
      el.style.display = 'none';

      const label = document.createElement('div');
      label.className = 'bbox-label';
      label.style.fontSize = '12px';
      label.style.background = 'rgba(0,0,0,0.6)';
      label.style.color = 'white';
      label.style.padding = '2px 6px';
      label.style.borderRadius = '3px';
      label.style.margin = '4px';
      label.style.pointerEvents = 'none';
      el.appendChild(label);

      el.addEventListener('click', (ev) => {
        ev.stopPropagation(); ev.preventDefault();
        const numericId = Number(el.dataset.boxId);
        if (typeof window.onOverlayBoxClick === 'function') {
          window.onOverlayBoxClick(playerId, numericId, el._data);
        } else {
          console.log('Box clicked', playerId, numericId, el._data);
          const prev = el.style.borderColor;
          el.style.borderColor = 'rgba(0,255,0,1)';
          setTimeout(() => el.style.borderColor = prev, 300);
        }
      });

      overlay.appendChild(el);
      return el;
    }

    function updateBoxNode(el, entry, natW, natH, dispW, dispH) {
      const [x1, y1, x2, y2] = entry.Box;
      const scaleX = dispW / Math.max(1, natW);
      const scaleY = dispH / Math.max(1, natH);
      const left = x1 * scaleX;
      const top = y1 * scaleY;
      const width = Math.max(2, (x2 - x1) * scaleX);
      const height = Math.max(2, (y2 - y1) * scaleY);

      el.style.transform = `translate3d(${left}px, ${top}px, 0)`;
      el.style.width = `${width}px`;
      el.style.height = `${height}px`;

      const label = el.querySelector('.bbox-label');
      if (label) label.textContent = `${entry.ID} ${(entry.Conf !== undefined ? '(' + entry.Conf.toFixed(2) + ')' : '')}`;
      el._data = entry;
    }

    function renderFrame(frameIndex) {
      const list = state.framesMap.get(frameIndex) || [];
      const used = new Set();

      const activeMedia = (video && video.style.display !== 'none') ? video : (img && img.style.display !== 'none' ? img : null);
      if (!activeMedia) return;

      const dispW = activeMedia.clientWidth;
      const dispH = activeMedia.clientHeight;
      const natW = activeMedia.videoWidth || activeMedia.naturalWidth || dispW;
      const natH = activeMedia.videoHeight || activeMedia.naturalHeight || dispH;

      for (const entry of list) {
        const id = entry.ID;
        let node = state.boxPool.get(id);
        if (!node) {
          node = createBoxNode(id);
          state.boxPool.set(id, node);
        }
        node.style.display = 'block';
        updateBoxNode(node, entry, natW, natH, dispW, dispH);
        used.add(id);
      }

      for (const [id, node] of state.boxPool.entries()) {
        if (!used.has(id)) node.style.display = 'none';
      }
    }

    function getCurrentFrame() {
      if (video && video.style.display !== 'none') {
        const t = Math.max(0, video.currentTime || 0);
        return Math.floor(t * state.fps);
      } else {
        return 0; // images treat as single frame
      }
    }

    function renderFrameForCurrentTime(force = false) {
      const f = getCurrentFrame();
      if (force || f !== state.lastRenderedFrame) {
        renderFrame(f);
        state.lastRenderedFrame = f;
      }
    }

    function loop() {
      renderFrameForCurrentTime();
      state.rafId = requestAnimationFrame(loop);
    }

    function setBoxes(boxesArr) {
      state.boxesData = boxesArr.slice();
      buildFramesMap();
      renderFrameForCurrentTime(true);
    }

    function cleanup() {
      if (state.rafId) cancelAnimationFrame(state.rafId);
      if (state.urlToRevoke) {
        try { URL.revokeObjectURL(state.urlToRevoke); } catch {}
        state.urlToRevoke = null;
      }
      for (const n of state.boxPool.values()) n.remove();
      state.boxPool.clear();
      players.delete(playerId);
    }

    // Accept File or URL string
    function setMediaSource(source, fileType) {
      const isFile = (typeof File !== 'undefined' && source instanceof File);
      const mime = (fileType || (isFile ? source.type : '') || '').toLowerCase();

      if (state.urlToRevoke) {
        try { URL.revokeObjectURL(state.urlToRevoke); } catch {}
        state.urlToRevoke = null;
      }

      if (mime.startsWith('image/')) {
        if (video) { video.pause(); video.style.display = 'none'; }
        if (img) {
          img.style.display = 'block';
          let url = isFile ? URL.createObjectURL(source) : source;
          if (isFile) state.urlToRevoke = url;
          img.src = url;
          img.onload = function () {
            // ensure overlay matches size
            if (overlay && img) {
              overlay.style.width = img.clientWidth + 'px';
              overlay.style.height = img.clientHeight + 'px';
            }
            renderFrameForCurrentTime(true);
          };
        }
      } else {
        // treat as video
        if (img) img.style.display = 'none';
        if (video) {
          video.style.display = 'block';
          let url = isFile ? URL.createObjectURL(source) : source;
          if (isFile) state.urlToRevoke = url;
          if (video.src !== url) {
            video.src = url;
            video.load();
          }
          video.onloadedmetadata = function () {
            if (overlay && video) {
              overlay.style.width = video.clientWidth + 'px';
              overlay.style.height = video.clientHeight + 'px';
            }
            if (!state.rafId) loop();
            renderFrameForCurrentTime(true);
          };
        }
      }
    }

    // watchers for resize to keep overlay aligned
    window.addEventListener('resize', function () {
      const active = (video && video.style.display !== 'none') ? video : (img && img.style.display !== 'none' ? img : null);
      if (active && overlay) {
        overlay.style.width = active.clientWidth + 'px';
        overlay.style.height = active.clientHeight + 'px';
      }
      renderFrameForCurrentTime(true);
    });

    // start loop
    loop();

    state.setBoxes = setBoxes;
    state.setMediaSource = setMediaSource;
    state.cleanup = cleanup;

    players.set(playerId, state);
    return state;
  }

  function getPlayer(playerId) {
    return players.get(playerId);
  }

  // global helpers used by page JS
  window.initVideoOverlay = initVideoOverlay;
  window.getVideoOverlay = getPlayer;
  window.setVideoOverlaySource = function (playerId, source, fileType) {
    const p = getPlayer(playerId) || initVideoOverlay({ playerId });
    return p.setMediaSource(source, fileType);
  };
  window.setVideoOverlayBoxes = function (playerId, boxes) {
    const p = getPlayer(playerId) || initVideoOverlay({ playerId });
    p.setBoxes(boxes);
  };

})();