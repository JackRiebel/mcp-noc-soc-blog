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
    // Layout
    var rowTop = 30;                          // device row
    var rowBot = h - (sm ? 55 : 65);          // connector row
    var midY = (rowTop + rowBot) / 2;         // middle zone for lines / USB-C bar

    var boxW = sm ? 90 : 120;
    var boxH = sm ? 38 : 44;
    var gap = sm ? 12 : 24;

    // ── TOP ROW: 3 device boxes ──
    var devTotal = tools.length * boxW + (tools.length - 1) * gap;
    var devStartX = (w - devTotal) / 2;
    var devCenters = [];

    tools.forEach(function (tool, i) {
      var x = devStartX + i * (boxW + gap);
      var cx = x + boxW / 2;
      devCenters.push(cx);

      // Box
      rrect(x, rowTop, boxW, boxH, 8);
      ctx.fillStyle = 'rgba(22,22,35,0.95)';
      ctx.fill();
      ctx.strokeStyle = CYAN + '55';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#fff';
      ctx.font = '600 ' + (sm ? '12' : '14') + 'px Inter, system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tool.label, cx, rowTop + boxH / 2);
    });

    // Column header
    ctx.fillStyle = CYAN + '80';
    ctx.font = '600 ' + (sm ? '9' : '10') + 'px Inter, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('DEVICES', w / 2, rowTop - 10);

    // ── BOTTOM ROW: 9 connector boxes (before) or 3 USB-C boxes (after) ──
    var ba = 1 - t;
    var aa = t;

    // BEFORE: 9 connector rectangles (3 under each device)
    if (ba > 0.01) {
      var cBoxW = sm ? 72 : 95;
      var cBoxH = sm ? 30 : 34;
      var cGap = sm ? 5 : 8;
      var colors = [CYAN, BLUE, PURPLE];
      var labels = ['Lightning', 'Micro-USB', 'Barrel Plug'];

      ctx.fillStyle = 'rgba(255,255,255,' + (ba * 0.4) + ')';
      ctx.font = '600 ' + (sm ? '9' : '10') + 'px Inter, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('CABLES NEEDED', w / 2, rowBot - 12);

      tools.forEach(function (tool, ti) {
        var dcx = devCenters[ti];
        var groupW = 3 * cBoxW + 2 * cGap;
        var gx = dcx - groupW / 2;

        labels.forEach(function (lbl, j) {
          var bx = gx + j * (cBoxW + cGap);
          var by = rowBot;
          var bcx = bx + cBoxW / 2;
          var col = colors[j];

          // Line from device down to connector
          ctx.strokeStyle = col + hex(ba * 0.3);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(dcx, rowTop + boxH);
          ctx.bezierCurveTo(dcx, midY, bcx, midY, bcx, by);
          ctx.stroke();

          // Connector box
          rrect(bx, by, cBoxW, cBoxH, 6);
          ctx.fillStyle = col + hex(ba * 0.1);
          ctx.fill();
          ctx.strokeStyle = col + hex(ba * 0.5);
          ctx.lineWidth = 1;
          ctx.stroke();

          // Label
          ctx.fillStyle = col + hex(ba * 0.9);
          ctx.font = '500 ' + (sm ? '8' : '10') + 'px Inter, system-ui';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(lbl, bcx, by + cBoxH / 2);
        });
      });
    }

    // AFTER: USB-C bar + 3 USB-C boxes
    if (aa > 0.01) {
      var pulse = Math.sin(frameCount * 0.03) * 0.1 + 0.9;

      // USB-C bar in the middle
      var barW = devTotal + 40;
      var barH = sm ? 32 : 38;
      var barX = (w - barW) / 2;
      var barY = midY - barH / 2;

      ctx.shadowColor = GREEN + hex(aa * 0.3);
      ctx.shadowBlur = 20;
      rrect(barX, barY, barW, barH, barH / 2);
      ctx.fillStyle = 'rgba(10,10,18,' + (aa * 0.97) + ')';
      ctx.fill();
      ctx.shadowColor = 'transparent';

      rrect(barX, barY, barW, barH, barH / 2);
      ctx.fillStyle = GREEN + hex(aa * 0.12);
      ctx.fill();
      ctx.strokeStyle = GREEN + hex(aa * pulse);
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.globalAlpha = aa;
      ctx.font = '700 ' + (sm ? '12' : '14') + 'px Inter, system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('USB-C', w / 2, midY);
      ctx.globalAlpha = 1;

      // Lines from devices down to bar
      devCenters.forEach(function (dcx, i) {
        ctx.strokeStyle = GREEN + hex(aa * 0.45);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(dcx, rowTop + boxH);
        ctx.lineTo(dcx, barY);
        ctx.stroke();

        // Flow dot
        var dp = ((frameCount * 0.012 + i * 0.33) % 1);
        var dy = rowTop + boxH + dp * (barY - rowTop - boxH);
        ctx.beginPath();
        ctx.arc(dcx, dy, 3, 0, Math.PI * 2);
        ctx.fillStyle = GREEN + hex(aa * 0.8);
        ctx.fill();
      });

      // 3 charger boxes below bar
      var cBoxW = sm ? 90 : 115;
      var cBoxH = sm ? 34 : 40;
      var cGap = sm ? 12 : 24;
      var cTotal = chargers.length * cBoxW + (chargers.length - 1) * cGap;
      var cStartX = (w - cTotal) / 2;

      ctx.fillStyle = 'rgba(255,255,255,' + (aa * 0.4) + ')';
      ctx.font = '600 ' + (sm ? '9' : '10') + 'px Inter, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('WORKS WITH', w / 2, rowBot - 12);

      chargers.forEach(function (ch, i) {
        var cx = cStartX + i * (cBoxW + cGap);
        var ccx = cx + cBoxW / 2;

        // Line from bar to charger
        ctx.strokeStyle = ch.color + hex(aa * 0.4);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ccx, barY + barH);
        ctx.lineTo(ccx, rowBot);
        ctx.stroke();

        // Flow dot
        var dp = ((frameCount * 0.015 + i * 0.33) % 1);
        var dy = barY + barH + dp * (rowBot - barY - barH);
        ctx.beginPath();
        ctx.arc(ccx, dy, 3, 0, Math.PI * 2);
        ctx.fillStyle = ch.color + hex(aa * 0.7);
        ctx.fill();

        // Charger box
        ctx.shadowColor = ch.color + hex(aa * 0.2);
        ctx.shadowBlur = 12;
        rrect(cx, rowBot, cBoxW, cBoxH, 8);
        ctx.fillStyle = 'rgba(15,15,25,' + (aa * 0.95) + ')';
        ctx.fill();
        ctx.shadowColor = 'transparent';

        rrect(cx, rowBot, cBoxW, cBoxH, 8);
        ctx.fillStyle = ch.color + hex(aa * 0.1);
        ctx.fill();
        ctx.strokeStyle = ch.color + hex(aa * 0.55);
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.globalAlpha = aa;
        ctx.font = '600 ' + (sm ? '11' : '13') + 'px Inter, system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ch.label, ccx, rowBot + cBoxH / 2);
        ctx.globalAlpha = 1;
      });
    }

    // ── BOTTOM LABEL ──
    ctx.fillStyle = '#fff';
    ctx.font = '600 ' + (sm ? '12' : '14') + 'px Inter, system-ui';
    ctx.textAlign = 'center';
    var label = t < 0.5
      ? (tools.length * oldCables.length) + ' different cables in your drawer'
      : '1 standard \u2014 every device, every charger';
    ctx.fillText(label, w / 2, h - (sm ? 8 : 12));
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
