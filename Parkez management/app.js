/* ==========================================================================
   PARKEZ MANAGEMENT — APPLICATION CONTROLLER
   ========================================================================== */

/* --------------------------------------------------------------------------
   SECTION 1: THEME + CANVAS + TYPING
   -------------------------------------------------------------------------- */

function initTheme() {
    const saved = localStorage.getItem('pkz_mgmt_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    syncThemeIcons(saved);
}

function toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('pkz_mgmt_theme', next);
    syncThemeIcons(next);
}

function syncThemeIcons(theme) {
    document.querySelectorAll('.btn-theme-toggle').forEach(btn => {
        const sun  = btn.querySelector('.sun-icon');
        const moon = btn.querySelector('.moon-icon');
        if (!sun || !moon) return;
        if (theme === 'dark') {
            sun.style.display  = 'block';
            moon.style.display = 'none';
        } else {
            sun.style.display  = 'none';
            moon.style.display = 'block';
        }
    });
}

initTheme();

// --- Typing animation ---
function initTypist() {
    const el = document.getElementById('typing-text');
    if (!el) return;
    const words = ['real-time insight', 'live sensor maps', 'full control', 'smart analytics'];
    let wi = 0, ci = 0, deleting = false, delay = 200;
    function type() {
        const w = words[wi];
        el.textContent = deleting ? w.substring(0, ci - 1) : w.substring(0, ci + 1);
        deleting ? ci-- : ci++;
        if (!deleting && ci === w.length)  { deleting = true;  delay = 2000; }
        else if (deleting && ci === 0)     { deleting = false; wi = (wi + 1) % words.length; delay = 500; }
        else { delay = deleting ? 80 : 160; }
        setTimeout(type, delay);
    }
    type();
}

