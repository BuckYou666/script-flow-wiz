import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Maximize2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ScriptStepperProps {
  scriptContent: string;
  renderScriptLine: (line: string) => JSX.Element;
  replacementValues: {
    leadFirstName: string;
    repName: string;
    businessName?: string;
    leadMagnetName?: string;
  };
  contactMethod?: string; // "Call", "Text", "Email", etc.
  hideStepIndicator?: boolean; // Hide progress bar for single-step stages
  centerContent?: boolean; // Center content vertically and horizontally
}

export const ScriptStepper = ({
  scriptContent,
  renderScriptLine,
  replacementValues,
  contactMethod,
  hideStepIndicator = false,
  centerContent = false,
}: ScriptStepperProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showFullScript, setShowFullScript] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<"forward" | "backward">("forward");
  const [showTip, setShowTip] = useState(true);
  const [clickFeedback, setClickFeedback] = useState(false);
  const scriptBoxRef = useRef<HTMLDivElement>(null);

  // Determine if this is a call-based interaction that needs the wait instruction
  const isCallBasedInteraction = contactMethod && 
    (contactMethod.toLowerCase().includes("call") || 
     contactMethod.toLowerCase().includes("phone") ||
     contactMethod.toLowerCase().includes("video"));

  // Only show tip for call-based interactions
  const shouldShowWaitTip = isCallBasedInteraction && showTip && currentStep === 0;

  // Parse script into logical segments (blocks separated by blank lines or separators)
  const scriptSegments = scriptContent.split(/\n\n+|---/).filter((segment) => segment.trim());

  const totalSteps = scriptSegments.length;
  const currentSegment = scriptSegments[currentStep] || "";

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setAnimationDirection("forward");
      setCurrentStep((prev) => prev + 1);
      setShowTip(false);
    } else {
      // Flash the next steps section when at the end
      setClickFeedback(true);
      setTimeout(() => setClickFeedback(false), 300);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setAnimationDirection("backward");
      setCurrentStep((prev) => prev - 1);
      setShowTip(false);
    }
  };

  // Click anywhere in script box to advance
  const handleScriptBoxClick = () => {
    handleNext();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle arrow keys if not typing in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === "ArrowRight" && currentStep < totalSteps - 1) {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft" && currentStep > 0) {
        e.preventDefault();
        handleBack();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStep, totalSteps]);

  // Reset to first step when script content changes
  useEffect(() => {
    setCurrentStep(0);
    setShowFullScript(false);
    setShowTip(true);
  }, [scriptContent]);

  // Auto-fade tip after 3 seconds (only for call-based interactions)
  useEffect(() => {
    if (shouldShowWaitTip) {
      const timer = setTimeout(() => {
        setShowTip(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [shouldShowWaitTip]);

  const renderSegmentContent = (segment: string) => {
    return segment.split("\n").map((line, index) => {
      // Skip instruction lines wrapped in asterisks or parentheses - we'll show them in the overlay
      const isInstruction =
        (line.includes("(") && line.includes(")")) ||
        (line.trim().startsWith("*") && line.trim().endsWith("*"));

      // Check for spoken dialogue: lines starting with quotes
      const isSpokenDialogue = line.trim().startsWith('"');

      if (!line.trim() || isInstruction) {
        return null;
      }

      if (isSpokenDialogue) {
        return (
          <p key={index} className="text-foreground font-semibold text-[18px] leading-[1.7] mb-4">
            {renderScriptLine(line)}
          </p>
        );
      }

      return (
        <p key={index} className="text-foreground text-[17px] leading-[1.6] mb-3">
          {renderScriptLine(line)}
        </p>
      );
    });
  };

  if (showFullScript) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFullScript(false)}
            className="text-xs gap-1.5"
          >
            ← Back to step-by-step
          </Button>
          <Badge variant="secondary" className="text-xs">
            Full Script View
          </Badge>
        </div>

        <div className="bg-gradient-to-br from-blue-50/50 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/10 rounded-lg p-6 border-2 border-blue-200/40 dark:border-blue-800/40 shadow-sm max-h-[500px] overflow-y-auto">
          <div className="prose prose-sm max-w-none">
            <div className="text-[15px] leading-loose whitespace-pre-line font-normal text-foreground space-y-4">
              {scriptContent.split("\n").map((line, index) => {
                const isInstruction =
                  (line.includes("(") && line.includes(")")) ||
                  (line.trim().startsWith("*") && line.trim().endsWith("*"));
                const isSpokenDialogue = line.trim().startsWith('"');
                const isSeparator = line.trim().startsWith("---");

                if (!line.trim()) {
                  return <div key={index} className="h-2" />;
                }

                if (isSeparator) {
                  return <div key={index} className="border-t border-border/30 my-4" />;
                }

                if (isInstruction) {
                  return (
                    <p key={index} className="text-muted-foreground italic text-xs leading-snug">
                      {line.replace(/^\*|\*$/g, "")}
                    </p>
                  );
                }

                if (isSpokenDialogue) {
                  return (
                    <p key={index} className="text-foreground font-medium text-[16px] leading-relaxed">
                      {renderScriptLine(line)}
                    </p>
                  );
                }

                return (
                  <p key={index} className="text-foreground leading-relaxed">
                    {renderScriptLine(line)}
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Top Bar: Mode Badge, Progress + Full Script Toggle - Hidden for single-step stages */}
      {!hideStepIndicator && (
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-border/30">
          <div className="flex items-center gap-3">
            {/* Contact Method Badge */}
            {contactMethod && (
              <Badge variant="secondary" className="text-xs gap-1.5">
                Mode: {contactMethod.toLowerCase().includes("call") || contactMethod.toLowerCase().includes("phone") ? "📞" : 
                       contactMethod.toLowerCase().includes("text") || contactMethod.toLowerCase().includes("sms") ? "💬" : 
                       contactMethod.toLowerCase().includes("email") ? "📧" : "📋"} {contactMethod}
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs font-mono">
              Step {currentStep + 1} of {totalSteps}
            </Badge>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden w-32">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullScript(true)}
                className="text-xs gap-1.5 h-7"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                View full script
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Show all steps at once</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        </div>
      )}

      {/* Call Context Bar */}
      {!hideStepIndicator && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border/50">
        <span className="text-xs font-medium text-muted-foreground">Call Context:</span>
        <Badge variant="secondary" className="gap-1.5 px-3 py-1">
          <span className="text-xs text-muted-foreground">Lead:</span>
          <span className="font-medium">{replacementValues.leadFirstName}</span>
        </Badge>
        <Badge variant="secondary" className="gap-1.5 px-3 py-1">
          <span className="text-xs text-muted-foreground">Rep:</span>
          <span className="font-medium">{replacementValues.repName}</span>
        </Badge>
        {replacementValues.leadMagnetName && (
          <Badge variant="secondary" className="gap-1.5 px-3 py-1">
            <span className="text-xs text-muted-foreground">Lead Magnet:</span>
            <span className="font-medium">{replacementValues.leadMagnetName}</span>
          </Badge>
        )}
        {replacementValues.businessName && (
          <Badge variant="secondary" className="gap-1.5 px-3 py-1">
            <span className="text-xs text-muted-foreground">Business:</span>
            <span className="font-medium">{replacementValues.businessName}</span>
          </Badge>
        )}
        </div>
      )}

      {/* Script Content with Animation - Click Anywhere to Advance */}
      <div 
        ref={scriptBoxRef}
        onClick={handleScriptBoxClick}
        className="relative bg-gradient-to-br from-gray-50/80 to-blue-50/60 dark:from-gray-900/40 dark:to-blue-950/30 rounded-xl p-8 border-2 border-blue-200/50 dark:border-blue-800/50 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group"
        style={{ 
          maxHeight: centerContent ? "50vh" : "60vh", 
          minHeight: centerContent ? "300px" : "240px",
          display: centerContent ? "flex" : "block",
          flexDirection: centerContent ? "column" : undefined,
          justifyContent: centerContent ? "center" : undefined,
          alignItems: centerContent ? "center" : undefined
        }}
      >
        {/* Auto-Fading Tip Overlay - Only for Call-Based Interactions */}
        {shouldShowWaitTip && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 animate-fade-in">
            <div className="bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-100 px-4 py-2 rounded-full text-xs font-medium shadow-lg flex items-center gap-2 animate-pulse">
              <Clock className="h-3.5 w-3.5" />
              Wait for the lead to answer before starting your greeting...
            </div>
          </div>
        )}

        {/* Click feedback ripple effect */}
        {clickFeedback && (
          <div className="absolute inset-0 bg-primary/5 rounded-xl animate-ping pointer-events-none" />
        )}

        <div
          key={currentStep}
          className={cn(
            "prose prose-lg max-w-none flex flex-col justify-center min-h-[180px]",
            centerContent ? "w-full" : "",
            animationDirection === "forward" ? "animate-fade-in" : "animate-fade-in"
          )}
        >
          <div className={cn(centerContent ? "text-center" : "text-center")}>
            {centerContent ? (
              <p className="text-foreground font-medium text-[1.2rem] leading-relaxed">
                {renderScriptLine(currentSegment)}
              </p>
            ) : (
              renderSegmentContent(currentSegment)
            )}
          </div>
        </div>

        {/* Navigation Buttons - Centered Layout */}
        <div className="flex flex-col items-center gap-3 mt-6 pt-5 border-t-2 border-dashed border-blue-300/50 dark:border-blue-700/50">
          {/* Progress Dots */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  idx === currentStep
                    ? "w-8 bg-primary"
                    : idx < currentStep
                    ? "w-2 bg-primary/60"
                    : "w-2 bg-muted"
                )}
              />
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 w-full max-w-md">
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleBack();
              }}
              disabled={currentStep === 0}
              className="gap-2 min-w-[120px] hover:scale-105 transition-transform"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>

            <div className="text-xs text-muted-foreground flex items-center gap-2 px-3">
              <kbd className="px-2 py-1 text-[10px] font-semibold bg-muted border border-border rounded">
                ←
              </kbd>
              <span>/</span>
              <kbd className="px-2 py-1 text-[10px] font-semibold bg-muted border border-border rounded">
                →
              </kbd>
              <span className="hidden sm:inline">or click text</span>
            </div>

            <Button
              variant="default"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              disabled={currentStep === totalSteps - 1}
              className="gap-2 min-w-[120px] hover:scale-105 transition-transform shadow-md"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
