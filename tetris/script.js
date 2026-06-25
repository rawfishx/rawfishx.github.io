/* ═══════════════════════════════════════════════════════════
   TETRIS — GITHUB EDITION
   script.js — Game engine + GitHub API integration
═══════════════════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────────────────────
   CONSTANTS
────────────────────────────────────────────────────────── */
const COLS        = 10;
const ROWS        = 20;
const CELL_MAX    = 30;  // max pixel size per cell
const CELL_MIN    = 18;  // min pixel size per cell
const NEXT_CELLS  = 4;   // preview grid size

/** Points awarded per lines cleared simultaneously */
const SCORE_TABLE = { 1: 100, 2: 300, 3: 500, 4: 800 };

/** Drop interval (ms) at each level (1-indexed) */
function levelInterval(level) {
  return Math.max(80, 800 - (level - 1) * 65);
}

/** GitHub API base */
const GH_API = 'https://api.github.com';

/** Leaderboard repo name (in the token-owner's account) */
const LB_REPO = 'tetris-leaderboard';

/** Leaderboard file path inside the repo */
const LB_FILE = 'leaderboard.json';

/** Max leaderboard entries kept */
const LB_MAX = 50;

/* ──────────────────────────────────────────────────────────
   TETROMINO DEFINITIONS
   Each piece: { shape: [row][col] boolean matrix, color }
────────────────────────────────────────────────────────── */
const PIECES = {
  I: { color: '#00ffe5', shape: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]] },
  O: { color: '#ffe600', shape: [[1,1],[1,1]] },
  T: { color: '#cc00ff', shape: [[0,1,0],[1,1,1],[0,0,0]] },
  S: { color: '#00ff88', shape: [[0,1,1],[1,1,0],[0,0,0]] },
  Z: { color: '#ff3355', shape: [[1,1,0],[0,1,1],[0,0,0]] },
  J: { color: '#3399ff', shape: [[1,0,0],[1,1,1],[0,0,0]] },
  L: { color: '#ff8800', shape: [[0,0,1],[1,1,1],[0,0,0]] },
};

const PIECE_KEYS = Object.keys(PIECES);

/* ──────────────────────────────────────────────────────────
   STATE
────────────────────────────────────────────────────────── */
let state = {
  username:  '',
  token:     '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',
  ghOwner:   '',

  // game
  board:     [],   // ROWS × COLS, each cell = color string or null
  current:   null, // { shape, color, x, y }
  next:      null,
  score:     0,
  highscore: 0,
  level:     1,
  lines:     0,
  status:    'idle', // idle | running | paused | gameover

  dropTimer:    null,
  dropInterval: 800,

  // leaderboard cache
  lbCache: null,
  lbSha:   null,   // SHA of leaderboard.json for GitHub API update
};

/* ──────────────────────────────────────────────────────────
   DOM REFERENCES
────────────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);

const screenLogin   = $('screen-login');
const screenGame    = $('screen-game');
const inputUsername = $('input-username');
const inputToken    = document.createElement('input'); // We'll handle this differently
const chkRemember   = $('chk-remember');
const loginError    = $('login-error');
const btnLogin      = $('btn-login');

const displayUsername  = $('display-username');
const displayScore     = $('display-score');
const displayHighscore = $('display-highscore');
const displayLevel     = $('display-level');
const displayLines     = $('display-lines');

const gameCanvas   = $('game-canvas');
const nextCanvas   = $('next-canvas');
const ctx          = gameCanvas.getContext('2d');
const nctx         = nextCanvas.getContext('2d');

const overlayStart    = $('overlay-start');
const overlayPause    = $('overlay-pause');
const overlayGameover = $('overlay-gameover');
const gameoverScore   = $('gameover-score');
const gameoverStatus  = $('gameover-save-status');
const btnRestart      = $('btn-restart');

const btnLeaderboard  = $('btn-leaderboard');
const btnLogout       = $('btn-logout');

const modalLb         = $('modal-leaderboard');
const modalBackdrop   = $('modal-backdrop');
const lbLoading       = $('lb-loading');
const lbError         = $('lb-error');
const lbTable         = $('lb-table');
const lbTbody         = $('lb-tbody');
const btnCloseLb      = $('btn-close-lb');
const btnRefreshLb    = $('btn-refresh-lb');

const touchControls   = $('touch-controls');
const toast           = $('toast');


/* ──────────────────────────────────────────────────────────
   CANVAS SIZING
────────────────────────────────────────────────────────── */
let CELL = CELL_MAX; // pixels per cell, set by resize()

