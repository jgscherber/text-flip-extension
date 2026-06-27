const STYLE_ID = 'text-flip-style';
const WORD_CLS = 'tf-w';
const LINE_CLS = 'tf-l';

// data-n="0" → normal (right-aligned), data-n="1" → flipped
const CSS = `
body.text-flip-active .${LINE_CLS} { display: block; }
body.text-flip-active .${LINE_CLS}[data-n="0"] {
  text-align: right;
  margin: 2px 0;
}
body.text-flip-active .${LINE_CLS}[data-n="1"] {
  transform: scale(-1, -1) !important;
  margin: 2px 0;
}
`;

// WeakMap so GC'd elements don't leak memory
const saved = new WeakMap();

function injectStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = CSS;
  document.head.appendChild(s);
}

// Replace direct text-node children with per-word spans (for line measurement).
// Inline element children (a, b, em, …) are left intact as atomic units.
function wrapDirectText(el) {
  for (const node of [...el.childNodes]) {
    if (node.nodeType !== Node.TEXT_NODE || !node.textContent.trim()) continue;
    const frag = document.createDocumentFragment();
    for (const part of node.textContent.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        frag.append(part); // keep spaces as text nodes
      } else {
        const span = document.createElement('span');
        span.className = WORD_CLS;
        span.textContent = part;
        frag.append(span);
      }
    }
    node.replaceWith(frag);
  }
}

// Group direct children of el into rendered lines by Y position.
// Pure-whitespace text nodes are attached to the current line without
// affecting the Y threshold, so spaces between words stay with their line.
function detectLines(el) {
  const range = document.createRange();
  const lines = [];
  let line = [], lineY = null, threshold = 6;

  for (const child of el.childNodes) {
    // Whitespace: attach to current line, don't update lineY
    if (child.nodeType === Node.TEXT_NODE && !child.textContent.trim()) {
      if (line.length) line.push(child);
      continue;
    }

    let top;
    if (child.nodeType === Node.TEXT_NODE) {
      range.selectNode(child);
      const rects = range.getClientRects();
      if (!rects.length) continue;
      top = Math.round(rects[0].top);
    } else {
      const r = child.getBoundingClientRect();
      if (!r.height) continue;
      // Use first child's height to calibrate the threshold
      if (lineY === null) threshold = Math.max(4, r.height * 0.4);
      top = Math.round(r.top);
    }

    if (lineY === null || Math.abs(top - lineY) > threshold) {
      if (line.length) lines.push(line);
      line = [child];
      lineY = top;
    } else {
      line.push(child);
    }
  }
  if (line.length) lines.push(line);
  return lines;
}

function processBlock(el, counter) {
  saved.set(el, el.innerHTML);
  el.dataset.tfDone = '1';

  wrapDirectText(el);

  for (const group of detectLines(el)) {
    const span = document.createElement('span');
    span.className = LINE_CLS;
    span.dataset.n = counter.v % 2;
    counter.v++;
    group[0].before(span);
    for (const child of group) span.append(child);
  }

  // Unwrap temp word spans, leaving plain text
  el.querySelectorAll('.' + WORD_CLS).forEach(s => s.replaceWith(...s.childNodes));
}

function enable() {
  injectStyle();
  const counter = { v: 0 };
  document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote, figcaption')
    .forEach(el => {
      if (el.dataset.tfDone || !el.textContent.trim()) return;
      // Skip blocks that contain other block elements (processed separately)
      if (el.querySelector('p, h1, h2, h3, h4, h5, h6, li, blockquote')) return;
      processBlock(el, counter);
    });
  document.body.classList.add('text-flip-active');
}

function disable() {
  document.body.classList.remove('text-flip-active');
  document.querySelectorAll('[data-tf-done]').forEach(el => {
    el.innerHTML = saved.get(el) ?? el.innerHTML;
    delete el.dataset.tfDone;
  });
}

function setFlip(enabled) {
  injectStyle();
  enabled ? enable() : disable();
}

chrome.storage.local.get(['flipEnabled'], r => {
  if (r.flipEnabled) setFlip(true);
});

chrome.runtime.onMessage.addListener(msg => {
  if (msg.type === 'SET_FLIP') setFlip(msg.enabled);
});
