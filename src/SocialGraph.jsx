import { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import ForceGraph2D from 'react-force-graph-2d';

function SocialGraph({ onNodeClick, persistedGraphData, onGraphDataChange, persistedInput, onInputChange }) {
  const [ensInput, setEnsInput] = useState(persistedInput || '');
  const [graphData, setGraphData] = useState(persistedGraphData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addEdgeMode, setAddEdgeMode] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const forceRef = useRef();

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

  // Load persisted data and edges from backend
  useEffect(() => {
    if (persistedGraphData.nodes.length > 0) {
      setGraphData(persistedGraphData);
      loadEdgesFromBackend();
    }
    if (persistedInput) {
      setEnsInput(persistedInput);
    }
  }, [persistedGraphData, persistedInput]);

  // Add repulsion force between nodes
  useEffect(() => {
    if (forceRef.current) {
      forceRef.current.d3Force('charge').strength(-300);
      forceRef.current.d3Force('link').distance(150);
    }
  }, [graphData]);

  const loadEdgesFromBackend = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/edges/`);
      const edges = await response.json();
      
      // Convert backend format to graph format
      const links = edges.map(edge => ({
        source: edge.from_ens,
        target: edge.to_ens,
        id: edge.id
      }));
      
      setGraphData(prev => ({ ...prev, links }));
    } catch (err) {
      console.error('Failed to load edges:', err);
    }
  };

  const handleInputChange = (newValue) => {
    setEnsInput(newValue);
    if (onInputChange) {
      onInputChange(newValue);
    }
  };

  const fetchENSProfiles = async (namesToFetch) => {
    const ensNames = namesToFetch || ensInput
      .split(',')
      .map(name => name.trim())
      .filter(name => name.length > 0);

    if (ensNames.length === 0) {
      setError('Please enter at least one ENS name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
      const nodes = [];

      for (const ensName of ensNames) {
        try {
          const address = await provider.resolveName(ensName);
          
          if (address) {
            const resolver = await provider.getResolver(ensName);
            const avatar = await resolver?.getAvatar();
            
            nodes.push({
              id: ensName,
              name: ensName,
              address: address,
              avatar: avatar?.url || null,
              val: 20
            });
          }
        } catch (err) {
          console.error(`Failed to fetch ${ensName}:`, err);
        }
      }

      if (nodes.length === 0) {
        setError('No valid ENS names found');
        setLoading(false);
        return;
      }

      const newGraphData = { nodes, links: [] };
      setGraphData(newGraphData);
      
      if (onGraphDataChange) {
        onGraphDataChange(newGraphData);
      }
      
      // Load edges after nodes are loaded
      await loadEdgesFromBackend();
    } catch (err) {
      console.error(err);
      setError('Failed to fetch ENS data');
    } finally {
      setLoading(false);
    }
  };

  const loadExample = () => {
    const exampleNames = ['vitalik.eth', 'balajis.eth', 'nick.eth'];
    const inputText = exampleNames.join(', ');
    handleInputChange(inputText);
    fetchENSProfiles(exampleNames);
  };

  const handleNodeClickInternal = async (node) => {
    if (addEdgeMode) {
      // Edge creation mode
      if (!selectedNode) {
        setSelectedNode(node.id);
      } else if (selectedNode === node.id) {
        // Clicked same node, cancel
        setSelectedNode(null);
      } else {
        // Create edge
        await createEdge(selectedNode, node.id);
        setSelectedNode(null);
        setAddEdgeMode(false);
      }
    } else {
      // Normal mode - route to profile
      if (onNodeClick) {
        onNodeClick(node.id);
      }
    }
  };

  const createEdge = async (fromEns, toEns) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/edges/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from_ens: fromEns, to_ens: toEns })
      });

      if (response.ok) {
        await loadEdgesFromBackend();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create connection');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      console.error('Failed to create edge:', err);
      setError('Failed to create connection');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleLinkClick = async (link) => {
    if (window.confirm(`Delete connection between ${link.source.id} and ${link.target.id}?`)) {
      try {
        await fetch(`${BACKEND_URL}/api/edges/${link.id}/`, {
          method: 'DELETE'
        });
        await loadEdgesFromBackend();
      } catch (err) {
        console.error('Failed to delete edge:', err);
        setError('Failed to delete connection');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  return (
    <div style={{ 
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ 
        textAlign: 'center',
        color: '#1a1a1a',
        marginBottom: '30px',
        fontSize: '32px'
      }}>
        ENS Social Network Graph
      </h1>
      
      <div style={{ maxWidth: '900px', margin: '0 auto 30px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input
            type="text"
            value={ensInput}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Enter ENS names separated by commas (e.g., vitalik.eth, balajis.eth, nick.eth)"
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '16px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              outline: 'none'
            }}
            onKeyPress={(e) => e.key === 'Enter' && fetchENSProfiles()}
          />
          <button
            onClick={() => fetchENSProfiles()}
            disabled={loading}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#0066ff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              fontWeight: '600',
              whiteSpace: 'nowrap'
            }}
          >
            {loading ? 'Loading...' : 'Generate Graph'}
          </button>
          <button
            onClick={loadExample}
            disabled={loading}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              fontWeight: '600',
              whiteSpace: 'nowrap'
            }}
          >
            Load Example
          </button>
          <button
            onClick={() => {
              setAddEdgeMode(!addEdgeMode);
              setSelectedNode(null);
            }}
            disabled={loading || graphData.nodes.length === 0}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: addEdgeMode ? '#dc3545' : '#ff9800',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: (loading || graphData.nodes.length === 0) ? 'not-allowed' : 'pointer',
              opacity: (loading || graphData.nodes.length === 0) ? 0.6 : 1,
              fontWeight: '600',
              whiteSpace: 'nowrap'
            }}
          >
            {addEdgeMode ? 'Cancel' : 'Add Connection'}
          </button>
        </div>

        <p style={{ 
          textAlign: 'center', 
          color: '#666', 
          fontSize: '14px',
          margin: '10px 0 0 0'
        }}>
          {addEdgeMode 
            ? (selectedNode 
                ? `📍 Click another node to connect with ${selectedNode}` 
                : '📍 Click a node to start creating a connection')
            : '💡 Click any node to view their profile • Click "Add Connection" to create edges'
          }
        </p>

        {error && (
          <div style={{
            padding: '15px',
            backgroundColor: '#fee',
            color: '#c00',
            borderRadius: '8px',
            marginTop: '15px',
            border: '1px solid #fcc'
          }}>
            {error}
            <button 
              onClick={() => setError('')}
              style={{ 
                marginLeft: '10px', 
                background: 'none', 
                border: 'none', 
                color: '#c00', 
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {graphData.nodes.length > 0 && (
        <div style={{
          border: '2px solid #e0e0e0',
          borderRadius: '12px',
          height: '600px',
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <ForceGraph2D
            ref={forceRef}
            graphData={graphData}
            nodeLabel="name"
            nodeAutoColorBy="id"
            nodeCanvasObject={(node, ctx, globalScale) => {
              const label = node.name;
              const fontSize = 14/globalScale;
              const isSelected = node.id === selectedNode;
              
              ctx.font = `bold ${fontSize}px Sans-Serif`;
              
              // Draw circle with better border
              ctx.beginPath();
              ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI, false);
              ctx.fillStyle = node.color;
              ctx.fill();
              
              // Highlight selected node
              if (isSelected) {
                ctx.strokeStyle = '#ff9800';
                ctx.lineWidth = 6;
              } else {
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 3;
              }
              ctx.stroke();
              
              // Draw label with background
              ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
              const textWidth = ctx.measureText(label).width;
              ctx.fillRect(
                node.x - textWidth/2 - 4,
                node.y + node.val + 8,
                textWidth + 8,
                fontSize + 6
              );
              
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = '#333';
              ctx.fillText(label, node.x, node.y + node.val + 18);
            }}
            onNodeClick={handleNodeClickInternal}
            onLinkClick={handleLinkClick}
            nodePointerAreaPaint={(node, color, ctx) => {
              ctx.fillStyle = color;
              ctx.beginPath();
              ctx.arc(node.x, node.y, node.val * 1.5, 0, 2 * Math.PI, false);
              ctx.fill();
            }}
            // Better link styling
            linkWidth={4}
            linkColor={() => '#4CAF50'}
            linkDirectionalParticles={4}
            linkDirectionalParticleWidth={4}
            linkDirectionalParticleSpeed={0.006}
            linkDirectionalParticleColor={() => '#2196F3'}
            // Better physics for spacing
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.3}
            cooldownTicks={100}
            // Better initial positioning
            enableNodeDrag={!addEdgeMode}
            enableZoomInteraction={true}
            enablePanInteraction={true}
            nodeRelSize={8}
          />
        </div>
      )}

      {graphData.nodes.length === 0 && !loading && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#999',
          fontSize: '18px'
        }}>
          Enter ENS names above to visualize the social network, or click "Load Example"
        </div>
      )}
    </div>
  );
}

export default SocialGraph;