import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Maximize2, Clock, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { isInstructionLine, renderInstructionLine, renderDialogueLine } from "@/lib/scriptFormatter";

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
  // Next Steps props
  showNextSteps?: boolean;
  nextStepsData?: {
    onYesNextNode?: string;
    onNoNextNode?: string;
    onNoResponseNextNode?: string;
  };
  onNavigate?: (nextNodeId: string, action: "yes" | "no" | "no_response") => void;
  childNodes?: Array<{
    node_id: string;
    scenario_title: string;
    scenario_description: string;
    stage: string;
    script_name?: string;
  }>;
  onSelectChild?: (nodeId: string) => void;
}

export const ScriptStepper = ({
  scriptContent,
  renderScriptLine,
  replacementValues,
  contactMethod,
  hideStepIndicator = false,
  centerContent = false,
  showNextSteps = false,
  nextStepsData,
  onNavigate,
  childNodes = [],
  onSelectChild,
}: ScriptStepperProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showFullScript, setShowFullScript] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<"forward" | "backward">("forward");
  const [clickFeedback, setClickFeedback] = useState(false);
  const scriptBoxRef = useRef<HTMLDivElement>(null);

  // Determine if this is a call-based interaction that needs the wait instruction
  const isCallBasedInteraction = contactMethod && 
    (contactMethod.toLowerCase().includes("call") || 
     contactMethod.toLowerCase().includes("phone") ||
     contactMethod.toLowerCase().includes("video"));

  // Parse script into logical segments (blocks separated by blank lines or separators)
  const allSegments = scriptContent.split(/\n\n+|---/).filter((segment) => segment.trim());
  
  // Filter out instruction-only segments from navigation steps
  const scriptSegments = allSegments.filter((segment) => {
    const lines = segment.split("\n").filter(line => line.trim());
    // Check if ALL lines in this segment are instructions
    const allInstructions = lines.every(line => isInstructionLine(line));
    return !allInstructions;
  });

  const totalSteps = scriptSegments.length;
  const currentSegment = scriptSegments[currentStep] || "";

  // Determine if we should show action buttons or child cards
  const nextNodeIds = [nextStepsData?.onYesNextNode, nextStepsData?.onNoNextNode, nextStepsData?.onNoResponseNextNode].filter(Boolean);
  const childNodeIds = childNodes.map(child => child.node_id);
  const childrenMatchNextNodes = nextNodeIds.length > 0 && nextNodeIds.every(id => childNodeIds.includes(id!));
  
  const showActionButtons = !childrenMatchNextNodes && (nextStepsData?.onYesNextNode || nextStepsData?.onNoNextNode || nextStepsData?.onNoResponseNextNode);
  const showChildCards = childNodes.length > 0;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setAnimationDirection("forward");
      setCurrentStep((prev) => prev + 1);
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
  }, [scriptContent]);

  const renderSegmentContent = (segment: string) => {
    return segment.split("\n").map((line, index) => {
      // Skip empty lines
      if (!line.trim()) {
        return null;
      }

      // Render instruction lines with special styling
      if (isInstructionLine(line)) {
        return renderInstructionLine(line, index);
      }

      // Render spoken dialogue lines
      return renderDialogueLine(line, renderScriptLine, index);
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
                const isSeparator = line.trim().startsWith("---");

                if (!line.trim()) {
                  return <div key={index} className="h-2" />;
                }

                if (isSeparator) {
                  return <div key={index} className="border-t border-border/30 my-4" />;
                }

                // Render instruction lines with special styling
                if (isInstructionLine(line)) {
                  return renderInstructionLine(line, index);
                }

                // Render spoken dialogue lines
                return renderDialogueLine(line, renderScriptLine, index);
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Instruction Bar - Always visible for call-based interactions */}
      {isCallBasedInteraction && !centerContent && (
        <div className="flex items-start gap-2.5 py-3 px-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200/40 dark:border-blue-800/40">
          <Clock className="h-4 w-4 text-blue-600/70 dark:text-blue-400/70 flex-shrink-0 mt-0.5" />
          <p className="text-sm italic text-muted-foreground leading-relaxed">
            Wait for them to answer before speaking.
          </p>
        </div>
      )}

      {/* Top Bar: Mode Badge, Progress + Full Script Toggle - Hidden for single-step stages */}
      {!hideStepIndicator && (
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-border/30">
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

      {/* Call Context Bar - Hidden for short stages */}
      {!hideStepIndicator && (
        <div className="flex flex-wrap items-center gap-2 p-2.5 bg-muted/30 rounded-lg border border-border/50 mb-3">
        <span className="text-xs font-medium text-muted-foreground">Call Context:</span>
        <Badge variant="secondary" className="gap-1.5 px-2.5 py-0.5">
          <span className="text-xs text-muted-foreground">Lead:</span>
          <span className="font-medium text-xs">{replacementValues.leadFirstName}</span>
        </Badge>
        <Badge variant="secondary" className="gap-1.5 px-2.5 py-0.5">
          <span className="text-xs text-muted-foreground">Rep:</span>
          <span className="font-medium text-xs">{replacementValues.repName}</span>
        </Badge>
        {replacementValues.leadMagnetName && (
          <Badge variant="secondary" className="gap-1.5 px-2.5 py-0.5">
            <span className="text-xs text-muted-foreground">Lead Magnet:</span>
            <span className="font-medium text-xs">{replacementValues.leadMagnetName}</span>
          </Badge>
        )}
        {replacementValues.businessName && (
          <Badge variant="secondary" className="gap-1.5 px-2.5 py-0.5">
            <span className="text-xs text-muted-foreground">Business:</span>
            <span className="font-medium text-xs">{replacementValues.businessName}</span>
          </Badge>
        )}
        </div>
      )}

      {/* Script Content with Animation - Click Anywhere to Advance */}
      <div 
        className="relative bg-gradient-to-br from-gray-50/80 to-blue-50/60 dark:from-gray-900/40 dark:to-blue-950/30 rounded-xl border-2 border-blue-200/50 dark:border-blue-800/50 shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col"
        style={{ 
          flex: hideStepIndicator ? '1 1 auto' : undefined,
          maxHeight: centerContent ? "200px" : hideStepIndicator ? "none" : showNextSteps ? "calc(100vh - 24rem)" : "calc(100vh - 20rem)", 
          minHeight: centerContent ? "200px" : hideStepIndicator ? "280px" : "280px",
          height: centerContent ? "200px" : hideStepIndicator ? "auto" : "auto"
        }}
      >
        {/* Click feedback ripple effect */}
        {clickFeedback && (
          <div className="absolute inset-0 bg-primary/5 rounded-xl animate-ping pointer-events-none" />
        )}

        {/* Scrollable Content Area */}
        <div 
          ref={scriptBoxRef}
          onClick={handleScriptBoxClick}
          className={cn(
            "flex-1 px-8 cursor-pointer flex flex-col items-center text-center",
            // Call scripts: fully centered vertically and horizontally
            // Decision prompts (Choose Contact Method): top-aligned with padding, horizontally centered
            centerContent ? "overflow-hidden justify-start pt-12" : hideStepIndicator ? "overflow-hidden justify-center" : showNextSteps ? "overflow-y-auto justify-start pt-8 pb-4" : "overflow-y-auto justify-start pt-8 pb-4"
          )}
        >
          <div
            key={currentStep}
            className={cn(
              "prose prose-lg max-w-none w-full",
              animationDirection === "forward" ? "animate-fade-in" : "animate-fade-in"
            )}
          >
            <div className="text-center">
              {centerContent ? (
                <p className="text-foreground font-medium text-[1.2rem] leading-relaxed">
                  {renderScriptLine(currentSegment)}
                </p>
              ) : (
                renderSegmentContent(currentSegment)
              )}
            </div>
          </div>
        </div>

        {/* Fixed Navigation Controls at Bottom */}
        <div className="flex-shrink-0 px-8 pb-4 pt-3 border-t-2 border-dashed border-blue-300/50 dark:border-blue-700/50 bg-gradient-to-br from-gray-50/80 to-blue-50/60 dark:from-gray-900/40 dark:to-blue-950/30">
          <div className="flex flex-col items-center gap-3">
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

            {/* Navigation Buttons */}
            <div className="flex items-center justify-center gap-4 w-full max-w-md">
              <Button
                variant="outline"
                size="default"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBack();
                }}
                disabled={currentStep === 0}
                className="gap-2 min-w-[130px] hover:scale-105 transition-transform font-semibold"
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
                size="default"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                disabled={currentStep === totalSteps - 1}
                className="gap-2 min-w-[130px] hover:scale-105 transition-transform shadow-md font-semibold"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Next Steps Section - Inside the bordered container */}
        {showNextSteps && (
          <div className="flex-shrink-0 px-8 pb-6 pt-4 border-t-2 border-border/30 bg-background">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
              Next Steps
            </h4>
            
            {showActionButtons && onNavigate && (
              <div className="grid gap-2">
                {nextStepsData?.onYesNextNode && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate(nextStepsData.onYesNextNode!, "yes");
                    }}
                    variant="outline"
                    size="sm"
                    className="justify-start gap-2 h-auto py-2.5 px-3 border-2 bg-[#F3FBF6] border-[#9AC9A5] hover:border-[#4A9B5D] hover:bg-[#E8F5ED] transition-colors"
                  >
                    <CheckCircle2 className="h-4 w-4 text-[#4A9B5D] flex-shrink-0" />
                    <span className="text-left">
                      <div className="font-semibold text-xs text-[#333333]">Prospect says YES</div>
                      <div className="text-xs text-muted-foreground">Continue to next step</div>
                    </span>
                  </Button>
                )}
                {nextStepsData?.onNoNextNode && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate(nextStepsData.onNoNextNode!, "no");
                    }}
                    variant="outline"
                    size="sm"
                    className="justify-start gap-2 h-auto py-2.5 px-3 border-2 bg-[#FDF3F3] border-[#D9A1A1] hover:border-[#C15B5B] hover:bg-[#FBE9E9] transition-colors"
                  >
                    <XCircle className="h-4 w-4 text-[#C15B5B] flex-shrink-0" />
                    <span className="text-left">
                      <div className="font-semibold text-xs text-[#333333]">Prospect says NO</div>
                      <div className="text-xs text-muted-foreground">Handle objection or follow-up</div>
                    </span>
                  </Button>
                )}
                {nextStepsData?.onNoResponseNextNode && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate(nextStepsData.onNoResponseNextNode!, "no_response");
                    }}
                    variant="outline"
                    size="sm"
                    className="justify-start gap-2 h-auto py-2.5 px-3 border-2 bg-[#FFF9EC] border-[#DDBF81] hover:border-[#C7922E] hover:bg-[#FFF4DC] transition-colors"
                  >
                    <Clock className="h-4 w-4 text-[#C7922E] flex-shrink-0" />
                    <span className="text-left">
                      <div className="font-semibold text-xs text-[#333333]">No Response</div>
                      <div className="text-xs text-muted-foreground">Follow-up sequence</div>
                    </span>
                  </Button>
                )}
              </div>
            )}

            {showChildCards && onSelectChild && (
              <div className="space-y-2">
                {childNodes.map((childNode, index) => (
                  <button
                    key={childNode.node_id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectChild(childNode.node_id);
                    }}
                    className="w-full text-left group animate-in fade-in duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="border-2 rounded-lg p-3 transition-all duration-150 ease-in-out hover:shadow-md hover:border-primary/50 hover:bg-accent/5 hover:-translate-y-0.5 cursor-pointer bg-card">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge 
                              variant="outline" 
                              className="font-medium border text-[10px] px-2 py-0.5"
                            >
                              {childNode.stage}
                            </Badge>
                            {childNode.script_name && (
                              <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                                {childNode.script_name}
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-semibold text-base mb-1.5 group-hover:text-primary transition-colors">
                            {childNode.scenario_title}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-snug">
                            {childNode.scenario_description}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
