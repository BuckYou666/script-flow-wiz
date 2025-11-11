import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Save, X } from "lucide-react";
import { useUpdateLead } from "@/hooks/useLeads";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";

interface LeadOverviewProps {
  lead: any;
  onNavigate?: (nextNodeId: string) => void;
  nextNodeId?: string;
}

export const LeadOverview = ({ lead, onNavigate, nextNodeId }: LeadOverviewProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedLead, setEditedLead] = useState({
    first_name: lead?.first_name || "",
    full_name: lead?.full_name || "",
    business_name: lead?.business_name || "",
    lead_magnet_name: lead?.lead_magnet_name || "",
    email: lead?.email || "",
    phone: lead?.phone || "",
  });
  const [internalNote, setInternalNote] = useState("");

  const updateLead = useUpdateLead();

  const handleSave = () => {
    if (!lead?.id) return;

    updateLead.mutate(
      { id: lead.id, ...editedLead },
      {
        onSuccess: () => {
          toast.success("Lead details updated successfully");
          setIsEditing(false);
        },
        onError: () => {
          toast.error("Failed to update lead details");
        },
      }
    );
  };

  const handleCancel = () => {
    setEditedLead({
      first_name: lead?.first_name || "",
      full_name: lead?.full_name || "",
      business_name: lead?.business_name || "",
      lead_magnet_name: lead?.lead_magnet_name || "",
      email: lead?.email || "",
      phone: lead?.phone || "",
    });
    setIsEditing(false);
  };

  const getLeadContextSummary = () => {
    const magnet = lead?.lead_magnet_name || "website signup";
    return `Website lead from ${magnet}. Currently in Entry Point stage. Moderate curiosity level — may need clarity on what Local AI actually does.`;
  };

  return (
    <div className="space-y-4">
      {/* Lead Overview Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              👤 Lead Overview
            </CardTitle>
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="gap-2"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit Lead Details
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  className="gap-2"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSave}
                  className="gap-2"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium w-1/3">Lead Name</TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      value={editedLead.first_name}
                      onChange={(e) =>
                        setEditedLead({ ...editedLead, first_name: e.target.value })
                      }
                      placeholder="First name"
                      className="h-8"
                    />
                  ) : (
                    <span>{lead?.first_name || "—"}</span>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Full Name</TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      value={editedLead.full_name}
                      onChange={(e) =>
                        setEditedLead({ ...editedLead, full_name: e.target.value })
                      }
                      placeholder="Full name"
                      className="h-8"
                    />
                  ) : (
                    <span>{lead?.full_name || "—"}</span>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Business Name</TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      value={editedLead.business_name}
                      onChange={(e) =>
                        setEditedLead({ ...editedLead, business_name: e.target.value })
                      }
                      placeholder="Business name"
                      className="h-8"
                    />
                  ) : (
                    <span>{lead?.business_name || "—"}</span>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Lead Source</TableCell>
                <TableCell>
                  <Badge variant="secondary">Website Signup</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Lead Magnet</TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      value={editedLead.lead_magnet_name}
                      onChange={(e) =>
                        setEditedLead({
                          ...editedLead,
                          lead_magnet_name: e.target.value,
                        })
                      }
                      placeholder="Lead magnet name"
                      className="h-8"
                    />
                  ) : (
                    <span>{lead?.lead_magnet_name || "—"}</span>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Email</TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={editedLead.email}
                      onChange={(e) =>
                        setEditedLead({ ...editedLead, email: e.target.value })
                      }
                      placeholder="email@example.com"
                      className="h-8"
                    />
                  ) : (
                    <span>{lead?.email || "—"}</span>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Phone</TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      type="tel"
                      value={editedLead.phone}
                      onChange={(e) =>
                        setEditedLead({ ...editedLead, phone: e.target.value })
                      }
                      placeholder="(555) 123-4567"
                      className="h-8"
                    />
                  ) : (
                    <span>{lead?.phone || "—"}</span>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Stage</TableCell>
                <TableCell>
                  <Badge variant="outline">Entry Point</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Last Contacted</TableCell>
                <TableCell>
                  {lead?.updated_at
                    ? new Date(lead.updated_at).toLocaleString()
                    : "—"}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Lead Context Summary */}
      <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <p className="text-sm text-foreground leading-relaxed">
            {getLeadContextSummary()}
          </p>
        </CardContent>
      </Card>

      {/* Quick Notes Field */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">📝 Add a quick internal note...</label>
            <Textarea
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              placeholder="Type any quick notes about this lead here..."
              className="min-h-[80px] resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      {nextNodeId && onNavigate && (
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/40">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">Ready to begin?</h3>
              <Button
                onClick={() => onNavigate(nextNodeId)}
                size="lg"
                className="w-full text-base"
              >
                Proceed to Script → "Choose Contact Method"
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
