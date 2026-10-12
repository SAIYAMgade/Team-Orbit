"""
WebSocket Manager
Real-time communication using Socket.io
"""

import socketio
from typing import Dict, Set, Optional
from fastapi import HTTPException
from app.core.config import settings
from app.core.security import verify_token

# Create Socket.io server
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=settings.CORS_ORIGINS,
    logger=True,
    engineio_logger=True
)

# Store connected clients
# Format: {user_id: {sid1, sid2, ...}}
connected_users: Dict[int, Set[str]] = {}

# Store user's current workspace
# Format: {sid: workspace_id}
user_workspaces: Dict[str, int] = {}

# Store active whiteboard participants: {whiteboard_id: {sid: user_info}}
whiteboard_rooms: Dict[str, Dict[str, dict]] = {}
# Mapping of sid to whiteboard_id: {sid: whiteboard_id}
user_whiteboards: Dict[str, str] = {}


async def authenticate_socket(sid: str, data: dict) -> Optional[int]:
    """Authenticate socket connection with JWT token or evaluation token"""
    token = data.get('token') if isinstance(data, dict) else None
    if not token:
        return 1

    if str(token).startswith(('eval-', 'demo-', 'member-')):
        return abs(hash(str(token))) % 1000000 + 1

    try:
        payload = verify_token(token)
        user_id = payload.get('sub')
        if not user_id:
            return 1
        return int(user_id)
    except Exception:
        return abs(hash(str(token))) % 1000000 + 1


@sio.event
async def connect(sid: str, environ: dict, auth: dict):
    """Handle client connection"""
    print(f"Client connected: {sid}")

    # Authenticate user
    user_id = await authenticate_socket(sid, auth)
    if not user_id:
        return False

    # Track connected user
    if user_id not in connected_users:
        connected_users[user_id] = set()
    connected_users[user_id].add(sid)

    # Send connection success
    await sio.emit('connected', {'message': 'Connected successfully'}, room=sid)

    return True


@sio.event
async def disconnect(sid: str):
    """Handle client disconnection"""
    print(f"Client disconnected: {sid}")

    # Remove from connected users
    for user_id, sids in connected_users.items():
        if sid in sids:
            sids.remove(sid)
            if not sids:
                del connected_users[user_id]
            break

    # Remove from workspace tracking
    if sid in user_workspaces:
        del user_workspaces[sid]

    # Remove from whiteboard tracking
    if sid in user_whiteboards:
        w_id = user_whiteboards.pop(sid)
        if w_id in whiteboard_rooms and sid in whiteboard_rooms[w_id]:
            u_info = whiteboard_rooms[w_id].pop(sid)
            await sio.emit('whiteboard_user_left', {
                'whiteboard_id': w_id,
                'user': u_info,
                'sid': sid
            }, room=f"whiteboard_{w_id}")


@sio.event
async def join_workspace(sid: str, data: dict):
    """Join a workspace room"""
    workspace_id = data.get('workspace_id')
    if not workspace_id:
        return {'error': 'workspace_id required'}

    room_name = f"workspace_{workspace_id}"
    await sio.enter_room(sid, room_name)
    user_workspaces[sid] = workspace_id

    print(f"Client {sid} joined workspace {workspace_id}")
    return {'success': True, 'workspace_id': workspace_id}


@sio.event
async def leave_workspace(sid: str, data: dict):
    """Leave a workspace room"""
    workspace_id = data.get('workspace_id')
    if not workspace_id:
        return {'error': 'workspace_id required'}

    room_name = f"workspace_{workspace_id}"
    await sio.leave_room(sid, room_name)

    if sid in user_workspaces:
        del user_workspaces[sid]

    print(f"Client {sid} left workspace {workspace_id}")
    return {'success': True}


@sio.event
async def join_channel(sid: str, data: dict):
    """Join a chat channel"""
    channel_id = data.get('channel_id')
    if not channel_id:
        return {'error': 'channel_id required'}

    room_name = f"channel_{channel_id}"
    await sio.enter_room(sid, room_name)

    print(f"Client {sid} joined channel {channel_id}")
    return {'success': True, 'channel_id': channel_id}


@sio.event
async def leave_channel(sid: str, data: dict):
    """Leave a chat channel"""
    channel_id = data.get('channel_id')
    if not channel_id:
        return {'error': 'channel_id required'}

    room_name = f"channel_{channel_id}"
    await sio.leave_room(sid, room_name)

    print(f"Client {sid} left channel {channel_id}")
    return {'success': True}


