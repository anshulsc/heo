/* ============================================
   HEO Exam Prep — Main Application
   ============================================ */

// ============================================
// DATA: Question file paths
// ============================================
const QUESTION_FILES = {
  horticulture: [
    'data/horticulture/pomology.json',
    'data/horticulture/olericulture.json',
    'data/horticulture/floriculture.json',
    'data/horticulture/post_harvest.json',
    'data/horticulture/plant_propagation.json',
    'data/horticulture/plant_breeding.json',
    'data/horticulture/general_horticulture.json'
  ],
  general: [
    'data/general/reasoning.json',
    'data/general/hindi.json',
    'data/general/english.json',
    'data/general/political_science.json',
    'data/general/hp_gk.json',
    'data/general/current_affairs.json'
  ]
};

const TOPIC_LABELS = {
  pomology: '🍎 Pomology',
  olericulture: '🥬 Olericulture',
  floriculture: '🌸 Floriculture',
  post_harvest: '📦 Post-Harvest Tech',
  plant_propagation: '🌱 Plant Propagation',
  plant_breeding: '🧬 Plant Breeding',
  general_horticulture: '🌿 General Horticulture',
  reasoning: '🧠 Reasoning',
  hindi: '📝 Hindi',
  english: '📖 English',
  political_science: '⚖️ Political Science',
  hp_gk: '🏔️ HP GK',
  current_affairs: '📰 Current Affairs'
};

// ============================================
// STATE
// ============================================
let allQuestions = { horticulture: [], general: [] };
let currentTest = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let timerInterval = null;
let timeRemaining = 0;
let totalTestTime = 0;
let reviewIndex = 0;

// ============================================
// TEST DEFINITIONS
// ============================================
function generateTestDefinitions() {
  const tests = [];

  // ---- DAILY TESTS (based on date) ----
  const today = new Date();
  const dayNum = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));

  // Daily Horticulture Test
  tests.push({
    id: `daily_horti_${today.toISOString().slice(0, 10)}`,
    title: `📅 Daily Horticulture — ${today.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`,
    description: 'Daily horticulture test. New set every day!',
    type: 'daily',
    category: 'horticulture',
    questionCount: 30,
    timeMinutes: 35,
    difficulty: 'hard',
    seed: dayNum,
    sections: { horticulture: { count: 30, topics: null } }
  });

  // Daily Overall Test
  tests.push({
    id: `daily_overall_${today.toISOString().slice(0, 10)}`,
    title: `📅 Daily Full Test — ${today.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`,
    description: 'Daily mixed test. Horticulture + General. New every day!',
    type: 'daily',
    category: 'overall',
    questionCount: 40,
    timeMinutes: 45,
    difficulty: 'medium',
    seed: dayNum + 999,
    sections: {
      horticulture: { count: 28, topics: null },
      general: { count: 12, topics: null }
    }
  });

  // ---- HORTICULTURE TOPIC-WISE TESTS ----
  const hortiTopics = [
    { key: 'pomology', name: 'Pomology (Fruit Science)', icon: '🍎', count: 30 },
    { key: 'olericulture', name: 'Olericulture (Vegetable Science)', icon: '🥬', count: 30 },
    { key: 'floriculture', name: 'Floriculture & Landscaping', icon: '🌸', count: 25 },
    { key: 'post_harvest', name: 'Post-Harvest Technology', icon: '📦', count: 25 },
    { key: 'plant_propagation', name: 'Plant Propagation & Nursery', icon: '🌱', count: 20 },
    { key: 'plant_breeding', name: 'Plant Breeding & Genetics', icon: '🧬', count: 20 },
    { key: 'general_horticulture', name: 'General Horticulture', icon: '🌿', count: 25 }
  ];

  hortiTopics.forEach((t, i) => {
    // 2 tests per topic
    for (let s = 1; s <= 2; s++) {
      tests.push({
        id: `horti_topic_${t.key}_${s}`,
        title: `${t.icon} ${t.name} — Set ${s}`,
        description: `Focused practice on ${t.name}. HEO/RHEO difficulty.`,
        type: 'horticulture',
        category: 'horticulture',
        questionCount: t.count,
        timeMinutes: Math.ceil(t.count * 1.2),
        difficulty: 'hard',
        seed: i * 100 + s + 1000,
        sections: { horticulture: { count: t.count, topics: [t.key] } }
      });
    }
  });

  // Mega horticulture tests (10 tests)
  for (let i = 1; i <= 10; i++) {
    tests.push({
      id: `horti_mega_${i}`,
      title: `🌾 Horticulture Mega Test ${i}`,
      description: 'All horticulture topics. Competitive exam difficulty.',
      type: 'horticulture',
      category: 'horticulture',
      questionCount: 50,
      timeMinutes: 60,
      difficulty: 'hard',
      seed: 2000 + i * 7,
      sections: { horticulture: { count: 50, topics: null } }
    });
  }

  // ---- GENERAL TOPIC-WISE TESTS ----
  const genTopics = [
    { key: 'reasoning', name: 'Reasoning & Mental Ability', icon: '🧠', count: 15 },
    { key: 'hindi', name: 'Hindi Language', icon: '📝', count: 15 },
    { key: 'english', name: 'English Language', icon: '📖', count: 15 },
    { key: 'political_science', name: 'Political Science & Polity', icon: '⚖️', count: 15 },
    { key: 'hp_gk', name: 'Himachal Pradesh GK', icon: '🏔️', count: 20 },
    { key: 'current_affairs', name: 'Current Affairs 2023-25', icon: '📰', count: 15 }
  ];

  genTopics.forEach((t, i) => {
    tests.push({
      id: `gen_topic_${t.key}`,
      title: `${t.icon} ${t.name}`,
      description: `TGT exam pattern. Topic focus: ${t.name}.`,
      type: 'general',
      category: 'general',
      questionCount: t.count,
      timeMinutes: Math.ceil(t.count * 1.5),
      difficulty: 'medium',
      seed: 3000 + i * 11,
      sections: { general: { count: t.count, topics: [t.key] } }
    });
  });

  // General combined tests (5 tests)
  for (let i = 1; i <= 5; i++) {
    tests.push({
      id: `gen_combined_${i}`,
      title: `📚 General Section Test ${i}`,
      description: 'Reasoning, Hindi, English, Polity, HP GK, Current Affairs.',
      type: 'general',
      category: 'general',
      questionCount: 30,
      timeMinutes: 30,
      difficulty: 'medium',
      seed: 4000 + i * 13,
      sections: { general: { count: 30, topics: null } }
    });
  }

  // ---- OVERALL HEO FULL MOCK TESTS (30 tests) ----
  for (let i = 1; i <= 30; i++) {
    tests.push({
      id: `overall_${i}`,
      title: `🏆 HEO Full Mock Test ${i}`,
      description: `Complete HEO exam simulation. Tougher than previous papers. Set ${i}/30.`,
      type: 'overall',
      category: 'overall',
      questionCount: 70,
      timeMinutes: 90,
      difficulty: 'hard',
      seed: 5000 + i * 17,
      sections: {
        horticulture: { count: 50, topics: null },
        general: { count: 20, topics: null }
      }
    });
  }

  return tests;
}

