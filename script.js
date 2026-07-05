const cursorCenter = document.querySelector('.cursor-center');
const cursorBounds = document.querySelector('.cursor-bounds');
let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
let cursorX = mouseX, cursorY = mouseY;
let boundsX = mouseX, boundsY = mouseY;

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    const coords = document.getElementById('cursor-coords');
    if (coords) coords.innerText = `X:${String(Math.floor(mouseX)).padStart(4, '0')} Y:${String(Math.floor(mouseY)).padStart(4, '0')}`;
});

gsap.ticker.add(() => {
    if (document.body.classList.contains('modal-active')) return;
    
    cursorX += (mouseX - cursorX) * 0.5;
    cursorY += (mouseY - cursorY) * 0.5;
    boundsX += (mouseX - boundsX) * 0.15;
    boundsY += (mouseY - boundsY) * 0.15;
    
    gsap.set(cursorCenter, { x: cursorX, y: cursorY });
    gsap.set(cursorBounds, { x: boundsX, y: boundsY });
});

const interactives = document.querySelectorAll('a, button, input, textarea, .interactive-card, .close-modal');
interactives.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hover-state'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hover-state'));
});

const magnets = document.querySelectorAll('.magnetic-wrap');
magnets.forEach(wrap => {
    const inner = wrap.querySelector('.magnetic-inner');
    wrap.addEventListener('mousemove', (e) => {
        const rect = wrap.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.4;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.4;
        gsap.to(inner, { x, y, duration: 0.3, ease: "power2.out" });
    });
    wrap.addEventListener('mouseleave', () => {
        gsap.to(inner, { x: 0, y: 0, duration: 1.5, ease: "elastic.out(1, 0.3)" });
    });
});

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
function cipherText(element, originalText, duration = 1000) {
    let startTime = Date.now();
    const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;
        
        if (progress >= 1) {
            clearInterval(interval);
            element.innerText = originalText;
            return;
        }
        
        element.innerText = originalText.split("").map((char, index) => {
            if (char === " ") return " ";
            if (index < originalText.length * progress) return originalText[index];
            return chars[Math.floor(Math.random() * chars.length)];
        }).join("");
    }, 30);
}

document.querySelectorAll('.scramble-on-hover').forEach(el => {
    const original = el.innerText;
    el.parentElement.addEventListener('mouseenter', () => cipherText(el, original, 600));
});

const loader = document.getElementById('loader');
const loaderBar = document.getElementById('loader-bar');
const loaderVal = document.getElementById('l-val');
const biosTerminal = document.getElementById('bios-terminal');

const biosLogs = [
    "ACPI: Core revision 20260704",
    "PM: RTC time: 06:44:00, date: 2026-07-04",
    "NET: Registered protocol family 2",
    "Initializing High Performance Subsystems...",
    "[OK] Mount root file system.",
    "[OK] Bypass Neural Firewall.",
    "Loading GUI Matrix..."
];

let loadProgress = 0;
let logIndex = 0;

const biosInterval = setInterval(() => {
    if (logIndex < biosLogs.length) {
        const p = document.createElement('div');
        p.className = 'bios-line';
        p.innerHTML = `> <span class="bios-highlight">[${String(Math.random()).substring(2, 8)}]</span> ${biosLogs[logIndex]}`;
        biosTerminal.appendChild(p);
        biosTerminal.scrollTop = biosTerminal.scrollHeight;
        logIndex++;
    }
}, 300);

const bootSeq = setInterval(() => {
    loadProgress += Math.random() * 6 + 1;
    if (loadProgress >= 100) {
        loadProgress = 100;
        clearInterval(bootSeq);
        clearInterval(biosInterval);
        
        gsap.to(loader, {
            yPercent: -100,
            opacity: 0,
            duration: 0.1,
            ease: "expo.inOut",
            onComplete: () => {
                document.body.classList.remove('loading');
                initSceneGens();
            }
        });
    }
    loaderBar.style.width = `${loadProgress}%`;
    loaderVal.innerText = Math.floor(loadProgress).toString().padStart(2, '0');
}, 100);