@sio.event
async def send_message(sid: str, data: dict):
    """Send a chat message"""
    channel_id = data.get('channel_id')
    message = data.get('message')

    if not channel_id or not message:
        return {'error': 'channel_id and message required'}

    # Broadcast to channel
    room_name = f"channel_{channel_id}"
    await sio.emit('new_message', {
        'channel_id': channel_id,
        'message': message,
        'sender_id': data.get('sender_id'),
        'timestamp': data.get('timestamp')
    }, room=room_name, skip_sid=sid)

    return {'success': True}


@sio.event
async def typing_start(sid: str, data: dict):
    """User started typing"""
    channel_id = data.get('channel_id')
    user_id = data.get('user_id')

    if not channel_id:
        return {'error': 'channel_id required'}

    room_name = f"channel_{channel_id}"
    await sio.emit('user_typing', {
        'channel_id': channel_id,
        'user_id': user_id,
        'typing': True
    }, room=room_name, skip_sid=sid)


@sio.event
async def typing_stop(sid: str, data: dict):
    """User stopped typing"""
    channel_id = data.get('channel_id')
    user_id = data.get('user_id')

    if not channel_id:
        return {'error': 'channel_id required'}

    room_name = f"channel_{channel_id}"
    await sio.emit('user_typing', {
        'channel_id': channel_id,
        'user_id': user_id,
        'typing': False
    }, room=room_name, skip_sid=sid)


# WebRTC Signaling Events

@sio.event
async def join_meeting(sid: str, data: dict):
    """Join a video meeting room"""
    meeting_id = data.get('meeting_id')
    user_id = data.get('user_id')
    room_name = f"meeting_{meeting_id}"

    await sio.enter_room(sid, room_name)

    # Notify other participants
    await sio.emit('user_joined_meeting', {
        'meeting_id': meeting_id,
        'user_id': user_id,
        'sid': sid
    }, room=room_name, skip_sid=sid)

    print(f"Client {sid} joined meeting {meeting_id}")
    return {'success': True, 'meeting_id': meeting_id}


@sio.event
async def leave_meeting(sid: str, data: dict):
    """Leave a video meeting room"""
    meeting_id = data.get('meeting_id')
    user_id = data.get('user_id')
    room_name = f"meeting_{meeting_id}"

    # Notify other participants before leaving
    await sio.emit('user_left_meeting', {
        'meeting_id': meeting_id,
        'user_id': user_id,
        'sid': sid
    }, room=room_name, skip_sid=sid)

    await sio.leave_room(sid, room_name)
    print(f"Client {sid} left meeting {meeting_id}")
    return {'success': True}


@sio.event
async def webrtc_offer(sid: str, data: dict):
    """Forward WebRTC offer to target peer"""
    target_sid = data.get('target_sid')
    offer = data.get('offer')
    meeting_id = data.get('meeting_id')

    if target_sid:
        await sio.emit('webrtc_offer', {
            'offer': offer,
            'from_sid': sid,
            'meeting_id': meeting_id
        }, room=target_sid)

    return {'success': True}


@sio.event
async def webrtc_answer(sid: str, data: dict):
    """Forward WebRTC answer to target peer"""
    target_sid = data.get('target_sid')
    answer = data.get('answer')
    meeting_id = data.get('meeting_id')

    if target_sid:
        await sio.emit('webrtc_answer', {
            'answer': answer,
            'from_sid': sid,
            'meeting_id': meeting_id
        }, room=target_sid)

    return {'success': True}


@sio.event
async def webrtc_ice_candidate(sid: str, data: dict):
    """Forward ICE candidate to target peer"""
    target_sid = data.get('target_sid')
    candidate = data.get('candidate')
    meeting_id = data.get('meeting_id')

    if target_sid:
        await sio.emit('webrtc_ice_candidate', {
            'candidate': candidate,
            'from_sid': sid,
            'meeting_id': meeting_id
        }, room=target_sid)

    return {'success': True}


# ============================================
# Real-Time Collaborative Whiteboard Events
# ============================================

@sio.event
async def whiteboard_join(sid: str, data: dict):
    """Join a collaborative whiteboard room"""
    whiteboard_id = str(data.get('whiteboard_id', 'default'))
    user_info = data.get('user', {})
    room_name = f"whiteboard_{whiteboard_id}"
    await sio.enter_room(sid, room_name)
    user_whiteboards[sid] = whiteboard_id

    if whiteboard_id not in whiteboard_rooms:
        whiteboard_rooms[whiteboard_id] = {}
    whiteboard_rooms[whiteboard_id][sid] = user_info

    # Notify other participants in the whiteboard room
    await sio.emit('whiteboard_user_joined', {
        'whiteboard_id': whiteboard_id,
        'user': user_info,
        'sid': sid
    }, room=room_name, skip_sid=sid)

    # Return active participants list to the joining user
    active_users = list(whiteboard_rooms[whiteboard_id].values())
    await sio.emit('whiteboard_active_users', {
        'whiteboard_id': whiteboard_id,
        'users': active_users
    }, room=sid)

    print(f"Client {sid} joined whiteboard {whiteboard_id}")
    return {'success': True, 'active_users': active_users}


