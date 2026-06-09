/**
 * Curi-Curi Kata: Main Game Controller Engine
 * Mengelola logic gameplay, touch tracking, timer, combat loop, dan state.
 */

let GAME_STATE = {
  playerName: "Pemain Baru",
  difficulty: "EASY", 
  mode: "CASUAL", 
  gridSize: 8,
  words: [],
  foundWords: [],
  grid: [],
  timer: 0,
  timerInterval: null,
  score: 0,
  showWordList: true,
  
  playerHp: 100,
  enemyHp: 100,
  turnInterval: null,
  combatTimer: 0,

  isSelecting: false,
  startCell: null,
  selectedCells: []
};

function toggleOptionText() {
  const toggle = document.getElementById('showWordToggle');
  const text = document.getElementById('hintVisibilityText');
  if (toggle && toggle.checked) {
    text.innerText = "Aktif: Target kata ditampilkan jelas.";
  } else if (text) {
    text.innerText = "Non-Aktif: Cari secara mandiri.";
  }
  AudioGame.playSelect();
}

function selectDifficulty(diff) {
  GAME_STATE.difficulty = diff;
  document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.className = "difficulty-btn py-2.5 px-3 rounded-xl font-black border-2 text-center transition flex flex-col items-center justify-center bg-slate-50 border-slate-300 text-slate-600 hover:border-emerald-500/50";
  });
  const selectedBtn = document.getElementById(`btnDiff${diff}`);
  if (selectedBtn) {
    selectedBtn.className = "difficulty-btn py-2.5 px-3 rounded-xl font-black border-2 text-center transition flex flex-col items-center justify-center bg-emerald-500/10 border-emerald-500 text-emerald-600";
  }
  AudioGame.playSelect();
}

function selectMode(mode) {
  GAME_STATE.mode = mode;

  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.className = "mode-btn p-3 rounded-xl border-2 text-left transition flex items-center space-x-2.5 bg-slate-50 border-slate-300 hover:border-emerald-500/50 text-slate-700";
  });
  const selectedBtn = document.getElementById(`btnMode${mode}`);
  if (selectedBtn) {
    selectedBtn.className = "mode-btn p-3 rounded-xl border-2 text-left transition flex items-center space-x-2.5 bg-emerald-500/10 border-emerald-500 text-slate-700";
  }
  AudioGame.playSelect();
}

