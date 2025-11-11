import { useState, useMemo } from "react";
import { workflowNodes } from "@/data/workflowData";
import { WorkflowNode as WorkflowNodeType, StageType } from "@/types/workflow";
import { WorkflowNode } from "@/components/workflow/WorkflowNode";
import { WorkflowBreadcrumb } from "@/components/workflow/WorkflowBreadcrumb";
import { WorkflowHeader } from "@/components/workflow/WorkflowHeader";
import { StageLegend } from "@/components/workflow/StageLegend";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Globe, PhoneIncoming, Target, UserCheck, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const getSourceIcon = (nodeId: string) => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    SRC_SKOOL: Users,
    SRC_WEBSITE: Globe,
    SRC_INBOUND: PhoneIncoming,
    SRC_OUTBOUND: Target,
    SRC_REFERRAL: UserCheck,
    SRC_PIPELINE: RefreshCw,
  };
  return iconMap[nodeId] || Target;
};

const Index = () => {
  const [currentNodeId, setCurrentNodeId] = useState<string>("START");
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>("START");
  const [navigationPath, setNavigationPath] = useState<WorkflowNodeType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<StageType | "all">("all");
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

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

  const handleSelectSource = (nodeId: string) => {
    const node = workflowNodes.find(n => n.node_id === nodeId);
    if (node) {
      setSelectedSource(nodeId);
      setCurrentNodeId(nodeId);
      setExpandedNodeId(nodeId);
      setNavigationPath([]);
      toast.success("Lead Source Selected", {
        description: node.scenario_title
      });
    }
  };

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

  const handleReset = () => {
    setCurrentNodeId("START");
    setExpandedNodeId("START");
    setNavigationPath([]);
    setSelectedSource(null);
    setSearchQuery("");
    setStageFilter("all");
    toast.success("Workflow Reset", {
      description: "Back to lead source selection"
    });
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-secondary/20 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Fixed Header */}
        <div className="flex-none px-4 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto max-w-7xl">
            <div className="flex items-center justify-between gap-4">
              {currentNodeId !== "START" && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Start Over
                  </Button>
                  {navigationPath.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBack}
                      className="gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Previous
                    </Button>
                  )}
                </div>
              )}
              {currentNodeId !== "START" && (
                <div className="flex-1 max-w-md">
                  <WorkflowHeader
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    stageFilter={stageFilter}
                    onStageFilterChange={setStageFilter}
                  />
                </div>
              )}
            </div>
            {navigationPath.length > 0 && (
              <div className="mt-2">
                <WorkflowBreadcrumb 
                  path={navigationPath} 
                  onNavigateToNode={handleNavigateToNode}
                />
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto scroll-smooth">
          <div className="container mx-auto px-4 py-6 pb-40 max-w-7xl min-h-full">
            <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
              <div className="w-full max-w-4xl mx-auto lg:mx-0 space-y-6">
                {currentNodeId === "START" ? (
                  <div className="space-y-4">
                    <div className="text-center mb-8 animate-in fade-in duration-500">
                      <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mb-4">
                        Sales Workflow Training
                      </h1>
                      <p className="text-xl text-muted-foreground mb-2">
                        Choose Your Lead Source to Begin
                      </p>
                      <p className="text-sm text-muted-foreground/80">
                        Click on any pipeline option to start the interactive training workflow
                      </p>
                    </div>
                    
                    {filteredNodes.length > 0 && (
                      <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {filteredNodes.map((node, index) => {
                          const SourceIcon = getSourceIcon(node.node_id);
                          return (
                            <div
                              key={node.node_id}
                              className="animate-in fade-in slide-in-from-bottom-2 duration-500"
                              style={{ animationDelay: `${index * 100}ms` }}
                            >
                              <button
                                onClick={() => handleSelectSource(node.node_id)}
                                className="w-full text-left group"
                              >
                                <div className="relative overflow-hidden rounded-xl border-2 border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-primary/50 cursor-pointer">
                                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                  <div className="absolute top-4 right-4">
                                    <SourceIcon className="h-12 w-12 text-primary/20 group-hover:text-primary/40 transition-colors" />
                                  </div>
                                  <div className="relative">
                                    <div className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold mb-3 bg-stage-${node.stage.toLowerCase().replace(/[^a-z]/g, '')}/10 text-stage-${node.stage.toLowerCase().replace(/[^a-z]/g, '')}`}>
                                      {node.stage}
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors pr-16">
                                      {node.scenario_title}
                                    </h3>
                                    <p className="text-muted-foreground mb-4">
                                      {node.scenario_description}
                                    </p>
                                    <div className="flex items-center text-sm text-primary font-medium">
                                      <span>Start This Path</span>
                                      <ArrowLeft className="ml-2 h-4 w-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                  </div>
                                </div>
                              </button>
                            </div>
                          );
                        })}
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
                    <div className="space-y-6">
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Currently Learning:</p>
                        <h2 className="text-2xl font-bold text-primary">{currentNode.scenario_title}</h2>
                      </div>
                      
                      <WorkflowNode
                        node={currentNode}
                        onNavigate={handleNavigate}
                        isExpanded={true}
                        onToggle={() => {}}
                      />
                      
                      {filteredNodes.length > 0 && (
                        <div className="space-y-4">
                          <div className="border-t pt-6">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                              <span className="inline-block w-1 h-6 bg-primary rounded-full" />
                              Next Steps Available
                            </h3>
                            <div className="space-y-4">
                              {filteredNodes.map((node, index) => (
                                <div
                                  key={node.node_id}
                                  className="animate-in fade-in slide-in-from-bottom-2 duration-500"
                                  style={{ animationDelay: `${index * 100}ms` }}
                                >
                                  <WorkflowNode
                                    node={node}
                                    onNavigate={handleNavigate}
                                    isExpanded={expandedNodeId === node.node_id}
                                    onToggle={() => setExpandedNodeId(
                                      expandedNodeId === node.node_id ? null : node.node_id
                                    )}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {filteredNodes.length === 0 && childNodes.length === 0 && (
                        <div className="text-center py-12 bg-green-500/10 border-2 border-green-500/20 rounded-lg">
                          <div className="text-6xl mb-4">🎉</div>
                          <h3 className="text-2xl font-bold mb-2 text-green-600 dark:text-green-400">
                            Workflow Complete!
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            You've reached the end of this sales path.
                          </p>
                          <Button onClick={handleReset} size="lg" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Start New Workflow
                          </Button>
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

              <div className="hidden lg:block">
                <div className="sticky top-6">
                  <StageLegend />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
