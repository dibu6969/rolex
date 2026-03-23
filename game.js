// ===== GAME STATE =====
let state = {
  score: 0,
  streak: 0,
  currentModule: null,
  cards: [],
  cardIndex: 0,
  quizQuestions: [],
  quizIndex: 0,
  quizCorrect: 0,
  quizScore: 0,
  quizStreak: 0,
  priceList: [],
  priceIndex: 0,
  priceCorrect: 0,
  lastModule: null
};

const LEVELS = [
  { min: 0,    label: 'Novice' },
  { min: 50,   label: 'Apprentice' },
  { min: 150,  label: 'Enthusiast' },
  { min: 300,  label: 'Collector' },
  { min: 500,  label: 'Connoisseur' },
  { min: 800,  label: 'Expert' },
  { min: 1200, label: 'Rolex Master' }
];

// ===== UTILITIES =====
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getLevel(score) {
  let level = LEVELS[0].label;
  for (const l of LEVELS) {
    if (score >= l.min) level = l.label;
  }
  return level;
}

function updateScorebar() {
  document.getElementById('score-display').textContent = state.score;
  document.getElementById('streak-display').textContent = state.streak;
  document.getElementById('level-display').textContent = getLevel(state.score);
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function showMenu() {
  showScreen('menu');
}

// ===== FLASHCARD MODE =====
function startFlashcards(moduleKey) {
  let cards;
  let title;
  if (!moduleKey) {
    cards = shuffle(ALL_FLASHCARDS);
    title = 'All Topics';
  } else {
    cards = shuffle(DATA[moduleKey]);
    title = { families:'Watch Families', nicknames:'Nicknames', parts:'Watch Anatomy', bands:'Bracelets & Bands', bezels:'Bezel Styles' }[moduleKey];
  }
  state.cards = cards;
  state.cardIndex = 0;

  document.getElementById('fc-module-title').textContent = '📚 ' + title;
  showScreen('flashcard-screen');
  renderCard();
}

function renderCard() {
  const card = state.cards[state.cardIndex];
  const total = state.cards.length;

  document.getElementById('fc-counter').textContent = `${state.cardIndex + 1} / ${total}`;
  document.getElementById('fc-label').textContent = card.category || '';
  document.getElementById('fc-question').textContent = card.question;
  document.getElementById('fc-answer').textContent = card.answer;
  document.getElementById('fc-detail').textContent = card.detail || '';

  const fc = document.getElementById('flashcard');
  fc.classList.remove('flipped');

  const pct = ((state.cardIndex + 1) / total) * 100;
  document.getElementById('fc-progress-fill').style.width = pct + '%';
}

function flipCard() {
  document.getElementById('flashcard').classList.toggle('flipped');
}

function nextCard() {
  if (state.cardIndex < state.cards.length - 1) {
    state.cardIndex++;
    renderCard();
  } else {
    showMenu();
  }
}

function prevCard() {
  if (state.cardIndex > 0) {
    state.cardIndex--;
    renderCard();
  }
}

// ===== MODULE ENTRY POINT =====
function startModule(moduleKey) {
  state.lastModule = moduleKey;
  if (moduleKey === 'prices') {
    startPriceGame();
  } else {
    startQuiz(moduleKey);
  }
}

// ===== QUIZ MODE =====
function startQuiz(moduleKey) {
  let questions;
  let title;

  if (moduleKey === 'mixed') {
    // Pull from all non-price modules
    const pool = [
      ...DATA.families, ...DATA.nicknames,
      ...DATA.parts, ...DATA.bands, ...DATA.bezels
    ];
    questions = shuffle(pool).slice(0, 12);
    title = 'Mixed Challenge';
  } else {
    questions = shuffle(DATA[moduleKey]);
    title = { families:'Watch Families', nicknames:'Nicknames', parts:'Watch Anatomy', bands:'Bracelets & Bands', bezels:'Bezel Styles' }[moduleKey];
  }

  state.quizQuestions = questions;
  state.quizIndex = 0;
  state.quizCorrect = 0;
  state.quizScore = 0;
  state.quizStreak = 0;

  document.getElementById('quiz-title').textContent = '⌚ ' + title;
  showScreen('quiz-screen');
  renderQuestion();
}

function startMixedQuiz() {
  state.lastModule = 'mixed';
  startQuiz('mixed');
}

function renderQuestion() {
  const q = state.quizQuestions[state.quizIndex];
  const total = state.quizQuestions.length;

  document.getElementById('quiz-counter').textContent = `Q ${state.quizIndex + 1}/${total}`;
  document.getElementById('quiz-category').textContent = q.category || '';
  document.getElementById('quiz-question').textContent = q.question;
  document.getElementById('quiz-feedback').textContent = '';
  document.getElementById('quiz-feedback').className = 'quiz-feedback';
  document.getElementById('next-q-btn').classList.add('hidden');
  document.getElementById('quiz-score').textContent = state.quizScore;
  document.getElementById('quiz-streak').textContent = state.quizStreak;

  const pct = (state.quizIndex / total) * 100;
  document.getElementById('quiz-progress-fill').style.width = pct + '%';

  // Build wrong answers from the same dataset
  const allAnswers = getAllAnswers(q);
  const wrongs = shuffle(allAnswers.filter(a => a !== q.answer)).slice(0, 3);
  const options = shuffle([q.answer, ...wrongs]);

  const optContainer = document.getElementById('quiz-options');
  optContainer.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.onclick = () => selectAnswer(btn, opt, q);
    optContainer.appendChild(btn);
  });
}