// PERBAIKAN DIFFICULTY KATA: Semua difficulty sekarang mengambil jumlah kata yang SAMA (5 kata)
function getRandomWords(difficulty) {
  const pool = KATA_MASTER[difficulty] || KATA_MASTER.EASY;
  const count = 5; // Tetap 5 kata di semua difficulty
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function startGame() {
  AudioGame.init();
  const inputName = document.getElementById('playerNameInput').value.trim();
  GAME_STATE.playerName = inputName ? inputName : "Pencuri Kata";
  GAME_STATE.showWordList = document.getElementById('showWordToggle').checked;
  
  if (GAME_STATE.difficulty === "EASY") GAME_STATE.gridSize = 8;
  else if (GAME_STATE.difficulty === "MEDIUM") GAME_STATE.gridSize = 12;
  else GAME_STATE.gridSize = 15;

  GAME_STATE.score = 0;
  GAME_STATE.foundWords = [];
  GAME_STATE.words = getRandomWords(GAME_STATE.difficulty);

  setupAesthetics();
  buildGridBoard();
  startTimerEngine();

  if (typeof injectSprites === 'function') {
    injectSprites();
  }

  document.getElementById('menuScene').classList.add('hidden');
  document.getElementById('gameplayScene').classList.remove('hidden');
  
  document.getElementById('gamePlayerName').innerText = GAME_STATE.playerName;
  document.getElementById('badgeDifficulty').innerText = GAME_STATE.difficulty;
  document.getElementById('currentScore').innerText = GAME_STATE.score;
}

// MENGHAPUS TOTAL DARK MODE (KECUALI JIKA MASUK TURN_BASE RPG MODE)
function setupAesthetics() {
  const header = document.getElementById('mainHeader');
  const scorePanel = document.getElementById('scorePanel');
  const container = document.getElementById('gridBoardContainer');
  const arena = document.getElementById('battleArena');

  if (GAME_STATE.mode === 'TURN_BASE') {
    // Biarkan tetap gelap khusus RPG Battle Mode
    document.body.className = "bg-neutral-950 text-slate-100 h-[100dvh] w-screen overflow-hidden flex flex-col justify-between pb-safe pt-safe";
    if (header) header.className = "bg-slate-950 text-red-500 px-4 py-2 border-b border-red-950 shrink-0";
    if (scorePanel) scorePanel.className = "bg-neutral-950 border-2 border-red-950 rounded-2xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-2.5 shrink-0 text-slate-100";
    if (container) container.className = "bg-neutral-950 rounded-3xl p-3 border-4 border-red-950 select-none w-full max-w-[min(90vw,60dvh)] max-h-[min(90vw,60dvh)] aspect-square flex items-center justify-center";
    
    document.getElementById('gamePlayerName').className = "text-xs font-black text-red-500 uppercase tracking-tight";
    document.getElementById('badgeDifficulty').className = "bg-red-950 border border-red-900/40 text-red-400 px-2 py-0.5 rounded-lg text-[9px] font-black mono-font";
    if (arena) arena.classList.remove('hidden');

    GAME_STATE.playerHp = 100;
    GAME_STATE.enemyHp = 100;
    updateHpBars();
    document.getElementById('combatLog').innerText = "💀 NETRALISIR PENJAHAT SEGERA!";
    
    startCombatEngine();
  } else {
    // Kembalikan ke Full Light Mode untuk mode lainnya
    document.body.className = "bg-slate-100 text-slate-800 h-[100dvh] w-screen overflow-hidden flex flex-col justify-between pb-safe pt-safe";
    if (header) header.className = "bg-white text-emerald-600 px-4 py-2 border-b border-slate-200 shrink-0";
    if (scorePanel) scorePanel.className = "bg-white border-2 border-slate-300 rounded-2xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-2.5 shrink-0 text-slate-800";
    if (container) container.className = "bg-white rounded-3xl p-3 border-4 border-slate-800 select-none w-full max-w-[min(90vw,60dvh)] max-h-[min(90vw,60dvh)] aspect-square flex items-center justify-center shadow-lg";

    document.getElementById('gamePlayerName').className = "text-xs font-black text-emerald-600 uppercase tracking-tight";
    document.getElementById('badgeDifficulty').className = "bg-emerald-50 border border-emerald-200 text-emerald-600 px-2 py-0.5 rounded-lg text-[9px] font-black mono-font";

    if (arena) arena.classList.add('hidden');
    stopCombatEngine();
  }
}

function buildGridBoard() {
  const size = GAME_STATE.gridSize;
  GAME_STATE.grid = Array(size).fill(null).map(() => Array(size).fill(''));

  GAME_STATE.words.forEach(word => {
    let placed = false;
    let attempts = 0;
    const maxAttempts = 150;

    let directions = [];
    if (GAME_STATE.difficulty === "EASY") {
      directions = [[0, 1], [1, 0]];
    } else if (GAME_STATE.difficulty === "MEDIUM") {
      directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    } else {
      directions = [
        [0, 1], [1, 0], [0, -1], [-1, 0],
        [1, 1], [-1, -1], [1, -1], [-1, 1]
      ];
    }

    while (!placed && attempts < maxAttempts) {
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const r = Math.floor(Math.random() * size);
      const c = Math.floor(Math.random() * size);

      if (canPlaceWord(word, r, c, dir)) {
        placeWord(word, r, c, dir);
        placed = true;
      }
      attempts++;
    }
  });

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (GAME_STATE.grid[r][c] === '') {
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        GAME_STATE.grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
      }
    }
  }

  renderGridHTML();
  renderTargetWordsHTML();
}

function canPlaceWord(word, row, col, dir) {
  const size = GAME_STATE.gridSize;
  const dr = dir[0];
  const dc = dir[1];

  for (let i = 0; i < word.length; i++) {
    const nr = row + i * dr;
    const nc = col + i * dc;

    if (nr < 0 || nr >= size || nc < 0 || nc >= size) return false;
    if (GAME_STATE.grid[nr][nc] !== '' && GAME_STATE.grid[nr][nc] !== word[i]) return false;
  }
  return true;
}

