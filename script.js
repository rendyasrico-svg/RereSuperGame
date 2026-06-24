// ====================
// LOADING SCREEN
// ====================

const loadingEl = document.getElementById("loading");
const loadingImg = document.getElementById("loading-img");

function updateIntroImage() {
    if (window.innerWidth > window.innerHeight) {
        loadingImg.src = "landscape_intro.png";
    } else {
        loadingImg.src = "intro.png";
    }
}

updateIntroImage();
window.addEventListener("resize", updateIntroImage);
const loadingBar = document.getElementById("loading-bar");
const loadingText = document.getElementById("loading-text");

let loadProgress = 0;

// ====================
// IMAGE PRELOAD
// ====================

const bg = new Image();
bg.src = "background.png";

const rere = new Image();
rere.src = "rere.png";

const groundImg = new Image();
groundImg.src = "ground.png";

const coinImg = new Image();
coinImg.src = "coin.png";

const enemyImg = new Image();
enemyImg.src = "enemy.png";

const flagImg = new Image();
flagImg.src = "flag.png";

const imagesToLoad = [bg, rere, groundImg, coinImg, enemyImg, flagImg];
let imagesReady = 0;
let allImagesLoaded = false;

imagesToLoad.forEach(img => {
    img.onload = () => {
        imagesReady++;
        if (imagesReady >= imagesToLoad.length) {
            allImagesLoaded = true;
        }
    };
    img.onerror = () => {
        imagesReady++;
        if (imagesReady >= imagesToLoad.length) {
            allImagesLoaded = true;
        }
    };
});

const loadInterval = setInterval(() => {
    loadProgress += Math.random() * 4 + 1;
    if (loadProgress >= 100) {
        loadProgress = 100;
        loadingBar.style.width = "100%";
        loadingText.textContent = "Siap! ✅";
        clearInterval(loadInterval);
        setTimeout(() => {
            loadingEl.style.opacity = "0";
            setTimeout(() => {
                loadingEl.style.display = "none";
            }, 600);
        }, 800);
    }
    loadingBar.style.width = loadProgress + "%";
}, 80);

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

// ====================
// SOUND
// ====================

const bgm = new Audio("bgm.mp3");
const jumpSound = new Audio("jump.mp3");
const coinSound = new Audio("coin.mp3");
const hitSound = new Audio("hit.mp3");
const gameOverSound = new Audio("game_over.mp3");
const startSound = new Audio("start_game.mp3");
const fireSound = new Audio("fire.mp3");
fireSound.volume = 0.5;
const fireHitSound = new Audio("fire_hit.mp3");
const enemyDeadSound = new Audio("enemy_dead.mp3");

fireHitSound.volume = 0.6;
enemyDeadSound.volume = 0.8;

bgm.loop = true;

function safePlay(audio) {
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
}
bgm.volume = 0.3;

// ====================
// AUTO PAUSE MUSIC
// ====================

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        bgm.pause();
    } else if (gameStarted && !gameEnded) {
        bgm.play().catch(() => {});
    }
});

window.addEventListener("blur", () => {
    bgm.pause();
});

window.addEventListener("focus", () => {
    if (gameStarted && !gameEnded) {
        bgm.play().catch(() => {});
    }
});

window.addEventListener("beforeunload", () => {
    bgm.pause();
    bgm.currentTime = 0;
});

// ====================
// INTRO
// ====================

let gameStarted = false;

const introEl = document.getElementById("intro");
const introBtnEl = document.getElementById("intro-btn");

introBtnEl.addEventListener("click", startGame);
introBtnEl.addEventListener("touchend", (e) => { e.preventDefault(); startGame(); }, { passive: false });

function startGame() {
    if (gameStarted) return;
    gameStarted = true;
    safePlay(startSound);
    bgm.play().catch(() => {});
    introEl.style.transition = "opacity 0.6s ease";
    introEl.style.opacity = "0";
    setTimeout(() => {
        introEl.style.display = "none";
    }, 600);
}

// ====================
// WORLD CONFIG
// ====================

const WORLD_WIDTH = 4000;
let groundY;

// ====================
// STATE
// ====================

let gameEnded = false;
let explosions = [];
let gamePaused = false;
let soundEnabled = true;

// ====================
// PROYEKTIL
// ====================

