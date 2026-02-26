import { useState } from 'react';
import { ethers } from 'ethers';
import ForceGraph2D from 'react-force-graph-2d';

function SocialGraph({ onNodeClick }) {
  const [ensInput, setEnsInput] = useState('');
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchENSProfiles = async (namesToFetch) => {
    // Use provided names or parse from input
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

      // Fetch each ENS profile
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
              val: 15 // Node size
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

      // No links yet - Step 3 will add editable edges
      setGraphData({ nodes, links: [] });
    } catch (err) {
      console.error(err);
      setError('Failed to fetch ENS data');
    } finally {
      setLoading(false);
    }
  };

  const loadExample = () => {
    const exampleNames = ['vitalik.eth', 'balajis.eth', 'nick.eth'];
    setEnsInput(exampleNames.join(', '));
    fetchENSProfiles(exampleNames);
  };

  const handleNodeClick = (node) => {
    // Call parent's onNodeClick to route to profile
    if (onNodeClick) {
      onNodeClick(node.id);
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
            onChange={(e) => setEnsInput(e.target.value)}
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
        </div>

        <p style={{ 
          textAlign: 'center', 
          color: '#666', 
          fontSize: '14px',
          margin: '10px 0 0 0'
        }}>
          💡 Click any node to view their profile
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
            graphData={graphData}
            nodeLabel="name"
            nodeAutoColorBy="id"
            nodeCanvasObject={(node, ctx, globalScale) => {
              const label = node.name;
              const fontSize = 12/globalScale;
              ctx.font = `${fontSize}px Sans-Serif`;
              
              // Draw circle
              ctx.beginPath();
              ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI, false);
              ctx.fillStyle = node.color;
              ctx.fill();
              ctx.strokeStyle = '#fff';
              ctx.lineWidth = 2;
              ctx.stroke();
              
              // Draw label
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = '#333';
              ctx.fillText(label, node.x, node.y + node.val + 10);
            }}
            onNodeClick={handleNodeClick}
            nodePointerAreaPaint={(node, color, ctx) => {
              ctx.fillStyle = color;
              ctx.beginPath();
              ctx.arc(node.x, node.y, node.val * 1.5, 0, 2 * Math.PI, false);
              ctx.fill();
            }}
            enableNodeDrag={true}
            enableZoomInteraction={true}
            enablePanInteraction={true}
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