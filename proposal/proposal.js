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
  ];

  // Problem statement
  if (data.problem) {
    html.push(
      '<section class="sow-section">',
      '<p style="font-size:18px;line-height:1.6;color:var(--text);">' + data.problem + '</p>',
      '</section>'
    );
  }

  // Solution overview
  if (data.solution) {
    html.push(
      '<section class="sow-section" style="background:var(--accent-bg);padding:30px;border-radius:12px;border-left:4px solid var(--cyan);">',
      '<h2 style="margin-top:0;">Our Solution</h2>',
      '<p style="font-size:16px;line-height:1.7;">' + data.solution + '</p>',
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
        html.push('<p style="font-size:15px;line-height:1.7;">' + line + '</p>');
      });
    }

    if (section.items) {
      section.items.forEach(function (item) {
        html.push(
          '<div class="sow-item" style="padding-left:44px;position:relative;">',
          '<i class="ph ph-check-circle" style="position:absolute;left:12px;top:12px;font-size:20px;color:var(--cyan);"></i>',
          '<strong style="color:var(--cyan);">' + item.label + '</strong>',
          '<p style="margin:6px 0 0;font-size:14px;line-height:1.6;">' + item.value + '</p>',
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

  // Next Step Section
  html.push(
    '<div class="sow-section">',
    '<h2 class="sow-section-title"><i class="ph ph-arrow-right"></i> Next Step</h2>',
    '<p>After expressing interest, you\'ll receive an MoU (Memorandum of Understanding) for 72-hour exploration period.</p>',
    '<p><strong>⚡ Fast decisions win.</strong> Sign MoU → Pilot SoW → Launch together.</p>',
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
})();
