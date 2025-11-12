import { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * TrainingStageLayout - Unified Layout Component for All Workflow Nodes
 * 
 * This component provides a consistent layout structure for all training stages,
 * ensuring that every node (Website Signup Lead, Choose Contact Method, Introduction Call, etc.)
 * follows the same visual and functional patterns.
 * 
 * Height Calculation Logic:
 * - Main container: calc(100vh - 64px - 72px - 40px)
 *   - 64px = top global nav (Start Over / Edit Mode / Stage Guide)
 *   - 72px = "Currently Learning" strip
 *   - 40px = extra breathing room for margins
 * - Body flexes to fill remaining space with script centered vertically
 * - Footer (Back/Next) always hugs bottom of card, never in scrollable region
 * - Scrolling happens at PAGE level, not inside the card
 * 
 * Layout Structure:
 * 1. Header (top): chips, title, subtitle, header actions
 * 2. Mode Bar (optional): Mode / Step indicator
 * 3. Body (flexible, fills space): contains script content, vertically centered
 * 4. Footer (bottom, fixed): Back/Next controls
 * 5. Next Steps Section (below footer, inside border): action cards for next stages
 * 
 * Future Notes:
 * - All new workflow nodes MUST use this layout component
 * - Do NOT add custom height calculations in individual node components
 * - Do NOT create inner scrolling containers - let the page scroll naturally
 */

interface TrainingStageLayoutProps {
  // Header content
  title: string;
  subtitle?: string;
  chips?: ReactNode;
  headerRight?: ReactNode;
  
  // Mode bar (e.g., "Mode: Introduction Call | Step 1 of 5")
  modeBar?: ReactNode;
  
  // Main script content (should include InstructionBar + ScriptCard)
  children: ReactNode;
  
  // Footer controls (Back/Next buttons)
  footer?: ReactNode;
  
  // Next steps section (action cards)
  nextSteps?: ReactNode;
  
  // Custom class names
  className?: string;
  
  // Click handlers
  onClick?: () => void;
  
  // Expanded state
  isExpanded: boolean;
  
  // Content mode: true for scrollable content like LeadOverview, false for centered scripts
  isScrollableContent?: boolean;
}

export const TrainingStageLayout = ({
  title,
  subtitle,
  chips,
  headerRight,
  modeBar,
  children,
  footer,
  nextSteps,
  className,
  onClick,
  isExpanded,
  isScrollableContent = false,
}: TrainingStageLayoutProps) => {
  if (!isExpanded) {
    return (
      <div
        className={cn(
          "transition-all duration-300 cursor-pointer hover:shadow-lg rounded-lg border bg-card p-6",
          className
        )}
        onClick={onClick}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            {chips && <div className="flex flex-wrap gap-2 mb-2">{chips}</div>}
            <h2 className="text-xl font-semibold">{title}</h2>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          {headerRight}
        </div>
      </div>
    );
  }

  return (
    <section 
      className={cn("stage", className)}
      style={{ height: 'calc(100vh - 160px)' }}
    >
      <div className="flex flex-col h-full relative">
        {/* Header - fixed at top */}
        <header className="stage__header flex-shrink-0">
          <div className="stage__header-left">
            {chips && <div className="stage__chips">{chips}</div>}
            <div>
              <h2 className="stage__title">{title}</h2>
              {subtitle && <p className="stage__subtitle">{subtitle}</p>}
            </div>
          </div>
          {headerRight && <div className="stage__header-right">{headerRight}</div>}
        </header>

        {/* Mode Bar - fixed */}
        {modeBar && <div className="stage__mode flex-shrink-0">{modeBar}</div>}

        {/* Scrollable content area - ONLY this scrolls */}
        {isScrollableContent ? (
          <div className="flex-1 overflow-y-auto py-4 min-h-0">
            {children}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto py-4 min-h-0">
            <div className="flex items-center justify-center min-h-[240px]">
              {children}
            </div>
          </div>
        )}

        {/* Sticky Footer - always visible at bottom */}
        {footer && (
          <div className="flex-shrink-0 sticky bottom-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90 border-t border-border pt-4 pb-2 -mx-6 px-6">
            {footer}
          </div>
        )}

        {/* Next Steps Section - below sticky footer */}
        {nextSteps && (
          <div className="flex-shrink-0 pt-3 pb-2 border-t border-border">
            <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Next Steps
            </h4>
            {nextSteps}
          </div>
        )}
      </div>
    </section>
  );
};
