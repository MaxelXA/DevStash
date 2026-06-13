/* ═══════════════════════════════════════════════════════
   DevStash — All-in-one developer utilities
   Zero backend. 100% browser-based.
   ═══════════════════════════════════════════════════════ */

// ── Navigation & Routing ──────────────────────────────
(function () {
  const sidebar = document.getElementById('sidebar');
  const hamburger = document.getElementById('hamburger');
  const overlay = document.getElementById('sidebarOverlay');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.section');

  function showSection(id) {
    sections.forEach(s => s.classList.remove('active'));
    navLinks.forEach(l => l.classList.remove('active'));

    const target = document.getElementById('section-' + id);
    const link = document.querySelector('[data-section="' + id + '"]');
    if (target) target.classList.add('active');
    if (link) link.classList.add('active');

    // Close mobile sidebar
    sidebar.classList.remove('open');
    hamburger.classList.remove('open');
    overlay.classList.remove('open');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const section = this.getAttribute('data-section');
      history.pushState(null, '', '#' + section);
      showSection(section);
    });
  });

  // Home card clicks
  document.querySelectorAll('[data-goto]').forEach(card => {
    card.addEventListener('click', function (e) {
      e.preventDefault();
      const id = this.getAttribute('data-goto');
      history.pushState(null, '', '#' + id);
      showSection(id);
    });
  });

  // Hamburger toggle
  hamburger.addEventListener('click', function () {
    this.classList.toggle('open');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
  });
  overlay.addEventListener('click', function () {
    hamburger.classList.remove('open');
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  });

  // Hash-based routing on load
  const hash = location.hash.replace('#', '') || 'home';
  showSection(hash);

  window.addEventListener('popstate', function () {
    const h = location.hash.replace('#', '') || 'home';
    showSection(h);
  });
})();

// ── Utility Helpers ───────────────────────────────────
function setError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg || '';
}
function clearError(id) {
  setError(id, '');
}
function clearTool(inputId, outputId) {
  const inp = document.getElementById(inputId);
  if (inp) inp.value = '';
  const out = document.getElementById(outputId);
  if (out) {
    if (out.tagName === 'PRE') out.textContent = '';
    else out.innerHTML = '';
  }
}
function setOutput(id, text) {
  const el = document.getElementById(id);
  if (!el) return;
  if (el.tagName === 'PRE') el.textContent = text;
  else el.innerHTML = text;
}
function copyOutput(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const text = el.innerText || el.textContent;
  if (!text.trim()) return;
  navigator.clipboard.writeText(text).then(function () {
    showToast('Copied to clipboard!');
  }).catch(function () {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('Copied to clipboard!');
  });
}

function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#6c63ff;color:#fff;padding:10px 24px;border-radius:8px;font-size:.85rem;z-index:9999;opacity:0;transition:opacity .25s;pointer-events:none;';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  setTimeout(function () { toast.style.opacity = '0'; }, 1800);
}

// ── Keyboard Shortcuts ────────────────────────────────
document.addEventListener('keydown', function (e) {
  if (e.ctrlKey && e.key === 'Enter') {
    const active = document.querySelector('.section.active');
    if (!active) return;
    const id = active.id;
    if (id === 'section-json-formatter') jsonFormat();
    else if (id === 'section-base64') base64Encode();
    else if (id === 'section-url-encoder') urlEncode();
    else if (id === 'section-regex-tester') regexTest();
    else if (id === 'section-color-converter') convertColor();
    else if (id === 'section-text-diff') diffCompare();
    else if (id === 'section-hash-generator') generateHash();
  }
});

/* ══════════════════════════════════════════════════════
   TOOL 1 — JSON Formatter & Validator
   ══════════════════════════════════════════════════════ */
function jsonFormat() {
  const raw = document.getElementById('jsonInput').value;
  clearError('jsonError');
  if (!raw.trim()) { setOutput('jsonOutput', ''); return; }
  try {
    const parsed = JSON.parse(raw);
    setOutput('jsonOutput', JSON.stringify(parsed, null, 2));
  } catch (err) {
    setError('jsonError', '❌ ' + err.message);
    setOutput('jsonOutput', '');
  }
}
function jsonMinify() {
  const raw = document.getElementById('jsonInput').value;
  clearError('jsonError');
  if (!raw.trim()) { setOutput('jsonOutput', ''); return; }
  try {
    const parsed = JSON.parse(raw);
    setOutput('jsonOutput', JSON.stringify(parsed));
  } catch (err) {
    setError('jsonError', '❌ ' + err.message);
  }
}

