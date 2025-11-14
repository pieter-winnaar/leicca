"use client"

import * as React from "react"
import {
  sankey as d3Sankey,
  sankeyLinkHorizontal,
  sankeyLeft,
  SankeyGraph,
  SankeyNode,
  SankeyLink,
} from 'd3-sankey'
import { cn } from "../lib/utils"
import { useTheme } from "./ThemeProvider"

export interface FlowNode {
  id: string
  label: string
  timestamp?: number
  value?: number
  status?: string
  metadata?: Record<string, any>
  position?: { x: number; y: number }
}

export interface FlowEdge {
  source: string
  target: string
  value?: number
  label?: string
  animated?: boolean
}

export interface FlowDiagramProps {
  nodes: FlowNode[]
  edges: FlowEdge[]
  currentTime?: number
  onNodeClick?: (node: FlowNode) => void
  variant?: 'sankey' | 'tree'
  className?: string
  showMiniMap?: boolean
  showControls?: boolean
  showBackground?: boolean
  fitView?: boolean
  "aria-label"?: string
}

// D3 Sankey node type (internal)
type D3Node = SankeyNode<FlowNode, FlowEdge> & FlowNode
type D3Link = SankeyLink<FlowNode, FlowEdge> & FlowEdge

// Status color mapping (using CSS custom properties from theme)
const getStatusClass = (status?: string) => {
  switch (status) {
    case 'pending':
      return 'flow-status-pending'
    case 'complete':
    case 'confirmed':
      return 'flow-status-confirmed'
    case 'failed':
      return 'flow-status-failed'
    default:
      return 'flow-status-default'
  }
}

