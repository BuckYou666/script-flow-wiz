import { useState, useMemo } from "react";
import { workflowNodes } from "@/data/workflowData";
import { WorkflowNode as WorkflowNodeType, StageType } from "@/types/workflow";
import { WorkflowNode } from "@/components/workflow/WorkflowNode";
import { WorkflowBreadcrumb } from "@/components/workflow/WorkflowBreadcrumb";
import { WorkflowHeader } from "@/components/workflow/WorkflowHeader";
import { StageLegend } from "@/components/workflow/StageLegend";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [currentNodeId, setCurrentNodeId] = useState<string>("START");
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>("START");
  const [navigationPath, setNavigationPath] = useState<WorkflowNodeType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<StageType | "all">("all");

  const currentNode = workflowNodes.find(node => node.node_id === currentNodeId);
  
  const childNodes = useMemo(() => {
    return workflowNodes.filter(node => node.parent_id === currentNodeId);
  }, [currentNodeId]);

  const filteredNodes = useMemo(() => {
    let nodes = childNodes;

    if (stageFilter !== "all") {
      nodes = nodes.filter(node => node.stage === stageFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      nodes = nodes.filter(node => 
        node.scenario_title.toLowerCase().includes(query) ||
        node.scenario_description.toLowerCase().includes(query) ||
        node.script_name.toLowerCase().includes(query) ||
        node.script_content?.toLowerCase().includes(query) ||
        node.crm_actions.toLowerCase().includes(query)
      );
    }

    return nodes;
  }, [childNodes, searchQuery, stageFilter]);

  const handleNavigate = (nextNodeId: string, action: "yes" | "no" | "no_response") => {
    const nextNode = workflowNodes.find(node => node.node_id === nextNodeId);
    if (nextNode) {
      const actionLabels = {
        yes: "YES - Moving forward",
        no: "NO - Handling objection",
        no_response: "NO RESPONSE - Following up"
      };
      
      toast.success(`${actionLabels[action]}`, {
        description: `Navigating to: ${nextNode.scenario_title}`
      });

      if (currentNode) {
        setNavigationPath(prev => [...prev, currentNode]);
      }
      setCurrentNodeId(nextNodeId);
      setExpandedNodeId(nextNodeId);
    }
  };

  const handleNavigateToNode = (nodeId: string) => {
    const node = workflowNodes.find(n => n.node_id === nodeId);
    if (!node) return;

    const nodeIndex = navigationPath.findIndex(n => n.node_id === nodeId);
    
    if (nodeIndex >= 0) {
      setNavigationPath(prev => prev.slice(0, nodeIndex));
    }
    
    setCurrentNodeId(nodeId);
    setExpandedNodeId(nodeId);
  };

  const handleBack = () => {
    if (navigationPath.length > 0) {
      const previousNode = navigationPath[navigationPath.length - 1];
      setNavigationPath(prev => prev.slice(0, -1));
      setCurrentNodeId(previousNode.node_id);
      setExpandedNodeId(previousNode.node_id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <WorkflowHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          stageFilter={stageFilter}
          onStageFilterChange={setStageFilter}
        />

        <div className="mt-8 grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {navigationPath.length > 0 && (
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBack}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <WorkflowBreadcrumb 
                  path={navigationPath} 
                  onNavigateToNode={handleNavigateToNode}
                />
              </div>
            )}

            {currentNodeId === "START" ? (
              <div className="space-y-4">
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-3">
                    Choose Your Lead Source
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Select where this lead originated from to begin the appropriate sales workflow
                  </p>
                </div>
                
                {filteredNodes.length > 0 && (
                  <div className="grid gap-4 md:grid-cols-2">
                    {filteredNodes.map(node => (
                      <WorkflowNode
                        key={node.node_id}
                        node={node}
                        onNavigate={handleNavigate}
                        isExpanded={expandedNodeId === node.node_id}
                        onToggle={() => setExpandedNodeId(
                          expandedNodeId === node.node_id ? null : node.node_id
                        )}
                      />
                    ))}
                  </div>
                )}

                {filteredNodes.length === 0 && childNodes.length > 0 && (
                  <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed">
                    <p className="text-muted-foreground">
                      No results found. Try adjusting your search or filters.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              currentNode && (
                <div className="space-y-4">
                  <WorkflowNode
                    node={currentNode}
                    onNavigate={handleNavigate}
                    isExpanded={expandedNodeId === currentNode.node_id}
                    onToggle={() => setExpandedNodeId(
                      expandedNodeId === currentNode.node_id ? null : currentNode.node_id
                    )}
                  />
                  
                  {filteredNodes.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold mt-8">Available Options</h2>
                      {filteredNodes.map(node => (
                        <WorkflowNode
                          key={node.node_id}
                          node={node}
                          onNavigate={handleNavigate}
                          isExpanded={expandedNodeId === node.node_id}
                          onToggle={() => setExpandedNodeId(
                            expandedNodeId === node.node_id ? null : node.node_id
                          )}
                        />
                      ))}
                    </div>
                  )}

                  {filteredNodes.length === 0 && childNodes.length > 0 && (
                    <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed">
                      <p className="text-muted-foreground">
                        No results found. Try adjusting your search or filters.
                      </p>
                    </div>
                  )}
                </div>
              )
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <StageLegend />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
