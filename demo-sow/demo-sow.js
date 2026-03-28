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
  const data = window.NORDSYM_DEMO_SOW_DATA && window.NORDSYM_DEMO_SOW_DATA[customerId];
  const root = document.getElementById('demo-sow-root');
  
  if (!data || !root) {
    if (root) root.innerHTML = '<div class="sow-msg err">Document not found.</div>';
    return;
  }

  // localStorage keys
  const demoSignedKey = 'demo_signed_' + customerId;
  const sowSignedKey = 'sow_signed_' + customerId;

  // Get timestamps
  const demoSignedStr = localStorage.getItem(demoSignedKey);
  const sowSignedStr = localStorage.getItem(sowSignedKey);

  // Calculate states
  function getState() {
    const now = new Date();
    
    if (!demoSignedStr) {
      return { stage: 'pre-demo', message: 'Sign demo agreement to start' };
    }
    
    const demoStart = new Date(demoSignedStr);
    const demoEnd = new Date(demoStart.getTime() + data.demo.durationHours * 60 * 60 * 1000);
    const sowWindowEnd = new Date(demoEnd.getTime() + data.sow.unlockWindowHours * 60 * 60 * 1000);
    
    if (sowSignedStr) {
      return { stage: 'complete', message: 'Both documents signed - ready to start!' };
    }
    
    if (now < demoEnd) {
      const remaining = demoEnd - now;
      return {
        stage: 'demo-active',
        message: 'Demo period active',
        remaining: remaining,
        demoStart: demoStart
      };
    }
    
    if (now >= demoEnd && now < sowWindowEnd) {
      const windowRemaining = sowWindowEnd - now;
      return {
        stage: 'sow-unlocked',
        message: 'SoW signature window open',
        remaining: windowRemaining,
        demoEnd: demoEnd
      };
    }
    
    // Manual unlock bypasses expired window (admin override)
    if (data.sow && data.sow.manualUnlock) {
      return { stage: 'sow-unlocked', message: 'SoW signature window open', remaining: null };
    }
    
    return { stage: 'expired', message: 'SoW signature window expired' };
  }

  // Format time remaining
  function formatTime(ms) {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return {
      hours: hours,
      minutes: minutes,
      seconds: seconds,
      display: hours + 'h ' + String(minutes).padStart(2, '0') + 'm ' + String(seconds).padStart(2, '0') + 's'
    };
  }

  // Helper functions
  function fmtDate(d) {
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  const today = fmtDate(new Date());

  // Build HTML
  function render() {
    const state = getState();
    let html = [];

    // Header
    html.push(
      '<div class="sow-card"><div class="sow-card-inner">',
      '<h1 class="sow-title">NordSym × ' + data.customerName + '</h1>',
      '<p class="sow-sub">' + data.vertical + '</p>',
      '<div class="sow-bar"></div>'
    );

    // Stage indicator
    html.push(
      '<div class="stage-indicator">',
      '<div class="stage ' + (state.stage === 'pre-demo' || state.stage === 'demo-active' ? 'active' : (state.stage !== 'pre-demo' ? 'complete' : '')) + '">',
      '<div class="stage-number">1</div>',
      '<div class="stage-title">Demo Period</div>',
      '<div class="stage-desc">72 hours</div>',
      '</div>',
      '<div class="stage ' + (state.stage === 'sow-unlocked' ? 'active' : (state.stage === 'complete' ? 'complete' : '')) + '">',
      '<div class="stage-number">2</div>',
      '<div class="stage-title">SoW Signature</div>',
      '<div class="stage-desc">24h window</div>',
      '</div>',
      '<div class="stage ' + (state.stage === 'complete' ? 'complete' : '') + '">',
      '<div class="stage-number">3</div>',
      '<div class="stage-title">Active Period</div>',
      '<div class="stage-desc">30 days</div>',
      '</div>',
      '</div>'
    );

    // Success state
    if (state.stage === 'complete') {
      html.push(
        '<div class="success-banner">',
        '<i class="ph-fill ph-check-circle"></i>',
        '<h2 style="margin:0 0 12px 0;">All Documents Signed!</h2>',
        '<p style="margin:0;font-size:16px;">Your 30-day active period begins now. Check Telegram for next steps from the NordSym execution layer.</p>',
        '</div>'
      );
    }

    // Expired state
    if (state.stage === 'expired') {
      html.push(
        '<div style="background:linear-gradient(135deg,#FF6B6B,#C92A2A);color:#fff;padding:40px;border-radius:16px;text-align:center;margin:30px 0;">',
        '<i class="ph-fill ph-warning" style="font-size:64px;margin-bottom:16px;display:block;"></i>',
        '<h2 style="margin:0 0 12px 0;">SoW Signature Window Expired</h2>',
        '<p style="margin:0;font-size:16px;">The 24-hour window to sign the SoW has passed. Please contact Gustav to discuss next steps.</p>',
        '<div style="margin-top:24px;">',
        '<a href="mailto:gustav@nordsym.com?subject=SoW Expired - ' + data.customerName + '" class="sow-btn" style="background:#fff;color:#C92A2A;text-decoration:none;display:inline-block;padding:14px 28px;border-radius:10px;font-weight:600;">',
        '<i class="ph ph-envelope"></i> Contact Gustav',
        '</a>',
        '</div>',
        '</div>'
      );
    }

    // ===== SECTION 1: DEMO AGREEMENT =====
    html.push('<section class="sow-section">');
    html.push('<h2 style="display:flex;align-items:center;gap:12px;">');
    html.push('<i class="ph ph-rocket-launch" style="font-size:28px;color:var(--cyan);"></i>');
    html.push('<span>Section 1: Demo Agreement</span>');
    html.push('</h2>');
    
    html.push('<p style="font-size:16px;line-height:1.7;">' + data.demo.description + '</p>');

    // Demo terms
    html.push('<div style="background:var(--surface-2);padding:24px;border-radius:12px;margin:20px 0;">');
    html.push('<h3 style="margin-top:0;color:var(--cyan);">What You Get:</h3>');
    html.push('<ul style="margin:12px 0;padding-left:20px;line-height:1.8;">');
    data.demo.terms.forEach(function(term) {
      html.push('<li>' + term + '</li>');
    });
    html.push('</ul>');
    html.push('</div>');

    // Demo timer
    if (state.stage === 'demo-active') {
      const time = formatTime(state.remaining);
      html.push(
        '<div id="demo-timer" class="mou-countdown" style="background:linear-gradient(135deg,#00FF87,#60EFFF);">',
        '<div class="mou-countdown-label" style="color:#1a1a1a;"><i class="ph-fill ph-rocket-launch" style="color:#1a1a1a;"></i> Demo active:</div>',
        '<div class="mou-countdown-timer" style="color:#1a1a1a;">',
        '<span class="mou-time-unit"><strong>' + time.hours + '</strong><small>hours</small></span>',
        '<span class="mou-time-sep">:</span>',
        '<span class="mou-time-unit"><strong>' + String(time.minutes).padStart(2, '0') + '</strong><small>min</small></span>',
        '<span class="mou-time-sep">:</span>',
        '<span class="mou-time-unit"><strong>' + String(time.seconds).padStart(2, '0') + '</strong><small>sec</small></span>',
        '</div>',
        '<p style="margin-top:12px;font-size:13px;color:#1a1a1a;opacity:0.85;">NordSym execution layer access via Telegram. SoW unlocks after demo period.</p>',
        '</div>'
      );
    }

    // Demo signature section (only if not signed)
    if (!demoSignedStr && state.stage === 'pre-demo') {
      html.push(
        '<div style="margin-top:30px;padding-top:30px;border-top:1px solid var(--line);">',
        '<h3>Sign to Start Demo</h3>',
        '<p style="color:var(--muted);margin-bottom:20px;">Draw your signature below to activate the 72-hour demo period.</p>',
        '<div class="sow-sign-grid">',
        '<div>',
        '<div class="sow-label">NordSym AB</div>',
        '<div class="sow-line"><span style="font-family:cursive;font-size:24px;">Gustav Hemmingsson</span></div>',
        '<p><strong>Gustav Hemmingsson</strong><br>CEO, NordSym AB<br>Date: ' + today + '</p>',
        '</div>',
        '<div>',
        '<div class="sow-label">' + data.customerName + '</div>',
        '<label class="sow-label" style="text-transform:none;letter-spacing:normal;">Draw your signature</label>',
        '<canvas id="demo-canvas" class="sow-canvas" width="320" height="110"></canvas>',
        '<button id="clear-demo" class="sow-btn-link" type="button">Clear signature</button>',
        '<div style="margin-top:10px"><input id="demo-name" class="sow-input" placeholder="Your full name" value="' + data.customerRep + '"></div>',
        '<div style="margin-top:10px"><input id="demo-title" class="sow-input" placeholder="Your title"></div>',
        '<p style="color:var(--muted);font-size:12px;">Date: ' + today + '</p>',
        '</div>',
        '</div>',
        '<div id="demo-msg"></div>',
        '<div class="sow-actions"><button id="demo-sign-btn" class="sow-btn" disabled>Sign & Start 72-Hour Demo</button></div>',
        '</div>'
      );
    } else if (demoSignedStr) {
      html.push(
        '<div style="background:rgba(22,163,74,0.1);border:1px solid rgba(22,163,74,0.3);padding:20px;border-radius:12px;margin-top:20px;">',
        '<p style="margin:0;display:flex;align-items:center;gap:10px;"><i class="ph-fill ph-check-circle" style="color:var(--ok);font-size:24px;"></i><strong style="color:var(--ok);">Demo Agreement Signed</strong></p>',
        '<p style="margin:8px 0 0;font-size:14px;color:var(--muted);">Signed: ' + fmtDate(new Date(demoSignedStr)) + '</p>',
        '</div>'
      );
    }

    html.push('</section>');

    // ===== SECTION 2: SOW =====
    const sowLocked = state.stage === 'pre-demo' || state.stage === 'demo-active';
    const sowClass = sowLocked ? 'sow-section locked-section' : 'sow-section';
    
    html.push('<section class="' + sowClass + '">');
    html.push('<h2 style="display:flex;align-items:center;gap:12px;">');
    html.push('<i class="ph ph-file-text" style="font-size:28px;color:var(--cyan);"></i>');
    html.push('<span>Section 2: Statement of Work</span>');
    html.push('</h2>');

    if (sowLocked) {
      html.push(
        '<div class="locked-overlay">',
        '<i class="ph-fill ph-lock"></i>',
        '<h3 style="margin:0 0 8px 0;color:var(--muted);">Complete 72h Demo to Unlock</h3>',
        '<p style="margin:0;color:var(--muted);font-size:14px;">The Statement of Work will be available for signature after the demo period ends.</p>',
        '</div>'
      );
    } else {
      html.push('<p style="font-size:16px;line-height:1.7;">' + data.sow.description + '</p>');

      // SoW timer (if unlocked but not signed)
      if (state.stage === 'sow-unlocked' && !sowSignedStr && state.remaining) {
        const time = formatTime(state.remaining);
        html.push(
          '<div id="sow-timer" class="mou-countdown" style="background:linear-gradient(135deg,#FFB800,#FF6B00);">',
          '<div class="mou-countdown-label" style="color:#1a1a1a;"><i class="ph-fill ph-hourglass" style="color:#1a1a1a;"></i> Sign SoW within:</div>',
          '<div class="mou-countdown-timer" style="color:#1a1a1a;">',
          '<span class="mou-time-unit"><strong>' + time.hours + '</strong><small>hours</small></span>',
          '<span class="mou-time-sep">:</span>',
          '<span class="mou-time-unit"><strong>' + String(time.minutes).padStart(2, '0') + '</strong><small>min</small></span>',
          '<span class="mou-time-sep">:</span>',
          '<span class="mou-time-unit"><strong>' + String(time.seconds).padStart(2, '0') + '</strong><small>sec</small></span>',
          '</div>',
          '<p style="margin-top:12px;font-size:13px;color:#1a1a1a;opacity:0.85;">Window closes 24 hours after demo completion.</p>',
          '</div>'
        );
      }

      // Investment options
      html.push('<h3 style="color:var(--cyan);margin-top:30px;">Investment Options</h3>');
      html.push('<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;margin:20px 0;">');
      data.sow.investment.options.forEach(function(opt) {
        const rec = opt.recommended ? ' style="border:2px solid var(--cyan);box-shadow:0 0 20px rgba(0,212,255,0.2);"' : '';
        html.push(
          '<div class="sow-invest"' + rec + '>',
          opt.recommended ? '<div style="background:var(--cyan);color:var(--bg);padding:6px 12px;font-size:12px;font-weight:700;text-align:center;margin:-20px -20px 15px;border-radius:8px 8px 0 0;">RECOMMENDED</div>' : '',
          '<h4 style="margin-top:0;">' + opt.name + '</h4>',
          '<div class="sow-invest-row"><strong style="font-size:24px;color:var(--cyan);">' + opt.price + '</strong></div>',
          '<p style="font-size:14px;color:var(--muted);margin:8px 0 0;">' + opt.description + '</p>',
          '</div>'
        );
      });
      html.push('</div>');

      // Scope
      html.push('<h3 style="color:var(--cyan);margin-top:30px;">Scope of Work</h3>');
      data.sow.scope.forEach(function(phase) {
        html.push('<div style="margin:24px 0;">');
        html.push('<h4 style="margin:0 0 12px 0;">' + phase.title + '</h4>');
        html.push('<ul style="margin:0;padding-left:20px;line-height:1.8;">');
        phase.items.forEach(function(item) {
          html.push('<li>' + item + '</li>');
        });
        html.push('</ul>');
        html.push('</div>');
      });

      // Deliverables
      html.push('<h3 style="color:var(--cyan);margin-top:30px;">Deliverables</h3>');
      html.push('<ul style="margin:12px 0;padding-left:20px;line-height:1.8;">');
      data.sow.deliverables.forEach(function(item) {
        html.push('<li>' + item + '</li>');
      });
      html.push('</ul>');

      // Terms
      html.push('<h3 style="color:var(--cyan);margin-top:30px;">Terms</h3>');
      html.push('<ul style="margin:12px 0;padding-left:20px;line-height:1.8;">');
      data.sow.terms.forEach(function(term) {
        html.push('<li>' + term + '</li>');
      });
      html.push('</ul>');

      // SoW signature section (only if unlocked and not signed)
      if (state.stage === 'sow-unlocked' && !sowSignedStr) {
        html.push(
          '<div style="margin-top:40px;padding-top:30px;border-top:1px solid var(--line);">',
          '<h3>Sign Statement of Work</h3>',
          '<p style="color:var(--muted);margin-bottom:20px;">Draw your signature below to proceed with the 30-day active period.</p>',
          '<div class="sow-sign-grid">',
          '<div>',
          '<div class="sow-label">NordSym AB</div>',
          '<div class="sow-line"><span style="font-family:cursive;font-size:24px;">Gustav Hemmingsson</span></div>',
          '<p><strong>Gustav Hemmingsson</strong><br>CEO, NordSym AB<br>Date: ' + today + '</p>',
          '</div>',
          '<div>',
          '<div class="sow-label">' + data.customerName + '</div>',
          '<label class="sow-label" style="text-transform:none;letter-spacing:normal;">Draw your signature</label>',
          '<canvas id="sow-canvas" class="sow-canvas" width="320" height="110"></canvas>',
          '<button id="clear-sow" class="sow-btn-link" type="button">Clear signature</button>',
          '<div style="margin-top:10px"><input id="sow-name" class="sow-input" placeholder="Your full name" value="' + data.customerRep + '"></div>',
          '<div style="margin-top:10px"><input id="sow-title" class="sow-input" placeholder="Your title"></div>',
          '<p style="color:var(--muted);font-size:12px;">Date: ' + today + '</p>',
          '</div>',
          '</div>',
          '<div id="sow-msg"></div>',
          '<div class="sow-actions"><button id="sow-sign-btn" class="sow-btn" disabled>Sign SoW & Start 30-Day Period</button></div>',
          '</div>'
        );
      } else if (sowSignedStr) {
        html.push(
          '<div style="background:rgba(22,163,74,0.1);border:1px solid rgba(22,163,74,0.3);padding:20px;border-radius:12px;margin-top:20px;">',
          '<p style="margin:0;display:flex;align-items:center;gap:10px;"><i class="ph-fill ph-check-circle" style="color:var(--ok);font-size:24px;"></i><strong style="color:var(--ok);">SoW Signed</strong></p>',
          '<p style="margin:8px 0 0;font-size:14px;color:var(--muted);">Signed: ' + fmtDate(new Date(sowSignedStr)) + '</p>',
          '</div>'
        );
      }
    }

    html.push('</section>');

    // Footer
    html.push(
      '<div style="margin-top:40px;padding-top:30px;border-top:1px solid var(--line);text-align:center;color:var(--muted);font-size:14px;">',
      '<p>Generated ' + today + ' | NordSym AB (559535-5768)</p>',
      '<p><a href="mailto:gustav@nordsym.com">gustav@nordsym.com</a> | nordsym.com</p>',
      '</div>'
    );

    html.push('</div></div>');
    root.innerHTML = html.join('');
  }

  // Initial render
  render();

  // Update timers every second
  setInterval(function() {
    const state = getState();
    
    if (state.stage === 'demo-active') {
      const demoTimer = document.getElementById('demo-timer');
      if (demoTimer && state.remaining) {
        const time = formatTime(state.remaining);
        const timerEl = demoTimer.querySelector('.mou-countdown-timer');
        if (timerEl) {
          timerEl.innerHTML = [
            '<span class="mou-time-unit"><strong>' + time.hours + '</strong><small>hours</small></span>',
            '<span class="mou-time-sep">:</span>',
            '<span class="mou-time-unit"><strong>' + String(time.minutes).padStart(2, '0') + '</strong><small>min</small></span>',
            '<span class="mou-time-sep">:</span>',
            '<span class="mou-time-unit"><strong>' + String(time.seconds).padStart(2, '0') + '</strong><small>sec</small></span>'
          ].join('');
        }
        
        // Re-render when demo period ends
        if (state.remaining < 1000) {
          setTimeout(render, 1000);
        }
      }
    }
    
    if (state.stage === 'sow-unlocked') {
      const sowTimer = document.getElementById('sow-timer');
      if (sowTimer && state.remaining) {
        const time = formatTime(state.remaining);
        const timerEl = sowTimer.querySelector('.mou-countdown-timer');
        if (timerEl) {
          timerEl.innerHTML = [
            '<span class="mou-time-unit"><strong>' + time.hours + '</strong><small>hours</small></span>',
            '<span class="mou-time-sep">:</span>',
            '<span class="mou-time-unit"><strong>' + String(time.minutes).padStart(2, '0') + '</strong><small>min</small></span>',
            '<span class="mou-time-sep">:</span>',
            '<span class="mou-time-unit"><strong>' + String(time.seconds).padStart(2, '0') + '</strong><small>sec</small></span>'
          ].join('');
        }
        
        // Re-render when SoW window expires
        if (state.remaining < 1000) {
          setTimeout(render, 1000);
        }
      }
    }
  }, 1000);

  // Demo signature canvas logic
  function setupSignatureCanvas(canvasId, nameId, titleId, btnId, clearId, msgId, storageKey, successMsg) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const nameInput = document.getElementById(nameId);
    const titleInput = document.getElementById(titleId);
    const btn = document.getElementById(btnId);
    const clearBtn = document.getElementById(clearId);
    const msg = document.getElementById(msgId);

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

    btn.addEventListener('click', function () {
      btn.disabled = true;
      msg.className = '';
      msg.textContent = '';

      localStorage.setItem(storageKey, new Date().toISOString());
      
      msg.className = 'sow-msg ok';
      msg.textContent = successMsg;
      
      setTimeout(function () {
        render();
      }, 1500);
    });
  }

  // Setup demo signature
  setupSignatureCanvas(
    'demo-canvas',
    'demo-name',
    'demo-title',
    'demo-sign-btn',
    'clear-demo',
    'demo-msg',
    demoSignedKey,
    '🚀 Demo activated! Your 72-hour countdown has started.'
  );

  // Setup SoW signature
  setupSignatureCanvas(
    'sow-canvas',
    'sow-name',
    'sow-title',
    'sow-sign-btn',
    'clear-sow',
    'sow-msg',
    sowSignedKey,
    '✅ SoW signed! Your 30-day active period begins now.'
  );
})();
