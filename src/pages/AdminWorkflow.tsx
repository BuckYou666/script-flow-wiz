import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { NodeEditor } from "@/components/admin/NodeEditor";
import { WorkflowFlowView } from "@/components/admin/WorkflowFlowView";
import { WorkflowGuide } from "@/components/admin/WorkflowGuide";
import { 
  useWorkflowNodes, 
  useCreateWorkflowNode, 
  useUpdateWorkflowNode, 
  useDeleteWorkflowNode,
  useBulkImportNodes 
} from "@/hooks/useWorkflowNodes";
import { WorkflowNode } from "@/types/workflow";
import { LogOut, Plus, Upload, Pencil, Trash2, Search, ChevronDown, FolderOpen, Check, X, Network, List, HelpCircle, ArrowLeft } from "lucide-react";
import { workflowNodes as staticData } from "@/data/workflowData";
import { outboundWorkflowNodes } from "@/data/outboundWorkflowData";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const AdminWorkflow = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null);
  const [expandedWorkflows, setExpandedWorkflows] = useState<Set<string>>(new Set());
  const [user, setUser] = useState<any>(null);
  const [editingWorkflow, setEditingWorkflow] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [viewMode, setViewMode] = useState<'list' | 'flow'>('list');
  const [selectedWorkflowForFlow, setSelectedWorkflowForFlow] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [workflowToDelete, setWorkflowToDelete] = useState<string | null>(null);

  const { data: nodes, isLoading } = useWorkflowNodes();
  const createNode = useCreateWorkflowNode();
  const updateNode = useUpdateWorkflowNode();
  const deleteNode = useDeleteWorkflowNode();
  const bulkImport = useBulkImportNodes();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        navigate("/auth");
      } else {
        setUser(user);
      }
    });
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleSaveNode = (nodeData: Partial<WorkflowNode>) => {
    if (selectedNode) {
      updateNode.mutate({ ...nodeData, id: selectedNode.id } as any);
    } else {
      createNode.mutate(nodeData as Omit<WorkflowNode, 'id'>);
    }
  };

  const handleImportStatic = () => {
    const nodesToImport = staticData.map(({ node_id, parent_id, stage, scenario_title, scenario_description, script_name, script_section, script_content, on_yes_next_node, on_no_next_node, on_no_response_next_node, crm_actions, workflow_name }) => ({
      node_id,
      parent_id,
      stage,
      scenario_title,
      scenario_description,
      script_name,
      script_section,
      script_content,
      on_yes_next_node,
      on_no_next_node,
      on_no_response_next_node,
      crm_actions,
      workflow_name,
      display_order: 0
    }));
    bulkImport.mutate(nodesToImport);
  };

  const handleImportOutbound = () => {
    const nodesToImport = outboundWorkflowNodes.map(({ node_id, parent_id, stage, scenario_title, scenario_description, script_name, script_section, script_content, on_yes_next_node, on_no_next_node, on_no_response_next_node, crm_actions, workflow_name, display_order }) => ({
      node_id,
      parent_id,
      stage,
      scenario_title,
      scenario_description,
      script_name,
      script_section,
      script_content,
      on_yes_next_node,
      on_no_next_node,
      on_no_response_next_node,
      crm_actions,
      workflow_name,
      display_order: display_order || 0
    }));
    bulkImport.mutate(nodesToImport);
  };

  const filteredNodes = nodes?.filter(node => 
    node.scenario_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.node_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.stage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group nodes by workflow_name
  const groupedWorkflows = useMemo(() => {
    if (!filteredNodes) return {};
    
    const groups: Record<string, WorkflowNode[]> = {};
    filteredNodes.forEach(node => {
      const workflowName = node.workflow_name || "Uncategorized";
      if (!groups[workflowName]) {
        groups[workflowName] = [];
      }
      groups[workflowName].push(node);
    });
    
    return groups;
  }, [filteredNodes]);

  const toggleWorkflow = (workflowName: string) => {
    setExpandedWorkflows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(workflowName)) {
        newSet.delete(workflowName);
      } else {
        newSet.add(workflowName);
      }
      return newSet;
    });
  };

  const handleStartEditWorkflow = (workflowName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingWorkflow(workflowName);
    setEditingName(workflowName);
  };

  const handleSaveWorkflowName = async (oldName: string) => {
    if (!editingName.trim() || editingName === oldName) {
      setEditingWorkflow(null);
      return;
    }
    
    // Update all nodes in this workflow with the new name
    const nodesToUpdate = groupedWorkflows[oldName];
    for (const node of nodesToUpdate) {
      if (node.id) {
        await updateNode.mutateAsync({ ...node, id: node.id, workflow_name: editingName });
      }
    }
    
    setEditingWorkflow(null);
  };

  const handleCancelEditWorkflow = () => {
    setEditingWorkflow(null);
    setEditingName("");
  };

  const handleDeleteWorkflow = async (workflowName: string) => {
    const nodesToDelete = groupedWorkflows[workflowName];
    for (const node of nodesToDelete) {
      if (node.id) {
        await deleteNode.mutateAsync(node.id);
      }
    }
    setWorkflowToDelete(null);
  };

  // Auto-expand all workflows on first load and set default flow workflow
  useEffect(() => {
    if (nodes && nodes.length > 0) {
      if (expandedWorkflows.size === 0) {
        const workflowNames = new Set(nodes.map(n => n.workflow_name || "Uncategorized"));
        setExpandedWorkflows(workflowNames);
      }
      if (!selectedWorkflowForFlow && Object.keys(groupedWorkflows).length > 0) {
        setSelectedWorkflowForFlow(Object.keys(groupedWorkflows)[0]);
      }
    }
  }, [nodes, expandedWorkflows.size, selectedWorkflowForFlow, groupedWorkflows]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Training
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Workflow Editor</h1>
              <p className="text-muted-foreground">Edit scripts, nodes, and connections for your sales workflow</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGuide(true)}
              className="gap-2"
            >
              <HelpCircle className="h-4 w-4" />
              How to Edit
            </Button>
            <Button variant="outline" onClick={handleSignOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Workflow Nodes ({nodes?.length || 0})</CardTitle>
              <div className="flex gap-2">
                <div className="flex border rounded-md">
                  <Button 
                    variant={viewMode === 'list' ? 'default' : 'ghost'} 
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="gap-2 rounded-r-none"
                  >
                    <List className="h-4 w-4" />
                    List
                  </Button>
                  <Button 
                    variant={viewMode === 'flow' ? 'default' : 'ghost'} 
                    size="sm"
                    onClick={() => setViewMode('flow')}
                    className="gap-2 rounded-l-none"
                  >
                    <Network className="h-4 w-4" />
                    Flow
                  </Button>
                </div>
                <Button onClick={handleImportOutbound} variant="secondary" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Import Outbound Script
                </Button>
                {nodes?.length === 0 && (
                  <Button onClick={handleImportStatic} variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Import Initial Data
                  </Button>
                )}
                <Button onClick={() => { setSelectedNode(null); setIsEditorOpen(true); }} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Node
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {viewMode === 'list' && (
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, node ID, or stage..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}

            {viewMode === 'flow' && Object.keys(groupedWorkflows).length > 1 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Workflow to Visualize:</label>
                <div className="flex gap-2 flex-wrap">
                  {Object.keys(groupedWorkflows).map((workflowName) => (
                    <Button
                      key={workflowName}
                      variant={selectedWorkflowForFlow === workflowName ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedWorkflowForFlow(workflowName)}
                    >
                      {workflowName}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredNodes?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {nodes?.length === 0 ? "No nodes yet. Import initial data to get started." : "No nodes match your search."}
              </div>
            ) : viewMode === 'flow' ? (
              <WorkflowFlowView 
                nodes={selectedWorkflowForFlow ? groupedWorkflows[selectedWorkflowForFlow] : Object.values(groupedWorkflows).flat()}
                onNodeClick={(node) => { setSelectedNode(node); setIsEditorOpen(true); }}
              />
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedWorkflows).map(([workflowName, workflowNodes]) => {
                  const isExpanded = expandedWorkflows.has(workflowName);
                  
                  return (
                    <Collapsible key={workflowName} open={isExpanded} onOpenChange={() => toggleWorkflow(workflowName)}>
                      <CollapsibleTrigger className="w-full">
                        <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-accent/30 transition-colors group">
                          <FolderOpen className="h-5 w-5 text-primary" />
                          <div className="flex-1 text-left">
                            {editingWorkflow === workflowName ? (
                              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <Input
                                  value={editingName}
                                  onChange={(e) => setEditingName(e.target.value)}
                                  className="h-8"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveWorkflowName(workflowName);
                                    if (e.key === 'Escape') handleCancelEditWorkflow();
                                  }}
                                />
                                <Button size="sm" variant="ghost" onClick={() => handleSaveWorkflowName(workflowName)}>
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={handleCancelEditWorkflow}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <>
                                <h3 className="font-semibold text-lg">{workflowName}</h3>
                                <p className="text-sm text-muted-foreground">{workflowNodes.length} node{workflowNodes.length !== 1 ? 's' : ''}</p>
                              </>
                            )}
                          </div>
                          {editingWorkflow !== workflowName && (
                            <>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={(e) => handleStartEditWorkflow(workflowName, e)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setWorkflowToDelete(workflowName);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <ChevronDown className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="space-y-2 mt-2 ml-4 pl-4 border-l-2 border-primary/20">
                          {workflowNodes.map((node) => (
                            <div key={node.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline">{node.stage}</Badge>
                                  <span className="font-mono text-sm text-muted-foreground">{node.node_id}</span>
                                </div>
                                <h3 className="font-semibold">{node.scenario_title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-1">{node.scenario_description}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => { setSelectedNode(node); setIsEditorOpen(true); }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setNodeToDelete(node.id as string)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <NodeEditor
        node={selectedNode}
        open={isEditorOpen}
        onClose={() => { setIsEditorOpen(false); setSelectedNode(null); }}
        onSave={handleSaveNode}
      />

      <WorkflowGuide
        open={showGuide}
        onClose={() => setShowGuide(false)}
      />

      <AlertDialog open={!!nodeToDelete} onOpenChange={() => setNodeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Node</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this node? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (nodeToDelete) {
                  deleteNode.mutate(nodeToDelete);
                  setNodeToDelete(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!workflowToDelete} onOpenChange={() => setWorkflowToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entire Workflow</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the "{workflowToDelete}" workflow and all {workflowToDelete ? groupedWorkflows[workflowToDelete]?.length : 0} nodes within it? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (workflowToDelete) {
                  handleDeleteWorkflow(workflowToDelete);
                }
              }}
            >
              Delete Workflow
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminWorkflow;
