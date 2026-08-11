import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // Production mein Vercel URL lagana
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger('EventsGateway');
  private connectedClients = new Map<string, Socket>();

  // ─── Server-side keep-alive ping every 25s ───────────────────────
  afterInit(server: Server) {
    this.logger.log('✅ WebSocket Gateway initialized');

    setInterval(() => {
      const count = this.connectedClients.size;
      if (count > 0) {
        this.server.emit('server-ping', { time: new Date().toISOString() });
        this.logger.debug(`Keep-alive ping sent to ${count} client(s)`);
      }
    }, 25000);
  }

  // ─── Client connected ─────────────────────────────────────────────
  handleConnection(client: Socket) {
    this.connectedClients.set(client.id, client);
    this.logger.log(`Client connected: ${client.id} | Total: ${this.connectedClients.size}`);

    // Welcome message
    client.emit('connected', {
      id: client.id,
      message: 'WebSocket connection established',
      timestamp: new Date().toISOString(),
    });
  }

  // ─── Client disconnected ──────────────────────────────────────────
  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id} | Total: ${this.connectedClients.size}`);
  }

  // ─── Client ping handler ──────────────────────────────────────────
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { time: new Date().toISOString() });
  }

  // ─── Broadcast message ────────────────────────────────────────────
  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Message from ${client.id}: ${JSON.stringify(data)}`);

    // Broadcast to all clients
    this.server.emit('message', {
      from: client.id,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  // ─── Room join ────────────────────────────────────────────────────
  @SubscribeMessage('join-room')
  handleJoinRoom(
    @MessageBody() room: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(room);
    this.logger.log(`Client ${client.id} joined room: ${room}`);
    client.emit('room-joined', { room });
  }

  // ─── Room message ─────────────────────────────────────────────────
  @SubscribeMessage('room-message')
  handleRoomMessage(
    @MessageBody() data: { room: string; message: any },
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(data.room).emit('room-message', {
      from: client.id,
      message: data.message,
      timestamp: new Date().toISOString(),
    });
  }
}
