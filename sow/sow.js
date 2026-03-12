(function () {
  const body = document.body;
  const themeToggleBtn = document.getElementById('theme-toggle');
  const defaultTheme = localStorage.getItem('theme') || 'light';

  function setTheme(theme) {
    body.classList.remove('light-theme', 'dark-theme');
    body.classList.add(theme + '-theme');
    localStorage.setItem('theme', theme);
    if (themeToggleBtn) {
      themeToggleBtn.textContent = theme === 'light' ? 'Dark' : 'Light';
    }
  }

  setTheme(defaultTheme);
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', function () {
      setTheme(body.classList.contains('light-theme') ? 'dark' : 'light');
    });
  }

  const customerId = body.getAttribute('data-customer-id');
  const data = window.NORDSYM_SOW_DATA && window.NORDSYM_SOW_DATA[customerId];
  const root = document.getElementById('sow-root');
  if (!data || !root) {
    if (root) root.innerHTML = '<div class="sow-msg err">SoW not found.</div>';
    return;
  }

  function fmtDate(d) {
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  const today = fmtDate(new Date());
  root.innerHTML = [
    '<div class="sow-card"><div class="sow-card-inner">',
    '<h1 class="sow-title">NordSym X ' + data.customerName + '</h1>',
    '<p class="sow-sub">Scope of Work • ' + data.vertical + '</p>',
    '<div class="sow-bar"></div>',
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
    '<div class="sow-invest"><h3>Investment</h3>',
    '<div class="sow-invest-row"><span>Monthly fee</span><strong>$' + data.pricing.fixed + '</strong></div>',
    '<div class="sow-invest-row"><span>Infrastructure</span><span>' + data.pricing.nectar + '</span></div>',
    '</div>',
    '<section class="sow-sign">',
    '<h2>Signatures</h2>',
    '<div class="sow-sign-grid">',
    '<div><div class="sow-label">NordSym AB</div><div class="sow-line"><span style="font-family:cursive;font-size:24px;">Gustav Hemmingsson</span></div><p><strong>Gustav Hemmingsson</strong><br>CEO, NordSym AB<br>Date: ' + today + '</p></div>',
    '<div>',
    '<div class="sow-label">' + data.customerName + '</div>',
    '<label class="sow-label" style="text-transform:none;letter-spacing:normal;">Draw your signature</label>',
    '<canvas id="sig-canvas" class="sow-canvas" width="320" height="110"></canvas>',
    '<button id="clear-signature" class="sow-btn-link" type="button">Clear signature</button>',
    '<div style="margin-top:10px"><input id="signer-name" class="sow-input" placeholder="' + data.customerRep + '"></div>',
    '<div style="margin-top:10px"><input id="signer-title" class="sow-input" placeholder="Title"></div>',
    '<p style="color:var(--muted);font-size:12px;">Date: ' + today + '</p>',
    '</div>',
    '</div>',
    '<div id="msg"></div>',
    '<div class="sow-actions"><button id="sign-btn" class="sow-btn" disabled>Sign SoW</button></div>',
    '</section></div></div>'
  ].join('');

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

  fetch('/api/sow/status?customerId=' + encodeURIComponent(customerId))
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (status) {
      if (status && status.status === 'signed') {
        btn.disabled = true;
        msg.className = 'sow-msg ok';
        msg.textContent = 'This SoW is already signed.';
      }
    })
    .catch(function () {});

  btn.addEventListener('click', function () {
    btn.disabled = true;
    msg.className = '';
    msg.textContent = '';

    fetch('/api/sow/sign', {
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
        msg.textContent = 'Signed successfully. Thank you.';
      })
      .catch(function (err) {
        msg.className = 'sow-msg err';
        msg.textContent = err.message;
        refreshBtn();
      });
  });
})();