let projectiles = [];
let shootCooldown = 0;
const SHOOT_COOLDOWN_MAX = 20;
const PROJECTILE_SPEED = 8;
const PROJECTILE_DAMAGE = 1;

// ====================
// AWAN
// ====================

const clouds = [
    { x: 100,  y: 80,  w: 180, h: 60,  speed: 0.4 },
    { x: 400,  y: 50,  w: 220, h: 70,  speed: 0.3 },
    { x: 750,  y: 100, w: 160, h: 55,  speed: 0.5 },
    { x: 1100, y: 70,  w: 200, h: 65,  speed: 0.35 },
    { x: 1500, y: 90,  w: 190, h: 60,  speed: 0.45 },
    { x: 1900, y: 60,  w: 210, h: 70,  speed: 0.3 },
    { x: 2300, y: 85,  w: 170, h: 55,  speed: 0.5 },
    { x: 2700, y: 75,  w: 200, h: 65,  speed: 0.4 },
];

// ====================
// PLATFORMS
// ====================

let platforms = null;

function buildPlatforms() {
    return [
        { x: 400,  y: groundY - 160, w: 180, h: 30 },
        { x: 650,  y: groundY - 250, w: 160, h: 30 },
        { x: 900,  y: groundY - 320, w: 180, h: 30 },
        { x: 1150, y: groundY - 200, w: 160, h: 30 },
        { x: 1400, y: groundY - 290, w: 180, h: 30 },
        { x: 1700, y: groundY - 360, w: 200, h: 30 },
        { x: 2000, y: groundY - 240, w: 160, h: 30 },
        { x: 2250, y: groundY - 320, w: 180, h: 30 },
        { x: 2500, y: groundY - 200, w: 200, h: 30 },
        { x: 550,  y: groundY - 120, w: 30,  h: 120 },
        { x: 1050, y: groundY - 140, w: 30,  h: 140 },
        { x: 1600, y: groundY - 160, w: 30,  h: 160 },
        { x: 2150, y: groundY - 130, w: 30,  h: 130 },
        { x: 1700, y: groundY - 500, w: 200, h: 30 },
        { x: 2000, y: groundY - 550, w: 180, h: 30 },
        { x: 2300, y: groundY - 650, w: 180, h: 30 },
        { x: 2600, y: groundY - 750, w: 220, h: 30 },
    ];
}

// ====================
// COINS
// ====================

let coins = null;

function buildCoins() {
    return [
        { x: 420,  y: groundY - 220, collected: false, baseY: groundY - 220 },
        { x: 670,  y: groundY - 310, collected: false, baseY: groundY - 310 },
        { x: 920,  y: groundY - 380, collected: false, baseY: groundY - 380 },
        { x: 1170, y: groundY - 260, collected: false, baseY: groundY - 260 },
        { x: 1420, y: groundY - 350, collected: false, baseY: groundY - 350 },
        { x: 1720, y: groundY - 420, collected: false, baseY: groundY - 420 },
        { x: 2020, y: groundY - 300, collected: false, baseY: groundY - 300 },
        { x: 2270, y: groundY - 380, collected: false, baseY: groundY - 380 },
        { x: 2520, y: groundY - 260, collected: false, baseY: groundY - 260 },
        { x: 2800, y: groundY - 140, collected: false, baseY: groundY - 140 },
    ];
}

// ====================
// ENEMIES
// ====================

let enemies = null;

function buildEnemies() {
    return [
        { x: 700,  y: groundY - 80, vx: 1.5, minX: 620,  maxX: 820,  hp: 2 },
        { x: 1300, y: groundY - 80, vx: 1.8, minX: 1200, maxX: 1450, hp: 2 },
        { x: 1800, y: groundY - 80, vx: 2.0, minX: 1700, maxX: 1950, hp: 2 },
        { x: 2300, y: groundY - 80, vx: 1.6, minX: 2200, maxX: 2420, hp: 2 },
        { x: 2900, y: groundY - 80, vx: 2.2, minX: 2800, maxX: 3000, hp: 2 },
        { x: 920,  y: groundY - 395, vx: 1.2, minX: 905,  maxX: 1075, hp: 2 },
        { x: 1720, y: groundY - 375, vx: 1.4, minX: 1705, maxX: 1895, hp: 2 },
    ];
}

// ====================
// FLAG
// ====================

let flagObj = null;