// ============================================
// SEEDED RANDOM (for stable daily tests)
// ============================================
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function shuffleWithSeed(arr, seed) {
  const copy = [...arr];
  const rng = seededRandom(seed);
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ============================================
// LOAD QUESTIONS
// ============================================
async function loadAllQuestions() {
  const loadGroup = async (files) => {
    const results = [];
    for (const file of files) {
      try {
        const resp = await fetch(file);
        if (resp.ok) {
          const data = await resp.json();
          results.push(...data);
        }
      } catch (e) {
        console.warn(`Failed to load ${file}:`, e);
      }
    }
    return results;
  };

  allQuestions.horticulture = await loadGroup(QUESTION_FILES.horticulture);
  allQuestions.general = await loadGroup(QUESTION_FILES.general);

  // Update stats
  const total = allQuestions.horticulture.length + allQuestions.general.length;
  document.getElementById('totalQuestions').textContent = total;

  console.log(`Loaded ${allQuestions.horticulture.length} horticulture + ${allQuestions.general.length} general = ${total} questions`);
}

// ============================================
// BUILD TEST QUESTIONS FROM DEFINITION
// ============================================
function buildTestQuestions(testDef) {
  const questions = [];

  if (testDef.sections.horticulture) {
    const sec = testDef.sections.horticulture;
    let pool = sec.topics
      ? allQuestions.horticulture.filter(q => sec.topics.includes(q.topic))
      : [...allQuestions.horticulture];
    pool = shuffleWithSeed(pool, testDef.seed);
    questions.push(...pool.slice(0, sec.count));
  }

  if (testDef.sections.general) {
    const sec = testDef.sections.general;
    let pool = sec.topics
      ? allQuestions.general.filter(q => sec.topics.includes(q.topic))
      : [...allQuestions.general];
    pool = shuffleWithSeed(pool, testDef.seed + 7);
    questions.push(...pool.slice(0, sec.count));
  }

  // Final shuffle
  return shuffleWithSeed(questions, testDef.seed + 13);
}

// ============================================
// RENDER TEST CARDS
// ============================================
function renderTestCards(tests) {
  const grid = document.getElementById('testGrid');
  grid.innerHTML = '';

  tests.forEach(test => {
    const card = document.createElement('div');
    card.className = 'test-card';
    card.innerHTML = `
      <div class="test-card-header">
        <span class="test-card-type ${test.type}">${test.type}</span>
        <span class="test-card-difficulty ${test.difficulty}">${test.difficulty}</span>
      </div>
      <h3 class="test-card-title">${test.title}</h3>
      <p class="test-card-desc">${test.description}</p>
      <div class="test-card-meta">
        <span>📝 ${test.questionCount} Qs</span>
        <span>⏱️ ${test.timeMinutes} min</span>
      </div>
      <button class="test-card-btn" onclick="startTest('${test.id}')">Start Test →</button>
    `;
    grid.appendChild(card);
  });
}

// ============================================
// FILTER TESTS
// ============================================
let allTests = [];

function filterTests(category) {
  // Update active tab
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === category);
  });

  let filtered;
  if (category === 'all') {
    filtered = allTests;
  } else if (category === 'daily') {
    filtered = allTests.filter(t => t.type === 'daily');
  } else {
    filtered = allTests.filter(t => t.category === category);
  }

  renderTestCards(filtered);
}