function resize() {
  const topbarH   = 44;
  const touchH    = touchControls.offsetParent && getComputedStyle(touchControls).display !== 'none'
                      ? touchControls.offsetHeight : 0;
  const availH    = window.innerHeight - topbarH - touchH - 28;
  const availW    = window.innerWidth - 200; // rough side panel space
  const cellByH   = Math.floor(availH / ROWS);
  const cellByW   = Math.floor(availW / COLS);
  CELL = Math.min(CELL_MAX, Math.max(CELL_MIN, Math.min(cellByH, cellByW)));

  gameCanvas.width  = COLS * CELL;
  gameCanvas.height = ROWS * CELL;

  const nextCell = Math.floor(CELL * 0.8);
  nextCanvas.width  = NEXT_CELLS * nextCell;
  nextCanvas.height = NEXT_CELLS * nextCell;
  nextCanvas._cell  = nextCell;

  if (state.status !== 'idle') draw();
}

/* ──────────────────────────────────────────────────────────
   UTILITIES
────────────────────────────────────────────────────────── */

/** Rotate a 2-D matrix 90° clockwise */
function rotateMatrix(mat) {
  const n = mat.length;
  return mat.map((row, r) => row.map((_, c) => mat[n - 1 - c][r]));
}

/** Deep-copy a 2-D array */
function copyBoard(b) { return b.map(r => [...r]); }

/** Create empty board */
function emptyBoard() { return Array.from({ length: ROWS }, () => Array(COLS).fill(null)); }

/** Pick a random piece key */
function randomPiece() {
  const key = PIECE_KEYS[Math.floor(Math.random() * PIECE_KEYS.length)];
  const def = PIECES[key];
  return {
    shape: def.shape.map(r => [...r]),
    color: def.color,
    x: Math.floor((COLS - def.shape[0].length) / 2),
    y: 0,
  };
}

/* ──────────────────────────────────────────────────────────
   COLLISION DETECTION
────────────────────────────────────────────────────────── */
function collides(board, piece, dx = 0, dy = 0, shape = null) {
  const s = shape || piece.shape;
  for (let r = 0; r < s.length; r++) {
    for (let c = 0; c < s[r].length; c++) {
      if (!s[r][c]) continue;
      const nx = piece.x + c + dx;
      const ny = piece.y + r + dy;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny < 0) continue; // above board is OK
      if (board[ny][nx]) return true;
    }
  }
  return false;
}

/* ──────────────────────────────────────────────────────────
   GHOST PIECE (shadow)
────────────────────────────────────────────────────────── */
function ghostY() {
  let dy = 0;
  while (!collides(state.board, state.current, 0, dy + 1)) dy++;
  return state.current.y + dy;
}

/* ──────────────────────────────────────────────────────────
   DRAWING
────────────────────────────────────────────────────────── */
const BG_COLOR    = '#0a0a0f';
const GRID_COLOR  = '#16162a';

function drawCell(context, x, y, color, cellSize) {
  const px = x * cellSize;
  const py = y * cellSize;

  if (!color) {
    // empty cell — subtle grid square
    context.fillStyle = GRID_COLOR;
    context.fillRect(px + 1, py + 1, cellSize - 2, cellSize - 2);
    return;
  }

  // Filled cell: base + highlight + shadow
  context.fillStyle = color;
  context.fillRect(px + 1, py + 1, cellSize - 2, cellSize - 2);

  // Light bevel (top/left)
  context.fillStyle = 'rgba(255,255,255,0.28)';
  context.fillRect(px + 1, py + 1, cellSize - 2, 3);
  context.fillRect(px + 1, py + 1, 3, cellSize - 2);

  // Dark bevel (bottom/right)
  context.fillStyle = 'rgba(0,0,0,0.4)';
  context.fillRect(px + 1, py + cellSize - 4, cellSize - 2, 3);
  context.fillRect(px + cellSize - 4, py + 1, 3, cellSize - 2);
}

