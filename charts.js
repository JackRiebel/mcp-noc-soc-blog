// ── MCP Blog — Charts, Diagram & Interactivity ────────────────────────────
(function () {
  'use strict';

  // ── Chart.js global defaults ──────────────────────────────────────────────
  Chart.defaults.color = '#888894';
  Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';
  Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
  Chart.defaults.font.size = 12;
  Chart.defaults.plugins.legend.labels.boxWidth = 14;
  Chart.defaults.plugins.legend.labels.padding = 16;
  Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(10,10,15,0.95)';
  Chart.defaults.plugins.tooltip.titleColor = '#fff';
  Chart.defaults.plugins.tooltip.bodyColor = '#e0e0e8';
  Chart.defaults.plugins.tooltip.borderColor = 'rgba(255,255,255,0.1)';
  Chart.defaults.plugins.tooltip.borderWidth = 1;
  Chart.defaults.plugins.tooltip.cornerRadius = 8;
  Chart.defaults.plugins.tooltip.padding = 10;

  const CYAN = '#22d3ee';
  const PURPLE = '#a78bfa';
  const BLUE = '#60a5fa';
  const GREEN = '#34d399';
  const RED = '#f87171';
  const ORANGE = '#fb923c';
  const YELLOW = '#fbbf24';

  // ── Utility ───────────────────────────────────────────────────────────────
  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return document.querySelectorAll(sel); }

  // ── 1. Reading Progress Bar ───────────────────────────────────────────────
  const progressBar = $('#readingProgress');
  window.addEventListener('scroll', function () {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
  });

  // ── 2. Sticky Nav Scroll-Spy ──────────────────────────────────────────────
  const navLinks = $$('.nav-link');
  const sections = [];
  navLinks.forEach(function (link) {
    const id = link.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) sections.push({ id: id, el: el, link: link });
  });

  function updateNav() {
    let current = sections[0];
    const scrollY = window.scrollY + 120;
    for (let i = sections.length - 1; i >= 0; i--) {
      if (scrollY >= sections[i].el.offsetTop) { current = sections[i]; break; }
    }
    navLinks.forEach(function (l) { l.classList.remove('active'); });
    if (current) current.link.classList.add('active');
  }
  window.addEventListener('scroll', updateNav);
  updateNav();

  // Smooth scroll for nav links
  navLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.getElementById(this.getAttribute('href').slice(1));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ── 3. Alert Fatigue Chart ────────────────────────────────────────────────
  new Chart($('#alertFatigueChart'), {
    type: 'bar',
    data: {
      labels: ['Alerts/Day', 'Unaddressed', 'False Positives\n(46% rate)'],
      datasets: [{
        data: [
          SOC_PAIN.alertsPerDay,
          SOC_PAIN.alertsPerDay * SOC_PAIN.alertsUnaddressedPct / 100,
          SOC_PAIN.alertsPerDay * SOC_PAIN.falsePositiveRate / 100,
        ],
        backgroundColor: [RED, ORANGE, YELLOW],
        borderRadius: 6,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (ctx) { return ctx.parsed.y.toLocaleString() + ' alerts'; },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: function (v) { return v.toLocaleString(); } },
          grid: { color: 'rgba(255,255,255,0.04)' },
        },
        x: { grid: { display: false } },
      },
    },
  });

  // ── 4. Tool Sprawl Chart ──────────────────────────────────────────────────
  new Chart($('#toolSprawlChart'), {
    type: 'bar',
    data: {
      labels: TOOL_SPRAWL.bySize.map(function (d) { return d.label; }),
      datasets: [{
        label: 'Security Tools',
        data: TOOL_SPRAWL.bySize.map(function (d) { return d.tools; }),
        backgroundColor: [BLUE + '99', BLUE, PURPLE, RED],
        borderRadius: 6,
        borderSkipped: false,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: function (ctx) { return ctx.parsed.x + ' tools'; } },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: 'rgba(255,255,255,0.04)' },
        },
        y: { grid: { display: false } },
      },
    },
  });

  // Charts 5-7 (Coverage Gap, Downtime Cost, MTTR) removed — data woven into prose

  // ── 8. SDK Growth Chart ───────────────────────────────────────────────────
  new Chart($('#sdkGrowthChart'), {
    type: 'line',
    data: {
      labels: SDK_GROWTH.map(function (d) { return d.month; }),
      datasets: [{
        label: 'Monthly Downloads (M)',
        data: SDK_GROWTH.map(function (d) { return d.downloads; }),
        borderColor: CYAN,
        backgroundColor: CYAN + '18',
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointBackgroundColor: CYAN,
        pointBorderColor: '#0a0a0f',
        pointBorderWidth: 2,
        pointHoverRadius: 7,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: function (ctx) { return ctx.parsed.y + 'M downloads'; } },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: function (v) { return v + 'M'; } },
          grid: { color: 'rgba(255,255,255,0.04)' },
        },
        x: {
          grid: { display: false },
          ticks: { maxRotation: 45, font: { size: 10 } },
        },
      },
    },
  });

  // Chart 9 (Enterprise Adoption) removed — data woven into prose

  // ── 10. Interactive MCP Diagram (Canvas) ──────────────────────────────────
  var canvas = $('#mcpDiagram');
  var ctx = canvas.getContext('2d');
  var animProgress = 0;
  var animTarget = 0;
  var hoveredNode = null;
  var dpr = window.devicePixelRatio || 1;
  var frameCount = 0;

  var tools = [
    { label: 'iPhone' },
    { label: 'MacBook' },
    { label: 'iPad' },
  ];
  var oldCables = [
    { label: 'Lightning', color: CYAN },
    { label: 'Micro-USB', color: BLUE },
    { label: 'Barrel Plug', color: PURPLE },
  ];
  var chargers = [
    { label: 'Any Charger', color: CYAN },
    { label: 'Any Cable', color: BLUE },
    { label: 'Any Port', color: PURPLE },
  ];

  function resizeCanvas() {
    var wrapper = canvas.parentElement;
    var w = Math.max(wrapper.clientWidth, 300);
    var h = Math.max(wrapper.clientHeight, 280);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function hex(a) {
    var v = Math.round(Math.max(0, Math.min(1, a)) * 255);
    return (v < 16 ? '0' : '') + v.toString(16);
  }

  function rrect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function drawDiagram() {
    var w = canvas.width / dpr;
    var h = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);
    var t = animProgress;
    frameCount++;

    var sm = w < 500;
    var cardW = sm ? 110 : 155;
    var cardH = sm ? 150 : 165;
    var gap = sm ? 14 : 32;
    var totalW = tools.length * cardW + (tools.length - 1) * gap;
    var startX = (w - totalW) / 2;
    var cardY = 20;
    var slotH = sm ? 24 : 28;
    var slotW = sm ? 80 : 115;
    var slotGap = sm ? 6 : 8;
    var slotStartY = cardY + (sm ? 48 : 52);
    var cableZoneTop = cardY + cardH + 8;
    var cableZoneH = sm ? 70 : 100;
    var mcpBarY = cableZoneTop + cableZoneH + (sm ? 16 : 22);
    var aiRowY = mcpBarY + (sm ? 44 : 50);

    // ── TOOL CARDS ──
    tools.forEach(function (tool, ti) {
      var cx = startX + ti * (cardW + gap) + cardW / 2;
      var cl = cx - cardW / 2;

      // Card shadow
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 4;
      rrect(cl, cardY, cardW, cardH, 12);
      ctx.fillStyle = 'rgba(18,18,30,0.95)';
      ctx.fill();
      ctx.shadowColor = 'transparent';

      // Card border
      rrect(cl, cardY, cardW, cardH, 12);
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Top accent line
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cl + 12, cardY);
      ctx.lineTo(cl + cardW - 12, cardY);
      ctx.strokeStyle = PURPLE + '60';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Tool name
      ctx.fillStyle = '#fff';
      ctx.font = '700 ' + (sm ? '12' : '14') + 'px Inter, system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tool.label, cx, cardY + (sm ? 22 : 26));

      // Divider
      ctx.beginPath();
      ctx.moveTo(cl + 16, slotStartY - 12);
      ctx.lineTo(cl + cardW - 16, slotStartY - 12);
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // ── BEFORE: 3 connector slots ──
      var ba = 1 - t;
      if (ba > 0.01) {
        oldCables.forEach(function (ai, j) {
          var sy = slotStartY + j * (slotH + slotGap);
          var sx = cx - slotW / 2;

          // Slot background
          rrect(sx, sy, slotW, slotH, 6);
          ctx.fillStyle = ai.color + hex(ba * 0.08);
          ctx.fill();
          ctx.strokeStyle = ai.color + hex(ba * 0.4);
          ctx.lineWidth = 1;
          ctx.stroke();

          // Colored dot
          ctx.beginPath();
          ctx.arc(sx + 14, sy + slotH / 2, 4, 0, Math.PI * 2);
          ctx.fillStyle = ai.color + hex(ba * 0.7);
          ctx.fill();

          // Label
          ctx.fillStyle = ai.color + hex(ba * 0.9);
          ctx.font = '500 ' + (sm ? '9' : '11') + 'px Inter, system-ui';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(ai.label, sx + 24, sy + slotH / 2);

          // Cable dangling below card
          var cableEndX = cx + (j - 1) * (sm ? 22 : 35);
          var cableEndY = cableZoneTop + cableZoneH - 14 - j * (sm ? 8 : 12);
          ctx.strokeStyle = ai.color + hex(ba * 0.4);
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(cx, cardY + cardH);
          var cpY1 = cardY + cardH + cableZoneH * 0.3;
          var cpY2 = cableEndY - cableZoneH * 0.15;
          ctx.bezierCurveTo(cx, cpY1, cableEndX, cpY2, cableEndX, cableEndY);
          ctx.stroke();

          // Plug at end
          rrect(cableEndX - 8, cableEndY, 16, 10, 3);
          ctx.fillStyle = ai.color + hex(ba * 0.2);
          ctx.fill();
          ctx.strokeStyle = ai.color + hex(ba * 0.55);
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.fillStyle = ai.color + hex(ba * 0.7);
          ctx.fillRect(cableEndX - 3, cableEndY + 10, 6, 3);
        });
      }

      // ── AFTER: 1 MCP slot ──
      if (t > 0.01) {
        var aa = t;
        var sy = slotStartY + slotH + slotGap;
        var sx = cx - slotW / 2;

        // Slot
        rrect(sx, sy, slotW, slotH, 6);
        ctx.fillStyle = GREEN + hex(aa * 0.12);
        ctx.fill();
        ctx.strokeStyle = GREEN + hex(aa * 0.7);
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Green dot
        ctx.beginPath();
        ctx.arc(sx + 14, sy + slotH / 2, 5, 0, Math.PI * 2);
        ctx.fillStyle = GREEN + hex(aa * 0.8);
        ctx.fill();

        // Label
        ctx.fillStyle = GREEN + hex(aa);
        ctx.font = '600 ' + (sm ? '10' : '12') + 'px Inter, system-ui';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('USB-C', sx + 24, sy + slotH / 2);

        // Clean line to MCP bar
        ctx.strokeStyle = GREEN + hex(aa * 0.45);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cardY + cardH);
        ctx.lineTo(cx, mcpBarY - 6);
        ctx.stroke();

        // Animated flow dot
        var dotPos = ((frameCount * 0.012 + ti * 0.33) % 1);
        var dotY = cardY + cardH + dotPos * (mcpBarY - 6 - cardY - cardH);
        ctx.beginPath();
        ctx.arc(cx, dotY, 3, 0, Math.PI * 2);
        ctx.fillStyle = GREEN + hex(aa * 0.8);
        ctx.fill();
      }
    });

    // ── BEFORE: messy label ──
    if ((1 - t) > 0.2) {
      ctx.fillStyle = 'rgba(255,255,255,' + ((1 - t) * 0.5) + ')';
      ctx.font = '500 ' + (sm ? '10' : '12') + 'px Inter, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Every device needs its own cable', w / 2, cableZoneTop + cableZoneH + 8);
    }

    // ── AFTER: MCP BAR + AI MODELS ──
    if (t > 0.01) {
      var aa = t;
      var pulse = Math.sin(frameCount * 0.03) * 0.12 + 0.88;
      var barW = totalW + 20;
      var barH = sm ? 32 : 36;
      var barX = (w - barW) / 2;

      // Bar glow
      ctx.shadowColor = GREEN + hex(aa * 0.3);
      ctx.shadowBlur = 25;
      rrect(barX, mcpBarY - barH / 2, barW, barH, barH / 2);
      ctx.fillStyle = 'rgba(10,10,18,' + (aa * 0.97) + ')';
      ctx.fill();
      ctx.shadowColor = 'transparent';

      // Bar fill + border
      rrect(barX, mcpBarY - barH / 2, barW, barH, barH / 2);
      ctx.fillStyle = GREEN + hex(aa * 0.1);
      ctx.fill();
      ctx.strokeStyle = GREEN + hex(aa * pulse);
      ctx.lineWidth = 2;
      ctx.stroke();

      // Bar label
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = aa;
      ctx.font = '700 ' + (sm ? '11' : '13') + 'px Inter, system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('USB-C', w / 2, mcpBarY);
      ctx.globalAlpha = 1;

      // AI model pills
      var aiTotalW = 0;
      var pillH = sm ? 36 : 42;
      var pillGap = sm ? 12 : 20;
      var pillWidths = chargers.map(function (ai) { return sm ? 85 : 115; });
      pillWidths.forEach(function (pw) { aiTotalW += pw; });
      aiTotalW += (chargers.length - 1) * pillGap;
      var aiStartX = (w - aiTotalW) / 2;

      chargers.forEach(function (ai, i) {
        var pw = pillWidths[i];
        var px = aiStartX;
        for (var k = 0; k < i; k++) px += pillWidths[k] + pillGap;
        var pcx = px + pw / 2;

        // Line from bar to pill
        ctx.strokeStyle = ai.color + hex(aa * 0.4);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pcx, mcpBarY + barH / 2);
        ctx.lineTo(pcx, aiRowY);
        ctx.stroke();

        // Flow dot
        var dp = ((frameCount * 0.015 + i * 0.33) % 1);
        var dy = mcpBarY + barH / 2 + dp * (aiRowY - mcpBarY - barH / 2);
        ctx.beginPath();
        ctx.arc(pcx, dy, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = ai.color + hex(aa * 0.7);
        ctx.fill();

        // Pill shadow
        ctx.shadowColor = ai.color + hex(aa * 0.25);
        ctx.shadowBlur = 16;
        rrect(px, aiRowY, pw, pillH, pillH / 2);
        ctx.fillStyle = 'rgba(15,15,25,' + (aa * 0.95) + ')';
        ctx.fill();
        ctx.shadowColor = 'transparent';

        // Pill border + fill
        rrect(px, aiRowY, pw, pillH, pillH / 2);
        ctx.fillStyle = ai.color + hex(aa * 0.1);
        ctx.fill();
        ctx.strokeStyle = ai.color + hex(aa * 0.6);
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Label
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = aa;
        ctx.font = '600 ' + (sm ? '11' : '13') + 'px Inter, system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ai.label, pcx, aiRowY + pillH / 2);
        ctx.globalAlpha = 1;
      });

      // Subtitle
      ctx.fillStyle = 'rgba(255,255,255,' + (aa * 0.45) + ')';
      ctx.font = '500 ' + (sm ? '9' : '11') + 'px Inter, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('One cable charges everything', w / 2, aiRowY + pillH + (sm ? 14 : 18));
    }

    // ── BOTTOM LABEL ──
    ctx.fillStyle = '#fff';
    ctx.font = '600 ' + (sm ? '12' : '14') + 'px Inter, system-ui';
    ctx.textAlign = 'center';
    var label = t < 0.5
      ? (tools.length * oldCables.length) + ' different cables in your drawer'
      : '1 cable type \u2014 every device charges';
    ctx.fillText(label, w / 2, h - (sm ? 10 : 14));
  }

  function animateDiagram() {
    if (Math.abs(animProgress - animTarget) > 0.005) {
      animProgress += (animTarget - animProgress) * 0.12;
      if (Math.abs(animProgress - animTarget) < 0.005) animProgress = animTarget;
    }
    drawDiagram();
    requestAnimationFrame(animateDiagram);
  }

  $$('.diagram-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      $$('.diagram-btn').forEach(function (b) { b.classList.remove('active', 'active-red'); });
      if (this.dataset.view === 'before') {
        animTarget = 0;
        this.classList.add('active-red');
      } else {
        animTarget = 1;
        this.classList.add('active');
      }
    });
  });

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  setTimeout(resizeCanvas, 150);
  requestAnimationFrame(animateDiagram);

  // ── 11. Scroll-triggered fade-in ──────────────────────────────────────────
  var fadeEls = $$('.chart-card, .callout-banner, .conclusion-box, .workflow-col');
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        // Force Chart.js to recalculate dimensions for canvas charts
        setTimeout(function () { window.dispatchEvent(new Event('resize')); }, 100);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

  fadeEls.forEach(function (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });

})();
