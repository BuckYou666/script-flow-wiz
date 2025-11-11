import { WorkflowNode as WorkflowNodeType } from "@/types/workflow";
import { getStageColor, getStageLightColor } from "@/types/workflow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ChevronRight, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowNodeProps {
  node: WorkflowNodeType;
  onNavigate: (nextNodeId: string, action: "yes" | "no" | "no_response") => void;
  isExpanded: boolean;
  onToggle: () => void;
}

export const WorkflowNode = ({ node, onNavigate, isExpanded, onToggle }: WorkflowNodeProps) => {
  const stageColor = getStageColor(node.stage);
  const stageLightColor = getStageLightColor(node.stage);

  return (
    <Card 
      className={cn(
        "transition-all duration-300 cursor-pointer hover:shadow-lg",
        isExpanded && "ring-2 ring-primary"
      )}
      onClick={onToggle}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
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
            <CardDescription>{node.scenario_description}</CardDescription>
          </div>
          <ChevronRight 
            className={cn(
              "h-5 w-5 text-muted-foreground transition-transform",
              isExpanded && "rotate-90"
            )} 
          />
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-3 pt-0" onClick={(e) => e.stopPropagation()}>
          <div className="grid gap-3 md:grid-cols-2">
            {node.script_content && (
              <div className="space-y-1.5">
                <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                  Script to Use
                </h4>
                <div className="bg-muted/50 rounded-md p-2.5 border-l-2 border-primary max-h-32 overflow-y-auto">
                  <p className="text-xs whitespace-pre-line leading-relaxed">{node.script_content}</p>
                </div>
                {node.script_section && (
                  <p className="text-xs text-muted-foreground">
                    Section: {node.script_section}
                  </p>
                )}
              </div>
            )}

            {node.crm_actions && (
              <div className="space-y-1.5">
                <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                  CRM Actions
                </h4>
                <div className="bg-secondary/50 rounded-md p-2.5 border max-h-32 overflow-y-auto">
                  <p className="text-xs">{node.crm_actions}</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2 border-t">
            <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
              Next Steps
            </h4>
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
          </div>
        </CardContent>
      )}
    </Card>
  );
};