/* ══════════════════════════════════════════════════════
   TOOL 2 — Base64 Encoder/Decoder
   ══════════════════════════════════════════════════════ */
function base64Encode() {
  const raw = document.getElementById('base64Input').value;
  clearError('base64Error');
  try {
    const encoded = btoa(unescape(encodeURIComponent(raw)));
    setOutput('base64Output', encoded);
  } catch (err) {
    setError('base64Error', '❌ Encoding failed: ' + err.message);
  }
}
function base64Decode() {
  const raw = document.getElementById('base64Input').value;
  clearError('base64Error');
  try {
    const decoded = decodeURIComponent(escape(atob(raw)));
    setOutput('base64Output', decoded);
  } catch (err) {
    setError('base64Error', '❌ Decoding failed: ' + err.message);
  }
}

/* ══════════════════════════════════════════════════════
   TOOL 3 — URL Encoder/Decoder
   ══════════════════════════════════════════════════════ */
function urlEncode() {
  const raw = document.getElementById('urlInput').value;
  clearError('urlError');
  try {
    setOutput('urlOutput', encodeURIComponent(raw));
  } catch (err) {
    setError('urlError', '❌ ' + err.message);
  }
}
function urlDecode() {
  const raw = document.getElementById('urlInput').value;
  clearError('urlError');
  try {
    setOutput('urlOutput', decodeURIComponent(raw));
  } catch (err) {
    setError('urlError', '❌ ' + err.message);
  }
}

/* ══════════════════════════════════════════════════════
   TOOL 4 — Regex Tester
   ══════════════════════════════════════════════════════ */
function regexTest() {
  const pattern = document.getElementById('regexPattern').value;
  const flags = document.getElementById('regexFlags').value;
  const text = document.getElementById('regexInput').value;
  clearError('regexError');

  if (!pattern) {
    setOutput('regexOutput', 'Enter a regex pattern above.');
    return;
  }

  let re;
  try {
    re = new RegExp(pattern, flags);
  } catch (err) {
    setError('regexError', '❌ ' + err.message);
    setOutput('regexOutput', '');
    return;
  }

  if (!text) {
    setOutput('regexOutput', '');
    return;
  }

  let matches = [];
  let m;
  if (flags.includes('g')) {
    while ((m = re.exec(text)) !== null) {
      matches.push({ value: m[0], index: m.index, length: m[0].length });
      if (!m[0]) re.lastIndex++; // Prevent infinite loop on zero-length matches
    }
  } else {
    m = re.exec(text);
    if (m) matches.push({ value: m[0], index: m.index, length: m[0].length });
  }

  if (matches.length === 0) {
    setOutput('regexOutput', 'No matches found.');
    return;
  }

  // Highlight matches in text
  let html = '';
  let lastIdx = 0;
  matches.forEach(function (m, i) {
    html += escapeHtml(text.slice(lastIdx, m.index));
    html += '<span style="background:#6c63ff33;color:#a29bfe;padding:1px 2px;border-radius:2px;text-decoration:underline">' + escapeHtml(m.value) + '</span>';
    lastIdx = m.index + m.length;
  });
  html += escapeHtml(text.slice(lastIdx));

  // Match list
  let list = '\n── Matches (' + matches.length + ') ──\n';
  matches.forEach(function (m, i) {
    list += '[' + i + '] "' + m.value + '" at index ' + m.index + '\n';
  });

  setOutput('regexOutput', text);
  const el = document.getElementById('regexOutput');
  el.innerHTML = html + '\n' + escapeHtml(list);
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ══════════════════════════════════════════════════════
   TOOL 5 — Color Converter
   ══════════════════════════════════════════════════════ */
(function () {
  const hexInput = document.getElementById('colorHex');
  const picker = document.getElementById('colorPicker');
  const swatch = document.getElementById('colorSwatch');

  if (picker) {
    picker.addEventListener('input', function () {
      hexInput.value = this.value;
      swatch.style.background = this.value;
    });
  }
})();

function convertColor() {
  let hex = document.getElementById('colorHex').value.trim();
  const swatch = document.getElementById('colorSwatch');

  // Validate
  if (!hex.startsWith('#')) hex = '#' + hex;
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) {
    // Expand short hex
    if (hex.length === 4) {
      hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    swatch.style.background = hex;

    // HSL conversion
    const rn = r / 255, gn = g / 255, bn = b / 255;
    const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
    const l = (max + min) / 2;
    let h = 0, s = 0;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
      else if (max === gn) h = ((bn - rn) / d + 2) / 6;
      else h = ((rn - gn) / d + 4) / 6;
    }

    const out = [
      'HEX : ' + hex.toUpperCase(),
      'RGB : rgb(' + r + ', ' + g + ', ' + b + ')',
      'HSL : hsl(' + Math.round(h * 360) + ', ' + Math.round(s * 100) + '%, ' + Math.round(l * 100) + '%)',
      '',
      'r = ' + r,
      'g = ' + g,
      'b = ' + b,
      'h = ' + Math.round(h * 360),
      's = ' + Math.round(s * 100) + '%',
      'l = ' + Math.round(l * 100) + '%',
    ].join('\n');
    setOutput('colorOutput', out);
  } else {
    setOutput('colorOutput', '❌ Invalid HEX color. Use format #RRGGBB or #RGB.');
  }
}

