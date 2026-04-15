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
      labels: ['Alerts/Day', 'Unaddressed', 'False Positive\n(Low Est.)', 'False Positive\n(High Est.)'],
      datasets: [{
        data: [
          SOC_PAIN.alertsPerDay,
          SOC_PAIN.alertsPerDay * SOC_PAIN.alertsUnaddressedPct / 100,
          SOC_PAIN.alertsPerDay * SOC_PAIN.falsePositiveRate / 100,
          SOC_PAIN.alertsPerDay * SOC_PAIN.falsePositiveRateHigh / 100,
        ],
        backgroundColor: [RED, ORANGE, YELLOW, RED + '99'],
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

  // ── 5. Coverage Gap Chart ─────────────────────────────────────────────────
  new Chart($('#coverageGapChart'), {
    type: 'bar',
    data: {
      labels: COVERAGE_GAP.map(function (d) { return d.label; }),
      datasets: [
        {
          label: 'Theoretical AI Capability',
          data: COVERAGE_GAP.map(function (d) { return d.theoretical; }),
          backgroundColor: PURPLE + 'cc',
          borderRadius: 4,
          borderSkipped: false,
        },
        {
          label: 'Actual Adoption',
          data: COVERAGE_GAP.map(function (d) { return d.actual; }),
          backgroundColor: BLUE,
          borderRadius: 4,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: { label: function (ctx) { return ctx.dataset.label + ': ' + ctx.parsed.y + '%'; } },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { callback: function (v) { return v + '%'; } },
          grid: { color: 'rgba(255,255,255,0.04)' },
        },
        x: {
          grid: { display: false },
          ticks: {
            maxRotation: 45,
            font: { size: 10 },
          },
        },
      },
    },
  });

  // ── 6. Downtime Cost Chart ────────────────────────────────────────────────
  new Chart($('#downtimeCostChart'), {
    type: 'bar',
    data: {
      labels: DOWNTIME_COST.byIndustry.map(function (d) { return d.label; }),
      datasets: [{
        label: '$/Hour',
        data: DOWNTIME_COST.byIndustry.map(function (d) { return d.cost; }),
        backgroundColor: [RED, ORANGE, YELLOW, BLUE, GREEN, PURPLE],
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
          callbacks: {
            label: function (ctx) { return '$' + ctx.parsed.x.toLocaleString() + '/hr'; },
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            callback: function (v) { return '$' + (v / 1000) + 'K'; },
          },
          grid: { color: 'rgba(255,255,255,0.04)' },
        },
        y: { grid: { display: false } },
      },
    },
  });

  // ── 7. MTTR Chart ─────────────────────────────────────────────────────────
  new Chart($('#mttrChart'), {
    type: 'bar',
    data: {
      labels: MTTR_DATA.traditional.map(function (d) { return d.label; }),
      datasets: [
        {
          label: 'Traditional MTTR (hours)',
          data: MTTR_DATA.traditional.map(function (d) { return d.hours; }),
          backgroundColor: RED + 'cc',
          borderRadius: 4,
          borderSkipped: false,
        },
        {
          label: 'AI-Assisted MTTR (hours)',
          data: MTTR_DATA.traditional.map(function (d) {
            return Math.round(d.hours * (1 - MTTR_DATA.aiReductionPct / 100));
          }),
          backgroundColor: GREEN + 'cc',
          borderRadius: 4,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: { label: function (ctx) { return ctx.dataset.label + ': ' + ctx.parsed.y + 'h'; } },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: function (v) { return v + 'h'; } },
          grid: { color: 'rgba(255,255,255,0.04)' },
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 10 }, maxRotation: 25 },
        },
      },
    },
  });

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

  // ── 9. Enterprise Adoption Chart ──────────────────────────────────────────
  new Chart($('#enterpriseAdoptionChart'), {
    type: 'bar',
    data: {
      labels: ENTERPRISE_ADOPTION.bySector.map(function (d) { return d.label; }),
      datasets: [{
        label: 'AI in Production (%)',
        data: ENTERPRISE_ADOPTION.bySector.map(function (d) { return d.pct; }),
        backgroundColor: ENTERPRISE_ADOPTION.bySector.map(function (d, i) {
          var colors = [CYAN, CYAN, BLUE, PURPLE, BLUE, GREEN, ORANGE, YELLOW, RED];
          return colors[i] || BLUE;
        }),
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
          callbacks: { label: function (ctx) { return ctx.parsed.x + '% adoption'; } },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 40,
          ticks: { callback: function (v) { return v + '%'; } },
          grid: { color: 'rgba(255,255,255,0.04)' },
        },
        y: { grid: { display: false } },
      },
    },
  });

  // ── 10. Interactive MCP Diagram (Canvas) ──────────────────────────────────
  var canvas = $('#mcpDiagram');
  var ctx = canvas.getContext('2d');
  var diagramState = 'before';
  var animProgress = 0;
  var animTarget = 0;
  var animating = false;
  var hoveredNode = null;
  var dpr = window.devicePixelRatio || 1;

  var aiModels = [
    { label: 'Claude', emoji: '' },
    { label: 'GPT', emoji: '' },
    { label: 'Gemini', emoji: '' },
  ];
  var tools = [
    { label: 'SIEM', emoji: '' },
    { label: 'Network Mon.', emoji: '' },
    { label: 'ITSM', emoji: '' },
    { label: 'EDR', emoji: '' },
    { label: 'IAM', emoji: '' },
    { label: 'Slack', emoji: '' },
  ];

  function resizeCanvas() {
    var wrapper = canvas.parentElement;
    var w = wrapper.clientWidth;
    var h = wrapper.clientHeight || 520;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function getNodePositions(w, h) {
    var pad = 60;
    var aiX = pad + 40;
    var toolX = w - pad - 40;
    var mcpX = w / 2;
    var mcpY = h / 2;
    var aiNodes = aiModels.map(function (m, i) {
      var spacing = (h - pad * 2) / (aiModels.length + 1);
      return { x: aiX, y: pad + spacing * (i + 1), label: m.label, type: 'ai' };
    });
    var toolNodes = tools.map(function (t, i) {
      var spacing = (h - pad * 2) / (tools.length + 1);
      return { x: toolX, y: pad + spacing * (i + 1), label: t.label, type: 'tool' };
    });
    return { ai: aiNodes, tools: toolNodes, mcp: { x: mcpX, y: mcpY } };
  }

  function drawDiagram() {
    var w = canvas.width / dpr;
    var h = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);
    var pos = getNodePositions(w, h);
    var t = animProgress;

    // Draw connections
    ctx.lineWidth = 1.5;
    pos.ai.forEach(function (ai) {
      pos.tools.forEach(function (tool) {
        // "Before" connections (spaghetti) — fade out as t increases
        var alpha = 0.35 * (1 - t);
        if (hoveredNode && (hoveredNode.label === ai.label || hoveredNode.label === tool.label)) {
          alpha = 0.8 * (1 - t);
        }
        if (alpha > 0.01) {
          ctx.strokeStyle = RED + hex(alpha);
          ctx.beginPath();
          ctx.moveTo(ai.x, ai.y);
          ctx.lineTo(tool.x, tool.y);
          ctx.stroke();
        }
      });
    });

    // "After" connections (through MCP hub) — fade in as t increases
    if (t > 0.01) {
      pos.ai.forEach(function (ai) {
        var alpha = 0.6 * t;
        if (hoveredNode && hoveredNode.label === ai.label) alpha = 1 * t;
        ctx.strokeStyle = CYAN + hex(alpha);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ai.x, ai.y);
        ctx.lineTo(pos.mcp.x, pos.mcp.y);
        ctx.stroke();
      });
      pos.tools.forEach(function (tool) {
        var alpha = 0.6 * t;
        if (hoveredNode && hoveredNode.label === tool.label) alpha = 1 * t;
        ctx.strokeStyle = PURPLE + hex(alpha);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pos.mcp.x, pos.mcp.y);
        ctx.lineTo(tool.x, tool.y);
        ctx.stroke();
      });

      // MCP hub
      var hubAlpha = t;
      ctx.fillStyle = GREEN + hex(hubAlpha * 0.2);
      ctx.strokeStyle = GREEN + hex(hubAlpha);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pos.mcp.x, pos.mcp.y, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = '600 13px Inter, system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = hubAlpha;
      ctx.fillText('MCP', pos.mcp.x, pos.mcp.y);
      ctx.globalAlpha = 1;
    }

    // Draw nodes
    ctx.lineWidth = 2;
    pos.ai.forEach(function (n) { drawNode(n, CYAN); });
    pos.tools.forEach(function (n) { drawNode(n, PURPLE); });

    // Connection count label
    var beforeCount = aiModels.length * tools.length;
    var afterCount = aiModels.length + tools.length;
    var countLabel = t < 0.5
      ? beforeCount + ' connections'
      : afterCount + ' connections';
    ctx.fillStyle = '#fff';
    ctx.font = '700 16px Inter, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(countLabel, w / 2, h - 20);
  }

  function drawNode(n, color) {
    var isHovered = hoveredNode && hoveredNode.label === n.label;
    var r = isHovered ? 26 : 22;
    ctx.fillStyle = color + (isHovered ? '40' : '20');
    ctx.strokeStyle = color;
    ctx.lineWidth = isHovered ? 2.5 : 1.5;
    ctx.beginPath();
    ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = (isHovered ? '600' : '500') + ' 11px Inter, system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(n.label, n.x, n.y);
  }

  function hex(alpha) {
    var v = Math.round(Math.max(0, Math.min(1, alpha)) * 255);
    return (v < 16 ? '0' : '') + v.toString(16);
  }

  function animateDiagram() {
    var speed = 0.04;
    if (Math.abs(animProgress - animTarget) > 0.005) {
      animProgress += (animTarget - animProgress) * speed * 3;
      if (Math.abs(animProgress - animTarget) < 0.005) animProgress = animTarget;
      animating = true;
    } else {
      animating = false;
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
        diagramState = 'before';
        this.classList.add('active-red');
      } else {
        animTarget = 1;
        diagramState = 'after';
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
    var allNodes = pos.ai.concat(pos.tools);
    hoveredNode = null;
    for (var i = 0; i < allNodes.length; i++) {
      var n = allNodes[i];
      var dx = mx - n.x;
      var dy = my - n.y;
      if (dx * dx + dy * dy < 30 * 30) {
        hoveredNode = n;
        canvas.style.cursor = 'pointer';
        return;
      }
    }
    canvas.style.cursor = 'default';
  });

  canvas.addEventListener('mouseleave', function () {
    hoveredNode = null;
  });

  // Touch support
  canvas.addEventListener('touchstart', function (e) {
    var rect = canvas.getBoundingClientRect();
    var touch = e.touches[0];
    var mx = touch.clientX - rect.left;
    var my = touch.clientY - rect.top;
    var w = canvas.width / dpr;
    var h = canvas.height / dpr;
    var pos = getNodePositions(w, h);
    var allNodes = pos.ai.concat(pos.tools);
    hoveredNode = null;
    for (var i = 0; i < allNodes.length; i++) {
      var n = allNodes[i];
      var dx = mx - n.x;
      var dy = my - n.y;
      if (dx * dx + dy * dy < 40 * 40) {
        hoveredNode = n;
        return;
      }
    }
  }, { passive: true });

  canvas.addEventListener('touchend', function () {
    setTimeout(function () { hoveredNode = null; }, 1500);
  }, { passive: true });

  // Init diagram
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  requestAnimationFrame(animateDiagram);

  // ── 11. Scroll-triggered fade-in ──────────────────────────────────────────
  var fadeEls = $$('.chart-card, .finding-card, .analogy-card, .adopter-card, .callout-banner, .conclusion-box, .workflow-col');
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  fadeEls.forEach(function (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });

})();
