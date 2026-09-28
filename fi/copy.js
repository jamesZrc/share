(function () {
  'use strict';
  const FI = window.FI;
  if (!FI) return;

  FI.register('copy', function () {
    const table = FI.ensureActionColumn();
    if (!table) return;

    FI.forEachRow(info => {
      if (info.tr.querySelector('.copy-btn')) return;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mini-btn copy-btn';
      btn.title = '复制链接';
      btn.innerHTML = `<span class="ico"></span><span class="txt">复制</span>`;

      const txt = btn.querySelector('.txt');
      let timer = null;
      btn.addEventListener('click', async () => {
        const ok = await FI.copyText(info.readUrl);
        if (!ok) return;
        btn.classList.add('copied');
        txt.textContent = '已复制';
        clearTimeout(timer);
        timer = setTimeout(() => {
          btn.classList.remove('copied');
          txt.textContent = '复制';
        }, 1600);
      });

      let td = info.tr.querySelector('.row-actions');
      if (!td) {
        td = document.createElement('td');
        td.className = 'row-actions';
        info.tr.appendChild(td);
      }
      td.appendChild(btn);
    });
  });
})();
