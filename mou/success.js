(function () {
  const body = document.body;
  const themeToggleBtn = document.getElementById('theme-toggle');
  const defaultTheme = localStorage.getItem('theme') || 'light';

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
  }

  setTheme(defaultTheme);
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', function () {
      setTheme(body.classList.contains('light-theme') ? 'dark' : 'light');
    });
  }

  const params = new URLSearchParams(window.location.search);
  const customerId = params.get('customerId') || 'fadi';
  const signerName = params.get('signerName') || '';
  const signerTitle = params.get('signerTitle') || '';
  const data = window.NORDSYM_MOU_DATA && window.NORDSYM_MOU_DATA[customerId];
  const root = document.getElementById('success-root');
  
  if (!data || !root) {
    if (root) root.innerHTML = '<div class="sow-msg err">Invalid MoU context.</div>';
    return;
  }

  root.innerHTML = [
    '<div class="sow-card"><div class="sow-card-inner">',
    '<div style="text-align:center;margin-bottom:32px">',
    '<div style="width:80px;height:80px;margin:0 auto 16px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:50%;display:flex;align-items:center;justify-content:center">',
    '<i class="ph-fill ph-check" style="font-size:48px;color:white"></i>',
    '</div>',
    '<h1 class="sow-title" style="margin-bottom:8px">MoU Signed Successfully</h1>',
    '<p class="sow-sub">Thank you for your interest in partnership</p>',
    '</div>',
    '<div class="sow-bar"></div>',
    '<section class="sow-section">',
    '<h2>What Happens Next?</h2>',
    '<div style="display:grid;gap:16px;margin-top:24px">',
    '<div style="padding:16px;background:var(--card-bg);border-radius:8px;border:1px solid var(--border)">',
    '<div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">',
    '<div style="width:32px;height:32px;background:#667eea;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0">',
    '<span style="color:white;font-weight:600;font-size:14px">1</span>',
    '</div>',
    '<strong>Email Confirmation</strong>',
    '</div>',
    '<p style="color:var(--muted);font-size:14px;margin-left:44px">You\'ll receive an email confirmation of the signed MoU at your provided email address.</p>',
    '</div>',
    '<div style="padding:16px;background:var(--card-bg);border-radius:8px;border:1px solid var(--border)">',
    '<div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">',
    '<div style="width:32px;height:32px;background:#764ba2;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0">',
    '<span style="color:white;font-weight:600;font-size:14px">2</span>',
    '</div>',
    '<strong>Discovery Call</strong>',
    '</div>',
    '<p style="color:var(--muted);font-size:14px;margin-left:44px">Gustav from NordSym will reach out within 24 hours to schedule an initial discovery call and AEO/GEO audit.</p>',
    '</div>',
    '<div style="padding:16px;background:var(--card-bg);border-radius:8px;border:1px solid var(--border)">',
    '<div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">',
    '<div style="width:32px;height:32px;background:#667eea;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0">',
    '<span style="color:white;font-weight:600;font-size:14px">3</span>',
    '</div>',
    '<strong>Exploration Phase</strong>',
    '</div>',
    '<p style="color:var(--muted);font-size:14px;margin-left:44px">We\'ll explore partnership opportunities, design a pilot, and work towards a formal Scope of Work (SoW) if both parties see mutual value.</p>',
    '</div>',
    '</div>',
    '</section>',
    '<section class="sow-section">',
    '<h2>Signed By</h2>',
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:24px;margin-top:16px">',
    '<div>',
    '<div class="sow-label">NordSym AB</div>',
    '<p><strong>Gustav Hemmingsson</strong><br><span style="color:var(--muted)">CEO</span></p>',
    '</div>',
    '<div>',
    '<div class="sow-label">' + data.customerName + '</div>',
    '<p><strong>' + (signerName || data.customerRep) + '</strong>' + (signerTitle ? '<br><span style="color:var(--muted)">' + signerTitle + '</span>' : '') + '</p>',
    '</div>',
    '</div>',
    '</section>',
    '<section class="sow-section">',
    '<h2>Questions?</h2>',
    '<p>Reach out to Gustav directly:</p>',
    '<p style="margin-top:8px">',
    '<i class="ph ph-envelope" style="margin-right:6px"></i> <a href="mailto:gustav@nordsym.com">gustav@nordsym.com</a><br>',
    '<i class="ph ph-phone" style="margin-right:6px"></i> <a href="tel:+46705292583">+46 70 529 25 83</a>',
    '</p>',
    '</section>',
    '<div style="text-align:center;margin-top:32px">',
    '<a href="/" class="sow-btn">← Back to nordsym.com</a>',
    '</div>',
    '</div></div>'
  ].join('');
})();
