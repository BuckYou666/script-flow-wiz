import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * InstructionBar - Non-spoken guidance component
 * 
 * Displays instructional text that should NOT be spoken by reps.
 * Examples: "Wait for them to answer before speaking", workflow directives, internal notes.
 * 
 * Visual Design:
 * - Grey pill/badge style with dashed border
 * - Smaller italic font in muted color
 * - Optional icon for visual clarity
 * - Always appears ABOVE the script content
 * - Clearly distinct from spoken dialogue
 */

interface InstructionBarProps {
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const InstructionBar = ({ 
  icon = <Clock className="h-3.5 w-3.5 flex-shrink-0" />,
  children,
  className 
}: InstructionBarProps) => {
  if (!children) {
    return null;
  }

  return (
    <div className={cn("instruction-bar", className)}>
      {icon && <span className="instruction-bar__icon">{icon}</span>}
      <span className="instruction-bar__text">{children}</span>
    </div>
  );
};
