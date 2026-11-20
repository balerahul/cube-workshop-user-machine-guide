(() => {
  'use strict';
  const choices = {
    windows: {label:'Windows with an Intel or AMD processor', shell:'Windows PowerShell', arch:'amd64', enter:'Enter', launcher:'.\\run.ps1', list:'Get-ChildItem', progress:'Get-Content .\\runs\\NAME-OF-YOUR-RUN\\run.log -Wait'},
    'mac-arm': {label:'Mac with Apple Silicon', shell:'Mac Terminal', arch:'arm64', enter:'Return', launcher:'sh run.sh', list:'ls', progress:'tail -f runs/NAME-OF-YOUR-RUN/run.log'},
    'mac-intel': {label:'Mac with an Intel processor', shell:'Mac Terminal', arch:'amd64', enter:'Return', launcher:'sh run.sh', list:'ls', progress:'tail -f runs/NAME-OF-YOUR-RUN/run.log'},
    linux: {label:'Linux', shell:'Linux Terminal', arch:'amd64', enter:'Enter', launcher:'sh run.sh', list:'ls', progress:'tail -f runs/NAME-OF-YOUR-RUN/run.log'}
  };
  const linuxArchitecture=document.getElementById('linux-architecture');
  const linuxDistribution=document.getElementById('linux-distribution');
  const rememberedArchitecture=(()=>{try{return localStorage.getItem('cube-guide-linux-arch');}catch{return null;}})();
  linuxArchitecture.value=window.CUBE_GUIDE_CONFIG.kitArch || (['amd64','arm64'].includes(rememberedArchitecture)?rememberedArchitecture:'amd64');
  const rememberedDistribution=(()=>{try{return localStorage.getItem('cube-guide-linux-distro');}catch{return null;}})();
  linuxDistribution.value=['ubuntu','debian','other'].includes(rememberedDistribution)?rememberedDistribution:'ubuntu';
  choices.linux.arch=linuxArchitecture.value;
  let currentPlatform='mac-arm';
  function selectLinuxDistribution(){
    document.querySelectorAll('[data-linux-distro]').forEach(el=>{el.hidden=!el.dataset.linuxDistro.split(' ').includes(linuxDistribution.value);});
  }
  function selectPlatform(key) {
    if (!choices[key]) return;
    currentPlatform=key;
    choices.linux.arch=linuxArchitecture.value;
    choices.linux.label=linuxArchitecture.value==='arm64'?'Linux with an ARM64 processor':'Linux with an Intel or AMD processor';
    const selected = choices[key];
    const kit=window.CUBE_GUIDE_CONFIG.mode==='kit';
    const mismatch=kit && selected.arch!==window.CUBE_GUIDE_CONFIG.kitArch;
    document.getElementById('kit-architecture-warning').hidden=!mismatch;
    document.getElementById('offline-download-note').hidden=!kit || mismatch;
    document.querySelectorAll('[data-platform]').forEach(el => { el.hidden = !el.dataset.platform.split(' ').includes(key); });
    document.querySelectorAll('[data-choose-platform]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.choosePlatform === key)));
    document.querySelectorAll('[data-computer-label]').forEach(el => {el.textContent=selected.label;});
    document.querySelectorAll('[data-shell-label]').forEach(el => {el.textContent=selected.shell;});
    document.querySelectorAll('[data-enter-key]').forEach(el => {el.textContent=selected.enter;});
    document.querySelectorAll('[data-command]').forEach(el => {
      const name=el.dataset.command;
      el.textContent=name==='list'?selected.list:name==='progress'?selected.progress:`${selected.launcher} ${name}${['icns','cns'].includes(name)?' 2':''}`;
    });
    document.querySelector('[data-ready-line]').textContent=`CUBE image ready for ${selected.arch}. Next: ${selected.launcher} smoke`;
    const folder=document.getElementById('folder-picture');
    folder.src=`assets/folder-${selected.arch}.svg`;
    folder.closest('a').href=folder.src;
    document.getElementById('platform-status').textContent=`Selected platform: ${selected.label}.`;
    const filename=window.CUBE_GUIDE_CONFIG.bundles[selected.arch];
    const link=document.getElementById('download-bundle');
    link.href=window.CUBE_GUIDE_CONFIG.downloadBase+filename;
    link.textContent=key==='linux'?`Download for Linux (${selected.arch==='arm64'?'ARM64':'Intel/AMD'})`:key==='windows'?'Download for Windows (Intel/AMD)':key==='mac-intel'?'Download for Intel Mac':'Download for Mac (Apple Silicon)';
    document.getElementById('bundle-filename').textContent=filename;
    document.getElementById('download-size').textContent=`Contains the ${selected.arch==='arm64'?'ARM64':'AMD64'} CUBE image and all tutorial files.`;
    try {localStorage.setItem('cube-guide-platform',key);} catch {}
  }
  document.querySelectorAll('[data-choose-platform]').forEach(button => button.addEventListener('click',()=>selectPlatform(button.dataset.choosePlatform)));
  linuxArchitecture.addEventListener('change',()=>{try{localStorage.setItem('cube-guide-linux-arch',linuxArchitecture.value);}catch{}selectPlatform(currentPlatform);});
  linuxDistribution.addEventListener('change',()=>{try{localStorage.setItem('cube-guide-linux-distro',linuxDistribution.value);}catch{}selectLinuxDistribution();});
  selectLinuxDistribution();
  let initial=/Windows/i.test(navigator.userAgent)?'windows':/Linux/i.test(navigator.userAgent)&&!/Android|CrOS/i.test(navigator.userAgent)?'linux':window.CUBE_GUIDE_CONFIG.kitArch==='amd64'?'mac-intel':'mac-arm';
  try {const stored=localStorage.getItem('cube-guide-platform'); if(choices[stored] && (window.CUBE_GUIDE_CONFIG.mode!=='kit' || choices[stored].arch===window.CUBE_GUIDE_CONFIG.kitArch)) initial=stored;} catch {}
  selectPlatform(initial);
  document.querySelectorAll('.copy-command').forEach(button => button.addEventListener('click',async()=>{
    const code=button.closest('.command').querySelector('code');
    try {
      await navigator.clipboard.writeText(code.textContent);
      button.textContent='Copied';
      const previous=button.closest('.command').querySelector('.copy-help');if(previous) previous.remove();
      document.getElementById('copy-status').textContent='Command copied. Paste it into your command window and press Enter or Return.';
      setTimeout(()=>{button.textContent='Copy';},1800);
    } catch {
      const range=document.createRange();range.selectNodeContents(code);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);
      document.getElementById('copy-status').textContent='The command is selected. Press Control+C or Command+C to copy.';
      let help=button.closest('.command').querySelector('.copy-help');
      if(!help){help=document.createElement('p');help.className='copy-help';help.setAttribute('role','status');button.closest('.command').appendChild(help);}
      const shortcut=/Mac/i.test(navigator.platform||navigator.userAgent)?'Command + C':'Ctrl + C';
      help.textContent=`The command is selected. Press ${shortcut} to copy it, then paste it into your command window.`;
      button.textContent='Selected';setTimeout(()=>{button.textContent='Copy';},1800);
    }
  }));
  document.getElementById('print-guide').addEventListener('click',()=>window.print());
  const offline=window.CUBE_GUIDE_CONFIG.mode==='kit';
  document.getElementById('download-panel').hidden=offline;
  document.getElementById('preview-notice').hidden=!['localhost','127.0.0.1',''].includes(location.hostname);
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries) if(entry.isIntersecting){
        document.querySelectorAll('.step-nav nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+entry.target.id));
      }
    },{rootMargin:'-110px 0px -65% 0px'});
    document.querySelectorAll('main>section[id]').forEach(section=>observer.observe(section));
  }
})();
