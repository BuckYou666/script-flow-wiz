import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * InstructionBar - Dedicated component for non-script guidance
 * 
 * This component displays instructional text that should NOT be spoken by reps
 * (e.g., "Wait for them to answer before speaking", workflow directives, internal notes).
 * 
 * Visual Design:
 * - Light blue/grey background to distinguish from script content
 * - Smaller italic font in muted grey color
 * - Optional icon for visual clarity
 * - Subtle rounded corners and border
 * 
 * Usage:
 * - Only shown when there is actual instruction text to display
 * - Always appears ABOVE the script content
 * - Conditionally rendered based on contact method (e.g., only for calls, not texts)
 */

interface InstructionBarProps {
  text: string;
  icon?: React.ReactNode;
  className?: string;
}

export const InstructionBar = ({ 
  text, 
  icon = <Clock className="h-4 w-4 text-blue-600/70 dark:text-blue-400/70 flex-shrink-0 mt-0.5" />,
  className 
}: InstructionBarProps) => {
  if (!text || !text.trim()) {
    return null;
  }

  return (
    <div className={cn(
      "flex items-start gap-2.5 py-2.5 px-4",
      "bg-blue-50/50 dark:bg-blue-950/20",
      "rounded-lg border border-blue-200/40 dark:border-blue-800/40",
      className
    )}>
      {icon}
      <p className="text-sm italic text-[#8A8F98] leading-relaxed">
        {text}
      </p>
    </div>
  );
};