function placeWord(word, row, col, dir) {
  const dr = dir[0];
  const dc = dir[1];
  for (let i = 0; i < word.length; i++) {
    const nr = row + i * dr;
    const nc = col + i * dc;
    GAME_STATE.grid[nr][nc] = word[i];
  }
}

function renderGridHTML() {
  const gridElement = document.getElementById('wordGrid');
  if (!gridElement) return;
  gridElement.innerHTML = '';
  
  const size = GAME_STATE.gridSize;
  gridElement.style.gridTemplateColumns = `repeat(${size}, minmax(0, 1fr))`;

  let cellBgClass = (GAME_STATE.mode === 'TURN_BASE')
    ? "bg-neutral-900 text-slate-100 hover:bg-red-950 border-neutral-800"
    : "bg-white text-slate-950 border-slate-300 hover:bg-slate-200 hover:text-slate-950";

  let fontSizeClass = "text-sm sm:text-base";
  if (size === 12) fontSizeClass = "text-[12px] sm:text-sm";
  if (size === 15) fontSizeClass = "text-[9px] sm:text-[11px]";

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const letter = GAME_STATE.grid[r][c];
      const cell = document.createElement('div');
      cell.className = `grid-cell aspect-square flex items-center justify-center font-black ${fontSizeClass} border rounded cursor-pointer ${cellBgClass} mono-font`;
      cell.innerText = letter;
      cell.dataset.row = r;
      cell.dataset.col = c;

      cell.addEventListener('mousedown', (e) => startSelection(r, c));
      cell.addEventListener('mouseenter', (e) => continueSelection(r, c));
      
      gridElement.appendChild(cell);
    }
  }

  // Bind mouse / touch global actions agar tidak lari
  window.onmouseup = endSelection;
  gridElement.ontouchstart = handleTouchStart;
  gridElement.ontouchmove = handleTouchMove;
  gridElement.ontouchend = endSelection;
}

function renderTargetWordsHTML() {
  const targetList = document.getElementById('targetWordList');
  if (!targetList) return;
  targetList.innerHTML = '';

  GAME_STATE.words.forEach(word => {
    const isFound = GAME_STATE.foundWords.includes(word);
    const badge = document.createElement('span');
    badge.classList.add('shrink-0');
    
    if (isFound) {
      badge.className = "px-2.5 py-0.5 rounded text-[10px] font-black bg-emerald-900/30 text-emerald-500 line-through opacity-60 transition-all shrink-0 mono-font";
      badge.innerText = word;
    } else {
      if (GAME_STATE.showWordList) {
        badge.className = (GAME_STATE.mode === 'TURN_BASE')
          ? "px-2.5 py-0.5 rounded text-[10px] font-black bg-neutral-900 text-red-400 border border-red-950/60 transition-all shrink-0 mono-font"
          : "px-2.5 py-0.5 rounded text-[10px] font-black bg-slate-100 text-emerald-600 border border-emerald-200 transition-all shrink-0 mono-font";
        badge.innerText = word;
      } else {
        badge.className = (GAME_STATE.mode === 'TURN_BASE')
          ? "px-2.5 py-0.5 rounded text-[10px] font-black bg-red-950/20 text-red-500 border border-red-900/40 select-none animate-pulse shrink-0 mono-font"
          : "px-2.5 py-0.5 rounded text-[10px] font-black bg-slate-100 text-slate-400 border border-slate-200 select-none shrink-0 mono-font";
        badge.innerText = `🔒 (L:${word.length})`;
      }
    }
    targetList.appendChild(badge);
  });
}

function startSelection(r, c) {
  GAME_STATE.isSelecting = true;
  GAME_STATE.startCell = { r, c };
  GAME_STATE.selectedCells = [{ r, c }];
  highlightSelection();
  AudioGame.playSelect();
}

