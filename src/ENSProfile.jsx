import { useState } from 'react';
import { ethers } from 'ethers';

function ENSProfile() {
  const [ensName, setEnsName] = useState('');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lookupENS = async () => {
    if (!ensName.trim()) {
      setError('Please enter an ENS name');
      return;
    }

    setLoading(true);
    setError('');
    setProfile(null);

    try {
      const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
      
      const address = await provider.resolveName(ensName);
      
      if (!address) {
        setError('ENS name not found');
        setLoading(false);
        return;
      }

      const resolver = await provider.getResolver(ensName);
      
      const avatar = await resolver?.getAvatar();
      const email = await resolver?.getText('email');
      const url = await resolver?.getText('url');
      const twitter = await resolver?.getText('com.twitter');
      const github = await resolver?.getText('com.github');
      const description = await resolver?.getText('description');

      setProfile({
        ensName,
        address,
        avatar: avatar?.url || null,
        email: email || 'Not set',
        url: url || 'Not set',
        twitter: twitter || 'Not set',
        github: github || 'Not set',
        description: description || 'No description available'
      });
    } catch (err) {
      console.error(err);
      setError('Failed to fetch ENS data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '50px auto', 
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ 
        textAlign: 'center', 
        marginBottom: '30px',
        color: '#1a1a1a',
        fontSize: '32px'
      }}>
        ENS Profile Viewer
      </h1>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          value={ensName}
          onChange={(e) => setEnsName(e.target.value)}
          placeholder="Enter ENS name (e.g., vitalik.eth)"
          style={{
            flex: 1,
            padding: '12px',
            fontSize: '16px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            outline: 'none'
          }}
          onKeyPress={(e) => e.key === 'Enter' && lookupENS()}
        />
        <button
          onClick={lookupENS}
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
            fontWeight: '600'
          }}
        >
          {loading ? 'Loading...' : 'Lookup'}
        </button>
      </div>

      {error && (
        <div style={{
          padding: '15px',
          backgroundColor: '#fee',
          color: '#c00',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #fcc'
        }}>
          {error}
        </div>
      )}

      {profile && (
        <div style={{
          border: '2px solid #e0e0e0',
          borderRadius: '12px',
          padding: '30px',
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          {profile.avatar && (
            <img
              src={profile.avatar}
              alt="Avatar"
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                display: 'block',
                margin: '0 auto 20px',
                border: '3px solid #0066ff'
              }}
            />
          )}
          
          <h2 style={{ 
            textAlign: 'center', 
            color: '#0066ff', 
            marginBottom: '25px',
            fontSize: '28px'
          }}>
            {profile.ensName}
          </h2>
          
          <div style={{ 
            fontSize: '15px', 
            lineHeight: '2',
            color: '#333'
          }}>
            <div style={{ marginBottom: '12px' }}>
              <strong style={{ color: '#666' }}>Address:</strong>{' '}
              <code style={{ 
                backgroundColor: '#f5f5f5', 
                padding: '4px 8px', 
                borderRadius: '4px',
                fontSize: '13px',
                color: '#333'
              }}>
                {profile.address}
              </code>
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <strong style={{ color: '#666' }}>Description:</strong>{' '}
              <span style={{ color: '#333' }}>{profile.description}</span>
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <strong style={{ color: '#666' }}>Email:</strong>{' '}
              <span style={{ color: '#333' }}>{profile.email}</span>
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <strong style={{ color: '#666' }}>Website:</strong>{' '}
              {profile.url !== 'Not set' ? (
                <a 
                  href={profile.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#0066ff', textDecoration: 'none' }}
                >
                  {profile.url}
                </a>
              ) : (
                <span style={{ color: '#999' }}>Not set</span>
              )}
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <strong style={{ color: '#666' }}>Twitter:</strong>{' '}
              {profile.twitter !== 'Not set' ? (
                <a 
                  href={`https://twitter.com/${profile.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#0066ff', textDecoration: 'none' }}
                >
                  @{profile.twitter}
                </a>
              ) : (
                <span style={{ color: '#999' }}>Not set</span>
              )}
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <strong style={{ color: '#666' }}>GitHub:</strong>{' '}
              {profile.github !== 'Not set' ? (
                <a 
                  href={`https://github.com/${profile.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#0066ff', textDecoration: 'none' }}
                >
                  @{profile.github}
                </a>
              ) : (
                <span style={{ color: '#999' }}>Not set</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ENSProfile;