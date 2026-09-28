(function () {
  'use strict';

  function boot() {
    const FI = window.FI || {};
    (FI.modules || []).forEach(m => {
      try {
        m.init();
      } catch (err) {
        console.error('[FI:' + m.name + '] init failed:', err);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