function buildFlag() {
    return { x: 3400, y: groundY - 220 };
}

// ====================
// PLAYER (DIPERBAIKI: jump lebih tinggi)
// ====================

const player = {
    x: 100,
    y: 300,
    w: 80,
    h: 80,
    vx: 0,
    vy: 0,
    speed: 5,
    jump: -22,          // <--- DIUBAH dari -16 ke -22
    grounded: false,
    invincible: 0,
};

const gravity = 0.7;

let score = 0;
let life = 3;
let gameTime = 0;

document.getElementById("score").textContent = score;
document.getElementById("life").textContent = life;

// ====================
// CAMERA
// ====================

let cameraX = 0;
let cameraY = 0;

// ====================
// CONTROL
// ====================

const keys = {};

const leftBtn = document.getElementById("left");
const rightBtn = document.getElementById("right");
const jumpBtn = document.getElementById("jump");
const shootBtn = document.getElementById("shoot");

leftBtn.addEventListener("touchstart", (e) => { e.preventDefault(); keys["ArrowLeft"] = true; }, { passive: false });
leftBtn.addEventListener("touchend",   (e) => { e.preventDefault(); keys["ArrowLeft"] = false; }, { passive: false });

rightBtn.addEventListener("touchstart", (e) => { e.preventDefault(); keys["ArrowRight"] = true; }, { passive: false });
rightBtn.addEventListener("touchend",   (e) => { e.preventDefault(); keys["ArrowRight"] = false; }, { passive: false });

jumpBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    if (player.grounded) {
        player.vy = player.jump;
        player.grounded = false;
        safePlay(jumpSound);
    }
}, { passive: false });

if (shootBtn) {
    shootBtn.addEventListener("touchstart", (e) => {
        e.preventDefault();
        shoot();
    }, { passive: false });
    shootBtn.addEventListener("mousedown", () => {
        shoot();
    });
}

addEventListener("keydown", e => {
    keys[e.key] = true;
    if ((e.key === "ArrowUp" || e.key === " ") && player.grounded) {
        player.vy = player.jump;
        player.grounded = false;
        safePlay(jumpSound);
    }
    if (e.key === "q" || e.key === "r") {
        shoot();
    }
});

addEventListener("keyup", e => {
    keys[e.key] = false;
});

// ====================
// FUNGSI TEMBAK
// ====================

function shoot() {
    if (!gameStarted || gameEnded) return;
    if (shootCooldown > 0) return;

    safePlay(fireSound);

    const direction = player.vx >= 0 ? 1 : -1;

    const proj = {
        x: direction === 1 ? player.x + player.w : player.x - 20,
        y: player.y + 20,
        w: 20,
        h: 20,
        vx: direction * PROJECTILE_SPEED,
        life: 90,
    };

    projectiles.push(proj);
    shootCooldown = SHOOT_COOLDOWN_MAX;
}

// ====================
// GAME OVER & WIN
// ====================

function showGameOver() {
    gameEnded = true;
    bgm.pause();

    const overlay = document.getElementById("overlay");
    const overlayTitle = document.getElementById("overlay-title");
    const overlayScore = document.getElementById("overlay-score");
    const overlayBtn = document.getElementById("overlay-btn");

    overlayTitle.textContent = "GAME OVER";
    overlayTitle.style.color = "#ff2222";
    overlayTitle.style.textShadow = "0 0 30px #ff0000, 0 4px 0 #800000";
    overlayScore.textContent = "Skor: " + score;
    overlayBtn.textContent = "Main Lagi";
    overlayBtn.onclick = () => location.reload();
    overlay.style.display = "flex";
}

function showLevelComplete() {
    bgm.pause();

    const overlay = document.getElementById("overlay");
    const overlayTitle = document.getElementById("overlay-title");
    const overlayScore = document.getElementById("overlay-score");
    const overlayBtn = document.getElementById("overlay-btn");

    overlayTitle.textContent = "LEVEL CLEAR!";
    overlayTitle.style.color = "#ffe600";
    overlayTitle.style.textShadow = "0 0 30px #ffaa00, 0 4px 0 #a06000";
    overlayScore.textContent = "Skor Kamu: " + score;
    overlayBtn.textContent = "Main Lagi";
    overlayBtn.onclick = () => location.reload();
    overlay.style.display = "flex";
}

