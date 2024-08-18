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


// Fungsi baru untuk mengatur proporsi soal
function setQuestionProportions(totalQuestions, proportions) {
    const questionCounts = {};
    let remainingQuestions = totalQuestions;

    // Hitung jumlah soal untuk setiap kategori
    for (const [category, proportion] of Object.entries(proportions)) {
        const count = Math.floor(totalQuestions * proportion);
        questionCounts[category] = count;
        remainingQuestions -= count;
    }

    // Distribusikan sisa soal (jika ada)
    const categories = Object.keys(proportions);
    while (remainingQuestions > 0) {
        for (const category of categories) {
            if (remainingQuestions > 0) {
                questionCounts[category]++;
                remainingQuestions--;
            } else {
                break;
            }
        }
    }

    return questionCounts;
}

// Modifikasi fungsi loadQuestions
async function loadQuestions() {
    const categories = ['Grammar', 'Vocabulary', 'Reading', 'Greetings'];
    const totalQuestions = 15; // Total jumlah pertanyaan yang diinginkan

    // Tentukan proporsi untuk setiap kategori (total harus 1)
    const proportions = {
        Grammar: 0.4,    // 30%
        Vocabulary: 0.1, // 30%
        Reading: 0.4,    // 20%
        Greetings: 0.1   // 20%
    };

    const questionCounts = setQuestionProportions(totalQuestions, proportions);

    for (const category of categories) {
        const response = await fetch(`${category.toLowerCase()}.json`);
        const categoryQuestions = await response.json();
        
        // Acak pertanyaan dalam kategori
        shuffleArray(categoryQuestions);
        
        // Ambil jumlah pertanyaan sesuai proporsi
        const selectedQuestions = categoryQuestions.slice(0, questionCounts[category]);
        questions = questions.concat(selectedQuestions);
    }

    // Acak urutan final pertanyaan
    shuffleArray(questions);

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
    
    const passageElement = document.getElementById('passage');
    const questionElement = document.getElementById('question');
    
    if (question.category === "Reading") {
        passageElement.textContent = question.passage;
        passageElement.style.display = "block";
    } else {
        passageElement.style.display = "none";
    }
    
    questionElement.textContent = question.question;
    
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
    
    // Set timer to 30 seconds for Reading, 20 seconds for other categories
    const timerDuration = question.category === "Reading" ? 30 : 20;
    startTimer(timerDuration);
}

function startTimer(time) {
    let timeLeft = time;
    document.getElementById('timer').textContent = timeLeft;
    clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = timeLeft;
        if (timeLeft === 0) {
            clearInterval(timer);
            nextQuestion();
        }
    }, 1000);
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
        if (scores.total > 0) {  // Hanya tampilkan kategori dengan pertanyaan
            const categoryScore = document.createElement('p');
            categoryScore.className = 'category-score';
            categoryScore.textContent = `${category}: ${scores.correct}/${scores.total}`;
            categoryScoresContainer.appendChild(categoryScore);
        }
    }
    
    const recommendation = document.getElementById('recommendation');
    const weakestCategory = Object.entries(categoryScores)
        .filter(([_, scores]) => scores.total > 0)  // Hanya pertimbangkan kategori dengan pertanyaan
        .reduce((a, b) => 
            (a[1].correct / a[1].total < b[1].correct / b[1].total) ? a : b
        )[0];
    
    if (weakestCategory) {
        recommendation.textContent = `Based on your performance, we recommend focusing on improving your ${weakestCategory} skills. Keep practicing and you'll see improvement!`;
    } else {
        recommendation.textContent = `Great job on completing the quiz! Keep practicing to improve your overall English skills.`;
    }
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
