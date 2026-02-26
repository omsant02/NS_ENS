import { useState } from 'react';
import ENSProfile from './ENSProfile';
import SocialGraph from './SocialGraph';

function App() {
  const [currentView, setCurrentView] = useState('graph');
  const [selectedENS, setSelectedENS] = useState('');

  const handleNodeClick = (ensName) => {
    setSelectedENS(ensName);
    setCurrentView('profile');
  };

  const goToGraph = () => {
    setCurrentView('graph');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5',
      width: '100%',
      margin: 0,
      padding: 0
    }}>
      {/* Navigation */}
      <nav style={{
        backgroundColor: '#1a1a1a',
        padding: '15px 30px',
        display: 'flex',
        gap: '20px',
        alignItems: 'center',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <h2 style={{ 
          color: 'white', 
          margin: 0,
          fontSize: '20px',
          flex: 1
        }}>
          ENS Social Network
        </h2>
        <button
          onClick={goToGraph}
          style={{
            padding: '8px 20px',
            backgroundColor: currentView === 'graph' ? '#0066ff' : 'transparent',
            color: 'white',
            border: currentView === 'graph' ? 'none' : '1px solid #666',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Network Graph
        </button>
        <button
          onClick={() => setCurrentView('profile')}
          style={{
            padding: '8px 20px',
            backgroundColor: currentView === 'profile' ? '#0066ff' : 'transparent',
            color: 'white',
            border: currentView === 'profile' ? 'none' : '1px solid #666',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Profile Lookup
        </button>
      </nav>

      {/* Main Content */}
      <div style={{ width: '100%', height: '100%' }}>
        {currentView === 'graph' ? (
          <SocialGraph onNodeClick={handleNodeClick} />
        ) : (
          <ENSProfile defaultENS={selectedENS} />
        )}
      </div>
    </div>
  );
}

export default App;