function draw() {
  const w = gameCanvas.width;
  const h = gameCanvas.height;

  // Background
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, w, h);

  // Draw board
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      drawCell(ctx, c, r, state.board[r][c], CELL);
    }
  }

  if (state.current) {
    // Ghost piece
    const gy = ghostY();
    if (gy !== state.current.y) {
      const { shape, x } = state.current;
      ctx.globalAlpha = 0.2;
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c]) {
            drawCell(ctx, x + c, gy + r, state.current.color, CELL);
          }
        }
      }
      ctx.globalAlpha = 1;
    }

    // Current piece
    const { shape, color, x, y } = state.current;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] && y + r >= 0) {
          drawCell(ctx, x + c, y + r, color, CELL);
        }
      }
    }
  }
}

function drawNext() {
  const cellSize = nextCanvas._cell || 22;
  const w = nextCanvas.width;
  const h = nextCanvas.height;

  nctx.fillStyle = '#0e0e1a';
  nctx.fillRect(0, 0, w, h);

  if (!state.next) return;

  const { shape, color } = state.next;
  const offsetX = Math.floor((NEXT_CELLS - shape[0].length) / 2);
  const offsetY = Math.floor((NEXT_CELLS - shape.length) / 2);

  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        drawCell(nctx, offsetX + c, offsetY + r, color, cellSize);
      }
    }
  }
}

/* ──────────────────────────────────────────────────────────
   GAME MECHANICS
────────────────────────────────────────────────────────── */

function spawnPiece() {
  state.current = state.next || randomPiece();
  state.next    = randomPiece();
  drawNext();

  // Game over condition: new piece immediately collides
  if (collides(state.board, state.current)) {
    endGame();
  }
}

function lockPiece() {
  const { shape, color, x, y } = state.current;
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        const ny = y + r;
        if (ny >= 0) state.board[ny][x + c] = color;
      }
    }
  }
  clearLines();
  spawnPiece();
}

function clearLines() {
  const full = [];
  for (let r = ROWS - 1; r >= 0; r--) {
    if (state.board[r].every(cell => cell !== null)) full.push(r);
  }
  if (!full.length) return;

  // Remove full rows (sort descending to remove correctly)
  full.sort((a, b) => b - a);
  full.forEach(r => state.board.splice(r, 1));
  // Add empty rows at top
  while (state.board.length < ROWS) state.board.unshift(Array(COLS).fill(null));

  // Update score
  const pts = SCORE_TABLE[full.length] || full.length * 100;
  state.score += pts;
  state.lines  += full.length;
  state.level   = Math.floor(state.lines / 10) + 1;
  state.dropInterval = levelInterval(state.level);

  updateHUD();
  restartDropTimer();
}

function moveLeft()  { if (!collides(state.board, state.current, -1, 0)) { state.current.x--; draw(); } }
function moveRight() { if (!collides(state.board, state.current,  1, 0)) { state.current.x++; draw(); } }

function softDrop() {
  if (!collides(state.board, state.current, 0, 1)) {
    state.current.y++;
    draw();
    restartDropTimer();
  } else {
    lockPiece();
    draw();
  }
}

function hardDrop() {
  while (!collides(state.board, state.current, 0, 1)) {
    state.current.y++;
  }
  lockPiece();
  draw();
}

function rotate() {
  const rotated = rotateMatrix(state.current.shape);
  // Wall-kick: try offsets 0, -1, +1, -2, +2
  const kicks = [0, -1, 1, -2, 2];
  for (const kick of kicks) {
    if (!collides(state.board, state.current, kick, 0, rotated)) {
      state.current.shape = rotated;
      state.current.x += kick;
      draw();
      return;
    }
  }
}

/* ──────────────────────────────────────────────────────────
   GAME FLOW
────────────────────────────────────────────────────────── */

function startGame() {
  state.board    = emptyBoard();
  state.score    = 0;
  state.lines    = 0;
  state.level    = 1;
  state.dropInterval = levelInterval(1);
  state.status   = 'running';
  state.current  = null;
  state.next     = null;

  overlayStart.classList.remove('active');
  overlayPause.classList.remove('active');
  overlayGameover.classList.remove('active');

  updateHUD();
  spawnPiece();
  draw();
  restartDropTimer();
}

