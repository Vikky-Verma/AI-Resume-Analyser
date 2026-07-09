import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Send,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Circle,
  Clock,
  Users,
  Cpu,
  Code2,
} from "lucide-react";

const ROUND_ICONS = {
  HR: Users,
  TECHNICAL: Cpu,
  DSA: Code2,
};

const ROUND_TIME = {
  HR: 90,
  TECHNICAL: 120,
  DSA: 240,
};

const scoreColor = (score) => {
  if (score >= 7) return { text: "text-emerald-400", bg: "bg-emerald-950", border: "border-emerald-800" };
  if (score >= 4) return { text: "text-amber-400", bg: "bg-amber-950", border: "border-amber-800" };
  return { text: "text-red-400", bg: "bg-red-950", border: "border-red-800" };
};

const InterviewRoom = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roundIndex, setRoundIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [finishing, setFinishing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90);
  const [camOn, setCamOn] = useState(false);
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const { data } = await API.get(`/interview/${interviewId}`);
        setInterview(data.interview);
        const rounds = data.interview.rounds;
        outer: for (let r = 0; r < rounds.length; r++) {
          for (let q = 0; q < rounds[r].questions.length; q++) {
            if (rounds[r].questions[q].score === null || rounds[r].questions[q].score === undefined) {
              setRoundIndex(r);
              setQuestionIndex(q);
              break outer;
            }
          }
        }
      } catch {
        toast.error("Failed to load interview");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchInterview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewId]);

  useEffect(() => {
    if (camOn) {
      navigator.mediaDevices
        ?.getUserMedia({ video: true })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(() => {
          toast.error("Camera permission denied");
          setCamOn(false);
        });
    } else if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [camOn]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setAnswer((prev) => (prev ? prev.trim() + " " : "") + transcript);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    return () => recognition.stop();
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setListening(true);
      } catch {
        /* already started */
      }
    }
  };

  const currentRound = interview?.rounds?.[roundIndex];
  const currentQuestion = currentRound?.questions?.[questionIndex];
  const totalQuestions = interview?.rounds?.reduce((a, r) => a + r.questions.length, 0) || 15;
  const answeredCount =
    interview?.rounds
      ?.slice(0, roundIndex)
      .reduce((a, r) => a + r.questions.length, 0) + questionIndex || 0;

  const resetTimer = useCallback(() => {
    setTimeLeft(ROUND_TIME[currentRound?.type] || 90);
  }, [currentRound]);

  useEffect(() => {
    resetTimer();
  }, [roundIndex, questionIndex, resetTimer]);

  useEffect(() => {
    if (lastResult) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastResult, roundIndex, questionIndex]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const handleSubmit = async () => {
    if (!answer.trim()) {
      toast.error("Write or speak an answer first");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await API.post(`/interview/${interviewId}/answer`, {
        roundIndex,
        questionIndex,
        answer,
      });
      setLastResult(data);
      if (listening) toggleListening();
    } catch {
      toast.error("Failed to score answer");
    } finally {
      setSubmitting(false);
    }
  };

  const isLastQuestionOfRound = questionIndex === (currentRound?.questions.length || 1) - 1;
  const isLastRound = roundIndex === (interview?.rounds.length || 1) - 1;

  const handleNext = async () => {
    setLastResult(null);
    setAnswer("");

    if (!isLastQuestionOfRound) {
      setQuestionIndex((q) => q + 1);
      return;
    }
    if (!isLastRound) {
      setRoundIndex((r) => r + 1);
      setQuestionIndex(0);
      return;
    }

    setFinishing(true);
    try {
      await API.post(`/interview/${interviewId}/complete`);
      toast.success("Interview complete!");
      navigate(`/interview/${interviewId}/report`);
    } catch {
      toast.error("Failed to generate report");
      setFinishing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090f] flex items-center justify-center">
        <Loader2 size={32} className="text-violet-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090f]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-white">
              {interview.role} @ {interview.company}
            </h1>
            <p className="text-slate-500 text-xs mt-1">{interview.level} level mock interview</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCamOn((c) => !c)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                camOn
                  ? "bg-violet-500/10 border-violet-500 text-violet-300"
                  : "bg-[#11151d] border-[#232838] text-slate-400 hover:border-violet-500/40"
              }`}
            >
              {camOn ? <Video size={14} /> : <VideoOff size={14} />}
              Camera
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
          {interview.rounds.map((round, i) => {
            const Icon = ROUND_ICONS[round.type] || Users;
            const isDone = round.questions.every((q) => q.score !== null && q.score !== undefined);
            const isCurrent = i === roundIndex;
            return (
              <div
                key={round.type}
                className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                  isCurrent
                    ? "bg-violet-500/10 border-violet-500 text-violet-300"
                    : isDone
                    ? "bg-emerald-950/40 border-emerald-800 text-emerald-400"
                    : "bg-[#11151d] border-[#232838] text-slate-500"
                }`}
              >
                {isDone ? <CheckCircle2 size={15} /> : <Icon size={15} />}
                <span className="hidden sm:inline">{round.label}</span>
                {round.score !== null && round.score !== undefined && (
                  <span className="ml-auto text-xs opacity-80">{round.score}/10</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="w-full h-1.5 bg-[#11151d] rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-violet-500 transition-all duration-500"
            style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-5">
          <div className="bg-[#11151d] border border-[#232838] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                {currentRound.label} — Question {questionIndex + 1} of {currentRound.questions.length}
              </p>
              <div
                className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                  timeLeft <= 10 ? "bg-red-950 text-red-400" : "bg-[#1a1f2e] text-slate-400"
                }`}
              >
                <Clock size={12} /> {formatTime(timeLeft)}
              </div>
            </div>

            <p className="text-white text-lg font-semibold leading-relaxed mb-6">
              {currentQuestion.question}
            </p>

            {!lastResult ? (
              <>
                <textarea
                  rows={currentRound.type === "DSA" ? 10 : 6}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder={
                    currentRound.type === "DSA"
                      ? "Explain your approach, then write pseudocode or code here..."
                      : "Type your answer here, or use the mic..."
                  }
                  className={`w-full bg-[#1a1f2e] border border-[#232838] rounded-xl p-4 text-sm text-white placeholder-slate-500 outline-none focus:border-violet-500 transition-colors resize-y mb-4 ${
                    currentRound.type === "DSA" ? "font-mono" : ""
                  }`}
                />
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <button
                    onClick={toggleListening}
                    disabled={!speechSupported}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all disabled:opacity-30 ${
                      listening
                        ? "bg-red-500/10 border-red-500 text-red-300 animate-pulse"
                        : "bg-[#1a1f2e] border-[#232838] text-slate-300 hover:border-violet-500/40"
                    }`}
                    title={speechSupported ? "Speak your answer" : "Voice input not supported in this browser"}
                  >
                    {listening ? <MicOff size={15} /> : <Mic size={15} />}
                    {listening ? "Listening..." : "Speak Answer"}
                  </button>

                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center gap-2 px-5 py-2.5 bg-violet-500 hover:bg-violet-600 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={15} className="animate-spin" /> Scoring...
                      </>
                    ) : (
                      <>
                        <Send size={15} /> Submit Answer
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div
                  className={`rounded-xl p-4 border ${scoreColor(lastResult.score).bg} ${
                    scoreColor(lastResult.score).border
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Answer Score
                    </p>
                    <p className={`text-2xl font-extrabold ${scoreColor(lastResult.score).text}`}>
                      {lastResult.score}/10
                    </p>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{lastResult.feedback}</p>
                </div>

                <button
                  onClick={handleNext}
                  disabled={finishing}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-violet-500 hover:bg-violet-600 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all"
                >
                  {finishing ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Generating report...
                    </>
                  ) : isLastQuestionOfRound && isLastRound ? (
                    <>
                      Finish Interview <ChevronRight size={15} />
                    </>
                  ) : (
                    <>
                      Next Question <ChevronRight size={15} />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-[#11151d] border border-[#232838] rounded-2xl overflow-hidden aspect-video flex items-center justify-center">
              {camOn ? (
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-600">
                  <VideoOff size={22} />
                  <span className="text-[10px]">Camera off</span>
                </div>
              )}
            </div>

            <div className="bg-[#11151d] border border-[#232838] rounded-2xl p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                {currentRound.label}
              </p>
              <div className="space-y-2">
                {currentRound.questions.map((q, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    {q.score !== null && q.score !== undefined ? (
                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    ) : i === questionIndex ? (
                      <Circle size={13} className="text-violet-400 shrink-0" />
                    ) : (
                      <Circle size={13} className="text-slate-600 shrink-0" />
                    )}
                    <span
                      className={
                        i === questionIndex
                          ? "text-white font-semibold"
                          : q.score !== null && q.score !== undefined
                          ? "text-slate-400"
                          : "text-slate-600"
                      }
                    >
                      Question {i + 1}
                    </span>
                    {q.score !== null && q.score !== undefined && (
                      <span className="ml-auto text-slate-500">{q.score}/10</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewRoom;