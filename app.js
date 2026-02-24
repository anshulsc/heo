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
let currentAnalysisIndex = -1;

// ============================================
// TEST DEFINITIONS
// ============================================
// Real HEO exam pattern:
// Total: 170 questions in 120 minutes (2 hours)
// Section A — Horticulture (120 questions):
//   Pomology: 25, Olericulture: 22, Floriculture: 15,
//   Post-Harvest: 15, Plant Propagation: 13, Plant Breeding: 12,
//   General Horticulture: 18
// Section B — General (50 questions):
//   Reasoning: 10, Hindi: 8, English: 8,
//   Political Science: 8, HP GK: 10, Current Affairs: 6
// ============================================

const HEO_EXAM_BLUEPRINT = {
  horticulture: {
    pomology: 25,
    olericulture: 22,
    floriculture: 15,
    post_harvest: 15,
    plant_propagation: 13,
    plant_breeding: 12,
    general_horticulture: 18
  },
  general: {
    reasoning: 10,
    hindi: 8,
    english: 8,
    political_science: 8,
    hp_gk: 10,
    current_affairs: 6
  }
};

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

  // Daily Overall Test (mini mock — same ratio as real exam)
  tests.push({
    id: `daily_overall_${today.toISOString().slice(0, 10)}`,
    title: `📅 Daily Full Test — ${today.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`,
    description: 'Daily exam simulation — same topic ratio as real HEO paper!',
    type: 'daily',
    category: 'overall',
    questionCount: 50,
    timeMinutes: 35,
    difficulty: 'hard',
    seed: dayNum + 999,
    useBlueprint: true,
    blueprintScale: 0.3,
    sections: {
      horticulture: { count: 35, topics: null },
      general: { count: 15, topics: null }
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

  // Mega horticulture tests (10 tests) — proportional topic distribution
  for (let i = 1; i <= 10; i++) {
    tests.push({
      id: `horti_mega_${i}`,
      title: `🌾 Horticulture Mega Test ${i}`,
      description: 'All horticulture topics. Same ratio as real HEO Section A.',
      type: 'horticulture',
      category: 'horticulture',
      questionCount: 60,
      timeMinutes: 60,
      difficulty: 'hard',
      seed: 2000 + i * 7,
      useBlueprint: true,
      blueprintScale: 0.5,
      sections: { horticulture: { count: 60, topics: null } }
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
      description: `HEO exam pattern. Topic focus: ${t.name}.`,
      type: 'general',
      category: 'general',
      questionCount: t.count,
      timeMinutes: Math.ceil(t.count * 1.5),
      difficulty: 'medium',
      seed: 3000 + i * 11,
      sections: { general: { count: t.count, topics: [t.key] } }
    });
  });

  // General combined tests (5 tests) — proportional distribution
  for (let i = 1; i <= 5; i++) {
    tests.push({
      id: `gen_combined_${i}`,
      title: `📚 General Section Test ${i}`,
      description: 'All 6 general topics — same ratio as real HEO Section B.',
      type: 'general',
      category: 'general',
      questionCount: 30,
      timeMinutes: 25,
      difficulty: 'medium',
      seed: 4000 + i * 13,
      useBlueprint: true,
      blueprintScale: 0.6,
      sections: { general: { count: 30, topics: null } }
    });
  }

  // ---- HEO FULL MOCK TESTS (30 tests) ----
  // Exact replica of real HEO exam: 170 Qs, 120 min, topic-wise distribution
  for (let i = 1; i <= 30; i++) {
    tests.push({
      id: `overall_${i}`,
      title: `🏆 HEO Full Mock Test ${i}`,
      description: `Exact HEO exam simulation — 170 Qs, 2 hrs, real topic distribution. Set ${i}/30.`,
      type: 'overall',
      category: 'overall',
      questionCount: 170,
      timeMinutes: 120,
      difficulty: 'hard',
      seed: 5000 + i * 17,
      useBlueprint: true,
      blueprintScale: 1.0,
      sections: {
        horticulture: { count: 120, topics: null },
        general: { count: 50, topics: null }
      }
    });
  }

  // ---- HALF MOCK TESTS (10 tests) — for shorter practice ----
  for (let i = 1; i <= 10; i++) {
    tests.push({
      id: `half_mock_${i}`,
      title: `⚡ HEO Half Mock ${i}`,
      description: `Half-length HEO simulation — 85 Qs, 60 min, same ratio. Set ${i}/10.`,
      type: 'overall',
      category: 'overall',
      questionCount: 85,
      timeMinutes: 60,
      difficulty: 'hard',
      seed: 8000 + i * 23,
      useBlueprint: true,
      blueprintScale: 0.5,
      sections: {
        horticulture: { count: 60, topics: null },
        general: { count: 25, topics: null }
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
// Uses topic-wise blueprint for realistic distribution
// ============================================
function buildTestQuestions(testDef) {
  const questions = [];

  // If test uses blueprint (exam-pattern distribution), pick per-topic quotas
  if (testDef.useBlueprint) {
    const scale = testDef.blueprintScale || 1.0;

    // HORTICULTURE — pick from each topic proportionally
    if (testDef.sections.horticulture) {
      const blueprint = HEO_EXAM_BLUEPRINT.horticulture;
      for (const [topic, baseCount] of Object.entries(blueprint)) {
        const needed = Math.max(1, Math.round(baseCount * scale));
        let pool = allQuestions.horticulture.filter(q => q.topic === topic);
        pool = shuffleWithSeed(pool, testDef.seed + topic.length * 7);
        questions.push(...pool.slice(0, needed));
      }
    }

    // GENERAL — pick from each topic proportionally
    if (testDef.sections.general) {
      const blueprint = HEO_EXAM_BLUEPRINT.general;
      for (const [topic, baseCount] of Object.entries(blueprint)) {
        const needed = Math.max(1, Math.round(baseCount * scale));
        let pool = allQuestions.general.filter(q => q.topic === topic);
        pool = shuffleWithSeed(pool, testDef.seed + topic.length * 11);
        questions.push(...pool.slice(0, needed));
      }
    }
  } else {
    // Simple mode — pick from pool without topic-level distribution
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
  }

  // Final shuffle to mix sections
  return shuffleWithSeed(questions, testDef.seed + 13);
}

// ============================================
// RENDER TEST CARDS
// ============================================
function renderTestCards(tests) {
  const grid = document.getElementById('testGrid');
  grid.innerHTML = '';
  const history = getTestHistory();

  tests.forEach(test => {
    const card = document.createElement('div');
    card.className = 'test-card';

    // Check if this test was previously attempted
    const attempts = history.filter(h => h.testId === test.id);
    let attemptBadge = '';
    if (attempts.length > 0) {
      const best = Math.max(...attempts.map(a => a.percent));
      const badgeClass = best >= 70 ? 'good' : best >= 40 ? 'average' : 'poor';
      attemptBadge = `<div class="test-card-attempt"><span class="attempt-badge ${badgeClass}">✅ Best: ${best}%</span><span class="attempt-count">${attempts.length} attempt${attempts.length > 1 ? 's' : ''}</span></div>`;
    }

    card.innerHTML = `
      <div class="test-card-header">
        <span class="test-card-type ${test.type}">${test.type}</span>
        <span class="test-card-difficulty ${test.difficulty}">${test.difficulty}</span>
      </div>
      <h3 class="test-card-title">${test.title}</h3>
      <p class="test-card-desc">${test.description}</p>
      ${attemptBadge}
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

  const testGrid = document.getElementById('testGrid');
  const historyScreen = document.getElementById('historyScreen');
  const analysisScreen = document.getElementById('analysisScreen');

  if (category === 'history') {
    testGrid.style.display = 'none';
    historyScreen.classList.add('active');
    analysisScreen.classList.remove('active');
    showHistoryScreen();
    return;
  }

  testGrid.style.display = '';
  historyScreen.classList.remove('active');
  analysisScreen.classList.remove('active');

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
  document.getElementById('historyScreen').classList.remove('active');
  document.getElementById('analysisScreen').classList.remove('active');
  document.getElementById('homeScreen').classList.remove('hidden');
  document.getElementById('testGrid').style.display = '';
  // Reset nav tabs to 'all'
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === 'all');
  });
  renderTestCards(allTests);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// LOCAL STORAGE — History & Stats
// ============================================
function saveTestResult(result) {
  // Also save per-question data for re-analysis
  if (currentTest) {
    result.questions = currentTest.questions.map(q => ({
      question: q.question,
      options: q.options,
      answer: q.answer,
      topic: q.topic,
      explanation: q.explanation || ''
    }));
    result.userAnswers = [...userAnswers];
  }

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
// RELATIVE DATE HELPER
// ============================================
function relativeDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay} days ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ============================================
// HISTORY SCREEN
// ============================================
function showHistoryScreen() {
  // Ensure correct screens are visible
  document.getElementById('analysisScreen').classList.remove('active');
  document.getElementById('historyScreen').classList.add('active');

  const history = getTestHistory();

  // Stats
  document.getElementById('histTotalTests').textContent = history.length;

  if (history.length > 0) {
    const best = Math.max(...history.map(r => r.percent));
    const avg = Math.round(history.reduce((s, r) => s + r.percent, 0) / history.length);
    const totalSecs = history.reduce((s, r) => s + (r.timeTaken || 0), 0);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);

    document.getElementById('histBestScore').textContent = `${best}%`;
    document.getElementById('histAvgScore').textContent = `${avg}%`;
    document.getElementById('histTotalTime').textContent = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  } else {
    document.getElementById('histBestScore').textContent = '—';
    document.getElementById('histAvgScore').textContent = '—';
    document.getElementById('histTotalTime').textContent = '0m';
  }

  // List
  const listEl = document.getElementById('historyList');
  listEl.innerHTML = '';

  if (history.length === 0) {
    listEl.innerHTML = `
      <div class="history-empty">
        <div class="history-empty-icon">📝</div>
        <h3>No Tests Yet!</h3>
        <p>Complete a test to see your history and analysis here.</p>
        <button class="quiz-nav-btn primary" onclick="goHome()" style="margin-top:16px;">🏠 Go to Tests</button>
      </div>
    `;
    return;
  }

  history.forEach((entry, index) => {
    const card = document.createElement('div');
    card.className = 'history-card';

    const scoreClass = entry.percent >= 70 ? 'good' : entry.percent >= 40 ? 'average' : 'poor';
    const hasQuestions = entry.questions && entry.questions.length > 0;

    card.innerHTML = `
      <div class="history-card-left">
        <div class="history-score-badge ${scoreClass}">${entry.percent}%</div>
      </div>
      <div class="history-card-center">
        <div class="history-card-title">${entry.testTitle}</div>
        <div class="history-card-meta">
          <span>📝 ${entry.score}/${entry.total}</span>
          <span>⏱️ ${formatDuration(entry.timeTaken || 0)}</span>
          <span>📅 ${relativeDate(entry.date)}</span>
        </div>
      </div>
      <div class="history-card-right">
        ${hasQuestions ? `<button class="history-analyse-btn" onclick="showAnalysis(${index})">📊 Analyse</button>` : `<span class="history-no-data">No details</span>`}
      </div>
    `;
    listEl.appendChild(card);
  });

  // Build overall performance dashboard
  buildOverallDashboard();
}

// ============================================
// OVERALL PERFORMANCE DASHBOARD
// ============================================
function buildOverallDashboard() {
  const history = getTestHistory();
  const dashboardEl = document.getElementById('overallDashboard');
  const topicsEl = document.getElementById('overallTopics');

  if (history.length === 0) {
    dashboardEl.style.display = 'none';
    return;
  }

  dashboardEl.style.display = 'block';
  topicsEl.innerHTML = '';

  // Aggregate topic stats across ALL tests
  const aggTopicStats = {};

  history.forEach(entry => {
    if (!entry.questions || !entry.userAnswers) return;
    entry.questions.forEach((q, i) => {
      const topic = q.topic;
      if (!aggTopicStats[topic]) aggTopicStats[topic] = { correct: 0, wrong: 0, skipped: 0, total: 0 };
      aggTopicStats[topic].total++;
      if (entry.userAnswers[i] === -1) aggTopicStats[topic].skipped++;
      else if (entry.userAnswers[i] === q.answer) aggTopicStats[topic].correct++;
      else aggTopicStats[topic].wrong++;
    });
  });

  // Sort by accuracy (weakest first)
  const sorted = Object.entries(aggTopicStats).sort((a, b) => {
    const pctA = a[1].total > 0 ? (a[1].correct / a[1].total) * 100 : 0;
    const pctB = b[1].total > 0 ? (b[1].correct / b[1].total) * 100 : 0;
    return pctA - pctB;
  });

  sorted.forEach(([topic, stats]) => {
    const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    const barClass = pct >= 70 ? 'good' : pct >= 40 ? 'average' : 'poor';
    const label = TOPIC_LABELS[topic] || topic;
    const strengthLabel = pct >= 70 ? '💪 Strong' : pct >= 40 ? '📈 Improving' : '⚠️ Needs Focus';

    const row = document.createElement('div');
    row.className = 'topic-row';
    row.innerHTML = `
      <div class="topic-row-header">
        <span class="topic-name">${label}</span>
        <span class="topic-strength ${barClass}">${strengthLabel}</span>
        <span class="topic-score">${stats.correct}/${stats.total} (${pct}%)</span>
      </div>
      <div class="topic-bar">
        <div class="topic-bar-fill ${barClass}" style="width: ${pct}%"></div>
      </div>
      <div class="topic-details">
        <span class="topic-detail correct">✅ ${stats.correct}</span>
        <span class="topic-detail wrong">❌ ${stats.wrong}</span>
        <span class="topic-detail skip">⏭ ${stats.skipped}</span>
      </div>
    `;
    topicsEl.appendChild(row);
  });
}

// ============================================
// ANALYSIS SCREEN
// ============================================
function showAnalysis(historyIndex) {
  const history = getTestHistory();
  if (historyIndex < 0 || historyIndex >= history.length) return;

  const entry = history[historyIndex];
  if (!entry.questions || !entry.userAnswers) {
    alert('Detailed data not available for this test (taken before the update).');
    return;
  }

  currentAnalysisIndex = historyIndex;

  // Hide history, show analysis
  document.getElementById('historyScreen').classList.remove('active');
  document.getElementById('analysisScreen').classList.add('active');

  // Title & date
  document.getElementById('analysisTitle').textContent = entry.testTitle;
  document.getElementById('analysisDate').textContent = new Date(entry.date).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  // Score circle
  const circle = document.getElementById('analysisScoreCircle');
  circle.className = 'results-score-circle';
  if (entry.percent >= 70) circle.classList.add('good');
  else if (entry.percent >= 40) circle.classList.add('average');
  else circle.classList.add('poor');

  document.getElementById('analysisScorePercent').textContent = `${entry.percent}%`;
  document.getElementById('analysisScoreFraction').textContent = `${entry.score}/${entry.total}`;

  // Breakdown
  let correct = 0, wrong = 0, skipped = 0;
  const topicStats = {};

  entry.questions.forEach((q, i) => {
    const topic = q.topic;
    if (!topicStats[topic]) topicStats[topic] = { correct: 0, wrong: 0, skipped: 0, total: 0 };
    topicStats[topic].total++;

    if (entry.userAnswers[i] === -1) {
      skipped++;
      topicStats[topic].skipped++;
    } else if (entry.userAnswers[i] === q.answer) {
      correct++;
      topicStats[topic].correct++;
    } else {
      wrong++;
      topicStats[topic].wrong++;
    }
  });

  document.getElementById('analysisCorrect').textContent = correct;
  document.getElementById('analysisWrong').textContent = wrong;
  document.getElementById('analysisSkipped').textContent = skipped;
  document.getElementById('analysisTime').textContent = formatDuration(entry.timeTaken || 0);

  // Topic-wise performance with progress bars
  const topicsEl = document.getElementById('analysisTopics');
  topicsEl.innerHTML = '';

  // Sort topics: weakest first
  const sortedTopics = Object.entries(topicStats).sort((a, b) => {
    const pctA = a[1].total > 0 ? (a[1].correct / a[1].total) * 100 : 0;
    const pctB = b[1].total > 0 ? (b[1].correct / b[1].total) * 100 : 0;
    return pctA - pctB;
  });

  sortedTopics.forEach(([topic, stats]) => {
    const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    const barClass = pct >= 70 ? 'good' : pct >= 40 ? 'average' : 'poor';
    const label = TOPIC_LABELS[topic] || topic;
    const strengthLabel = pct >= 70 ? '💪 Strong' : pct >= 40 ? '📈 Improving' : '⚠️ Weak';

    const row = document.createElement('div');
    row.className = 'topic-row';
    row.innerHTML = `
      <div class="topic-row-header">
        <span class="topic-name">${label}</span>
        <span class="topic-strength ${barClass}">${strengthLabel}</span>
        <span class="topic-score">${stats.correct}/${stats.total} (${pct}%)</span>
      </div>
      <div class="topic-bar">
        <div class="topic-bar-fill ${barClass}" style="width: ${pct}%"></div>
      </div>
    `;
    topicsEl.appendChild(row);
  });

  // Per-question breakdown (collapsible)
  const questionsEl = document.getElementById('analysisQuestions');
  questionsEl.innerHTML = '';

  const letters = ['A', 'B', 'C', 'D'];
  entry.questions.forEach((q, i) => {
    const userAns = entry.userAnswers[i];
    let status, statusClass;
    if (userAns === -1) {
      status = 'Skipped';
      statusClass = 'skipped';
    } else if (userAns === q.answer) {
      status = 'Correct';
      statusClass = 'correct';
    } else {
      status = 'Wrong';
      statusClass = 'wrong';
    }

    const item = document.createElement('div');
    item.className = `question-item ${statusClass}`;
    item.setAttribute('data-status', statusClass);
    const isExpanded = statusClass !== 'correct';
    item.innerHTML = `
      <div class="question-item-header" onclick="this.parentElement.classList.toggle('collapsed')">
        <span class="question-item-num">Q${i + 1}</span>
        <span class="question-item-topic">${TOPIC_LABELS[q.topic] || q.topic}</span>
        <span class="question-item-status ${statusClass}">${status}</span>
        <span class="question-item-toggle">▼</span>
      </div>
      <div class="question-item-body">
        <p class="question-item-text">${q.question}</p>
        <div class="question-item-answers">
          ${q.options.map((opt, j) => {
      let cls = '';
      if (j === q.answer) cls = 'correct-answer';
      if (userAns === j && j !== q.answer) cls = 'wrong-answer';
      return `<div class="question-item-option ${cls}"><span class="option-letter">${letters[j]}</span> ${opt}</div>`;
    }).join('')}
        </div>
        ${q.explanation ? `<div class="question-item-explanation">💡 ${q.explanation}</div>` : ''}
      </div>
    `;
    if (!isExpanded) item.classList.add('collapsed');
    questionsEl.appendChild(item);
  });

  // Update filter count
  document.getElementById('filteredQuestionCount').textContent = `Showing all ${entry.questions.length} questions`;
  document.querySelectorAll('#questionFilterBar .filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === 'all');
  });

  // Generate recommendation
  generateRecommendation(entry, topicStats, correct, wrong, skipped);

  // Improvement trend — find all attempts of the same test
  const sameTestAttempts = history.filter(h => h.testId === entry.testId && h.questions).sort((a, b) => new Date(a.date) - new Date(b.date));
  const improvementSection = document.getElementById('improvementSection');

  if (sameTestAttempts.length > 1) {
    improvementSection.style.display = 'block';
    const chartEl = document.getElementById('improvementChart');
    chartEl.innerHTML = '';

    const maxScore = 100;
    sameTestAttempts.forEach((attempt, idx) => {
      const isCurrentAttempt = attempt.date === entry.date;
      const bar = document.createElement('div');
      bar.className = `trend-bar ${isCurrentAttempt ? 'current' : ''}`;
      bar.innerHTML = `
        <div class="trend-bar-fill" style="height: ${attempt.percent}%"></div>
        <div class="trend-bar-label">${attempt.percent}%</div>
        <div class="trend-bar-date">${new Date(attempt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
      `;
      chartEl.appendChild(bar);
    });
  } else {
    improvementSection.style.display = 'none';
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteCurrentAnalysis() {
  if (currentAnalysisIndex < 0) return;
  if (!confirm('Are you sure you want to delete this test from history?')) return;

  const history = getTestHistory();
  history.splice(currentAnalysisIndex, 1);
  localStorage.setItem('hau_test_history', JSON.stringify(history));
  currentAnalysisIndex = -1;

  updateHomeStats();

  // Go back to history
  document.getElementById('analysisScreen').classList.remove('active');
  document.getElementById('historyScreen').classList.add('active');
  showHistoryScreen();
}

// ============================================
// QUESTION FILTER
// ============================================
function filterAnalysisQuestions(filter) {
  document.querySelectorAll('#questionFilterBar .filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });

  const items = document.querySelectorAll('#analysisQuestions .question-item');
  let visibleCount = 0;

  items.forEach(item => {
    const status = item.getAttribute('data-status');
    if (filter === 'all' || status === filter) {
      item.style.display = '';
      visibleCount++;
    } else {
      item.style.display = 'none';
    }
  });

  const filterLabels = { all: 'all', wrong: 'wrong', skipped: 'skipped', correct: 'correct' };
  document.getElementById('filteredQuestionCount').textContent = `Showing ${visibleCount} ${filterLabels[filter]} question${visibleCount !== 1 ? 's' : ''}`;
}

// ============================================
// SMART RECOMMENDATIONS
// ============================================
function generateRecommendation(entry, topicStats, correct, wrong, skipped) {
  const card = document.getElementById('recommendationCard');
  const titleEl = document.getElementById('recommendationTitle');
  const textEl = document.getElementById('recommendationText');

  // Find weakest topic
  let weakestTopic = null;
  let weakestPct = 100;
  Object.entries(topicStats).forEach(([topic, stats]) => {
    const pct = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
    if (pct < weakestPct) {
      weakestPct = pct;
      weakestTopic = topic;
    }
  });

  const percent = entry.percent;
  const topicLabel = weakestTopic ? (TOPIC_LABELS[weakestTopic] || weakestTopic) : '';

  if (percent >= 80) {
    titleEl.textContent = '🌟 Excellent Performance!';
    textEl.textContent = `You're doing great! ${weakestPct < 70 && weakestTopic ? `Focus a bit more on ${topicLabel} (${Math.round(weakestPct)}%) to push towards perfection.` : 'Keep maintaining this level of preparation. Try tougher tests!'}`;
  } else if (percent >= 60) {
    titleEl.textContent = '📈 Good Progress!';
    textEl.textContent = `Solid attempt! ${weakestTopic ? `Your weakest area is ${topicLabel} (${Math.round(weakestPct)}%). Dedicate extra study time there.` : 'Review your mistakes and try again soon.'} ${skipped > 0 ? `Also, you skipped ${skipped} question${skipped > 1 ? 's' : ''} — try to attempt all next time!` : ''}`;
  } else if (percent >= 40) {
    titleEl.textContent = '💪 Keep Practicing!';
    textEl.textContent = `You're getting there! ${weakestTopic ? `Priority: study ${topicLabel} — you scored only ${Math.round(weakestPct)}% there.` : 'Review all explanations carefully.'} Read the explanations below for wrong answers and make notes.`;
  } else {
    titleEl.textContent = '📚 Time to Focus!';
    textEl.textContent = `Don't worry — every attempt makes you stronger! ${weakestTopic ? `Start with ${topicLabel} basics first.` : 'Go through the study material again.'} Read each explanation below and note down key facts. You've got this! 💪`;
  }

  card.style.display = 'flex';
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