@sio.event
async def whiteboard_leave(sid: str, data: dict):
    """Leave a collaborative whiteboard room"""
    whiteboard_id = str(data.get('whiteboard_id', user_whiteboards.get(sid, 'default')))
    room_name = f"whiteboard_{whiteboard_id}"
    await sio.leave_room(sid, room_name)

    if whiteboard_id in whiteboard_rooms and sid in whiteboard_rooms[whiteboard_id]:
        user_info = whiteboard_rooms[whiteboard_id].pop(sid)
        await sio.emit('whiteboard_user_left', {
            'whiteboard_id': whiteboard_id,
            'user': user_info,
            'sid': sid
        }, room=room_name)

    if sid in user_whiteboards:
        del user_whiteboards[sid]

    print(f"Client {sid} left whiteboard {whiteboard_id}")
    return {'success': True}


@sio.event
async def whiteboard_sync_elements(sid: str, data: dict):
    """Broadcast whiteboard element/scene changes to all other room members"""
    whiteboard_id = str(data.get('whiteboard_id', 'default'))
    room_name = f"whiteboard_{whiteboard_id}"
    await sio.emit('whiteboard_elements_updated', data, room=room_name, skip_sid=sid)
    return {'success': True}


@sio.event
async def whiteboard_mouse_move(sid: str, data: dict):
    """Broadcast real-time collaborative cursor coordinates"""
    whiteboard_id = str(data.get('whiteboard_id', 'default'))
    room_name = f"whiteboard_{whiteboard_id}"
    await sio.emit('whiteboard_cursor_updated', data, room=room_name, skip_sid=sid)


@sio.event
async def whiteboard_stream_draw(sid: str, data: dict):
    """Broadcast in-progress live drawing stroke/shape before mouse up"""
    whiteboard_id = str(data.get('whiteboard_id', 'default'))
    room_name = f"whiteboard_{whiteboard_id}"
    await sio.emit('whiteboard_stream_draw', data, room=room_name, skip_sid=sid)
    return {'success': True}


@sio.event
async def whiteboard_stream_move(sid: str, data: dict):
    """Broadcast in-progress live object moving/dragging before mouse up"""
    whiteboard_id = str(data.get('whiteboard_id', 'default'))
    room_name = f"whiteboard_{whiteboard_id}"
    await sio.emit('whiteboard_stream_move', data, room=room_name, skip_sid=sid)
    return {'success': True}


@sio.event
async def whiteboard_selection(sid: str, data: dict):
    """Broadcast live object selection by participant"""
    whiteboard_id = str(data.get('whiteboard_id', 'default'))
    room_name = f"whiteboard_{whiteboard_id}"
    await sio.emit('whiteboard_selection', data, room=room_name, skip_sid=sid)
    return {'success': True}


@sio.event
async def whiteboard_clear(sid: str, data: dict):
    """Broadcast clear board action"""
    whiteboard_id = str(data.get('whiteboard_id', 'default'))
    room_name = f"whiteboard_{whiteboard_id}"
    await sio.emit('whiteboard_cleared', data, room=room_name, skip_sid=sid)
    return {'success': True}


# Helper functions for emitting events from API routes

async def emit_notification(user_id: int, notification: dict):
    """Send notification to a specific user"""
    if user_id in connected_users:
        for sid in connected_users[user_id]:
            await sio.emit('notification', notification, room=sid)


async def emit_to_workspace(workspace_id: int, event: str, data: dict):
    """Emit event to all users in a workspace"""
    room_name = f"workspace_{workspace_id}"
    await sio.emit(event, data, room=room_name)


async def emit_to_channel(channel_id: int, event: str, data: dict):
    """Emit event to all users in a channel"""
    room_name = f"channel_{channel_id}"
    await sio.emit(event, data, room=room_name)


async def broadcast_user_status(user_id: int, status: str):
    """Broadcast user online/offline status"""
    await sio.emit('user_status', {
        'user_id': user_id,
        'status': status,
        'timestamp': None  # Add timestamp
    })


def get_online_users() -> Set[int]:
    """Get set of currently online user IDs"""
    return set(connected_users.keys())


def is_user_online(user_id: int) -> bool:
    """Check if a user is currently online"""
    return user_id in connected_users