function togglePause() {
  if (state.status === 'running') {
    state.status = 'paused';
    clearInterval(state.dropTimer);
    overlayPause.classList.add('active');
  } else if (state.status === 'paused') {
    state.status = 'running';
    overlayPause.classList.remove('active');
    restartDropTimer();
  }
}

function endGame() {
  state.status = 'gameover';
  clearInterval(state.dropTimer);

  // Update local highscore
  if (state.score > state.highscore) {
    state.highscore = state.score;
    localStorage.setItem(`tetris_hs_${state.username}`, state.highscore);
    updateHUD();
  }

  gameoverScore.textContent = `SKOR: ${state.score}`;
  gameoverStatus.textContent = '';
  overlayGameover.classList.add('active');

  // Save to GitHub if it's a new personal best
  saveScoreIfBetter();
}

function restartDropTimer() {
  clearInterval(state.dropTimer);
  if (state.status !== 'running') return;
  state.dropTimer = setInterval(() => {
    if (state.status !== 'running') return;
    if (!collides(state.board, state.current, 0, 1)) {
      state.current.y++;
      draw();
    } else {
      lockPiece();
      draw();
    }
  }, state.dropInterval);
}

function updateHUD() {
  displayScore.textContent     = state.score;
  displayHighscore.textContent = state.highscore;
  displayLevel.textContent     = state.level;
  displayLines.textContent     = state.lines;
}

/* ──────────────────────────────────────────────────────────
   KEYBOARD INPUT
────────────────────────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (screenGame.style.display === 'none' && !screenGame.classList.contains('active')) return;

  // Start game from idle
  if (state.status === 'idle' && (e.code === 'Space' || e.code === 'ArrowDown')) {
    e.preventDefault();
    startGame(); 
    return;
  }
  if (state.status === 'gameover') {
    // Allow restart with Space
    if (e.code === 'Space') {
      e.preventDefault();
      startGame();
    }
    return;
  }

  switch (e.code) {
    case 'ArrowLeft':  e.preventDefault(); if (state.status === 'running') moveLeft();   break;
    case 'ArrowRight': e.preventDefault(); if (state.status === 'running') moveRight();  break;
    case 'ArrowDown':  e.preventDefault(); if (state.status === 'running') softDrop();   break;
    case 'ArrowUp':    e.preventDefault(); if (state.status === 'running') rotate();     break;
    case 'Space':      e.preventDefault(); if (state.status === 'running') hardDrop();   break;
    case 'KeyP':                            togglePause();                                break;
  }
});

/* ──────────────────────────────────────────────────────────
   TOUCH / MOBILE CONTROLS
────────────────────────────────────────────────────────── */

/** Show touch controls on touch-capable devices */
function initTouchControls() {
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (hasTouch) {
    touchControls.style.display = 'flex';
    setTimeout(resize, 50);
  }
}

/** Bind touch buttons with repeat for hold */
function bindTouchBtn(btn, action) {
  let holdTimer = null;
  let holdInterval = null;

  function doAction() {
    if (state.status === 'idle') { startGame(); return; }
    if (state.status !== 'running') return;
    switch (action) {
      case 'left':      moveLeft();   break;
      case 'right':     moveRight();  break;
      case 'rotate':    rotate();     break;
      case 'softdrop':  softDrop();   break;
      case 'harddrop':  hardDrop();   break;
    }
  }

  function startHold(e) {
    if (e) e.preventDefault();
    btn.classList.add('pressed');
    doAction();
    if (action === 'left' || action === 'right' || action === 'softdrop') {
      holdTimer = setTimeout(() => {
        holdInterval = setInterval(doAction, 60);
      }, 200);
    }
  }

  function endHold(e) {
    if (e) e.preventDefault();
    btn.classList.remove('pressed');
    clearTimeout(holdTimer);
    clearInterval(holdInterval);
  }

  btn.addEventListener('touchstart',  startHold, { passive: false });
  btn.addEventListener('touchend',    endHold, { passive: false });
  btn.addEventListener('touchcancel', endHold, { passive: false });
  // Fallback for mouse
  btn.addEventListener('mousedown',  startHold);
  btn.addEventListener('mouseup',    endHold);
  btn.addEventListener('mouseleave', endHold);
}

