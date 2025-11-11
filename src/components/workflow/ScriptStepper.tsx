import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
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
}

export const ScriptStepper = ({
  scriptContent,
  renderScriptLine,
  replacementValues,
}: ScriptStepperProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showFullScript, setShowFullScript] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<"forward" | "backward">("forward");

  // Parse script into logical segments (blocks separated by blank lines or separators)
  const scriptSegments = scriptContent.split(/\n\n+|---/).filter((segment) => segment.trim());

  const totalSteps = scriptSegments.length;
  const currentSegment = scriptSegments[currentStep] || "";

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setAnimationDirection("forward");
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setAnimationDirection("backward");
      setCurrentStep((prev) => prev - 1);
    }
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
      // Check for instruction text: lines with parentheses or wrapped in asterisks
      const isInstruction =
        (line.includes("(") && line.includes(")")) ||
        (line.trim().startsWith("*") && line.trim().endsWith("*"));

      // Check for spoken dialogue: lines starting with quotes
      const isSpokenDialogue = line.trim().startsWith('"');

      if (!line.trim()) {
        return <div key={index} className="h-2" />;
      }

      if (isInstruction) {
        return (
          <p key={index} className="text-muted-foreground italic text-xs leading-snug mb-2">
            {line.replace(/^\*|\*$/g, "")}
          </p>
        );
      }

      if (isSpokenDialogue) {
        return (
          <p key={index} className="text-foreground font-medium text-[16px] leading-relaxed mb-3">
            {renderScriptLine(line)}
          </p>
        );
      }

      return (
        <p key={index} className="text-foreground leading-relaxed mb-2">
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
      {/* Top Bar: Progress + Full Script Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
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

      {/* Call Context Bar */}
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

      {/* Script Content with Animation */}
      <div className="bg-gradient-to-br from-blue-50/50 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/10 rounded-lg p-6 border-2 border-blue-200/40 dark:border-blue-800/40 shadow-sm min-h-[200px] flex flex-col justify-between">
        <div
          key={currentStep}
          className={cn(
            "prose prose-sm max-w-none",
            animationDirection === "forward" ? "animate-fade-in" : "animate-fade-in"
          )}
        >
          <div className="text-[15px] leading-loose font-normal text-foreground">
            {renderSegmentContent(currentSegment)}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4 mt-6 pt-4 border-t-2 border-dashed border-blue-300/50 dark:border-blue-700/50">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <kbd className="px-2 py-1 text-[10px] font-semibold bg-muted border border-border rounded">
              ←
            </kbd>
            <span>or</span>
            <kbd className="px-2 py-1 text-[10px] font-semibold bg-muted border border-border rounded">
              →
            </kbd>
            <span>to navigate</span>
          </div>

          <Button
            variant="default"
            onClick={handleNext}
            disabled={currentStep === totalSteps - 1}
            className="gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
