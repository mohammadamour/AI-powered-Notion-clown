/**
 * App-wide constants.
 */

export const APP_NAME = "Second Brain";

export const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", path: "/", icon: "brain" },
  { id: "daily-log", label: "Daily Log", path: "/daily-log", icon: "notebook-pen" },
  { id: "mind-tree", label: "Mind Tree", path: "/mind-tree", icon: "git-fork" },
] as const;

export const MOODS = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "😤", label: "Frustrated" },
  { emoji: "💡", label: "Inspired" },
  { emoji: "😴", label: "Tired" },
] as const;

export const COMMAND_PALETTE_ACTIONS = [
  { id: "dashboard", label: "Go to Dashboard", path: "/", icon: "brain", shortcut: ["G", "D"] },
  { id: "daily-log", label: "Go to Daily Log", path: "/daily-log", icon: "notebook-pen", shortcut: ["G", "L"] },
  { id: "mind-tree", label: "Go to Mind Tree", path: "/mind-tree", icon: "git-fork", shortcut: ["G", "M"] },
  { id: "quick-capture", label: "Quick Capture", path: null, icon: "zap", shortcut: ["Q"] },
] as const;

// Sample Mind Tree data for development
export const SAMPLE_MIND_TREE = {
  nodes: [
    { id: "root", label: "🧠 My Second Brain", type: "root" as const },
    { id: "coding", label: "💻 Coding", type: "branch" as const },
    { id: "fitness", label: "💪 Fitness", type: "branch" as const },
    { id: "philosophy", label: "🤔 Philosophy", type: "branch" as const },
    { id: "business", label: "📈 Business", type: "branch" as const },
    { id: "coding-rust", label: "Rust", type: "leaf" as const },
    { id: "coding-nextjs", label: "Next.js", type: "leaf" as const },
    { id: "coding-ai", label: "AI/ML", type: "leaf" as const },
    { id: "fitness-lifting", label: "Weightlifting", type: "leaf" as const },
    { id: "fitness-nutrition", label: "Nutrition", type: "leaf" as const },
    { id: "philosophy-stoicism", label: "Stoicism", type: "leaf" as const },
    { id: "philosophy-consciousness", label: "Consciousness", type: "leaf" as const },
    { id: "business-startups", label: "Startups", type: "leaf" as const },
    { id: "business-finance", label: "Finance", type: "leaf" as const },
  ],
  edges: [
    { source: "root", target: "coding" },
    { source: "root", target: "fitness" },
    { source: "root", target: "philosophy" },
    { source: "root", target: "business" },
    { source: "coding", target: "coding-rust" },
    { source: "coding", target: "coding-nextjs" },
    { source: "coding", target: "coding-ai" },
    { source: "fitness", target: "fitness-lifting" },
    { source: "fitness", target: "fitness-nutrition" },
    { source: "philosophy", target: "philosophy-stoicism" },
    { source: "philosophy", target: "philosophy-consciousness" },
    { source: "business", target: "business-startups" },
    { source: "business", target: "business-finance" },
  ],
};
