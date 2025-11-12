import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Network, List, Pencil, Plus, Trash2, Check } from "lucide-react";

interface WorkflowGuideProps {
  open: boolean;
  onClose: () => void;
}

export const WorkflowGuide = ({ open, onClose }: WorkflowGuideProps) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Workflow Editor",
      icon: Network,
      description: "This powerful editor lets you manage your entire sales workflow - scripts, decision points, and automation rules.",
      content: [
        "Edit any script, question, or response instantly",
        "Create new nodes and connect them visually",
        "View your entire workflow as an interactive flowchart",
        "Changes save automatically to your database"
      ]
    },
    {
      title: "Two View Modes",
      icon: List,
      description: "Switch between List and Flow views to work the way you prefer.",
      content: [
        "📋 List View: Organized by workflow name, perfect for quick text edits",
        "🔀 Flow View: Visual flowchart showing connections between nodes",
        "Click any node in either view to open the editor",
        "Use the toggle buttons at the top to switch views"
      ]
    },
    {
      title: "Editing Nodes",
      icon: Pencil,
      description: "Click the edit icon on any node to modify its content.",
      content: [
        "Edit script text, titles, and descriptions",
        "Change which nodes connect to each other (YES/NO/NO RESPONSE paths)",
        "Update CRM automation rules",
        "Assign nodes to different workflow folders"
      ]
    },
    {
      title: "Creating & Organizing",
      icon: Plus,
      description: "Add new nodes and organize your workflow into folders.",
      content: [
        "Click 'Add Node' to create new script steps",
        "Group related nodes into named workflows",
        "Rename workflow folders by clicking the edit icon",
        "Import pre-built scripts with one click"
      ]
    },
    {
      title: "Ready to Edit!",
      icon: Check,
      description: "You're all set. Here are some quick tips:",
      content: [
        "💡 Changes save automatically when you click 'Update'",
        "🔍 Use the search bar to find specific nodes quickly",
        "📊 Flow View shows how nodes connect - great for planning",
        "🗑️ Delete nodes carefully - make sure nothing links to them first"
      ]
    }
  ];

  const currentStep = steps[step];
  const Icon = currentStep.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
              <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <DialogTitle className="text-2xl">{currentStep.title}</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            {currentStep.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <ul className="space-y-3">
            {currentStep.content.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-blue-600 flex-shrink-0" />
                <p className="text-sm leading-relaxed">{item}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-1">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 w-2 rounded-full transition-all ${
                  idx === step ? "bg-blue-600 w-8" : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Previous
              </Button>
            )}
            {step < steps.length - 1 ? (
              <Button onClick={() => setStep(step + 1)}>
                Next
              </Button>
            ) : (
              <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
                Start Editing
              </Button>
            )}
          </div>
        </div>

        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs text-muted-foreground"
          >
            Skip Tutorial
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
