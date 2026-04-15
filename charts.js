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

  var devices = [
    { label: 'Phone' },
    { label: 'Laptop' },
    { label: 'Tablet' },
  ];
  var cables = [
    { label: 'Lightning' },
    { label: 'Micro-USB' },
    { label: 'USB-B' },
    { label: 'Mini-USB' },
    { label: 'Barrel' },
    { label: 'Proprietary' },
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

  function getNodePositions(w, h) {
    var topPad = 48;
    var bottomPad = 48;
    var sidePad = w < 500 ? 50 : 90;
    var leftX = sidePad;
    var rightX = w - sidePad;
    var mcpX = w / 2;
    var mcpY = (h - topPad - bottomPad) / 2 + topPad;
    var devNodes = devices.map(function (m, i) {
      var usable = h - topPad - bottomPad;
      var spacing = usable / (devices.length + 1);
      return { x: leftX, y: topPad + spacing * (i + 1), label: m.label, type: 'device' };
    });
    var cableNodes = cables.map(function (t, i) {
      var usable = h - topPad - bottomPad;
      var spacing = usable / (cables.length + 1);
      return { x: rightX, y: topPad + spacing * (i + 1), label: t.label, type: 'cable' };
    });
    return { devices: devNodes, cables: cableNodes, hub: { x: mcpX, y: mcpY } };
  }

  function drawCurve(x1, y1, x2, y2) {
    var cp = (x2 - x1) * 0.4;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(x1 + cp, y1, x2 - cp, y2, x2, y2);
    ctx.stroke();
  }

  function drawDiagram() {
    var w = canvas.width / dpr;
    var h = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);
    var pos = getNodePositions(w, h);
    var t = animProgress;
    frameCount++;

    // Column headers
    ctx.font = '600 11px Inter, system-ui';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '0.08em';
    ctx.fillStyle = CYAN + '99';
    ctx.fillText('YOUR DEVICES', pos.devices[0].x, 24);
    ctx.fillStyle = PURPLE + '99';
    ctx.fillText(t < 0.5 ? 'PROPRIETARY CABLES' : 'ONE STANDARD', pos.cables[0].x, 24);
    ctx.letterSpacing = '0';

    // "Before" connections — curved spaghetti lines
    pos.devices.forEach(function (dev) {
      pos.cables.forEach(function (cable) {
        var alpha = 0.3 * (1 - t);
        if (hoveredNode) {
          if (hoveredNode.label === dev.label || hoveredNode.label === cable.label) {
            alpha = 0.85 * (1 - t);
          } else {
            alpha = 0.08 * (1 - t);
          }
        }
        if (alpha > 0.01) {
          ctx.strokeStyle = RED + hex(alpha);
          ctx.lineWidth = 1.5;
          drawCurve(dev.x, dev.y, cable.x, cable.y);
        }
      });
    });

    // "After" connections — clean lines through USB-C hub
    if (t > 0.01) {
      // Lines from devices to hub
      pos.devices.forEach(function (dev) {
        var alpha = 0.55 * t;
        if (hoveredNode) {
          alpha = hoveredNode.label === dev.label ? 1 * t : 0.15 * t;
        }
        ctx.strokeStyle = CYAN + hex(alpha);
        ctx.lineWidth = 2.5;
        drawCurve(dev.x, dev.y, pos.hub.x, pos.hub.y);
      });
      // Lines from hub to cables
      pos.cables.forEach(function (cable) {
        var alpha = 0.55 * t;
        if (hoveredNode) {
          alpha = hoveredNode.label === cable.label ? 1 * t : 0.15 * t;
        }
        ctx.strokeStyle = PURPLE + hex(alpha);
        ctx.lineWidth = 2.5;
        drawCurve(pos.hub.x, pos.hub.y, cable.x, cable.y);
      });

      // Hub — pulsing ring + solid circle
      var hubAlpha = t;
      var pulse = Math.sin(frameCount * 0.04) * 0.15 + 0.85;

      // Outer glow
      ctx.beginPath();
      ctx.arc(pos.hub.x, pos.hub.y, 46 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = GREEN + hex(hubAlpha * 0.06);
      ctx.fill();

      // Main circle
      ctx.beginPath();
      ctx.arc(pos.hub.x, pos.hub.y, 38, 0, Math.PI * 2);
      ctx.fillStyle = GREEN + hex(hubAlpha * 0.2);
      ctx.fill();
      ctx.strokeStyle = GREEN + hex(hubAlpha * pulse);
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#fff';
      ctx.font = '700 14px Inter, system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = hubAlpha;
      ctx.fillText('USB-C', pos.hub.x, pos.hub.y);
      ctx.globalAlpha = 1;
    }

    // Draw nodes
    pos.devices.forEach(function (n) { drawNode(n, CYAN); });
    pos.cables.forEach(function (n) { drawNode(n, PURPLE); });

    // Bottom label
    var beforeCount = devices.length * cables.length;
    var afterCount = devices.length + cables.length;
    var countLabel = t < 0.5
      ? beforeCount + ' different cables needed'
      : afterCount + ' connections \u2014 one standard';
    ctx.fillStyle = '#fff';
    ctx.font = '600 14px Inter, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(countLabel, w / 2, h - 16);
  }

  function drawNode(n, color) {
    var isHovered = hoveredNode && hoveredNode.label === n.label;
    var r = isHovered ? 28 : 24;
    // Filled circle
    ctx.beginPath();
    ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
    ctx.fillStyle = color + (isHovered ? '30' : '15');
    ctx.fill();
    ctx.strokeStyle = color + (isHovered ? 'ff' : 'aa');
    ctx.lineWidth = isHovered ? 2.5 : 1.5;
    ctx.stroke();
    // Label
    ctx.fillStyle = '#fff';
    ctx.font = (isHovered ? '600 12px' : '500 11px') + ' Inter, system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(n.label, n.x, n.y);
  }

  function hex(alpha) {
    var v = Math.round(Math.max(0, Math.min(1, alpha)) * 255);
    return (v < 16 ? '0' : '') + v.toString(16);
  }

  function animateDiagram() {
    if (Math.abs(animProgress - animTarget) > 0.005) {
      animProgress += (animTarget - animProgress) * 0.12;
      if (Math.abs(animProgress - animTarget) < 0.005) animProgress = animTarget;
    }
    drawDiagram();
    requestAnimationFrame(animateDiagram);
  }

  // Toggle buttons
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

  // Hover detection
  canvas.addEventListener('mousemove', function (e) {
    var rect = canvas.getBoundingClientRect();
    var mx = e.clientX - rect.left;
    var my = e.clientY - rect.top;
    var w = canvas.width / dpr;
    var h = canvas.height / dpr;
    var pos = getNodePositions(w, h);
    var allNodes = pos.devices.concat(pos.cables);
    hoveredNode = null;
    for (var i = 0; i < allNodes.length; i++) {
      var n = allNodes[i];
      var dx = mx - n.x; var dy = my - n.y;
      if (dx * dx + dy * dy < 34 * 34) {
        hoveredNode = n;
        canvas.style.cursor = 'pointer';
        return;
      }
    }
    canvas.style.cursor = 'default';
  });

  canvas.addEventListener('mouseleave', function () { hoveredNode = null; });

  // Touch support
  canvas.addEventListener('touchstart', function (e) {
    var rect = canvas.getBoundingClientRect();
    var touch = e.touches[0];
    var mx = touch.clientX - rect.left;
    var my = touch.clientY - rect.top;
    var w = canvas.width / dpr;
    var h = canvas.height / dpr;
    var pos = getNodePositions(w, h);
    var allNodes = pos.devices.concat(pos.cables);
    hoveredNode = null;
    for (var i = 0; i < allNodes.length; i++) {
      var n = allNodes[i];
      var dx = mx - n.x; var dy = my - n.y;
      if (dx * dx + dy * dy < 44 * 44) { hoveredNode = n; return; }
    }
  }, { passive: true });

  canvas.addEventListener('touchend', function () {
    setTimeout(function () { hoveredNode = null; }, 1500);
  }, { passive: true });

  // Init diagram — with delayed fallback for layout timing
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