['tc-left', 'tc-right', 'tc-rotate', 'tc-down', 'tc-drop'].forEach(id => {
  const el = $(id);
  if (el) bindTouchBtn(el, el.dataset.action);
});

/* ──────────────────────────────────────────────────────────
   LOGIN / LOGOUT
────────────────────────────────────────────────────────── */

/** Show / hide login error */
function showLoginError(msg) {
  loginError.textContent = msg;
  loginError.classList.remove('hidden');
}
function clearLoginError() {
  loginError.textContent = '';
  loginError.classList.add('hidden');
}

/** Restore saved credentials */
function restoreSaved() {
  const savedToken    = localStorage.getItem('tetris_gh_token');
  const savedUsername = localStorage.getItem('tetris_gh_username');
  if (savedToken) {
    // We'll use the token from localStorage
    state.token = savedToken;
  }
  if (savedUsername) inputUsername.value = savedUsername;
}

/** Validate token & resolve GitHub username */
async function resolveGhUser(token) {
  const res = await fetch(`${GH_API}/user`, {
    headers: { Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28' },
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('Token tidak valid atau sudah expired.');
    throw new Error(`GitHub API error: ${res.status}`);
  }
  const data = await res.json();
  return data.login; // GitHub username of the token owner
}

btnLogin.addEventListener('click', handleLogin);

inputUsername.addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(); });

async function handleLogin() {
  clearLoginError();

  const username = inputUsername.value.trim();
  const token = state.token;

  if (username.length < 3) { showLoginError('Username minimal 3 karakter.'); return; }

  btnLogin.disabled = true;
  btnLogin.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Memverifikasi...';

  try {
    const ghLogin = await resolveGhUser(token);

    // Save if checked
    if (chkRemember.checked) {
      localStorage.setItem('tetris_gh_token',    token);
      localStorage.setItem('tetris_gh_username', username);
    } else {
      localStorage.removeItem('tetris_gh_token');
      localStorage.removeItem('tetris_gh_username');
    }

    // Set state
    state.username = username;
    state.token    = token;
    state.ghOwner  = ghLogin;
    state.highscore = parseInt(localStorage.getItem(`tetris_hs_${username}`) || '0', 10);

    // Switch screen
    displayUsername.textContent = username;
    updateHUD();
    switchScreen('game');
    resize();
    initTouchControls();

    // Pre-fetch leaderboard in background
    fetchLeaderboard(false);

  } catch (err) {
    showLoginError(err.message);
  } finally {
    btnLogin.disabled = false;
    btnLogin.innerHTML = '<i class="fa fa-play"></i> LOGIN &amp; PLAY';
  }
}

btnLogout.addEventListener('click', () => {
  clearInterval(state.dropTimer);
  state.status   = 'idle';
  state.username = '';
  state.token    = '';
  state.ghOwner  = '';
  state.lbCache  = null;
  state.lbSha    = null;
  switchScreen('login');
});

/* ──────────────────────────────────────────────────────────
   SCREEN SWITCHER
────────────────────────────────────────────────────────── */
function switchScreen(name) {
  screenLogin.classList.toggle('active', name === 'login');
  screenGame.classList.toggle('active',  name === 'game');
}

/* ──────────────────────────────────────────────────────────
   GITHUB API — LEADERBOARD
────────────────────────────────────────────────────────── */

