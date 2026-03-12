(function () {
  const body = document.body;
  const themeToggleBtn = document.getElementById('theme-toggle');
  const defaultTheme = localStorage.getItem('theme') || 'light';

  function setTheme(theme) {
    body.classList.remove('light-theme', 'dark-theme');
    body.classList.add(theme + '-theme');
    localStorage.setItem('theme', theme);
    if (themeToggleBtn) themeToggleBtn.textContent = theme === 'light' ? 'Dark' : 'Light';
  }

  setTheme(defaultTheme);
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', function () {
      setTheme(body.classList.contains('light-theme') ? 'dark' : 'light');
    });
  }

  const params = new URLSearchParams(window.location.search);
  const customerId = params.get('customerId') || 'excom';
  const demo = params.get('demo') === '1';
  const signerNameParam = params.get('signerName') || '';
  const content = window.NORDSYM_SOW_DATA && window.NORDSYM_SOW_DATA[customerId];
  const root = document.getElementById('flow-root');
  if (!content || !root) {
    if (root) root.innerHTML = '<div class="sow-msg err">Invalid onboarding context.</div>';
    return;
  }

  root.innerHTML = [
    '<div class="sow-card"><div class="sow-card-inner">',
    '<h1 class="sow-title">NordSym X ' + content.customerName + '</h1>',
    '<p class="sow-sub">Onboarding & Google Meet Booking</p>',
    '<div class="sow-bar"></div>',
    (demo ? '<div class="sow-msg ok">Demo mode: payment is bypassed for testing.</div>' : ''),
    '<div class="flow-stepper" id="stepper"></div>',
    '<div id="panel" class="flow-panel"></div>',
    '</div></div>'
  ].join('');

  const state = {
    step: 1,
    name: signerNameParam,
    email: '',
    title: '',
    company: content.customerName,
    primaryGoal: '',
    constraints: '',
    stakeholders: '',
    agenda: ''
  };

  const steps = ['Contact', 'Context', 'Agenda', 'Book'];

  function renderStepper() {
    const s = document.getElementById('stepper');
    s.innerHTML = steps.map(function (name, i) {
      const n = i + 1;
      return '<div class="flow-step ' + (state.step === n ? 'active' : '') + '">' + n + '. ' + name + '</div>';
    }).join('');
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, function (m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
  }

  function autoAgenda() {
    const lines = [
      '1) Objectives and desired business outcomes',
      '2) Week 1 scope and success criteria',
      '3) Technical constraints and integration boundaries',
      '4) Roles, owners and communication cadence',
      '5) Next actions and timeline'
    ];
    if (state.primaryGoal) lines.unshift('Business goal: ' + state.primaryGoal);
    if (state.constraints) lines.push('Constraints: ' + state.constraints);
    if (state.stakeholders) lines.push('Stakeholders: ' + state.stakeholders);
    return lines.join('\n');
  }

  function next() { state.step = Math.min(4, state.step + 1); render(); }
  function prev() { state.step = Math.max(1, state.step - 1); render(); }

  function render() {
    renderStepper();
    const panel = document.getElementById('panel');
    if (state.step === 1) {
      panel.innerHTML = [
        '<h2>Contact Details</h2>',
        '<div class="flow-grid">',
        '<input id="name" class="sow-input" placeholder="Full name" value="' + escapeHtml(state.name) + '">',
        '<input id="email" class="sow-input" placeholder="Work email" value="' + escapeHtml(state.email) + '">',
        '<input id="title" class="sow-input" placeholder="Title" value="' + escapeHtml(state.title) + '">',
        '<input id="company" class="sow-input" placeholder="Company" value="' + escapeHtml(state.company) + '">',
        '</div>',
        '<div class="flow-actions"><span></span><button class="flow-btn primary" id="next">Next</button></div>'
      ].join('');
      document.getElementById('next').onclick = function () {
        state.name = document.getElementById('name').value.trim();
        state.email = document.getElementById('email').value.trim();
        state.title = document.getElementById('title').value.trim();
        state.company = document.getElementById('company').value.trim() || content.customerName;
        if (!state.name || !state.email || !state.title) return alert('Please complete required fields.');
        next();
      };
      return;
    }

    if (state.step === 2) {
      panel.innerHTML = [
        '<h2>Project Context</h2>',
        '<div class="flow-grid-1">',
        '<textarea id="goal" class="sow-input" rows="3" placeholder="Primary goal for this pilot">' + escapeHtml(state.primaryGoal) + '</textarea>',
        '<textarea id="constraints" class="sow-input" rows="3" placeholder="Technical or process constraints">' + escapeHtml(state.constraints) + '</textarea>',
        '<textarea id="stakeholders" class="sow-input" rows="2" placeholder="Who should be included in decision flow?">' + escapeHtml(state.stakeholders) + '</textarea>',
        '</div>',
        '<div class="flow-actions"><button class="flow-btn" id="prev">Back</button><button class="flow-btn primary" id="next">Next</button></div>'
      ].join('');
      document.getElementById('prev').onclick = prev;
      document.getElementById('next').onclick = function () {
        state.primaryGoal = document.getElementById('goal').value.trim();
        state.constraints = document.getElementById('constraints').value.trim();
        state.stakeholders = document.getElementById('stakeholders').value.trim();
        state.agenda = autoAgenda();
        next();
      };
      return;
    }

    if (state.step === 3) {
      if (!state.agenda) state.agenda = autoAgenda();
      panel.innerHTML = [
        '<h2>Meeting Agenda (Google Meet)</h2>',
        '<textarea id="agenda" class="sow-input" rows="10">' + escapeHtml(state.agenda) + '</textarea>',
        '<div class="flow-actions"><button class="flow-btn" id="prev">Back</button><button class="flow-btn primary" id="next">Next</button></div>'
      ].join('');
      document.getElementById('prev').onclick = prev;
      document.getElementById('next').onclick = function () {
        state.agenda = document.getElementById('agenda').value.trim();
        if (!state.agenda) return alert('Please keep an agenda.');
        next();
      };
      return;
    }

    panel.innerHTML = [
      '<h2>Book Checkpoint Meeting</h2>',
      '<div class="flow-grid">',
      '<input id="date" class="sow-input" type="date">',
      '<input id="time" class="sow-input" type="time">',
      '</div>',
      '<p style="color:var(--muted);font-size:14px">We will request a <strong>Google Meet</strong> invite and send a polished confirmation email with the final agenda.</p>',
      '<div id="status" class="flow-status"></div>',
      '<div class="flow-actions"><button class="flow-btn" id="prev">Back</button><button class="flow-btn primary" id="book">Book Google Meet</button></div>'
    ].join('');

    document.getElementById('prev').onclick = prev;
    document.getElementById('book').onclick = async function () {
      const date = document.getElementById('date').value;
      const time = document.getElementById('time').value;
      if (!date || !time) return alert('Select date and time.');

      const status = document.getElementById('status');
      status.textContent = 'Booking...';
      try {
        const response = await fetch('/api/sow/book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerId,
            customerName: content.customerName,
            signerName: state.name,
            signerEmail: state.email,
            signerTitle: state.title,
            company: state.company,
            requestedDate: date,
            requestedTime: time,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Stockholm',
            agenda: state.agenda,
            demo
          })
        });
        const payload = await response.json().catch(function () { return {}; });
        if (!response.ok) throw new Error(payload.error || 'Booking failed');
        status.innerHTML = '<span class="sow-msg ok">Meeting request sent. Check your email shortly.</span>';
      } catch (err) {
        status.innerHTML = '<span class="sow-msg err">' + escapeHtml(err.message) + '</span>';
      }
    };
  }

  render();
})();
