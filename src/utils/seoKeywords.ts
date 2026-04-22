interface KeywordBankOptions {
  coreTopics: string[];
  brand?: string;
  limit?: number;
}

const modifiers = [
  "best",
  "top",
  "trusted",
  "verified",
  "affordable",
  "professional",
  "easy",
  "fast",
  "secure",
  "complete",
  "beginner",
  "advanced",
  "step by step",
  "practical",
  "modern",
  "proven",
  "scalable",
  "reliable",
  "high converting",
  "local",
];

const intents = [
  "guide",
  "tips",
  "strategy",
  "playbook",
  "checklist",
  "tutorial",
  "workflow",
  "examples",
  "ideas",
  "plan",
  "blueprint",
  "framework",
  "tools",
  "resources",
  "templates",
];

const markets = [
  "Nigeria",
  "Lagos",
  "Abuja",
  "Port Harcourt",
  "online",
  "WhatsApp",
  "Instagram",
  "ecommerce",
  "social commerce",
  "small business",
  "facebook",
  "tiktok",
  "youtube",
  "x twitter",
  "threads",
  "digital marketing",
  "online branding",
  "buyer trust",
  "conversion optimization",
  "local business discovery",
];

export const generateKeywordBank = ({ coreTopics, brand = "SteerSolo", limit = 3000 }: KeywordBankOptions): string[] => {
  const unique = new Set<string>();

  // Keep explicit core topics first.
  coreTopics.forEach((topic) => {
    unique.add(topic);
    unique.add(`${topic} ${brand}`);
    unique.add(`${brand} ${topic}`);
  });

  for (const modifier of modifiers) {
    for (const intent of intents) {
      for (const market of markets) {
        const topic = coreTopics[unique.size % coreTopics.length];
        unique.add(`${modifier} ${topic} ${intent} ${market}`);
        unique.add(`${topic} ${intent} for ${market}`);
        unique.add(`${brand} ${topic} ${market} ${intent}`);

        if (unique.size >= limit) {
          return Array.from(unique).slice(0, limit);
        }
      }
    }
  }

  return Array.from(unique).slice(0, limit);
};
