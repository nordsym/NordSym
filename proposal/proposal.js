(function () {
  const body = document.body;
  const themeToggleBtn = document.getElementById('theme-toggle');
  const defaultTheme = localStorage.getItem('theme') || 'light';
  let starCanvas = null;
  let starCtx = null;
  let starAnim = null;
  let stars = [];

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

  const customerId = body.getAttribute('data-customer-id');
  const data = window.NORDSYM_PROPOSAL_DATA && window.NORDSYM_PROPOSAL_DATA[customerId];
  const root = document.getElementById('proposal-root');
  
  if (!data || !root) {
    if (root) root.innerHTML = '<div class="sow-msg err">Proposal not found.</div>';
    return;
  }

  function fmtDate(d) {
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  const today = fmtDate(new Date());

  // Convert markdown bold (**text**) to HTML <strong>text</strong>
  function parseBold(text) {
    if (!text) return text;
    return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  }

  // 5-day pilot timer - activates on proposal signature
  function renderPilotTimer() {
    const pilotSignedKey = 'proposal_signed_' + customerId;
    const pilotSignedStr = localStorage.getItem(pilotSignedKey);
    
    // Before signing: show activation message
    if (!pilotSignedStr) {
      return [
        '<div class="mou-countdown" style="background: linear-gradient(135deg, #FF8C00 0%, #FFD700 100%);">',
        '<div class="mou-countdown-label" style="color:#1a1a1a;"><i class="ph-fill ph-rocket-launch" style="color:#1a1a1a;"></i> Sign to activate 5-day pilot period</div>',
        '<p style="margin-top:12px;font-size:14px;color:#1a1a1a;opacity:0.95;line-height:1.6;">',
        '<strong>What happens during the pilot:</strong><br>',
        '• Connect with Symbot in Telegram<br>',
        '• Test AI automation workflows<br>',
        '• Experience rapid execution<br>',
        '• Decide: Kill, Pivot, or Scale',
        '</p>',
        '<p style="margin-top:12px;font-size:13px;color:#1a1a1a;opacity:0.8;">No commitment yet — sign below to explore</p>',
        '</div>'
      ].join('');
    }

    // After signing: calculate remaining pilot period
    const pilotStart = new Date(pilotSignedStr);
    const pilotDays = 5;
    const pilotEnds = new Date(pilotStart.getTime() + pilotDays * 24 * 60 * 60 * 1000);
    const now = new Date();
    const remaining = pilotEnds - now;

    // Pilot expired
    if (remaining <= 0) {
      return [
        '<div class="mou-countdown expired" style="background: linear-gradient(135deg, #FF6B6B 0%, #C92A2A 100%);">',
        '<div class="mou-countdown-label"><i class="ph-fill ph-warning"></i> Pilot Period Ended</div>',
        '<p style="margin-top:12px;font-size:14px;">Time to decide: Kill, Pivot, or Scale?</p>',
        '<div style="margin-top:20px;">',
        '<a href="mailto:gustav@nordsym.com?subject=Pilot Decision - ' + data.customerName + '" class="sow-btn" style="background:#fff;color:#C92A2A;text-decoration:none;display:inline-block;padding:12px 24px;border-radius:8px;font-weight:600;">',
        '<i class="ph ph-envelope"></i> Share Your Decision',
        '</a>',
        '</div>',
        '</div>'
      ].join('');
    }

    // Active pilot countdown
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    return [
      '<div class="mou-countdown" style="background: linear-gradient(135deg, #00FF87 0%, #60EFFF 100%);">',
      '<div class="mou-countdown-label" style="color:#1a1a1a;"><i class="ph-fill ph-rocket-launch" style="color:#1a1a1a;"></i> Pilot active:</div>',
      '<div class="mou-countdown-timer" style="color:#1a1a1a;">',
      '<span class="mou-time-unit"><strong>' + days + '</strong><small>days</small></span>',
      '<span class="mou-time-sep">:</span>',
      '<span class="mou-time-unit"><strong>' + String(hours).padStart(2, '0') + '</strong><small>hours</small></span>',
      '<span class="mou-time-sep">:</span>',
      '<span class="mou-time-unit"><strong>' + String(minutes).padStart(2, '0') + '</strong><small>min</small></span>',
      '</div>',
      '<p style="margin-top:12px;font-size:13px;color:#1a1a1a;opacity:0.85;">Working with Symbot in Telegram. Decision at end: Kill/Pivot/Scale.</p>',
      '</div>'
    ].join('');
  }

  // 5-day urgency timer - tracks from first visit
  function renderUrgencyTimer() {
    const firstVisitKey = 'proposal_first_visit_' + customerId;
    let firstVisitStr = localStorage.getItem(firstVisitKey);
    
    // Set first visit timestamp if not exists
    if (!firstVisitStr) {
      firstVisitStr = new Date().toISOString();
      localStorage.setItem(firstVisitKey, firstVisitStr);
    }

    const firstVisit = new Date(firstVisitStr);
    const validityDays = 5;
    const expiresAt = new Date(firstVisit.getTime() + validityDays * 24 * 60 * 60 * 1000);
    const now = new Date();
    const remaining = expiresAt - now;

    // Expired state
    if (remaining <= 0) {
      return [
        '<div class="mou-countdown expired" style="background: linear-gradient(135deg, #FF6B6B 0%, #C92A2A 100%);">',
        '<div class="mou-countdown-label"><i class="ph-fill ph-warning"></i> Offer Expired</div>',
        '<p style="margin-top:12px;font-size:14px;">This proposal offer has expired. Please contact us to renew your interest.</p>',
        '<div style="margin-top:20px;">',
        '<a href="mailto:gustav@nordsym.com?subject=Renew Proposal - ' + data.customerName + '" class="sow-btn" style="background:#fff;color:#C92A2A;text-decoration:none;display:inline-block;padding:12px 24px;border-radius:8px;font-weight:600;">',
        '<i class="ph ph-envelope"></i> Contact to Renew',
        '</a>',
        '</div>',
        '</div>'
      ].join('');
    }

    // Active countdown
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    return [
      '<div class="mou-countdown" style="background: linear-gradient(135deg, #00D4FF 0%, #9370DB 100%);">',
      '<div class="mou-countdown-label"><i class="ph-fill ph-clock"></i> This offer valid for:</div>',
      '<div class="mou-countdown-timer">',
      '<span class="mou-time-unit"><strong>' + days + '</strong><small>days</small></span>',
      '<span class="mou-time-sep">:</span>',
      '<span class="mou-time-unit"><strong>' + String(hours).padStart(2, '0') + '</strong><small>hours</small></span>',
      '<span class="mou-time-sep">:</span>',
      '<span class="mou-time-unit"><strong>' + String(minutes).padStart(2, '0') + '</strong><small>min</small></span>',
      '</div>',
      '<p style="margin-top:12px;font-size:13px;opacity:0.85;">Fast decisions win. Move to MoU within ' + validityDays + ' days.</p>',
      '</div>'
    ].join('');
  }

  // Build proposal HTML
  let html = [
    '<div class="sow-card"><div class="sow-card-inner">',
    '<h1 class="sow-title">NordSym × ' + data.customerName + '</h1>',
    '<p class="sow-sub">' + data.vertical + '</p>',
    '<div style="background:linear-gradient(135deg,#00D4FF,#9370DB);padding:20px;border-radius:12px;text-align:center;margin:25px 0;box-shadow:0 4px 20px rgba(0,212,255,0.2);">',
    '<h3 style="margin:0;font-size:24px;color:#0a0a0a;font-weight:700;display:flex;align-items:center;justify-content:center;gap:10px;">',
    '<i class="ph ph-lightning" style="font-size:28px;"></i>',
    'Time is Energy',
    '</h3>',
    '<p style="margin:8px 0 0;color:#1a1a1a;font-size:14px;font-weight:500;">Fast execution. Clear deliverables. Real results.</p>',
    '</div>',
    '<div class="sow-bar"></div>',
    '<div id="pilot-timer-container" style="margin:25px 0;">' + renderPilotTimer() + '</div>',
    '<div id="urgency-timer-container" style="margin:25px 0;">' + renderUrgencyTimer() + '</div>',
  ];

  // Problem statement
  if (data.problem) {
    html.push(
      '<section class="sow-section">',
      '<p style="font-size:18px;line-height:1.6;color:var(--text);">' + parseBold(data.problem) + '</p>',
      '</section>'
    );
  }

  // Solution overview
  if (data.solution) {
    html.push(
      '<section class="sow-section" style="background:var(--accent-bg);padding:30px;border-radius:12px;border-left:4px solid var(--cyan);">',
      '<h2 style="margin-top:0;">Our Solution</h2>',
      '<p style="font-size:16px;line-height:1.7;">' + parseBold(data.solution) + '</p>',
      '</section>'
    );
  }

  // Icon mapping for sections
  function getSectionIcon(title) {
    const lower = title.toLowerCase();
    if (lower.includes('opportunity') || lower.includes('challenge')) return 'ph-target';
    if (lower.includes('partnership') || lower.includes('solution')) return 'ph-handshake';
    if (lower.includes('investment') || lower.includes('process')) return 'ph-currency-dollar';
    if (lower.includes('why')) return 'ph-star';
    if (lower.includes('next')) return 'ph-rocket';
    return 'ph-circle';
  }

  // Sections
  data.sections.forEach(function (section) {
    const icon = getSectionIcon(section.title);
    html.push(
      '<section class="sow-section">',
      '<h2 style="display:flex;align-items:center;gap:12px;">',
      '<i class="ph ' + icon + '" style="font-size:32px;color:var(--cyan);"></i>',
      '<span>' + section.title + '</span>',
      '</h2>'
    );
    
    if (section.content) {
      // Limit to max 5 bullets for cleaner display
      const bullets = section.content.filter(function(line) { 
        return line.trim() && !line.startsWith('<strong>');
      }).slice(0, 5);
      
      bullets.forEach(function (line) {
        html.push('<p style="font-size:15px;line-height:1.7;">' + parseBold(line) + '</p>');
      });
    }

    if (section.items) {
      section.items.forEach(function (item) {
        html.push(
          '<div class="sow-item" style="padding-left:44px;position:relative;">',
          '<i class="ph ph-check-circle" style="position:absolute;left:12px;top:12px;font-size:20px;color:var(--cyan);"></i>',
          '<strong style="color:var(--cyan);">' + parseBold(item.label) + '</strong>',
          '<p style="margin:6px 0 0;font-size:14px;line-height:1.6;">' + parseBold(item.value) + '</p>',
          '</div>'
        );
      });
    }

    if (section.packages) {
      html.push('<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;margin-top:20px;">');
      section.packages.forEach(function (pkg) {
        const recommended = pkg.recommended ? ' style="border:2px solid var(--cyan);box-shadow:0 0 20px rgba(0,212,255,0.2);"' : '';
        html.push(
          '<div class="sow-invest"' + recommended + '>',
          pkg.recommended ? '<div style="background:var(--cyan);color:var(--bg);padding:6px 12px;font-size:12px;font-weight:700;text-align:center;margin:-20px -20px 15px;border-radius:8px 8px 0 0;">RECOMMENDED</div>' : '',
          '<h3 style="margin-top:0;">' + pkg.name + '</h3>',
          '<div class="sow-invest-row"><strong style="font-size:24px;color:var(--cyan);">' + pkg.price + '</strong></div>',
          '<div class="sow-invest-row"><span style="font-size:14px;color:var(--muted);">' + pkg.duration + '</span></div>',
          '<div style="margin-top:15px;padding-top:15px;border-top:1px solid var(--border);">',
          pkg.includes.map(function (item) { return '<p style="margin:8px 0;font-size:14px;">✓ ' + item + '</p>'; }).join(''),
          '</div>',
          '</div>'
        );
      });
      html.push('</div>');
    }

    html.push('</section>');
  });

  // Signature Section - Activates 5-day pilot
  html.push(
    '<section class="sow-sign" style="margin-top:40px;">',
    '<h2 style="display:flex;align-items:center;gap:12px;">',
    '<i class="ph ph-pen-nib" style="font-size:28px;color:var(--cyan);"></i>',
    'Sign to Start 5-Day Pilot',
    '</h2>',
    '<p style="margin-bottom:20px;">Sign below to activate your pilot period and get started with Symbot.</p>',
    '<div class="sow-sign-grid">',
    '<div><div class="sow-label">NordSym AB</div><div class="sow-line"><span style="font-family:cursive;font-size:24px;">Gustav Hemmingsson</span></div><p><strong>Gustav Hemmingsson</strong><br>CEO, NordSym AB<br>Date: ' + today + '</p></div>',
    '<div>',
    '<div class="sow-label">' + data.customerName + '</div>',
    '<label class="sow-label" style="text-transform:none;letter-spacing:normal;">Draw your signature</label>',
    '<canvas id="sig-canvas" class="sow-canvas" width="320" height="110"></canvas>',
    '<button id="clear-signature" class="sow-btn-link" type="button">Clear signature</button>',
    '<div style="margin-top:10px"><input id="signer-name" class="sow-input" placeholder="Your full name" value=""></div>',
    '<div style="margin-top:10px"><input id="signer-title" class="sow-input" placeholder="Your title"></div>',
    '<p style="color:var(--muted);font-size:12px;">Date: ' + today + '</p>',
    '</div>',
    '</div>',
    '<div id="msg"></div>',
    '<div class="sow-actions"><button id="sign-btn" class="sow-btn" disabled>Sign & Start Pilot</button></div>',
    '</section>'
  );

  // Next Step Section
  html.push(
    '<div class="sow-section">',
    '<h2 class="sow-section-title"><i class="ph ph-arrow-right"></i> After Pilot</h2>',
    '<p>After the 5-day pilot, you\'ll make a decision: <strong>Kill, Pivot, or Scale.</strong></p>',
    '<p>If you choose to Scale, we\'ll move to an MoU (Memorandum of Understanding) for full partnership.</p>',
    '<p><a href="/mou/' + customerId + '" class="sow-link">Preview MoU →</a></p>',
    '</div>'
  );

  // CTA Section
  if (data.cta) {
    html.push(
      '<section class="sow-section" style="text-align:center;background:var(--accent-bg);padding:40px;border-radius:12px;border:2px solid var(--cyan);">',
      '<h2 style="display:flex;align-items:center;justify-content:center;gap:12px;">',
      '<i class="ph ph-lightning-fill" style="font-size:32px;color:var(--cyan);"></i>',
      'Ready to Get Started?',
      '</h2>',
      '<p style="font-size:16px;margin-bottom:30px;">Fast execution. Clear results. Let\'s move.</p>',
      '<div style="display:flex;gap:15px;justify-content:center;flex-wrap:wrap;">',
      '<a href="mailto:gustav@nordsym.com?subject=Discovery Call Request - ' + data.customerName + '" class="sow-btn" style="text-decoration:none;display:inline-block;display:flex;align-items:center;gap:8px;">',
      '<i class="ph ph-rocket-launch"></i>',
      data.cta.primary,
      '</a>',
      '</div>',
      '<p style="margin-top:20px;font-size:14px;color:var(--muted);">⚡ Proposal valid until ' + data.validUntil + '</p>',
      '</section>'
    );
  }

  // Footer
  html.push(
    '<div style="margin-top:40px;padding-top:30px;border-top:1px solid var(--border);text-align:center;color:var(--muted);font-size:14px;">',
    '<p>Generated ' + today + ' | NordSym AB (559535-5768)</p>',
    '<p><a href="mailto:gustav@nordsym.com">gustav@nordsym.com</a> | nordsym.com</p>',
    '</div>',
    '</div></div>'
  );

  root.innerHTML = html.join('');

  // Update timers every second
  setInterval(function () {
    const pilotContainer = document.getElementById('pilot-timer-container');
    if (pilotContainer) {
      pilotContainer.innerHTML = renderPilotTimer();
    }
    const urgencyContainer = document.getElementById('urgency-timer-container');
    if (urgencyContainer) {
      urgencyContainer.innerHTML = renderUrgencyTimer();
    }
  }, 1000);

  // Signature canvas logic
  const canvas = document.getElementById('sig-canvas');
  const ctx = canvas && canvas.getContext('2d');
  const nameInput = document.getElementById('signer-name');
  const titleInput = document.getElementById('signer-title');
  const btn = document.getElementById('sign-btn');
  const clearBtn = document.getElementById('clear-signature');
  const msg = document.getElementById('msg');

  if (!canvas || !ctx) return; // Signature section not rendered (already signed)

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

    // Store signature timestamp to start 5-day pilot countdown
    const pilotSignedKey = 'proposal_signed_' + customerId;
    localStorage.setItem(pilotSignedKey, new Date().toISOString());
    
    msg.className = 'sow-msg ok';
    msg.textContent = '🚀 Pilot activated! Your 5-day countdown has started. Check Telegram for Symbot.';
    
    // Refresh the page to show the active pilot timer
    setTimeout(function () {
      window.location.reload();
    }, 2000);
  });
})();
