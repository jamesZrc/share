(function () {
  'use strict';

  const FI = window.FI = window.FI || {};
  FI.modules = FI.modules || [];
  FI.UPLOAD_PREFIX = '/upresourceshare';

  FI.EDITABLE_EXTS = [
    'txt','md','markdown','log','json','xml','html','htm','css','scss',
    'js','ts','jsx','tsx','vue','conf','cfg','ini','yml','yaml',
    'sh','bash','py','rb','php','sql','csv','tsv',
    'env','properties','toml','rst','tex','bat','ps1'
  ];

  /* ---- 路径工具 ---- */
  FI.currentDir = function () {
    let p = location.pathname;
    if (!p.startsWith('/')) p = '/' + p;
    if (!p.endsWith('/'))   p += '/';
    return p;
  };

  FI.upUrl = function (name, isDir) {
    return FI.UPLOAD_PREFIX + FI.currentDir() + encodeURIComponent(name) + (isDir ? '/' : '');
  };

  /* ---- 字符串 ---- */
  FI.escapeHtml = function (s) {
    return String(s).replace(/[&<>"']/g, c => (
      {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]
    ));
  };

  FI.isEditable = function (name) {
      if (!name) return false;

      // 隐藏文件（.env、.gitignore 等）可编辑
      if (name.startsWith('.')) return true;

      // 无后缀文件（Dockerfile、Makefile、notes 等）可编辑
      const m = name.match(/\.([^.]+)$/);
      if (!m) return true;

      // 有后缀的文件走白名单
      return FI.EDITABLE_EXTS.includes(m[1].toLowerCase());
  };

  /* ---- Toast ---- */
  FI.toast = function (msg) {
    let el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), 1800);
  };

  /* ---- 复制 ---- */
  FI.copyText = async function (text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      FI.toast('已复制：' + text);
      return true;
    } catch (err) {
      alert('复制失败：' + err);
      return false;
    }
  };

  /* ---- 模块注册 ---- */
  FI.register = function (name, init) {
    FI.modules.push({ name, init });
  };

  /* ---- 便利函数：给表格追加"操作"列 ---- */
  FI.ensureActionColumn = function () {
    const table = document.querySelector('table');
    if (!table) return null;
    const thead = table.querySelector('thead tr');
    if (thead && !thead.querySelector('.th-actions')) {
      const th = document.createElement('th');
      th.className = 'th-actions';
      th.textContent = '操作';
      thead.appendChild(th);
    }
    return table;
  };

  /* ---- 便利函数：遍历每一行（跳过父目录） ---- */
  FI.forEachRow = function (cb) {
    document.querySelectorAll('table tbody tr').forEach(tr => {
      const link = tr.querySelector('td a');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || href === '../') return;

      const absUrl = new URL(href, location.href);
      const info = {
        tr, link,
        href,
        isDir: href.endsWith('/'),
        name: decodeURIComponent(link.textContent.trim()),
        readUrl: absUrl.href,
        writeUrl: FI.UPLOAD_PREFIX + absUrl.pathname
      };
      cb(info);
    });
  };
})();
