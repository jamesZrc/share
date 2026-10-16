(function () {
  'use strict';
  const FI = window.FI;
  if (!FI) return;

  FI.register('newfile', function () {
    const nameInput = document.getElementById('dirName');   // 和 newdir 共用
    const newFileBtn = document.getElementById('newFileBtn');
    if (!nameInput || !newFileBtn) return;

    function createFile() {
      const name = nameInput.value.trim();
      if (!name) { nameInput.focus(); return; }
      if (/[\/\\]/.test(name)) { alert('名称不能包含斜杠'); return; }
      if (name.endsWith('/'))  { alert('文件名不能以斜杠结尾'); return; }

      const xhr = new XMLHttpRequest();
      xhr.open('PUT', FI.upUrl(name, false), true);
      xhr.setRequestHeader('Content-Type', 'text/plain; charset=utf-8');
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          location.reload();
        } else if (xhr.status === 403) {
          alert('没有权限创建文件');
        } else {
          alert('创建失败：HTTP ' + xhr.status);
        }
      };
      xhr.onerror = () => alert('网络错误');
      xhr.send('');   // 发送空内容 → 创建 0 字节文件
    }

    newFileBtn.addEventListener('click', createFile);
  });
})();