function getAllAnswers(currentQ) {
  const pool = [
    ...DATA.families, ...DATA.nicknames,
    ...DATA.parts, ...DATA.bands, ...DATA.bezels
  ];
  return pool.map(q => q.answer).filter((v, i, a) => a.indexOf(v) === i);
}

function selectAnswer(btn, chosen, q) {
  const allBtns = document.querySelectorAll('.option-btn');
  allBtns.forEach(b => {
    b.disabled = true;
    if (b.textContent === q.answer) b.classList.add('correct');
  });

  const feedback = document.getElementById('quiz-feedback');

  if (chosen === q.answer) {
    btn.classList.add('correct');
    state.quizStreak++;
    state.quizCorrect++;
    const bonus = state.quizStreak >= 3 ? 20 : 10;
    state.quizScore += bonus;
    state.score += bonus;
    state.streak++;
    feedback.className = 'quiz-feedback correct';
    const streakMsg = state.quizStreak >= 3 ? ` 🔥 ${state.quizStreak}-streak bonus!` : '';
    feedback.textContent = `✓ Correct!${streakMsg} — ${q.detail}`;
  } else {
    btn.classList.add('wrong');
    state.quizStreak = 0;
    state.streak = 0;
    feedback.className = 'quiz-feedback wrong';
    feedback.textContent = `✗ The answer is "${q.answer}" — ${q.detail}`;
  }

  document.getElementById('quiz-score').textContent = state.quizScore;
  document.getElementById('quiz-streak').textContent = state.quizStreak;
  document.getElementById('next-q-btn').classList.remove('hidden');
  updateScorebar();
}

function nextQuestion() {
  state.quizIndex++;
  if (state.quizIndex >= state.quizQuestions.length) {
    showResults('quiz');
  } else {
    renderQuestion();
  }
}

// ===== PRICE GAME =====
function startPriceGame() {
  state.priceList = shuffle(DATA.prices);
  state.priceIndex = 0;
  state.priceCorrect = 0;
  state.quizScore = 0;
  state.quizStreak = 0;
  showScreen('price-screen');
  renderPrice();
}

