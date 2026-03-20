(function () {
  const body = document.body;
  const themeToggleBtn = document.getElementById('theme-toggle');
  const defaultTheme = localStorage.getItem('theme') || 'light';
  let starCanvas = null;
  let starCtx = null;
  let starAnim = null;
  let stars = [];

  // Starfall animation (dark mode only)
  function initStarfall() {
    if (starCanvas) return;
    starCanvas = document.createElement('canvas');
    starCanvas.className = 'sow-starfall';
    document.body.appendChild(starCanvas);
    starCtx = starCanvas.getContext('2d');

    function resize() {
      starCanvas.width = window.innerWidth;
      starCanvas.height = window.innerHeight;
      stars = Array.from({ length: Math.max(18, Math.floor(window.innerWidth / 120)) }, function () {
        return {
          x: Math.random() * starCanvas.width,
          y: Math.random() * starCanvas.height,
          r: Math.random() * 1.4 + 0.5,
          vy: Math.random() * 0.15 + 0.04,
          a: Math.random() * 0.45 + 0.2
        };
      });
    }

    function draw() {
      if (!starCtx) return;
      starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.y += s.vy;
        if (s.y > starCanvas.height + 3) {
          s.y = -3;
          s.x = Math.random() * starCanvas.width;
        }
        starCtx.beginPath();
        starCtx.fillStyle = 'rgba(186, 230, 253,' + s.a.toFixed(3) + ')';
        starCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        starCtx.fill();
      }
      starAnim = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    draw();
  }

  // Theme toggle
  function setTheme(theme) {
    body.classList.remove('light-theme', 'dark-theme');
    body.classList.add(theme + '-theme');
    localStorage.setItem('theme', theme);
    if (themeToggleBtn) {
      const icon = themeToggleBtn.querySelector('i');
      if (icon) {
        icon.className = theme === 'light' ? 'ph-fill ph-moon' : 'ph-fill ph-sun';
      }
    }
    if (theme === 'dark') initStarfall();
    if (starCanvas) {
      starCanvas.style.display = theme === 'dark' ? 'block' : 'none';
    }
  }

  setTheme(defaultTheme);
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', function () {
      setTheme(body.classList.contains('light-theme') ? 'dark' : 'light');
    });
  }

  // Get customer data
  const customerId = body.getAttribute('data-customer-id');
  const data = window.NORDSYM_MOU_DATA && window.NORDSYM_MOU_DATA[customerId];
  const root = document.getElementById('mou-root');
  
  if (!data || !root) {
    if (root) root.innerHTML = '<div class="sow-msg err">MoU not found.</div>';
    return;
  }

  function fmtDate(d) {
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  const today = fmtDate(new Date());

  // Countdown timer
  function renderCountdown() {
    const createdAt = new Date(data.createdAt);
    const expiresAt = new Date(createdAt.getTime() + data.validHours * 60 * 60 * 1000);
    const now = new Date();
    const remaining = expiresAt - now;

    if (remaining <= 0) {
      return '<div class="mou-countdown expired"><i class="ph-fill ph-clock"></i> MoU Expired</div>';
    }

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    return [
      '<div class="mou-countdown">',
      '<div class="mou-countdown-label"><i class="ph-fill ph-clock"></i> Valid for ' + data.validHours + ' hours</div>',
      '<div class="mou-countdown-timer">',
      '<span class="mou-time-unit"><strong>' + hours + '</strong><small>hours</small></span>',
      '<span class="mou-time-sep">:</span>',
      '<span class="mou-time-unit"><strong>' + String(minutes).padStart(2, '0') + '</strong><small>min</small></span>',
      '<span class="mou-time-sep">:</span>',
      '<span class="mou-time-unit"><strong>' + String(seconds).padStart(2, '0') + '</strong><small>sec</small></span>',
      '</div>',
      '</div>'
    ].join('');
  }

  // Render MoU
  root.innerHTML = [
    '<div class="sow-card"><div class="sow-card-inner">',
    '<h1 class="sow-title">NordSym X ' + data.customerName + '</h1>',
    '<p class="sow-sub">Memorandum of Understanding • ' + data.vertical + '</p>',
    '<div class="sow-bar"></div>',
    '<div id="countdown-container">' + renderCountdown() + '</div>',
    data.sections.map(function (s) {
      var content = '';
      if (s.content) {
        content += s.content.map(function (line) { return '<p>' + line + '</p>'; }).join('');
      }
      if (s.items) {
        content += s.items.map(function (it) { return '<div class="sow-item"><strong>' + it.label + ':</strong> ' + it.value + '</div>'; }).join('');
      }
      return '<section class="sow-section"><h2>' + s.title + '</h2>' + content + '</section>';
    }).join(''),
    '<section class="sow-sign">',
    '<h2>Signatures</h2>',
    '<div class="sow-sign-grid">',
    '<div><div class="sow-label">NordSym AB</div><div class="sow-line"><span style="font-family:cursive;font-size:24px;">Gustav Hemmingsson</span></div><p><strong>Gustav Hemmingsson</strong><br>CEO, NordSym AB<br>Date: ' + today + '</p></div>',
    '<div>',
    '<div class="sow-label">' + data.customerName + '</div>',
    '<label class="sow-label" style="text-transform:none;letter-spacing:normal;">Draw your signature</label>',
    '<canvas id="sig-canvas" class="sow-canvas" width="320" height="110"></canvas>',
    '<button id="clear-signature" class="sow-btn-link" type="button">Clear signature</button>',
    '<div style="margin-top:10px"><input id="signer-name" class="sow-input" placeholder="' + data.customerRep + '" value="' + data.customerRep + '"></div>',
    '<div style="margin-top:10px"><input id="signer-title" class="sow-input" placeholder="Title"></div>',
    '<p style="color:var(--muted);font-size:12px;">Date: ' + today + '</p>',
    '</div>',
    '</div>',
    '<div id="msg"></div>',
    '<div class="sow-actions"><button id="sign-btn" class="sow-btn" disabled>Sign MoU</button></div>',
    '</section></div></div>'
  ].join('');

  // Update countdown every second
  setInterval(function () {
    const container = document.getElementById('countdown-container');
    if (container) {
      container.innerHTML = renderCountdown();
    }
  }, 1000);

  // Signature canvas logic
  const canvas = document.getElementById('sig-canvas');
  const ctx = canvas.getContext('2d');
  const nameInput = document.getElementById('signer-name');
  const titleInput = document.getElementById('signer-title');
  const btn = document.getElementById('sign-btn');
  const clearBtn = document.getElementById('clear-signature');
  const msg = document.getElementById('msg');

  let drawing = false;
  let hasSignature = false;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const t = e.touches && e.touches[0];
    const x = (t ? t.clientX : e.clientX) - rect.left;
    const y = (t ? t.clientY : e.clientY) - rect.top;
    return { x: x * (canvas.width / rect.width), y: y * (canvas.height / rect.height) };
  }

  function refreshBtn() {
    btn.disabled = !(hasSignature && nameInput.value.trim() && titleInput.value.trim());
  }

  function start(e) {
    drawing = true;
    const p = getPos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    e.preventDefault();
  }
  function move(e) {
    if (!drawing) return;
    const p = getPos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    hasSignature = true;
    refreshBtn();
    e.preventDefault();
  }
  function end() { drawing = false; }

  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', move);
  canvas.addEventListener('mouseup', end);
  canvas.addEventListener('mouseleave', end);
  canvas.addEventListener('touchstart', start, { passive: false });
  canvas.addEventListener('touchmove', move, { passive: false });
  canvas.addEventListener('touchend', end);

  clearBtn.addEventListener('click', function () {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    hasSignature = false;
    refreshBtn();
  });

  nameInput.addEventListener('input', refreshBtn);
  titleInput.addEventListener('input', refreshBtn);

  // Sign button handler
  btn.addEventListener('click', function () {
    btn.disabled = true;
    msg.className = '';
    msg.textContent = '';

    fetch('/api/mou/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: customerId,
        signatureDataUrl: canvas.toDataURL('image/png'),
        signerName: nameInput.value.trim(),
        signerTitle: titleInput.value.trim()
      })
    })
      .then(async function (r) {
        var payload = await r.json().catch(function () { return {}; });
        if (!r.ok) throw new Error(payload.error || 'Signing failed');
        msg.className = 'sow-msg ok';
        msg.textContent = 'MoU signed successfully. Thank you for your interest in partnership!';
        setTimeout(function () {
          window.location.href = '/mou/success?customerId=' + encodeURIComponent(customerId) +
            '&signerName=' + encodeURIComponent(nameInput.value.trim()) +
            '&signerTitle=' + encodeURIComponent(titleInput.value.trim());
        }, 1500);
      })
      .catch(function (err) {
        msg.className = 'sow-msg err';
        msg.textContent = err.message;
        refreshBtn();
      });
  });
})();