// ============================================
// START TEST
// ============================================
function startTest(testId) {
  const testDef = allTests.find(t => t.id === testId);
  if (!testDef) return;

  const questions = buildTestQuestions(testDef);
  if (questions.length === 0) {
    alert('Not enough questions for this test. Try another one!');
    return;
  }

  currentTest = {
    def: testDef,
    questions: questions,
    startTime: Date.now()
  };
  currentQuestionIndex = 0;
  userAnswers = new Array(questions.length).fill(-1);
  timeRemaining = testDef.timeMinutes * 60;
  totalTestTime = timeRemaining;

  // Switch screens
  document.getElementById('homeScreen').classList.add('hidden');
  document.getElementById('quizScreen').classList.add('active');
  document.getElementById('resultsScreen').classList.remove('active');
  document.getElementById('reviewScreen').classList.remove('active');

  // Set test name
  document.getElementById('quizTestName').textContent = testDef.title;

  // Build question navigator
  buildQuestionNavigator();

  // Show first question
  showQuestion(0);

  // Start timer
  startTimer();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// TIMER
// ============================================
function startTimer() {
  clearInterval(timerInterval);
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      submitTest();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const mins = Math.floor(timeRemaining / 60);
  const secs = timeRemaining % 60;
  const display = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  document.getElementById('timerDisplay').textContent = display;

  const timerEl = document.getElementById('quizTimer');
  timerEl.classList.remove('warning', 'danger');
  if (timeRemaining <= 60) {
    timerEl.classList.add('danger');
  } else if (timeRemaining <= 300) {
    timerEl.classList.add('warning');
  }
}

// ============================================
// QUESTION DISPLAY
// ============================================
function showQuestion(index) {
  if (!currentTest || index < 0 || index >= currentTest.questions.length) return;

  currentQuestionIndex = index;
  const q = currentTest.questions[index];
  const total = currentTest.questions.length;

  // Update progress
  document.getElementById('quizProgress').textContent = `${index + 1}/${total}`;
  document.getElementById('progressFill').style.width = `${((index + 1) / total) * 100}%`;

  // Question number & topic
  document.getElementById('questionNumber').textContent = `Q. ${index + 1}`;
  document.getElementById('questionTopic').textContent = TOPIC_LABELS[q.topic] || q.topic;

  // Question text
  document.getElementById('questionText').textContent = q.question;

  // Options
  const optionsGrid = document.getElementById('optionsGrid');
  optionsGrid.innerHTML = '';
  const letters = ['A', 'B', 'C', 'D'];

  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    if (userAnswers[index] === i) {
      btn.classList.add('selected');
    }
    btn.innerHTML = `
      <span class="option-letter">${letters[i]}</span>
      <span>${opt}</span>
    `;
    btn.onclick = () => selectOption(index, i);
    optionsGrid.appendChild(btn);
  });

  // Hide explanation
  document.getElementById('explanationBox').classList.remove('visible');

  // Update navigator
  updateNavigator();
}

function selectOption(qIndex, optIndex) {
  userAnswers[qIndex] = optIndex;

  // Re-render options
  const optionsGrid = document.getElementById('optionsGrid');
  const buttons = optionsGrid.querySelectorAll('.option-btn');
  buttons.forEach((btn, i) => {
    btn.classList.toggle('selected', i === optIndex);
  });

  // Update navigator
  updateNavigator();
}

