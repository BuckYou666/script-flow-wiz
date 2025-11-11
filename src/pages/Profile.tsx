import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import { useLeads, useCreateLead } from "@/hooks/useLeads";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: profile, refetch } = useCurrentProfile();
  const { data: leads, refetch: refetchLeads } = useLeads();
  const createLead = useCreateLead();
  const [firstName, setFirstName] = useState("");
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  
  // Demo lead state
  const [demoLeadFirstName, setDemoLeadFirstName] = useState("");
  const [demoLeadFullName, setDemoLeadFullName] = useState("");
  const [demoLeadBusiness, setDemoLeadBusiness] = useState("");
  const [demoLeadMagnet, setDemoLeadMagnet] = useState("Local AI System Demo");

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setFullName(profile.full_name || "");
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          first_name: firstName,
          full_name: fullName,
        });

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddDemoLead = async () => {
    if (!demoLeadFirstName) {
      toast({
        title: "Error",
        description: "Please enter at least a first name for the demo lead.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createLead.mutateAsync({
        first_name: demoLeadFirstName,
        full_name: demoLeadFullName || demoLeadFirstName,
        business_name: demoLeadBusiness,
        lead_magnet_name: demoLeadMagnet,
        status: "New",
      });

      toast({
        title: "Demo Lead Added",
        description: "Your demo lead has been added successfully.",
      });

      // Reset form
      setDemoLeadFirstName("");
      setDemoLeadFullName("");
      setDemoLeadBusiness("");
      setDemoLeadMagnet("Local AI System Demo");
      
      refetchLeads();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      const { error } = await supabase
        .from("leads")
        .delete()
        .eq("id", leadId);

      if (error) throw error;

      toast({
        title: "Lead Deleted",
        description: "The demo lead has been deleted.",
      });
      
      refetchLeads();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Workflows
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>
              Update your name to personalize scripts and make them ready for calls.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jacob"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Used in scripts as {"{RepName}"}
              </p>
            </div>

            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jacob Smith"
              />
            </div>

            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Demo Leads</CardTitle>
            <CardDescription>
              Add demo leads to test script placeholders. The most recent lead will be used in workflow scripts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="demoLeadFirstName">First Name *</Label>
                  <Input
                    id="demoLeadFirstName"
                    value={demoLeadFirstName}
                    onChange={(e) => setDemoLeadFirstName(e.target.value)}
                    placeholder="Sarah"
                  />
                </div>
                <div>
                  <Label htmlFor="demoLeadFullName">Full Name</Label>
                  <Input
                    id="demoLeadFullName"
                    value={demoLeadFullName}
                    onChange={(e) => setDemoLeadFullName(e.target.value)}
                    placeholder="Sarah Johnson"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="demoLeadBusiness">Business Name</Label>
                <Input
                  id="demoLeadBusiness"
                  value={demoLeadBusiness}
                  onChange={(e) => setDemoLeadBusiness(e.target.value)}
                  placeholder="Acme Corp"
                />
              </div>

              <div>
                <Label htmlFor="demoLeadMagnet">Lead Magnet</Label>
                <Input
                  id="demoLeadMagnet"
                  value={demoLeadMagnet}
                  onChange={(e) => setDemoLeadMagnet(e.target.value)}
                  placeholder="Local AI System Demo"
                />
              </div>

              <Button onClick={handleAddDemoLead} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Demo Lead
              </Button>
            </div>

            {leads && leads.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-sm">Current Demo Leads:</h3>
                {leads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{lead.full_name || lead.first_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {lead.business_name && `${lead.business_name} • `}
                        {lead.lead_magnet_name}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteLead(lead.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
