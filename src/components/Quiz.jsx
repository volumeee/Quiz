import React, { useEffect, useState } from "react";
import axios from "axios";

const Quiz = ({ onLogout }) => {
  const [question, setQuestion] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(60); // 1 menit

  const decodeEntitas = (html) => {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = html;
    return textarea.value;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://opentdb.com/api.php?amount=10&type=multiple"
        );
        const formattedQuestions = response.data.results.map((q) => ({
          ...q,
          question: decodeEntitas(q.question),
          incorrect_answers: q.incorrect_answers.map((a) => decodeEntitas(a)),
          correct_answer: decodeEntitas(q.correct_answer),
        }));
        setQuestion(formattedQuestions);
        setLoading(false); // Setelah berhasil, berhenti loading
      } catch (error) {
        console.log("Error fetching data", error);
        // Tampilkan pesan kesalahan kepada pengguna
      }
    };

    const delay = 1000; // Delay 1 detik (1000 ms) antara permintaan
    const timeoutId = setTimeout(() => {
      fetchData();
    }, delay);

    return () => clearTimeout(timeoutId); // Membersihkan timeout jika komponen dibongkar
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAnswerClick = (answer) => {
    if (answer === question[currentQuestion].correct_answer) {
      setScore((prevScore) => prevScore + 1);
    }

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < question.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setShowScore(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setTimeLeft(60); // Reset timer to 1 minutes
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    onLogout();
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      const stateToSave = { currentQuestion, score };
      localStorage.setItem("quizState", JSON.stringify(stateToSave));
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [currentQuestion, score]);

  useEffect(() => {
    const savedState = localStorage.getItem("quizState");
    if (savedState) {
      const { currentQuestion: savedCurrentQuestion, score: savedScore } =
        JSON.parse(savedState);
      setCurrentQuestion(savedCurrentQuestion);
      setScore(savedScore);
    }
  }, []);

  return (
    <div className="bg-gradient-to-r from-green-200 to-green-500">
      <div className="flex justify-end">
        <button
          className="m-10 absolute bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-xl p-3"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      <div className="min-h-screen  flex justify-center items-center">
        <div className="bg-white rounded-lg shadow-xl p-10">
          <h1 className="text-3xl font-bold mb-4">Quiz App</h1>
          {loading ? (
            <p>Loading...</p>
          ) : showScore || timeLeft <= 0 ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Your Score: {score}/{question.length}
              </h2>
              <p>Time's up!</p>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md mt-4"
                onClick={handleRestart}
              >
                Restart Quiz
              </button>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Question {currentQuestion + 1}/{question.length}
              </h2>
              <p className="text-lg mb-4">
                {question[currentQuestion].question}
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ...question[currentQuestion].incorrect_answers,
                  question[currentQuestion].correct_answer,
                ]
                  .sort()
                  .map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerClick(option)}
                      className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
                    >
                      {option}
                    </button>
                  ))}
              </div>
              <p className="mt-4">Time Left: {timeLeft} seconds</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
