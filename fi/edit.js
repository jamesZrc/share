(function () {
  'use strict';
  const FI = window.FI;
  if (!FI) return;

  let current = { url: '', name: '' };

  function openEditor(readUrl, writeUrl, fileName) {
    const modal  = document.getElementById('editorModal');
    const fileEl = document.getElementById('editorFile');
    const textEl = document.getElementById('editorText');
    const stat   = document.getElementById('editorStatus');
    if (!modal) { alert('编辑器未加载'); return; }

    current = { url: writeUrl, name: fileName };
    fileEl.textContent = fileName;
    stat.textContent = '加载中...';
    textEl.value = '';
    modal.hidden = false;

    fetch(readUrl, { credentials: 'same-origin', cache: 'no-store' })
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
      .then(text => {
        textEl.value = text;
        stat.textContent = text.length + ' 字符';
        setTimeout(() => textEl.focus(), 0);
      })
      .catch(err => {
        stat.textContent = '';
        alert('加载失败：' + err.message);
        modal.hidden = true;
      });
  }

  function closeEditor() {
    const modal = document.getElementById('editorModal');
    if (modal) modal.hidden = true;
    current = { url: '', name: '' };
  }

  async function saveEditor() {
    if (!current.url) return;
    const textEl  = document.getElementById('editorText');
    const stat    = document.getElementById('editorStatus');
    const saveBtn = document.getElementById('editorSave');

    stat.textContent = '保存中...';
    saveBtn.disabled = true;

    try {
      const r = await fetch(current.url, {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        body: textEl.value
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      stat.textContent = '已保存 ✓';
      saveBtn.disabled = false;
      setTimeout(() => { closeEditor(); location.reload(); }, 500);
    } catch (err) {
      stat.textContent = '';
      saveBtn.disabled = false;
      alert('保存失败：' + err.message);
    }
  }

  FI.register('edit', function () {
    const modal  = document.getElementById('editorModal');
    if (!modal) return;

    const textEl  = document.getElementById('editorText');
    const saveBtn = document.getElementById('editorSave');
    const cancel  = document.getElementById('editorCancel');
    const closeX  = document.getElementById('editorClose');

    saveBtn.addEventListener('click', saveEditor);
    cancel.addEventListener('click', closeEditor);
    closeX.addEventListener('click', closeEditor);

    textEl.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault(); saveEditor();
      }
      if (e.key === 'Escape') closeEditor();
      if (e.key === 'Tab') {
        e.preventDefault();
        const s = textEl.selectionStart, en = textEl.selectionEnd;
        textEl.value = textEl.value.slice(0, s) + '  ' + textEl.value.slice(en);
        textEl.selectionStart = textEl.selectionEnd = s + 2;
      }
    });

    // 给每个可编辑文件加"编辑"按钮
    FI.ensureActionColumn();
    FI.forEachRow(info => {
      if (info.isDir || !FI.isEditable(info.name)) return;
      if (info.tr.querySelector('.edit-btn')) return;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mini-btn edit-btn';
      btn.title = '编辑';
      btn.innerHTML = `<span class="ico-edit"></span><span class="txt">编辑</span>`;
      btn.addEventListener('click', () => openEditor(info.readUrl, info.writeUrl, info.name));

      let td = info.tr.querySelector('.row-actions');
      if (!td) {
        td = document.createElement('td');
        td.className = 'row-actions';
        info.tr.appendChild(td);
      }
      // 编辑按钮插到复制按钮前面
      const copyBtn = td.querySelector('.copy-btn');
      if (copyBtn) td.insertBefore(btn, copyBtn);
      else td.appendChild(btn);
    });
  });
})();
