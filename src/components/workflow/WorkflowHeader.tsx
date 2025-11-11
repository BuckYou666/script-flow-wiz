import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StageType } from "@/types/workflow";

interface WorkflowHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  stageFilter: StageType | "all";
  onStageFilterChange: (stage: StageType | "all") => void;
}

export const WorkflowHeader = ({
  searchQuery,
  onSearchChange,
  stageFilter,
  onStageFilterChange,
}: WorkflowHeaderProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          A-Tech Sales Workflow
        </h1>
        <p className="text-lg text-muted-foreground">
          Interactive training tool - Navigate through real sales scenarios and master every step
        </p>
      </div>

      <div className="flex gap-4 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search scenarios, scripts, or actions..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={stageFilter} onValueChange={(value) => onStageFilterChange(value as StageType | "all")}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="Source">Source</SelectItem>
            <SelectItem value="First Contact">First Contact</SelectItem>
            <SelectItem value="Appointment">Appointment</SelectItem>
            <SelectItem value="Pre-Call">Pre-Call</SelectItem>
            <SelectItem value="Close">Close</SelectItem>
            <SelectItem value="Objection">Objection</SelectItem>
            <SelectItem value="Follow-Up">Follow-Up</SelectItem>
            <SelectItem value="Outcome">Outcome</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
