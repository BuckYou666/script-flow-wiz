import { WorkflowNode as WorkflowNodeType } from "@/types/workflow";
import { getStageColor, getStageLightColor } from "@/types/workflow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
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
import { ConversationHistory } from "./ConversationHistory";
import { ScriptStepper } from "./ScriptStepper";
import { TrainingStageLayout } from "./TrainingStageLayout";
import { InstructionBar } from "./InstructionBar";

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
    id: "mock-lead-id",
    first_name: "Sarah", 
    full_name: "Sarah Johnson",
    business_name: "Acme Corp",
    lead_magnet_name: "Local AI System Demo",
    conversation_history: [],
    email: "",
    phone: "",
    status: "",
    conversation_notes: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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
  
  // Determine if this is a call-based interaction for instruction display
  const isCallBasedInteraction = node.scenario_title && 
    (node.scenario_title.toLowerCase().includes("call") || 
     node.scenario_title.toLowerCase().includes("phone") ||
     node.scenario_title.toLowerCase().includes("video"));

  // Render the header content
  const headerContent = (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
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
          <CardDescription className="text-xs">{node.scenario_description}</CardDescription>
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
  );

  // Render instruction bar for call-based interactions
  const instructionBarContent = isCallBasedInteraction && !isWebsiteSignupStart ? (
    <InstructionBar text="Wait for them to answer before speaking." />
  ) : null;

  // Render the main script/content panel
  const scriptPanelContent = (
    <>
      {/* Lead Overview for Website Signup Start Node */}
      {isWebsiteSignupStart && (
        <div className="space-y-3">
          <LeadOverview
            lead={currentLead}
          />
          
          {/* Conversation History */}
          <ConversationHistory
            leadId={currentLead.id}
            conversationHistory={currentLead.conversation_history as any[] || []}
          />
        </div>
      )}

      {/* Script Section - Step-by-step Navigation */}
      {processedScriptContent && !isWebsiteSignupStart && (
        <div className="space-y-3">
          {/* CRM Actions Toggle */}
          {node.crm_actions && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCrmActions(!showCrmActions)}
                className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <Settings className="h-3.5 w-3.5" />
                {showCrmActions ? "Hide CRM Actions" : "Show CRM Actions"}
              </Button>
            </div>
          )}

          {/* Script Stepper Component */}
          <ScriptStepper
            scriptContent={processedScriptContent}
            renderScriptLine={renderScriptLine}
            replacementValues={replacementValues}
            contactMethod={node.scenario_title}
            centerContent={node.scenario_title === "Choose Contact Method"}
          />

          {/* Inline Replies Section */}
          {inlineReplies && inlineReplies.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50/50 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/10 rounded-lg p-4 border-2 border-blue-200/40 dark:border-blue-800/40 shadow-sm">
              <div className="flex flex-col gap-2.5">
                {inlineReplies.map((reply: any, idx: number) => {
                    const isYes = reply.type === 'yes';
                    const isNo = reply.type === 'no';
                    const isUnsure = reply.type === 'unsure';
                    
                    const bgColor = isYes 
                      ? 'bg-[#F3FBF6] hover:bg-[#E8F5ED]' 
                      : isNo 
                        ? 'bg-[#FDF3F3] hover:bg-[#FBE9E9]'
                        : 'bg-[#FFF9EC] hover:bg-[#FFF4DC]';
                    
                    const borderColor = isYes
                      ? 'border-[#9AC9A5] hover:border-[#4A9B5D]'
                      : isNo
                        ? 'border-[#D9A1A1] hover:border-[#C15B5B]'
                        : 'border-[#DDBF81] hover:border-[#C7922E]';
                    
                    const iconColor = isYes
                      ? 'text-[#4A9B5D]'
                      : isNo
                        ? 'text-[#C15B5B]'
                        : 'text-[#C7922E]';
                    
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
                          borderColor
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className={cn("text-2xl flex-shrink-0", iconColor)}>{reply.emoji}</span>
                          <div className="flex-1">
                            <div className={cn("font-semibold text-sm uppercase tracking-wide mb-1", iconColor)}>
                              {reply.type}
                            </div>
                            <div className="text-sm font-medium text-[#333333]">
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
          
          {node.script_section && (
            <p className="text-xs text-muted-foreground italic pl-1">
              📋 Section: {node.script_section}
            </p>
          )}
        </div>
      )}

      {/* CRM Actions - Collapsible */}
      {node.crm_actions && showCrmActions && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300 mt-3">
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
    </>
  );

  // Render the Next Steps section
  const nextStepsContent = (showActionButtons || showChildCards) ? (
    <div className="grid gap-2">
      {showActionButtons && (
        <>
          {node.on_yes_next_node && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(node.on_yes_next_node!, "yes");
              }}
              variant="outline"
              size="sm"
              className="justify-start gap-2 h-auto py-1.5 px-3 border-2 bg-[#F3FBF6] border-[#9AC9A5] hover:border-[#4A9B5D] hover:bg-[#E8F5ED] transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md"
            >
              <CheckCircle2 className="h-4 w-4 text-[#4A9B5D] flex-shrink-0" />
              <span className="text-left">
                <div className="font-semibold text-xs text-[#333333]">Prospect says YES</div>
                <div className="text-xs text-muted-foreground">Continue to next step</div>
              </span>
            </Button>
          )}
          {node.on_no_next_node && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(node.on_no_next_node!, "no");
              }}
              variant="outline"
              size="sm"
              className="justify-start gap-2 h-auto py-1.5 px-3 border-2 bg-[#FDF3F3] border-[#D9A1A1] hover:border-[#C15B5B] hover:bg-[#FBE9E9] transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md"
            >
              <XCircle className="h-4 w-4 text-[#C15B5B] flex-shrink-0" />
              <span className="text-left">
                <div className="font-semibold text-xs text-[#333333]">Prospect says NO</div>
                <div className="text-xs text-muted-foreground">Handle objection</div>
              </span>
            </Button>
          )}
          {node.on_no_response_next_node && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(node.on_no_response_next_node!, "no_response");
              }}
              variant="outline"
              size="sm"
              className="justify-start gap-2 h-auto py-1.5 px-3 border-2 bg-[#FFF9EC] border-[#DDBF81] hover:border-[#C7922E] hover:bg-[#FFF4DC] transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md"
            >
              <Clock className="h-4 w-4 text-[#C7922E] flex-shrink-0" />
              <span className="text-left">
                <div className="font-semibold text-xs text-[#333333]">No Response</div>
                <div className="text-xs text-muted-foreground">Follow-up action</div>
              </span>
            </Button>
          )}
        </>
      )}

      {showChildCards && (
        <>
          {childNodes.map((child) => (
            <Card
              key={child.node_id}
              className="border-2 hover:border-primary hover:bg-accent/50 transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md cursor-pointer overflow-hidden"
              onClick={(e) => {
                e.stopPropagation();
                onSelectChild?.(child.node_id);
              }}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[10px] font-medium border",
                          `bg-${getStageLightColor(child.stage)} text-${getStageColor(child.stage)} border-${getStageColor(child.stage)}`
                        )}
                      >
                        {child.stage}
                      </Badge>
                      {child.script_name && (
                        <Badge variant="secondary" className="text-[10px]">
                          {child.script_name}
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-semibold text-sm mb-0.5">{child.scenario_title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {child.scenario_description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  ) : null;

  return (
    <>
      <TrainingStageLayout
        header={headerContent}
        instructionBar={instructionBarContent}
        scriptPanel={scriptPanelContent}
        nextSteps={nextStepsContent}
        isExpanded={isExpanded}
        onCardClick={onToggle}
        onContentClick={(e) => e.stopPropagation()}
      />
      
      {/* Lead Info Sheet */}
      <LeadInfoSheet
        open={isLeadInfoOpen}
        onOpenChange={setIsLeadInfoOpen}
        lead={currentLead}
      />
    </>
  );
};
