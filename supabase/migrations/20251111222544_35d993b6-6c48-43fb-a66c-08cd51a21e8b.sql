-- Add conversation_history field to leads table to store interaction history
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS conversation_history JSONB DEFAULT '[]'::jsonb;

-- Add conversation_notes field to store full transcript or notes
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS conversation_notes TEXT DEFAULT '';

COMMENT ON COLUMN public.leads.conversation_history IS 'Array of past conversation entries with date, channel, and summary';
COMMENT ON COLUMN public.leads.conversation_notes IS 'Full transcript or detailed notes from conversations';