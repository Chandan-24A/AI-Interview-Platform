import maleVideo from "../assets/videos/male-ai.mp4"
import femaleVideo from "../assets/videos/female-ai.mp4"
import Timer from "./Timer.jsx";
import { motion } from "motion/react"
import { FaMicrophone,FaMicrophoneSlash } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";

const Interview = ({interviewData,onFinish}) => {

  const {interviewId,questions = [],userName,username} = interviewData || {};
  const candidateName = userName || username || "Candidate";

  const [isIntroPhase,setIsIntroPhase] = useState(true)

  const [isMicOn,setIsMicOn] = useState(true)
  const recogRef = useRef(null)
  const [isAIPlaying,setIsAIPlaying] = useState(false)

  const [currentIndex,setCurrentIndex] = useState(0)
  const [answer,setAnswer] = useState("")
  const [feedback,setFeedback] = useState("")
  const [timeLeft,setTimeLeft] = useState(questions[0]?.timeLimit || 60)

  const [selectedVoice,setSelectedVoice] = useState(null)
  const [isSubmitting,setIsSubmitting] = useState(false)
  const [voiceGender,setVoiceGender] = useState("female")
  const [subtitle,setSubtitle] = useState("")

  const videoRef = useRef(null)
  const utteranceRef = useRef(null)

  const currentQuestion = questions[currentIndex]

  useEffect(()=>{
    const loadVoices = () => {
      if(typeof window === "undefined" || !window.speechSynthesis) return;

      const voices = window.speechSynthesis.getVoices();
      if(!voices.length) return;

      // try known female voices
      const femaleVoice = voices.find( v => 
        v.name.toLowerCase().includes("zira") ||
        v.name.toLowerCase().includes("samantha") ||
        v.name.toLowerCase().includes("female") ||
        v.name.toLowerCase().includes("natural") ||
        v.name.toLowerCase().includes("google us english")
      );

      if(femaleVoice){
        setSelectedVoice(femaleVoice);
        setVoiceGender("female");
        return;
      }

      // try known male voices
      const maleVoice = voices.find( v =>
        v.name.toLowerCase().includes("david") ||
        v.name.toLowerCase().includes("mark") ||
        v.name.toLowerCase().includes("male")
      );

      if(maleVoice){
        setSelectedVoice(maleVoice);
        setVoiceGender("male");
        return;
      }

      // fallback: first voice (assume female)
      setSelectedVoice(voices[0]);
      setVoiceGender("female");
    };

    loadVoices();

    if(typeof window !== "undefined" && window.speechSynthesis){
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if(typeof window !== "undefined" && window.speechSynthesis){
        window.speechSynthesis.cancel();
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  },[])

  const videoSource = voiceGender === "male"? maleVideo : femaleVideo;

  const speakText = (text) => {
    return new Promise((resolve) => {
      if(typeof window === "undefined" || !window.speechSynthesis || !selectedVoice || !text){
        resolve();
        return;
      }

      window.speechSynthesis.cancel();

      // Clean natural phrasing without weird punctuation that breaks speech engines
      const humanText = text.replace(/,/g, ", ").replace(/\./g, ". ");

      const utterance = new SpeechSynthesisUtterance(humanText);
      utteranceRef.current = utterance; // Prevent garbage collection in Chrome

      utterance.voice = selectedVoice;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsAIPlaying(true);
        videoRef.current?.play().catch(() => {});
      };

      const handleDone = () => {
        if(videoRef.current){
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
        setIsAIPlaying(false);

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

      if(window.speechSynthesis.paused){
        window.speechSynthesis.resume();
      }

      window.speechSynthesis.speak(utterance);
    });
  };

  useEffect(()=>{
    if(!selectedVoice){
      return;
    }

    let isCancelled = false;

    const runVoiceFlow = async () =>{
      if(isIntroPhase){
        await speakText(`Hi ${candidateName}, it's great to meet you today! I hope you're feeling confident, prepared, and ready to give it your best.`);
        if(isCancelled) return;

        await speakText("I'll ask you a few questions, so just answer naturally and take your time. There's no need to rush or be perfect. Stay relaxed and be yourself. Let's begin!");
        if(isCancelled) return;

        setIsIntroPhase(false);
      }else if(currentQuestion?.question){
        await new Promise(r => setTimeout(r,600));
        if(isCancelled) return;

        // if reached the last question
        if(currentIndex === questions.length - 1){
          await speakText("Alright, this one might be a bit more challenging.");
          if(isCancelled) return;
        }

        await speakText(currentQuestion.question);
      }
    }

    runVoiceFlow();

    return () => {
      isCancelled = true;
      if(typeof window !== "undefined" && window.speechSynthesis){
        window.speechSynthesis.cancel();
      }
    };
  },[selectedVoice,isIntroPhase,currentIndex])

  useEffect(()=>{
    if(isIntroPhase) return;
    if(currentQuestion) return;

    const timer = setInterval(()=>{
      setTimeLeft((prev)=>{
        if(prev <= 1){
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      })
    },1000)

    return ()=> clearInterval(timer);

  },[isIntroPhase,currentIndex])

  return (
    <div className="min-h-screen bg-linear-to-br form bg-emerald-50 via-white to-teal-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-350 min-h-[80vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col lg:flex-row overflow-hidden">
        {/*Video Section*/}
        
        <div className="w-full lg:w-[35%] bg white flex flex-col items-center p-6 space-y-6 border-r border-gray-200">
          <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl">
            <video src={videoSource} 
            key={videoSource}
            ref={videoRef}
            muted
            playsInline
            preload="auto"
            className="w-full h-auto object-cover"/>
          </div>

          {/* subtitle*/}

          {subtitle && (
            <div className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-4">
              <p className="text-gray-700 text-sm sm:text-base font-medium text-center leading-relaxed ">
                {subtitle}
              </p>
            </div>
          )}

          {/* Timer Section */}

          <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                Interview Status
              </span>

              {isAIPlaying && (<span className="text-sm font-semibold text-emerald-600">
                {isAIPlaying ? "AI Speaking" : ""}
              </span>)}
            </div>

            <div className="h-px bg-gray-200"></div>

            <div className="flex justify-center">
              <Timer timeLeft={timeLeft} totalTime={currentQuestion?.timeLimit || 60} />
            </div>

            <div className="h-px bg-gray-200"></div>

            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                  <span className="text-2xl font-bold text-emerald-600">{currentIndex + 1}</span>
                  <span className="text-xs text-gray-400">Current Questions</span>
              </div>

              <div>
                <span className="text-2xl font-bold text-emerald-600">{questions.length}</span>
                <span className="text-xs text-gray-400">Total Questions</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 relative">
          <h2 className="text-xl sm:text-2xl font-bold text-emerald-600 mb-6">
            AI Smart Interview
          </h2>

          {!isIntroPhase && (<div className="relative mb-6 bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
            <p className="text-xs sm:text-sm text-gray-400 mb-2">Question {currentIndex + 1} of {questions.length}</p>

            <div className="text-base sm:text-lg font-semibold text-gray-800 leading-relaxed pr-16">
              {currentQuestion?.question}
            </div>
          </div>)}

          <textarea placeholder="Type Your Answer Here..."
            className="flex-1 bg-gray-100 p-4 sm:p-6 rounded-2xl resize-none outline-none border border-gray-200 focus:ring-2 focus:ring-emerald-500 transition text-gray-800"
          />
          
          <div className="flex items-center gap-4 mt-6">
            <motion.button
            whileTap={{scale:0.9}}
            className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-black text-white shadow-lg"
            >
              <FaMicrophone size={20}/>
            </motion.button>

            <motion.button
            whileTap={{scale:0.95}}
            className="flex-1 bg-linear-to-r from-emerald-600 to-teal-500 text-white py-3 sm:py-4 rounded-2xl shadow-lg hover:opacity-90 transition font-semibold"
            >
              Submit Answer
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Interview