/* ══════════════════════════════════════════════════════
   TOOL 6 — Text Diff Viewer
   ══════════════════════════════════════════════════════ */
function diffCompare() {
  const a = document.getElementById('diffInputA').value;
  const b = document.getElementById('diffInputB').value;
  const out = document.getElementById('diffOutput');

  if (!a && !b) { out.innerHTML = ''; return; }

  const linesA = a.split('\n');
  const linesB = b.split('\n');
  const maxLen = Math.max(linesA.length, linesB.length);

  let html = '';
  for (let i = 0; i < maxLen; i++) {
    const lineA = i < linesA.length ? linesA[i] : undefined;
    const lineB = i < linesB.length ? linesB[i] : undefined;

    if (lineA === undefined) {
      html += '<span class="diff-line diff-add">+ ' + escapeHtml(lineB) + '</span>';
    } else if (lineB === undefined) {
      html += '<span class="diff-line diff-del">- ' + escapeHtml(lineA) + '</span>';
    } else if (lineA === lineB) {
      html += '<span class="diff-line diff-ctx">  ' + escapeHtml(lineA) + '</span>';
    } else {
      html += '<span class="diff-line diff-del">- ' + escapeHtml(lineA) + '</span>';
      html += '<span class="diff-line diff-add">+ ' + escapeHtml(lineB) + '</span>';
    }
  }
  out.innerHTML = html || '<span class="diff-line diff-same">No differences found.</span>';
}

/* ══════════════════════════════════════════════════════
   TOOL 7 — Hash Generator (SHA-256 via Web Crypto)
   ══════════════════════════════════════════════════════ */
async function generateHash() {
  const text = document.getElementById('hashInput').value;
  if (!text) { setOutput('hashOutput', ''); return; }

  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    setOutput('hashOutput', 'SHA-256:\n' + hashHex);
  } catch (err) {
    setOutput('hashOutput', '❌ Hash generation failed: ' + err.message);
  }
}

/* ══════════════════════════════════════════════════════
   TOOL 8 — Word & Character Counter
   ══════════════════════════════════════════════════════ */
function countWords() {
  const text = document.getElementById('counterInput').value;

  const chars = text.length;
  const charsNoSpace = text.replace(/\s/g, '').length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const sentences = text.trim() ? text.split(/[.!?]+/).filter(function (s) { return s.trim(); }).length : 0;
  const lines = text ? text.split('\n').length : 0;
  const readingMin = Math.max(1, Math.ceil(words / 200));

  document.getElementById('statChars').textContent = chars;
  document.getElementById('statCharsNoSpace').textContent = charsNoSpace;
  document.getElementById('statWords').textContent = words;
  document.getElementById('statSentences').textContent = sentences;
  document.getElementById('statLines').textContent = lines;
  document.getElementById('statReading').textContent = words > 0 ? readingMin + ' min' : '0 min';
}

