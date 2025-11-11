import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { NodeEditor } from "@/components/admin/NodeEditor";
import { 
  useWorkflowNodes, 
  useCreateWorkflowNode, 
  useUpdateWorkflowNode, 
  useDeleteWorkflowNode,
  useBulkImportNodes 
} from "@/hooks/useWorkflowNodes";
import { WorkflowNode } from "@/types/workflow";
import { LogOut, Plus, Upload, Pencil, Trash2, Search } from "lucide-react";
import { workflowNodes as staticData } from "@/data/workflowData";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const AdminWorkflow = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

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
    const nodesToImport = staticData.map(({ node_id, parent_id, stage, scenario_title, scenario_description, script_name, script_section, script_content, on_yes_next_node, on_no_next_node, on_no_response_next_node, crm_actions }) => ({
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
      display_order: 0
    }));
    bulkImport.mutate(nodesToImport);
  };

  const filteredNodes = nodes?.filter(node => 
    node.scenario_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.node_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.stage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Workflow Admin</h1>
            <p className="text-muted-foreground">Manage sales workflow scripts and nodes</p>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Workflow Nodes ({nodes?.length || 0})</CardTitle>
              <div className="flex gap-2">
                {nodes?.length === 0 && (
                  <Button onClick={handleImportStatic} variant="secondary" className="gap-2">
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
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, node ID, or stage..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredNodes?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {nodes?.length === 0 ? "No nodes yet. Import initial data to get started." : "No nodes match your search."}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredNodes?.map((node) => (
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
    </div>
  );
};

export default AdminWorkflow;