fetch('https://ipapi.co/json/')
    .then(res => res.json())
    .then(data => {
        document.querySelector('#geo-lat .val').textContent = parseFloat(data.latitude).toFixed(4);
        document.querySelector('#geo-lng .val').textContent = parseFloat(data.longitude).toFixed(4);
    })
    .catch(() => {
        document.querySelector('#geo-lat .val').textContent = "40.7128";
        document.querySelector('#geo-lng .val').textContent = "-74.0060";
    });

setInterval(() => {
    const d = new Date();
    const clock = document.querySelector('.clock');
    if (clock) clock.innerText = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}, 1000);

setInterval(() => {
    const val = Math.floor(Math.random() * 55) + 35;
    const valEl = document.getElementById('mem-val');
    if(valEl) valEl.innerText = `${val}%`;
    
    const bars = document.querySelectorAll('#mem-bars span');
    const activeThreshold = Math.ceil((val / 100) * 5);
    bars.forEach((bar, idx) => {
        if (idx < activeThreshold) bar.classList.add('active');
        else bar.classList.remove('active');
    });
}, 2500);

const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({canvas, alpha: true, antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);

const geo = new THREE.TorusKnotGeometry(10, 3, 100, 16);
const mat = new THREE.MeshBasicMaterial({color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.1});
const mesh = new THREE.Mesh(geo, mat);
scene.add(mesh);

camera.position.z = 25;

let targetX = 0, targetY = 0;

window.addEventListener('mousemove', e => {
    targetX = (e.clientX - window.innerWidth/2) * 0.01;
    targetY = (e.clientY - window.innerHeight/2) * 0.01;
});

function anim3D() {
    requestAnimationFrame(anim3D);
    mesh.rotation.x += 0.0002; mesh.rotation.y += 0.0003;
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (-targetY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
}
anim3D();
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight);
});


window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

gsap.registerPlugin(ScrollTrigger);

function initSceneGens() {
    document.querySelectorAll('.glitch-target').forEach(el => {
        cipherText(el, el.getAttribute('data-text') || el.innerText, 1500);
    });

    const tl = gsap.timeline();
    tl.from(".title-line .reveal-text", { y: 150, skewY: 5, duration: 1.2, stagger: 0.15, ease: "power4.out" })
      .from(".float-anim", { y: 20, opacity: 0, duration: 1, ease: "power2.out" }, "-=0.8")
      .from(".fade-up-text", { y: 30, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.6")
      .from(".slide-in-right", { x: -30, opacity: 0, duration: 0.8, stagger: 0.1 }, "-=0.6");
}

document.querySelectorAll('.hover-3d').forEach(el => {
    el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xPct = x / rect.width - 0.5;
        const yPct = y / rect.height - 0.5;
        gsap.to(el, {
            rotationY: xPct * 15,
            rotationX: -yPct * 15,
            transformPerspective: 1000,
            ease: "power1.out",
            duration: 0.3
        });
    });
    el.addEventListener('mouseleave', () => {
        gsap.to(el, { rotationY: 0, rotationX: 0, duration: 0.6, ease: "power3.out" });
    });
});

gsap.utils.toArray('.view-section').forEach(sec => {
    if (sec.id === 'hero') return;
    
    ScrollTrigger.create({
        trigger: sec,
        start: "top 75%",
        onEnter: () => {
            gsap.to(sec.querySelector('.tracking-in'), { letterSpacing: "6px", opacity: 1, duration: 1.2, ease: "power3.out" });
            gsap.to(sec.querySelector('.load-line'), { width: "100%", duration: 1.5, ease: "power4.inOut" });
            
            const counters = sec.querySelectorAll('.counter-tgt');
            counters.forEach(c => {
                const target = parseInt(c.getAttribute('data-count'));
                gsap.to({ val: 0 }, {
                    val: target,
                    duration: 2,
                    ease: "power2.out",
                    onUpdate: function() { c.innerText = Math.floor(this.targets()[0].val); }
                });
            });

            gsap.fromTo(sec.querySelectorAll('.stagger-item'), 
                { opacity: 0, y: 30 }, 
                { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power2.out", overwrite: "auto" }
            );
        }
    });
});

const scrollThumb = document.querySelector('.scroll-thumb');
const scrollVal = document.querySelector('.scroll-val');

window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = window.scrollY / max;
    if (scrollThumb) gsap.to(scrollThumb, { top: `${progress * 80}%`, duration: 0.2, ease: "none" });
    if (scrollVal) scrollVal.innerText = Math.floor(progress * 100).toString().padStart(3, '0');
});

