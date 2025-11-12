import { cn } from "@/lib/utils";

/**
 * ScriptCard - Reusable container for script content
 * 
 * This component wraps the actual spoken lines that reps should say.
 * It provides consistent styling, centering, and visual distinction from
 * instructional content (InstructionBar).
 * 
 * Visual Design:
 * - Centered white card with subtle gradient background
 * - Soft border and shadow
 * - Max-width for readability
 * - Text centered
 * - Generous padding
 * 
 * Usage:
 * - Wrap all spoken dialogue content in this component
 * - Place after InstructionBar (if present)
 * - Contains dynamic tokens, paragraphs, and formatted script text
 */

interface ScriptCardProps {
  children: React.ReactNode;
  className?: string;
}

export const ScriptCard = ({ children, className }: ScriptCardProps) => {
  return (
    <div className={cn(
      "script-card w-full max-w-[840px] mx-auto px-10 py-8",
      "rounded-[14px] bg-gradient-to-br from-[#f9fbff] to-[#f5f7fd]",
      "border border-[#e3e9f7] shadow-sm",
      "text-center flex flex-col gap-3",
      className
    )}>
      {children}
    </div>
  );
};
