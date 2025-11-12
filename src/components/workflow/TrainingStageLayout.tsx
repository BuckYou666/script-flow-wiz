import { ReactNode, useRef, useEffect } from "react";
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
  const rootRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    
    const ro = new ResizeObserver(() => {
      const h = headerRef.current?.offsetHeight ?? 0;
      const f = footerRef.current?.offsetHeight ?? 0;
      el.style.setProperty("--hdr", `${h}px`);
      el.style.setProperty("--ftr", `${f}px`);
    });
    
    ro.observe(el);
    if (headerRef.current) ro.observe(headerRef.current);
    if (footerRef.current) ro.observe(footerRef.current);
    
    return () => ro.disconnect();
  }, []);

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
      ref={rootRef}
      className={cn("training-stage", className)}
      style={{ height: 'calc(100vh - 160px)' }}
    >
      {/* Header Zone: auto height */}
      <div ref={headerRef} className="stage-header-zone">
        <header className="stage__header">
          <div className="stage__header-left">
            {chips && <div className="stage__chips">{chips}</div>}
            <div>
              <h2 className="stage__title">{title}</h2>
              {subtitle && <p className="stage__subtitle">{subtitle}</p>}
            </div>
          </div>
          {headerRight && <div className="stage__header-right">{headerRight}</div>}
        </header>

        {/* Mode Bar */}
        {modeBar && <div className="stage__mode">{modeBar}</div>}
      </div>

      {/* Body: 1fr (flex-grow), ONLY scrollable area */}
      <div className="stage-body">
        {isScrollableContent ? (
          children
        ) : (
          <div className="flex flex-col items-center justify-start pt-4">
            {children}
          </div>
        )}
      </div>

      {/* Footer: auto height, contains nav controls AND Next Steps, always visible at bottom */}
      <div ref={footerRef} className="stage-footer-combined">
        {footer && (
          <div className="stage-footer-nav">
            {footer}
          </div>
        )}
        
        {nextSteps && (
          <div className="stage-footer-nextsteps">
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