// ====================
// COLLISION
// ====================

function hit(a, b) {
    return (
        a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y
    );
}

function resolveAABB(player, plat) {
    const overlapLeft  = (player.x + player.w) - plat.x;
    const overlapRight = (plat.x + plat.w) - player.x;
    const overlapTop   = (player.y + player.h) - plat.y;
    const overlapBot   = (plat.y + plat.h) - player.y;

    const minOverlapX = Math.min(overlapLeft, overlapRight);
    const minOverlapY = Math.min(overlapTop, overlapBot);

    if (minOverlapX < minOverlapY) {
        if (overlapLeft < overlapRight) {
            player.x = plat.x - player.w;
        } else {
            player.x = plat.x + plat.w;
        }
        player.vx = 0;
    } else {
        if (overlapTop < overlapBot) {
            player.y = plat.y - player.h;
            player.vy = 0;
            player.grounded = true;
        } else {
            player.y = plat.y + plat.h;
            player.vy = 0;
        }
    }
}

// ====================
// INIT
// ====================

function initWorld() {
    groundY = canvas.height - 100;
    platforms = buildPlatforms();
    coins = buildCoins();
    enemies = buildEnemies();
    flagObj = buildFlag();
    player.y = groundY - player.h;
}

// ====================
// UPDATE (DIPERBAIKI: camera follow rate & batas atas)
// ====================

function update() {
    if (gamePaused) return;
    if (!gameStarted) return;
    if (gameEnded) return;

    gameTime++;

    for (let i = explosions.length - 1; i >= 0; i--) {
        explosions[i].life--;
        if (explosions[i].life <= 0) {
            explosions.splice(i, 1);
        }
    }

    if (!platforms) {
        initWorld();
        return;
    }

    if (shootCooldown > 0) shootCooldown--;

    // Update proyektil
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.x += p.vx;
        p.life--;

        if (p.x > WORLD_WIDTH + 100 || p.x + p.w < -100 || p.life <= 0) {
            projectiles.splice(i, 1);
            continue;
        }

        let hitEnemy = false;
        for (let j = enemies.length - 1; j >= 0; j--) {
            const e = enemies[j];
            const enemyBox = { x: e.x, y: e.y, w: 70, h: 70 };
            if (hit(p, enemyBox)) {
                safePlay(fireHitSound);

                e.hp = (e.hp || 2) - PROJECTILE_DAMAGE;

                if (e.hp <= 0) {
                    safePlay(enemyDeadSound);

                    explosions.push({ x: e.x + 35, y: e.y + 35, life: 20 });
                    enemies.splice(j, 1);

                    score += 15;
                    document.getElementById("score").textContent = score;
                } else {
                    e.x += (p.vx > 0 ? 30 : -30);
                }

                hitEnemy = true;
                break;
            }
        }
        if (hitEnemy) {
            projectiles.splice(i, 1);
        }
    }

    // Awan
    clouds.forEach(c => {
        c.x -= c.speed;
        if (c.x + c.w < 0) c.x = WORLD_WIDTH;
    });

    // Musuh
    enemies.forEach(e => {
        e.x += e.vx;
        if (e.x > e.maxX || e.x < e.minX) e.vx *= -1;
    });

    // Player horizontal
    player.vx = 0;
    if (keys["ArrowLeft"])  player.vx = -player.speed;
    if (keys["ArrowRight"]) player.vx = player.speed;
    player.x += player.vx;
    if (player.x < 0) player.x = 0;

    // Player vertikal
    player.vy += gravity;
    player.y += player.vy;
    player.grounded = false;

    if (player.y + player.h >= groundY) {
        player.y = groundY - player.h;
        player.vy = 0;
        player.grounded = true;
    }

    platforms.forEach(plat => {
        if (hit(player, plat)) resolveAABB(player, plat);
    });

    // Koin bobbing
    coins.forEach(c => {
        if (!c.collected) {
            c.y = c.baseY + Math.sin(gameTime * 0.05 + c.x * 0.01) * 8;
        }
    });

    // Ambil koin
    coins.forEach(c => {
        if (c.collected) return;
        if (hit(player, { x: c.x, y: c.y, w: 40, h: 40 })) {
            c.collected = true;
            score += 10;
            document.getElementById("score").textContent = score;
            safePlay(coinSound);
        }
    });

    // Tabrakan musuh
    if (player.invincible > 0) {
        player.invincible--;
    } else {
        enemies.forEach(e => {
            if (hit(player, { x: e.x, y: e.y, w: 70, h: 70 })) {
                life--;
                document.getElementById("life").textContent = life;
                safePlay(hitSound);
                player.x = 100;
                player.y = groundY - player.h;
                player.vy = 0;
                player.invincible = 90;
                if (life <= 0) {
                    safePlay(gameOverSound);
                    showGameOver();
                }
            }
        });
    }

    if (!gameEnded && player.x + player.w > flagObj.x) {
        showLevelComplete();
    }

    if (player.y > canvas.height + 100) {
        life--;
        document.getElementById("life").textContent = life;
        player.x = 100;
        player.y = groundY - player.h;
        player.vy = 0;
        if (life <= 0) {
            safePlay(gameOverSound);
            showGameOver();
        }
    }

    // ====================
    // KAMERA (DIPERBAIKI)
    // ====================

    const targetCamX = player.x - canvas.width * 0.3;
    cameraX += (targetCamX - cameraX) * 0.1;

    const targetCamY = player.y - canvas.height * 0.55;
    cameraY += (targetCamY - cameraY) * 0.12;   // lebih responsif

    if (cameraX < 0) cameraX = 0;
    if (cameraX > WORLD_WIDTH - canvas.width) {
        cameraX = WORLD_WIDTH - canvas.width;
    }

    // Batas atas lebih longgar (dari -450 ke -800)
    if (cameraY < -800) cameraY = -800;

    if (cameraY > 0) cameraY = 0;
}

