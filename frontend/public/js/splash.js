// public/js/splash.js - lightweight splash screen
(function(){
  // Avoid showing twice if already removed
  if (document.getElementById('app-splash')) return;

  const splash = document.createElement('div');
  splash.id = 'app-splash';
  splash.setAttribute('role','dialog');
  splash.setAttribute('aria-label','Loading Rwanda Eats Reserve');
  splash.style.position='fixed';
  splash.style.inset='0';
  splash.style.display='flex';
  splash.style.alignItems='center';
  splash.style.justifyContent='center';
  splash.style.background='linear-gradient(135deg,#43302b,#977669)';
  splash.style.zIndex='9999';
  splash.style.fontFamily='system-ui,Segoe UI,Arial,sans-serif';
  splash.innerHTML = `
    <div style="text-align:center;animation:fadeIn 0.6s ease;">
      <div style="width:120px;height:120px;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;background:#fdfbf6;border-radius:24px;box-shadow:0 10px 25px rgba(0,0,0,0.25);overflow:hidden;">
        <img src="/views/images/logo.jpeg" alt="Rwanda Eats Reserve Logo" onerror="this.style.display='none';this.parentElement.innerHTML='<span style=\\'font-size:48px;color:#a18072;font-weight:600\\'>RE</span>'" style="width:100%;height:100%;object-fit:contain;" />
      </div>
      <h1 style="color:#f2ebd2;font-size:28px;font-weight:600;letter-spacing:0.5px;margin:0 0 8px;">Rwanda Eats Reserve</h1>
      <p style="color:#f2ebd2;font-size:14px;opacity:0.85;margin:0 0 18px;">Loading experience...</p>
      <div style="width:160px;height:6px;background:rgba(255,255,255,0.25);border-radius:4px;overflow:hidden;margin:0 auto;">
        <div id="splash-bar" style="height:100%;width:0;background:#f2ebd2;transition:width 1.8s ease;"></div>
      </div>
    </div>
  `;
  document.body.appendChild(splash);

  // Animate progress bar after paint
  requestAnimationFrame(()=>{document.getElementById('splash-bar').style.width='100%';});

  // Remove splash after 2 seconds (accessible skip if user presses any key)
  function removeSplash(){
    if(!splash) return;
    splash.style.opacity='0';
    splash.style.transition='opacity 0.4s ease';
    setTimeout(()=>{ splash.remove(); }, 400);
    window.removeEventListener('keydown',removeSplash);
    window.removeEventListener('click',removeSplash);
  }
  window.addEventListener('keydown',removeSplash);
  window.addEventListener('click',removeSplash);
  setTimeout(removeSplash,2000);
})();
