import { useEffect, useRef, useMemo } from 'react';
import ForceGraph3D from '3d-force-graph';

interface GraphNode {
  id: string;
  name: string;
  group: number;
  val: number;
}

interface GraphLink {
  source: string;
  target: string;
  value: number;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export default function KnowledgeGraphComponent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);

  const graphData = useMemo<GraphData>(() => {
    const dataStructureTerms = [
      '图', '链表', '树', '栈', '队列', '堆',
      '数组', '哈希表', '二叉树', 'AVL树', '红黑树', 'B树',
      '图遍历', 'DFS', 'BFS', '拓扑排序', '最短路径', '最小生成树',
      '排序', '查找', '递归', '动态规划', '贪心', '分治',
      '哈希函数', '碰撞处理', '索引', '缓存', '压缩', '加密'
    ];

    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];

    dataStructureTerms.forEach((term, index) => {
      nodes.push({
        id: `${index + 1}`,
        name: term,
        group: Math.ceil((index + 1) / 6),
        val: 8 + Math.random() * 12,
      });
    });

    const connections = [
      [1, 2], [1, 3], [1, 13], [1, 17],
      [2, 3], [2, 7], [2, 8],
      [3, 4], [3, 5], [3, 6], [3, 9], [3, 10], [3, 11],
      [4, 5], [4, 21],
      [5, 6],
      [7, 8], [7, 22],
      [8, 23],
      [9, 10], [9, 11], [9, 12],
      [13, 14], [13, 15], [13, 16],
      [14, 15], [14, 24],
      [15, 16],
      [17, 18], [17, 19], [17, 20],
      [18, 19],
      [19, 20],
      [21, 22], [21, 23],
      [22, 23],
      [24, 25], [24, 26], [24, 27],
      [25, 26],
      [26, 27],
      [28, 29], [28, 30],
      [29, 30],
      [1, 7], [3, 13], [6, 17], [8, 24], [12, 28]
    ];

    connections.forEach(([source, target]) => {
      links.push({
        source: `${source}`,
        target: `${target}`,
        value: Math.random() * 2 + 1,
      });
    });

    return { nodes, links };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const fg = new ForceGraph3D(containerRef.current);
    fg.graphData(graphData)
      .nodeId('id')
      .nodeLabel('name')
      .nodeAutoColorBy('group')
      .nodeRelSize(3)
      .linkOpacity(0.5)
      .linkWidth(2)
      .enableNavigationControls(true);

    graphRef.current = fg;

    return () => {
      if (graphRef.current) {
        try {
          graphRef.current = null;
        } catch (e) {
          console.log('Cleanup error:', e);
        }
      }
    };
  }, [graphData]);

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">🧠 知识图谱</h1>
          <p className="text-gray-600">交互式 3D 力导向图展示</p>
        </div>
        
        <div 
          ref={containerRef}
          className="w-full h-[700px] rounded-2xl border border-gray-200 overflow-hidden shadow-xl"
        />
        
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-500">30</div>
            <div className="text-sm text-gray-600">节点总数</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-500">~60</div>
            <div className="text-sm text-gray-600">连接关系</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-purple-500">5</div>
            <div className="text-sm text-gray-600">分组数量</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-orange-500">交互式</div>
            <div className="text-sm text-gray-600">拖拽/缩放</div>
          </div>
        </div>

        <div className="mt-6 bg-gray-50 rounded-xl p-6">
          <h3 className="font-medium mb-4">操作说明</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>🖱️ <strong>左键拖拽</strong>：旋转视角</li>
            <li>🔍 <strong>滚轮</strong>：缩放视图</li>
            <li>🖱️ <strong>右键拖拽</strong>：平移视图</li>
            <li>👆 <strong>点击节点</strong>：查看节点名称</li>
            <li>✋ <strong>拖拽节点</strong>：移动节点位置</li>
          </ul>
        </div>
      </div>
    </div>
  );
}