function continueSelection(r, c) {
  if (!GAME_STATE.isSelecting) return;
  
  const start = GAME_STATE.startCell;
  const dr = r - start.r;
  const dc = c - start.c;

  const absR = Math.abs(dr);
  const absC = Math.abs(dc);

  if (dr === 0 || dc === 0 || absR === absC) {
    const stepR = dr === 0 ? 0 : dr / absR;
    const stepC = dc === 0 ? 0 : dc / absC;
    const steps = Math.max(absR, absC);
    
    const path = [];
    for (let i = 0; i <= steps; i++) {
      path.push({
        r: start.r + i * stepR,
        c: start.c + i * stepC
      });
    }
    GAME_STATE.selectedCells = path;
    highlightSelection();
  }
}

function endSelection() {
  if (!GAME_STATE.isSelecting) return;
  GAME_STATE.isSelecting = false;

  let selectedWord = "";
  GAME_STATE.selectedCells.forEach(cell => {
    selectedWord += GAME_STATE.grid[cell.r][cell.c];
  });

  const reversedWord = selectedWord.split('').reverse().join('');

  let matchedWord = null;
  if (GAME_STATE.words.includes(selectedWord) && !GAME_STATE.foundWords.includes(selectedWord)) {
    matchedWord = selectedWord;
  } else if (GAME_STATE.words.includes(reversedWord) && !GAME_STATE.foundWords.includes(reversedWord)) {
    matchedWord = reversedWord;
  }

  if (matchedWord) {
    GAME_STATE.foundWords.push(matchedWord);
    AudioGame.playSuccess();
    
    markCellsAsFound(GAME_STATE.selectedCells);
    renderTargetWordsHTML();
    handleSuccessEvent(matchedWord);

    if (GAME_STATE.foundWords.length === GAME_STATE.words.length) {
      handleBoardClear();
    }
  } else {
    AudioGame.playFail();
    clearTemporaryHighlight();
  }
}

function handleTouchStart(e) {
  e.preventDefault();
  const touch = e.touches[0];
  const element = document.elementFromPoint(touch.clientX, touch.clientY);
  if (element) {
    let cell = element;
    while (cell && !cell.dataset.row && cell.id !== 'wordGrid') {
      cell = cell.parentElement;
    }
    if (cell && cell.dataset.row) {
      startSelection(parseInt(cell.dataset.row), parseInt(cell.dataset.col));
    }
  }
}

function handleTouchMove(e) {
  e.preventDefault();
  if (!GAME_STATE.isSelecting) return;
  const touch = e.touches[0];
  const element = document.elementFromPoint(touch.clientX, touch.clientY);
  if (element) {
    let cell = element;
    while (cell && !cell.dataset.row && cell.id !== 'wordGrid') {
      cell = cell.parentElement;
    }
    if (cell && cell.dataset.row) {
      continueSelection(parseInt(cell.dataset.row), parseInt(cell.dataset.col));
    }
  }
}

function highlightSelection() {
  clearTemporaryHighlight();
  GAME_STATE.selectedCells.forEach(cell => {
    const el = getCellElement(cell.r, cell.c);
    if (el) {
      el.className = (GAME_STATE.mode === 'TURN_BASE')
        ? `grid-cell aspect-square flex items-center justify-center font-black text-white bg-red-700 border-red-500 scale-105 mono-font`
        : `grid-cell aspect-square flex items-center justify-center font-black text-white bg-emerald-600 border-emerald-400 scale-105 mono-font`;
    }
  });
}

function clearTemporaryHighlight() {
  const size = GAME_STATE.gridSize;
  let baseCellBgClass = (GAME_STATE.mode === 'TURN_BASE')
    ? "bg-neutral-900 text-slate-100 hover:bg-red-950 border-neutral-800"
    : "bg-white text-slate-950 border-slate-300 hover:bg-slate-200 hover:text-slate-950";

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const el = getCellElement(r, c);
      if (el && !el.classList.contains('found-cell')) {
        el.className = `grid-cell aspect-square flex items-center justify-center font-black border rounded cursor-pointer ${baseCellBgClass} mono-font`;
      }
    }
  }
}