function copyCounterStats() {
  const text = [
    'Characters: ' + document.getElementById('statChars').textContent,
    'Chars (no space): ' + document.getElementById('statCharsNoSpace').textContent,
    'Words: ' + document.getElementById('statWords').textContent,
    'Sentences: ' + document.getElementById('statSentences').textContent,
    'Lines: ' + document.getElementById('statLines').textContent,
    'Reading Time: ' + document.getElementById('statReading').textContent,
  ].join('\n');
  navigator.clipboard.writeText(text).then(function () {
    showToast('Copied to clipboard!');
  }).catch(function () {
    showToast('Copy failed');
  });
}

/* ══════════════════════════════════════════════════════
   TOOL 9 — Markdown Previewer (uses marked.js)
   ══════════════════════════════════════════════════════ */
function renderMarkdown() {
  const text = document.getElementById('mdInput').value;
  const out = document.getElementById('mdOutput');
  if (typeof marked !== 'undefined') {
    out.innerHTML = marked.parse(text);
  } else {
    out.textContent = text;
  }
}

/* ══════════════════════════════════════════════════════
   TOOL 10 — Unix Timestamp Converter
   ══════════════════════════════════════════════════════ */
function unixToDate() {
  const raw = document.getElementById('unixInput').value.trim();
  clearError('unixError');
  if (!raw) { setOutput('unixOutput', ''); return; }

  let ts = Number(raw);
  if (isNaN(ts)) { setError('unixError', '❌ Enter a valid number.'); return; }

  // Auto-detect seconds vs milliseconds
  if (ts > 1e12) {
    // Already milliseconds
  } else {
    ts *= 1000; // Convert seconds to ms
  }

  const d = new Date(ts);
  if (isNaN(d.getTime())) { setError('unixError', '❌ Invalid timestamp.'); return; }

  const lines = [
    'Local    : ' + d.toLocaleString(),
    'UTC      : ' + d.toUTCString(),
    'ISO 8601 : ' + d.toISOString(),
    'Date only: ' + d.toISOString().split('T')[0],
    'Unix (s) : ' + Math.floor(d.getTime() / 1000),
    'Unix (ms): ' + d.getTime(),
  ].join('\n');
  setOutput('unixOutput', lines);
}

function dateToUnix() {
  const raw = document.getElementById('dateInput').value;
  clearError('unixError');
  if (!raw) { setOutput('unixOutput', ''); return; }

  const d = new Date(raw);
  if (isNaN(d.getTime())) { setError('unixError', '❌ Invalid date.'); return; }

  const lines = [
    'Unix (s) : ' + Math.floor(d.getTime() / 1000),
    'Unix (ms): ' + d.getTime(),
    'Local    : ' + d.toLocaleString(),
    'UTC      : ' + d.toUTCString(),
    'ISO 8601 : ' + d.toISOString(),
  ].join('\n');
  setOutput('unixOutput', lines);
}

/* ══════════════════════════════════════════════════════
   TOOL 11 — Number Base Converter
   ══════════════════════════════════════════════════════ */
function convertBase() {
  const raw = document.getElementById('numBaseInput').value.trim();
  const fromBase = parseInt(document.getElementById('numBaseFrom').value, 10);
  clearError('numBaseError');

  if (!raw) { setOutput('numBaseOutput', ''); return; }

  let num;
  try {
    num = parseInt(raw, fromBase);
  } catch (err) {
    setError('numBaseError', '❌ Invalid number for the selected base.');
    return;
  }

  if (isNaN(num)) {
    setError('numBaseError', '❌ Invalid number for the selected base.');
    return;
  }

  if (num < 0) {
    setError('numBaseError', '❌ Please enter a non-negative integer.');
    return;
  }

  const lines = [
    'Decimal      : ' + num.toString(10),
    'Binary       : ' + num.toString(2),
    'Octal        : ' + num.toString(8),
    'Hexadecimal  : ' + num.toString(16).toUpperCase(),
  ];
  setOutput('numBaseOutput', lines.join('\n'));
}

/* ══════════════════════════════════════════════════════
   Init: set current timestamp, initial word count
   ══════════════════════════════════════════════════════ */
(function () {
  const unixNow = document.getElementById('unixNow');
  if (unixNow) unixNow.value = Math.floor(Date.now() / 1000);

  // Set default datetime-local value
  const dateInput = document.getElementById('dateInput');
  if (dateInput) {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const local = new Date(now - offset);
    dateInput.value = local.toISOString().slice(0, 19);
  }

  countWords();
})();