const projData = {
    eesa: {
        t: "EESA Platform", m: "FULLSTACK APPLICATION",
        d: "Architected and launched a production-ready, full-stack web application for the student association. Implemented secure role-based user access controls and state management using Firebase Authentication.",
        f: ["Role-based Access Control", "Real-time Event Management", "Production-grade UI Workflows", "Backend Synchronization"],
        tc: ["JavaScript", "Authentication", "Event Management"], l: "https://github.com/shreyb004/EESA-Club"
    },
    protojs: {
        t: "ProtoJS", m: "COMPILER DESIGN",
        d: "Engineered a custom syntax interpreter from scratch. Designed a recursive-descent parser and lexical analyzer. Developed low-level memory allocation and variable scoping mechanisms to optimize mathematical execution speeds.",
        f: ["Recursive-Descent Parser", "Custom Lexical Analyzer", "Low-level Memory Allocation", "Scope Management"],
        tc: ["JavaScript", "AST", "Compiler Theory"], l: "https://github.com/shreyb004/ProtoJS"
    },
    smartgrid: {
        t: "SmartGrid Automata", m: "EMBEDDED SYSTEM",
        d: "Built a high-performance hardware-software bridge using an ESP32 microcontroller integrated with Firebase Realtime Database. Authored logic-driven automated distribution algorithms in Embedded C++.",
        f: ["Real-time Telemetry Sync", "Dynamic Load Switching", "Fail-safe Overload Prevention", "Firmware-Cloud Integration"],
        tc: ["Embedded C++", "ESP32", "Websockets"], l: "https://github.com/shreyb004/SmartGrid"
    },
    chatapp: {
        t: "ChatApp Beta", m: "FIREBASE REALTIME",
        d: "Engineered a realtime communication platform utilizing Firebase RTDB. Ensured low latency state synchronization across distributed client interfaces. Abstracted complex websocket handling into streamlined functional modules.",
        f: ["Real-Time Message Syncing", "Secure Authentication Protocol", "Minimalist Cyberpunk UI", "Low-Latency Data Fetch"],
        tc: ["JavaScript", "Firebase", "Realtime DB"], l: "https://github.com/ShreyB004/ChatappBeta"
    },
    shree: {
        t: "Shree Engineering", m: "CORPORATE DEPLOYMENT",
        d: "Developed a premium, highly interactive web presence for an engineering firm. Utilized advanced DOM manipulation and scroll animations to present heavy industrial services in a modernized, lightweight viewport.",
        f: ["High-Performance GSAP Animations", "Responsive Industrial UI", "Advanced Scroll Events", "Cross-Platform Optimization"],
        tc: ["Frontend", "UI/UX", "GSAP"], l: "https://github.com/ShreyB004/Shree-Engineering"
    },
    invoice: {
        t: "Invoice Tracker", m: "GMAIL AUTOMATION",
        d: "Constructed a seamless cloud automation pipeline using Google Cloud Platform. Integrated the Gmail API to parse and notify users of incoming billing protocols autonomously, reducing manual overhead.",
        f: ["Google Cloud Integration", "Gmail API Notification Pipeline", "Automated Billing Recognition", "Backend Cron Jobs"],
        tc: ["Google Cloud", "Gmail API", "Node.js"], l: "https://github.com/ShreyB004/Invoice-Tracker"
    },
    todo: {
        t: "Advanced Todo", m: "FULLSTACK UTILITY",
        d: "Beyond a standard task manager, this artifact implements advanced CRUD logic combined with persistent remote database synchronization. Built to ensure offline resilience and instant multi-device continuity.",
        f: ["Complex CRUD Operations", "Database State Persistence", "Multi-Device Continuity", "Non-cliché Architecture"],
        tc: ["JavaScript", "Database", "Backend"], l: "https://github.com/ShreyB004/Todo-List"
    }
};

const modal = document.getElementById('project-modal');
const modalClose = document.querySelector('.close-modal');

