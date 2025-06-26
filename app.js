let angle = 0;
let players = [];
let remainingPlayers = [];
let teamA = [];
let teamB = [];
let stats = {};
const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const playerInput = document.getElementById("playerInput");
const installBtn = document.getElementById("installButton");
const resultBox = document.getElementById("spinResult");
const confettiCanvas = document.getElementById("confettiCanvas");
const colorTeamA = document.getElementById("colorTeamA");
const colorTeamB = document.getElementById("colorTeamB");
const teamABox = document.getElementById("teamABox");
const teamBBox = document.getElementById("teamBBox");
let deferredPrompt;

// Load saved players
window.addEventListener("load", () => {
  const saved = localStorage.getItem("players");
  if (saved) {
    playerInput.value = saved;
  }
});

// Auto-save input
playerInput.addEventListener("input", () => {
  localStorage.setItem("players", playerInput.value);
});

function startSpin() {
  const input = playerInput.value.trim().split("\n").map(p => p.trim()).filter(p => p);
  if (input.length !== 10) {
    alert("Masukkan tepat 10 nama pemain!");
    return;
  }

  players = [...input];
  remainingPlayers = [...players];
  teamA = [];
  teamB = [];
  stats = {};
  resultBox.textContent = "";

  spinNext();
}

function spinNext() {
  if (remainingPlayers.length === 0 || teamA.length + teamB.length === 10) return;

  drawWheel();
  const duration = 3000;
  const targetIndex = Math.floor(Math.random() * remainingPlayers.length);
  const targetAngle = (2 * Math.PI * (targetIndex / remainingPlayers.length)) + Math.random();
  const spinAngle = 10 * Math.PI + targetAngle;

  let start = null;

  function animate(timestamp) {
    if (!start) start = timestamp;
    const progress = timestamp - start;
    const current = easeOut(progress / duration) * spinAngle;
    angle = current;
    drawWheel();

    if (progress < duration) {
      requestAnimationFrame(animate);
    } else {
      const selectedIndex = Math.floor(((2 * Math.PI - (angle % (2 * Math.PI))) / (2 * Math.PI)) * remainingPlayers.length) % remainingPlayers.length;
      const selected = remainingPlayers[selectedIndex];
      remainingPlayers.splice(selectedIndex, 1);

      if (teamA.length < 5) {
        teamA.push(selected);
        stats[selected] = stats[selected] ? stats[selected] + 1 : 1;
      } else {
        teamB.push(selected);
        stats[selected] = stats[selected] ? stats[selected] + 1 : 1;
      }

      showResult(selected);
      updateTeams();
      triggerConfetti();

      setTimeout(spinNext, 1500);
    }
  }

  requestAnimationFrame(animate);
}

function showResult(name) {
  resultBox.textContent = `🎉 ${name} terpilih!`;
  resultBox.classList.add("show");
  setTimeout(() => resultBox.classList.remove("show"), 2000);
}

function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

function drawWheel() {
  const count = remainingPlayers.length;
  const radius = canvas.width / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(radius, radius);
  ctx.rotate(angle);

  for (let i = 0; i < count; i++) {
    const anglePer = (2 * Math.PI) / count;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, i * anglePer, (i + 1) * anglePer);
    ctx.fillStyle = i % 2 === 0 ? "#4ecdc4" : "#ffe66d";
    ctx.fill();
    ctx.save();
    ctx.fillStyle = "#000";
    ctx.rotate(i * anglePer + anglePer / 2);
    ctx.translate(radius / 2, 0);
    ctx.textAlign = "center";
    ctx.font = "bold 14px Fredoka";
    ctx.fillText(remainingPlayers[i], 0, 5);
    ctx.restore();
  }

  ctx.restore();
}

function updateTeams() {
  document.getElementById("teamA").innerHTML = teamA.map(p => `<li>${p} <small>x${stats[p] || 0}</small></li>`).join("");
  document.getElementById("teamB").innerHTML = teamB.map(p => `<li>${p} <small>x${stats[p] || 0}</small></li>`).join("");
  teamABox.style.backgroundColor = colorTeamA.value;
  teamBBox.style.backgroundColor = colorTeamB.value;
}

function triggerConfetti() {
  if (!confettiCanvas.confetti) confettiCanvas.confetti = window.confetti.create(confettiCanvas, { resize: true });
  confettiCanvas.confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
}

function resetAll() {
  playerInput.value = "";
  localStorage.removeItem("players");
  players = [];
  remainingPlayers = [];
  teamA = [];
  teamB = [];
  stats = {};
  drawWheel();
  updateTeams();
  resultBox.textContent = "";
}

function shuffleTeams() {
  const input = playerInput.value.trim().split("\n").map(p => p.trim()).filter(p => p);
  if (input.length !== 10) {
    alert("Masukkan tepat 10 nama pemain!");
    return;
  }
  const shuffled = [...input].sort(() => Math.random() - 0.5);
  teamA = shuffled.slice(0, 5);
  teamB = shuffled.slice(5);
  stats = {};
  teamA.forEach(p => stats[p] = 1);
  teamB.forEach(p => stats[p] = 1);
  updateTeams();
  resultBox.textContent = "Tim diacak ulang!";
}

function saveImage() {
  html2canvas(document.getElementById("teams"), { scale: 2 }).then(canvas => {
    const link = document.createElement("a");
    link.download = "hasil-tim-futsal.png";
    link.href = canvas.toDataURL();
    link.click();
  });
}

// Theme toggle
const themeBtn = document.getElementById("themeToggle");
let currentTheme = localStorage.getItem("theme") || "light";
document.body.classList.add(currentTheme);

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
  const newTheme = document.body.classList.contains("dark") ? "dark" : "light";
  localStorage.setItem("theme", newTheme);
});

// PWA Install
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.hidden = false;
});

installBtn.addEventListener("click", async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      installBtn.hidden = true;
    }
    deferredPrompt = null;
  }
});
