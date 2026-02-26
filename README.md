# ENS Social Network

A full-stack decentralized social network visualizer built on Ethereum Name Service (ENS).

<img width="1495" height="819" alt="image" src="https://github.com/user-attachments/assets/b6570ac9-95af-4fd7-b712-80a2ac0c8ea3" />

<img width="1506" height="843" alt="image" src="https://github.com/user-attachments/assets/d0f4c739-d6a9-4628-8505-d30d78103c51" />



## 🌟 Features

- **ENS Profile Viewer**: Look up any ENS name and view their profile information including address, avatar, social links
- **Social Network Graph**: Visualize multiple ENS identities as an interactive force-directed graph
- **Editable Connections**: Create and delete friendship connections between ENS identities
- **Persistent Storage**: All connections are stored in a PostgreSQL database

## 🚀 Live Demo

**Frontend:** https://ns-ens-kohl.vercel.app  
**Backend API:** https://ns-ens-backend.vercel.app/api/edges/

## 🛠️ Tech Stack

- React + Vite
- ethers.js (Ethereum/ENS integration)
- react-force-graph-2d (Graph visualization)
- Django REST API backend
- PostgreSQL (Neon)

## 📦 Installation
```bash
# Clone repository
git clone https://github.com/omsant02/NS_ENS.git
cd NS_ENS

# Install dependencies
npm install

# Create .env file
echo "VITE_RPC_URL=your_ethereum_rpc_url" > .env
echo "VITE_BACKEND_URL=http://127.0.0.1:8000" >> .env

# Run development server
npm run dev
```

## 🎯 Usage

1. **View a Profile**: Enter any ENS name (e.g., `vitalik.eth`) and click "Lookup"
2. **Visualize Network**: Enter multiple ENS names separated by commas, or click "Load Example"
3. **Add Connection**: Click "Add Connection" → Click two nodes to create an edge
4. **Delete Connection**: Click any edge and confirm deletion

## 📝 Environment Variables
```
VITE_RPC_URL=your_ethereum_rpc_url
VITE_BACKEND_URL=your_backend_url
```

## 🏗️ Project Structure
```
src/
├── App.jsx              # Main app component with routing
├── ENSProfile.jsx       # Profile viewer component
├── SocialGraph.jsx      # Graph visualization component
└── main.jsx            # App entry point
```

## 🚢 Deployment

Deployed on Vercel. Environment variables are configured in Vercel dashboard.
```bash
# Deploy
git push origin main
# Vercel auto-deploys on push
```

## 🔗 Related

- Backend Repository: https://github.com/omsant02/NS_ENS_BACKEND
- ENS Documentation: https://docs.ens.domains

## 👤 Author

**Om Santoshwar**  
GitHub: [@omsant02](https://github.com/omsant02)

## 📄 License

MIT
