# TotheNineCloud (T9C) ☁️

**The meme coin that reaches for the clouds!**

TotheNineCloud is a community-driven meme coin built on Ethereum featuring reflection rewards, anti-whale protection, and a beautiful cloud-themed user interface. Join us on our journey to cloud nine!

## 🌟 Features

### Smart Contract Features
- **ERC-20 Compatible**: Standard token functionality with additional features
- **Reflection Rewards**: 2% of every transaction redistributed to holders
- **Anti-Whale Protection**: Maximum transaction and wallet limits
- **Deflationary Mechanism**: Burnable tokens to reduce supply
- **Pausable**: Emergency pause functionality for security
- **Owner Controls**: Configurable fees and limits

### Web Interface Features
- **Modern UI/UX**: Cloud-themed design with smooth animations
- **Web3 Integration**: MetaMask wallet connection
- **Real-time Balance**: Live token and ETH balance display
- **Responsive Design**: Mobile-friendly interface
- **Interactive Charts**: Tokenomics visualization
- **Community Links**: Direct access to social platforms

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MetaMask browser extension
- Git

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd tothe-nine-cloud
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
PRIVATE_KEY=your_private_key_here
SEPOLIA_URL=https://sepolia.infura.io/v3/your_infura_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Development

1. **Start local blockchain**
```bash
npm run node
```

2. **Compile contracts**
```bash
npm run compile
```

3. **Deploy to local network**
```bash
npm run deploy
```

4. **Start web server**
```bash
npm run dev
```

Visit `http://localhost:3000` to view the website.

## 📊 Tokenomics

- **Total Supply**: 1,000,000,000 T9C
- **Reflection Fee**: 2% redistributed to holders
- **Max Transaction**: 1% of total supply (10M T9C)
- **Max Wallet**: 2% of total supply (20M T9C)

### Distribution
- 40% - Liquidity Pool
- 30% - Community
- 15% - Marketing
- 10% - Development
- 5% - Team

## 🛠️ Smart Contract

The TotheNineCloud smart contract includes:

### Core Functions
- `transfer()` - Transfer tokens with reflection mechanism
- `burn()` - Burn tokens to reduce supply
- `balanceOf()` - Get token balance including reflections
- `totalFees()` - View total fees collected

### Owner Functions
- `pause()/unpause()` - Emergency controls
- `updateMaxTransactionAmount()` - Adjust transaction limits
- `excludeFromFee()` - Manage fee exclusions
- `setReflectionFeePercent()` - Update reflection fee

### Events
- `CloudReached` - Emitted when holder reaches significant balance
- `AntiWhaleTriggered` - Emitted when large transaction is attempted

## 🌐 Deployment

### Testnet Deployment (Sepolia)

1. **Configure network settings**
Make sure your `.env` file has the correct Sepolia RPC URL and private key.

2. **Deploy to Sepolia**
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

3. **Verify contract**
```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

### Mainnet Deployment

⚠️ **WARNING**: Mainnet deployment involves real funds. Double-check everything!

1. **Update hardhat.config.js** with mainnet configuration
2. **Deploy to mainnet**
```bash
npx hardhat run scripts/deploy.js --network mainnet
```

## 🎨 Frontend Integration

### Connecting the Contract

After deployment, update the contract address in `script.js`:

```javascript
// In your app initialization
const contractAddress = "0x..."; // Your deployed contract address
await window.t9cApp.initContract(contractAddress);
```

### Web3 Features

The frontend includes:
- Wallet connection (MetaMask)
- Balance display (ETH and T9C)
- Transaction preparation
- Real-time updates
- Error handling

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Test specific functionality:
```bash
npx hardhat test test/TotheNineCloud.test.js
```

## 📁 Project Structure

```
tothe-nine-cloud/
├── contracts/
│   └── TotheNineCloud.sol      # Main token contract
├── scripts/
│   └── deploy.js               # Deployment script
├── test/
│   └── TotheNineCloud.test.js  # Contract tests
├── public/
│   ├── index.html              # Main website
│   ├── styles.css              # Styling
│   └── script.js               # Web3 integration
├── hardhat.config.js           # Hardhat configuration
├── package.json                # Dependencies
└── README.md                   # This file
```

## 🔒 Security Features

- **Reentrancy Protection**: SafeMath and OpenZeppelin patterns
- **Access Control**: Owner-only functions with proper modifiers
- **Pausable**: Emergency stop functionality
- **Anti-Whale**: Transaction and wallet size limits
- **Reflection Safety**: Proper reflection calculations

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Community & Support

- **Website**: [Coming Soon]
- **Twitter**: [@TotheNineCloud]
- **Telegram**: [t.me/TotheNineCloud]
- **Discord**: [discord.gg/TotheNineCloud]

## ⚖️ Legal Disclaimer

TotheNineCloud (T9C) is a meme token created for entertainment purposes. This is not financial advice. Cryptocurrency investments carry risk, and you should do your own research before investing. The team is not responsible for any financial losses.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Roadmap

### Phase 1: Launch ✅
- Smart contract development
- Website creation
- Initial community building

### Phase 2: Growth 🔄
- DEX listings
- Marketing campaigns
- Community expansion

### Phase 3: Utility 📅
- NFT collection
- Staking rewards
- DeFi integrations

### Phase 4: Cloud Nine 🚀
- Major exchange listings
- Partnerships
- Ecosystem expansion

---

**Reach for the clouds with TotheNineCloud! ☁️**

*Built with 💙 by the TotheNineCloud community*