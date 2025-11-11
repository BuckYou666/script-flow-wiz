export type StageType = "Source" | "First Contact" | "Appointment" | "Pre-Call" | "Close" | "Objection" | "Follow-Up" | "Outcome";

export interface WorkflowNode {
  node_id: string;
  parent_id: string | null;
  stage: StageType;
  scenario_title: string;
  scenario_description: string;
  script_name: string;
  script_section: string;
  script_content?: string;
  on_yes_next_node?: string;
  on_no_next_node?: string;
  on_no_response_next_node?: string;
  crm_actions: string;
}

export const getStageColor = (stage: StageType): string => {
  const colorMap: Record<StageType, string> = {
    "Source": "stage-source",
    "First Contact": "stage-contact",
    "Appointment": "stage-contact",
    "Pre-Call": "stage-contact",
    "Close": "stage-close",
    "Objection": "stage-close",
    "Follow-Up": "stage-followup",
    "Outcome": "stage-outcome",
  };
  return colorMap[stage] || "stage-source";
};

export const getStageLightColor = (stage: StageType): string => {
  const colorMap: Record<StageType, string> = {
    "Source": "stage-source-light",
    "First Contact": "stage-contact-light",
    "Appointment": "stage-contact-light",
    "Pre-Call": "stage-contact-light",
    "Close": "stage-close-light",
    "Objection": "stage-close-light",
    "Follow-Up": "stage-followup-light",
    "Outcome": "stage-outcome-light",
  };
  return colorMap[stage] || "stage-source-light";
};
