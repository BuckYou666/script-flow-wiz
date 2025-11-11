import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useUpdateLead } from "@/hooks/useLeads";
import { toast } from "sonner";

interface ConversationHistoryProps {
  leadId: string;
  conversationHistory?: any[];
}

export const ConversationHistory = ({ leadId, conversationHistory = [] }: ConversationHistoryProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [newTranscript, setNewTranscript] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<string>("Call");
  const updateLead = useUpdateLead();

  const handleSaveTranscript = () => {
    if (!newTranscript.trim()) {
      toast.error("Please enter a transcript before saving");
      return;
    }

    const newEntry = {
      date: new Date().toLocaleString(),
      channel: selectedChannel,
      summary: newTranscript.slice(0, 100) + (newTranscript.length > 100 ? "..." : ""),
      transcript: newTranscript,
    };

    const updatedHistory = [newEntry, ...conversationHistory];

    updateLead.mutate(
      { id: leadId, conversation_history: updatedHistory },
      {
        onSuccess: () => {
          toast.success("Transcript saved successfully");
          setNewTranscript("");
          setSelectedChannel("Call");
        },
        onError: () => {
          toast.error("Failed to save transcript");
        },
      }
    );
  };

  const channelOptions = ["Call", "SMS", "Email", "WhatsApp"];

  return (
    <Card className="bg-secondary/30 border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          🗂 Conversation History
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Recent Interactions List */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {conversationHistory.length === 0 ? (
            <div className="text-sm text-muted-foreground italic text-center py-6 bg-muted/20 rounded-lg border border-dashed border-border">
              No previous conversations recorded yet. After your first call, paste the transcript below.
            </div>
          ) : (
            conversationHistory.map((entry: any, index: number) => (
              <div
                key={index}
                className="border border-border/40 rounded-lg overflow-hidden bg-background/50"
              >
                <button
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  className="w-full text-left px-3 py-2.5 hover:bg-muted/30 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-muted-foreground font-mono">
                        {entry.date || "—"}
                      </span>
                      <Badge variant="outline" className="text-[10px] py-0 px-2">
                        {entry.channel || "Call"}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground/80 truncate flex-1">
                      {entry.summary || entry.transcript?.slice(0, 80) + "..." || "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-xs text-primary hover:underline">
                      {expandedIndex === index ? "Hide" : "View"} transcript
                    </span>
                    {expandedIndex === index ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>
                {expandedIndex === index && entry.transcript && (
                  <div className="px-3 py-3 bg-muted/20 border-t border-border/40">
                    <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">
                      Full Transcript
                    </div>
                    <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed max-h-[200px] overflow-y-auto bg-background/50 p-3 rounded border border-border/30">
                      {entry.transcript}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add New Transcript */}
        <div className="pt-2 border-t border-border/50 space-y-3">
          <label className="text-sm font-medium text-foreground">
            Add transcript from latest conversation
          </label>
          
          {/* Channel Selector */}
          <div className="flex gap-2">
            {channelOptions.map((channel) => (
              <Button
                key={channel}
                variant={selectedChannel === channel ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedChannel(channel)}
                className="text-xs"
              >
                {channel}
              </Button>
            ))}
          </div>

          <Textarea
            value={newTranscript}
            onChange={(e) => setNewTranscript(e.target.value)}
            placeholder="Paste call transcript or notes from your most recent conversation..."
            className="min-h-[100px] resize-none text-sm bg-background/50"
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setNewTranscript("");
                setSelectedChannel("Call");
              }}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveTranscript}
              disabled={updateLead.isPending}
              className="text-xs"
            >
              {updateLead.isPending ? "Saving..." : "Save Transcript"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