/** Build Authorization headers */
function ghHeaders() {
  return {
    Authorization:         `Bearer ${state.token}`,
    Accept:                'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

/**
 * Fetch leaderboard.json from GitHub.
 * @param {boolean} showUI - Whether to update the modal UI.
 * @returns {{ players: Array, sha: string } | null}
 */
async function fetchLeaderboard(showUI = true) {
  if (showUI) {
    lbLoading.classList.remove('hidden');
    lbError.classList.add('hidden');
    lbTable.classList.add('hidden');
  }

  try {
    const url = `${GH_API}/repos/${state.ghOwner}/${LB_REPO}/contents/${LB_FILE}`;
    const res = await fetch(url, { headers: ghHeaders() });

    if (res.status === 404) {
      // File / repo doesn't exist yet — treat as empty
      state.lbCache = { players: [] };
      state.lbSha   = null;
      if (showUI) renderLeaderboard([]);
      return state.lbCache;
    }

    if (res.status === 403) {
      const body = await res.json();
      if (body.message && body.message.includes('rate limit')) {
        throw new Error('GitHub API rate limit tercapai. Coba beberapa menit lagi.');
      }
      throw new Error('Akses ditolak. Periksa scope token (butuh: repo).');
    }

    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

    const data = await res.json();
    state.lbSha = data.sha;

    // Content is base64-encoded
    const json = JSON.parse(atob(data.content.replace(/\n/g, '')));
    state.lbCache = json;

    if (showUI) renderLeaderboard(json.players || []);
    return json;

  } catch (err) {
    if (showUI) {
      lbLoading.classList.add('hidden');
      lbError.textContent = err.message;
      lbError.classList.remove('hidden');
    }
    return null;
  }
}

/** Render the leaderboard table */
function renderLeaderboard(players) {
  lbLoading.classList.add('hidden');
  lbError.classList.add('hidden');

  if (!players.length) {
    lbError.textContent = 'Belum ada skor. Jadilah yang pertama!';
    lbError.classList.remove('hidden');
    lbTable.classList.add('hidden');
    return;
  }

  lbTbody.innerHTML = '';
  players.forEach((p, i) => {
    const tr = document.createElement('tr');
    if (p.username === state.username) tr.classList.add('lb-me');

    const date = p.date ? new Date(p.date).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: '2-digit',
    }) : '—';

    const medals = ['🥇', '🥈', '🥉'];
    const rank   = i < 3 ? medals[i] : `#${i + 1}`;

    tr.innerHTML = `
      <td>${rank}</td>
      <td>${escapeHtml(p.username)}</td>
      <td>${p.score.toLocaleString()}</td>
      <td>${date}</td>
    `;
    lbTbody.appendChild(tr);
  });

  lbTable.classList.remove('hidden');
}

/**
 * Save or update the player's score in leaderboard.json.
 * Only runs if current score beats existing entry.
 */
async function saveScoreIfBetter() {
  if (!state.token || !state.ghOwner) return;

  // Get latest leaderboard (to compare and get fresh SHA)
  let lbData = null;
  try {
    lbData = await fetchLeaderboard(false);
  } catch (_) { /* swallowed */ }

  const players = (lbData && lbData.players) ? lbData.players : [];

  // Find existing entry for this username
  const existing = players.find(p => p.username === state.username);
  if (existing && existing.score >= state.score) {
    // No improvement
    gameoverStatus.textContent = `Skor tersimpan sebelumnya: ${existing.score}`;
    return;
  }

  // Update or insert
  if (existing) {
    existing.score = state.score;
    existing.date  = new Date().toISOString();
  } else {
    players.push({
      username: state.username,
      score:    state.score,
      date:     new Date().toISOString(),
    });
  }

  // Sort descending, keep top LB_MAX
  players.sort((a, b) => b.score - a.score);
  const trimmed = players.slice(0, LB_MAX);

  // Also save to localStorage highscore
  localStorage.setItem(`tetris_hs_${state.username}`, state.score);

  try {
    await commitLeaderboard(trimmed);
    gameoverStatus.textContent = '✓ Skor berhasil disimpan ke GitHub!';
  } catch (err) {
    gameoverStatus.textContent = `⚠ Gagal simpan: ${err.message}`;
  }
}

/**
 * Commit updated leaderboard.json to GitHub.
 * Handles SHA conflict by retrying once.
 */
