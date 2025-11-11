import { WorkflowNode as WorkflowNodeType } from "@/types/workflow";
import { getStageColor, getStageLightColor } from "@/types/workflow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ChevronRight, XCircle, Clock, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import { useLeads } from "@/hooks/useLeads";
import { replaceScriptPlaceholders, getReplacementValues } from "@/lib/scriptPlaceholders";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LeadOverview } from "./LeadOverview";
import { LeadInfoSheet } from "./LeadInfoSheet";

interface WorkflowNodeProps {
  node: WorkflowNodeType;
  onNavigate: (nextNodeId: string, action: "yes" | "no" | "no_response") => void;
  isExpanded: boolean;
  onToggle: () => void;
  childNodes?: WorkflowNodeType[];
  onSelectChild?: (nodeId: string) => void;
}

export const WorkflowNode = ({ node, onNavigate, isExpanded, onToggle, childNodes = [], onSelectChild }: WorkflowNodeProps) => {
  const stageColor = getStageColor(node.stage);
  const stageLightColor = getStageLightColor(node.stage);
  const [showCrmActions, setShowCrmActions] = useState(false);
  const [isLeadInfoOpen, setIsLeadInfoOpen] = useState(false);
  
  // Fetch current user profile and leads for placeholder replacement
  const { data: profile } = useCurrentProfile();
  const { data: leads } = useLeads();
  
  // Use the most recent lead for demo purposes, or create a mock lead
  const currentLead = leads?.[0] || { 
    first_name: "Sarah", 
    full_name: "Sarah Johnson",
    business_name: "Acme Corp",
    lead_magnet_name: "Local AI System Demo"
  };
  
  // Get replacement values for display
  const replacementData = useMemo(() => ({
    leadFirstName: currentLead.first_name,
    leadFullName: currentLead.full_name,
    repFirstName: profile?.first_name,
    repFullName: profile?.full_name,
    businessName: currentLead.business_name,
    leadMagnetName: currentLead.lead_magnet_name,
  }), [currentLead, profile]);

  const replacementValues = useMemo(() => 
    getReplacementValues(replacementData),
    [replacementData]
  );

  // Replace placeholders in script content and separate inline replies
  const { scriptContent: processedScriptContent, inlineReplies } = useMemo(() => {
    if (!node.script_content) return { scriptContent: null, inlineReplies: null };
    
    const content = replaceScriptPlaceholders(node.script_content, replacementData);
    
    // Check for inline replies pattern
    const inlineReplyMatch = content.match(/\[INLINE_REPLIES\]([\s\S]*?)\[\/INLINE_REPLIES\]/);
    
    if (inlineReplyMatch) {
      const scriptWithoutReplies = content.replace(/\[INLINE_REPLIES\][\s\S]*?\[\/INLINE_REPLIES\]/, '').trim();
      const repliesSection = inlineReplyMatch[1].trim();
      
      // Parse individual replies
      const replies = repliesSection.split('\n')
        .filter(line => line.trim())
        .map(line => {
          // Match pattern: 🟢 YES: "Response text"
          const match = line.match(/^(🟢|🔴|🟡)\s+(\w+):\s+"(.+)"$/);
          if (match) {
            const [, emoji, type, text] = match;
            return { emoji, type: type.toLowerCase(), text };
          }
          return null;
        })
        .filter(Boolean);
      
      return { scriptContent: scriptWithoutReplies, inlineReplies: replies };
    }
    
    return { scriptContent: content, inlineReplies: null };
  }, [node.script_content, replacementData]);

  // Function to render script line with highlighted dynamic fields
  const renderScriptLine = (line: string) => {
    const parts: (string | { value: string; tooltip: string })[] = [];
    let lastIndex = 0;

    // Find all dynamic values in the line
    const patterns = [
      { value: replacementValues.leadFirstName, tooltip: "Auto-filled from lead record", original: "{LeadFirstName}" },
      { value: replacementValues.repName, tooltip: "Auto-filled from user profile", original: "{RepName}" },
      ...(replacementValues.businessName ? [{ value: replacementValues.businessName, tooltip: "Auto-filled from lead record", original: "{BusinessName}" }] : []),
      ...(replacementValues.leadMagnetName ? [{ value: replacementValues.leadMagnetName, tooltip: "Auto-filled from lead record", original: "{lead_magnet_name}" }] : []),
    ];

    patterns.forEach(pattern => {
      let index = line.indexOf(pattern.value, lastIndex);
      while (index !== -1) {
        // Add text before the match
        if (index > lastIndex) {
          parts.push(line.substring(lastIndex, index));
        }
        // Add the dynamic value
        parts.push({ value: pattern.value, tooltip: pattern.tooltip });
        lastIndex = index + pattern.value.length;
        index = line.indexOf(pattern.value, lastIndex);
      }
    });

    // Add remaining text
    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }

    return (
      <>
        {parts.map((part, i) => 
          typeof part === 'string' ? (
            <span key={i}>{part}</span>
          ) : (
            <TooltipProvider key={i}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 border-dashed text-sm font-medium mx-0.5">
                    {part.value}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{part.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        )}
      </>
    );
  };
  
  // Determine if we should show action buttons or child cards
  // If child nodes exist that match the next node IDs, show cards instead of buttons
  const nextNodeIds = [node.on_yes_next_node, node.on_no_next_node, node.on_no_response_next_node].filter(Boolean);
  const childNodeIds = childNodes.map(child => child.node_id);
  const childrenMatchNextNodes = nextNodeIds.length > 0 && nextNodeIds.every(id => childNodeIds.includes(id!));
  
  const showActionButtons = !childrenMatchNextNodes && (node.on_yes_next_node || node.on_no_next_node || node.on_no_response_next_node);
  const showChildCards = childNodes.length > 0;
  
  const isWebsiteSignupStart = node.node_id === "WEBSITE_SIGNUP_START";

  return (
    <Card 
      className={cn(
        "transition-all duration-300 cursor-pointer hover:shadow-lg",
        isExpanded && "ring-2 ring-primary max-w-[85%] mx-auto border-border/50 shadow-sm"
      )}
      style={isExpanded ? {
        height: 'calc(100vh - 12rem)',
        display: 'flex',
        flexDirection: 'column'
      } : undefined}
      onClick={onToggle}
    >
      <CardHeader className={cn(
        isExpanded && "py-5 flex-shrink-0"
      )}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant="outline" 
                className={cn(
                  "font-medium border-2",
                  `bg-${stageLightColor} text-${stageColor} border-${stageColor}`
                )}
              >
                {node.stage}
              </Badge>
              {node.script_name && (
                <Badge variant="secondary" className="text-xs">
                  {node.script_name}
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl mb-1">{node.scenario_title}</CardTitle>
            {!isWebsiteSignupStart && (
              <CardDescription>{node.scenario_description}</CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* View Lead Info Button */}
            {isExpanded && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLeadInfoOpen(true);
                }}
                className="gap-1.5 h-8 text-xs"
              >
                <User className="h-3.5 w-3.5" />
                View Lead Info
              </Button>
            )}
            <ChevronRight 
              className={cn(
                "h-5 w-5 text-muted-foreground transition-transform",
                isExpanded && "rotate-90"
              )} 
            />
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent 
          className={cn(
            "pt-0 flex flex-col pb-0 overflow-hidden"
          )}
          style={isExpanded ? {
            flex: '1',
            minHeight: '0',
            display: 'flex',
            flexDirection: 'column'
          } : undefined}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Scrollable Body Zone - Script, CRM, Context */}
          <div 
            className="overflow-y-auto space-y-4 pr-2"
            style={{ 
              flex: '1',
              minHeight: '0'
            }}
          >
          {/* Lead Overview for Website Signup Start Node */}
          {isWebsiteSignupStart && (
            <LeadOverview
              lead={currentLead}
              onNavigate={onSelectChild}
              nextNodeId={childNodes[0]?.node_id}
            />
          )}

          {/* Script Section - Full Width with optional CRM toggle */}
          {processedScriptContent && !isWebsiteSignupStart && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider">
                  Script to Use
                </h4>
                {node.crm_actions && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCrmActions(!showCrmActions)}
                    className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    {showCrmActions ? "Hide CRM Actions" : "Show CRM Actions"}
                  </Button>
                )}
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
              
              <div className="bg-gradient-to-br from-blue-50/50 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/10 rounded-lg p-6 border-2 border-blue-200/40 dark:border-blue-800/40 shadow-sm">
                <div className="prose prose-sm max-w-none">
                  <div className="text-[15px] leading-loose whitespace-pre-line font-normal text-foreground space-y-4">
                    {processedScriptContent.split('\n').map((line, index) => {
                      const isInstruction = line.includes('(') && line.includes(')');
                      
                      if (!line.trim()) {
                        return <div key={index} className="h-2" />;
                      }
                      
                      if (isInstruction) {
                        return (
                          <p key={index} className="text-muted-foreground italic text-sm pl-4">
                            {line}
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

                {/* Inline Replies Section */}
                {inlineReplies && inlineReplies.length > 0 && (
                  <div className="mt-6 pt-4 border-t-2 border-dashed border-blue-300/50 dark:border-blue-700/50">
                    <div className="flex flex-col gap-2.5">
                      {inlineReplies.map((reply: any, idx: number) => {
                        const isYes = reply.type === 'yes';
                        const isNo = reply.type === 'no';
                        const isUnsure = reply.type === 'unsure';
                        
                        const bgColor = isYes 
                          ? 'bg-green-100/80 dark:bg-green-950/30 hover:bg-green-200/90 dark:hover:bg-green-900/40' 
                          : isNo 
                            ? 'bg-red-100/80 dark:bg-red-950/30 hover:bg-red-200/90 dark:hover:bg-red-900/40'
                            : 'bg-yellow-100/80 dark:bg-yellow-950/30 hover:bg-yellow-200/90 dark:hover:bg-yellow-900/40';
                        
                        const borderColor = isYes
                          ? 'border-green-400/60 dark:border-green-700/60'
                          : isNo
                            ? 'border-red-400/60 dark:border-red-700/60'
                            : 'border-yellow-400/60 dark:border-yellow-700/60';
                        
                        const textColor = isYes
                          ? 'text-green-900 dark:text-green-100'
                          : isNo
                            ? 'text-red-900 dark:text-red-100'
                            : 'text-yellow-900 dark:text-yellow-100';
                        
                        const nextNodeId = isYes 
                          ? node.on_yes_next_node 
                          : isNo 
                            ? node.on_no_next_node 
                            : node.on_no_response_next_node;
                        
                        return (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (nextNodeId) {
                                onNavigate(nextNodeId, reply.type);
                              }
                            }}
                            className={cn(
                              "w-full text-left px-4 py-3 rounded-lg border-2 transition-all duration-200 shadow-sm hover:shadow-md",
                              bgColor,
                              borderColor,
                              textColor
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl flex-shrink-0">{reply.emoji}</span>
                              <div className="flex-1">
                                <div className="font-semibold text-sm uppercase tracking-wide mb-1">
                                  {reply.type}
                                </div>
                                <div className="text-sm font-medium">
                                  {reply.text}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              
              {node.script_section && (
                <p className="text-xs text-muted-foreground italic pl-1">
                  📋 Section: {node.script_section}
                </p>
              )}
            </div>
          )}

          {/* CRM Actions - Collapsible */}
          {node.crm_actions && showCrmActions && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider">
                CRM Actions
              </h4>
              <div className="bg-amber-50/50 dark:bg-amber-950/10 rounded-lg p-4 border-2 border-amber-200/40 dark:border-amber-800/30 shadow-sm">
                <div className="text-sm leading-relaxed whitespace-pre-line space-y-2">
                  {node.crm_actions.split('\n').map((line, index) => {
                    if (!line.trim()) return <br key={index} />;
                    const isField = line.includes('Field:') || line.includes('Input:');
                    const isUpdate = line.includes('Update') || line.includes('Create') || line.includes('Tag');
                    
                    if (isField) {
                      return (
                        <p key={index} className="text-xs bg-amber-100/50 dark:bg-amber-900/20 rounded px-2 py-1 font-mono">
                          {line}
                        </p>
                      );
                    } else if (isUpdate) {
                      return (
                        <p key={index} className="font-medium text-amber-900 dark:text-amber-100">
                          ✓ {line}
                        </p>
                      );
                    }
                    return <p key={index}>{line}</p>;
                  })}
                </div>
              </div>
            </div>
          )}

          {/* If no script but has CRM actions */}
          {!node.script_content && node.crm_actions && (
            <div className="space-y-2">
              <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider">
                CRM Actions
              </h4>
              <div className="bg-amber-50/50 dark:bg-amber-950/10 rounded-lg p-4 border-2 border-amber-200/40 dark:border-amber-800/30 shadow-sm">
                <div className="text-sm leading-relaxed whitespace-pre-line space-y-2">
                  {node.crm_actions.split('\n').map((line, index) => {
                    if (!line.trim()) return <br key={index} />;
                    const isField = line.includes('Field:') || line.includes('Input:');
                    const isUpdate = line.includes('Update') || line.includes('Create') || line.includes('Tag');
                    
                    if (isField) {
                      return (
                        <p key={index} className="text-xs bg-amber-100/50 dark:bg-amber-900/20 rounded px-2 py-1 font-mono">
                          {line}
                        </p>
                      );
                    } else if (isUpdate) {
                      return (
                        <p key={index} className="font-medium text-amber-900 dark:text-amber-100">
                          ✓ {line}
                        </p>
                      );
                    }
                    return <p key={index}>{line}</p>;
                  })}
                </div>
              </div>
            </div>
          )}
          </div>

          {/* Fixed Footer Zone - Next Steps always visible */}
          {!inlineReplies && !isWebsiteSignupStart && (
            <div className="flex-shrink-0 pt-4 pb-6 border-t border-border/30 bg-background">
              <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-3">
                Next Steps
              </h4>
              
              {showActionButtons && (
              <div className="grid gap-1.5">
                {node.on_yes_next_node && (
                  <Button
                    onClick={() => onNavigate(node.on_yes_next_node!, "yes")}
                    variant="outline"
                    size="sm"
                    className="justify-start gap-2 h-auto py-2 px-3 border-2 hover:border-stage-close hover:bg-stage-close-light transition-colors"
                  >
                    <CheckCircle2 className="h-4 w-4 text-stage-close flex-shrink-0" />
                    <span className="text-left">
                      <div className="font-semibold text-xs">Prospect says YES</div>
                      <div className="text-xs text-muted-foreground">Continue to next step</div>
                    </span>
                  </Button>
                )}
                {node.on_no_next_node && (
                  <Button
                    onClick={() => onNavigate(node.on_no_next_node!, "no")}
                    variant="outline"
                    size="sm"
                    className="justify-start gap-2 h-auto py-2 px-3 border-2 hover:border-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                    <span className="text-left">
                      <div className="font-semibold text-xs">Prospect says NO</div>
                      <div className="text-xs text-muted-foreground">Handle objection or follow-up</div>
                    </span>
                  </Button>
                )}
                {node.on_no_response_next_node && (
                  <Button
                    onClick={() => onNavigate(node.on_no_response_next_node!, "no_response")}
                    variant="outline"
                    size="sm"
                    className="justify-start gap-2 h-auto py-2 px-3 border-2 hover:border-stage-contact hover:bg-stage-contact-light transition-colors"
                  >
                    <Clock className="h-4 w-4 text-stage-contact flex-shrink-0" />
                    <span className="text-left">
                      <div className="font-semibold text-xs">No Response</div>
                      <div className="text-xs text-muted-foreground">Follow-up sequence</div>
                    </span>
                  </Button>
                )}
              </div>
            )}

            {showChildCards && (
              <div className="space-y-2.5 mt-3">
                {childNodes.map((childNode, index) => (
                  <button
                    key={childNode.node_id}
                    onClick={() => onSelectChild?.(childNode.node_id)}
                    className="w-full text-left group animate-in fade-in duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="border-2 rounded-lg p-3.5 transition-all duration-300 hover:shadow-md hover:border-primary/50 cursor-pointer bg-card">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "font-medium border text-[10px] px-2 py-0.5",
                                `bg-${getStageLightColor(childNode.stage)} text-${getStageColor(childNode.stage)} border-${getStageColor(childNode.stage)}`
                              )}
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
        </CardContent>
      )}
      
      {/* Lead Info Sheet */}
      <LeadInfoSheet
        open={isLeadInfoOpen}
        onOpenChange={setIsLeadInfoOpen}
        lead={currentLead}
      />
    </Card>
  );
};
