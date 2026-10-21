import maleVideo from "../assets/videos/male-ai.mp4";
import femaleVideo from "../assets/videos/female-ai.mp4";
import Timer from "./Timer.jsx";
import { motion } from "motion/react";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { serverUrl } from "../App.jsx";
import { BsArrowRight } from "react-icons/bs";

const Interview = ({ interviewData, onFinish }) => {
  const { interviewId, questions = [], userName, username } = interviewData || {};
  const candidateName = userName || username || "Candidate";

  const [isIntroPhase, setIsIntroPhase] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isAIPlaying, setIsAIPlaying] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60);

  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceGender, setVoiceGender] = useState("female");
  const [subtitle, setSubtitle] = useState("");
  const [submissionError, setSubmissionError] = useState("");

  const recogRef = useRef(null);
  const isListeningRef = useRef(false);
  const shouldListenRef = useRef(true);
  const isAIPlayingRef = useRef(false);
  const isIntroPhaseRef = useRef(true);
  const feedbackRef = useRef("");

  const videoRef = useRef(null);
  const utteranceRef = useRef(null);

  const currentQuestion = questions[currentIndex];

  // Sync refs with latest state for callbacks
  useEffect(() => {
    isIntroPhaseRef.current = isIntroPhase;
  }, [isIntroPhase]);

  useEffect(() => {
    feedbackRef.current = feedback;
  }, [feedback]);

  useEffect(() => {
    isAIPlayingRef.current = isAIPlaying;
  }, [isAIPlaying]);

  // Reset timer whenever currentIndex changes
  useEffect(() => {
    if (questions[currentIndex]?.timeLimit) {
      setTimeLeft(questions[currentIndex].timeLimit);
    } else {
      setTimeLeft(60);
    }
  }, [currentIndex, questions]);

  // Load available speech synthesis voices
  useEffect(() => {
    const loadVoices = () => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;

      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      // Helper to identify male voices
      const isMaleVoice = (v) => {
        const n = v.name.toLowerCase();
        return n.includes("david") || n.includes("mark") || n.includes("guy") || n.includes("george") || n.includes("male");
      };

      // Helper to identify female voices
      const isFemaleVoice = (v) => {
        const n = v.name.toLowerCase();
        return (
          (n.includes("zira") ||
            n.includes("samantha") ||
            n.includes("aria") ||
            n.includes("jenny") ||
            n.includes("female") ||
            n.includes("victoria") ||
            n.includes("karen") ||
            n.includes("google us english")) &&
          !isMaleVoice(v)
        );
      };

      const femaleVoice = voices.find(isFemaleVoice);
      if (femaleVoice) {
        setSelectedVoice(femaleVoice);
        setVoiceGender("female");
        return;
      }

      const maleVoice = voices.find(isMaleVoice);
      if (maleVoice) {
        setSelectedVoice(maleVoice);
        setVoiceGender("male");
        return;
      }

      // fallback: first voice (default female avatar)
      setSelectedVoice(voices[0]);
      setVoiceGender("female");
    };

    loadVoices();

    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;

  // Initialize Speech Recognition once
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      let incoming = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i][0]?.transcript) {
          incoming += event.results[i][0].transcript + " ";
        }
      }
      const clean = incoming.trim();
      if (clean) {
        setAnswer((prev) => (prev ? `${prev.trim()} ${clean}` : clean));
      }
    };

    recognition.onerror = (e) => {
      if (e.error === "no-speech") {
        return; // Expected during user pause, onend handles restart
      }
      console.warn("Speech recognition error:", e.error);
      if (e.error === "not-allowed") {
        setIsMicOn(false);
        shouldListenRef.current = false;
      }
    };

    recognition.onend = () => {
      isListeningRef.current = false;
      // Auto-restart if user still wants mic on and AI is not speaking
      if (
        shouldListenRef.current &&
        !isAIPlayingRef.current &&
        !isIntroPhaseRef.current &&
        !feedbackRef.current
      ) {
        try {
          recognition.start();
          isListeningRef.current = true;
        } catch (err) {
          // Ignore state race condition errors
        }
      }
    };

    recogRef.current = recognition;

    return () => {
      try {
        recognition.stop();
        recognition.abort();
      } catch (e) {}
    };
  }, []);

  const startMic = () => {
    if (!recogRef.current) return;
    if (isAIPlayingRef.current || isIntroPhaseRef.current || feedbackRef.current) return;
    if (isListeningRef.current) return;

    try {
      recogRef.current.start();
      isListeningRef.current = true;
    } catch (error) {
      // recognition might already be active
    }
  };

  const stopMic = () => {
    if (recogRef.current) {
      isListeningRef.current = false;
      try {
        recogRef.current.stop();
      } catch (error) {}
    }
  };

  const toggleMic = () => {
    if (isMicOn) {
      shouldListenRef.current = false;
      stopMic();
      setIsMicOn(false);
    } else {
      shouldListenRef.current = true;
      setIsMicOn(true);
      if (!isAIPlaying && !isIntroPhase && !feedback) {
        startMic();
      }
    }
  };

  const speakText = (text) => {
    return new Promise((resolve) => {
      if (
        typeof window === "undefined" ||
        !window.speechSynthesis ||
        !selectedVoice ||
        !text
      ) {
        resolve();
        return;
      }

      // Stop mic immediately before speech starts so AI voice is not recorded
      stopMic();
      window.speechSynthesis.cancel();

      const humanText = text.replace(/,/g, ", ").replace(/\./g, ". ");
      const utterance = new SpeechSynthesisUtterance(humanText);
      utteranceRef.current = utterance;

      utterance.voice = selectedVoice;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsAIPlaying(true);
        isAIPlayingRef.current = true;
        videoRef.current?.play().catch(() => {});
      };

      const handleDone = () => {
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
        setIsAIPlaying(false);
        isAIPlayingRef.current = false;

        // Start mic only if interview is in active question answering phase
        if (
          shouldListenRef.current &&
          !isIntroPhaseRef.current &&
          !feedbackRef.current
        ) {
          startMic();
        }

        setTimeout(() => {
          setSubtitle("");
          resolve();
        }, 300);
      };

      utterance.onend = handleDone;
      utterance.onerror = (e) => {
        console.warn("Speech synthesis error:", e);
        handleDone();
      };

      setSubtitle(text);

      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      window.speechSynthesis.speak(utterance);
    });
  };

  // Run intro and question voice flows
  useEffect(() => {
    if (!selectedVoice) return;

    let isCancelled = false;

    const runVoiceFlow = async () => {
      if (isIntroPhase) {
        await speakText(
          `Hi ${candidateName}, it's great to meet you today! I hope you're feeling confident, prepared, and ready to give it your best.`
        );
        if (isCancelled) return;

        await speakText(
          "I'll ask you a few questions, so just answer naturally and take your time. There's no need to rush or be perfect. Stay relaxed and be yourself. Let's begin!"
        );
        if (isCancelled) return;

        setIsIntroPhase(false);
      } else if (currentQuestion?.question) {
        await new Promise((r) => setTimeout(r, 600));
        if (isCancelled) return;

        if (currentIndex === questions.length - 1) {
          await speakText("Alright, this one might be a bit more challenging.");
          if (isCancelled) return;
        }

        await speakText(currentQuestion.question);
      }
    };

    runVoiceFlow();

    return () => {
      isCancelled = true;
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [selectedVoice, isIntroPhase, currentIndex]);

  // Timer countdown: ticks ONLY during active answering (not intro, not AI speaking, not submitting, not feedback)
  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;
    if (isSubmitting) return;
    if (isAIPlaying) return;
    if (feedback) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isIntroPhase, currentIndex, isSubmitting, isAIPlaying, feedback, currentQuestion]);

  const submitAnswer = async () => {
    if (isSubmitting || feedback) return;

    stopMic();
    setIsSubmitting(true);
    setSubmissionError("");

    try {
      const timeTaken = Math.max(
        1,
        (currentQuestion?.timeLimit || 60) - timeLeft
      );

      const result = await axios.post(
        serverUrl + "/api/interview/submit-answer",
        {
          interviewId,
          questionIndex: currentIndex,
          answer: answer.trim(),
          timeTaken,
        },
        { withCredentials: true }
      );

      const responseFeedback = result.data.feedback || "Answer recorded.";
      setFeedback(responseFeedback);
      setIsSubmitting(false);

      speakText(responseFeedback);
    } catch (error) {
      console.error("Submit answer error:", error);
      setSubmissionError(
        error.response?.data?.message || "Failed to submit answer. Please try clicking submit again."
      );
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setAnswer("");
    setFeedback("");
    setSubmissionError("");

    if (currentIndex + 1 >= questions.length) {
      finishInterview();
      return;
    }

    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setTimeLeft(questions[nextIndex]?.timeLimit || 60);

    await speakText("Alright, let's move to the next question.");
  };

  // finish the interview and generate the report
  const finishInterview = async () => {
    stopMic();
    setIsMicOn(false);
    shouldListenRef.current = false;
    setSubmissionError("");

    try {
      const result = await axios.post(
        serverUrl + "/api/interview/finish-interview",
        { interviewId },
        { withCredentials: true }
      );

      onFinish(result.data);
    } catch (error) {
      console.error("Finish interview error:", error);
      setSubmissionError(
        error.response?.data?.message || "Failed to finalize interview. Please try again."
      );
    }
  };

  // Auto-submit when time runs out
  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;

    if (timeLeft === 0 && !isSubmitting && !feedback) {
      submitAnswer();
    }
  }, [timeLeft]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recogRef.current) {
        try {
          recogRef.current.stop();
          recogRef.current.abort();
        } catch (e) {}
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-teal-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-350 min-h-[80vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col lg:flex-row overflow-hidden">
        {/* Video / Avatar Section */}
        <div className="w-full lg:w-[35%] bg-white flex flex-col items-center p-6 space-y-6 border-r border-gray-200">
          <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl">
            <video
              src={videoSource}
              key={videoSource}
              ref={videoRef}
              muted
              playsInline
              preload="auto"
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Subtitles */}
          {subtitle && (
            <div className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-4">
              <p className="text-gray-700 text-sm sm:text-base font-medium text-center leading-relaxed">
                {subtitle}
              </p>
            </div>
          )}

          {/* Timer Section */}
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Interview Status</span>

              {isAIPlaying ? (
                <span className="text-sm font-semibold text-emerald-600 animate-pulse">
                  AI Speaking...
                </span>
              ) : isIntroPhase ? (
                <span className="text-sm font-semibold text-teal-600">
                  Introduction
                </span>
              ) : (
                <span className="text-sm font-semibold text-gray-600">
                  Your Turn
                </span>
              )}
            </div>

            <div className="h-px bg-gray-200"></div>

            <div className="flex justify-center">
              <Timer
                timeLeft={timeLeft}
                totalTime={currentQuestion?.timeLimit || 60}
              />
            </div>

            <div className="h-px bg-gray-200"></div>

            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <span className="text-2xl font-bold text-emerald-600">
                  {currentIndex + 1}
                </span>
                <span className="block text-xs text-gray-400">
                  Current Question
                </span>
              </div>

              <div>
                <span className="text-2xl font-bold text-emerald-600">
                  {questions.length}
                </span>
                <span className="block text-xs text-gray-400">
                  Total Questions
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Question & Answer Section */}
        <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 relative">
          <h2 className="text-xl sm:text-2xl font-bold text-emerald-600 mb-6">
            AI Smart Interview
          </h2>

          {!isIntroPhase && (
            <div className="relative mb-6 bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-xs sm:text-sm text-gray-400 mb-2">
                Question {currentIndex + 1} of {questions.length}
              </p>

              <div className="text-base sm:text-lg font-semibold text-gray-800 leading-relaxed pr-16">
                {currentQuestion?.question}
              </div>
            </div>
          )}

          <textarea
            onChange={(e) => setAnswer(e.target.value)}
            value={answer}
            disabled={isIntroPhase || Boolean(feedback)}
            placeholder={
              isIntroPhase
                ? "The AI is introducing the interview..."
                : feedback
                ? "Answer submitted."
                : "Type your answer here or speak using the microphone..."
            }
            className="flex-1 bg-gray-100 p-4 sm:p-6 rounded-2xl resize-none outline-none border border-gray-200 focus:ring-2 focus:ring-emerald-500 transition text-gray-800 disabled:opacity-60"
          />

          {submissionError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl text-center">
              {submissionError}
            </div>
          )}

          {!feedback ? (
            <div className="flex items-center gap-4 mt-6">
              <motion.button
                onClick={toggleMic}
                disabled={isIntroPhase}
                whileTap={{ scale: 0.9 }}
                className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full text-white shadow-lg transition ${
                  isMicOn ? "bg-black hover:bg-gray-800" : "bg-red-500 hover:bg-red-600"
                } disabled:opacity-50`}
                title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
              >
                {isMicOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
              </motion.button>

              <motion.button
                onClick={submitAnswer}
                disabled={isSubmitting || isIntroPhase}
                whileTap={{ scale: 0.95 }}
                className="flex-1 bg-linear-to-r from-emerald-600 to-teal-500 text-white py-3 sm:py-4 rounded-2xl shadow-lg hover:opacity-90 transition font-semibold disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Answer"}
              </motion.button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-emerald-50 border border-emerald-200 p-5 rounded-2xl shadow-sm"
            >
              <h4 className="text-sm font-semibold text-emerald-800 mb-1">
                Interviewer Feedback:
              </h4>
              <p className="text-emerald-700 font-medium mb-4">
                {feedback}
              </p>

              <button
                onClick={handleNext}
                className="w-full bg-linear-to-r from-emerald-600 to-teal-500 text-white py-3 rounded-xl shadow-md hover:opacity-90 transition flex items-center justify-center gap-2 font-semibold"
              >
                {currentIndex + 1 >= questions.length
                  ? "Finish Interview & View Report"
                  : "Next Question"}
                <BsArrowRight size={18} />
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Interview;
