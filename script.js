let questions = [];
let currentQuestion = 0;
let score = 0;
let categoryScores = {
    Grammar: { correct: 0, total: 0 },
    Vocabulary: { correct: 0, total: 0 },
    Reading: { correct: 0, total: 0 },
    Greetings: { correct: 0, total: 0 }
};
let timer;

async function loadQuestions() {
    const categories = ['grammar', 'vocabulary', 'reading', 'greetings'];
    for (const category of categories) {
        const response = await fetch(`${category}.json`);
        const categoryQuestions = await response.json();
        questions = questions.concat(categoryQuestions);
    }
    shuffleArray(questions);
    questions = questions.slice(0, 15); // Limit to 15 questions
    showQuestion();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function showQuestion() {
    const question = questions[currentQuestion];
    document.getElementById('question').textContent = question.question;
    
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.textContent = option;
        button.className = 'option';
        button.onclick = () => selectOption(index);
        optionsContainer.appendChild(button);
    });
    
    document.getElementById('current-question').textContent = currentQuestion + 1;
    updateProgressBar();
    startTimer();
}

function selectOption(index) {
    clearInterval(timer);
    const question = questions[currentQuestion];
    const userAnswer = question.options[index];
    const isCorrect = userAnswer === question.correctAnswer;
    
    if (isCorrect) {
        score++;
        categoryScores[question.category].correct++;
    }
    categoryScores[question.category].total++;
    
    const options = document.querySelectorAll('.option');
    options.forEach((option, i) => {
        option.style.opacity = i === index ? 1 : 0.5;
        if (i === index) {
            option.style.border = isCorrect ? '3px solid #4CAF50' : '3px solid #e21b3c';
        }
        if (option.textContent === question.correctAnswer) {
            option.style.border = '3px solid #4CAF50';
        }
        option.disabled = true;
    });
    
    setTimeout(nextQuestion, 2000);
}

function startTimer() {
    let timeLeft = 20;
    document.getElementById('timer').textContent = timeLeft;
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = timeLeft;
        if (timeLeft === 0) {
            clearInterval(timer);
            nextQuestion();
        }
    }, 1000);
}

function updateProgressBar() {
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
}

function nextQuestion() {
    currentQuestion++;
    if (currentQuestion < questions.length) {
        showQuestion();
    } else {
        showSummary();
    }
}

function showSummary() {
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('progress-container').style.display = 'none';
    document.getElementById('summary-container').style.display = 'block';
    document.getElementById('total-score').textContent = score;
    
    const categoryScoresContainer = document.getElementById('category-scores');
    categoryScoresContainer.innerHTML = '';
    
    for (const [category, scores] of Object.entries(categoryScores)) {
        const categoryScore = document.createElement('p');
        categoryScore.className = 'category-score';
        categoryScore.textContent = `${category}: ${scores.correct}/${scores.total}`;
        categoryScoresContainer.appendChild(categoryScore);
    }
    
    const recommendation = document.getElementById('recommendation');
    const weakestCategory = Object.entries(categoryScores).reduce((a, b) => 
        (a[1].correct / a[1].total < b[1].correct / b[1].total) ? a : b
    )[0];
    
    recommendation.textContent = `Based on your performance, we recommend focusing on improving your ${weakestCategory} skills. Keep practicing and you'll see improvement!`;
}

function restartQuiz() {
    currentQuestion = 0;
    score = 0;
    categoryScores = {
        Grammar: { correct: 0, total: 0 },
        Vocabulary: { correct: 0, total: 0 },
        Reading: { correct: 0, total: 0 },
        Greetings: { correct: 0, total: 0 }
    };
    questions = [];
    document.getElementById('quiz-container').style.display = 'block';
    document.getElementById('progress-container').style.display = 'block';
    document.getElementById('summary-container').style.display = 'none';
    loadQuestions();
}

document.getElementById('restart-btn').addEventListener('click', restartQuiz);

loadQuestions();