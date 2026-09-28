(function () {
  'use strict';
  const FI = window.FI;
  if (!FI) return;

  /* ---------- 模糊匹配 ---------- */
  function fuzzyMatch(text, keyword) {
    if (!keyword) return { hit: true, score: 0 };
    const kLen = keyword.length;
    if (kLen > text.length) return { hit: false, score: Infinity };

    let ti = 0, ki = 0, score = 0, lastMatch = -1, firstMatch = -1;
    while (ti < text.length && ki < kLen) {
      const tc = text[ti], kc = keyword[ki];
      if (tc === kc || tc.toLowerCase() === kc.toLowerCase()) {
        if (firstMatch < 0) firstMatch = ti;
        if (lastMatch >= 0) score += (ti - lastMatch - 1) * 2;
        if (tc !== kc) score += 1;
        lastMatch = ti;
        ki++;
      }
      ti++;
    }
    if (ki < kLen) return { hit: false, score: Infinity };
    score += firstMatch * 3;
    score += (text.length - kLen) * 0.1;
    return { hit: true, score };
  }

  function matchedIndices(text, keyword) {
    if (!keyword) return [];
    const idx = [];
    let ti = 0, ki = 0;
    while (ti < text.length && ki < keyword.length) {
      const tc = text[ti], kc = keyword[ki];
      if (tc === kc || tc.toLowerCase() === kc.toLowerCase()) { idx.push(ti); ki++; }
      ti++;
    }
    return ki === keyword.length ? idx : [];
  }

  function highlight(text, keyword) {
    if (!keyword) return FI.escapeHtml(text);
    const idx = matchedIndices(text, keyword);
    if (!idx.length) return FI.escapeHtml(text);
    const set = new Set(idx);
    let out = '', buf = '';
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (set.has(i)) {
        if (buf) { out += FI.escapeHtml(buf); buf = ''; }
        out += '<mark>' + FI.escapeHtml(ch) + '</mark>';
      } else {
        buf += ch;
      }
    }
    if (buf) out += FI.escapeHtml(buf);
    return out;
  }

  /* ---------- 注册模块 ---------- */
  FI.register('search', function () {
    const actions = document.getElementById('actions');
    const table   = document.querySelector('table');
    if (!actions || !table) return;

    /* 插入到 actions 末尾（跟输入框、按钮同一行） */
    const wrap = document.createElement('div');
    wrap.id = 'searchWrap';
    wrap.innerHTML = `
      <input type="text" id="searchBox"
             placeholder="🔍 搜索文件名"
             autocomplete="off" spellcheck="false">
      <span id="searchInfo"></span>
    `;
    actions.appendChild(wrap);

    const box  = document.getElementById('searchBox');
    const info = document.getElementById('searchInfo');
    const tbody = table.querySelector('tbody');

    const rows = [...tbody.querySelectorAll('tr')].map(tr => {
      const link = tr.querySelector('td a');
      return {
        tr,
        link,
        rawText: link ? link.textContent : '',
        isParent: link ? (link.getAttribute('href') === '../') : false
      };
    });

    function applyFilter() {
      const kw = box.value.trim();

      if (!kw) {
        rows.forEach(r => {
          r.tr.style.display = '';
          if (r.link) r.link.innerHTML = FI.escapeHtml(r.rawText);
        });
        info.textContent = '';
        return;
      }

      const scored = [];
      let total = 0;

      rows.forEach(r => {
        if (r.isParent || !r.link) { r.tr.style.display = ''; return; }
        total++;
        const m = fuzzyMatch(r.rawText, kw);
        if (m.hit) {
          r.tr.style.display = '';
          r.link.innerHTML = highlight(r.rawText, kw);
          scored.push({ r, score: m.score });
        } else {
          r.tr.style.display = 'none';
        }
      });

      scored.sort((a, b) => a.score - b.score);
      scored.forEach(s => tbody.appendChild(s.r.tr));

      info.textContent = `${scored.length}/${total}`;
    }

    box.addEventListener('input', applyFilter);
    box.addEventListener('keydown', e => {
      if (e.key === 'Escape') { box.value = ''; applyFilter(); }
    });
  });
})();
