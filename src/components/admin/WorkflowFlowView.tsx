import { useCallback, useMemo, useState } from 'react';
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
  MarkerType,
  EdgeMouseHandler
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
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  const [hoveredNodes, setHoveredNodes] = useState<Set<string>>(new Set());

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

        // Create edges based on next node relationships with subtle professional styling
        const edgeConfigs = [
          { next: node.on_yes_next_node, type: 'yes', color: 'hsl(217, 91%, 60%)', label: 'Yes' },
          { next: node.on_no_next_node, type: 'no', color: 'hsl(220, 15%, 70%)', label: 'No' },
          { next: node.on_no_response_next_node, type: 'no_response', color: 'hsl(220, 10%, 60%)', label: 'No Response' }
        ];

        edgeConfigs.forEach(({ next, type, color, label }) => {
          if (next) {
            flowEdges.push({
              id: `${node.node_id}-${type}-${next}`,
              source: node.node_id,
              target: next,
              type: 'smoothstep',
              animated: false,
              style: { 
                stroke: color, 
                strokeWidth: 2,
                transition: 'all 0.2s ease'
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: color,
              },
              label: label,
              labelStyle: { 
                fill: 'hsl(220, 15%, 30%)', 
                fontWeight: 500, 
                fontSize: 11,
                fontFamily: 'system-ui, sans-serif'
              },
              labelBgStyle: { 
                fill: 'hsl(0, 0%, 100%)', 
                fillOpacity: 0.95
              },
              data: { 
                sourceNode: node.node_id, 
                targetNode: next 
              }
            });
          }
        });
      });
    });

    return { flowNodes, flowEdges };
  }, [nodes, onNodeClick]);

  const [rfNodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [rfEdges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  // Handle edge hover for highlighting
  const handleEdgeMouseEnter: EdgeMouseHandler = useCallback((event, edge) => {
    setHoveredEdge(edge.id);
    const sourceNode = edge.source;
    const targetNode = edge.target;
    setHoveredNodes(new Set([sourceNode, targetNode]));
  }, []);

  const handleEdgeMouseLeave: EdgeMouseHandler = useCallback(() => {
    setHoveredEdge(null);
    setHoveredNodes(new Set());
  }, []);

  // Update edges with hover state
  const edgesWithHover = useMemo(() => {
    return rfEdges.map(edge => {
      const isHovered = hoveredEdge === edge.id;
      const originalColor = (edge.markerEnd as any)?.color || 'hsl(220, 15%, 70%)';
      
      return {
        ...edge,
        style: {
          ...edge.style,
          strokeWidth: isHovered ? 3 : 2,
          stroke: isHovered ? 'hsl(217, 91%, 50%)' : edge.style?.stroke,
          opacity: hoveredEdge && !isHovered ? 0.3 : 1,
        },
        markerEnd: edge.markerEnd ? {
          type: (edge.markerEnd as any).type || MarkerType.ArrowClosed,
          color: isHovered ? 'hsl(217, 91%, 50%)' : originalColor,
        } : undefined,
      };
    });
  }, [rfEdges, hoveredEdge]);

  // Custom node component
  const CustomNode = useCallback(({ data, id }: { data: { node: WorkflowNode; onNodeClick: (node: WorkflowNode) => void }, id: string }) => {
    const { node, onNodeClick } = data;
    const stageColor = getStageColor(node.stage);
    const stageLightColor = getStageLightColor(node.stage);
    const isHighlighted = hoveredNodes.has(id);
    const isOrphan = !flowNodes.some(n => {
      const wn = n.data.node as WorkflowNode;
      return wn.on_yes_next_node === node.node_id || 
             wn.on_no_next_node === node.node_id || 
             wn.on_no_response_next_node === node.node_id;
    }) && node.parent_id !== null;

    return (
      <div 
        className="px-4 py-3 border-2 rounded-lg bg-card shadow-lg cursor-pointer hover:shadow-xl transition-all group"
        style={{ 
          width: nodeWidth, 
          borderColor: `hsl(var(--${stageColor}))`,
          borderStyle: isOrphan ? 'dashed' : 'solid',
          opacity: isHighlighted ? 1 : hoveredEdge ? 0.4 : 1,
          transform: isHighlighted ? 'scale(1.05)' : 'scale(1)',
          transition: 'all 0.2s ease',
          boxShadow: isHighlighted 
            ? '0 8px 24px hsla(217, 91%, 60%, 0.3)' 
            : undefined
        }}
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
  }, [hoveredNodes, hoveredEdge, flowNodes]);

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), [CustomNode]);

  return (
    <div className="h-[calc(100vh-300px)] w-full border rounded-lg bg-accent/5">
      <ReactFlow
        nodes={rfNodes}
        edges={edgesWithHover}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onEdgeMouseEnter={handleEdgeMouseEnter}
        onEdgeMouseLeave={handleEdgeMouseLeave}
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
