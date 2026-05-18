let ALL_QUESTIONS = [];
let currentQuestions = [];
let currentIndex = 0;
let score = 0;
let answered = false;
let wrongQuestions = [];
let catScores = {};

const catNames = { er: 'ER & Relmod', sql: 'SQL', norm: 'Normalisering', all: 'Alt blandet' };

// Load questions from qs.json on page load
fetch('qs.json')
  .then(r => r.json())
  .then(data => { ALL_QUESTIONS = data; })
  .catch(err => console.error('Kunne ikke laste spørsmål:', err));

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startCategory(cat) {
  const qs = cat === 'all' ? ALL_QUESTIONS : ALL_QUESTIONS.filter(q => q.cat === cat);
  startQuiz(shuffle(qs));
}

function startAll() { startQuiz(shuffle(ALL_QUESTIONS)); }

function startRandom(n) { startQuiz(shuffle(ALL_QUESTIONS).slice(0, n)); }

function retryWrong() {
  if (wrongQuestions.length === 0) { showStart(); return; }
  startQuiz(shuffle(wrongQuestions));
}

function startQuiz(qs) {
  currentQuestions = qs;
  currentIndex = 0;
  score = 0;
  wrongQuestions = [];
  catScores = { er: { c: 0, t: 0 }, sql: { c: 0, t: 0 }, norm: { c: 0, t: 0 } };
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('result-screen').style.display = 'none';
  document.getElementById('quiz-screen').style.display = 'block';
  showQuestion();
}

function showQuestion() {
  answered = false;
  const q = currentQuestions[currentIndex];

  document.getElementById('progress-info').textContent =
    `Spørsmål ${currentIndex + 1} av ${currentQuestions.length}`;
  document.getElementById('category-tag').textContent = catNames[q.cat] || q.cat;
  document.getElementById('progress-bar').style.width =
    `${(currentIndex / currentQuestions.length) * 100}%`;
  document.getElementById('question-text').textContent = q.q;

  const codeArea = document.getElementById('code-area');
  codeArea.innerHTML = q.code ? `<div class="code-block">${q.code}</div>` : '';

  const optList = document.getElementById('options-list');
  optList.innerHTML = '';
  q.options.forEach((opt, i) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.onclick = () => selectOption(i);
    li.appendChild(btn);
    optList.appendChild(li);
  });

  const fb = document.getElementById('feedback-box');
  fb.className = 'feedback-box';
  fb.textContent = '';

  document.getElementById('next-btn').style.display = 'none';
}

function selectOption(i) {
  if (answered) return;
  answered = true;
  const q = currentQuestions[currentIndex];
  const btns = document.querySelectorAll('.option-btn');

  btns.forEach((b, idx) => {
    b.disabled = true;
    if (idx === q.correct) b.classList.add('correct');
    else if (idx === i) b.classList.add('wrong');
  });

  const fb = document.getElementById('feedback-box');
  if (i === q.correct) {
    score++;
    catScores[q.cat].c++;
    fb.className = 'feedback-box correct';
    fb.textContent = '✓ Riktig! ' + q.explanation;
  } else {
    wrongQuestions.push(q);
    fb.className = 'feedback-box wrong';
    fb.textContent = '✗ Feil. ' + q.explanation;
  }
  catScores[q.cat].t++;

  const nextBtn = document.getElementById('next-btn');
  nextBtn.style.display = 'inline-block';
  nextBtn.textContent = currentIndex === currentQuestions.length - 1
    ? 'Se resultat →'
    : 'Neste →';
}

function nextQuestion() {
  currentIndex++;
  if (currentIndex >= currentQuestions.length) showResults();
  else showQuestion();
}

function showResults() {
  document.getElementById('quiz-screen').style.display = 'none';
  document.getElementById('result-screen').style.display = 'block';

  const pct = Math.round((score / currentQuestions.length) * 100);
  document.getElementById('score-big').textContent = pct + '%';
  document.getElementById('score-label').textContent =
    `${score} av ${currentQuestions.length} riktige`;

  const bd = document.getElementById('breakdown');
  bd.innerHTML = '';

  [['er', '🗺️ ER/Relmod'], ['sql', '🔍 SQL'], ['norm', '📐 Normalisering']].forEach(([cat, label]) => {
    const s = catScores[cat];
    if (!s || s.t === 0) return;
    const div = document.createElement('div');
    div.className = 'breakdown-item';
    div.innerHTML = `<div class="bi-label">${label}</div><div class="bi-val">${s.c}/${s.t}</div>`;
    bd.appendChild(div);
  });

  const msg = pct >= 80
    ? '🎯 Solid! Du er godt forberedt.'
    : pct >= 60
      ? '💪 Bra! Øv litt mer på det du bommet på.'
      : '📚 Fortsett å øve – du er på rett vei!';

  const msgDiv = document.createElement('div');
  msgDiv.style.cssText = 'margin-top:1rem;font-size:0.9rem;color:var(--text2);';
  msgDiv.textContent = msg;
  bd.appendChild(msgDiv);
}

function showStart() {
  document.getElementById('quiz-screen').style.display = 'none';
  document.getElementById('result-screen').style.display = 'none';
  document.getElementById('start-screen').style.display = 'block';
}

function goBack() { showStart(); }