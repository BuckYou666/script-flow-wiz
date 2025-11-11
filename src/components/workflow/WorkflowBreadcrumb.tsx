import { WorkflowNode } from "@/types/workflow";
import { ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStageColor } from "@/types/workflow";

interface WorkflowBreadcrumbProps {
  path: WorkflowNode[];
  onNavigateToNode: (nodeId: string) => void;
}

export const WorkflowBreadcrumb = ({ path, onNavigateToNode }: WorkflowBreadcrumbProps) => {
  if (path.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap bg-card rounded-lg p-4 shadow-sm border">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onNavigateToNode("START")}
        className="h-8 gap-2"
      >
        <Home className="h-4 w-4" />
        Start
      </Button>
      
      {path.map((node, index) => (
        <div key={node.node_id} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigateToNode(node.node_id)}
            className="h-8 gap-2"
          >
            <Badge 
              variant="outline" 
              className={`text-${getStageColor(node.stage)} border-${getStageColor(node.stage)}`}
            >
              {node.stage}
            </Badge>
            <span className="max-w-[200px] truncate">{node.scenario_title}</span>
          </Button>
        </div>
      ))}
    </div>
  );
};
