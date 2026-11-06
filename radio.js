/* Original recordings, automatic-start attempt, and cancellation-safe fade mixing.
 * Media is local to this package. Autoplay follows the browser's permission rules.
 */
(() => {
  'use strict';
  const tracks = [
    {id:'midnight-valet',name:'Midnight Valet',bpm:108},
    {id:'no-receipts-just-vibes',name:'No Receipts, Just Vibes',bpm:114},
    {id:'strategically-unavailable',name:'Strategically Unavailable',bpm:92},
    {id:'pelican-negotiations',name:'Pelican Negotiations',bpm:104},
    {id:'cash-only-hearts',name:'Cash Only Hearts',bpm:112}
  ];
  const $ = s => document.querySelector(s);
  const cards = [...document.querySelectorAll('[data-track-id]')];
  const asset = p => window.TONY_ASSETS?.[p] || p;
  const channels = new Map();
  let selected = tracks[0].id, desired = true, blocked = false;
  let volume = .36, generation = 0, fadeFrame = 0, fading = false, backgroundPaused = false;
  let errorMessage = '';
  const master = $('#music-volume');
  function channel(id) {
    if (!channels.has(id)) {
      const audio = new Audio(asset(`audio/${id}.mp3`));
      audio.preload = 'metadata'; audio.loop = true; audio.volume = 0;
      audio.addEventListener('error', () => {
        errorMessage='Music could not load. Keep the audio folder beside index.html.';
        updateUI();
      });
      channels.set(id,{audio,weight:0});
    }
    return channels.get(id);
  }
  function playing() {return [...channels.values()].some(c => !c.audio.paused && c.weight > .005);}
  function updateUI() {
    const current=tracks.find(t=>t.id===selected);const running=playing();
    const state=!desired ? 'SOUND OFF' : running ? 'SOUND ON' : 'SOUND READY';
    $('#sound-toggle').setAttribute('aria-pressed',String(desired));
    $('#sound-toggle').setAttribute('aria-label', !desired ? 'Enable music' : blocked ? 'Start music' : 'Mute music');
    $('.sound-label').textContent=state;
    $('#playlist-pause').textContent=!desired ? 'PLAY MUSIC' : running ? 'PAUSE MUSIC' : 'START MUSIC';
    $('#now-playing').textContent=(fading ? 'CROSSFADING TO: ' : running ? 'NOW PLAYING: ' : 'READY: ')+current.name.toUpperCase();
    cards.forEach(card=>{const active=card.dataset.trackId===selected;card.classList.toggle('active',active);card.setAttribute('aria-pressed',String(active));});
    const caption=$('#radio-caption');caption.hidden=!desired;
    caption.textContent=running ? `FM 83.9 / ${current.name.toUpperCase()}` : 'MUSIC READY / CLICK TO START';
    caption.setAttribute('role','button');caption.tabIndex=0;caption.setAttribute('aria-label','Toggle the soundtrack');
    $('#soundtrack-note').textContent=errorMessage || (blocked
      ? 'MUSIC IS ENABLED. YOUR BROWSER NEEDS ONE CLICK OR TAP BEFORE AUDIO CAN START.'
      : 'FIVE ORIGINAL INSTRUMENTAL LOOPS / 2.4-SECOND FADE MIX / MUSIC ENABLED BY DEFAULT');
  }
  function applyVolume(){for(const c of channels.values())c.audio.volume=Math.max(0,Math.min(1,c.weight*volume));}
  function fadeTo(id, duration=2400) {
    cancelAnimationFrame(fadeFrame);
    const starts=new Map([...channels].map(([key,c])=>[key,c.weight]));
    const start=performance.now();fading=[...channels].some(([key,c])=>key!==id&&!c.audio.paused&&c.weight>.005);
    function frame(now) {
      const p=Math.min(1,(now-start)/duration);
      for(const [key,c] of channels) {
        const from=starts.get(key)||0;
        if(key===id)c.weight=from+(1-from)*Math.sin(p*Math.PI/2);
        else c.weight=from*Math.cos(p*Math.PI/2);
      }
      applyVolume();
      if(p<1)fadeFrame=requestAnimationFrame(frame);
      else {
        for(const [key,c] of channels)if(key!==id){c.audio.pause();c.weight=0;}
        fading=false;updateUI();
      }
    }
    fadeFrame=requestAnimationFrame(frame);updateUI();
    setTimeout(updateUI,100);
  }
  async function selectTrack(id, automatic=false) {
    if(!tracks.some(t=>t.id===id))return;
    const token=++generation;selected=id;desired=true;errorMessage='';
    const next=channel(id);updateUI();
    try {
      // Call play synchronously inside a user gesture when possible.
      await next.audio.play();
      if(token!==generation){if(selected!==id){next.audio.pause();next.weight=0;}return;}
      blocked=false;
      fadeTo(id,playing()?2400:800);
    } catch(error) {
      if(token!==generation)return;
      blocked=error.name==='NotAllowedError';
      if(!blocked)errorMessage='Audio is not ready. Click the track again to retry.';
      updateUI();
    }
  }
  function mute() {
    ++generation;desired=false;blocked=false;fadeTo(null,320);updateUI();
  }
  function toggle(){if(desired&&playing())mute();else selectTrack(selected);}
  $('#sound-toggle').addEventListener('click',toggle);
  $('#playlist-pause').addEventListener('click',toggle);
  $('#radio-caption').addEventListener('click',toggle);
  $('#radio-caption').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}});
  cards.forEach(card=>card.addEventListener('click',()=>selectTrack(card.dataset.trackId)));
  master.addEventListener('input',()=>{volume=Number(master.value)/100;applyVolume();});
  function unlock(event) {
    if(!desired||playing())return;
    if(event.target.closest?.('#sound-toggle,#playlist-pause,#radio-caption,[data-track-id]'))return;
    if(event.type==='keydown'&&['Shift','Control','Alt','Meta'].includes(event.key))return;
    selectTrack(selected);
  }
  document.addEventListener('pointerup',unlock);
  document.addEventListener('keydown',unlock);
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){backgroundPaused=desired&&playing();cancelAnimationFrame(fadeFrame);for(const c of channels.values())c.audio.pause();fading=false;}
    else if(backgroundPaused&&desired){backgroundPaused=false;selectTrack(selected);}
    updateUI();
  });
  window.addEventListener('pagehide',()=>{cancelAnimationFrame(fadeFrame);for(const c of channels.values())c.audio.pause();});
  // A small diagnostic surface used by the packaged QA, with no network or storage access.
  window.BELLANOVA_PLAYER=Object.freeze({
    selectTrack,
    getState:()=>({selected,desired,blocked,fading,volume,playing:playing(),channels:[...channels].map(([id,c])=>({id,paused:c.audio.paused,weight:c.weight,volume:c.audio.volume,currentTime:c.audio.currentTime,duration:c.audio.duration}))})
  });
  updateUI();selectTrack(selected,true);
})();
