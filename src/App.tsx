import { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  RefreshCcw, 
  CheckCircle2, 
  Award, 
  BookOpen, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  LayoutList, 
  List, 
  ArrowLeft,
  Clock,
  User,
  ShieldCheck,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import questionsData from './data/questions.json';
import Background from './components/Background';

interface Question {
  id: number;
  question: string;
  options: string[];
  answer: number;
}

type AppState = 'landing' | 'exam' | 'results' | 'fullView';

function App() {
  const [state, setState] = useState<AppState>('landing');
  const [userName, setUserName] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [score, setScore] = useState(0);
  const [showReview, setShowReview] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);

  const questions = activeQuestions;
  const currentQuestion = questions[currentQuestionIndex];

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleStartExam = () => {
    if (!userName.trim()) return;
    
    // Select 25 random questions
    const shuffledPool = shuffleArray(questionsData);
    const selected = shuffledPool.slice(0, 25).map(q => {
      // Randomize options for each question
      const originalOptions = q.options.map((opt, idx) => ({
        text: opt,
        isCorrect: idx === q.answer
      }));
      
      const shuffledOptions = shuffleArray(originalOptions);
      
      return {
        ...q,
        options: shuffledOptions.map(o => o.text),
        answer: shuffledOptions.findIndex(o => o.isCorrect)
      };
    });

    setActiveQuestions(selected);
    setState('exam');
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowReview(false);
    setTimeLeft(600);
    setTimerActive(true);
  };

  // Timer Effect
  useEffect(() => {
    let timer: number;
    if (timerActive && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      calculateResults();
      setTimerActive(false);
    }
    return () => clearInterval(timer);
  }, [timerActive, timeLeft]);

  const handleFullView = () => {
    setState('fullView');
    window.scrollTo(0, 0);
  };

  const handleStepByStep = () => {
    setState('exam');
    window.scrollTo(0, 0);
  };

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      calculateResults();
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const calculateResults = () => {
    let correctCount = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.answer) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setState('results');
    setTimerActive(false);
    window.scrollTo(0, 0);
  };

  const handleRestart = () => {
    setState('landing');
    setTimerActive(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const totalAnswered = Object.keys(answers).length;
  const percentageScore = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const isPassing = percentageScore >= 70;

  return (
    <div className="app-container">
      <Background />

      {/* LANDING STATE */}
      {state === 'landing' && (
        <div className="landing-card fade-in">

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="icon-wrapper">
              <BookOpen size={36} />
            </div>
          </div>

          <h1 className="title">IT Knowledge Assessment</h1>
          <p className="subtitle">
            Demonstrate your proficiency in infrastructure monitoring, networking protocols, cloud operations, and systems administration.
          </p>
          
          <div className="input-group">
            <label className="input-label" htmlFor="userName">Candidate Full Name</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input 
                type="text" 
                id="userName"
                className="input-field" 
                placeholder="e.g. Alex Morgan"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && userName.trim() && handleStartExam()}
                autoFocus
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button 
              className="btn-primary" 
              onClick={handleStartExam} 
              disabled={!userName.trim()}
              style={{ width: '100%', maxWidth: '380px' }}
            >
              Start Assessment <ChevronRight size={18} />
            </button>
          </div>
          
          <div className="landing-meta-strip">
            <div className="meta-item">
              <span className="meta-value">25</span>
              <span className="meta-label">Questions</span>
            </div>
            <div className="meta-item">
              <span className="meta-value">Professional</span>
              <span className="meta-label">Standard</span>
            </div>
            <div className="meta-item">
              <span className="meta-value">10 Mins</span>
              <span className="meta-label">Time Limit</span>
            </div>
          </div>
        </div>
      )}

      {/* FULL VIEW MODE */}
      {state === 'fullView' && (
        <div className="full-view-container fade-in">
          <div className="full-view-sticky-header">
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button className="btn-secondary" onClick={() => setState('landing')}>
                <ArrowLeft size={16} /> Exit
              </button>
              <button className="btn-secondary" onClick={handleStepByStep}>
                <List size={16} /> Step-by-Step
              </button>
            </div>

            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent)' }}>Full Page Review</span>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', alignItems: 'center', marginTop: '0.15rem' }}>
                <span className="answered-pill">
                  <CheckCircle2 size={14} color="#059669" /> {totalAnswered} / {questions.length} answered
                </span>
                <span className={`timer-pill ${timeLeft < 60 ? 'urgent' : 'normal'}`}>
                  <Clock size={14} /> {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            <button 
              className="btn-primary" 
              onClick={calculateResults}
              disabled={totalAnswered === 0}
              style={{ padding: '0.65rem 1.4rem', fontSize: '0.875rem' }}
            >
              Submit Exam
            </button>
          </div>

          <div style={{ display: 'grid', gap: '1.25rem' }}>
            {questions.map((q, i) => {
              const isSelected = answers[q.id] !== undefined;
              return (
                <div key={q.id} className="question-card" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', alignItems: 'flex-start' }}>
                    <span style={{ 
                      background: isSelected ? 'var(--primary)' : 'var(--primary-subtle)', 
                      color: isSelected ? '#ffffff' : 'var(--primary)', 
                      fontWeight: 700, 
                      width: '32px', 
                      height: '32px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontFamily: "'JetBrains Mono', monospace",
                      flexShrink: 0
                    }}>
                      {i + 1}
                    </span>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent)', marginTop: '0.2rem' }}>
                      {q.question}
                    </h3>
                  </div>

                  <div style={{ display: 'grid', gap: '0.65rem', paddingLeft: '2.75rem' }}>
                    {q.options.map((opt, idx) => {
                      const selectedThis = answers[q.id] === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectOption(q.id, idx)}
                          className="full-view-option"
                          style={{ 
                            border: selectedThis ? '1.5px solid var(--primary)' : '1px solid var(--border-light)',
                            backgroundColor: selectedThis ? 'var(--primary-subtle)' : '#ffffff',
                            color: 'var(--text-main)'
                          }}
                        >
                          <span style={{ 
                            fontWeight: 700, 
                            fontFamily: "'JetBrains Mono', monospace",
                            color: selectedThis ? 'var(--primary)' : 'var(--text-tertiary)', 
                            width: '24px',
                            fontSize: '0.875rem'
                          }}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span style={{ fontWeight: selectedThis ? 600 : 500 }}>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3.5rem', paddingBottom: '5rem' }}>
            <button className="btn-primary" onClick={calculateResults} style={{ padding: '1rem 3.5rem', fontSize: '1.05rem' }}>
              Complete and View Results
            </button>
          </div>
        </div>
      )}

      {/* STEP-BY-STEP EXAM STATE */}
      {state === 'exam' && (
        <div className="exam-layout fade-in">
          <div className="exam-top-bar">
            <div className="exam-candidate-chip">
              <User size={15} color="var(--primary)" />
              <span>Candidate: <strong style={{ color: 'var(--accent)' }}>{userName}</strong></span>
            </div>

            <div className="exam-nav-buttons">
              <button className="btn-secondary" onClick={() => setState('landing')}>
                <ArrowLeft size={15} /> Exit
              </button>
              <button className="btn-secondary" onClick={handleFullView}>
                <LayoutList size={15} /> Full Page Mode
              </button>
            </div>
          </div>
          
          <div className="progress-card">
            <div className="progress-header">
              <span className="progress-label">
                <ShieldCheck size={16} color="var(--primary)" /> Overall Progress
              </span>
              <span className="progress-pct">{Math.round(progress)}% Completed</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill-bar" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
          
          <div className="question-card">
            <div className="question-header">
              <span className="question-number-pill">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              
              <div className="header-status-group">
                <div className={`timer-pill ${timeLeft < 60 ? 'urgent' : 'normal'}`}>
                  <Clock size={16} />
                  <span>{formatTime(timeLeft)}</span>
                </div>
                <div className="answered-pill">
                  <CheckCircle2 size={15} color="#059669" />
                  <span>{totalAnswered} / {questions.length} Answered</span>
                </div>
              </div>
            </div>

            <h2 className="question-text">{currentQuestion.question}</h2>

            <div className="options-grid">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = answers[currentQuestion.id] === idx;
                return (
                  <button
                    key={idx}
                    className={`option-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectOption(currentQuestion.id, idx)}
                  >
                    <span className="option-label">{String.fromCharCode(65 + idx)}</span>
                    <span className="option-text-span">{option}</span>
                  </button>
                );
              })}
            </div>

            <div className="footer-actions">
              <button 
                className="btn-secondary" 
                onClick={handleBack}
                disabled={currentQuestionIndex === 0}
                style={{ visibility: currentQuestionIndex === 0 ? 'hidden' : 'visible' }}
              >
                <ChevronLeft size={16} /> Previous
              </button>
              
              <button 
                className="btn-primary" 
                onClick={handleNext}
                disabled={answers[currentQuestion.id] === undefined}
              >
                {currentQuestionIndex === questions.length - 1 ? 'Finish Assessment' : 'Next Question'} 
                {currentQuestionIndex !== questions.length - 1 && <ChevronRight size={18} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESULTS STATE */}
      {state === 'results' && (
        <div className="results-container fade-in">
          <div className="results-card">
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div className="results-badge-icon">
                <Award size={48} />
              </div>
            </div>

            <div className="brand-badge" style={{ margin: '0 auto 1rem auto' }}>
              Official Assessment Summary
            </div>

            <h1 className="title">Assessment Completed</h1>
            <p className="subtitle" style={{ marginBottom: '1.5rem' }}>
              Evaluation record generated for <strong style={{ color: 'var(--accent)' }}>{userName}</strong>
            </p>
            
            <div className="score-display-wrapper">
              <div className="score-badge">
                <div className={`score-number ${isPassing ? 'pass' : 'fail'}`}>
                  {percentageScore}%
                </div>
                <span className="score-tag" style={{ color: isPassing ? '#059669' : '#dc2626' }}>
                  {isPassing ? 'Verified Pass' : 'Needs Review'}
                </span>
              </div>
            </div>

            <div className="result-stat">
              <div className="stat-item">
                <div className="stat-value" style={{ color: '#059669' }}>{score}</div>
                <div className="stat-label">Correct</div>
              </div>
              <div className="stat-item">
                <div className="stat-value" style={{ color: '#dc2626' }}>{questions.length - score}</div>
                <div className="stat-label">Incorrect</div>
              </div>
              <div className="stat-item">
                <div className="stat-value" style={{ color: 'var(--accent)' }}>{questions.length}</div>
                <div className="stat-label">Total Questions</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={handleRestart} style={{ padding: '0.75rem 1.75rem' }}>
                <RefreshCcw size={16} /> Retake Assessment
              </button>
              <button className="btn-secondary" onClick={() => setShowReview(!showReview)} style={{ padding: '0.75rem 1.75rem' }}>
                {showReview ? <ChevronUp size={16} /> : <ChevronDown size={16} />} 
                {showReview ? 'Hide Analysis' : 'Review Answers'}
              </button>
            </div>
          </div>

          {showReview && (
            <div className="review-section">
              <div className="review-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HelpCircle size={18} color="var(--primary)" />
                  <span>Comprehensive Answer Breakdown</span>
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                  {questions.length} Total Evaluated
                </span>
              </div>
              
              {questions.map((q, i) => {
                const isCorrect = answers[q.id] === q.answer;
                const userAnswerText = answers[q.id] !== undefined ? q.options[answers[q.id]] : 'No answer selected';
                const correctAnswerText = q.options[q.answer];

                return (
                  <div key={q.id} className={`review-card-item ${isCorrect ? 'correct' : 'incorrect'}`}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                      {isCorrect ? (
                        <CheckCircle2 size={18} color="#059669" />
                      ) : (
                        <XCircle size={18} color="#dc2626" />
                      )}
                      <span style={{ 
                        fontWeight: 700, 
                        fontSize: '0.85rem', 
                        fontFamily: "'JetBrains Mono', monospace",
                        color: isCorrect ? '#059669' : '#dc2626' 
                      }}>
                        QUESTION {i + 1}
                      </span>
                    </div>

                    <p style={{ fontSize: '1rem', marginBottom: '1.25rem', color: 'var(--accent)', fontWeight: 600, lineHeight: 1.5 }}>
                      {q.question}
                    </p>

                    <div style={{ fontSize: '0.9rem', display: 'grid', gap: '0.45rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline' }}>
                        <span style={{ color: 'var(--text-tertiary)', fontWeight: 600, minWidth: '120px' }}>Your Answer:</span>
                        <span style={{ 
                          color: isCorrect ? '#059669' : '#dc2626', 
                          fontWeight: 700,
                          backgroundColor: isCorrect ? '#ecfdf5' : '#fef2f2',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px'
                        }}>
                          {userAnswerText}
                        </span>
                      </div>
                      {!isCorrect && (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline' }}>
                          <span style={{ color: 'var(--text-tertiary)', fontWeight: 600, minWidth: '120px' }}>Correct Answer:</span>
                          <span style={{ 
                            color: '#059669', 
                            fontWeight: 700,
                            backgroundColor: '#ecfdf5',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '6px'
                          }}>
                            {correctAnswerText}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
