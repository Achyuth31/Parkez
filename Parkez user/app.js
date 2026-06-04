/* ==========================================================================
   PARKEZ APPLICATION STATE & CONTROLLER
   ========================================================================== */

// Global Error Handler overlay for easier debugging of blank screens
window.addEventListener('error', (event) => {
    showErrorOverlay(event.message, event.filename, event.lineno);
});
window.addEventListener('unhandledrejection', (event) => {
    showErrorOverlay(event.reason);
});

function showErrorOverlay(message, source, lineno) {
    let overlay = document.getElementById('debug-error-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'debug-error-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(239, 68, 68, 0.95);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            z-index: 99999;
            font-family: 'Space Grotesk', monospace;
            font-size: 0.85rem;
            box-shadow: 0 10px 25px rgba(239, 68, 68, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.2);
            max-width: 90%;
            display: flex;
            align-items: center;
            gap: 12px;
        `;
        document.body.appendChild(overlay);
    }
    const fileInfo = source ? `<br><small style="opacity:0.8; font-size: 0.75rem;">${source.split('/').pop()}:${lineno}</small>` : '';
    overlay.innerHTML = `
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none" style="flex-shrink:0"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <div>
            <strong>JavaScript Error Detected:</strong><br>${message}
            ${fileInfo}
        </div>
        <button onclick="this.parentElement.remove()" style="background:transparent;border:none;color:white;cursor:pointer;font-weight:bold;margin-left:12px;font-size:1.2rem">&times;</button>
    `;
}

// LocalStorage Persistence for registered users
function initUsersDatabase() {
    const key = 'parkez_users';
    if (!localStorage.getItem(key)) {
        const defaultUsers = [
            { username: 'ABC', password: '123', name: 'Administrator', email: 'admin@parkez.com' }
        ];
        localStorage.setItem(key, JSON.stringify(defaultUsers));
    }
}
initUsersDatabase();

function getUsers() {
    return JSON.parse(localStorage.getItem('parkez_users') || '[]');
}

function registerUser(username, password, name, email) {
    let users = getUsers();
    // Overwrite the account if it already exists
    users = users.filter(u => u.username.toLowerCase() !== username.toLowerCase());
    users.push({ username, password, name, email });
    localStorage.setItem('parkez_users', JSON.stringify(users));
    return { success: true };
}

// Global Theme Switching System
function initTheme() {
    const activeTheme = localStorage.getItem('parkez_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', activeTheme);
    // Runs after DOMContentLoaded to sync icons, but we initialize attribute immediately
    document.addEventListener('DOMContentLoaded', () => {
        updateThemeToggleIcons(activeTheme);
    });
}

function toggleGlobalTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('parkez_theme', nextTheme);
    updateThemeToggleIcons(nextTheme);
}

function updateThemeToggleIcons(theme) {
    document.querySelectorAll('.btn-theme-toggle').forEach(btn => {
        const sun = btn.querySelector('.sun-icon');
        const moon = btn.querySelector('.moon-icon');
        if (theme === 'dark') {
            if (sun) sun.style.setProperty('display', 'block', 'important');
            if (moon) moon.style.setProperty('display', 'none', 'important');
        } else {
            if (sun) sun.style.setProperty('display', 'none', 'important');
            if (moon) moon.style.setProperty('display', 'block', 'important');
        }
    });
}
// Run theme initialization immediately on file execution to prevent flicker
initTheme();

// Global Voice Assistant (Decorative Toggle)
let voiceActive = false;

function toggleVoiceAssistant() {
    voiceActive = !voiceActive;
    updateVoiceToggleIcons(voiceActive);
}

function updateVoiceToggleIcons(active) {
    document.querySelectorAll('.btn-voice-toggle').forEach(btn => {
        const micOn = btn.querySelector('.mic-on-icon');
        const micOff = btn.querySelector('.mic-off-icon');
        if (active) {
            if (micOn) micOn.style.setProperty('display', 'block', 'important');
            if (micOff) micOff.style.setProperty('display', 'none', 'important');
        } else {
            if (micOn) micOn.style.setProperty('display', 'none', 'important');
            if (micOff) micOff.style.setProperty('display', 'block', 'important');
        }
    });
}

// Typist effect on the landing page
function initTypist() {
    const typingTextEl = document.getElementById('typing-text');
    if (!typingTextEl) return;

    const words = ['live occupancy maps', 'instant space routing', 'smart sensor telemetry', 'IoT sensor networks'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let delay = 200;

    function type() {
        const currentWord = words[wordIndex];
        if (isDeleting) {
            typingTextEl.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            delay = 100;
        } else {
            typingTextEl.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            delay = 200;
        }

        if (!isDeleting && charIndex === currentWord.length) {
            isDeleting = true;
            delay = 2000; // Hold at the end of the word
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            delay = 500; // Delay before typing next word
        }

        setTimeout(type, delay);
    }
    type();
}

// HTML5 Canvas smart parking lot visualizer
function initLandingCanvas() {
    const canvas = document.getElementById('landing-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Grid layout parameters
    const slotWidth = 48;
    const slotHeight = 70;
    const slotGap = 16;
    const totalSlotsPerRow = 6;
    const totalWidth = totalSlotsPerRow * slotWidth + (totalSlotsPerRow - 1) * slotGap;

    // Initialize 12 spots (6 top, 6 bottom) - all vacant at start
    const slots = [];
    for (let i = 0; i < totalSlotsPerRow; i++) {
        slots.push({ id: 'top-' + i, index: i, isTop: true, isOccupied: false });
        slots.push({ id: 'bottom-' + i, index: i, isTop: false, isOccupied: false });
    }

    const cars = [];
    let scanX = 0;
    let initialCarsSpawned = false;

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        const centerY = canvas.height * 0.45;
        let leftPanelCenterX;
        if (window.innerWidth > 768) {
            const rightPanel = document.querySelector('.login-split-right');
            const rightWidth = rightPanel ? rightPanel.offsetWidth : 420;
            leftPanelCenterX = (canvas.width - rightWidth) / 2;
        } else {
            leftPanelCenterX = canvas.width / 2;
        }
        
        const startX = leftPanelCenterX - totalWidth / 2;

        // Update slots absolute coordinates
        slots.forEach(s => {
            s.x = startX + s.index * (slotWidth + slotGap);
            s.y = s.isTop ? centerY - 30 - slotHeight : centerY + 30;
        });

        // Spawn initial parked cars on first frame
        if (!initialCarsSpawned) {
            slots.forEach(s => {
                if (Math.random() > 0.4) {
                    s.isOccupied = true;
                    const nodeX = s.x + slotWidth / 2;
                    const targetY = s.isTop ? s.y + slotHeight - 18 : s.y + 18;
                    cars.push({
                        id: Math.random(),
                        x: nodeX,
                        y: targetY,
                        speed: 1.0 + Math.random() * 0.5,
                        state: 'parked',
                        assignedSlot: s,
                        angle: s.isTop ? -Math.PI / 2 : Math.PI / 2,
                        parkTime: Date.now() - Math.random() * 10000,
                        parkDuration: 5000 + Math.random() * 8000,
                        color: Math.random() > 0.5 ? 'rgba(99, 102, 241, 0.85)' : 'rgba(6, 182, 212, 0.85)'
                    });
                }
            });
            initialCarsSpawned = true;
        }

        // Draw faint background technical grid
        ctx.strokeStyle = isLight ? 'rgba(15, 23, 42, 0.02)' : 'rgba(255, 255, 255, 0.02)';
        ctx.lineWidth = 1;
        const gridSize = 40;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += gridSize) {
            ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height);
        }
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.moveTo(0, y); ctx.lineTo(canvas.width, y);
        }
        ctx.stroke();

        // Draw driveway lane borders
        ctx.strokeStyle = isLight ? 'rgba(15, 23, 42, 0.05)' : 'rgba(255, 255, 255, 0.05)';
        ctx.setLineDash([6, 6]);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, centerY - 30); ctx.lineTo(canvas.width, centerY - 30);
        ctx.moveTo(0, centerY + 30); ctx.lineTo(canvas.width, centerY + 30);
        ctx.stroke();
        ctx.setLineDash([]); // reset

        // Draw ENTRY / EXIT text labels
        ctx.font = '500 10px "Space Grotesk", sans-serif';
        ctx.fillStyle = isLight ? 'rgba(15, 23, 42, 0.35)' : 'rgba(255, 255, 255, 0.2)';
        ctx.textAlign = 'center';
        ctx.fillText('ENTRY GATE', Math.max(startX - 80, 40), centerY + 4);
        ctx.fillText('EXIT GATE', Math.min(startX + totalWidth + 80, canvas.width - 40), centerY + 4);

        // Draw parking slots
        slots.forEach(s => {
            ctx.strokeStyle = isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            if (s.isTop) {
                ctx.moveTo(s.x, s.y + slotHeight);
                ctx.lineTo(s.x, s.y);
                ctx.lineTo(s.x + slotWidth, s.y);
                ctx.lineTo(s.x + slotWidth, s.y + slotHeight);
            } else {
                ctx.moveTo(s.x, s.y);
                ctx.lineTo(s.x, s.y + slotHeight);
                ctx.lineTo(s.x + slotWidth, s.y + slotHeight);
                ctx.lineTo(s.x + slotWidth, s.y);
            }
            ctx.stroke();

            // Draw sensor node - red only if a car is physically present (parked or turning in)
            const nodeX = s.x + slotWidth / 2;
            const nodeY = s.isTop ? s.y + 10 : s.y + slotHeight - 10;
            const isOccupiedByCar = cars.some(c => c.assignedSlot === s && (c.state === 'parked' || c.state === 'turning-in'));
            
            let nodeColor;
            if (isOccupiedByCar) {
                nodeColor = '#FF073A'; // Neon Red
            } else {
                nodeColor = '#39FF14'; // Neon Green
            }

            ctx.save();
            ctx.shadowBlur = isLight ? 4 : 10;
            ctx.shadowColor = nodeColor;
            ctx.strokeStyle = nodeColor;
            ctx.fillStyle = nodeColor;

            if (isOccupiedByCar) {
                // Occupied: Solid glowing circle with high contrast outline
                ctx.beginPath();
                ctx.arc(nodeX, nodeY, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                
                ctx.strokeStyle = isLight ? '#0f172a' : '#ffffff';
                ctx.lineWidth = 1.2;
                ctx.stroke();
            } else {
                // Vacant: Hollow glowing ring (thick border) with white/dark core dot
                ctx.beginPath();
                ctx.arc(nodeX, nodeY, 4.5, 0, Math.PI * 2);
                ctx.lineWidth = 2.5;
                ctx.stroke();
                ctx.shadowBlur = 0;

                ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
                ctx.beginPath();
                ctx.arc(nodeX, nodeY, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        });

        // Update and draw cars
        const vacantSlots = slots.filter(s => !s.isOccupied && !cars.some(c => c.assignedSlot === s));
        if (vacantSlots.length > 0 && cars.length < 4 && Math.random() < 0.008) {
            // Check if entrance area is clear of other cars to prevent overlap on spawn
            const entranceClear = !cars.some(c => c.x < 50);
            if (entranceClear) {
                const pick = vacantSlots[Math.floor(Math.random() * vacantSlots.length)];
                pick.isOccupied = true; // reserve it
                cars.push({
                    id: Math.random(),
                    x: -30,
                    y: centerY,
                    speed: 1.0 + Math.random() * 0.5,
                    state: 'entering',
                    assignedSlot: pick,
                    angle: 0,
                    parkTime: 0,
                    parkDuration: 3000 + Math.random() * 5000,
                    color: Math.random() > 0.5 ? 'rgba(99, 102, 241, 0.85)' : 'rgba(6, 182, 212, 0.85)'
                });
            }
        }

        // Render cars
        for (let i = cars.length - 1; i >= 0; i--) {
            const car = cars[i];
            let targetAngle = 0;

            if (car.state === 'entering') {
                targetAngle = 0;
                const targetX = car.assignedSlot.x + slotWidth / 2;
                if (car.x < targetX) {
                    // Driveway anti-collision yielding: stop if there is a car ahead within 55px
                    const hasCarAhead = cars.some(other => {
                        if (other.id === car.id) return false;
                        if (['entering', 'leaving', 'turning-in', 'turning-out'].includes(other.state)) {
                            return other.x > car.x && other.x - car.x < 55;
                        }
                        return false;
                    });
                    if (!hasCarAhead) {
                        car.x += car.speed;
                    }
                } else {
                    car.x = targetX;
                    car.state = 'turning-in';
                }
            } else if (car.state === 'turning-in') {
                // Dynamically lock X coordinate to track slot position in case of resizes
                car.x = car.assignedSlot.x + slotWidth / 2;
                targetAngle = car.assignedSlot.isTop ? -Math.PI / 2 : Math.PI / 2;
                const targetY = car.assignedSlot.isTop ? car.assignedSlot.y + slotHeight - 18 : car.assignedSlot.y + 18;
                if (car.assignedSlot.isTop) {
                    if (car.y > targetY) {
                        car.y -= car.speed;
                    } else {
                        car.y = targetY;
                        car.state = 'parked';
                        car.parkTime = Date.now();
                    }
                } else {
                    if (car.y < targetY) {
                        car.y += car.speed;
                    } else {
                        car.y = targetY;
                        car.state = 'parked';
                        car.parkTime = Date.now();
                    }
                }
            } else if (car.state === 'parked') {
                // Dynamically lock both X and Y coordinates to slot center during parked state
                car.x = car.assignedSlot.x + slotWidth / 2;
                car.y = car.assignedSlot.isTop ? car.assignedSlot.y + slotHeight - 18 : car.assignedSlot.y + 18;
                targetAngle = car.assignedSlot.isTop ? -Math.PI / 2 : Math.PI / 2;
                if (Date.now() - car.parkTime > car.parkDuration) {
                    // Yield before backing out: only start turning-out if driveway near the slot is clear
                    const drivewayIsClear = !cars.some(other => {
                        if (other.id === car.id) return false;
                        if (other.state === 'entering' || other.state === 'leaving') {
                            const slotX = car.assignedSlot.x + slotWidth / 2;
                            return (other.x > slotX - 60 && other.x < slotX + 40);
                        }
                        if (other.state === 'turning-in' || other.state === 'turning-out') {
                            const slotX = car.assignedSlot.x + slotWidth / 2;
                            const otherSlotX = other.assignedSlot.x + slotWidth / 2;
                            return Math.abs(otherSlotX - slotX) < 60;
                        }
                        return false;
                    });

                    if (drivewayIsClear) {
                        car.state = 'turning-out';
                        car.assignedSlot.isOccupied = false;
                    }
                }
            } else if (car.state === 'turning-out') {
                // Dynamically lock X coordinate to track slot position in case of resizes
                car.x = car.assignedSlot.x + slotWidth / 2;
                targetAngle = car.assignedSlot.isTop ? Math.PI / 2 : -Math.PI / 2;
                const targetY = centerY;
                if (car.assignedSlot.isTop) {
                    if (car.y < targetY) {
                        car.y += car.speed;
                    } else {
                        car.y = targetY;
                        car.state = 'leaving';
                    }
                } else {
                    if (car.y > targetY) {
                        car.y -= car.speed;
                    } else {
                        car.y = targetY;
                        car.state = 'leaving';
                    }
                }
            } else if (car.state === 'leaving') {
                targetAngle = 0;
                // Driveway anti-collision yielding: stop if there is a car ahead within 55px
                const hasCarAhead = cars.some(other => {
                    if (other.id === car.id) return false;
                    if (['entering', 'leaving', 'turning-in', 'turning-out'].includes(other.state)) {
                        return other.x > car.x && other.x - car.x < 55;
                    }
                    return false;
                });
                if (!hasCarAhead) {
                    car.x += car.speed;
                }
                if (car.x > canvas.width + 30) {
                    cars.splice(i, 1);
                    continue;
                }
            }

            // Smoothly rotate car
            let angleDiff = targetAngle - car.angle;
            angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
            car.angle += angleDiff * 0.15;

            // Draw car
            // Draw car (Replaced with custom structure matching user's image)
            ctx.save();
            ctx.translate(car.x, car.y);
            ctx.rotate(car.angle);

            // 1. Draw Headlight Beams (spotlight cones starting from headlights)
            if (car.state !== 'parked') {
                ctx.save();
                // Left beam
                const gradL = ctx.createLinearGradient(12, -4, 32, -9);
                gradL.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
                gradL.addColorStop(1, 'rgba(254, 240, 138, 0)');
                ctx.fillStyle = gradL;
                ctx.beginPath();
                ctx.moveTo(12, -4.5);
                ctx.lineTo(32, -14);
                ctx.lineTo(32, -1);
                ctx.closePath();
                ctx.fill();

                // Right beam
                const gradR = ctx.createLinearGradient(12, 4, 32, 9);
                gradR.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
                gradR.addColorStop(1, 'rgba(254, 240, 138, 0)');
                ctx.fillStyle = gradR;
                ctx.beginPath();
                ctx.moveTo(12, 4.5);
                ctx.lineTo(32, 1);
                ctx.lineTo(32, 14);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }

            // 2. Black Bumper Bar at the Rear
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(-13, -7.5, 2, 15);

            // 3. White Main Car Body (with dark border)
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(-12, -7, 24, 14, 3);
            ctx.fill();
            ctx.stroke();

            // 4. Side Glass Accent Lines (longitudinal lines on each side)
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 1.0;
            ctx.beginPath();
            ctx.moveTo(-5, -6.2);
            ctx.lineTo(5, -6.2);
            ctx.moveTo(-5, 6.2);
            ctx.lineTo(5, 6.2);
            ctx.stroke();

            // 5. Curved Black Windshield (Facing forward)
            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.moveTo(1, -4.5);
            ctx.lineTo(4, -3.5);
            ctx.quadraticCurveTo(6, 0, 4, 3.5);
            ctx.lineTo(1, 4.5);
            ctx.quadraticCurveTo(3, 0, 1, -4.5);
            ctx.closePath();
            ctx.fill();

            // 6. Black Sunroof / Roof Panel with Horizontal Lines (Behind windshield)
            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.roundRect(-8, -4.5, 7, 9, 1);
            ctx.fill();

            // Draw white horizontal lines inside sunroof (vertical on screen because car length is along X)
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            for (let lx = -7.5; lx < -1.5; lx += 1.8) {
                ctx.moveTo(lx, -3.5);
                ctx.lineTo(lx, 3.5);
            }
            ctx.stroke();

            // 7. Glowing Yellow Headlights
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(11.5, -5.5, 1.5, 2);
            ctx.fillRect(11.5, 3.5, 1.5, 2);

            // 8. LED Red Taillights
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(-12.5, -5.5, 1.5, 2);
            ctx.fillRect(-12.5, 3.5, 1.5, 2);

            ctx.restore();
        }

        // Draw linear scanning sweep line representing IoT telemetry scan
        scanX += 2.0;
        if (scanX > canvas.width + 100) {
            scanX = -100;
        }

        ctx.save();
        const grad = ctx.createLinearGradient(scanX - 50, 0, scanX + 50, 0);
        grad.addColorStop(0, 'rgba(6, 182, 212, 0)');
        grad.addColorStop(0.5, 'rgba(6, 182, 212, 0.08)');
        grad.addColorStop(1, 'rgba(6, 182, 212, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(scanX - 50, 0, 100, canvas.height);

        ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(scanX, 0);
        ctx.lineTo(scanX, canvas.height);
        ctx.stroke();
        ctx.restore();

        animationFrameId = requestAnimationFrame(animate);
    }
    animate();

    // Store reference to clean up if needed
    appState.stopCanvas = () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', resizeCanvas);
    };
}

// 1. Initial State Definitions
const CITIES = ['bangalore', 'chennai', 'delhi', 'mumbai', 'hyderabad'];

const ASSET_CONFIGS = {
    'orion': {
        name: 'Orion Mall',
        city: 'Bangalore',
        levels: ['L1', 'L2'],
        slotsPerLevel: 400,
        slotsPerRow: 20,
        pricing: { standard: 80, ev: 120 }
    },
    'mantri': {
        name: 'Mantri Square Mall',
        city: 'Bangalore',
        levels: ['L1', 'L2', 'L3'],
        slotsPerLevel: 300,
        slotsPerRow: 15,
        pricing: { standard: 60, ev: 100 }
    },
    'manipal': {
        name: 'Manipal Hospital, Old Airport Rd',
        city: 'Bangalore',
        levels: ['L1', 'L2', 'L3'],
        slotsPerLevel: 150,
        slotsPerRow: 15,
        pricing: { standard: 50, ev: 90 }
    },
    'fortis': {
        name: 'Fortis Hospital, Bannerghatta Rd',
        city: 'Bangalore',
        levels: ['L1', 'L2'],
        slotsPerLevel: 120,
        slotsPerRow: 12,
        pricing: { standard: 50, ev: 90 }
    }
};

const TOP_MALLS = [
    { id: 'orion', name: 'Orion Mall', active: true, levels: 2, slots: 800, area: 'Rajajinagar' },
    { id: 'mantri', name: 'Mantri Square Mall', active: true, levels: 3, slots: 1800, area: 'Malleshwaram' },
    { id: 'phoenix', name: 'Phoenix Marketcity', active: false, levels: 4, slots: 1200, area: 'Whitefield' },
    { id: 'nexus_kor', name: 'Nexus Koramangala', active: false, levels: 2, slots: 500, area: 'Koramangala' },
    { id: 'ub_city', name: 'UB City Mall', active: false, levels: 2, slots: 350, area: 'Vittal Mallya Rd' },
    { id: 'royal_meenakshi', name: 'Royal Meenakshi Mall', active: false, levels: 2, slots: 450, area: 'Bannerghatta Rd' },
    { id: 'forum_shanti', name: 'Forum Shantiniketan', active: false, levels: 3, slots: 700, area: 'Hoodi' },
    { id: 'nexus_white', name: 'Nexus Whitefield', active: false, levels: 2, slots: 600, area: 'Whitefield' },
    { id: 'vr_bglr', name: 'VR Bengaluru', active: false, levels: 2, slots: 400, area: 'Mahadevapura' },
    { id: 'bhartiya', name: 'Bhartiya Mall of Bengaluru', active: false, levels: 3, slots: 800, area: 'Thanisandra' }
];

const TOP_HOSPITALS = [
    { id: 'manipal', name: 'Manipal Hospital', active: true, levels: 3, slots: 450, area: 'Old Airport Road' },
    { id: 'fortis', name: 'Fortis Hospital', active: true, levels: 2, slots: 240, area: 'Bannerghatta Road' },
    { id: 'narayana', name: 'Narayana Health City', active: false, levels: 4, slots: 800, area: 'Bommasandra' },
    { id: 'columbia_heb', name: 'Columbia Asia Hospital', active: false, levels: 2, slots: 300, area: 'Hebbal' },
    { id: 'apollo_jayanagar', name: 'Apollo Hospitals', active: false, levels: 3, slots: 400, area: 'Jayanagar' },
    { id: 'aster_cmi', name: 'Aster CMI Hospital', active: false, levels: 3, slots: 500, area: 'Hebbal' },
    { id: 'sakra', name: 'Sakra World Hospital', active: false, levels: 2, slots: 350, area: 'Marathahalli' },
    { id: 'st_johns', name: 'St. John\'s Hospital', active: false, levels: 2, slots: 600, area: 'Koramangala' },
    { id: 'cloudnine', name: 'Cloudnine Hospital', active: false, levels: 1, slots: 150, area: 'Jayanagar' },
    { id: 'hbs_hosp', name: 'HBS Hospital', active: false, levels: 1, slots: 100, area: 'Shivajinagar' },
    { id: 'people_tree', name: 'People Tree Hospitals', active: false, levels: 2, slots: 200, area: 'Yeswanthpur' },
    { id: 'ramaiah', name: 'Ramaiah Memorial Hospital', active: false, levels: 3, slots: 400, area: 'New BEL Road' },
    { id: 'sparsh', name: 'Sparsh Hospital', active: false, levels: 2, slots: 250, area: 'Infantry Road' },
    { id: 'vydehi', name: 'Vydehi Institute of Medical', active: false, levels: 4, slots: 600, area: 'Whitefield' },
    { id: 'rainbow', name: 'Rainbow Children\'s Hospital', active: false, levels: 2, slots: 200, area: 'Marathahalli' },
    { id: 'motherhood', name: 'Motherhood Hospital', active: false, levels: 2, slots: 180, area: 'Indiranagar' },
    { id: 'baptist', name: 'Baptist Hospital', active: false, levels: 2, slots: 300, area: 'Hebbal' },
    { id: 'bgs_gleneagles', name: 'BGS Gleneagles Hospital', active: false, levels: 3, slots: 450, area: 'Kengeri' },
    { id: 'shankara_eye', name: 'Shankara Eye Hospital', active: false, levels: 1, slots: 120, area: 'Kundalahalli' },
    { id: 'kidwai', name: 'Kidwai Institute of Oncology', active: false, levels: 2, slots: 300, area: 'Jayanagar' }
];

// 2. Global State Store
let appState = {
    currentView: 'login-view',
    currentCity: null,
    currentCategory: null, // 'mall' or 'hospital'
    currentAssetId: null,
    currentLevel: null,
    selectedSpotId: null,
    slotsData: {}, // Map of spotId -> spotState
    simulationInterval: null
};

// 3. Helper Utility Functions
function getRowLabel(index) {
    if (index < 26) {
        return String.fromCharCode(65 + index); // A-Z
    } else {
        return 'A' + String.fromCharCode(65 + (index - 26)); // AA-AD
    }
}

function getAssetTotalRows(assetId, config) {
    const N = config.slotsPerLevel;
    const W = config.slotsPerRow;
    let pathCellsPerRowOffset = 0;
    
    if (assetId === 'orion') {
        pathCellsPerRowOffset = 9;
    } else if (assetId === 'mantri') {
        pathCellsPerRowOffset = 8;
    } else if (assetId === 'manipal') {
        pathCellsPerRowOffset = 9;
    } else if (assetId === 'fortis') {
        pathCellsPerRowOffset = 6;
    } else {
        const midCol = Math.floor((W + 1) / 2);
        pathCellsPerRowOffset = midCol - 1;
    }
    
    return Math.ceil((N + pathCellsPerRowOffset) / (W - 1));
}

function getPathType(assetId, r, s, totalRows, slotsPerRow) {
    // Intercept lift location for all facilities
    if (assetId === 'orion' && r === 11 && s === 5) {
        return { isPath: true, arrow: '🛗', label: 'LIFT' };
    }
    if (assetId === 'mantri' && r === 11 && s === 8) {
        return { isPath: true, arrow: '🛗', label: 'LIFT' };
    }
    if (assetId === 'manipal' && r === 6 && s === 7) {
        return { isPath: true, arrow: '🛗', label: 'LIFT' };
    }
    if (assetId === 'fortis' && r === 4 && s === 6) {
        return { isPath: true, arrow: '🛗', label: 'LIFT' };
    }

    let isPath = false;
    let arrow = '';
    let label = '';
    
    if (assetId === 'orion') {
        const midCol = Math.floor((slotsPerRow + 1) / 2); // 10
        const midRow = Math.floor(totalRows / 2); // 11
        
        if (r < midRow && s === midCol) {
            isPath = true;
            arrow = '↓';
            if (r === 0) label = 'ENTRY';
        } else if (r === midRow && s >= 1 && s <= midCol) {
            isPath = true;
            if (s === midCol) {
                arrow = '↲';
            } else {
                arrow = '←';
            }
        } else if (r > midRow && s === 1) {
            isPath = true;
            arrow = '↓';
            if (r === totalRows - 1) label = 'EXIT';
        }
    } else if (assetId === 'mantri') {
        const entryCol = 4;
        const exitCol = 12;
        const midRow = Math.floor(totalRows / 2); // 11
        
        if (r < midRow && s === entryCol) {
            isPath = true;
            arrow = '↓';
            if (r === 0) label = 'ENTRY';
        } else if (r === midRow && s >= entryCol && s <= exitCol) {
            isPath = true;
            if (s === entryCol) {
                arrow = '↳'; // turns right
            } else {
                arrow = '→';
            }
        } else if (r > midRow && s === exitCol) {
            isPath = true;
            arrow = '↓';
            if (r === totalRows - 1) label = 'EXIT';
        }
    } else if (assetId === 'manipal') {
        const entryCol = 12;
        const exitCol = 3;
        const midRow = Math.floor(totalRows / 2); // 6
        
        if (r < midRow && s === entryCol) {
            isPath = true;
            arrow = '↓';
            if (r === 0) label = 'ENTRY';
        } else if (r === midRow && s >= exitCol && s <= entryCol) {
            isPath = true;
            if (s === entryCol) {
                arrow = '↲'; // turns left
            } else {
                arrow = '←';
            }
        } else if (r > midRow && s === exitCol) {
            isPath = true;
            arrow = '↓';
            if (r === totalRows - 1) label = 'EXIT';
        }
    } else if (assetId === 'fortis') {
        const entryCol = 3;
        const exitCol = 9;
        const midRow = 4; // custom row turn
        
        if (r < midRow && s === entryCol) {
            isPath = true;
            arrow = '↓';
            if (r === 0) label = 'ENTRY';
        } else if (r === midRow && s >= entryCol && s <= exitCol) {
            isPath = true;
            if (s === entryCol) {
                arrow = '↳'; // turns right
            } else {
                arrow = '→';
            }
        } else if (r > midRow && s === exitCol) {
            isPath = true;
            arrow = '↓';
            if (r === totalRows - 1) label = 'EXIT';
        }
    } else {
        const midCol = Math.floor((slotsPerRow + 1) / 2);
        const midRow = Math.floor(totalRows / 2);
        
        if (r < midRow && s === midCol) {
            isPath = true;
            arrow = '↓';
            if (r === 0) label = 'ENTRY';
        } else if (r === midRow && s >= 1 && s <= midCol) {
            isPath = true;
            if (s === midCol) {
                arrow = '↲';
            } else {
                arrow = '←';
            }
        } else if (r > midRow && s === 1) {
            isPath = true;
            arrow = '↓';
            if (r === totalRows - 1) label = 'EXIT';
        }
    }
    
    return { isPath, arrow, label };
}

function updateFloorStatsBadge() {
    const badge = document.getElementById('floor-stats-badge');
    if (!badge) return;
    
    let floorTotal = 0;
    let floorAvailable = 0;
    let floorOccupied = 0;
    
    Object.values(appState.slotsData).forEach(slot => {
        if (slot.level === appState.currentLevel) {
            floorTotal++;
            if (slot.status === 'available') floorAvailable++;
            if (slot.status === 'occupied') floorOccupied++;
        }
    });
    
    badge.innerHTML = `
        <span class="floor-badge-title">${appState.currentLevel === 'L1' ? 'Ground Level' : 'Level ' + appState.currentLevel.substring(1)}:</span>
        <span class="floor-stat-item"><span class="color-dot available"></span> ${floorAvailable} Vacant</span>
        <span class="floor-stat-item"><span class="color-dot occupied"></span> ${floorOccupied} Occupied</span>
    `;
}

function generateRandomPlate() {
    const states = ['KA', 'MH', 'DL', 'TN', 'TS', 'AP', 'KA'];
    const state = states[Math.floor(Math.random() * states.length)];
    const distCode = String(Math.floor(Math.random() * 15) + 1).padStart(2, '0');
    const letters = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const digits = String(Math.floor(Math.random() * 9000) + 1000);
    return `${state}-${distCode}-${letters}-${digits}`;
}

function formatTime(date) {
    return date.toTimeString().split(' ')[0];
}

// 4. View Navigation Engine
function switchView(viewId) {
    console.log(`Switching to view: ${viewId}`);
    document.querySelectorAll('.view').forEach(view => {
        view.classList.add('hidden');
    });
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.remove('hidden');
        appState.currentView = viewId;
    }

    // Clean up simulation if leaving dashboard
    if (viewId !== 'dashboard-view') {
        stopSimulation();
    }
}

// 5. Initialize State Store for Selected Asset
function initAssetSlots(assetId) {
    const config = ASSET_CONFIGS[assetId];
    if (!config) return;

    appState.slotsData = {};
    appState.currentAssetId = assetId;
    appState.currentLevel = config.levels[0];
    appState.selectedSpotId = null;

    // Seed data
    config.levels.forEach(lvl => {
        const slotsPerRow = config.slotsPerRow;
        const totalRows = getAssetTotalRows(assetId, config);
        let slotIndex = 1;

        for (let r = 0; r < totalRows; r++) {
            const rowLabel = getRowLabel(r);
            for (let s = 1; s <= slotsPerRow; s++) {
                if (slotIndex > config.slotsPerLevel) break;

                const pathInfo = getPathType(assetId, r, s, totalRows, slotsPerRow);
                if (pathInfo.isPath) {
                    continue; // Skip seeding coordinate in slotsData
                }

                const baseSpotId = `${lvl}-${rowLabel}${String(s).padStart(2, '0')}`;
                
                // Determine space type
                let type = 'standard';
                // First slot of first 4 rows is EV Charging
                if (r < 4 && s === 1) {
                    type = 'ev';
                }
                // Second slot of first 4 rows is Handicap
                else if (r < 4 && s === 2) {
                    type = 'handicap';
                }

                if (assetId === 'mantri') {
                    // Seed Top and Bottom sub-spots
                    ['T', 'B'].forEach(stack => {
                        const spotId = `${baseSpotId}-${stack}`;
                        const rand = Math.random();
                        let status = 'available';
                        let vehiclePlate = '--';
                        let sessionStart = null;

                        if (rand > 0.60) {
                            status = 'occupied';
                            vehiclePlate = generateRandomPlate();
                            sessionStart = new Date(Date.now() - Math.floor(Math.random() * 4 * 3600 * 1000));
                        }

                        appState.slotsData[spotId] = {
                            id: spotId,
                            level: lvl,
                            row: rowLabel,
                            number: s,
                            stack: stack === 'T' ? 'top' : 'bottom',
                            status: status,
                            type: stack === 'T' ? 'standard' : type,
                            vehiclePlate: vehiclePlate,
                            sessionStart: sessionStart,
                            sensorId: `IoT-SN-${lvl}-${rowLabel}${s}-${stack}-${Math.floor(1000 + Math.random() * 9000)}`
                        };
                    });
                } else {
                    // Random initial status seeding: 60% available, 40% occupied
                    const rand = Math.random();
                    let status = 'available';
                    let vehiclePlate = '--';
                    let sessionStart = null;

                    if (rand > 0.60) {
                        status = 'occupied';
                        vehiclePlate = generateRandomPlate();
                        sessionStart = new Date(Date.now() - Math.floor(Math.random() * 4 * 3600 * 1000));
                    }

                    appState.slotsData[baseSpotId] = {
                        id: baseSpotId,
                        level: lvl,
                        row: rowLabel,
                        number: s,
                        status: status,
                        type: type,
                        vehiclePlate: vehiclePlate,
                        sessionStart: sessionStart,
                        sensorId: `IoT-SN-${lvl}-${rowLabel}${s}-${Math.floor(1000 + Math.random() * 9000)}`
                    };
                }
                slotIndex++;
            }
        }
    });

    console.log(`Initialized ${Object.keys(appState.slotsData).length} slots for ${config.name}`);
    addLog(`System initialized. Loaded configuration for ${config.name}.`, 'telemetry');
}

// 6. UI Rendering Engine
function renderAssetsList() {
    const container = document.getElementById('assets-container');
    if (!container) return;

    container.innerHTML = '';
    const assets = appState.currentCategory === 'mall' ? TOP_MALLS : TOP_HOSPITALS;
    
    // Update Title in the Assets List page
    const titleEl = document.getElementById('asset-view-title');
    const subtitleEl = document.getElementById('asset-view-subtitle');
    if (appState.currentCategory === 'mall') {
        titleEl.textContent = 'Bangalore Hub Malls';
        subtitleEl.textContent = 'Select a commercial asset to view live occupancy plans';
    } else {
        titleEl.textContent = 'Bangalore Hub Hospitals';
        subtitleEl.textContent = 'Select a healthcare medical asset to view live occupancy plans';
    }

    assets.forEach(asset => {
        const card = document.createElement('div');
        card.className = `glass-card mall-card ${asset.active ? 'active' : 'disabled'}`;
        card.setAttribute('data-asset-id', asset.id);

        const assetIcon = appState.currentCategory === 'mall'
            ? `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>`
            : `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>`;

        card.innerHTML = `
            <div class="mall-header">
                <h3>${asset.name}</h3>
                <span class="badge ${asset.active ? 'badge-success' : 'badge-warning'}">
                    ${asset.active ? 'Active' : 'Offline'}
                </span>
            </div>
            <div class="mall-meta">
                <span>
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    ${asset.area}
                </span>
                <span>
                    ${assetIcon}
                    ${asset.levels} Levels &bull; ${asset.slots} Total Slots
                </span>
            </div>
        `;

        if (asset.active) {
            card.addEventListener('click', () => {
                selectAsset(asset.id);
            });
        }
        container.appendChild(card);
    });
}

function selectAsset(assetId) {
    initAssetSlots(assetId);
    
    // Update Dashboard Nav labels
    const config = ASSET_CONFIGS[assetId];
    document.getElementById('nav-mall-name').textContent = config.name;
    document.getElementById('nav-mall-city').textContent = config.city;
    document.getElementById('header-mall-title').textContent = `${config.name} Parking`;

    // Reset layout tabs
    const tabContainer = document.getElementById('level-tabs');
    tabContainer.innerHTML = '';
    config.levels.forEach((lvl, idx) => {
        const btn = document.createElement('button');
        btn.className = `tab-btn ${idx === 0 ? 'active' : ''}`;
        btn.textContent = lvl === 'L1' ? 'Ground Level' : `Level ${lvl.substring(1)}`;
        btn.setAttribute('data-level', lvl);
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            appState.currentLevel = lvl;
            renderParkingGrid();
        });
        tabContainer.appendChild(btn);
    });



    renderParkingGrid();
    updateStatistics();
    
    // Start automated simulation
    startSimulation();

    switchView('dashboard-view');
}

function renderParkingGrid() {
    const gridContainer = document.getElementById('parking-grid');
    if (!gridContainer) return;

    gridContainer.innerHTML = '';
    const config = ASSET_CONFIGS[appState.currentAssetId];
    if (!config) return;

    const totalRows = getAssetTotalRows(appState.currentAssetId, config);
    
    for (let r = 0; r < totalRows; r++) {
        const rowLabel = getRowLabel(r);
        
        const rowDiv = document.createElement('div');
        rowDiv.className = 'grid-row-container';
        
        const labelSpan = document.createElement('span');
        labelSpan.className = 'row-label';
        labelSpan.textContent = `Row ${rowLabel}`;
        rowDiv.appendChild(labelSpan);

        const slotsDiv = document.createElement('div');
        slotsDiv.className = 'row-slots';

        for (let s = 1; s <= config.slotsPerRow; s++) {
            const pathInfo = getPathType(appState.currentAssetId, r, s, totalRows, config.slotsPerRow);
            if (pathInfo.isPath) {
                const pathBtn = document.createElement('div');
                pathBtn.className = 'parking-spot drive-path-cell';
                
                let pathContent = '';
                if (pathInfo.label) {
                    pathContent += `<span class="path-label">${pathInfo.label}</span>`;
                }
                pathContent += `<span class="path-arrow">${pathInfo.arrow}</span>`;
                
                pathBtn.innerHTML = pathContent;
                slotsDiv.appendChild(pathBtn);
            } else {
                const baseSpotId = `${appState.currentLevel}-${rowLabel}${String(s).padStart(2, '0')}`;
                
                if (appState.currentAssetId === 'mantri') {
                    const spotBtn = document.createElement('div');
                    spotBtn.className = 'parking-spot stacker-spot-container';
                    
                    const spotIdT = `${baseSpotId}-T`;
                    const spotIdB = `${baseSpotId}-B`;
                    
                    const spotDataT = appState.slotsData[spotIdT];
                    const spotDataB = appState.slotsData[spotIdB];
                    
                    if (spotDataT && spotDataB) {
                        let typeBadgeT = '';
                        if (spotDataT.type === 'ev')       typeBadgeT = `<span class="spot-type-icon" title="EV Charging Hub"><svg viewBox="0 0 24 24" width="8" height="8" fill="currentColor" stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg></span>`;
                        if (spotDataT.type === 'handicap') typeBadgeT = `<span class="spot-type-icon" title="Handicap Parking"><svg viewBox="0 0 24 24" width="8" height="8" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path><path d="M10 14h4"></path><path d="M12 14v6"></path><path d="M9 20h6"></path><path d="m15 11-3 3-3-3"></path></svg></span>`;
                        
                        let typeBadgeB = '';
                        if (spotDataB.type === 'ev')       typeBadgeB = `<span class="spot-type-icon" title="EV Charging Hub"><svg viewBox="0 0 24 24" width="8" height="8" fill="currentColor" stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg></span>`;
                        if (spotDataB.type === 'handicap') typeBadgeB = `<span class="spot-type-icon" title="Handicap Parking"><svg viewBox="0 0 24 24" width="8" height="8" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path><path d="M10 14h4"></path><path d="M12 14v6"></path><path d="M9 20h6"></path><path d="m15 11-3 3-3-3"></path></svg></span>`;
                        
                        const elT = document.createElement('div');
                        elT.className = `sub-spot top ${spotDataT.status}`;
                        if (spotDataT.type === 'ev') elT.classList.add('ev-spot');
                        if (spotDataT.type === 'handicap') elT.classList.add('handicap-spot');
                        elT.innerHTML = `
                            <span class="spot-id">${rowLabel}${s}↑</span>
                            <div class="spot-indicator-car"></div>
                            ${typeBadgeT}
                        `;
                        
                        const elB = document.createElement('div');
                        elB.className = `sub-spot bottom ${spotDataB.status}`;
                        if (spotDataB.type === 'ev') elB.classList.add('ev-spot');
                        if (spotDataB.type === 'handicap') elB.classList.add('handicap-spot');
                        elB.innerHTML = `
                            <span class="spot-id">${rowLabel}${s}↓</span>
                            <div class="spot-indicator-car"></div>
                            ${typeBadgeB}
                        `;
                        
                        spotBtn.appendChild(elT);
                        spotBtn.appendChild(elB);
                    }
                    slotsDiv.appendChild(spotBtn);
                } else {
                    const spotId = `${appState.currentLevel}-${rowLabel}${String(s).padStart(2, '0')}`;
                    const spotData = appState.slotsData[spotId];
                    if (!spotData) continue;

                    const spotBtn = document.createElement('div');
                    spotBtn.className = `parking-spot ${spotData.status}`;
                    spotBtn.setAttribute('data-spot-id', spotId);

                    // Add specific feature overlays
                    if (spotData.type === 'ev') {
                        spotBtn.classList.add('ev-spot');
                    } else if (spotData.type === 'handicap') {
                        spotBtn.classList.add('handicap-spot');
                    }

                    // Inside visuals: ID label, Car graphic placeholder, or Reserved pin
                    let typeBadge = '';
                    if (spotData.type === 'ev') {
                        typeBadge = `<span class="spot-type-icon" title="EV Charging Hub"><svg viewBox="0 0 24 24" width="8" height="8" fill="currentColor" stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg></span>`;
                    } else if (spotData.type === 'handicap') {
                        typeBadge = `<span class="spot-type-icon" title="Handicap Parking"><svg viewBox="0 0 24 24" width="8" height="8" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path><path d="M10 14h4"></path><path d="M12 14v6"></path><path d="M9 20h6"></path><path d="m15 11-3 3-3-3"></path></svg></span>`;
                    }

                    spotBtn.innerHTML = `
                        <span class="spot-id">${rowLabel}${s}</span>
                        <div class="spot-indicator-car"></div>
                        ${typeBadge}
                    `;

                    slotsDiv.appendChild(spotBtn);
                }
            }
        }

        rowDiv.appendChild(slotsDiv);
        gridContainer.appendChild(rowDiv);
    }
    
    updateFloorStatsBadge();
}

// 7. Interactive Slot Inspector (Removed)

// 8. Statistics Counter Re-calculations
function updateStatistics() {
    let total = 0;
    let available = 0;
    let occupied = 0;

    Object.values(appState.slotsData).forEach(slot => {
        total++;
        if (slot.status === 'available') available++;
        if (slot.status === 'occupied') occupied++;
    });

    document.getElementById('stat-total-slots').textContent = total;
    document.getElementById('stat-available-slots').textContent = available;
    document.getElementById('stat-occupied-slots').textContent = occupied;

    // Occupancy Rate circle percentage calculations
    const rate = total > 0 ? (occupied / total) * 100 : 0;
    document.getElementById('stat-occupancy-percent').textContent = `${rate.toFixed(1)}%`;
    document.getElementById('stat-occupancy-rate').textContent = `${Math.round(rate)}%`;

    const circle = document.querySelector('.circular-progress');
    if (circle) {
        const deg = (rate / 100) * 360;
        circle.style.background = `conic-gradient(var(--primary) ${deg}deg, rgba(255, 255, 255, 0.05) ${deg}deg)`;
    }

    // Peak rate descriptive tags
    const trendLabel = document.getElementById('stat-trend-label');
    if (trendLabel) {
        if (rate < 40) {
            trendLabel.textContent = 'Low demand period';
            trendLabel.className = 'stat-trend neutral';
        } else if (rate >= 40 && rate < 75) {
            trendLabel.textContent = 'Moderate demand';
            trendLabel.className = 'stat-trend yellow';
        } else {
            trendLabel.textContent = 'Peak load capacity!';
            trendLabel.className = 'stat-trend red';
        }
    }

    updateFloorStatsBadge();
}

// 9. Telemetry Terminal Logger
function addLog(message, type = 'telemetry') {
    const consoleEl = document.getElementById('log-console');
    if (!consoleEl) return;

    const time = formatTime(new Date());
    const line = document.createElement('div');
    line.className = `log-line ${type}`;
    line.innerHTML = `<span class="log-time">[${time}]</span> ${message}`;

    consoleEl.appendChild(line);
    consoleEl.scrollTop = consoleEl.scrollHeight;

    // Cap log size to 60 elements
    while (consoleEl.children.length > 60) {
        consoleEl.removeChild(consoleEl.firstChild);
    }
}

// 10. Manual Sensor Simulator Action Logic (Removed)

// 11. Automated Traffic background Simulator
function startSimulation() {
    if (appState.simulationInterval) clearInterval(appState.simulationInterval);

    document.getElementById('sim-running-pulse').className = 'pulse-indicator green';

    appState.simulationInterval = setInterval(() => {
        const toggle = document.getElementById('auto-sim-toggle');
        if (!toggle || !toggle.checked) return;

        const allSlots = Object.values(appState.slotsData);
        if (allSlots.length === 0) return;

        // Choose random spot
        const randSlot = allSlots[Math.floor(Math.random() * allSlots.length)];
        const randVal = Math.random();

        if (randSlot.status === 'available') {
            // 35% chance to fill spot
            if (randVal < 0.35) {
                randSlot.status = 'occupied';
                randSlot.vehiclePlate = generateRandomPlate();
                randSlot.sessionStart = new Date();
                
                // Log event
                addLog(`Loop Detector active: Vehicle ${randSlot.vehiclePlate} parked in slot ${randSlot.id}.`, 'entry');
                
                // If it is on the current level, trigger redraw
                if (randSlot.level === appState.currentLevel) {
                    renderParkingGrid();
                }
                updateStatistics();
            }
        } else if (randSlot.status === 'occupied') {
            // 40% chance to leave spot
            if (randVal < 0.40) {
                const oldPlate = randSlot.vehiclePlate;
                randSlot.status = 'available';
                randSlot.vehiclePlate = '--';
                randSlot.sessionStart = null;
                
                addLog(`ANPR checkout: Vehicle ${oldPlate} cleared from slot ${randSlot.id}.`, 'exit');
                
                if (randSlot.level === appState.currentLevel) {
                    renderParkingGrid();
                }
                updateStatistics();
            }
        }
    }, 1000);
}

function stopSimulation() {
    if (appState.simulationInterval) {
        clearInterval(appState.simulationInterval);
        appState.simulationInterval = null;
    }
    const pulse = document.getElementById('sim-running-pulse');
    if (pulse) pulse.className = 'pulse-indicator red';
}



function getInitials(name) {
    if (!name) return 'US';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
}

function updateUserUI(user) {
    const isSuperUser = user.username.toLowerCase() === 'abc';
    const roleText = isSuperUser ? 'Super-User' : 'User';
    const nameText = user.name || user.username;
    const initials = isSuperUser ? 'AD' : getInitials(nameText);

    // Update sidebar bottom (dashboard view)
    const sidebarAvatar = document.getElementById('sidebar-user-avatar');
    const sidebarName = document.getElementById('sidebar-user-name');
    const sidebarRole = document.getElementById('sidebar-user-role');
    
    if (sidebarAvatar) sidebarAvatar.textContent = initials;
    if (sidebarName) sidebarName.textContent = nameText;
    if (sidebarRole) sidebarRole.textContent = roleText;

    // Update navbar headers (city, category, asset views)
    document.querySelectorAll('.user-role').forEach(el => {
        el.textContent = isSuperUser ? 'Administrator' : nameText;
    });
}

/// 13. Application Event Listeners & Bootstrapping
document.addEventListener('DOMContentLoaded', () => {
    
    // AUTH SWITCHING LOGIC (Swap Sign In and Sign Up forms)
    const linkToSignup = document.getElementById('link-to-signup');
    const linkToSignin = document.getElementById('link-to-signin');
    const signinForm = document.getElementById('signin-form-wrapper');
    const signupForm = document.getElementById('signup-form-wrapper');
    const loginError = document.getElementById('login-error');
    const signupError = document.getElementById('signup-error');
    const successToast = document.getElementById('signup-success-toast');

    if (linkToSignup && linkToSignin && signinForm && signupForm) {
        linkToSignup.addEventListener('click', (e) => {
            e.preventDefault();
            if (loginError) loginError.classList.add('hidden');
            if (signupError) signupError.classList.add('hidden');
            if (successToast) successToast.classList.add('hidden');
            
            signinForm.classList.add('hidden');
            signupForm.classList.remove('hidden');
        });

        linkToSignin.addEventListener('click', (e) => {
            e.preventDefault();
            if (loginError) loginError.classList.add('hidden');
            if (signupError) signupError.classList.add('hidden');
            
            signupForm.classList.add('hidden');
            signinForm.classList.remove('hidden');
        });
    }

    // LOGIN FORM SUBMISSION (Validate against localStorage)
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = document.getElementById('username').value.trim();
            const pass = document.getElementById('password').value.trim();

            const users = getUsers();
            const foundUser = users.find(u => u.username.toLowerCase() === user.toLowerCase() && u.password === pass);

            if (foundUser) {
                if (loginError) loginError.classList.add('hidden');
                if (successToast) successToast.classList.add('hidden');
                
                appState.currentUser = foundUser;
                updateUserUI(foundUser);
                switchView('city-view');
            } else {
                if (loginError) loginError.classList.remove('hidden');
            }
        });
    }

    // SIGN UP FORM SUBMISSION (Write to localStorage)
    const signupFormEl = document.getElementById('signup-form');
    if (signupFormEl) {
        let successToastTimeout;
        signupFormEl.addEventListener('submit', (e) => {
            e.preventDefault();
            const fullName = document.getElementById('signup-fullname').value.trim();
            const email = document.getElementById('signup-email').value.trim();
            const username = document.getElementById('signup-username').value.trim();
            const pass = document.getElementById('signup-password').value.trim();
            const confirmPass = document.getElementById('signup-confirm-password').value.trim();
            const signupErrorText = document.getElementById('signup-error-text');

            if (pass !== confirmPass) {
                if (signupErrorText) signupErrorText.textContent = "Passwords do not match.";
                if (signupError) signupError.classList.remove('hidden');
                return;
            }

            const registerResult = registerUser(username, pass, fullName, email);
            if (registerResult.success) {
                if (signupError) signupError.classList.add('hidden');
                signupFormEl.reset();

                // Swap back to the Sign In panel immediately
                if (signupForm) signupForm.classList.add('hidden');
                if (signinForm) signinForm.classList.remove('hidden');

                // Pre-fill the username input field with the registered username
                const usernameInput = document.getElementById('username');
                if (usernameInput) {
                    usernameInput.value = username;
                    usernameInput.focus();
                }

                // Clear password input field to be safe
                const passwordInput = document.getElementById('password');
                if (passwordInput) passwordInput.value = '';

                // Display a temporary, non-blocking green success message toast
                if (successToast) {
                    successToast.classList.remove('hidden');
                    if (successToastTimeout) clearTimeout(successToastTimeout);
                    successToastTimeout = setTimeout(() => {
                        successToast.classList.add('hidden');
                    }, 4000);
                }
            } else {
                if (signupErrorText) signupErrorText.textContent = registerResult.message;
                if (signupError) signupError.classList.remove('hidden');
            }
        });
    }

    // LOGOUT BUTTONS
    document.querySelectorAll('.btn-logout, .btn-logout-icon').forEach(btn => {
        btn.addEventListener('click', () => {
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            if (usernameInput) usernameInput.value = '';
            if (passwordInput) passwordInput.value = '';
            if (loginError) loginError.classList.add('hidden');
            if (signupError) signupError.classList.add('hidden');
            if (successToast) successToast.classList.add('hidden');
            
            if (signupForm) signupForm.classList.add('hidden');
            if (signinForm) signinForm.classList.remove('hidden');

            switchView('login-view');
        });
    });

    // CITY CARD CLICKS -> Goes to Category view
    document.querySelectorAll('.city-card').forEach(card => {
        card.addEventListener('click', () => {
            if (card.classList.contains('active')) {
                appState.currentCity = card.getAttribute('data-city');
                switchView('category-view');
            }
        });
    });

    // CATEGORY CARD CLICKS -> Goes to Asset view (Malls or Hospitals)
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            if (card.classList.contains('disabled')) return;
            appState.currentCategory = card.getAttribute('data-category');
            renderAssetsList();
            switchView('asset-view');
        });
    });

    // NAVIGATION LINKS
    const backToCitiesCategory = document.getElementById('back-to-cities-category');
    if (backToCitiesCategory) {
        backToCitiesCategory.addEventListener('click', () => {
            switchView('city-view');
        });
    }

    const backToCategories = document.getElementById('back-to-categories');
    if (backToCategories) {
        backToCategories.addEventListener('click', () => {
            switchView('category-view');
        });
    }

    const backToAssets = document.getElementById('menu-back-assets');
    if (backToAssets) {
        backToAssets.addEventListener('click', () => {
            switchView('asset-view');
        });
    }

    // SEARCH BAR LOGIC
    const searchInput = document.getElementById('asset-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            document.querySelectorAll('.mall-card').forEach(card => {
                const assetName = card.querySelector('h3').textContent.toLowerCase();
                const assetArea = card.querySelector('.mall-meta').textContent.toLowerCase();
                if (assetName.includes(query) || assetArea.includes(query)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // SIMULATION CHECKBOX HANDLER
    const simCheckbox = document.getElementById('auto-sim-toggle');
    if (simCheckbox) {
        simCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                startSimulation();
            } else {
                stopSimulation();
            }
        });
    }

    // LOGS CLEAR
    const clearLogsBtn = document.getElementById('btn-clear-logs');
    if (clearLogsBtn) {
        clearLogsBtn.addEventListener('click', () => {
            document.getElementById('log-console').innerHTML = '';
        });
    }

    // GLOBAL THEME SWITCH TOGGLE BINDINGS
    document.querySelectorAll('.btn-theme-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            toggleGlobalTheme();
        });
    });

    // VOICE TOGGLE BINDINGS
    document.querySelectorAll('.btn-voice-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            toggleVoiceAssistant();
        });
    });

    // INITIALIZE LANDING PAGE CANVAS & TYPING EFFECT
    initLandingCanvas();
    initTypist();

    // Default start view
    switchView('login-view');
});
