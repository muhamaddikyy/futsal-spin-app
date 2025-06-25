let players = [];
let remaining = [];
let teamA = [];
let teamB = [];
let currentTeam = "A";
let angleOffset = 0;
let ctx = document.getElementById("wheelCanvas").getContext("2d");

function startSpin() {
  const input = document.getElementById("playerInput").value.trim();
  players = input.split("\n").map(p => p.trim()).filter(Boolean);
  if (players.length !== 10) {
    alert("Masukkan tepat 10 nama pemain.");
    return;
  }

  resetAll(true);
  remaining = [...players];
  drawWheel();
  spin();
}

function drawWheel() {
  const canvas = document.getElementById("wheelCanvas");
  const segment = 2 * Math.PI / remaining.length;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < remaining.length; i++) {
    ctx.beginPath();
    ctx.fillStyle = i % 2 === 0 ? "#4caf50" : "#2196f3";
    ctx.moveTo(200, 200);
    ctx.arc(200, 200, 200, segment * i + angleOffset, segment * (i + 1) + angleOffset);
    ctx.lineTo(200, 200);
    ctx.fill();

    ctx.save();
    ctx.translate(200, 200);
    ctx.rotate(segment * i + segment / 2 + angleOffset);
    ctx.fillStyle = "#fff";
    ctx.font = "16px sans-serif";
    ctx.fillText(remaining[i], 100, 5);
    ctx.restore();
  }
}

function spin() {
  if (remaining.length === 0) {
    alert("Semua pemain sudah dibagi.");
    return;
  }
  if (teamA.length >= 5 && teamB.length >= 5) {
    alert("Kedua tim sudah lengkap.");
    return;
  }

  const index = Math.floor(Math.random() * remaining.length);
  const selected = remaining.splice(index, 1)[0];

  if (teamA.length < 5 && (currentTeam === "A" || teamB.length >= 5)) {
    teamA.push(selected);
    document.getElementById("teamA").innerHTML += `<li>${selected}</li>`;
    currentTeam = "B";
  } else if (teamB.length < 5) {
    teamB.push(selected);
    document.getElementById("teamB").innerHTML += `<li>${selected}</li>`;
    currentTeam = "A";
  }

  angleOffset = -((2 * Math.PI / (remaining.length + 1)) * index + Math.PI / (remaining.length + 1));
  drawWheel();

  if (teamA.length < 5 || teamB.length < 5) {
    setTimeout(spin, 1500);
  }
}

function resetAll(preserveInput = false) {
  remaining = [];
  teamA = [];
  teamB = [];
  currentTeam = "A";
  angleOffset = 0;

  const canvas = document.getElementById("wheelCanvas");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!preserveInput) {
    document.getElementById("playerInput").value = "";
  }
  document.getElementById("teamA").innerHTML = "";
  document.getElementById("teamB").innerHTML = "";
}

// PWA Install Prompt
let deferredPrompt;
const installBtn = document.getElementById("installButton");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.hidden = false;

  installBtn.addEventListener("click", () => {
    deferredPrompt.prompt();
  });
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log('[PWA] Service Worker Registered'));
}
