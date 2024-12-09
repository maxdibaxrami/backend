import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*', // Allow cross-origin requests
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  private activeUsers = new Map<string, Socket>(); // Track online users

  // Handle user connection
  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.activeUsers.set(userId, client);
      this.server.emit('userOnline', userId); // Notify others about the online status
    } else {
      console.log('User ID is missing during connection');
    }
  }

  // Handle user disconnection
  handleDisconnect(client: Socket) {
    const userId = Array.from(this.activeUsers.entries()).find(
      ([, socket]) => socket === client,
    )?.[0];
    if (userId) {
      this.activeUsers.delete(userId);
      this.server.emit('userOffline', userId); // Notify others about the offline status
    } else {
      console.log('Failed to find user during disconnection');
    }
  }

  // Handle sending messages
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { recipientId: string; content?: string; mediaUrl?: string },
  ) {
    const senderId = client.handshake.query.userId as string;

    if (!senderId) {
      throw new WsException('Sender ID is required');
    }

    const senderIdNumber = parseInt(senderId, 10);
    if (isNaN(senderIdNumber)) {
      throw new WsException('Invalid sender ID');
    }

    const recipientIdNumber = parseInt(data.recipientId, 10);
    if (isNaN(recipientIdNumber)) {
      throw new WsException('Invalid recipient ID');
    }

    // Save the message to the database
    const message = await this.chatService.saveMessage({
      senderId: senderIdNumber,
      recipientId: recipientIdNumber,
      content: data.content,
      mediaUrl: data.mediaUrl,
    });

    // Emit the message to the recipient if they are online
    const recipientSocket = this.activeUsers.get(data.recipientId);
    if (recipientSocket) {
      recipientSocket.emit('message', message);
    } else {
      console.log('Recipient is offline. Message will not be delivered in real time.');
    }
  }

  // Handle marking a message as read
  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() data: { messageId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = Array.isArray(client.handshake.query.userId)
      ? client.handshake.query.userId[0]
      : client.handshake.query.userId;

    if (!userId) {
      throw new WsException('User ID is required');
    }

    const updatedMessage = await this.chatService.markAsRead(
      data.messageId,
      parseInt(userId, 10), // Ensure userId is a number
    );

    // Emit the 'messageRead' event to the sender with correct data
    this.server.to(updatedMessage.sender.id.toString()).emit('messageRead', {
      messageId: updatedMessage.id,  // Emit the correct messageId
      readAt: updatedMessage.readAt,
    });
  }
}