document.querySelectorAll('.interactive-card').forEach(card => {
    card.addEventListener('click', async () => {
        const id = card.getAttribute('data-id');
        
        document.body.classList.add('modal-active');
        modal.classList.add('active');
        
        const modalAnimItems = document.querySelectorAll('.modal-anim-item');
        gsap.fromTo(modalAnimItems, 
            { y: 30, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, delay: 0.3, ease: "power3.out" }
        );
        
        if (id === 'github') {
            document.getElementById('m-title').innerText = "GitHub Matrix";
            document.getElementById('m-meta').innerText = "LIVE SYNC_";
            document.getElementById('m-desc').innerText = "Extracting raw architecture data from external endpoints...";
            document.getElementById('m-list').innerHTML = "<li>Awaiting Response...</li>";
            document.getElementById('m-tech').innerHTML = "<span>API Transmission</span>";
            document.getElementById('m-links').innerHTML = `<a href="https://github.com/shreyB004" target="_blank" class="magnetic-wrap"><span class="magnetic-inner">ACCESS PROFILE</span></a>`;
            
            try {
                const res = await fetch('https://api.github.com/users/shreyB004/repos?sort=updated&per_page=4');
                const data = await res.json();
                document.getElementById('m-desc').innerText = "Live structural data retrieved successfully.";
                document.getElementById('m-list').innerHTML = data.map(r => `<li><span class="highlight">${r.name}:</span> ${r.description || 'Raw repository data.'}</li>`).join('');
                document.getElementById('m-tech').innerHTML = data.map(r => `<span>${r.language || 'Protocol'}</span>`).join('');
            } catch {
                document.getElementById('m-desc').innerText = "Link failed. Firewall interference detected.";
                document.getElementById('m-list').innerHTML = "<li>ERR_CONNECTION_REFUSED</li>";
            }
        } else {
            const data = projData[id];
            document.getElementById('m-title').innerText = data.t;
            document.getElementById('m-meta').innerText = data.m;
            document.getElementById('m-desc').innerText = data.d;
            document.getElementById('m-list').innerHTML = data.f.map(f => `<li>${f}</li>`).join('');
            document.getElementById('m-tech').innerHTML = data.tc.map(t => `<span>${t}</span>`).join('');
            document.getElementById('m-links').innerHTML = `<a href="${data.l}" target="_blank" class="magnetic-wrap"><span class="magnetic-inner">INITIATE GITHUB</span></a>`;
        }
        
        cipherText(document.getElementById('m-title'), document.getElementById('m-title').innerText, 800);
    });
});

modalClose.addEventListener('click', () => {
    document.body.classList.remove('modal-active');
    modal.classList.remove('active');
});

modal.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop-fx') || e.target === modal) {
        document.body.classList.remove('modal-active');
        modal.classList.remove('active');
    }
});

const contactForm = document.getElementById('contact-uplink');
const fName = document.getElementById('f-name');
const fEmail = document.getElementById('f-email');
const fMsg = document.getElementById('f-msg');
const formStatus = document.getElementById('form-status');
const btnText = document.getElementById('submit-text');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    let isValid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    [fName, fEmail, fMsg].forEach(el => {
        el.classList.remove('error-state');
        document.getElementById(`err-${el.id.split('-')[1]}`).innerText = '';
    });
    formStatus.innerText = '';
    formStatus.className = 'form-status-msg';

    if (!fName.value.trim()) {
        fName.classList.add('error-state');
        document.getElementById('err-name').innerText = 'IDENTIFIER REQUIRED';
        isValid = false;
    }

    if (!fEmail.value.trim() || !emailRegex.test(fEmail.value.trim())) {
        fEmail.classList.add('error-state');
        document.getElementById('err-email').innerText = 'INVALID FREQUENCY';
        isValid = false;
    }

    if (!fMsg.value.trim()) {
        fMsg.classList.add('error-state');
        document.getElementById('err-msg').innerText = 'PAYLOAD CANNOT BE EMPTY';
        isValid = false;
    }

    if (isValid) {
        btnText.innerText = "TRANSMITTING...";
        
        setTimeout(() => {
            btnText.innerText = "TRANSMIT PACKET";
            formStatus.innerText = 'TRANSMISSION SUCCESSFUL. SECURE LOG CREATED.';
            formStatus.classList.add('success');
            contactForm.reset();
            
            setTimeout(() => {
                formStatus.innerText = '';
                formStatus.classList.remove('success');
            }, 5000);
        }, 1500);
    } else {
        formStatus.innerText = 'TRANSMISSION FAILED. CHECK PARAMETERS.';
        formStatus.classList.add('error');
    }
});