// --- Canvas particles ---
function initCanvas() {
    const canvas = document.getElementById('landing-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const pts = Array.from({ length: 55 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1.2,
        c: Math.random() > 0.5 ? 'rgba(99,102,241,0.45)' : 'rgba(6,182,212,0.4)'
    }));

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < pts.length; i++) {
            for (let j = i + 1; j < pts.length; j++) {
                const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
                if (d < 140) {
                    ctx.beginPath();
                    ctx.moveTo(pts[i].x, pts[i].y);
                    ctx.lineTo(pts[j].x, pts[j].y);
                    ctx.strokeStyle = `rgba(99,102,241,${(1 - d / 140) * 0.1})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
        pts.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > canvas.width)  p.vx = -p.vx;
            if (p.y < 0 || p.y > canvas.height)  p.vy = -p.vy;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.c;
            ctx.shadowBlur = 6; ctx.shadowColor = p.c;
            ctx.fill();
            ctx.shadowBlur = 0;
        });
        raf = requestAnimationFrame(animate);
    }
    animate();
    window._stopCanvas = () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
}

/* --------------------------------------------------------------------------
   SECTION 2: CREDENTIALS & FACILITY CONFIG
   -------------------------------------------------------------------------- */

const CREDENTIALS = {
    'orion':   { password: 'orion',   facilityId: 'orion' },
    'mantri':  { password: 'mantri',  facilityId: 'mantri' },
    'manipal': { password: 'manipal', facilityId: 'manipal' },
    'fortis':  { password: 'fortis',  facilityId: 'fortis' }
};

const FACILITY_CONFIGS = {
    'orion': {
        name: 'Orion Mall',
        type: 'Shopping Mall',
        initials: 'OR',
        levels: ['L1', 'L2'],
        slotsPerLevel: 400,
        slotsPerRow: 20,
        pricing: { standard: 80, ev: 120, handicap: 60 }
    },
    'mantri': {
        name: 'Mantri Square Mall',
        type: 'Shopping Mall',
        initials: 'MS',
        levels: ['L1', 'L2', 'L3'],
        slotsPerLevel: 300,
        slotsPerRow: 15,
        pricing: { standard: 60, ev: 100, handicap: 50 }
    },
    'manipal': {
        name: 'Manipal Hospital',
        type: 'Healthcare',
        initials: 'MH',
        levels: ['L1', 'L2', 'L3'],
        slotsPerLevel: 150,
        slotsPerRow: 15,
        pricing: { standard: 50, ev: 90, handicap: 0 }
    },
    'fortis': {
        name: 'Fortis Hospital',
        type: 'Healthcare',
        initials: 'FH',
        levels: ['L1', 'L2'],
        slotsPerLevel: 120,
        slotsPerRow: 12,
        pricing: { standard: 50, ev: 90, handicap: 0 }
    }
};

/* --------------------------------------------------------------------------
   SECTION 3: APPLICATION STATE
   -------------------------------------------------------------------------- */

let appState = {
    currentView: 'login-view',
    currentFacilityId: null,
    currentLevel: null,
    slotsData: {},
    selectedSpotId: null,
    simulationInterval: null,
    durationInterval: null,
    activeTab: 'parking',
    hourlyData: [],           // [{hour, entries, exits}]
    thisHourEntries: 0,
    thisHourExits: 0,
    currentHour: new Date().getHours(),
    totalDailyRevenue: 0,
    lookupIntervals: [],
    historyData: []
};

/* --------------------------------------------------------------------------
   SECTION 4: HELPERS
   -------------------------------------------------------------------------- */

function getRowLabel(index) {
    return index < 26
        ? String.fromCharCode(65 + index)
        : 'A' + String.fromCharCode(65 + (index - 26));
}

function generatePlate() {
    const states = ['KA', 'MH', 'DL', 'TN', 'TS', 'AP'];
    const s = states[Math.floor(Math.random() * states.length)];
    const d = String(Math.floor(Math.random() * 15) + 1).padStart(2, '0');
    const l = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const n = String(Math.floor(Math.random() * 9000) + 1000);
    return `${s}-${d}-${l}-${n}`;
}

function formatTime(date) {
    return date.toTimeString().split(' ')[0];
}

function formatDuration(ms) {
    if (!ms || ms < 0) return '—';
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
}

function formatHourLabel(h) {
    if (h === 0)  return '12AM';
    if (h < 12)  return `${h}AM`;
    if (h === 12) return '12PM';
    return `${h - 12}PM`;
}

function getPathType(facilityId, r, s, totalRows, slotsPerRow) {
    // Intercept lift location for all facilities
    if (facilityId === 'orion' && r === 11 && s === 5) {
        return { isPath: true, arrow: '🛗', label: 'LIFT' };
    }
    if (facilityId === 'mantri' && r === 11 && s === 8) {
        return { isPath: true, arrow: '🛗', label: 'LIFT' };
    }
    if (facilityId === 'manipal' && r === 6 && s === 7) {
        return { isPath: true, arrow: '🛗', label: 'LIFT' };
    }
    if (facilityId === 'fortis' && r === 4 && s === 6) {
        return { isPath: true, arrow: '🛗', label: 'LIFT' };
    }

    let isPath = false, arrow = '', label = '';

    if (facilityId === 'orion') {
        const midCol = Math.floor((slotsPerRow + 1) / 2);
        const midRow = Math.floor(totalRows / 2);
        if (r < midRow && s === midCol)                            { isPath = true; arrow = '↓'; if (r === 0) label = 'ENTRY'; }
        else if (r === midRow && s >= 1 && s <= midCol)            { isPath = true; arrow = s === midCol ? '↲' : '←'; }
        else if (r > midRow && s === 1)                            { isPath = true; arrow = '↓'; if (r === totalRows - 1) label = 'EXIT'; }
    } else if (facilityId === 'mantri') {
        const eC = 4, xC = 12, midRow = Math.floor(totalRows / 2);
        if (r < midRow && s === eC)                                { isPath = true; arrow = '↓'; if (r === 0) label = 'ENTRY'; }
        else if (r === midRow && s >= eC && s <= xC)               { isPath = true; arrow = s === eC ? '↳' : '→'; }
        else if (r > midRow && s === xC)                           { isPath = true; arrow = '↓'; if (r === totalRows - 1) label = 'EXIT'; }
    } else if (facilityId === 'manipal') {
        const eC = 12, xC = 3, midRow = Math.floor(totalRows / 2);
        if (r < midRow && s === eC)                                { isPath = true; arrow = '↓'; if (r === 0) label = 'ENTRY'; }
        else if (r === midRow && s >= xC && s <= eC)               { isPath = true; arrow = s === eC ? '↲' : '←'; }
        else if (r > midRow && s === xC)                           { isPath = true; arrow = '↓'; if (r === totalRows - 1) label = 'EXIT'; }
    } else if (facilityId === 'fortis') {
        const eC = 3, xC = 9, midRow = 4;
        if (r < midRow && s === eC)                                { isPath = true; arrow = '↓'; if (r === 0) label = 'ENTRY'; }
        else if (r === midRow && s >= eC && s <= xC)               { isPath = true; arrow = s === eC ? '↳' : '→'; }
        else if (r > midRow && s === xC)                           { isPath = true; arrow = '↓'; if (r === totalRows - 1) label = 'EXIT'; }
    } else {
        const midCol = Math.floor((slotsPerRow + 1) / 2);
        const midRow = Math.floor(totalRows / 2);
        if (r < midRow && s === midCol)                            { isPath = true; arrow = '↓'; if (r === 0) label = 'ENTRY'; }
        else if (r === midRow && s >= 1 && s <= midCol)            { isPath = true; arrow = s === midCol ? '↲' : '←'; }
        else if (r > midRow && s === 1)                            { isPath = true; arrow = '↓'; if (r === totalRows - 1) label = 'EXIT'; }
    }
    return { isPath, arrow, label };
}

function getPathOffset(facilityId) {
    return { orion: 9, mantri: 8, manipal: 9, fortis: 6 }[facilityId] ?? 5;
}

function getTotalRows(facilityId, config) {
    const N = config.slotsPerLevel, W = config.slotsPerRow;
    const offset = getPathOffset(facilityId);
    return Math.ceil((N + offset) / (W - 1));
}

function addLog(msg, type = 'system') {
    const console_ = document.getElementById('log-console');
    if (!console_) return;
    const line = document.createElement('div');
    line.className = 'log-line ' + type;
    line.innerHTML = `<span class="log-time">[${formatTime(new Date())}]</span> <span class="log-msg">${msg}</span>`;
    console_.appendChild(line);
    console_.scrollTop = console_.scrollHeight;
    while (console_.children.length > 80) console_.removeChild(console_.firstChild);
}

/* --------------------------------------------------------------------------
   SECTION 5: VIEW SWITCHING
   -------------------------------------------------------------------------- */

function switchView(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    const t = document.getElementById(id);
    if (t) { t.classList.remove('hidden'); appState.currentView = id; }
    if (id !== 'dashboard-view') stopSimulation();
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));

    const panel = document.getElementById(`tab-${tabName}`);
    if (panel) panel.classList.add('active');

    const menuMap = { 
        parking: 'menu-parking-layout', 
        analytics: 'menu-analytics', 
        'parked-list': 'menu-parked-list',
        'history-list': 'menu-history-list'
    };
    const menuBtn = document.getElementById(menuMap[tabName]);
    if (menuBtn) menuBtn.classList.add('active');

    appState.activeTab = tabName;
    if (tabName === 'analytics') renderAnalytics();
    if (tabName === 'parked-list') renderParkedList();
    if (tabName === 'history-list') renderHistoryList();
}

/* --------------------------------------------------------------------------
   SECTION 6: SLOT INITIALIZATION
   -------------------------------------------------------------------------- */

function initSlots(facilityId) {
    const config = FACILITY_CONFIGS[facilityId];
    appState.slotsData = {};
    appState.currentFacilityId = facilityId;
    appState.currentLevel = config.levels[0];

    const now = Date.now();

    config.levels.forEach(lvl => {
        const totalRows = getTotalRows(facilityId, config);
        let slotIdx = 1;

        for (let r = 0; r < totalRows; r++) {
            const rowLabel = getRowLabel(r);
            for (let s = 1; s <= config.slotsPerRow; s++) {
                if (slotIdx > config.slotsPerLevel) break;
                const pi = getPathType(facilityId, r, s, totalRows, config.slotsPerRow);
                if (pi.isPath) continue;

                const baseSpotId = `${lvl}-${rowLabel}${String(s).padStart(2, '0')}`;

                let type = 'standard';
                if (r < 4 && s === 1) type = 'ev';
                else if (r < 4 && s === 2) type = 'handicap';

                if (facilityId === 'mantri') {
                    ['T', 'B'].forEach(stack => {
                        const spotId = `${baseSpotId}-${stack}`;
                        const rand = Math.random();
                        let status = 'available', plate = '--', sessionStart = null;

                        if (rand > 0.58) {
                            status = 'occupied';
                            plate = generatePlate();
                            const ageRoll = Math.random();
                            let ageMs;
                            if (ageRoll < 0.05) {
                                ageMs = (6 + Math.random() * 3) * 3600 * 1000;
                            } else if (ageRoll < 0.20) {
                                ageMs = (2 + Math.random() * 4) * 3600 * 1000;
                            } else {
                                ageMs = Math.random() * 2 * 3600 * 1000;
                            }
                            sessionStart = new Date(now - ageMs);
                        }

                        appState.slotsData[spotId] = {
                            id: spotId, level: lvl, row: rowLabel,
                            number: s, stack: stack === 'T' ? 'top' : 'bottom',
                            status, type: stack === 'T' ? 'standard' : type,
                            vehiclePlate: plate, sessionStart
                        };
                    });
                } else {
                    const rand = Math.random();
                    let status = 'available', plate = '--', sessionStart = null;

                    if (rand > 0.58) {
                        status = 'occupied';
                        plate = generatePlate();
                        const ageRoll = Math.random();
                        let ageMs;
                        if (ageRoll < 0.05) {
                            ageMs = (6 + Math.random() * 3) * 3600 * 1000;
                        } else if (ageRoll < 0.20) {
                            ageMs = (2 + Math.random() * 4) * 3600 * 1000;
                        } else {
                            ageMs = Math.random() * 2 * 3600 * 1000;
                        }
                        sessionStart = new Date(now - ageMs);
                    }

                    appState.slotsData[baseSpotId] = {
                        id: baseSpotId, level: lvl, row: rowLabel,
                        number: s, status, type,
                        vehiclePlate: plate, sessionStart
                    };
                }
                slotIdx++;
            }
        }
    });

    seedHistoryData(facilityId);
    addLog(`System initialized: ${config.name} — ${Object.keys(appState.slotsData).length} slots loaded.`, 'system');
}

/* --------------------------------------------------------------------------
   SECTION 7: PARKING GRID RENDER
   -------------------------------------------------------------------------- */

function renderParkingGrid() {
    const grid = document.getElementById('parking-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const fid = appState.currentFacilityId;
    const config = FACILITY_CONFIGS[fid];
    const totalRows = getTotalRows(fid, config);

    for (let r = 0; r < totalRows; r++) {
        const rowLabel = getRowLabel(r);
        const rowDiv = document.createElement('div');
        rowDiv.className = 'grid-row-container';

        const label = document.createElement('span');
        label.className = 'row-label';
        label.textContent = `Row ${rowLabel}`;
        rowDiv.appendChild(label);

        const slotsDiv = document.createElement('div');
        slotsDiv.className = 'row-slots';

        for (let s = 1; s <= config.slotsPerRow; s++) {
            const pi = getPathType(fid, r, s, totalRows, config.slotsPerRow);
            if (pi.isPath) {
                const path = document.createElement('div');
                path.className = 'parking-spot drive-path-cell';
                let inner = '';
                if (pi.label) inner += `<span class="path-label">${pi.label}</span>`;
                inner += `<span class="path-arrow">${pi.arrow}</span>`;
                path.innerHTML = inner;
                slotsDiv.appendChild(path);
                continue;
            }

            if (fid === 'mantri') {
                const spotBtn = document.createElement('div');
                spotBtn.className = 'parking-spot stacker-spot-container';

                const spotIdT = `${appState.currentLevel}-${rowLabel}${String(s).padStart(2, '0')}-T`;
                const spotIdB = `${appState.currentLevel}-${rowLabel}${String(s).padStart(2, '0')}-B`;
                
                const spotT = appState.slotsData[spotIdT];
                const spotB = appState.slotsData[spotIdB];

                if (spotT && spotB) {
                    const elT = document.createElement('div');
                    elT.className = `sub-spot top ${spotT.status}`;
                    elT.setAttribute('data-spot-id', spotIdT);
                    if (spotT.type === 'ev')       elT.classList.add('ev-spot');
                    if (spotT.type === 'handicap') elT.classList.add('handicap-spot');
                    if (spotT.id === appState.selectedSpotId) elT.classList.add('selected');
                    if (spotT.status === 'occupied' && spotT.sessionStart) {
                        const durH = (Date.now() - spotT.sessionStart.getTime()) / 3600000;
                        if (durH >= 12)      elT.classList.add('long-stay-red');
                        else if (durH >= 8)  elT.classList.add('long-stay-amber');
                    }
                    let typeBadgeT = '';
                    if (spotT.type === 'ev')       typeBadgeT = `<span class="spot-type-icon" title="EV Charging"><svg viewBox="0 0 24 24" width="8" height="8" fill="currentColor" stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg></span>`;
                    if (spotT.type === 'handicap') typeBadgeT = `<span class="spot-type-icon" title="Handicap"><svg viewBox="0 0 24 24" width="8" height="8" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path><path d="M10 14h4"></path><path d="M12 14v6"></path><path d="M9 20h6"></path></svg></span>`;
                    if (spotT.status === 'reserved') typeBadgeT = `<span class="spot-type-icon" title="Reserved" style="color:var(--warning)">🔒</span>`;
                    
                    elT.innerHTML = `<span class="spot-id">${rowLabel}${s}↑</span><div class="spot-indicator-car"></div>${typeBadgeT}`;
                    elT.addEventListener('click', () => openSpotPanel(spotIdT));

                    const elB = document.createElement('div');
                    elB.className = `sub-spot bottom ${spotB.status}`;
                    elB.setAttribute('data-spot-id', spotIdB);
                    if (spotB.type === 'ev')       elB.classList.add('ev-spot');
                    if (spotB.type === 'handicap') elB.classList.add('handicap-spot');
                    if (spotB.id === appState.selectedSpotId) elB.classList.add('selected');
                    if (spotB.status === 'occupied' && spotB.sessionStart) {
                        const durH = (Date.now() - spotB.sessionStart.getTime()) / 3600000;
                        if (durH >= 12)      elB.classList.add('long-stay-red');
                        else if (durH >= 8)  elB.classList.add('long-stay-amber');
                    }
                    let typeBadgeB = '';
                    if (spotB.type === 'ev')       typeBadgeB = `<span class="spot-type-icon" title="EV Charging"><svg viewBox="0 0 24 24" width="8" height="8" fill="currentColor" stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg></span>`;
                    if (spotB.type === 'handicap') typeBadgeB = `<span class="spot-type-icon" title="Handicap"><svg viewBox="0 0 24 24" width="8" height="8" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path><path d="M10 14h4"></path><path d="M12 14v6"></path><path d="M9 20h6"></path></svg></span>`;
                    if (spotB.status === 'reserved') typeBadgeB = `<span class="spot-type-icon" title="Reserved" style="color:var(--warning)">🔒</span>`;
                    
                    elB.innerHTML = `<span class="spot-id">${rowLabel}${s}↓</span><div class="spot-indicator-car"></div>${typeBadgeB}`;
                    elB.addEventListener('click', () => openSpotPanel(spotIdB));

                    spotBtn.appendChild(elT);
                    spotBtn.appendChild(elB);
                }
                slotsDiv.appendChild(spotBtn);
            } else {
                const spotId = `${appState.currentLevel}-${rowLabel}${String(s).padStart(2, '0')}`;
                const spot = appState.slotsData[spotId];
                if (!spot) continue;

                const el = document.createElement('div');
                el.className = `parking-spot ${spot.status}`;
                el.setAttribute('data-spot-id', spotId);

                if (spot.type === 'ev')       el.classList.add('ev-spot');
                if (spot.type === 'handicap') el.classList.add('handicap-spot');
                if (spot.id === appState.selectedSpotId) el.classList.add('selected');

                // Long-stay highlighting
                if (spot.status === 'occupied' && spot.sessionStart) {
                    const durH = (Date.now() - spot.sessionStart.getTime()) / 3600000;
                    if (durH >= 12)      el.classList.add('long-stay-red');
                    else if (durH >= 8)  el.classList.add('long-stay-amber');
                }

                let typeBadge = '';
                if (spot.type === 'ev')       typeBadge = `<span class="spot-type-icon" title="EV Charging"><svg viewBox="0 0 24 24" width="8" height="8" fill="currentColor" stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg></span>`;
                if (spot.type === 'handicap') typeBadge = `<span class="spot-type-icon" title="Handicap"><svg viewBox="0 0 24 24" width="8" height="8" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path><path d="M10 14h4"></path><path d="M12 14v6"></path><path d="M9 20h6"></path></svg></span>`;
                if (spot.status === 'reserved') typeBadge = `<span class="spot-type-icon" title="Reserved" style="color:var(--warning)">🔒</span>`;

                el.innerHTML = `<span class="spot-id">${rowLabel}${s}</span><div class="spot-indicator-car"></div>${typeBadge}`;
                el.addEventListener('click', () => openSpotPanel(spotId));
                slotsDiv.appendChild(el);
            }
        }

        rowDiv.appendChild(slotsDiv);
        grid.appendChild(rowDiv);
    }

    updateFloorBadge();
}

function updateFloorBadge() {
    const badge = document.getElementById('floor-stats-badge');
    if (!badge) return;
    let total = 0, avail = 0, occ = 0;
    Object.values(appState.slotsData).forEach(s => {
        if (s.level === appState.currentLevel) {
            total++;
            if (s.status === 'available') avail++;
            if (s.status === 'occupied')  occ++;
        }
    });
    const lvlText = appState.currentLevel === 'L1' ? 'Ground Level' : `Level ${appState.currentLevel.substring(1)}`;
    badge.innerHTML = `
        <span class="floor-badge-title">${lvlText}:</span>
        <span class="floor-stat-item"><span class="color-dot available"></span>${avail} Free</span>
        <span class="floor-stat-item"><span class="color-dot occupied"></span>${occ} Occ.</span>
    `;
}

function updateStatistics() {
    let total = 0, avail = 0, occ = 0;
    Object.values(appState.slotsData).forEach(s => {
        total++; if (s.status === 'available') avail++; if (s.status === 'occupied') occ++;
    });
    document.getElementById('stat-total').textContent    = total;
    document.getElementById('stat-available').textContent = avail;
    document.getElementById('stat-occupied').textContent  = occ;
    const rate = total > 0 ? (occ / total) * 100 : 0;
    document.getElementById('stat-occ-pct').textContent  = `${rate.toFixed(1)}%`;
    document.getElementById('stat-occ-rate').textContent = `${Math.round(rate)}%`;
    const deg = (rate / 100) * 360;
    const gauge = document.getElementById('occ-gauge');
    if (gauge) gauge.style.background = `conic-gradient(var(--primary) ${deg}deg, rgba(255,255,255,0.05) ${deg}deg)`;
    updateFloorBadge();
}

/* --------------------------------------------------------------------------
   SECTION 8: SPOT DETAIL PANEL
   -------------------------------------------------------------------------- */

function openSpotPanel(spotId) {
    const spot = appState.slotsData[spotId];
    if (!spot) return;

    // Clear old selected
    document.querySelectorAll('.parking-spot.selected, .sub-spot.selected').forEach(el => el.classList.remove('selected'));
    const el = document.querySelector(`[data-spot-id="${spotId}"]`);
    if (el) el.classList.add('selected');
    appState.selectedSpotId = spotId;

    // Populate panel
    document.getElementById('panel-spot-id').textContent = spotId;

    // Status badge
    const badge = document.getElementById('panel-spot-status-badge');
    badge.className = 'badge';
    if (spot.status === 'occupied')  { badge.classList.add('badge-danger');  badge.textContent = 'Occupied'; }
    else if (spot.status === 'available') { badge.classList.add('badge-success'); badge.textContent = 'Available'; }
    else if (spot.status === 'reserved')  { badge.classList.add('badge-warning'); badge.textContent = 'Reserved'; }
    else if (spot.status === 'blocked')   { badge.classList.add('badge-primary'); badge.textContent = 'Blocked'; }

    // Duration
    const dBox = document.getElementById('panel-duration-box');
    const dVal  = document.getElementById('panel-duration-value');
    const dSince = document.getElementById('panel-entry-time');

    if (spot.status === 'occupied' && spot.sessionStart) {
        dBox.style.display = 'block';
        dSince.textContent = `Entry: ${formatTime(spot.sessionStart)}`;

        if (appState.durationInterval) clearInterval(appState.durationInterval);
        const update = () => {
            if (!appState.slotsData[spotId] || appState.slotsData[spotId].status !== 'occupied') return;
            dVal.textContent = formatDuration(Date.now() - spot.sessionStart.getTime());
        };
        update();
        appState.durationInterval = setInterval(update, 1000);
    } else {
        dBox.style.display = 'none';
        if (appState.durationInterval) { clearInterval(appState.durationInterval); appState.durationInterval = null; }
    }

    // Long-stay warning
    const warn = document.getElementById('panel-long-stay');
    const warnMsg = document.getElementById('panel-long-stay-msg');
    warn.className = 'long-stay-warning';
    if (spot.status === 'occupied' && spot.sessionStart) {
        const durH = (Date.now() - spot.sessionStart.getTime()) / 3600000;
        if (durH >= 12) {
            warn.classList.add('show', 'red-alert');
            warnMsg.textContent = `⚠ Extreme long-stay: ${formatDuration(Date.now() - spot.sessionStart.getTime())} — Immediate action required!`;
        } else if (durH >= 8) {
            warn.classList.add('show', 'amber');
            warnMsg.textContent = `Long-stay alert (8h+): ${formatDuration(Date.now() - spot.sessionStart.getTime())} parked`;
        }
    }

    // Details
    document.getElementById('panel-spot-type').textContent  = spot.type.charAt(0).toUpperCase() + spot.type.slice(1);
    document.getElementById('panel-spot-level').textContent = spot.level;
    document.getElementById('panel-spot-row').textContent   = `Row ${spot.row}`;

    // Action buttons
    const btnReserve = document.getElementById('panel-btn-reserve');
    const btnBlock   = document.getElementById('panel-btn-block');
    const btnRelease = document.getElementById('panel-btn-release');

    btnReserve.classList.remove('hidden');
    btnBlock.classList.remove('hidden');
    btnRelease.classList.add('hidden');

    if (spot.status === 'reserved' || spot.status === 'blocked') {
        btnReserve.classList.add('hidden');
        btnBlock.classList.add('hidden');
        btnRelease.classList.remove('hidden');
    }

    // Open panel
    document.getElementById('panel-overlay').classList.add('visible');
    document.getElementById('spot-panel').classList.add('open');
}

function closeSpotPanel() {
    document.getElementById('panel-overlay').classList.remove('visible');
    document.getElementById('spot-panel').classList.remove('open');
    if (appState.durationInterval) { clearInterval(appState.durationInterval); appState.durationInterval = null; }
    document.querySelectorAll('.parking-spot.selected, .sub-spot.selected').forEach(el => el.classList.remove('selected'));
    appState.selectedSpotId = null;
}

/* --------------------------------------------------------------------------
   SECTION 9: SIMULATION & ACTIVITY LOG
   -------------------------------------------------------------------------- */

function startSimulation() {
    stopSimulation();
    document.getElementById('sim-pulse').className = 'pulse-indicator green';

    appState.simulationInterval = setInterval(() => {
        const toggle = document.getElementById('sim-toggle');
        if (!toggle || !toggle.checked) return;

        const slots = Object.values(appState.slotsData);
        if (!slots.length) return;

        const rand = slots[Math.floor(Math.random() * slots.length)];
        const roll = Math.random();

        // Check hour rollover
        const nowH = new Date().getHours();
        if (nowH !== appState.currentHour) {
            appState.currentHour = nowH;
            appState.thisHourEntries = 0;
            appState.thisHourExits = 0;
        }

        if (rand.status === 'available') {
            if (roll < 0.32) {
                rand.status = 'occupied';
                rand.vehiclePlate = generatePlate();
                rand.sessionStart = new Date();
                appState.thisHourEntries++;
                // Record to history list
                appState.historyData.unshift({
                    plate: rand.vehiclePlate,
                    level: rand.level,
                    type: rand.type,
                    entryTime: rand.sessionStart,
                    exitTime: null,
                    status: 'Parked'
                });
                // Record hourly
                let hEntry = appState.hourlyData.find(h => h.hour === appState.currentHour);
                if (!hEntry) { hEntry = { hour: appState.currentHour, entries: 0, exits: 0 }; appState.hourlyData.push(hEntry); }
                hEntry.entries++;
                addLog(`Entry: Vehicle ${rand.vehiclePlate} parked at slot ${rand.id}.`, 'entry');
                if (rand.level === appState.currentLevel) renderParkingGrid();
                updateStatistics();
                if (appState.activeTab === 'analytics') renderAnalytics();
                if (appState.activeTab === 'parked-list') renderParkedList();
                if (appState.activeTab === 'history-list') renderHistoryList();
            }
        } else if (rand.status === 'occupied') {
            if (roll < 0.38) {
                const plate = rand.vehiclePlate;
                // Accumulate revenue for completed session at ₹80/hr
                const durMs = rand.sessionStart ? (Date.now() - rand.sessionStart.getTime()) : 0;
                appState.totalDailyRevenue += (durMs / 3600000) * 80;
                rand.status = 'available';
                rand.vehiclePlate = '--';
                rand.sessionStart = null;
                appState.thisHourExits++;
                // Update history record
                const record = appState.historyData.find(h => h.plate === plate && !h.exitTime);
                if (record) {
                    record.exitTime = new Date();
                    record.status = 'Departed';
                }
                let hEntry = appState.hourlyData.find(h => h.hour === appState.currentHour);
                if (!hEntry) { hEntry = { hour: appState.currentHour, entries: 0, exits: 0 }; appState.hourlyData.push(hEntry); }
                hEntry.exits++;
                addLog(`Exit: Vehicle ${plate} left slot ${rand.id}.`, 'exit');
                if (rand.level === appState.currentLevel) renderParkingGrid();
                updateStatistics();
                if (appState.activeTab === 'analytics') renderAnalytics();
                if (appState.activeTab === 'parked-list') renderParkedList();
                if (appState.activeTab === 'history-list') renderHistoryList();
            }
        }
    }, 1200);
}

function stopSimulation() {
    if (appState.simulationInterval) { clearInterval(appState.simulationInterval); appState.simulationInterval = null; }
    const pulse = document.getElementById('sim-pulse');
    if (pulse) pulse.className = 'pulse-indicator red';
}

/* --------------------------------------------------------------------------
   SECTION 10: ANALYTICS TAB
   -------------------------------------------------------------------------- */

// Called ONCE at login — past hours are frozen, current hour grows via simulation
function initHourlyData() {
    const nowH = new Date().getHours();
    appState.hourlyData = [];
    for (let h = 0; h < 24; h++) {
        if (h > nowH) {
            // Future hours — empty
            appState.hourlyData.push({ hour: h, entries: 0, exits: 0 });
        } else if (h === nowH) {
            // Current hour — starts at 0, grows from simulation
            appState.hourlyData.push({ hour: h, entries: 0, exits: 0 });
        } else {
            // Past hours — generated once, NEVER changes again
            let base;
            if      (h >= 7  && h <= 9)  base = 18 + Math.random() * 10;
            else if (h >= 10 && h <= 13) base = 12 + Math.random() * 8;
            else if (h >= 14 && h <= 18) base = 15 + Math.random() * 10;
            else if (h >= 19 && h <= 21) base = 10 + Math.random() * 8;
            else                         base = 2  + Math.random() * 4;
            appState.hourlyData.push({
                hour: h,
                entries: Math.round(base),
                exits:   Math.round(base * (0.7 + Math.random() * 0.3))
            });
        }
    }
}

function renderAnalytics() {
    // Update "this hour" cards
    document.getElementById('an-cars-in').textContent  = appState.thisHourEntries;
    document.getElementById('an-cars-out').textContent = appState.thisHourExits;

    // Total daily revenue = completed sessions accumulated + ongoing sessions at ₹80/hr
    let ongoingRev = 0;
    Object.values(appState.slotsData).forEach(s => {
        if (s.status === 'occupied' && s.sessionStart) {
            const hrs = Math.min((Date.now() - s.sessionStart.getTime()) / 3600000, 24);
            ongoingRev += hrs * 80;
        }
    });
    const totalRev = appState.totalDailyRevenue + ongoingRev;
    document.getElementById('an-revenue').textContent = `₹${Math.round(totalRev).toLocaleString('en-IN')}`;

    // Sync ONLY current hour into stored data (past hours remain frozen)
    const nowH2 = new Date().getHours();
    const curSlot = appState.hourlyData.find(d => d.hour === nowH2);
    if (curSlot) { curSlot.entries = appState.thisHourEntries; curSlot.exits = appState.thisHourExits; }
    // Hourly chart — uses frozen past data
    const chartData = appState.hourlyData;
    const chart = document.getElementById('hourly-chart');
    if (!chart) return;
    chart.innerHTML = '';
    const nowH = new Date().getHours();
    const maxVal = Math.max(...chartData.map(d => Math.max(d.entries, d.exits)), 1);

    chartData.forEach(d => {
        const col = document.createElement('div');
        col.className = 'chart-col' + (d.hour === nowH ? ' chart-current-col' : '');

        const entH = Math.round((d.entries / maxVal) * 96);
        const extH = Math.round((d.exits   / maxVal) * 96);

        col.innerHTML = `
            <div class="chart-bars">
                <div class="chart-bar entry-bar" style="height:${entH}px" title="In: ${d.entries}"></div>
                <div class="chart-bar exit-bar"  style="height:${extH}px" title="Out: ${d.exits}"></div>
            </div>
            <div class="chart-x-label">${formatHourLabel(d.hour)}</div>
        `;
        chart.appendChild(col);
    });

    // Floor breakdown
    const tbody = document.getElementById('floor-breakdown-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    const config2 = FACILITY_CONFIGS[appState.currentFacilityId];
    config2.levels.forEach(lvl => {
        let tot = 0, occ = 0;
        Object.values(appState.slotsData).forEach(s => {
            if (s.level === lvl) { tot++; if (s.status === 'occupied') occ++; }
        });
        const avail = tot - occ;
        const pct   = tot > 0 ? Math.round((occ / tot) * 100) : 0;
        const lvlLabel = lvl === 'L1' ? 'Ground' : `Level ${lvl.substring(1)}`;
        tbody.innerHTML += `
            <tr>
                <td>${lvlLabel}</td>
                <td>${tot}</td>
                <td style="color:var(--danger)">${occ}</td>
                <td style="color:var(--success)">${avail}</td>
                <td>
                    <div class="floor-bar-wrap">
                        <div class="floor-bar-track"><div class="floor-bar-fill" style="width:${pct}%"></div></div>
                        <span class="floor-bar-pct">${pct}%</span>
                    </div>
                </td>
            </tr>
        `;
    });
}

/* --------------------------------------------------------------------------
   SECTION 11: PARKED INVENTORY & TICKERS
   -------------------------------------------------------------------------- */

// Clear old live intervals
function clearLookupIntervals() {
    appState.lookupIntervals.forEach(id => clearInterval(id));
    appState.lookupIntervals = [];
}

function renderParkedList() {
    clearLookupIntervals();
    const tbody = document.getElementById('parked-list-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const query = document.getElementById('parked-search-input')?.value.trim().toUpperCase() || '';

    const parked = Object.values(appState.slotsData).filter(
        s => s.status === 'occupied' && s.vehiclePlate !== '--' &&
        (query === '' || s.vehiclePlate.toUpperCase().includes(query))
    );

    if (parked.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 20px;">No matching vehicles parked in the lot currently.</td></tr>`;
        return;
    }

    parked.sort((a, b) => a.id.localeCompare(b.id));

    parked.forEach(s => {
        const tr = document.createElement('tr');
        const durCellId = `parked-dur-${s.id}`;
        tr.innerHTML = `
            <td><span class="plate-cell">${s.vehiclePlate}</span></td>
            <td>${s.level}</td>
            <td><span class="badge badge-${s.type === 'ev' ? 'primary' : s.type === 'handicap' ? 'info' : 'secondary'}">${s.type.toUpperCase()}</span></td>
            <td>${s.sessionStart ? formatTime(s.sessionStart) : '—'}</td>
            <td><span class="live-duration" id="${durCellId}">${formatDuration(s.sessionStart ? Date.now() - s.sessionStart.getTime() : 0)}</span></td>
        `;
        tbody.appendChild(tr);

        // Live duration ticker
        if (s.sessionStart) {
            const iv = setInterval(() => {
                const cell = document.getElementById(durCellId);
                if (cell && appState.slotsData[s.id] && appState.slotsData[s.id].status === 'occupied') {
                    cell.textContent = formatDuration(Date.now() - s.sessionStart.getTime());
                } else {
                    clearInterval(iv);
                    if (cell) cell.textContent = '—';
                }
            }, 1000);
            appState.lookupIntervals.push(iv);
        }
    });
}

function seedHistoryData(facilityId) {
    appState.historyData = [];
    const config = FACILITY_CONFIGS[facilityId];
    if (!config) return;
    
    const now = new Date();
    const types = ['standard', 'ev', 'handicap'];
    
    // Seed ~500 departed vehicles for the past 3 days
    for (let i = 0; i < 500; i++) {
        // Random time in the past 3 days (offset by at least 6 hours so they are definitely departed)
        const timeDiffMs = Math.random() * 3 * 24 * 60 * 60 * 1000;
        const minAgeMs = 6 * 3600 * 1000;
        const entryTime = new Date(now.getTime() - (minAgeMs + timeDiffMs));
        
        // Random duration between 30 mins and 5 hours
        const durMs = (30 + Math.random() * 270) * 60 * 1000;
        const exitTime = new Date(entryTime.getTime() + durMs);
        
        const plate = generatePlate();
        const randLevel = config.levels[Math.floor(Math.random() * config.levels.length)];
        const randType = types[Math.floor(Math.random() * types.length)];
        
        appState.historyData.push({
            plate: plate,
            level: randLevel,
            type: randType,
            entryTime: entryTime,
            exitTime: exitTime,
            status: 'Departed'
        });
    }
    
    // Sync currently parked cars from slotsData
    Object.values(appState.slotsData).forEach(s => {
        if (s.status === 'occupied' && s.vehiclePlate !== '--') {
            const exists = appState.historyData.some(h => h.plate === s.vehiclePlate);
            if (!exists) {
                appState.historyData.push({
                    plate: s.vehiclePlate,
                    level: s.level,
                    type: s.type,
                    entryTime: s.sessionStart || new Date(now.getTime() - Math.random() * 4 * 3600 * 1000),
                    exitTime: null,
                    status: 'Parked'
                });
            }
        }
    });

    // Sort by entry time descending
    appState.historyData.sort((a, b) => b.entryTime.getTime() - a.entryTime.getTime());
}

function renderHistoryList() {
    clearLookupIntervals();
    const tbody = document.getElementById('history-list-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const query = document.getElementById('history-search-input')?.value.trim().toUpperCase() || '';

    const records = appState.historyData.filter(
        r => query === '' || r.plate.toUpperCase().includes(query)
    );

    if (records.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 20px;">No history records found for the past 3 days.</td></tr>`;
        return;
    }

    records.forEach(r => {
        const tr = document.createElement('tr');
        const entryStr = r.entryTime.toLocaleString();
        const exitStr = r.exitTime ? r.exitTime.toLocaleString() : `<span class="badge" style="font-size: 0.72rem; padding: 2px 6px; background: #39FF14; color: #000; font-weight: bold; border-radius: 4px; box-shadow: 0 0 8px rgba(57,255,20,0.4)">PARKED</span>`;
        
        tr.innerHTML = `
            <td><span class="plate-cell">${r.plate}</span></td>
            <td>${r.level}</td>
            <td><span class="badge badge-${r.type === 'ev' ? 'primary' : r.type === 'handicap' ? 'info' : 'secondary'}">${r.type.toUpperCase()}</span></td>
            <td>${entryStr}</td>
            <td>${exitStr}</td>
        `;
        tbody.appendChild(tr);
    });
}

/* --------------------------------------------------------------------------
   SECTION 12: FACILITY LOGIN
   -------------------------------------------------------------------------- */

function loginFacility(facilityId) {
    const config = FACILITY_CONFIGS[facilityId];

    // Update UI labels
    document.getElementById('nav-facility-name').textContent    = config.name;
    document.getElementById('nav-facility-type').textContent    = config.type;
    document.getElementById('header-facility-title').textContent = `${config.name} — Parking`;
    document.getElementById('sidebar-avatar').textContent        = config.initials;
    document.getElementById('sidebar-facility-label').textContent = config.name;
    document.getElementById('sidebar-role-label').textContent    = 'Facility Manager';

    // Initialize slots
    initSlots(facilityId);

    // Build level tabs
    const tabContainer = document.getElementById('level-tabs');
    tabContainer.innerHTML = '';
    const cfg = FACILITY_CONFIGS[facilityId];
    cfg.levels.forEach((lvl, idx) => {
        const btn = document.createElement('button');
        btn.className = `tab-btn ${idx === 0 ? 'active' : ''}`;
        btn.textContent = lvl === 'L1' ? 'Ground Level' : `Level ${lvl.substring(1)}`;
        btn.dataset.level = lvl;
        btn.addEventListener('click', () => {
            document.querySelectorAll('#level-tabs .tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            appState.currentLevel = lvl;
            closeSpotPanel();
            renderParkingGrid();
        });
        tabContainer.appendChild(btn);
    });

    // Init hourly counters and freeze past hours
    appState.thisHourEntries = 0;
    appState.thisHourExits   = 0;
    appState.currentHour     = new Date().getHours();
    appState.totalDailyRevenue = 0;
    initHourlyData();

    renderParkingGrid();
    updateStatistics();
    startSimulation();
    switchView('dashboard-view');
    switchTab('parking');
    addLog(`Welcome! Logged in as ${config.name} facility manager.`, 'system');
}

/* --------------------------------------------------------------------------
   SECTION 13: BOOTSTRAP & EVENT LISTENERS
   -------------------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    initTypist();
    syncThemeIcons(localStorage.getItem('pkz_mgmt_theme') || 'dark');

    // --- Login form ---
    const loginForm = document.getElementById('login-form');
    const loginErr  = document.getElementById('login-error');
    if (loginForm) {
        loginForm.addEventListener('submit', e => {
            e.preventDefault();
            const id   = document.getElementById('login-id').value.trim().toLowerCase();
            const pass = document.getElementById('login-pass').value.trim();
            const cred = CREDENTIALS[id];
            if (cred && cred.password === pass) {
                loginErr.classList.add('hidden');
                loginFacility(cred.facilityId);
            } else {
                loginErr.classList.remove('hidden');
                document.getElementById('login-pass').value = '';
            }
        });
    }

    // --- Logout ---
    document.getElementById('logout-btn')?.addEventListener('click', () => {
        stopSimulation();
        clearLookupIntervals();
        closeSpotPanel();
        document.getElementById('login-id').value   = '';
        document.getElementById('login-pass').value = '';
        loginErr?.classList.add('hidden');
        appState.slotsData = {};
        switchView('login-view');
    });

    // --- Theme toggles ---
    document.querySelectorAll('.btn-theme-toggle').forEach(btn => {
        btn.addEventListener('click', toggleTheme);
    });

    // --- Sidebar menu tabs ---
    document.getElementById('menu-parking-layout')?.addEventListener('click', () => switchTab('parking'));
    document.getElementById('menu-analytics')?.addEventListener('click', () => switchTab('analytics'));
    document.getElementById('menu-parked-list')?.addEventListener('click', () => {
        switchTab('parked-list');
        clearLookupIntervals();
    });
    document.getElementById('menu-history-list')?.addEventListener('click', () => {
        switchTab('history-list');
        clearLookupIntervals();
    });

    // --- Sim toggle ---
    document.getElementById('sim-toggle')?.addEventListener('change', e => {
        if (e.target.checked) startSimulation(); else stopSimulation();
    });

    // --- Spot panel close ---
    document.getElementById('panel-overlay')?.addEventListener('click', closeSpotPanel);
    document.getElementById('panel-close-btn')?.addEventListener('click', closeSpotPanel);
    document.getElementById('panel-btn-close-action')?.addEventListener('click', closeSpotPanel);

    // --- Reserve button ---
    document.getElementById('panel-btn-reserve')?.addEventListener('click', () => {
        const sid = appState.selectedSpotId;
        if (!sid || !appState.slotsData[sid]) return;
        const spot = appState.slotsData[sid];
        spot.status = 'reserved';
        spot.vehiclePlate = '--';
        spot.sessionStart = null;
        addLog(`Spot ${sid} marked as RESERVED by facility manager.`, 'warning');
        updateStatistics();
        renderParkingGrid();
        closeSpotPanel();
    });

    // --- Block button ---
    document.getElementById('panel-btn-block')?.addEventListener('click', () => {
        const sid = appState.selectedSpotId;
        if (!sid || !appState.slotsData[sid]) return;
        const spot = appState.slotsData[sid];
        spot.status = 'blocked';
        spot.vehiclePlate = '--';
        spot.sessionStart = null;
        addLog(`Spot ${sid} BLOCKED by facility manager.`, 'warning');
        updateStatistics();
        renderParkingGrid();
        closeSpotPanel();
    });

    // --- Release button ---
    document.getElementById('panel-btn-release')?.addEventListener('click', () => {
        const sid = appState.selectedSpotId;
        if (!sid || !appState.slotsData[sid]) return;
        appState.slotsData[sid].status = 'available';
        addLog(`Spot ${sid} released — now AVAILABLE.`, 'entry');
        updateStatistics();
        renderParkingGrid();
        closeSpotPanel();
    });

    // --- Parked list search ---
    document.getElementById('parked-search-input')?.addEventListener('input', () => {
        renderParkedList();
    });

    // --- History list search ---
    document.getElementById('history-search-input')?.addEventListener('input', () => {
        renderHistoryList();
    });

    // --- Activity log collapse ---
    const logWrap   = document.getElementById('activity-log-wrap');
    const logToggle = document.getElementById('log-toggle-btn');
    const logIcon   = document.getElementById('log-toggle-icon');
    let logExpanded = true;
    logToggle?.addEventListener('click', () => {
        logExpanded = !logExpanded;
        logWrap.className = 'activity-log-wrap ' + (logExpanded ? 'expanded' : 'collapsed');
        logToggle.innerHTML = logExpanded
            ? `<svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2.5" fill="none" id="log-toggle-icon"><polyline points="18 15 12 9 6 15"></polyline></svg> Collapse`
            : `<svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2.5" fill="none" id="log-toggle-icon"><polyline points="6 9 12 15 18 9"></polyline></svg> Expand`;
    });
    document.getElementById('log-header')?.addEventListener('click', e => {
        if (e.target.closest('#log-toggle-btn')) return;
        logToggle?.click();
    });

    // Start on login
    switchView('login-view');
});