function markCellsAsFound(cells) {
  cells.forEach(cell => {
    const el = getCellElement(cell.r, cell.c);
    if (el) {
      el.classList.add('found-cell');
      el.className = (GAME_STATE.mode === 'TURN_BASE')
        ? `grid-cell aspect-square flex items-center justify-center font-black border rounded cursor-pointer bg-red-600 text-white border-red-400 found-cell mono-font`
        : `grid-cell aspect-square flex items-center justify-center font-black border rounded cursor-pointer bg-emerald-600 text-white border-emerald-400 found-cell mono-font`;
    }
  });
}

function getCellElement(r, c) {
  return document.querySelector(`[data-row='${r}'][data-col='${c}']`);
}

function startTimerEngine() {
  if (GAME_STATE.timerInterval) clearInterval(GAME_STATE.timerInterval);

  const timerDisplay = document.getElementById('gameTimer');
  const timerLabel = document.getElementById('timerLabel');

  if (GAME_STATE.mode === "CASUAL" || GAME_STATE.mode === "TURN_BASE") {
    GAME_STATE.timer = 0;
    timerLabel.innerText = "MODE:";
    timerDisplay.innerText = GAME_STATE.mode === "TURN_BASE" ? "BATTLE" : "SANTAI";
  } else if (GAME_STATE.mode === "SPEEDRUN") {
    GAME_STATE.timer = 0;
    timerLabel.innerText = "TEMPO:";
    timerDisplay.innerText = "00:00";
    
    GAME_STATE.timerInterval = setInterval(() => {
      GAME_STATE.timer++;
      timerDisplay.innerText = formatTime(GAME_STATE.timer);
    }, 1000);
  } else if (GAME_STATE.mode === "TIME_CHALLENGE") {
    timerLabel.innerText = "LIMIT:";
    if (GAME_STATE.difficulty === "EASY") GAME_STATE.timer = 60;
    else if (GAME_STATE.difficulty === "MEDIUM") GAME_STATE.timer = 150;
    else GAME_STATE.timer = 240;

    timerDisplay.innerText = formatTime(GAME_STATE.timer);

    GAME_STATE.timerInterval = setInterval(() => {
      GAME_STATE.timer--;
      timerDisplay.innerText = formatTime(GAME_STATE.timer);

      if (GAME_STATE.timer <= 0) {
        clearInterval(GAME_STATE.timerInterval);
        endGame(false, "Sisa waktu habis! Penjahat berhasil lolos dari radar.");
      }
    }, 1000);
  }
}

// PERBAIKAN TIMING RPG ATTACK: EASY = 20s, MEDIUM/NORMAL = 18s, HARD = 15s
function startCombatEngine() {
  if (GAME_STATE.turnInterval) clearInterval(GAME_STATE.turnInterval);
  
  const cooldownMap = {
    EASY: 20,    // Diubah dari 15 ke 20 detik
    MEDIUM: 18,  // Diubah dari 25 ke 18 detik
    HARD: 15     // Diubah dari 40 ke 15 detik
  };
  
  const monsterCooldown = cooldownMap[GAME_STATE.difficulty] || 20;
  GAME_STATE.combatTimer = monsterCooldown;
  
  GAME_STATE.turnInterval = setInterval(() => {
    GAME_STATE.combatTimer--;
    
    if (GAME_STATE.combatTimer <= 0) {
      triggerEnemyAttack();
      GAME_STATE.combatTimer = monsterCooldown;
    } else {
      document.getElementById('combatLog').innerText = `💥 PENJAHAT MENYERANG DALAM ${GAME_STATE.combatTimer}S`;
    }
  }, 1000);
}

function triggerEnemyAttack() {
  AudioGame.playEnemyHit();
  GAME_STATE.playerHp = Math.max(0, GAME_STATE.playerHp - 10);
  updateHpBars();

  const arena = document.getElementById('battleArena');
  const heroSpriteContainer = document.getElementById('heroSpriteContainer');
  const enemySpriteContainer = document.getElementById('enemySpriteContainer');

  if (enemySpriteContainer) {
    enemySpriteContainer.classList.remove('sprite-idle');
    enemySpriteContainer.classList.add('enemy-attack-anim');
  }

  setTimeout(() => {
    if (heroSpriteContainer) heroSpriteContainer.classList.add('shake-anim', 'hit-flash');
    if (arena) arena.classList.add('shake-anim');
    createDamageFloatEffect(heroSpriteContainer, "-10 HP", "text-red-500");
  }, 200);

  setTimeout(() => {
    if (enemySpriteContainer) {
      enemySpriteContainer.classList.remove('enemy-attack-anim');
      enemySpriteContainer.classList.add('sprite-idle');
    }
    if (heroSpriteContainer) heroSpriteContainer.classList.remove('shake-anim', 'hit-flash');
    if (arena) arena.classList.remove('shake-anim');
  }, 550);

  document.getElementById('combatLog').innerText = "💥 PENJAHAT MEMUKUL: -10 HP";

  if (GAME_STATE.playerHp <= 0) {
    stopCombatEngine();
    endGame(false, "Penjahat melumpuhkan pertahanan Anda!");
  }
}

