class SocketService {
  private socket: WebSocket | null = null;
  private messageHandlers: ((message: any) => void)[] = [];
  private authHandlers: (() => void)[] = [];

  connect(userId: string, token?: string) {
  // Prefer explicit API base if set in Vite env. Expect value like 'http://localhost:8080'
  const apiBase = (import.meta.env && import.meta.env.VITE_API_BASE) ? import.meta.env.VITE_API_BASE : `${window.location.protocol}//${window.location.hostname}:8080`;
  const protocol = apiBase.startsWith('https') ? 'wss:' : 'ws:';
  // strip protocol from apiBase
  const host = apiBase.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const base = `${protocol}//${host}/ws`;
  const wsUrl = token ? `${base}?token=${encodeURIComponent(token)}` : base;

    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.authenticate(userId);
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'auth' && data.status === 'success') {
          this.authHandlers.forEach(handler => handler());
        } else if (data.type === 'new_message') {
          this.messageHandlers.forEach(handler => handler(data.message));
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      // Implement reconnection logic if needed
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private authenticate(userId: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'auth',
        userId,
      }));
    }
  }

  sendMessage(senderId: string, receiverId: string, content: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'chat_message',
        senderId,
        receiverId,
        content,
      }));
    }
  }

  onMessage(handler: (message: any) => void) {
    this.messageHandlers.push(handler);
  }

  onAuth(handler: () => void) {
    this.authHandlers.push(handler);
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.messageHandlers = [];
    this.authHandlers = [];
  }
}

export const socketService = new SocketService();