export const FlowDiagram = React.forwardRef<HTMLDivElement, FlowDiagramProps>(
  (
    {
      nodes: inputNodes,
      edges: inputEdges,
      currentTime = Infinity,
      onNodeClick,
      className,
      "aria-label": ariaLabel = "Flow Diagram",
    },
    ref
  ) => {
    const { theme } = useTheme()
    const containerRef = React.useRef<HTMLDivElement>(null)
    const [dimensions, setDimensions] = React.useState({ width: 800, height: 600 })
    const [isMounted, setIsMounted] = React.useState(false)
    const [hoveredNode, setHoveredNode] = React.useState<FlowNode | null>(null)
    const [tooltipPos, setTooltipPos] = React.useState<{ x: number; y: number } | null>(null)

    // Force re-render after mount to ensure CSS variables are computed
    React.useEffect(() => {
      setIsMounted(true)
    }, [])

    // Get computed CSS variable values for theme colors
    // SVG needs actual color values, not CSS variable references
    const getColor = React.useCallback((colorKey: string): string => {
      if (typeof window === 'undefined' || !isMounted) return '#000' // SSR/hydration fallback

      const root = document.documentElement
      const computedStyle = getComputedStyle(root)
      const value = computedStyle.getPropertyValue(colorKey).trim()

      // Check if it's already in oklch format or needs wrapping
      if (value.includes('oklch')) return value
      return value ? `oklch(${value})` : '#000'
    }, [theme, isMounted]) // Re-compute when theme changes or mounted

    // Get colors based on status
    const getStatusColors = React.useCallback((status?: string) => {
      switch (status) {
        case 'pending':
          return {
            fill: getColor('--muted'),
            stroke: getColor('--muted-foreground'),
            gradientStart: getColor('--muted-foreground'),
            gradientEnd: `${getColor('--muted-foreground').replace(')', ' / 0.2)')}`,
          }
        case 'complete':
        case 'confirmed':
          return {
            fill: `${getColor('--primary').replace(')', ' / 0.1)')}`,
            stroke: getColor('--primary'),
            gradientStart: getColor('--primary'),
            gradientEnd: `${getColor('--primary').replace(')', ' / 0.3)')}`,
          }
        case 'failed':
          return {
            fill: `${getColor('--destructive').replace(')', ' / 0.1)')}`,
            stroke: getColor('--destructive'),
            gradientStart: getColor('--destructive'),
            gradientEnd: `${getColor('--destructive').replace(')', ' / 0.3)')}`,
          }
        default:
          return {
            fill: getColor('--card'),
            stroke: getColor('--border'),
            gradientStart: getColor('--muted-foreground'),
            gradientEnd: `${getColor('--muted-foreground').replace(')', ' / 0.2)')}`,
          }
      }
    }, [getColor])

    // Measure container dimensions (only after mounted to ensure correct size)
    React.useEffect(() => {
      if (!isMounted) return

      const updateDimensions = () => {
        if (containerRef.current) {
          const { width, height } = containerRef.current.getBoundingClientRect()
          setDimensions({ width: width || 800, height: height || 600 })
        }
      }

      // Small delay to ensure container is fully rendered
      const timer = setTimeout(updateDimensions, 0)
      window.addEventListener('resize', updateDimensions)

      return () => {
        clearTimeout(timer)
        window.removeEventListener('resize', updateDimensions)
      }
    }, [isMounted])

    // Filter by time
    const visibleNodes = React.useMemo(() => {
      return inputNodes.filter(n => !n.timestamp || n.timestamp <= currentTime)
    }, [inputNodes, currentTime])

    const nodeIds = React.useMemo(() => {
      return new Set(visibleNodes.map(n => n.id))
    }, [visibleNodes])

    const visibleEdges = React.useMemo(() => {
      return inputEdges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target))
    }, [inputEdges, nodeIds])

    // Compute Sankey layout
    const sankeyData = React.useMemo(() => {
      const margin = { top: 20, right: 20, bottom: 20, left: 20 }
      const width = dimensions.width - margin.left - margin.right
      const height = dimensions.height - margin.top - margin.bottom

      // Handle empty case
      if (visibleNodes.length === 0 || visibleEdges.length === 0) {
        return {
          nodes: [],
          links: [],
          margin,
        }
      }

      // Create node map for D3
      const nodeMap = new Map<string, D3Node>()
      visibleNodes.forEach((node, index) => {
        nodeMap.set(node.id, { ...node, index } as D3Node)
      })

      // Create links with source/target as node objects
      const links: D3Link[] = visibleEdges.map(edge => ({
        ...edge,
        source: edge.source,
        target: edge.target,
        value: edge.value || 1,
      })) as D3Link[]

      // D3 Sankey generator
      const sankeyGenerator = d3Sankey<FlowNode, FlowEdge>()
        .nodeId((d: any) => d.id)
        .nodeWidth(8)
        .nodePadding(15)
        .nodeAlign(sankeyLeft)
        .extent([[0, 0], [width, height]])

      // Compute layout
      const graph: SankeyGraph<FlowNode, FlowEdge> = sankeyGenerator({
        nodes: Array.from(nodeMap.values()),
        links,
      })

      return {
        nodes: graph.nodes as D3Node[],
        links: graph.links as D3Link[],
        margin,
      }
    }, [visibleNodes, visibleEdges, dimensions])

    // Generate gradient IDs for each status
    const gradients = ['pending', 'confirmed', 'complete', 'failed', 'default']

    // Don't render until mounted to avoid color computation issues
    if (!isMounted) {
      return (
        <div
          ref={ref}
          className={cn("relative w-full h-[600px] overflow-hidden bg-background border rounded-lg flex items-center justify-center", className)}
          role="img"
          aria-label={ariaLabel}
        >
          <div className="text-muted-foreground">Loading...</div>
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn("relative w-full h-[600px] overflow-hidden bg-background border rounded-lg", className)}
        role="img"
        aria-label={ariaLabel}
      >
        <div ref={containerRef} className="w-full h-full">
          <svg
            width={dimensions.width}
            height={dimensions.height}
            className="flow-diagram"
          >
            <defs>
              {/* Gradients for flowing effect */}
              {gradients.map(status => {
                const colors = getStatusColors(status)
                return (
                  <linearGradient
                    key={`gradient-${status}`}
                    id={`flow-gradient-${status}`}
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor={colors.gradientStart} />
                    <stop offset="100%" stopColor={colors.gradientEnd} />
                  </linearGradient>
                )
              })}
            </defs>

            <g transform={`translate(${sankeyData.margin.left},${sankeyData.margin.top})`}>
              {/* Render links (curved paths) */}
              {sankeyData.links.map((link, i) => {
                const pathData = sankeyLinkHorizontal()(link)

                // Link color logic:
                // - Use source status if source has status AND target has status
                // - This ensures chosen paths are colored in decision trees
                // - And flowing data (UTXO, audit trails) is also colored
                const sourceNode = link.source as D3Node
                const targetNode = link.target as D3Node

                const sourceStatus = sourceNode.status
                const targetStatus = targetNode.status

                // If source has status AND target has status, use source status for color
                // If either has no status, use default (gray)
                const status = (sourceStatus && targetStatus) ? sourceStatus : 'default'

                return (
                  <g key={`link-${i}`}>
                    <path
                      d={pathData || undefined}
                      className={cn(
                        "flow-link",
                        getStatusClass(status),
                        (link as any).animated && "flow-link-animated"
                      )}
                      stroke={`url(#flow-gradient-${status})`}
                      strokeWidth={link.width || 2}
                      fill="none"
                      opacity={0.6}
                    />
                    {/* Link label */}
                    {link.label && (
                      <text
                        x={((link.source as D3Node).x1! + (link.target as D3Node).x0!) / 2}
                        y={((link.y0! + link.y1!) / 2)}
                        className="flow-link-label"
                        textAnchor="middle"
                        dy="0.35em"
                        fontSize="11"
                        fill={getColor('--muted-foreground')}
                        opacity={0.7}
                      >
                        {link.label}
                      </text>
                    )}
                  </g>
                )
              })}

              {/* Render nodes */}
              {sankeyData.nodes.map((node, i) => {
                const originalNode = visibleNodes.find(n => n.id === node.id)!
                const nodeColors = getStatusColors(node.status)

                return (
                  <g
                    key={`node-${i}`}
                    onClick={() => onNodeClick?.(originalNode)}
                    onMouseEnter={(e) => {
                      setHoveredNode(originalNode)
                      const rect = containerRef.current?.getBoundingClientRect()
                      if (rect) {
                        setTooltipPos({
                          x: e.clientX - rect.left,
                          y: e.clientY - rect.top
                        })
                      }
                    }}
                    onMouseMove={(e) => {
                      const rect = containerRef.current?.getBoundingClientRect()
                      if (rect) {
                        setTooltipPos({
                          x: e.clientX - rect.left,
                          y: e.clientY - rect.top
                        })
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredNode(null)
                      setTooltipPos(null)
                    }}
                    className={cn(
                      "flow-node-group",
                      onNodeClick && "cursor-pointer"
                    )}
                  >
                    {/* Node rectangle */}
                    <rect
                      x={node.x0}
                      y={node.y0}
                      width={node.x1! - node.x0!}
                      height={node.y1! - node.y0!}
                      className="flow-node"
                      fill={nodeColors.fill}
                      stroke={nodeColors.stroke}
                      strokeWidth={2}
                      rx={4}
                    />

                    {/* Node label */}
                    <text
                      x={node.x0! < dimensions.width / 2 ? node.x1! + 6 : node.x0! - 6}
                      y={(node.y0! + node.y1!) / 2}
                      className="flow-node-label"
                      textAnchor={node.x0! < dimensions.width / 2 ? "start" : "end"}
                      dy="0.35em"
                      fontSize="13"
                      fontWeight="500"
                      fill={getColor('--foreground')}
                    >
                      {node.label}
                    </text>

                    {/* Value badge */}
                    {node.value !== undefined && (
                      <text
                        x={node.x0! < dimensions.width / 2 ? node.x1! + 6 : node.x0! - 6}
                        y={(node.y0! + node.y1!) / 2 + 16}
                        className="flow-node-value"
                        textAnchor={node.x0! < dimensions.width / 2 ? "start" : "end"}
                        fontSize="11"
                        fill={getColor('--foreground')}
                        opacity={0.7}
                      >
                        {node.value}
                      </text>
                    )}
                  </g>
                )
              })}
            </g>

            {/* Stats panel */}
            <g transform={`translate(${dimensions.width - 100}, 10)`}>
              <rect
                width="90"
                height="50"
                className="flow-stats-panel"
                rx={6}
                fill={`${getColor('--background').replace(')', ' / 0.8)')}`}
                stroke={getColor('--border')}
              />
              <text
                x="45"
                y="20"
                textAnchor="middle"
                fontSize="11"
                fill={getColor('--muted-foreground')}
              >
                {visibleNodes.length} nodes
              </text>
              <text
                x="45"
                y="36"
                textAnchor="middle"
                fontSize="11"
                fill={getColor('--muted-foreground')}
              >
                {visibleEdges.length} edges
              </text>
            </g>
          </svg>
        </div>

        {/* Hover tooltip */}
        {hoveredNode && tooltipPos && (
          <div
            className="absolute z-50 pointer-events-none"
            style={{
              left: tooltipPos.x + 10,
              top: tooltipPos.y + 10,
            }}
          >
            <div className="bg-popover text-popover-foreground border rounded-md shadow-lg p-3 max-w-xs">
              <div className="font-semibold mb-1">{hoveredNode.label}</div>
              {hoveredNode.value !== undefined && (
                <div className="text-sm text-muted-foreground">
                  Value: {hoveredNode.value}
                </div>
              )}
              {hoveredNode.status && (
                <div className="text-sm text-muted-foreground">
                  Status: {hoveredNode.status}
                </div>
              )}
              {hoveredNode.metadata && Object.keys(hoveredNode.metadata).length > 0 && (
                <div className="mt-2 text-sm border-t pt-2">
                  {Object.entries(hoveredNode.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between gap-2">
                      <span className="text-muted-foreground">{key}:</span>
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Embedded styles for SVG animations */}
        <style dangerouslySetInnerHTML={{
          __html: `
            .flow-link {
              transition: opacity 0.2s, stroke-width 0.2s;
            }

            .flow-link:hover {
              opacity: 0.8 !important;
            }

            .flow-link-animated {
              stroke-dasharray: 5, 5;
              animation: flow-dash 1s linear infinite;
            }

            @keyframes flow-dash {
              to {
                stroke-dashoffset: -10;
              }
            }

            .flow-node {
              transition: all 0.2s;
            }

            .flow-node-group:hover .flow-node {
              filter: brightness(1.1);
            }

            .flow-node-group {
              cursor: pointer;
            }
          `
        }} />
      </div>
    )
  }
)

FlowDiagram.displayName = "FlowDiagram"