function nextQuestion() {
  if (currentQuestionIndex < currentTest.questions.length - 1) {
    showQuestion(currentQuestionIndex + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function prevQuestion() {
  if (currentQuestionIndex > 0) {
    showQuestion(currentQuestionIndex - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ============================================
// QUESTION NAVIGATOR
// ============================================
function buildQuestionNavigator() {
  const nav = document.getElementById('questionNavigator');
  nav.innerHTML = '';

  currentTest.questions.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.className = 'qnav-btn';
    btn.textContent = i + 1;
    btn.onclick = () => {
      showQuestion(i);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    nav.appendChild(btn);
  });
}

function updateNavigator() {
  const buttons = document.querySelectorAll('#questionNavigator .qnav-btn');
  buttons.forEach((btn, i) => {
    btn.className = 'qnav-btn';
    if (i === currentQuestionIndex) {
      btn.classList.add('current');
    } else if (userAnswers[i] !== -1) {
      btn.classList.add('answered');
    }
  });
}

// ============================================
// SUBMIT TEST
// ============================================
function confirmSubmit() {
  const answered = userAnswers.filter(a => a !== -1).length;
  const total = currentTest.questions.length;
  const unanswered = total - answered;

  const msg = unanswered > 0
    ? `You have ${unanswered} unanswered question(s). Are you sure you want to submit?`
    : 'Are you sure you want to submit the test?';

  if (confirm(msg)) {
    submitTest();
  }
}

function submitTest() {
  clearInterval(timerInterval);

  const questions = currentTest.questions;
  const total = questions.length;
  let correct = 0, wrong = 0, skipped = 0;
  const topicStats = {};

  questions.forEach((q, i) => {
    const topic = q.topic;
    if (!topicStats[topic]) {
      topicStats[topic] = { correct: 0, wrong: 0, skipped: 0, total: 0 };
    }
    topicStats[topic].total++;

    if (userAnswers[i] === -1) {
      skipped++;
      topicStats[topic].skipped++;
    } else if (userAnswers[i] === q.answer) {
      correct++;
      topicStats[topic].correct++;
    } else {
      wrong++;
      topicStats[topic].wrong++;
    }
  });

  const percent = Math.round((correct / total) * 100);
  const timeTaken = totalTestTime - timeRemaining;
  const mins = Math.floor(timeTaken / 60);
  const secs = timeTaken % 60;

  // Save to history
  saveTestResult({
    testId: currentTest.def.id,
    testTitle: currentTest.def.title,
    date: new Date().toISOString(),
    score: correct,
    total: total,
    percent: percent,
    timeTaken: timeTaken,
    topicStats: topicStats
  });

  // Show results screen
  document.getElementById('quizScreen').classList.remove('active');
  document.getElementById('resultsScreen').classList.add('active');

  // Score circle
  const circle = document.getElementById('scoreCircle');
  circle.className = 'results-score-circle';
  if (percent >= 70) circle.classList.add('good');
  else if (percent >= 40) circle.classList.add('average');
  else circle.classList.add('poor');

  document.getElementById('scorePercent').textContent = `${percent}%`;
  document.getElementById('scoreFraction').textContent = `${correct}/${total}`;

  // Status message
  let status, message;
  if (percent >= 80) { status = '🌟 Excellent!'; message = 'Outstanding performance! You\'re well prepared for the exam.'; }
  else if (percent >= 60) { status = '👍 Good Job!'; message = 'Solid performance. Focus on weak topics to improve further.'; }
  else if (percent >= 40) { status = '📈 Keep Going!'; message = 'You need more practice. Review explanations and study the topics.'; }
  else { status = '📚 Needs Work'; message = 'Focus on studying the fundamentals. Review all explanations carefully.'; }

  document.getElementById('resultStatus').textContent = status;
  document.getElementById('resultMessage').textContent = message;

  // Breakdown
  document.getElementById('correctCount').textContent = correct;
  document.getElementById('wrongCount').textContent = wrong;
  document.getElementById('skippedCount').textContent = skipped;
  document.getElementById('timeTaken').textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Topic breakdown
  const topicDiv = document.getElementById('topicBreakdown');
  topicDiv.innerHTML = '';
  Object.entries(topicStats).forEach(([topic, stats]) => {
    const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    const color = pct >= 70 ? 'correct' : pct >= 40 ? 'time' : 'wrong';
    const card = document.createElement('div');
    card.className = 'breakdown-card';
    card.innerHTML = `
      <div class="breakdown-value ${color}">${pct}%</div>
      <div class="breakdown-label">${TOPIC_LABELS[topic] || topic}<br><small>${stats.correct}/${stats.total}</small></div>
    `;
    topicDiv.appendChild(card);
  });

  // Update home stats
  updateHomeStats();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// REVIEW MODE
// ============================================
function reviewAnswers() {
  document.getElementById('resultsScreen').classList.remove('active');
  document.getElementById('reviewScreen').classList.add('active');
  reviewIndex = 0;
  buildReviewNavigator();
  showReviewQuestion(0);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showReviewQuestion(index) {
  if (!currentTest || index < 0 || index >= currentTest.questions.length) return;
  reviewIndex = index;
  const q = currentTest.questions[index];
  const total = currentTest.questions.length;

  document.getElementById('reviewProgress').textContent = `${index + 1}/${total}`;
  document.getElementById('reviewProgressFill').style.width = `${((index + 1) / total) * 100}%`;
  document.getElementById('reviewQuestionNumber').textContent = `Q. ${index + 1}`;
  document.getElementById('reviewQuestionTopic').textContent = TOPIC_LABELS[q.topic] || q.topic;
  document.getElementById('reviewQuestionText').textContent = q.question;

  const optionsGrid = document.getElementById('reviewOptionsGrid');
  optionsGrid.innerHTML = '';
  const letters = ['A', 'B', 'C', 'D'];

  q.options.forEach((opt, i) => {
    const btn = document.createElement('div');
    btn.className = 'option-btn';
    if (i === q.answer) btn.classList.add('correct');
    if (userAnswers[index] === i && i !== q.answer) btn.classList.add('incorrect');
    if (userAnswers[index] === i && i === q.answer) btn.classList.add('correct');
    btn.innerHTML = `
      <span class="option-letter">${letters[i]}</span>
      <span>${opt}</span>
    `;
    optionsGrid.appendChild(btn);
  });

  document.getElementById('reviewExplanationText').textContent = q.explanation || 'No explanation available.';

  // Update review navigator
  const navBtns = document.querySelectorAll('#reviewNavigator .qnav-btn');
  navBtns.forEach((btn, i) => {
    btn.className = 'qnav-btn';
    if (i === reviewIndex) btn.classList.add('current');
    else if (userAnswers[i] === currentTest.questions[i].answer) btn.classList.add('answered');
  });
}

function buildReviewNavigator() {
  const nav = document.getElementById('reviewNavigator');
  nav.innerHTML = '';
  currentTest.questions.forEach((q, i) => {
    const btn = document.createElement('button');
    btn.className = 'qnav-btn';
    btn.textContent = i + 1;
    btn.onclick = () => { showReviewQuestion(i); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    nav.appendChild(btn);
  });
}

function nextReview() {
  if (reviewIndex < currentTest.questions.length - 1) {
    showReviewQuestion(reviewIndex + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function prevReview() {
  if (reviewIndex > 0) {
    showReviewQuestion(reviewIndex - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function goResults() {
  document.getElementById('reviewScreen').classList.remove('active');
  document.getElementById('resultsScreen').classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// GO HOME
// ============================================
function goHome() {
  clearInterval(timerInterval);
  document.getElementById('quizScreen').classList.remove('active');
  document.getElementById('resultsScreen').classList.remove('active');
  document.getElementById('reviewScreen').classList.remove('active');
  document.getElementById('homeScreen').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// LOCAL STORAGE — History & Stats
// ============================================
function saveTestResult(result) {
  const history = JSON.parse(localStorage.getItem('hau_test_history') || '[]');
  history.unshift(result);
  // Keep last 100 results
  if (history.length > 100) history.length = 100;
  localStorage.setItem('hau_test_history', JSON.stringify(history));
}

function getTestHistory() {
  return JSON.parse(localStorage.getItem('hau_test_history') || '[]');
}

function updateHomeStats() {
  const history = getTestHistory();
  document.getElementById('testsAttempted').textContent = history.length;

  if (history.length > 0) {
    const avg = Math.round(history.reduce((sum, r) => sum + r.percent, 0) / history.length);
    document.getElementById('avgScore').textContent = `${avg}%`;
  } else {
    document.getElementById('avgScore').textContent = '—';
  }
}

// ============================================
// INIT
// ============================================
async function init() {
  await loadAllQuestions();
  allTests = generateTestDefinitions();

  document.getElementById('totalTests').textContent = allTests.length;
  updateHomeStats();
  renderTestCards(allTests);
}

// Boot
init();
