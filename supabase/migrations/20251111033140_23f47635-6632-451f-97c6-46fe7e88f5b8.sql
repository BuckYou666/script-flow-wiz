-- Create workflow_nodes table
CREATE TABLE public.workflow_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id text UNIQUE NOT NULL,
  parent_id text,
  stage text NOT NULL,
  scenario_title text NOT NULL,
  scenario_description text NOT NULL,
  script_name text NOT NULL,
  script_section text NOT NULL,
  script_content text,
  on_yes_next_node text,
  on_no_next_node text,
  on_no_response_next_node text,
  crm_actions text NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.workflow_nodes ENABLE ROW LEVEL SECURITY;

-- Create policies - public read access for training tool
CREATE POLICY "Allow public read access"
  ON public.workflow_nodes
  FOR SELECT
  TO public
  USING (true);

-- Create policies - authenticated users can manage (for admin interface)
CREATE POLICY "Authenticated users can insert"
  ON public.workflow_nodes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update"
  ON public.workflow_nodes
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete"
  ON public.workflow_nodes
  FOR DELETE
  TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.workflow_nodes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create index for faster lookups
CREATE INDEX idx_workflow_nodes_node_id ON public.workflow_nodes(node_id);
CREATE INDEX idx_workflow_nodes_parent_id ON public.workflow_nodes(parent_id);
CREATE INDEX idx_workflow_nodes_stage ON public.workflow_nodes(stage);