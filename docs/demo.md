# Raksha Demo Guide & Script

## 1. Quick Start

To launch all 8 services in a clean, seeded state:

```bash
# 1. Reset database and seed canonical persona (Ramesh Kumar, ₹5,000 SBI UPI)
pnpm demo:reset

# 2. Start full protocol stack
pnpm demo
```

The stack runs on:
- **Web UI & Dev Drawer**: [http://localhost:3000](http://localhost:3000)
- **Raksha Core API**: [http://localhost:3001](http://localhost:3001)
- **Civic Action Protocol (CAP)**: [http://localhost:3002](http://localhost:3002)
- **Portal A (1930 Intake)**: [http://localhost:3003](http://localhost:3003)
- **Portal B (Bank Console)**: [http://localhost:3004](http://localhost:3004)
- **WhatsApp Webhook Adapter**: [http://localhost:3005](http://localhost:3005)
- **Voice Telephony Simulator**: [http://localhost:3006](http://localhost:3006)
- **Model Context Protocol (MCP)**: [http://localhost:3007](http://localhost:3007)
- **System Health Overview**: [http://localhost:3001/system/health](http://localhost:3001/system/health)

---

## 2. Judging Demo Script (2 Minutes)

### Minute 1: The Citizen Journey
1. **Intake (Hindi Voice / Web / WhatsApp)**:
   - Select Hindi or speak: *"बिजली विभाग के नाम से कॉल आया और मैंने स्टेट बैंक ऑफ़ इंडिया खाते से पाँच हज़ार भेज दिए। "*
2. **Missing Field Prompt**:
   - Raksha asks single calm question: *"कृपया 12-अंकों का UTR या संदर्भ संख्या प्रदान करें।"*
3. **Evidence Upload**:
   - Provide UTR `423456789012` or upload screenshot -> transitions instantly to **`READY`**.
4. **Emergency Dispatch**:
   - Review verified details -> Click Dispatch -> Generates official tracking reference `1930-SYN-XXXXXX`.

### Minute 2: The Quad-Channel & CAP Architecture
1. **Show Developer Drawer**:
   - Toggle Developer Mode (⚡) -> switch between `Web`, `WhatsApp`, `Phone`, and `MCP Agent` tabs showing 100% state synchronization.
2. **Show Portal A & Portal B**:
   - Point out Portal A received intake packet -> Portal B Bank Console acknowledged simulated lien (`LIEN_MARKED`).
3. **Show MCP Tool Safety**:
   - Explain how autonomous AI agents discover public-service actions via CAP and execute safe, confirmed actions without brittle web-scraping.
