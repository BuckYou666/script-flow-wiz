import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkflowNodes } from "@/hooks/useWorkflowNodes";
import { WorkflowNode as WorkflowNodeType, StageType, getStageColor, getStageLightColor } from "@/types/workflow";
import { WorkflowNode } from "@/components/workflow/WorkflowNode";
import { WorkflowBreadcrumb } from "@/components/workflow/WorkflowBreadcrumb";
import { WorkflowHeader } from "@/components/workflow/WorkflowHeader";
import { StageLegend } from "@/components/workflow/StageLegend";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Users, Globe, PhoneIncoming, Target, UserCheck, RefreshCw, Info, ChevronRight, Pencil } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  const navigate = useNavigate();
  const { data: workflowNodes = [], isLoading } = useWorkflowNodes();
  const [currentNodeId, setCurrentNodeId] = useState<string>("START");
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>("START");
  const [navigationPath, setNavigationPath] = useState<WorkflowNodeType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<StageType | "all">("all");
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>("all");

  const currentNode = workflowNodes.find(node => node.node_id === currentNodeId);
  
  const availableWorkflows = useMemo(() => {
    const workflows = new Set(workflowNodes.map(node => node.workflow_name).filter(Boolean));
    return Array.from(workflows).sort();
  }, [workflowNodes]);

  const childNodes = useMemo(() => {
    let nodes = workflowNodes.filter(node => node.parent_id === currentNodeId);
    
    if (selectedWorkflow !== "all" && currentNodeId === "START") {
      nodes = nodes.filter(node => node.workflow_name === selectedWorkflow);
    }
    
    // Sort by display_order
    nodes.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    
    return nodes;
  }, [workflowNodes, currentNodeId, selectedWorkflow]);

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

  const handleSelectChild = (nodeId: string) => {
    const node = workflowNodes.find(n => n.node_id === nodeId);
    if (node) {
      // Preserve navigation history when clicking child cards
      if (currentNode) {
        setNavigationPath(prev => [...prev, currentNode]);
      }
      setCurrentNodeId(nodeId);
      setExpandedNodeId(nodeId);
      toast.success("Navigating to", {
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
    setSelectedWorkflow("all");
    toast.success("Workflow Reset", {
      description: "Back to lead source selection"
    });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-secondary/20 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Fixed Header */}
        <div className="flex-none px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto max-w-7xl">
            {currentNodeId === "START" ? (
              <div className="py-6">
                <div className="flex items-center justify-between mb-4">
                  <WorkflowHeader
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    stageFilter={stageFilter}
                    onStageFilterChange={setStageFilter}
                  />
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => navigate("/admin/workflow")}
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit Workflow
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBack}
                    disabled={navigationPath.length === 0}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="gap-2"
                  >
                    Start Over
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => navigate("/admin/workflow")}
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit Mode
                  </Button>
                  <Sheet open={showGuide} onOpenChange={setShowGuide}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Info className="h-4 w-4" />
                        <span className="hidden sm:inline">Stage Guide</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle>Stage Guide</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        <StageLegend />
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto scroll-smooth">
          <div className="container mx-auto px-6 py-2 pb-20 max-w-[1400px] min-h-full">
            <div className="w-full space-y-4">
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

                    {availableWorkflows.length > 1 && (
                      <div className="flex justify-center mb-6 animate-in fade-in duration-500">
                        <div className="inline-flex flex-col gap-2">
                          <label className="text-sm text-muted-foreground text-center">Filter by Workflow</label>
                          <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
                            <SelectTrigger className="w-[280px]">
                              <SelectValue placeholder="All Workflows" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Workflows</SelectItem>
                              {availableWorkflows.map((workflow) => (
                                <SelectItem key={workflow} value={workflow || ""}>
                                  {workflow || "Untitled Workflow"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                    
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
                    <div className="space-y-2 animate-in fade-in duration-500">
                      {/* Current Node - Main Focus */}
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-2">
                        <p className="text-xs text-muted-foreground mb-0.5">Currently Learning:</p>
                        <h2 className="text-lg font-bold text-primary">{currentNode.scenario_title}</h2>
                      </div>
                      
                      <WorkflowNode
                        node={currentNode}
                        onNavigate={handleNavigate}
                        isExpanded={true}
                        onToggle={() => {}}
                        childNodes={filteredNodes}
                        onSelectChild={handleSelectChild}
                      />

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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
