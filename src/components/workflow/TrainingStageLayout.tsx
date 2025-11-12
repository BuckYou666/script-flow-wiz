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
      className={cn(
        "stage mx-auto px-6 py-4 rounded-2xl bg-background shadow-sm border border-border",
        "flex flex-col max-w-[980px]",
        className
      )}
      style={{
        minHeight: 'calc(100vh - 64px - 72px - 40px)',
      }}
    >
      {/* Header */}
      <header className="stage__header flex items-start justify-between gap-4 mb-2">
        <div className="stage__header-left flex flex-col gap-1">
          {chips && <div className="stage__chips flex flex-wrap gap-2">{chips}</div>}
          <div>
            <h2 className="stage__title text-[20px] font-semibold m-0">{title}</h2>
            {subtitle && <p className="stage__subtitle text-[13px] text-muted-foreground m-0 mt-1">{subtitle}</p>}
          </div>
        </div>
        {headerRight && <div className="stage__header-right">{headerRight}</div>}
      </header>

      {/* Mode Bar */}
      {modeBar && <div className="stage__mode my-2">{modeBar}</div>}

      {/* Body - script area that grows and centers content */}
      <div className="stage__body flex-1 flex flex-col">
        <div className="stage__script flex-1 flex items-center justify-center">
          {children}
        </div>

        {/* Footer - always at bottom of card */}
        {footer && (
          <div className="stage__footer mt-4 flex justify-center">
            {footer}
          </div>
        )}
      </div>

      {/* Next Steps Section - inside border */}
      {nextSteps && (
        <div className="flex-shrink-0 pt-4 mt-4 border-t border-[#E4E7EB]">
          <h4 className="font-semibold text-xs text-[#8A8F98] uppercase tracking-wider mb-3">
            Next Steps
          </h4>
          {nextSteps}
        </div>
      )}
    </section>
  );
};
