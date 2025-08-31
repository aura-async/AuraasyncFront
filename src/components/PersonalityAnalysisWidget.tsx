"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const mbtiQuestions = [
  {
    question: "You find it takes effort to introduce yourself to other people.",
    dimension: "IE",
    direction: 1,
  },
  {
    question:
      "You get energized going to social events that involve many interactions.",
    dimension: "IE",
    direction: -1,
  },
  {
    question: "You do not mind being at the center of attention.",
    dimension: "IE",
    direction: -1,
  },
  {
    question: "You often prefer to work alone.",
    dimension: "IE",
    direction: 1,
  },
  {
    question: "You consider yourself more practical than creative.",
    dimension: "SN",
    direction: 1,
  },
  {
    question:
      "You often spend time exploring unrealistic and impractical yet intriguing ideas.",
    dimension: "SN",
    direction: -1,
  },
  {
    question: "You often contemplate the reasons for human existence.",
    dimension: "SN",
    direction: -1,
  },
  {
    question: "Your travel plans are usually well thought out.",
    dimension: "SN",
    direction: 1,
  },
  {
    question:
      "Logic is usually more important than heart when it comes to making important decisions.",
    dimension: "TF",
    direction: 1,
  },
  {
    question:
      "Winning a debate matters less to you than making sure no one gets upset.",
    dimension: "TF",
    direction: -1,
  },
  {
    question:
      "You often have a hard time understanding other people's feelings.",
    dimension: "TF",
    direction: 1,
  },
  {
    question: "You rarely worry about how your actions affect other people.",
    dimension: "TF",
    direction: 1,
  },
  {
    question: "Your home and work environments are quite tidy.",
    dimension: "JP",
    direction: 1,
  },
  {
    question:
      "Deadlines seem to you to be of relative rather than absolute importance.",
    dimension: "JP",
    direction: -1,
  },
  {
    question:
      "Keeping your options open is more important than having a to-do list.",
    dimension: "JP",
    direction: -1,
  },
  {
    question: "You like to have a to-do list for each day.",
    dimension: "JP",
    direction: 1,
  },
];

const scale = [
  { label: "Strongly Disagree", value: 1 },
  { label: "Disagree", value: 2 },
  { label: "Neutral", value: 3 },
  { label: "Agree", value: 4 },
  { label: "Strongly Agree", value: 5 },
];

function calculateMbti(answers: number[]): string {
  let scores = { IE: 0, SN: 0, TF: 0, JP: 0 };
  mbtiQuestions.forEach((q, i) => {
    scores[q.dimension as keyof typeof scores] +=
      (answers[i] - 3) * q.direction;
  });
  let mbti = "";
  mbti += scores.IE > 0 ? "I" : "E";
  mbti += scores.SN > 0 ? "S" : "N";
  mbti += scores.TF > 0 ? "T" : "F";
  mbti += scores.JP > 0 ? "J" : "P";
  return mbti;
}

interface PersonalityAnalysisWidgetProps {
  onComplete?: (mbti: string) => void;
}

const PersonalityAnalysisWidget: React.FC<PersonalityAnalysisWidgetProps> = ({
  onComplete,
}) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>(
    Array(mbtiQuestions.length).fill(3)
  );
  const [showResult, setShowResult] = useState(false);
  const [mbti, setMbti] = useState("");
  const [showNext, setShowNext] = useState(false);

  const handleChange = (value: number) => {
    setAnswers((a) => a.map((v, i) => (i === step ? value : v)));
  };
  const handleNext = () => {
    if (step < mbtiQuestions.length - 1) setStep((s) => s + 1);
    else {
      const result = calculateMbti(answers);
      setMbti(result);
      setShowResult(true);
      setShowNext(true);
    }
  };
  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };
  return (
    <div className="flex flex-col items-center justify-center   text-white p-4">
      {!showResult ? (
        <div className="w-full ">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4 }}
              className="bg-[#353333] p-8  rounded-3xl shadow-lg flex flex-col md:flex-row  w-full md:w-[70vw] mx-auto"
            >
              {/* Left Side (Question + Buttons) */}
              <div className="flex flex-col justify-between w-full md:w-1/2 pr-0 md:pr-8 mb-8 md:mb-0 md:border-b  md:border-r border-white/20">
                <div className="md:text-6xl text-2xl font-semibold leading-snug">
                  {mbtiQuestions[step].question}
                </div>

                <div className=" flex-col gap-4 mt-8 hidden md:flex">
                  <button
                    className="flex-1 w-full px-6 py-3 bg-gray-600 rounded-xl text-lg font-semibold hover:bg-gray-700 transition disabled:opacity-50"
                    onClick={handleBack}
                    disabled={step === 0}
                  >
                    Back
                  </button>
                  <button
                    className="flex-1 w-full px-6 py-3 bg-gray-600  rounded-xl text-lg font-semibold hover:bg-gray-300 transition"
                    onClick={handleNext}
                  >
                    {step === mbtiQuestions.length - 1 ? "Finish" : "Next"}
                  </button>
                </div>
              </div>

              {/* Right Side (Options) */}
              <div className="flex flex-col gap-6 w-full md:w-1/2 pl-0 md:pl-8">
                {scale.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-4 border-b-2 border-white cursor-pointer hover:bg-white/5 md:p-5 p-2  transition"
                  >
                    <input
                      type="radio"
                      name={`q${step}`}
                      value={opt.value}
                      checked={answers[step] === opt.value}
                      onChange={() => handleChange(opt.value)}
                      className=" w-5 h-5 accent-gray-600"
                    />
                    <span className="md:text-3xl  text-xl">{opt.label}</span>
                  </label>
                ))}
                 <div className=" flex-col gap-4 mt-8 md:hidden flex">
                  <button
                    className="flex-1 w-full px-6 py-3 bg-gray-600 rounded-xl text-lg font-semibold hover:bg-gray-700 transition disabled:opacity-50"
                    onClick={handleBack}
                    disabled={step === 0}
                  >
                    Back
                  </button>
                  <button
                    className="flex-1 w-full px-6 py-3 bg-gray-600  rounded-xl text-lg font-semibold hover:bg-gray-300 transition"
                    onClick={handleNext}
                  >
                    {step === mbtiQuestions.length - 1 ? "Finish" : "Next"}
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg flex flex-col items-center w-full max-w-xl">
          <div className="text-2xl font-bold text-green-400 mb-4">
            Your MBTI Type: {mbti}
          </div>
          {showNext && (
            <button
              className="mt-4 px-8 py-3 bg-indigo-600 rounded-xl text-xl font-bold hover:bg-indigo-700 transition"
              onClick={() => onComplete && onComplete(mbti)}
            >
              Next
            </button>
          )}
          <button
            className="mt-4 px-8 py-3 bg-gray-600 rounded-xl text-xl font-bold hover:bg-gray-700 transition"
            onClick={() => setShowResult(false)}
          >
            Retake Quiz
          </button>
        </div>
      )}
    </div>
  );
};

export default PersonalityAnalysisWidget;
