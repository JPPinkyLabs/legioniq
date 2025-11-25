import {
  Users,
  Trophy,
  Target,
  Zap,
  Wrench,
  BookOpen,
  Settings,
  HelpCircle,
  Gamepad2,
  Shield,
  Crown,
  Puzzle,
  Car,
  Dumbbell,
  Sparkles,
  Monitor,
  Smartphone,
  Circle,
  type LucideIcon,
} from "lucide-react";

/**
 * Maps option values to appropriate icons for onboarding questions
 */
export const getOptionIcon = (value: string): LucideIcon => {
  const iconMap: Record<string, LucideIcon> = {
    // Gaming styles
    casual: Sparkles,
    competitive: Trophy,
    hardcore: Zap,
    social: Users,

    // Goals
    improve_performance: Target,
    fix_technical_issues: Wrench,
    learn_strategies: BookOpen,
    optimize_settings: Settings,
    general_help: HelpCircle,

    // Genres
    fps: Target,
    rpg: Shield,
    moba: Shield,
    strategy: Puzzle,
    battle_royale: Target,
    mmorpg: Crown,
    racing: Car,
    sports: Dumbbell,
    fighting: Shield,
    puzzle: Puzzle,
    indie: Sparkles,
    other: Circle,

    // Platforms
    pc: Monitor,
    playstation: Gamepad2,
    xbox: Gamepad2,
    nintendo: Gamepad2,
    mobile: Smartphone,
  };

  return iconMap[value] || Circle;
};

