"""
Real-time Communication Module
Socket.io integration for Native Colab
Supports both /ws/socket.io and /socket.io mount paths with trailing slash normalization
"""

import socketio
from app.core.websocket import sio

# Support both /ws/socket.io and root /socket.io paths seamlessly
class DualPathSocketApp:
    def __init__(self, sio_instance):
        self.app_ws = socketio.ASGIApp(sio_instance, socketio_path='ws/socket.io')
        self.app_root = socketio.ASGIApp(sio_instance, socketio_path='socket.io')

    async def __call__(self, scope, receive, send):
        path = scope.get('path', '')
        # Engine.IO requires trailing slash matching: scope['path'].startswith(self.engineio_path)
        # Browser WebSocket clients connect to '/ws/socket.io' without trailing slash.
        if not path.endswith('/'):
            scope = dict(scope, path=path + '/')
            path = scope['path']

        if path.startswith('/ws'):
            return await self.app_ws(scope, receive, send)
        return await self.app_root(scope, receive, send)

socket_app = DualPathSocketApp(sio)

# Export socket instance for use in other modules
__all__ = ['socket_app', 'sio']
