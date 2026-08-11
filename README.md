# WebSocket Server — Render Deployment

## Deploy Steps

### 1. GitHub pe push karo
```bash
git init
git add .
git commit -m "Initial websocket server"
git remote add origin https://github.com/YOUR_USERNAME/ws-server.git
git push -u origin main
```

### 2. Render pe deploy karo
1. https://render.com pe jao — free account banao
2. **New → Web Service**
3. GitHub repo connect karo
4. Settings:
   - **Name:** ws-server
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
   - **Instance Type:** Free
5. **Deploy** press karo

### 3. URL mil jayegi
```
https://ws-server-xxxx.onrender.com
wss://ws-server-xxxx.onrender.com
```

---

## UptimeRobot (Free — Server alive rakhega)

Render free tier 15 min baad sleep karta hai.
UptimeRobot se ping karo — server hamesha alive rahega.

1. https://uptimerobot.com — free account
2. **Add New Monitor**
3. Type: **HTTP(s)**
4. URL: `https://ws-server-xxxx.onrender.com/ping`
5. Interval: **5 minutes**
6. Save

---

## Next.js mein use karna

```js
import { io } from 'socket.io-client';

const socket = io('wss://ws-server-xxxx.onrender.com', {
  transports: ['websocket'],
  reconnection: true,
  reconnectionDelay: 3000,
});

socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

socket.on('server-ping', (data) => {
  // Server keep-alive ping — kuch karna nahi
});
```

---

## Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `connected` | Server → Client | On connect |
| `ping` | Client → Server | Keep-alive |
| `pong` | Server → Client | Ping response |
| `message` | Client → Server | Broadcast message |
| `join-room` | Client → Server | Join a room |
| `room-message` | Client → Server | Send to room |
| `server-ping` | Server → All | Every 25s keep-alive |
