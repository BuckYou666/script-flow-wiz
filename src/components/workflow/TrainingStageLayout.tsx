import { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * TrainingStageLayout - Unified Layout Component for All Workflow Nodes
 * 
 * This component provides a consistent layout structure for all training stages,
 * ensuring that every node (Website Signup Lead, Choose Contact Method, Introduction Call, etc.)
 * follows the same visual and functional patterns.
 * 
 * Height Calculation Logic:
 * - Main card container: calc(100vh - 12rem) to fit within viewport on standard laptop screens (1366×768, 1920×1080)
 *   - 12rem accounts for: top navigation bar (~4rem) + page margins/padding (~8rem)
 * - Script panel: Uses flex-grow with min-height to fill available space
 * - NO max-height on script panel = no inner scrollbar
 * - If content exceeds viewport, the PAGE scrolls (not an inner container)
 * 
 * Layout Structure:
 * 1. Header (fixed at top): stage badges, title, description, action buttons
 * 2. Instruction Bar (optional): non-script guidance like "Wait for them to answer..."
 * 3. Script Panel (flexible): main content area that grows to fit content
 * 4. Footer Controls (optional): navigation buttons like Back/Next
 * 5. Next Steps Section (fixed at bottom, inside border): action cards for next stages
 * 
 * Future Notes:
 * - All new workflow nodes MUST use this layout component
 * - Do NOT add custom height calculations in individual node components
 * - Do NOT create inner scrolling containers - let the page scroll naturally
 */

interface TrainingStageLayoutProps {
  // Header section
  header: ReactNode;
  
  // Optional instruction bar (e.g., "Wait for them to answer before speaking")
  instructionBar?: ReactNode;
  
  // Main script/content panel
  scriptPanel: ReactNode;
  
  // Optional footer controls (e.g., Back/Next buttons)
  footerControls?: ReactNode;
  
  // Next steps section (action cards)
  nextSteps?: ReactNode;
  
  // Custom class names
  className?: string;
  
  // Click handlers
  onCardClick?: () => void;
  onContentClick?: (e: React.MouseEvent) => void;
  
  // Expanded state
  isExpanded: boolean;
}

export const TrainingStageLayout = ({
  header,
  instructionBar,
  scriptPanel,
  footerControls,
  nextSteps,
  className,
  onCardClick,
  onContentClick,
  isExpanded,
}: TrainingStageLayoutProps) => {
  return (
    <Card
      className={cn(
        "transition-all duration-300 cursor-pointer hover:shadow-lg",
        isExpanded && "ring-2 ring-primary max-w-[85%] mx-auto border-border/50 shadow-sm",
        className
      )}
      style={isExpanded ? {
        // Main container height calculated to fit viewport on standard laptops
        // Accounts for: top nav (4rem) + page margins/padding (8rem) = 12rem total
        minHeight: 'calc(100vh - 12rem)',
        display: 'flex',
        flexDirection: 'column',
      } : undefined}
      onClick={onCardClick}
    >
      {/* Header Section - Fixed at Top */}
      <CardHeader className={cn(isExpanded && "py-3 flex-shrink-0")}>
        {header}
      </CardHeader>

      {isExpanded && (
        <CardContent
          className="pt-0 pb-4 flex flex-col gap-3"
          onClick={onContentClick}
        >
          {/* Instruction Bar - Optional non-script guidance */}
          {instructionBar && (
            <div className="flex-shrink-0">
              {instructionBar}
            </div>
          )}

          {/* Main Script Panel - Grows to fit content, NO max-height, NO inner scroll */}
          <div className="flex-shrink-0 flex-grow-0">
            {scriptPanel}
          </div>

          {/* Footer Controls - Optional navigation buttons */}
          {footerControls && (
            <div className="flex-shrink-0">
              {footerControls}
            </div>
          )}

          {/* Next Steps Section - Always at bottom, inside border */}
          {nextSteps && (
            <div className="flex-shrink-0 pt-4 mt-2 border-t border-[#E4E7EB]">
              <h4 className="font-semibold text-xs text-[#8A8F98] uppercase tracking-wider mb-3">
                Next Steps
              </h4>
              {nextSteps}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
