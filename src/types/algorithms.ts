export type SortingAlgorithm = 'bubble' | 'quick' | 'merge' | 'heap';
export type PathfindingAlgorithm = 'dijkstra' | 'astar' | 'dfs' | 'bfs';
export type DataStructure = 'array' | 'linkedList' | 'bst' | 'graph';

export interface ArrayElement {
  value: number;
  isComparing: boolean;
  isSorted: boolean;
}

export interface Node {
  id: string;
  value: number;
  x: number;
  y: number;
  connections: string[];
}