// ====================
// DRAW BACKGROUND
// ====================

function drawBackground() {
    if (bg.complete && bg.naturalWidth > 0) {
        ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    } else {
        const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        skyGrad.addColorStop(0.0, "#1a6fa8");
        skyGrad.addColorStop(0.5, "#5bb8f5");
        skyGrad.addColorStop(1.0, "#a8daf5");
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.4);
    }
}

// ====================
// DRAW
// ====================

function draw() {
    if (!platforms) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();

    clouds.forEach(c => {
        const screenX = c.x - cameraX * 0.4;
        drawCloud(screenX, c.y, c.w, c.h);
    });

    ctx.save();
    ctx.translate(-cameraX, -cameraY);

    // Ground
    const tileW = 300;
    const startTile = Math.floor(cameraX / tileW);
    const endTile = Math.ceil((cameraX + canvas.width) / tileW) + 1;
    for (let i = startTile; i < endTile && i < 20; i++) {
        if (groundImg.complete && groundImg.naturalWidth > 0) {
            ctx.drawImage(groundImg, i * tileW, groundY, tileW, 100);
        } else {
            ctx.fillStyle = "#5a3a1a";
            ctx.fillRect(i * tileW, groundY, tileW, 100);
            ctx.fillStyle = "#4caf50";
            ctx.fillRect(i * tileW, groundY, tileW, 12);
        }
    }

    // Platform
    platforms.forEach(plat => {
        ctx.fillStyle = "#7c4a1e";
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
        ctx.fillStyle = "#4caf50";
        ctx.fillRect(plat.x, plat.y, plat.w, 8);
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        ctx.fillRect(plat.x + 4, plat.y + 10, plat.w - 8, 6);
    });

    // Koin
    coins.forEach(c => {
        if (!c.collected) {
            const scale = Math.abs(Math.cos(gameTime * 0.05 + c.x * 0.01));
            const drawW = Math.max(8, 40 * scale);
            if (coinImg.complete && coinImg.naturalWidth > 0) {
                ctx.drawImage(coinImg, c.x + (40 - drawW) / 2, c.y, drawW, 40);
            } else {
                ctx.fillStyle = "#ffd700";
                ctx.beginPath();
                ctx.arc(c.x + 20, c.y + 20, 15 * scale, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    });

    // Musuh
    enemies.forEach(e => {
        ctx.save();
        if (enemyImg.complete && enemyImg.naturalWidth > 0) {
            if (e.vx < 0) {
                ctx.scale(-1, 1);
                ctx.drawImage(enemyImg, -(e.x + 70), e.y, 70, 70);
            } else {
                ctx.drawImage(enemyImg, e.x, e.y, 70, 70);
            }
        } else {
            ctx.fillStyle = "#e53935";
            ctx.fillRect(e.x, e.y, 70, 70);
        }
        ctx.restore();
    });

    // Flag
    if (flagImg.complete && flagImg.naturalWidth > 0) {
        ctx.drawImage(flagImg, flagObj.x, flagObj.y, 120, 220);
    } else {
        ctx.fillStyle = "#ffeb3b";
        ctx.fillRect(flagObj.x, flagObj.y, 10, 220);
        ctx.fillStyle = "#f44336";
        ctx.fillRect(flagObj.x + 10, flagObj.y, 60, 40);
    }

    // Efek ledakan
    explosions.forEach(ex => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(ex.x, ex.y, (20 - ex.life) * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,150,0,${ex.life / 20})`;
        ctx.fill();
        ctx.restore();
    });

    // Player
    if (player.invincible === 0 || Math.floor(gameTime / 5) % 2 === 0) {
        ctx.save();
        ctx.translate(player.x + player.w / 2, player.y + player.h / 2);

        if (player.vx < 0) ctx.scale(-1, 1);

        if (player.vx !== 0 && player.grounded) {
            const wobble = Math.sin(gameTime * 0.3) * 0.08;
            ctx.rotate(wobble);
        }

        if (!player.grounded) {
            ctx.rotate(player.vy * 0.012);
        }

        if (rere.complete && rere.naturalWidth > 0) {
            ctx.drawImage(rere, -player.w / 2, -player.h / 2, player.w, player.h);
        } else {
            ctx.fillStyle = "#ff9800";
            ctx.fillRect(-player.w / 2, -player.h / 2, player.w, player.h);
        }
        ctx.restore();
    }

    // Proyektil
    projectiles.forEach(p => {
        ctx.save();
        const grd = ctx.createRadialGradient(
            p.x + p.w/2, p.y + p.h/2, 2,
            p.x + p.w/2, p.y + p.h/2, p.w
        );
        grd.addColorStop(0, '#ffdd44');
        grd.addColorStop(0.5, '#ff8800');
        grd.addColorStop(1, '#ff2200');
        ctx.fillStyle = grd;
        ctx.shadowColor = '#ff6600';
        ctx.shadowBlur = 25;
        ctx.beginPath();
        ctx.arc(p.x + p.w/2, p.y + p.h/2, p.w/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,200,0.7)';
        ctx.beginPath();
        ctx.arc(p.x + p.w/2 - 3, p.y + p.h/2 - 3, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });

    ctx.restore();

    if (player.invincible > 0) {
        ctx.fillStyle = "rgba(255,220,0,0.8)";
        ctx.font = "bold 18px Arial";
        ctx.textAlign = "center";
        ctx.fillText("⚡ INVINCIBLE!", canvas.width / 2, 80);
        ctx.textAlign = "left";
    }
}

// ====================
// DRAW CLOUD
// ====================

function drawCloud(x, y, w, h) {
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.beginPath();
    ctx.ellipse(x + w * 0.5,  y + h * 0.65, w * 0.45, h * 0.35, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.25, y + h * 0.6,  w * 0.28, h * 0.3,  0, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.72, y + h * 0.6,  w * 0.25, h * 0.28, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.5,  y + h * 0.4,  w * 0.3,  h * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
}

// ====================
// PAUSE MENU
// ====================

const gearBtn = document.getElementById("gear-btn");
const pauseMenu = document.getElementById("pause-menu");

gearBtn.addEventListener("click", () => {
    gamePaused = true;
    pauseMenu.style.display = "flex";
});

document.getElementById("resume-btn").addEventListener("click", () => {
    gamePaused = false;
    pauseMenu.style.display = "none";
});

document.getElementById("restart-btn").addEventListener("click", () => {
    location.reload();
});

document.getElementById("quit-btn").addEventListener("click", () => {
    bgm.pause();
    gamePaused = false;
    pauseMenu.style.display = "none";
    gameStarted = false;
    document.getElementById("intro").style.display = "flex";
});

document.getElementById("sound-btn").addEventListener("click", function () {
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
        bgm.volume = 0.3;
        this.textContent = "🔊 Sound ON";
    } else {
        bgm.volume = 0;
        this.textContent = "🔇 Sound OFF";
    }
});

// ====================
// LOOP
// ====================

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();