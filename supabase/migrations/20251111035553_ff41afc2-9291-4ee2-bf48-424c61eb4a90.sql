-- Add workflow_name column to organize nodes into folders/groups
ALTER TABLE workflow_nodes
ADD COLUMN workflow_name TEXT DEFAULT 'Default Workflow';