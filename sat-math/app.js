let ALL_QUESTIONS = [];
let CURRENT_LIST = [];
let currentIndex = 0;

fetch("data/sat_math_all.json")
  .then(res => res.json())
  .then(data => {
    ALL_QUESTIONS = data;
    buildPaperFilter();
    // Start by showing all questions
    filterQuestions("all");
  });

function buildPaperFilter() {
  const select = document.getElementById("paperFilter");
  if (!select) return;

  const papers = [...new Set(ALL_QUESTIONS.map(q =>
    `${q.paper.year} ${q.paper.month} Module ${q.paper.module}`
  ))];

  select.innerHTML = "<option value='all'>All Papers</option>";
  papers.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    select.appendChild(opt);
  });

  select.onchange = () => {
    filterQuestions(select.value);
  };
}

function filterQuestions(filterValue) {
  if (filterValue === "all") {
    CURRENT_LIST = ALL_QUESTIONS;
  } else {
    CURRENT_LIST = ALL_QUESTIONS.filter(q =>
      `${q.paper.year} ${q.paper.month} Module ${q.paper.module}` === filterValue
    );
  }
  
  // Reset to the first question whenever the filter changes
  currentIndex = 0;
  renderCurrentQuestion();
}

function renderCurrentQuestion() {
  const container = document.getElementById("question-display-area");
  const counter = document.getElementById("questionCounter");
  const btnPrev = document.getElementById("btnPrev");
  const btnNext = document.getElementById("btnNext");

  // Clear previous content
  container.innerHTML = "";

  // Handle empty state
  if (CURRENT_LIST.length === 0) {
    container.innerHTML = "<p>No questions found for this category.</p>";
    counter.innerText = "0 of 0";
    btnPrev.disabled = true;
    btnNext.disabled = true;
    return;
  }

  // Get current question data
  const q = CURRENT_LIST[currentIndex];

  // Update Counter
  counter.innerText = `Question ${currentIndex + 1} of ${CURRENT_LIST.length}`;

  // Update Buttons state
  btnPrev.disabled = (currentIndex === 0);
  btnNext.disabled = (currentIndex === CURRENT_LIST.length - 1);

  // --- Build HTML for the Single Question ---
  let html = "";

  // 1. Image
  if (q.image) {
    html += `<div class="question-image-container">
               <img src="${q.image}" class="question-img" alt="Question Diagram">
             </div>`;
  }

  // 2. Table
  if (q.table_data) {
      html += renderTable(q.table_data);
  }

  // 3. Text
  html += `<p style="font-size: 1.1em; margin-bottom: 20px;"><strong>Q${q.paper.questionNumber}.</strong> ${q.text}</p>`;

  // 4. Answer Options
  if (q.type === "MCQ") {
    html += `<div class="options-container">`;
    q.options.forEach((opt, index) => {
      let labelChar = String.fromCharCode(65 + index);
      let content = "";
      let valForRadio = "";

      if (typeof opt === 'string') {
          content = opt;
          valForRadio = opt; 
      } else if (typeof opt === 'object') {
          valForRadio = opt.label || labelChar;
          content += `<strong>${opt.label || labelChar}. </strong>`;
          if (opt.text) content += `<span>${opt.text}</span>`;
          if (opt.image) content += `<br><img src="${opt.image}" class="option-img" alt="Option ${labelChar}" style="max-width: 150px; margin-top: 5px;">`;
          if (opt.table_data) content += renderTable(opt.table_data);
      }

      html += `
        <div class="option-item">
          <label style="display:block; width:100%; cursor: pointer;">
            <input type="radio" name="current_q" value="${valForRadio}">
            ${content}
          </label>
        </div>`;
    });
    html += `</div>`;
    html += `<button onclick="showAnswer('${q.answer}')" style="margin-top:20px; padding: 10px 20px; background:#28a745; color:white; border:none; border-radius:5px; cursor:pointer;">Check Answer</button>`;
  
  } else {
    // Fill In The Blank
    html += `<div style="margin-top:20px;">
               <input type="text" id="fillInInput" placeholder="Your answer" style="padding:10px; font-size:16px; border-radius:5px; border:1px solid #ccc;">
               <button onclick="checkFillIn('${q.answer}')" style="padding: 10px 20px; background:#28a745; color:white; border:none; border-radius:5px; cursor:pointer; margin-left:10px;">Check</button>
             </div>`;
  }

  container.innerHTML = html;

  // Re-run MathJax/Katex rendering
  if (window.renderMathInElement) {
    renderMathInElement(container, {
        delimiters: [
            {left: "$$", right: "$$", display: true},
            {left: "\\(", right: "\\)", display: false},
            {left: "\\[", right: "\\]", display: true}
        ]
    });
  }
}

// --- Navigation Functions ---

function nextQuestion() {
  if (currentIndex < CURRENT_LIST.length - 1) {
    currentIndex++;
    renderCurrentQuestion();
  }
}

function prevQuestion() {
  if (currentIndex > 0) {
    currentIndex--;
    renderCurrentQuestion();
  }
}

// --- Helper Functions ---

function showAnswer(correctAnswer) {
    alert(`Correct Answer: ${correctAnswer}`);
}

function checkFillIn(correctAnswer) {
    const input = document.getElementById("fillInInput");
    if (input.value.trim() === correctAnswer) {
        alert("Correct!");
    } else {
        alert(`Incorrect. The answer is ${correctAnswer}`);
    }
}

function renderTable(data) {
    if (!data || data.length === 0) return "";
    const headers = Object.keys(data[0]);
    let tableHtml = '<table class="question-table">';
    tableHtml += '<thead><tr>';
    headers.forEach(header => {
        tableHtml += `<th>${header}</th>`;
    });
    tableHtml += '</tr></thead><tbody>';
    data.forEach(row => {
        tableHtml += '<tr>';
        headers.forEach(header => {
            tableHtml += `<td>${row[header]}</td>`;
        });
        tableHtml += '</tr>';
    });
    tableHtml += '</tbody></table>';
    return tableHtml;
}