(() => {
  const canvas = document.getElementById("operating-schematic");
  if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const ctx = canvas.getContext("2d");
  const stamp = document.getElementById("hero-stamp");
  let running = true;
  let lastPhase = -1;

  const observer = new IntersectionObserver(([entry]) => {
    running = entry.isIntersecting;
  });
  observer.observe(canvas);

  const ink = "#15130f";
  const muted = "#706a5d";
  const rule = "#d7d0c1";
  const stampRed = "#a83a27";
  const paper = "#f6f3eb";

  function scaleCanvas() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(920, Math.floor(rect.width * ratio));
    canvas.height = Math.floor((rect.width * 420 / 920) * ratio);
    ctx.setTransform(canvas.width / 920, 0, 0, canvas.height / 420, 0, 0);
  }

  function rect(x, y, w, h, color = rule) {
    ctx.strokeStyle = color;
    ctx.strokeRect(x, y, w, h);
  }

  function label(text, x, y, color = muted, size = 12) {
    ctx.fillStyle = color;
    ctx.font = `${size}px IBM Plex Mono, ui-monospace, monospace`;
    ctx.fillText(text, x, y);
  }

  function line(x1, y1, x2, y2, progress = 1, color = ink) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 + (x2 - x1) * progress, y1 + (y2 - y1) * progress);
    ctx.stroke();
  }

  function pulse(x, y, active) {
    ctx.fillStyle = active ? stampRed : ink;
    ctx.fillRect(x - 5, y - 5, 10, 10);
  }

  function hatch(x, y, w, h) {
    ctx.strokeStyle = rule;
    for (let i = -h; i < w; i += 9) {
      ctx.beginPath();
      ctx.moveTo(x + i, y + h);
      ctx.lineTo(x + i + h, y);
      ctx.stroke();
    }
  }

  function draw(t) {
    if (running) requestAnimationFrame(draw);
    const loop = 14000;
    const time = (t % loop) / loop;
    const phase = Math.floor(time * 7);
    const local = (time * 7) - phase;

    ctx.clearRect(0, 0, 920, 420);
    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, 920, 420);
    ctx.lineWidth = 1.2;

    const sources = [
      ["CMS", 28, 54, 138, 44, 76],
      ["CRM", 28, 136, 138, 44, 158],
      ["EMAIL", 28, 218, 138, 44, 240],
      ["SHEETS", 28, 300, 138, 44, 322],
    ];
    sources.forEach(([name, x, y, w, h]) => {
      rect(x, y, w, h);
      label(name, x + 24, y + 28);
    });

    rect(300, 72, 318, 230);
    label("NORDSYM OPERATING LAYER", 334, 108);
    rect(342, 144, 78, 54);
    rect(450, 144, 78, 54);
    rect(558, 144, 78, 54);
    hatch(450, 144, 78, 54);
    label("MANDATE", 351, 177);
    label("AGENT", 469, 177);
    label("APPROVAL", 566, 177);
    rect(760, 96, 120, 56);
    rect(760, 238, 120, 56);
    label("SURFACE", 781, 129);
    label("LEDGER", 789, 270);

    const startIndex = Math.floor((t / loop) % sources.length);
    const startY = sources[startIndex][5];
    const segments = [
      [166, startY, 300, 171],
      [300, 171, 342, 171],
      [420, 171, 450, 171],
      [528, 171, 558, 171],
      [636, 171, 760, 124],
      [636, 171, 760, 267],
    ];

    line(...segments[0], phase > 0 ? 1 : local);
    if (phase > 0) line(...segments[1], phase > 1 ? 1 : phase === 1 ? local : 0);
    if (phase > 1) line(...segments[2], phase > 2 ? 1 : phase === 2 ? local : 0);
    if (phase > 2) line(...segments[3], phase > 3 ? 1 : phase === 3 ? local : 0);

    if (phase < 4) {
      const s = segments[Math.min(phase, 3)];
      pulse(s[0] + (s[2] - s[0]) * local, s[1] + (s[3] - s[1]) * local, phase === 3);
    } else if (phase === 4) {
      label("HOLD", 584, 222, stampRed, 13);
      pulse(597, 171, true);
    } else {
      label("APPROVED", 568, 222, stampRed, 13);
      line(...segments[4], phase > 5 ? 1 : local, stampRed);
      line(...segments[5], phase > 5 ? 1 : local, stampRed);
      const s = segments[4];
      pulse(s[0] + (s[2] - s[0]) * Math.min(1, local), s[1] + (s[3] - s[1]) * Math.min(1, local), true);
      label(`record ${2039 + Math.floor(t / loop)}`, 778, 306, stampRed, 12);
    }

    if (phase === 5 && lastPhase !== 5 && stamp) {
      stamp.classList.add("flash");
      setTimeout(() => stamp.classList.remove("flash"), 320);
    }
    lastPhase = phase;
  }

  function start() {
    scaleCanvas();
    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", scaleCanvas);
  start();

  document.querySelectorAll(".annotations button").forEach((button) => {
    button.addEventListener("mouseenter", setNote);
    button.addEventListener("focus", setNote);
  });

  function setNote(event) {
    const note = document.getElementById("proof-note");
    if (note) note.textContent = event.currentTarget.dataset.note;
  }
})();
