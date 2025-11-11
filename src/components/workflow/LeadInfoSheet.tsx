import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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

interface LeadInfoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: any;
}

export const LeadInfoSheet = ({ open, onOpenChange, lead }: LeadInfoSheetProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedLead, setEditedLead] = useState({
    first_name: lead?.first_name || "",
    full_name: lead?.full_name || "",
    business_name: lead?.business_name || "",
    lead_magnet_name: lead?.lead_magnet_name || "",
    email: lead?.email || "",
    phone: lead?.phone || "",
  });

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

  // Parse conversation history
  const conversationHistory = lead?.conversation_history || [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[35%] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            👤 Lead Information
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5">
          {/* Lead Overview Card */}
          <Card className="bg-secondary/30 border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  Lead Details
                </CardTitle>
                {!isEditing ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="gap-1.5 h-8 text-xs"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit Details
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancel}
                      className="gap-1.5 h-8 text-xs"
                    >
                      <X className="h-3 w-3" />
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleSave}
                      className="gap-1.5 h-8 text-xs"
                    >
                      <Save className="h-3 w-3" />
                      Save
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Table>
                <TableBody>
                  <TableRow className="border-border/40">
                    <TableCell className="text-xs text-muted-foreground w-1/3 py-2.5">Lead Name</TableCell>
                    <TableCell className="py-2.5">
                      {isEditing ? (
                        <Input
                          value={editedLead.first_name}
                          onChange={(e) =>
                            setEditedLead({ ...editedLead, first_name: e.target.value })
                          }
                          placeholder="First name"
                          className="h-8 text-sm"
                        />
                      ) : (
                        <span className="text-sm font-medium">{lead?.first_name || "—"}</span>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-border/40">
                    <TableCell className="text-xs text-muted-foreground py-2.5">Full Name</TableCell>
                    <TableCell className="py-2.5">
                      {isEditing ? (
                        <Input
                          value={editedLead.full_name}
                          onChange={(e) =>
                            setEditedLead({ ...editedLead, full_name: e.target.value })
                          }
                          placeholder="Full name"
                          className="h-8 text-sm"
                        />
                      ) : (
                        <span className="text-sm font-medium">{lead?.full_name || "—"}</span>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-border/40">
                    <TableCell className="text-xs text-muted-foreground py-2.5">Business Name</TableCell>
                    <TableCell className="py-2.5">
                      {isEditing ? (
                        <Input
                          value={editedLead.business_name}
                          onChange={(e) =>
                            setEditedLead({ ...editedLead, business_name: e.target.value })
                          }
                          placeholder="Business name"
                          className="h-8 text-sm"
                        />
                      ) : (
                        <span className="text-sm font-medium">{lead?.business_name || "—"}</span>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-border/40">
                    <TableCell className="text-xs text-muted-foreground py-2.5">Lead Source</TableCell>
                    <TableCell className="py-2.5">
                      <Badge variant="secondary" className="text-xs">Website Signup</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-border/40">
                    <TableCell className="text-xs text-muted-foreground py-2.5">Lead Magnet</TableCell>
                    <TableCell className="py-2.5">
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
                          className="h-8 text-sm"
                        />
                      ) : (
                        <span className="text-sm font-medium">{lead?.lead_magnet_name || "—"}</span>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-border/40">
                    <TableCell className="text-xs text-muted-foreground py-2.5">Email</TableCell>
                    <TableCell className="py-2.5">
                      {isEditing ? (
                        <Input
                          type="email"
                          value={editedLead.email}
                          onChange={(e) =>
                            setEditedLead({ ...editedLead, email: e.target.value })
                          }
                          placeholder="email@example.com"
                          className="h-8 text-sm"
                        />
                      ) : (
                        <span className="text-sm font-medium">{lead?.email || "—"}</span>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-border/40">
                    <TableCell className="text-xs text-muted-foreground py-2.5">Phone</TableCell>
                    <TableCell className="py-2.5">
                      {isEditing ? (
                        <Input
                          type="tel"
                          value={editedLead.phone}
                          onChange={(e) =>
                            setEditedLead({ ...editedLead, phone: e.target.value })
                          }
                          placeholder="(555) 123-4567"
                          className="h-8 text-sm"
                        />
                      ) : (
                        <span className="text-sm font-medium">{lead?.phone || "—"}</span>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-border/40">
                    <TableCell className="text-xs text-muted-foreground py-2.5">Stage</TableCell>
                    <TableCell className="py-2.5">
                      <Badge variant="outline" className="text-xs">{lead?.status || "Entry Point"}</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-border/40">
                    <TableCell className="text-xs text-muted-foreground py-2.5">Last Contacted</TableCell>
                    <TableCell className="py-2.5">
                      <span className="text-sm font-medium">
                        {lead?.updated_at
                          ? new Date(lead.updated_at).toLocaleString()
                          : "—"}
                      </span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              
              {/* Context Summary */}
              <div className="mt-4 pt-4 border-t border-border/40">
                <p className="text-xs text-muted-foreground italic leading-relaxed">
                  {getLeadContextSummary()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Conversation History Card */}
          {conversationHistory.length > 0 && (
            <Card className="bg-secondary/30 border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                  🗂 Conversation History
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {conversationHistory.map((entry: any, index: number) => (
                    <div
                      key={index}
                      className="text-xs border-b border-border/30 pb-2 last:border-0"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-muted-foreground">
                          {entry.date || "—"}
                        </span>
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                          {entry.channel || "Call"}
                        </Badge>
                      </div>
                      <p className="text-foreground/80">{entry.summary || "—"}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conversation Notes */}
          <Card className="bg-secondary/30 border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                📝 Conversation Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Textarea
                value={lead?.conversation_notes || ""}
                readOnly
                placeholder="No notes recorded yet..."
                className="min-h-[100px] resize-none text-sm bg-background/50"
              />
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};
