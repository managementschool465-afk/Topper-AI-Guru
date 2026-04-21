// Note: Yeh ek basic setup hai, iske liye 'i18next' package use hota hai.
export const translations = {
  hi: {
    welcome: "नमस्ते",
    start_learning: "पढ़ना शुरू करें",
    points: "पॉइंट्स",
    ai_teacher: "एआई टीचर",
    doubt_solver: "डाउट सॉल्वर",
  },
  en: {
    welcome: "Welcome",
    start_learning: "Start Learning",
    points: "Points",
    ai_teacher: "AI Teacher",
    doubt_solver: "Doubt Solver",
  }
};

// Language detect karne ka function
export const getLang = () => {
  return localStorage.getItem("app_lang") || "hi";
};

// Text return karne ka helper
export const t = (key: keyof typeof translations.hi) => {
  const lang = getLang() as "hi" | "en";
  return translations[lang][key] || key;
};
