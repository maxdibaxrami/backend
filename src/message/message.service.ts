import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { User } from 'src/user/user.entity';
import { NotificationService } from 'src/notification/notification.service';

export class MessageDto {
  id: number;
  senderId: number;
  recipientId: number;
  content: string;
  timestamp: Date;
  mediaUrl?: string; // Optional field
  readAt?: Date;    // Optional field
}

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message) private messageRepository: Repository<Message>, // Inject MessageRepository
    @InjectRepository(User) private userRepository: Repository<User>, // Inject UserRepository
    private notificationService: NotificationService, // Inject NotificationService
  ) {}

  async createMessage(
    senderId: number,
    recipientId: number,
    content: string,
    mediaUrl?: string,  // Optional media URL parameter
  ): Promise<Message> {
    // Assuming sender and recipient are fetched from User repository
    const sender = await this.userRepository.findOne({ where: { id: senderId } });
    const recipient = await this.userRepository.findOne({ where: { id: recipientId } });

    if (!sender || !recipient) {
      throw new Error('Sender or recipient not found');
    }

    const message = this.messageRepository.create({ 
      sender, 
      recipient, 
      content,
      mediaUrl,  // Store the mediaUrl in the message entity
    });

    return await this.messageRepository.save(message);
  }

  async getMessagesBetweenUsers(
    senderId: number,
    recipientId: number
  ): Promise<MessageDto[]> {
    const parsedSenderId = senderId;
    const parsedRecipientId = recipientId;
  
    if (isNaN(parsedSenderId) || isNaN(parsedRecipientId)) {
      throw new Error('Invalid senderId or recipientId, must be valid numbers');
    }
  
    // First, mark all unread messages between the two users as read
    await this.markAllAsReadBetweenUsers(recipientId, senderId); // Mark all as read where recipient is the current user
  
    // Fetch all messages between the two users
    const messages = await this.messageRepository
      .createQueryBuilder('message')
      .select([
        'message.id',
        'message.content',
        'message.timestamp',
        'message.mediaUrl', // Include mediaUrl
        'message.readAt',   // Include readAt
        'sender.id',
        'recipient.id',
      ]) // Select the necessary fields
      .leftJoin('message.sender', 'sender')
      .leftJoin('message.recipient', 'recipient')
      .where('sender.id = :senderId AND recipient.id = :recipientId', {
        senderId: parsedSenderId,
        recipientId: parsedRecipientId,
      })
      .orWhere('sender.id = :recipientId AND recipient.id = :senderId', {
        senderId: parsedRecipientId,
        recipientId: parsedSenderId,
      })
      .orderBy('message.timestamp', 'ASC')
      .getRawMany(); // Get raw results
  
    // Map the raw results to the DTO
    return messages.map((message) => ({
      id: message.message_id,
      senderId: message.sender_id,
      recipientId: message.recipient_id,
      content: message.message_content,
      timestamp: message.message_timestamp,
      mediaUrl: message.message_mediaUrl,
      readAt: message.message_readAt,
    }));
  }
  
  
  
  
  
  

  async getChatList(userId: number): Promise<{
    userId: number;
    lastMessage: string;
    firstName: string;
    photoUrl: string;
    readAt: Date | null;
    lastMessageId: number;
    senderId: number;
    recipientId: number;
    senderFirstName: string;
    senderPhotoUrl: string;
  }[]> {
    const query = this.messageRepository
      .createQueryBuilder('message')
      .select('message.content', 'lastMessage') // Select the content of the last message
      .addSelect('message.readAt', 'readAt') // Add the readAt value to the selection
      .addSelect('message.id', 'lastMessageId') // Add the message id (last message id)
      .addSelect('message.senderId', 'senderId') // Select the sender ID
      .addSelect('message.recipientId', 'recipientId') // Select the recipient ID
      .addSelect('sender.firstName', 'senderFirstName') // Select sender's first name
      .addSelect('senderPhoto.smallUrl', 'senderPhotoUrl') // Select sender's photo URL
      .addSelect('recipient.firstName', 'recipientFirstName') // Select recipient's first name
      .addSelect('recipientPhoto.smallUrl', 'recipientPhotoUrl') // Select recipient's photo URL
      .leftJoin('message.sender', 'sender') // Join with the sender (User entity)
      .leftJoin('sender.photos', 'senderPhoto') // Join with the sender's Photo entity
      .leftJoin('message.recipient', 'recipient') // Join with the recipient (User entity)
      .leftJoin('recipient.photos', 'recipientPhoto') // Join with the recipient's Photo entity
      .where('message.senderId = :userId OR message.recipientId = :userId', { userId })
      .orderBy('message.timestamp', 'DESC') // Order by timestamp for the latest message
      .addOrderBy('sender.id') // Ensure consistent ordering for sender
      .addOrderBy('recipient.id'); // Ensure consistent ordering for recipient
  
    // Execute the query and get the raw data
    const messages = await query.getRawMany();
  
    // Use a Map to group messages by unique conversation (senderId + recipientId)
    const conversations = new Map<string, any>();
  
    // Iterate over the messages to group by conversation
    messages.forEach((message) => {
      // Normalize the conversation key (smaller senderId first, larger recipientId second)
      const conversationKey = [
        Math.min(message.senderId, message.recipientId),
        Math.max(message.senderId, message.recipientId),
      ].join('-');
  
      // If the conversation is not already added, create it
      if (!conversations.has(conversationKey)) {
        conversations.set(conversationKey, {
          userId: message.senderId === userId ? message.recipientId : message.senderId, // The other participant
          lastMessage: message.lastMessage, // The last message content
          readAt: message.readAt, // Read status
          lastMessageId: message.lastMessageId, // Last message ID
          senderId: message.senderId, // Sender ID
          recipientId: message.recipientId, // Recipient ID
          senderFirstName: message.senderFirstName, // Sender's first name
          senderPhotoUrl: message.senderPhotoUrl, // Sender's photo URL
          firstName: message.recipientFirstName, // Recipient's first name
          photoUrl: message.recipientPhotoUrl, // Recipient's photo URL
        });
      }
    });
  
    // Convert the Map values to an array for the final result
    const result = Array.from(conversations.values());
  
    return result;
  }
  
  
  
  
  
  async markAsRead(messageId: number, userId: number): Promise<Message> {
    // Find the message by its ID and recipientId
    const message = await this.messageRepository.findOne({
      where: { id: messageId, recipient: { id: userId } },
    });
  
    // Add debug logs
    console.log(`Attempting to mark message with ID ${messageId} as read for user ID ${userId}`);
  
    if (!message) {
      // Log the error in more detail
      console.error(`Message with ID ${messageId} not found or user ${userId} is not the recipient`);
      throw new Error('Message not found or unauthorized');
    }
  
    // Mark the message as read
    message.readAt = new Date(); // Set the readAt timestamp
    console.log(`Marking message ${messageId} as read at ${new Date()}`);
    
    // Save the changes
    return this.messageRepository.save(message); // Save and return the updated message
  }

   // Delete all messages between two users
   async deleteConversationBetweenUsers(userId1: number, userId2: number): Promise<void> {
    const messages = await this.messageRepository.find({
      where: [
        { sender: { id: userId1 }, recipient: { id: userId2 } },
        { sender: { id: userId2 }, recipient: { id: userId1 } },
      ],
    });

    if (messages.length === 0) {
      throw new Error('No messages found between the specified users');
    }

    await this.messageRepository.remove(messages);
  }

  async markAllAsReadBetweenUsers(userId: number, otherUserId: number): Promise<Message[]> {
    // Fetch all unread messages between the two users where the user is the recipient
    const unreadMessages = await this.messageRepository.find({
      where: [
        { recipient: { id: userId }, sender: { id: otherUserId }, readAt: null },
      ],
    });
  
    console.log(`Found ${unreadMessages.length} unread messages between user ${userId} and user ${otherUserId}`);
  
    if (!unreadMessages.length) {
      console.log(`No unread messages found between user ${userId} and user ${otherUserId}`);
      return [];
    }
  
    // Mark each message as read
    const now = new Date();
    unreadMessages.forEach(message => {
      message.readAt = now;
    });
  
    // Save all updated messages
    await this.messageRepository.save(unreadMessages);
  
    console.log(`Marked ${unreadMessages.length} messages as read between user ${userId} and user ${otherUserId}`);
  
    return unreadMessages; // Return the list of updated messages
  }
  
}
