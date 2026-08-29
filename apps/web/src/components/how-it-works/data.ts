/**
 * How It Works — Step Definitions & Artifact Data
 * The single source of truth for the 6-step live case journey (RKS-000001)
 */

export interface HowItWorksStep {
  id: number;
  num: string;
  key: string;
  title: string;
  description: string;
  accent: "orange" | "amber" | "green" | "blue" | "indigo" | "emerald";
  badgeIcon: string;
}

export const CASE_METADATA = {
  caseId: "RKS-000001",
  category: "Financial cyber fraud",
  tag: "Financial fraud",
  amount: "₹5,000",
  method: "UPI — SBI",
  time: "Today, 10:30 AM",
};

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    id: 1,
    num: "01",
    key: "tell",
    title: "You tell us",
    description: "Call, send a voice note, message, or upload a screenshot.",
    accent: "orange",
    badgeIcon: "voice",
  },
  {
    id: 2,
    num: "02",
    key: "understand",
    title: "We understand",
    description: "Raksha extracts the important details and organizes them clearly.",
    accent: "amber",
    badgeIcon: "extract",
  },
  {
    id: 3,
    num: "03",
    key: "verify",
    title: "We verify",
    description: "We cross-check information and evidence across multiple sources.",
    accent: "green",
    badgeIcon: "shield",
  },
  {
    id: 4,
    num: "04",
    key: "confirm",
    title: "You confirm",
    description: "You review the details and confirm before we submit anything.",
    accent: "indigo",
    badgeIcon: "user",
  },
  {
    id: 5,
    num: "05",
    key: "cap",
    title: "CAP takes over",
    description: "Raksha uses the Civic Action Protocol to file the right report with the right service.",
    accent: "blue",
    badgeIcon: "nodes",
  },
  {
    id: 6,
    num: "06",
    key: "update",
    title: "You stay updated",
    description: "Track the status. Get notified. Respond when it matters.",
    accent: "emerald",
    badgeIcon: "bell",
  },
];
