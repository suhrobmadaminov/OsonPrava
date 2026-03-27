import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OctagonService } from '../octagon.service';

@WebSocketGateway({
  namespace: '/octagon',
  cors: { origin: '*' },
})
export class OctagonGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<number, string>();

  constructor(private readonly octagonService: OctagonService) {}

  handleConnection(client: Socket) {
    const userId = Number(client.handshake.query.userId);
    if (userId) {
      this.userSockets.set(userId, client.id);
      client.join(`user:${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = Number(client.handshake.query.userId);
    if (userId) {
      this.userSockets.delete(userId);
    }
  }

  @SubscribeMessage('match:find')
  async handleFindMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: number },
  ) {
    const result = await this.octagonService.findMatch(data.userId);

    if (result.status === 'matched' && result.match) {
      const match = result.match;
      const matchRoom = `match:${match.id}`;

      // Add both players to match room
      for (const player of match.players) {
        const socketId = this.userSockets.get(player.userId);
        if (socketId) {
          const playerSocket = this.server.sockets.get(socketId);
          if (playerSocket) {
            playerSocket.join(matchRoom);
          }
        }
      }

      // Notify both players
      this.server.to(matchRoom).emit('match:found', {
        matchId: match.id,
        players: match.players,
      });

      // Send first question after a short delay
      const matchData = await this.octagonService.getMatch(match.id);
      if (matchData.questions.length > 0) {
        this.server.to(matchRoom).emit('match:start', {
          matchId: match.id,
          totalQuestions: matchData.questions.length,
        });

        this.server.to(matchRoom).emit('match:question', {
          matchId: match.id,
          questionIndex: 0,
          question: matchData.questions[0],
        });
      }
    } else {
      client.emit('match:waiting', { message: 'Waiting for opponent...' });
    }
  }

  @SubscribeMessage('match:answer')
  async handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      matchId: number;
      userId: number;
      questionId: number;
      answerId: number;
      timeSpentSec: number;
    },
  ) {
    const result = await this.octagonService.submitAnswer(data.matchId, data.userId, {
      questionId: data.questionId,
      answerId: data.answerId,
      timeSpentSec: data.timeSpentSec,
    });

    const matchRoom = `match:${data.matchId}`;

    // Broadcast score update to the match room
    this.server.to(matchRoom).emit('match:score', {
      matchId: data.matchId,
      userId: data.userId,
      isCorrect: result.isCorrect,
    });

    if (result.matchCompleted) {
      const matchData = await this.octagonService.getMatch(data.matchId);
      this.server.to(matchRoom).emit('match:complete', {
        matchId: data.matchId,
        winnerId: result.winnerId,
        players: matchData.players,
      });
    }
  }
}