function triggerPlayerAttack() {
  AudioGame.playHit();
  GAME_STATE.enemyHp = Math.max(0, GAME_STATE.enemyHp - 10);
  updateHpBars();

  const heroSpriteContainer = document.getElementById('heroSpriteContainer');
  const enemySpriteContainer = document.getElementById('enemySpriteContainer');
  const sword = document.getElementById('heroSwordG');

  if (heroSpriteContainer) {
    heroSpriteContainer.classList.remove('sprite-idle');
    heroSpriteContainer.classList.add('hero-attack-anim');
  }
  if (sword) sword.style.transform = "rotate(75deg)";

  setTimeout(() => {
    if (enemySpriteContainer) enemySpriteContainer.classList.add('shake-anim', 'hit-flash');
    createDamageFloatEffect(enemySpriteContainer, "-10 HP", "text-emerald-400");
  }, 200);

  setTimeout(() => {
    if (heroSpriteContainer) {
      heroSpriteContainer.classList.remove('hero-attack-anim');
      heroSpriteContainer.classList.add('sprite-idle');
    }
    if (sword) sword.style.transform = "rotate(0deg)";
    if (enemySpriteContainer) enemySpriteContainer.classList.remove('shake-anim', 'hit-flash');
  }, 550);

  document.getElementById('combatLog').innerText = "⚔️ HERO STRIKE: -10 HP";

  if (GAME_STATE.enemyHp <= 0) {
    stopCombatEngine();
    AudioGame.playVictory();
    endGame(true, "Misi Selesai! Penjahat berhasil ditangkap.");
  }
}

function updateHpBars() {
  document.getElementById('playerHpBar').style.width = `${GAME_STATE.playerHp}%`;
  document.getElementById('playerHpText').innerText = `${GAME_STATE.playerHp} HP`;

  document.getElementById('enemyHpBar').style.width = `${GAME_STATE.enemyHp}%`;
  document.getElementById('enemyHpText').innerText = `${GAME_STATE.enemyHp} HP`;
}

function createDamageFloatEffect(targetElement, text, colorClass) {
  const container = document.getElementById('damageOverlay');
  if (!container || !targetElement) return;
  const rect = targetElement.getBoundingClientRect();
  const parentRect = container.getBoundingClientRect();

  const el = document.createElement('div');
  el.className = `absolute font-black text-xs retro-font ${colorClass} damage-text z-50`;
  el.innerText = text;

  el.style.left = `${rect.left - parentRect.left + rect.width / 2 - 10}px`;
  el.style.top = `${rect.top - parentRect.top - 15}px`;

  container.appendChild(el);
  setTimeout(() => el.remove(), 850);
}

function stopCombatEngine() {
  if (GAME_STATE.turnInterval) clearInterval(GAME_STATE.turnInterval);
}

function handleSuccessEvent(word) {
  let points = (GAME_STATE.difficulty === 'EASY') ? 10 : (GAME_STATE.difficulty === 'MEDIUM' ? 15 : 25);
  GAME_STATE.score += points;
  document.getElementById('currentScore').innerText = GAME_STATE.score;

  if (GAME_STATE.mode === 'TURN_BASE') {
    triggerPlayerAttack();
  }
}

