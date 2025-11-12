import { Info } from "lucide-react";

/**
 * Detects if a line is instructional/guidance text vs spoken dialogue
 * Instructions are wrapped in parentheses (), start with //, or match specific patterns
 */
export const isInstructionLine = (line: string): boolean => {
  const trimmed = line.trim();
  
  // Check for parentheses-wrapped instructions
  if (trimmed.startsWith("(") && trimmed.endsWith(")")) {
    return true;
  }
  
  // Check for asterisk-wrapped instructions
  if (trimmed.startsWith("*") && trimmed.endsWith("*")) {
    return true;
  }
  
  // Check for // comments
  if (trimmed.startsWith("//")) {
    return true;
  }
  
  // Check for conditional statements (If X, Y pattern)
  if (/^If .+,.+/i.test(trimmed)) {
    return true;
  }
  
  // Check for CRM-related instructions
  if (/(schedule|update|create|tag|assign|send|notify|set).*(CRM|status|task|callback|appointment|lead)/i.test(trimmed)) {
    return true;
  }
  
  // Check for workflow directives
  if (/(move (straight )?into|proceed to|continue to|end the call|return to|go back to)/i.test(trimmed)) {
    return true;
  }
  
  // Check for action phrases with "before" or "after"
  if (/(before|after) (ending|starting|proceeding|continuing)/i.test(trimmed)) {
    return true;
  }
  
  return false;
};

/**
 * Extracts the instruction text without wrapping characters
 */
export const getInstructionText = (line: string): string => {
  const trimmed = line.trim();
  
  // Remove parentheses
  if (trimmed.startsWith("(") && trimmed.endsWith(")")) {
    return trimmed.slice(1, -1).trim();
  }
  
  // Remove asterisks
  if (trimmed.startsWith("*") && trimmed.endsWith("*")) {
    return trimmed.slice(1, -1).trim();
  }
  
  // Remove //
  if (trimmed.startsWith("//")) {
    return trimmed.slice(2).trim();
  }
  
  return trimmed;
};

/**
 * Renders an instruction line with distinct styling
 */
export const renderInstructionLine = (line: string, key?: string | number) => {
  const instructionText = getInstructionText(line);
  
  return (
    <div 
      key={key}
      className="flex items-start gap-2 py-2 px-3 mb-3 bg-muted/30 rounded-md border border-border/40"
    >
      <Info className="h-3.5 w-3.5 text-muted-foreground/60 flex-shrink-0 mt-0.5" />
      <p className="text-[0.9em] italic text-muted-foreground leading-relaxed">
        {instructionText}
      </p>
    </div>
  );
};

/**
 * Renders spoken dialogue with emphasis
 */
export const renderDialogueLine = (
  line: string, 
  renderScriptLine: (line: string) => JSX.Element,
  key?: string | number
) => {
  const trimmed = line.trim();
  
  // Check if it's a quoted spoken line
  const isQuoted = trimmed.startsWith('"');
  
  return (
    <p 
      key={key}
      className={isQuoted 
        ? "text-foreground font-semibold text-[1.125rem] leading-[1.7] mb-4" 
        : "text-foreground font-medium text-[1.05rem] leading-[1.65] mb-3"
      }
    >
      {renderScriptLine(line)}
    </p>
  );
};

/**
 * Parses and renders a complete script with proper formatting
 */
export const renderFormattedScript = (
  content: string,
  renderScriptLine: (line: string) => JSX.Element
) => {
  return content.split("\n").map((line, index) => {
    // Skip empty lines
    if (!line.trim()) {
      return <div key={index} className="h-2" />;
    }
    
    // Check for separators
    if (line.trim().startsWith("---")) {
      return <div key={index} className="border-t border-border/30 my-4" />;
    }
    
    // Render instructions with special styling
    if (isInstructionLine(line)) {
      return renderInstructionLine(line, index);
    }
    
    // Render spoken dialogue
    return renderDialogueLine(line, renderScriptLine, index);
  });
};
