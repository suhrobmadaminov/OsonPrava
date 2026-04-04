"""
Octagon WebSocket consumers.
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone


class OctagonConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for 1v1 battles."""
    
    async def connect(self):
        self.match_id = self.scope['url_route']['kwargs']['match_id']
        self.room_group_name = f'octagon_{self.match_id}'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send match started
        await self.send(text_data=json.dumps({
            'type': 'match_started',
            'match_id': self.match_id
        }))
    
    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')
        
        if action == 'answer':
            await self.handle_answer(data)
        elif action == 'skip':
            await self.handle_skip(data)
        elif action == 'time_update':
            await self.handle_time_update(data)
    
    async def handle_answer(self, data):
        """Handle player answer."""
        question_id = data.get('question_id')
        is_correct = data.get('is_correct')
        time_spent = data.get('time_spent')
        
        # Broadcast to opponent
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'player_answer',
                'question_id': question_id,
                'is_correct': is_correct,
                'time_spent': time_spent,
                'player': self.scope['user'].username if self.scope['user'].is_authenticated else 'anonymous'
            }
        )
    
    async def handle_skip(self, data):
        """Handle player skip."""
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'player_skip',
                'question_id': data.get('question_id'),
                'player': self.scope['user'].username if self.scope['user'].is_authenticated else 'anonymous'
            }
        )
    
    async def handle_time_update(self, data):
        """Handle time update."""
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'time_update',
                'remaining_time': data.get('remaining_time')
            }
        )
    
    # Event handlers
    async def player_answer(self, event):
        await self.send(text_data=json.dumps({
            'type': 'opponent_answer',
            'question_id': event['question_id'],
            'is_correct': event['is_correct'],
            'time_spent': event['time_spent'],
            'player': event['player']
        }))
    
    async def player_skip(self, event):
        await self.send(text_data=json.dumps({
            'type': 'opponent_skip',
            'question_id': event['question_id'],
            'player': event['player']
        }))
    
    async def time_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'time_update',
            'remaining_time': event['remaining_time']
        }))
    
    async def match_ended(self, event):
        await self.send(text_data=json.dumps({
            'type': 'match_ended',
            'winner': event.get('winner'),
            'final_scores': event.get('final_scores')
        }))
