(function () {
  'use strict';
  const FI = window.FI;
  if (!FI) return;

  FI.register('upload', function () {
    const dropzone = document.getElementById('dropzone');
    const picker   = document.getElementById('picker');
    const list     = document.getElementById('list');
    if (!dropzone || !picker || !list) return;

    dropzone.addEventListener('click', () => picker.click());
    picker.addEventListener('change', () => { uploadFiles(picker.files); picker.value = ''; });

    ['dragenter','dragover'].forEach(ev =>
      dropzone.addEventListener(ev, e => { e.preventDefault(); dropzone.classList.add('hover'); }));
    ['dragleave','drop'].forEach(ev =>
      dropzone.addEventListener(ev, e => { e.preventDefault(); dropzone.classList.remove('hover'); }));

    dropzone.addEventListener('drop', e => {
      const items = e.dataTransfer.files;
      if (items && items.length) uploadFiles(items);
    });

    function uploadFiles(files) { [...files].forEach(uploadOne); }

    function uploadOne(file) {
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="name">${FI.escapeHtml(file.name)}</span>
        <span class="bar"><i></i></span>
        <span class="pct">0%</span>
      `;
      list.appendChild(li);

      const bar = li.querySelector('.bar > i');
      const pct = li.querySelector('.pct');

      const xhr = new XMLHttpRequest();
      xhr.open('PUT', FI.upUrl(file.name, false), true);

      xhr.upload.onprogress = e => {
        if (e.lengthComputable) {
          const p = Math.round(e.loaded / e.total * 100);
          bar.style.width = p + '%';
          pct.textContent = p + '%';
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          li.classList.add('ok');
          bar.style.width = '100%';
          pct.textContent = '✓';
          if (!list.querySelector('li:not(.ok):not(.err)')) {
            setTimeout(() => location.reload(), 500);
          }
        } else {
          li.classList.add('err');
          pct.textContent = xhr.status;
        }
      };
      xhr.onerror = () => { li.classList.add('err'); pct.textContent = 'ERR'; };
      xhr.send(file);
    }
  });
})();