async function commitLeaderboard(players, retryCount = 0) {
  const content = JSON.stringify({ players }, null, 2);
  const encoded = btoa(unescape(encodeURIComponent(content))); // handle UTF-8

  const url = `${GH_API}/repos/${state.ghOwner}/${LB_REPO}/contents/${LB_FILE}`;

  const body = {
    message: `feat: update leaderboard — ${state.username} scored ${state.score}`,
    content: encoded,
    ...(state.lbSha ? { sha: state.lbSha } : {}),
  };

  const res = await fetch(url, {
    method:  'PUT',
    headers: { ...ghHeaders(), 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });

  if (res.ok) {
    const data = await res.json();
    state.lbSha   = data.content.sha;
    state.lbCache = { players };
    return;
  }

  // SHA conflict: fetch fresh SHA and retry once
  if (res.status === 409 && retryCount < 2) {
    await fetchLeaderboard(false);
    return commitLeaderboard(players, retryCount + 1);
  }

  const errData = await res.json().catch(() => ({}));

  if (res.status === 404) {
    throw new Error(`Repo '${state.ghOwner}/${LB_REPO}' tidak ditemukan. Buat repo tersebut di GitHub terlebih dahulu.`);
  }
  if (res.status === 403) {
    throw new Error('Token tidak memiliki izin. Pastikan scope "repo" aktif.');
  }

  throw new Error(errData.message || `HTTP ${res.status}`);
}

/* ──────────────────────────────────────────────────────────
   LEADERBOARD MODAL UI
────────────────────────────────────────────────────────── */
btnLeaderboard.addEventListener('click', openLeaderboard);
btnCloseLb.addEventListener('click',     closeLeaderboard);
modalBackdrop.addEventListener('click',  closeLeaderboard);
btnRefreshLb.addEventListener('click',   () => fetchLeaderboard(true));

function openLeaderboard() {
  // Pause if running
  if (state.status === 'running') togglePause();

  modalLb.classList.remove('hidden');

  // Use cache for instant display, then refresh
  if (state.lbCache) {
    renderLeaderboard(state.lbCache.players || []);
  } else {
    lbLoading.classList.remove('hidden');
    lbError.classList.add('hidden');
    lbTable.classList.add('hidden');
  }

  fetchLeaderboard(true);
}

function closeLeaderboard() {
  modalLb.classList.add('hidden');
}

/* ──────────────────────────────────────────────────────────
   RESTART BUTTON
────────────────────────────────────────────────────────── */
btnRestart.addEventListener('click', startGame);

/* ──────────────────────────────────────────────────────────
   TOAST NOTIFICATIONS
────────────────────────────────────────────────────────── */
let toastTimer = null;

function showToast(msg, type = '', duration = 3000) {
  toast.textContent = msg;
  toast.className   = `toast show ${type ? `toast-${type}` : ''}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

/* ──────────────────────────────────────────────────────────
   HTML ESCAPING
────────────────────────────────────────────────────────── */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ──────────────────────────────────────────────────────────
   WINDOW RESIZE
────────────────────────────────────────────────────────── */
window.addEventListener('resize', resize);

/* ──────────────────────────────────────────────────────────
   PREVENT DEFAULT SCROLL ON GAME KEYS
────────────────────────────────────────────────────────── */
window.addEventListener('keydown', e => {
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) {
    if (screenGame.classList.contains('active')) e.preventDefault();
  }
}, { passive: false });

/* ──────────────────────────────────────────────────────────
   INIT
────────────────────────────────────────────────────────── */
(function init() {
  // Set initial token from localStorage if available
  const savedToken = localStorage.getItem('tetris_gh_token');
  if (savedToken) {
    state.token = savedToken;
  }
  
  restoreSaved();
  resize();

  // If we have saved credentials, attempt auto-restore
  const savedToken2 = localStorage.getItem('tetris_gh_token');
  const savedUsername = localStorage.getItem('tetris_gh_username');
  if (savedToken2 && savedUsername) {
    // Attempt silent login
    (async () => {
      try {
        const ghLogin = await resolveGhUser(savedToken2);
        state.username  = savedUsername;
        state.token     = savedToken2;
        state.ghOwner   = ghLogin;
        state.highscore = parseInt(localStorage.getItem(`tetris_hs_${savedUsername}`) || '0', 10);
        displayUsername.textContent = savedUsername;
        updateHUD();
        switchScreen('game');
        resize();
        initTouchControls();
        fetchLeaderboard(false);
      } catch (_) {
        // Token expired / invalid — stay on login screen
        console.log('Auto-login failed, staying on login screen');
      }
    })();
  }
})();