// main.js  FINAL
// Fixes:
// - PDF Zusammenfassung + Bullet Points Buttons
// - Theme Mapping neon->dark und Live-Umschalten
// - Voices Dropdown befüllen
// - Chart Box in stats ausblenden wenn leer
// - XP Box nur rendern wo Elemente existieren (du entfernst sie manuell aus anderen Seiten)
// - Top Nav ist jetzt oben. Padding im Body angepasst via CSS.

(function(){
  'use strict';

  // ---- Helpers ----
  function $(sel, root=document){ return root.querySelector(sel); }
  function loadJSON(key, fallback){
    try {
      const raw = localStorage.getItem(key);
      if(!raw) return fallback;
      return JSON.parse(raw);
    } catch(e){
      console.warn('loadJSON error', key, e);
      return fallback;
    }
  }
  function saveJSON(key, val){
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch(e){
      console.warn('saveJSON error', key, e);
    }
  }
  function showToast(msg, timeoutMs=2500){
    let t = $('#toast');
    if(!t){
      t = document.createElement('div');
      t.id = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(()=>{ t.classList.remove('show'); }, timeoutMs);
  }

  // ---- Profile / XP / Level ----
  function computeNextXp(level){
    return level * 100;
  }
  function ensureProfile(){
    let p = loadJSON('memoria_profile', null);
    if(!p){
      p = {
        level: 1,
        xp: 0,
        totalXp: 0,
        nextXp: computeNextXp(1),
        colorPrimary: '#9D2A83',
        colorAccent: '#66ccff',
        theme: 'neon', // 'neon'|'dark'|'light'
        voice: '',
        statsDays: {}
      };
      saveJSON('memoria_profile', p);
    }
    return p;
  }
  function addXP(amount){
    const p = ensureProfile();
    p.xp += amount;
    p.totalXp += amount;

    const today = new Date().toISOString().slice(0,10);
    if(!p.statsDays[today]){
      p.statsDays[today] = {xp:0,cards:0,focusMin:0};
    }
    p.statsDays[today].xp += amount;

    while(p.xp >= p.nextXp){
      p.xp -= p.nextXp;
      p.level += 1;
      p.nextXp = computeNextXp(p.level);
      showToast('Level Up: ' + p.level);
    }

    saveJSON('memoria_profile', p);
    renderProfileHeader();
    renderDashboard();
    renderStats();
  }
  function trackLearnedCard(){
    const p = ensureProfile();
    const today = new Date().toISOString().slice(0,10);
    if(!p.statsDays[today]){
      p.statsDays[today] = {xp:0,cards:0,focusMin:0};
    }
    p.statsDays[today].cards += 1;
    saveJSON('memoria_profile', p);
    renderStats();
  }
  function renderProfileHeader(){
    const p = ensureProfile();
    const lvlBadge = $('#user-level-badge');
    const xpFill = $('#user-xp-fill');
    const xpCur = $('#user-xp-current');
    const xpNext = $('#user-xp-next');
    const dashLvl = $('#dash-level');
    const dashXp = $('#dash-xp');

    if(lvlBadge) lvlBadge.textContent = 'Level ' + p.level;
    if(xpCur) xpCur.textContent = p.xp;
    if(xpNext) xpNext.textContent = p.nextXp;
    if(dashLvl) dashLvl.textContent = p.level;
    if(dashXp) dashXp.textContent = p.totalXp;

    if(xpFill){
      const pct = p.nextXp>0? (p.xp / p.nextXp)*100 : 0;
      xpFill.style.width = pct.toFixed(1) + '%';
    }
  }

  // ---- Decks ----
  function ensureDecks(){
    let decks = loadJSON('memoria_decks', null);
    if(!decks){
      decks = {};
      const did = 'demo';
      decks[did] = {
        id: did,
        name: 'Demo-Deck',
        cards: [
          {q:'Marktpsychologie?', a:'Verhalten von Konsument:innen in Märkten.'},
          {q:'Werbepsychologie?', a:'Wie Werbung Wahrnehmung, Emotion, Handlung beeinflusst.'},
          {q:'UX?', a:'User Experience. Nutzungserleben.'},
          {q:'Konsistenzprinzip?', a:'Menschen wollen konsistent denken und handeln.'}
        ],
        createdAt: Date.now()
      };
      saveJSON('memoria_decks', decks);
    }
    return decks;
  }
  function createDeck(name){
    const decks = ensureDecks();
    const id = 'deck_' + Date.now();
    decks[id] = {
      id,
      name: name || ('Neues Deck ' + Object.keys(decks).length),
      cards: [],
      createdAt: Date.now()
    };
    saveJSON('memoria_decks', decks);
    showToast('Deck erstellt');
    renderDeckList();
    refreshDeckSelect();
  }
  function exportAllDecks(){
    const decks = ensureDecks();
    const blob = new Blob([JSON.stringify(decks,null,2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'memoria_decks_export.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Decks exportiert');
  }
  async function importDecksFromFile(file){
    if(!file) return;
    try {
      const txt = await file.text();
      const json = JSON.parse(txt);
      const decks = ensureDecks();
      Object.keys(json).forEach(id => {
        decks[id] = json[id];
      });
      saveJSON('memoria_decks', decks);
      showToast('Import erfolgreich');
      renderDeckList();
      refreshDeckSelect();
    } catch(e){
      console.warn('import error', e);
      showToast('Import fehlgeschlagen');
    }
  }
  function renderDeckList(){
    const wrap = $('#deck-list');
    if(!wrap) return;
    const decks = ensureDecks();
    wrap.innerHTML = '';
    Object.values(decks).forEach(deck => {
      const cardCount = deck.cards.length;
      const el = document.createElement('div');
      el.className = 'kard';
      el.style.marginBottom = '.75rem';
      el.innerHTML = `
        <div style="display:flex;flex-wrap:wrap;align-items:flex-start;gap:.5rem;justify-content:space-between;">
          <div>
            <div class="label" style="margin-bottom:.2rem;">${escapeHTML(deck.name)}</div>
            <div class="section-sub">${cardCount} Karten</div>
          </div>
          <div class="row" style="flex-wrap:wrap;">
            <button class="btn ghost" data-act="learn" data-id="${deck.id}">Lernen</button>
            <button class="btn ghost" data-act="addcard" data-id="${deck.id}">+ Karte</button>
            <button class="btn ghost" data-act="deldeck" data-id="${deck.id}">Löschen</button>
          </div>
        </div>
      `;
      wrap.appendChild(el);
    });

    wrap.addEventListener('click', e=>{
      const btn = e.target.closest('button[data-act]');
      if(!btn) return;
      const act = btn.getAttribute('data-act');
      const id = btn.getAttribute('data-id');
      if(act === 'deldeck'){
        deleteDeck(id);
      } else if(act === 'addcard'){
        addCardToDeckPrompt(id);
      } else if(act === 'learn'){
        localStorage.setItem('memoria_active_deck', id);
        location.href='learn.html';
      }
    }, {once:false});
  }
  function deleteDeck(id){
    const decks = ensureDecks();
    if(!decks[id]) return;
    delete decks[id];
    saveJSON('memoria_decks', decks);
    showToast('Deck gelöscht');
    renderDeckList();
    refreshDeckSelect();
  }
  function addCardToDeckPrompt(id){
    const q = prompt('Frage / Front:');
    const a = prompt('Antwort / Back:');
    if(!q || !a) return;
    const decks = ensureDecks();
    if(!decks[id]) return;
    decks[id].cards.push({ q, a });
    saveJSON('memoria_decks', decks);
    showToast('Karte gespeichert');
    renderDeckList();
    refreshDeckSelect();
  }
  function refreshDeckSelect(){
    const sel = $('#deck-select');
    if(!sel) return;
    const decks = ensureDecks();
    sel.innerHTML = '';
    Object.values(decks).forEach(deck => {
      const opt = document.createElement('option');
      opt.value = deck.id;
      opt.textContent = deck.name + ` (${deck.cards.length})`;
      sel.appendChild(opt);
    });
    const lastDeck = localStorage.getItem('memoria_active_deck');
    if(lastDeck && decks[lastDeck]){
      sel.value = lastDeck;
    }
  }

  // ---- Learn Mode ----
  let currentSession = {
    deckId: null,
    index: 0,
    order: [],
    showAnswer: false,
  };
  function startSession(){
    const sel = $('#deck-select');
    if(!sel || !sel.value) {
      showToast('Kein Deck gewählt');
      return;
    }
    const deckId = sel.value;
    localStorage.setItem('memoria_active_deck', deckId);
    const decks = ensureDecks();
    const deck = decks[deckId];
    if(!deck || !deck.cards.length){
      showToast('Dieses Deck hat keine Karten');
      return;
    }
    currentSession.deckId = deckId;
    currentSession.index = 0;
    currentSession.order = shuffleArray(deck.cards.map((_,i)=>i));
    currentSession.showAnswer = false;
    updateLearnUI();
  }
  function endSession(){
    currentSession.deckId = null;
    currentSession.index = 0;
    currentSession.order = [];
    currentSession.showAnswer = false;
    updateLearnUI();
  }
  function showAnswerNow(){
    currentSession.showAnswer = true;
    updateLearnUI();
  }
  function gradeCard(grade){
    const xpMap={again:1,hard:2,good:4,easy:6};
    addXP(xpMap[grade] || 1);
    trackLearnedCard();
    currentSession.index += 1;
    currentSession.showAnswer = false;
    updateLearnUI();
  }
  function updateLearnUI(){
    const qEl = $('#learn-question');
    const aEl = $('#learn-answer');
    const rowGrade = $('#grade-row');
    const progText = $('#session-count');
    const progPct = $('#session-progress');

    const decks = ensureDecks();

    if(!currentSession.deckId){
      if(qEl) qEl.textContent = 'Keine aktive Session';
      if(aEl){ aEl.style.display='none'; }
      if(rowGrade){ rowGrade.hidden = true; }
      if(progText) progText.textContent = '0 / 0';
      if(progPct) progPct.textContent = '0 %';
      return;
    }
    const deck = decks[currentSession.deckId];
    const order = currentSession.order;
    const idx = currentSession.index;
    if(idx >= order.length){
      if(qEl) qEl.textContent = 'Session beendet';
      if(aEl){
        aEl.style.display = 'block';
        aEl.textContent = 'Fertig.';
      }
      if(rowGrade){ rowGrade.hidden = true; }
      if(progText) progText.textContent = order.length + ' / ' + order.length;
      if(progPct) progPct.textContent = '100 %';
      return;
    }
    const cardIndex = order[idx];
    const card = deck.cards[cardIndex];
    if(qEl) qEl.textContent = card.q || '(ohne Frage)';
    if(aEl){
      if(currentSession.showAnswer){
        aEl.style.display = 'block';
        aEl.textContent = card.a || '(ohne Antwort)';
      } else {
        aEl.style.display = 'none';
      }
    }
    if(rowGrade){
      rowGrade.hidden = !currentSession.showAnswer;
    }
    if(progText){
      progText.textContent = (idx)+' / '+(order.length);
    }
    if(progPct){
      const pct = order.length>0 ? Math.round((idx/order.length)*100) : 0;
      progPct.textContent = pct + ' %';
    }
  }

  // ---- Quests ----
  function ensureQuests(){
    let quests = loadJSON('memoria_quests', null);
    if(!quests){
      quests = [];
      saveJSON('memoria_quests', quests);
    }
    return quests;
  }
  function addQuest(title, xp){
    const quests = ensureQuests();
    quests.push({
      id: 'q_'+Date.now(),
      title: title || 'Neue Quest',
      xp: xp||10,
      doneAt: null
    });
    saveJSON('memoria_quests', quests);
    renderQuests();
    showToast('Quest hinzugefügt');
  }
  function completeQuest(id){
    const quests = ensureQuests();
    const q = quests.find(q=>q.id===id);
    if(!q || q.doneAt) return;
    q.doneAt = Date.now();
    saveJSON('memoria_quests', quests);
    addXP(q.xp||10);
    renderQuests();
    showToast('Quest abgeschlossen +XP');
  }
  function renderQuests(){
    const wrap = $('#quest-list');
    if(!wrap) return;
    const quests = ensureQuests();
    wrap.innerHTML='';
    if(!quests.length){
      wrap.innerHTML='<div class="section-sub">Keine Quests</div>';
      return;
    }
    quests.forEach(q=>{
      const done = !!q.doneAt;
      const el = document.createElement('div');
      el.className='kard';
      el.style.marginBottom='.75rem';
      el.innerHTML=`
        <div style="display:flex;flex-wrap:wrap;gap:.5rem;justify-content:space-between;align-items:flex-start;">
          <div>
            <div class="label" style="margin-bottom:.2rem;">${escapeHTML(q.title)}</div>
            <div class="section-sub">${q.xp||10} XP</div>
            ${done ? '<div class="badge">Erledigt</div>' : ''}
          </div>
          <div class="row" style="flex-wrap:wrap;">
            ${done? '' : `<button class="btn ghost" data-qdone="${q.id}">Abschließen</button>`}
          </div>
        </div>
      `;
      wrap.appendChild(el);
    });

    wrap.addEventListener('click', e=>{
      const btn=e.target.closest('button[data-qdone]');
      if(!btn) return;
      completeQuest(btn.getAttribute('data-qdone'));
    }, {once:false});
  }

  // ---- Stats ----
  function calcTodayStats(){
    const p = ensureProfile();
    const today = new Date().toISOString().slice(0,10);
    const d = p.statsDays[today] || {xp:0,cards:0,focusMin:0};
    return d;
  }
  function renderStats(){
    const p = ensureProfile();
    const totalXpEl = $('#stat-xp');
    const cardsEl = $('#stat-today-cards');
    const focusEl = $('#stat-total-time');
    const chartCanvas = $('#chart-sessions');

    const todayStats = calcTodayStats();

    if(totalXpEl) totalXpEl.textContent = p.totalXp || 0;
    if(cardsEl) cardsEl.textContent = todayStats.cards || 0;
    if(focusEl) focusEl.textContent = (todayStats.focusMin||0) + " min";

    // Wenn keine sinnvollen Daten vorhanden sind -> Canvas verstecken
    if(chartCanvas){
      const hasAnyData = Object.keys(p.statsDays||{}).length > 0;
      if(!hasAnyData){
        chartCanvas.style.display = 'none';
      } else {
        chartCanvas.style.display = 'block';
        // hier könnte man später echtes Zeichnen machen
      }
    }
  }

  // ---- PDF Hooks ----
  async function summarizeText(raw){
    try {
      if(typeof window.MEMORIA_SUMMARY_API === 'function'){
        return await window.MEMORIA_SUMMARY_API(raw);
      }
    } catch(e){
      console.warn('External summary failed', e);
    }
    return localFallbackSummary(raw);
  }
  function localFallbackSummary(raw){
    const sents = raw.split(/(?<=[.?!])\s+/).slice(0,3);
    return sents.join(' ');
  }
  function toBulletPoints(raw){
    // simple bullet heuristic
    const lines = raw
      .split(/(?<=[.?!])\s+/)
      .slice(0,5)
      .map(t => "• " + t.trim());
    return lines.join("\n");
  }

  function pdfInit(){
    const openBtn = $('#pdf-open');
    const clearBtn = $('#pdf-clear');
    const prevBtn = $('#pdf-prev');
    const nextBtn = $('#pdf-next');
    const zoomInBtn = $('#pdf-zoom-in');
    const zoomOutBtn = $('#pdf-zoom-out');
    const findBtn = $('#pdf-find');
    const clearSearchBtn = $('#pdf-clear-search');
    const goBtn = $('#pdf-go');
    const summarizeBtn = $('#pdf-summarize');
    const bulletsBtn = $('#pdf-bullets');
    const ttsBtn = $('#pdf-tts');
    const ocrBtn = $('#pdf-ocr');
    const exportPageBtn = $('#pdf-export-page');
    const exportDocBtn = $('#pdf-export-doc');
    const exportHiBtn = $('#pdf-export-highlights');

    const summaryBox = $('#pdf-summary');
    const extractBox = $('#pdf-extract');

    function fakePDFText(){
        return "Das ist ein Beispieltext der PDF. Er dient zur Vorschau der Zusammenfassung. Das echte Rendering passiert später über pdf.js und OCR. Fokus liegt hier auf der UI Logik.";
    }

    if(openBtn){
      openBtn.addEventListener('click', ()=>{
        showToast('PDF öffnen (Hook)');
      });
    }
    if(clearBtn){
      clearBtn.addEventListener('click', ()=>{
        if(summaryBox) summaryBox.textContent = '';
        if(extractBox) extractBox.textContent = '';
        showToast('PDF geschlossen');
      });
    }
    if(prevBtn){
      prevBtn.addEventListener('click', ()=>{
        showToast('Seite zurück');
      });
    }
    if(nextBtn){
      nextBtn.addEventListener('click', ()=>{
        showToast('Seite vor');
      });
    }
    if(zoomInBtn){
      zoomInBtn.addEventListener('click', ()=>{
        showToast('Zoom +');
      });
    }
    if(zoomOutBtn){
      zoomOutBtn.addEventListener('click', ()=>{
        showToast('Zoom -');
      });
    }
    if(findBtn){
      findBtn.addEventListener('click', ()=>{
        const term = $('#pdf-search')?.value||'';
        showToast('Suche: '+term);
      });
    }
    if(clearSearchBtn){
      clearSearchBtn.addEventListener('click', ()=>{
        showToast('Suche gelöscht');
      });
    }
    if(goBtn){
      goBtn.addEventListener('click', ()=>{
        const p = $('#pdf-jump')?.value||'';
        showToast('Gehe zu Seite '+p);
      });
    }

    if(summarizeBtn){
      summarizeBtn.addEventListener('click', async ()=>{
        if(summaryBox){
          summaryBox.textContent = 'Zusammenfassen...';
        }
        const raw = fakePDFText();
        const sum = await summarizeText(raw);
        if(summaryBox){
          summaryBox.textContent = sum;
        }
        showToast('Zusammenfassung erstellt');
      });
    }

    if(bulletsBtn){
      bulletsBtn.addEventListener('click', async ()=>{
        if(extractBox){
          extractBox.textContent = 'Analysiere...';
        }
        const raw = fakePDFText();
        const bullets = toBulletPoints(raw);
        if(extractBox){
          extractBox.textContent = bullets;
        }
        showToast('Bullet Points erstellt');
      });
    }

    if(ttsBtn){
      ttsBtn.addEventListener('click', ()=>{
        showToast('Vorlesen (Hook)');
      });
    }
    if(ocrBtn){
      ocrBtn.addEventListener('click', ()=>{
        showToast('OCR (Hook)');
      });
    }
    if(exportPageBtn){
      exportPageBtn.addEventListener('click', ()=>{
        showToast('Export Seite (Hook)');
      });
    }
    if(exportDocBtn){
      exportDocBtn.addEventListener('click', ()=>{
        showToast('Export Dokument (Hook)');
      });
    }
    if(exportHiBtn){
      exportHiBtn.addEventListener('click', ()=>{
        showToast('Export Markierungen (Hook)');
      });
    }
  }

  // ---- Theme / Settings / Voices ----
  function applyThemeSettings(){
    const p = ensureProfile();
    const rootEl = document.documentElement;

    // Mappe "neon" intern auf "dark" CSS Theme
    const themeForDOM = (p.theme === 'neon') ? 'dark' : p.theme;
    if(themeForDOM){
      rootEl.setAttribute('data-theme', themeForDOM);
    }

    if(p.colorPrimary){
      rootEl.style.setProperty('--accent-pink', p.colorPrimary);
    }
    if(p.colorAccent){
      rootEl.style.setProperty('--accent-cyan', p.colorAccent);
    }
  }

  function populateVoices(selectEl, currentVoice){
    if(!selectEl) return;
    const voices = speechSynthesis.getVoices();
    selectEl.innerHTML = '';

    // Fallback Option
    const baseOpt = document.createElement('option');
    baseOpt.value = '';
    baseOpt.textContent = 'System Stimme';
    selectEl.appendChild(baseOpt);

    voices.forEach(v=>{
      const opt = document.createElement('option');
      opt.value = v.name;
      opt.textContent = v.name + (v.lang ? ' ['+v.lang+']' : '');
      selectEl.appendChild(opt);
    });

    // restore selection
    if(currentVoice){
      selectEl.value = currentVoice;
    }
  }

  function initSettingsUI(){
    const primary = $('#color-primary');
    const accent = $('#color-accent');
    const themeSel = $('#theme-select');
    const voiceSel = $('#voice-select');
    const saveBtn = $('#save-settings');
    const resetBtn = $('#reset-settings');

    const p = ensureProfile();

    if(primary) primary.value = p.colorPrimary || '#9D2A83';
    if(accent) accent.value = p.colorAccent || '#66ccff';
    if(themeSel) themeSel.value = p.theme || 'neon';

    // Stimmenliste füllen (kann asynchron kommen)
    if(voiceSel){
      populateVoices(voiceSel, p.voice || '');
      // Manche Browser feuern voiceschanged später
      speechSynthesis.onvoiceschanged = function(){
        populateVoices(voiceSel, ensureProfile().voice || '');
      };
    }

    if(saveBtn){
      saveBtn.addEventListener('click', ()=>{
        const pr = primary? primary.value : p.colorPrimary;
        const ac = accent? accent.value : p.colorAccent;
        const th = themeSel? themeSel.value : p.theme;
        const vc = voiceSel? voiceSel.value : p.voice;

        p.colorPrimary = pr;
        p.colorAccent = ac;
        p.theme = th;
        p.voice = vc;

        saveJSON('memoria_profile', p);
        applyThemeSettings();
        showToast('Gespeichert');
      });
    }

    if(resetBtn){
      resetBtn.addEventListener('click', ()=>{
        p.colorPrimary = '#9D2A83';
        p.colorAccent = '#66ccff';
        p.theme = 'neon';
        p.voice = '';

        saveJSON('memoria_profile', p);
        applyThemeSettings();

        if(primary) primary.value = p.colorPrimary;
        if(accent) accent.value = p.colorAccent;
        if(themeSel) themeSel.value = p.theme;
        if(voiceSel) populateVoices(voiceSel, p.voice);

        showToast('Zurückgesetzt');
      });
    }
  }

  // ---- Dashboard ----
  function renderDashboard(){
    const decks = ensureDecks();
    let totalCards = 0;
    Object.values(decks).forEach(d => { totalCards += d.cards.length; });
    const dueEl = $('#due-cards-badge');
    if(dueEl) dueEl.textContent = totalCards+' Karten bereit';

    const tipEl = $('#tip-of-day');
    if(tipEl){
      const tips=[
        'Kurze echte Fokussprints schlagen leeres Sitzen.',
        'Abrufen stärkt Erinnerung. Nicht nur lesen.',
        'Schreibe Notizen an dein Zukunfts-Ich.',
        'Lies laut vor wenn du müde wirst.'
      ];
      // simple deterministic pick
      tipEl.textContent = tips[(new Date().getDate()+tips.length)%tips.length];
    }
  }

  // ---- Utils ----
  function shuffleArray(arr){
    const a = arr.slice();
    for(let i=a.length-1; i>0; i--){
      const j = Math.floor(Math.random()*(i+1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function escapeHTML(str){
    return (str||'').replace(/[&<>"']/g, function(m){
      switch(m){
        case '&': return '&amp;';
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#39;';
      }
      return m;
    });
  }

  // ---- Init pro Seite ----
  function initDeckPage(){
    const createBtn = $('#create-deck');
    if(createBtn){
      createBtn.addEventListener('click', ()=>{
        const name = $('#deck-name')?.value||'';
        createDeck(name.trim());
        const dn = $('#deck-name');
        if(dn) dn.value='';
      });
    }
    const importBtn = $('#import-deck');
    if(importBtn){
      importBtn.addEventListener('click', ()=>{
        const fileInput = $('#import-file');
        if(fileInput && fileInput.files && fileInput.files[0]){
          importDecksFromFile(fileInput.files[0]);
          fileInput.value='';
        } else {
          showToast('Keine Datei gewählt');
        }
      });
    }
    const exportBtn = $('#export-deck');
    if(exportBtn){
      exportBtn.addEventListener('click', ()=>{
        exportAllDecks();
      });
    }
    renderDeckList();
  }

  function initLearnPage(){
    const startBtn = $('#start-session');
    const endBtn = $('#end-session');
    const showAnsBtn = $('#show-answer');
    const gradeRow = $('#grade-row');

    if(startBtn){ startBtn.addEventListener('click', startSession); }
    if(endBtn){ endBtn.addEventListener('click', endSession); }
    if(showAnsBtn){ showAnsBtn.addEventListener('click', showAnswerNow); }
    if(gradeRow){
      gradeRow.addEventListener('click', e=>{
        const b = e.target.closest('button[data-grade]');
        if(!b) return;
        const g = b.getAttribute('data-grade');
        gradeCard(g);
      }, {once:false});
    }
    refreshDeckSelect();
    updateLearnUI();
  }

  function initQuestsPage(){
    const addBtn = $('#add-quest');
    if(addBtn){
      addBtn.addEventListener('click', ()=>{
        const title = $('#quest-title')?.value||'';
        const xp = parseInt($('#quest-xp')?.value||'10',10)||10;
        addQuest(title.trim(), xp);
        const qt=$('#quest-title'); if(qt) qt.value='';
        const qx=$('#quest-xp'); if(qx) qx.value='10';
      });
    }
    renderQuests();
  }

  function initStatsPage(){
    renderStats();
  }

  function initPdfPage(){
    pdfInit();
  }

  function initSettingsPage(){
    initSettingsUI();
  }

  // ---- Global Boot ----
  function boot(){
    applyThemeSettings();
    renderProfileHeader();

    const path = location.pathname.split('/').pop().toLowerCase();
    if(path.includes('index') || path===''){
      renderDashboard();
    }
    if(path.includes('decks')){
      initDeckPage();
    }
    if(path.includes('learn')){
      initLearnPage();
    }
    if(path.includes('quests')){
      initQuestsPage();
    }
    if(path.includes('stats')){
      initStatsPage();
    }
    if(path.includes('pdf')){
      initPdfPage();
    }
    if(path.includes('settings')){
      initSettingsPage();
    }
  }

  document.addEventListener('DOMContentLoaded', boot);

})();