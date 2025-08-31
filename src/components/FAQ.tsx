import React, { useState } from "react";

const faqs = [
  {
    question: "What services does your website offer?",
    answer:
      "Our website provides comprehensive body type analysis, skin tone analysis, personality analysis, face shape analysis, hair texture and color analysis, and eye color analysis. Based on these results, we recommend suitable products like clothing, makeup, accessories, and footwear.",
  },
  {
    question: "How do I use the body type analysis service?",
    answer:
      "Simply upload your photo and answer a few questions. Our AI will analyze your body proportions and suggest clothing styles that enhance your look.",
  },
  {
    question: "What is skin tone analysis, and how can it help me?",
    answer:
      "Skin tone analysis helps determine the undertone of your skin to suggest the best-suited colors in makeup, clothing, and hair dye.",
  },
  {
    question: "Can I get recommendations for accessories and footwear as well?",
    answer:
      "Yes! Based on your personal style and analysis results, we suggest matching accessories and footwear that align with your look.",
  },
  {
    question: "How accurate are the recommendations?",
    answer:
      "Our recommendations are powered by AI and refined by stylists, offering 85–90% accuracy for most users.",
  },
  {
    question: "What kind of recommendations can I find on your website?",
    answer:
      "You'll receive personalized suggestions for clothing, hairstyles, makeup shades, accessories, and footwear suited to your features.",
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12" style={{ backgroundColor: '#251F1E' }}>
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(#000_1px,transparent_1px),linear-gradient(90deg,#000_1px,transparent_1px)] bg-[size:32px_32px] opacity-30 pointer-events-none z-0" />

      {/* FAQ Content with side panels */}
      <div className="relative w-full max-w-5xl mx-auto">
        {/* FAQ Content */}
        <div className="relative z-20 w-full">
          {/* Header */}
          <div className="text-center mb-12 px-4">
            <span className="text-neutral-400 text-sm sm:text-base font-semibold tracking-widest">🅠 FAQS</span>
            <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mt-3">
              Frequently Asked Questions
            </h1>
            <p className="text-neutral-400 text-sm sm:text-base mt-3">
              Find questions and answers related to the design system,
              <br className="hidden sm:block" />
              purchase, updates, and support.
            </p>
          </div>

          {/* Accordion Container with Side Panels */}
          <div className="relative max-w-2xl mx-auto">
            {/* Side Panels - positioned with exactly 30px distance from FAQ content */}
            <div className="hidden sm:block absolute top-0 -left-8 w-12 sm:w-16 md:w-20 lg:w-24 h-full rounded-bl-3xl z-10" style={{ left: '-115px', backgroundColor: '#313131' }} />
            <div className="hidden sm:block absolute top-0 -right-8 w-12 sm:w-16 md:w-20 lg:w-24 h-full rounded-br-3xl z-10" style={{ right: '-115px', backgroundColor: '#313131' }} />

            {/* Individual FAQ Items */}
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div 
                  key={idx} 
                  className={`rounded-xl shadow-lg overflow-hidden transition-all duration-200 ${
                    openIndex === idx 
                      ? "bg-[#313131]" 
                      : "bg-[#313131]/60"
                  }`}
                >
                  <div className="px-6 py-4">
                    <button
                      className="w-full text-left flex justify-between items-center transition-all duration-200"
                      onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
                    >
                      <span className="text-white text-base sm:text-lg font-semibold pr-4">
                        {faq.question}
                      </span>
                      <span className="text-neutral-400 text-xl font-bold flex-shrink-0">
                        {openIndex === idx ? "×" : "+"}
                      </span>
                    </button>
                    {openIndex === idx && (
                      <div className="text-neutral-200 mt-4 pr-8 transition-all duration-300 ease-in-out">
                        <p className="text-base sm:text-lg leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQSection;
