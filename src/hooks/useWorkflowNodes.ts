import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkflowNode } from "@/types/workflow";
import { useToast } from "@/hooks/use-toast";

export const useWorkflowNodes = () => {
  return useQuery({
    queryKey: ['workflow-nodes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_nodes')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      
      return data as WorkflowNode[];
    }
  });
};

export const useCreateWorkflowNode = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (node: Omit<WorkflowNode, 'id'>) => {
      const { data, error } = await supabase
        .from('workflow_nodes')
        .insert(node)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-nodes'] });
      toast({ title: "Node created successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to create node", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });
};

export const useUpdateWorkflowNode = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WorkflowNode> & { id: string }) => {
      const { data, error } = await supabase
        .from('workflow_nodes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-nodes'] });
      toast({ title: "Node updated successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to update node", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });
};

export const useDeleteWorkflowNode = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('workflow_nodes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-nodes'] });
      toast({ title: "Node deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to delete node", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });
};

export const useBulkImportNodes = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (nodes: Omit<WorkflowNode, 'id'>[]) => {
      const { data, error } = await supabase
        .from('workflow_nodes')
        .insert(nodes)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workflow-nodes'] });
      toast({ title: `Successfully imported ${data?.length} nodes` });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to import nodes", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });
};
