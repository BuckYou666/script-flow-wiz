import { useCallback, useMemo } from 'react';
import { 
  ReactFlow, 
  Node, 
  Edge, 
  Background, 
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { WorkflowNode } from '@/types/workflow';
import { getStageColor, getStageLightColor } from '@/types/workflow';
import { Badge } from '@/components/ui/badge';

interface WorkflowFlowViewProps {
  nodes: WorkflowNode[];
  onNodeClick: (node: WorkflowNode) => void;
}

const nodeWidth = 280;
const nodeHeight = 140;
const horizontalSpacing = 350;
const verticalSpacing = 200;

export const WorkflowFlowView = ({ nodes, onNodeClick }: WorkflowFlowViewProps) => {
  // Transform workflow nodes to React Flow format
  const { flowNodes, flowEdges } = useMemo(() => {
    // Group nodes by stage for layout
    const stageGroups: Record<string, WorkflowNode[]> = {};
    nodes.forEach(node => {
      if (!stageGroups[node.stage]) {
        stageGroups[node.stage] = [];
      }
      stageGroups[node.stage].push(node);
    });

    // Calculate positions based on stage and index within stage
    const stageOrder = ["Source", "First Contact", "Appointment", "Pre-Call", "Close", "Objection", "Follow-Up", "Outcome"];
    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];

    stageOrder.forEach((stage, stageIndex) => {
      const stageNodes = stageGroups[stage] || [];
      stageNodes.forEach((node, nodeIndex) => {
        const yOffset = (nodeIndex - (stageNodes.length - 1) / 2) * verticalSpacing;
        
        flowNodes.push({
          id: node.node_id,
          type: 'custom',
          position: { 
            x: stageIndex * horizontalSpacing, 
            y: yOffset 
          },
          data: { 
            node,
            onNodeClick 
          },
        });

        // Create edges based on next node relationships
        const edgeConfigs = [
          { next: node.on_yes_next_node, type: 'yes', color: '#22c55e' },
          { next: node.on_no_next_node, type: 'no', color: '#f97316' },
          { next: node.on_no_response_next_node, type: 'no_response', color: '#ef4444' }
        ];

        edgeConfigs.forEach(({ next, type, color }) => {
          if (next) {
            flowEdges.push({
              id: `${node.node_id}-${type}-${next}`,
              source: node.node_id,
              target: next,
              type: 'smoothstep',
              animated: type === 'yes',
              style: { stroke: color, strokeWidth: 2 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: color,
              },
              label: type === 'yes' ? 'Yes' : type === 'no' ? 'No' : 'No Response',
              labelStyle: { fill: color, fontWeight: 600, fontSize: 12 },
              labelBgStyle: { fill: 'white', fillOpacity: 0.9 },
            });
          }
        });
      });
    });

    return { flowNodes, flowEdges };
  }, [nodes, onNodeClick]);

  const [rfNodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [rfEdges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  // Custom node component
  const CustomNode = useCallback(({ data }: { data: { node: WorkflowNode; onNodeClick: (node: WorkflowNode) => void } }) => {
    const { node, onNodeClick } = data;
    const stageColor = getStageColor(node.stage);
    const stageLightColor = getStageLightColor(node.stage);

    return (
      <div 
        className="px-4 py-3 border-2 rounded-lg bg-card shadow-lg cursor-pointer hover:shadow-xl transition-all group"
        style={{ width: nodeWidth, borderColor: `hsl(var(--${stageColor}))` }}
        onClick={() => onNodeClick(node)}
      >
        <div className="flex flex-col gap-2">
          <Badge 
            variant="outline" 
            className="font-medium text-xs w-fit"
            style={{ 
              backgroundColor: `hsl(var(--${stageLightColor}))`,
              color: `hsl(var(--${stageColor}))`,
              borderColor: `hsl(var(--${stageColor}))`
            }}
          >
            {node.stage}
          </Badge>
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {node.scenario_title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-snug">
            {node.scenario_description}
          </p>
          {node.script_name && (
            <Badge variant="secondary" className="text-[10px] w-fit">
              {node.script_name}
            </Badge>
          )}
        </div>
      </div>
    );
  }, []);

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), [CustomNode]);

  return (
    <div className="h-[calc(100vh-300px)] w-full border rounded-lg bg-accent/5">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={1.5}
      >
        <Background />
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            const workflowNode = node.data?.node as WorkflowNode;
            if (!workflowNode) return '#e5e7eb';
            const stageLightColor = getStageLightColor(workflowNode.stage);
            return `hsl(var(--${stageLightColor}))`;
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
    </div>
  );
};