function renderPrice() {
  const item = state.priceList[state.priceIndex];
  const total = state.priceList.length;

  document.getElementById('price-counter').textContent = `${state.priceIndex + 1}/${total}`;
  document.getElementById('price-emoji').textContent = item.emoji;
  document.getElementById('price-watch-name').textContent = item.name;
  document.getElementById('price-watch-desc').textContent = item.desc;

  const reveal = document.getElementById('price-reveal');
  reveal.textContent = '???';
  reveal.className = 'hidden-price';

  document.getElementById('price-feedback').textContent = '';
  document.getElementById('price-feedback').className = 'price-feedback';
  document.getElementById('next-price-btn').classList.add('hidden');

  const pct = (state.priceIndex / total) * 100;
  document.getElementById('price-progress-fill').style.width = pct + '%';

  const opts = shuffle(item.options);
  const container = document.getElementById('price-options');
  container.innerHTML = '';
  opts.forEach(price => {
    const btn = document.createElement('button');
    btn.className = 'price-btn';
    btn.textContent = '$' + price.toLocaleString();
    btn.onclick = () => selectPrice(btn, price, item);
    container.appendChild(btn);
  });
}

function selectPrice(btn, chosen, item) {
  const allBtns = document.querySelectorAll('.price-btn');
  allBtns.forEach(b => {
    b.disabled = true;
    if (parseInt(b.textContent.replace(/[$,]/g, '')) === item.price) {
      b.classList.add('correct');
    }
  });

  const reveal = document.getElementById('price-reveal');
  reveal.textContent = '$' + item.price.toLocaleString();
  reveal.className = 'revealed-price';

  const feedback = document.getElementById('price-feedback');

  if (chosen === item.price) {
    btn.classList.add('correct');
    state.priceCorrect++;
    state.quizStreak++;
    state.quizScore += 15;
    state.score += 15;
    state.streak++;
    feedback.className = 'price-feedback correct';
    feedback.textContent = `✓ Correct! The ${item.name} retails for $${item.price.toLocaleString()}.`;
  } else {
    btn.classList.add('wrong');
    state.quizStreak = 0;
    state.streak = 0;
    const diff = chosen > item.price ? 'too high' : 'too low';
    feedback.className = 'price-feedback wrong';
    feedback.textContent = `✗ Too ${diff}. The actual retail price is $${item.price.toLocaleString()}.`;
  }

  updateScorebar();
  document.getElementById('next-price-btn').classList.remove('hidden');
}

function nextPrice() {
  state.priceIndex++;
  if (state.priceIndex >= state.priceList.length) {
    showResults('price');
  } else {
    renderPrice();
  }
}

// ===== RESULTS =====
function showResults(type) {
  let correct, total, scoreEarned;

  if (type === 'quiz') {
    correct = state.quizCorrect;
    total = state.quizQuestions.length;
    scoreEarned = state.quizScore;
  } else {
    correct = state.priceCorrect;
    total = state.priceList.length;
    scoreEarned = state.quizScore;
  }

  const pct = Math.round((correct / total) * 100);

  let grade, message;
  if (pct === 100) {
    grade = '🏆 Perfect!';
    message = 'Flawless. You have the knowledge of a true Rolex connoisseur.';
  } else if (pct >= 80) {
    grade = '⭐ Excellent';
    message = 'Very impressive. You clearly know your Rolexes well.';
  } else if (pct >= 60) {
    grade = '👍 Good Job';
    message = 'Solid effort. Review the ones you missed and try again.';
  } else if (pct >= 40) {
    grade = '📚 Keep Studying';
    message = 'Getting there! Use the flashcard mode to reinforce your knowledge.';
  } else {
    grade = '⌚ Just Starting';
    message = 'Every collector starts somewhere. Study the flashcards and come back!';
  }

  document.getElementById('results-title').textContent = type === 'price' ? 'Price Game Complete!' : 'Round Complete!';
  document.getElementById('results-score').textContent = pct + '%';
  document.getElementById('results-grade').textContent = grade;
  document.getElementById('results-message').textContent = message;
  document.getElementById('results-stats').innerHTML = `
    <div><strong>${correct}</strong> Correct</div>
    <div><strong>${total - correct}</strong> Missed</div>
    <div><strong>+${scoreEarned}</strong> Points</div>
    <div><strong>${state.score}</strong> Total</div>
  `;

  showScreen('results-screen');
}

function retryModule() {
  if (state.lastModule) {
    startModule(state.lastModule);
  } else {
    showMenu();
  }
}

// Init
updateScorebar();
