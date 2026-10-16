(function () {
  'use strict';
  const FI = window.FI;
  if (!FI) return;

  FI.register('newdir', function () {
    const dirName   = document.getElementById('dirName');
    const newDirBtn = document.getElementById('newDirBtn');
    if (!dirName || !newDirBtn) return;

    function createDir() {
      const name = dirName.value.trim();
      if (!name) { dirName.focus(); return; }
      if (/[\/\\]/.test(name)) { alert('名称不能包含斜杠'); return; }

      const xhr = new XMLHttpRequest();
      xhr.open('MKCOL', FI.upUrl(name, true), true);
      xhr.onload = () => {
        if (xhr.status === 201)      location.reload();
        else if (xhr.status === 405) { alert('同名目录已存在'); dirName.select(); }
        else if (xhr.status === 403) alert('没有权限创建目录');
        else                         alert('创建失败：HTTP ' + xhr.status);
      };
      xhr.onerror = () => alert('网络错误');
      xhr.send();
    }

    newDirBtn.addEventListener('click', createDir);
    dirName.addEventListener('keydown', e => { if (e.key === 'Enter') createDir(); });
  });
})();
