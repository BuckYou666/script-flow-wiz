import { useState } from "react";
import { WorkflowNode, StageType } from "@/types/workflow";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NodeEditorProps {
  node: WorkflowNode | null;
  open: boolean;
  onClose: () => void;
  onSave: (node: Partial<WorkflowNode>) => void;
}

const stages: StageType[] = ["Source", "First Contact", "Appointment", "Pre-Call", "Close", "Objection", "Follow-Up", "Outcome"];

export const NodeEditor = ({ node, open, onClose, onSave }: NodeEditorProps) => {
  const [formData, setFormData] = useState<Partial<WorkflowNode>>(
    node || {
      node_id: "",
      parent_id: "",
      stage: "Source",
      scenario_title: "",
      scenario_description: "",
      script_name: "",
      script_section: "",
      script_content: "",
      on_yes_next_node: "",
      on_no_next_node: "",
      on_no_response_next_node: "",
      crm_actions: "",
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{node ? "Edit Node" : "Create New Node"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="node_id">Node ID *</Label>
              <Input
                id="node_id"
                value={formData.node_id || ""}
                onChange={(e) => setFormData({ ...formData, node_id: e.target.value })}
                required
                disabled={!!node}
              />
            </div>
            <div>
              <Label htmlFor="parent_id">Parent ID</Label>
              <Input
                id="parent_id"
                value={formData.parent_id || ""}
                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="stage">Stage *</Label>
            <Select value={formData.stage} onValueChange={(value) => setFormData({ ...formData, stage: value as StageType })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stages.map((stage) => (
                  <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="scenario_title">Scenario Title *</Label>
            <Input
              id="scenario_title"
              value={formData.scenario_title || ""}
              onChange={(e) => setFormData({ ...formData, scenario_title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="scenario_description">Scenario Description *</Label>
            <Textarea
              id="scenario_description"
              value={formData.scenario_description || ""}
              onChange={(e) => setFormData({ ...formData, scenario_description: e.target.value })}
              required
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="script_name">Script Name *</Label>
              <Input
                id="script_name"
                value={formData.script_name || ""}
                onChange={(e) => setFormData({ ...formData, script_name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="script_section">Script Section *</Label>
              <Input
                id="script_section"
                value={formData.script_section || ""}
                onChange={(e) => setFormData({ ...formData, script_section: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="script_content">Script Content</Label>
            <Textarea
              id="script_content"
              value={formData.script_content || ""}
              onChange={(e) => setFormData({ ...formData, script_content: e.target.value })}
              rows={4}
              placeholder="Enter the sales script here..."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="on_yes_next_node">On Yes Next Node</Label>
              <Input
                id="on_yes_next_node"
                value={formData.on_yes_next_node || ""}
                onChange={(e) => setFormData({ ...formData, on_yes_next_node: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="on_no_next_node">On No Next Node</Label>
              <Input
                id="on_no_next_node"
                value={formData.on_no_next_node || ""}
                onChange={(e) => setFormData({ ...formData, on_no_next_node: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="on_no_response_next_node">On No Response Node</Label>
              <Input
                id="on_no_response_next_node"
                value={formData.on_no_response_next_node || ""}
                onChange={(e) => setFormData({ ...formData, on_no_response_next_node: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="crm_actions">CRM Actions *</Label>
            <Textarea
              id="crm_actions"
              value={formData.crm_actions || ""}
              onChange={(e) => setFormData({ ...formData, crm_actions: e.target.value })}
              required
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {node ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
