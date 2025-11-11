import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const StageLegend = () => {
  const stages = [
    { name: "Source/Entry", color: "stage-source", lightColor: "stage-source-light", description: "Lead origin and initial contact" },
    { name: "Contact/Appointment", color: "stage-contact", lightColor: "stage-contact-light", description: "First outreach and booking" },
    { name: "Close/Objection", color: "stage-close", lightColor: "stage-close-light", description: "Sales call and handling concerns" },
    { name: "Follow-Up/Nurture", color: "stage-followup", lightColor: "stage-followup-light", description: "Long-term engagement" },
    { name: "Outcome", color: "stage-outcome", lightColor: "stage-outcome-light", description: "Final results and next actions" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Stage Guide</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {stages.map((stage) => (
          <div key={stage.name} className="flex items-start gap-3">
            <Badge 
              variant="outline" 
              className={`shrink-0 bg-${stage.lightColor} text-${stage.color} border-${stage.color} border-2`}
            >
              {stage.name}
            </Badge>
            <p className="text-sm text-muted-foreground">{stage.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