function handleBoardClear() {
  if (GAME_STATE.mode === 'TURN_BASE') {
    document.getElementById('combatLog').innerText = "🌟 RE-CONSTRUCTING AREA...";
    setTimeout(() => {
      GAME_STATE.foundWords = [];
      GAME_STATE.words = getRandomWords(GAME_STATE.difficulty);
      buildGridBoard();
    }, 800);
  } else {
    endGame(true, "Hebat! Semua kata rahasia berhasil dipecahkan!");
  }
}

function regenerateBoardBtn() {
  AudioGame.playSelect();
  GAME_STATE.foundWords = [];
  buildGridBoard();
}

function surrenderGame() {
  endGame(false, "Meninggalkan area operasi.");
}

function restartToMenu() {
  document.getElementById('resultModal').classList.add('hidden');
  document.getElementById('gameplayScene').classList.add('hidden');
  document.getElementById('menuScene').classList.remove('hidden');
  document.body.className = "bg-slate-100 text-slate-800 h-[100dvh] w-screen overflow-hidden flex flex-col justify-between pb-safe pt-safe";
}

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

function saveLocalScore(name, score, mode, diff) {
  let scores = localStorage.getItem('localLeaderboard');
  scores = scores ? JSON.parse(scores) : [];
  scores.push({ nama: name, score, mode, difficulty: diff, tanggal: new Date().toLocaleDateString('id-ID') });
  scores.sort((a, b) => b.score - a.score);
  localStorage.setItem('localLeaderboard', JSON.stringify(scores.slice(0, 10)));
}

function toggleLeaderboardModal() {
  AudioGame.playSelect();
  const modal = document.getElementById('leaderboardModal');
  const content = document.getElementById('leaderboardContent');

  if (modal.classList.contains('hidden')) {
    modal.classList.remove('hidden');
    content.innerHTML = '<div class="text-center text-slate-500 py-3 mono-font">CONNECTING SECURE NETWORK...</div>';
    const localScores = localStorage.getItem('localLeaderboard');
    renderScores(localScores ? JSON.parse(localScores) : []);
  } else {
    modal.classList.add('hidden');
  }
}

function renderScores(scores) {
  const content = document.getElementById('leaderboardContent');
  if (!content) return;
  content.innerHTML = '';

  if (!scores || scores.length === 0) {
    content.innerHTML = '<div class="text-center text-slate-500 py-3 mono-font">NO RECORD REGISTERED.</div>';
    return;
  }

  scores.forEach((entry, idx) => {
    const medal = idx === 0 ? "🥇" : (idx === 1 ? "🥈" : (idx === 2 ? "🥉" : `${idx + 1}.`));
    const row = document.createElement('div');
    row.className = "flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-200 hover:bg-slate-100 transition";
    row.innerHTML = `
      <div class="flex items-center space-x-2">
        <span class="font-black text-[11px] text-emerald-500">${medal}</span>
        <div>
          <div class="font-black text-slate-800 text-[10px] mono-font">${entry.nama}</div>
          <div class="text-[7px] text-slate-500 uppercase tracking-widest mono-font">${entry.mode} • ${entry.difficulty}</div>
        </div>
      </div>
      <div class="text-right">
        <div class="font-black text-emerald-600 text-[11px] mono-font">${entry.score} PTS</div>
        <div class="text-[7px] text-slate-500 mono-font">${entry.tanggal}</div>
      </div>
    `;
    content.appendChild(row);
  });
}

function endGame(isVictory, message) {
  if (GAME_STATE.timerInterval) clearInterval(GAME_STATE.timerInterval);
  stopCombatEngine();

  const modal = document.getElementById('resultModal');
  document.getElementById('resultTitle').innerText = isVictory ? "MISSION ACCOMPLISHED" : "OPERATION FAILED";
  document.getElementById('resultText').innerText = message;
  document.getElementById('resultScore').innerText = GAME_STATE.score;
  document.getElementById('resultEmoji').innerText = isVictory ? "🏆" : "💀";
  document.getElementById('resultTime').innerText = (GAME_STATE.mode === "CASUAL" || GAME_STATE.mode === "TURN_BASE") ? "FREE" : formatTime(GAME_STATE.timer);

  saveLocalScore(GAME_STATE.playerName, GAME_STATE.score, GAME_STATE.mode, GAME_STATE.difficulty);
  modal.classList.remove('hidden');
}
