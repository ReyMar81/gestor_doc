class WebSocketService {
  static instance = null;
  callbacks = {}; // Almacena funciones para actualizar la UI

  static getInstance() {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  constructor() {
    this.socketRef = null;
  }

  // Iniciar conexiÃ³n
  connect(roomName) {
    // 0. IMPORTANTE: Cerrar conexión anterior si existe
    if (this.socketRef && this.socketRef.readyState !== WebSocket.CLOSED) {
      console.log('🔄 Cerrando conexión anterior antes de conectar a nueva sala');
      this.socketRef.close();
    }
    
    const token = localStorage.getItem('authToken'); 

    if (!token) {
      console.error("âŒ No hay token de autenticaciÃ³n. No se puede conectar al chat.");
      return;
    }

    // 2. Lo enviamos como parÃ¡metro en la URL (?token=...)
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = import.meta.env.VITE_WS_URL || `${wsProtocol}//${window.location.host}`;
    const path = `${wsHost}/ws/chat/${roomName}/?token=${token}`;
    
    this.socketRef = new WebSocket(path);

    // ... (el resto del codigo onopen, onmessage, etc. sigue igual)
    this.socketRef.onopen = () => { console.log('âœ… WebSocket conectado correctamente'); };
    this.socketRef.onmessage = (e) => { this.socketNewMessage(e.data); };
    this.socketRef.onerror = (e) => { console.error('âŒ Error de WebSocket:', e); };
    this.socketRef.onclose = () => { console.log('ðŸ”Œ WebSocket desconectado'); };
  }

  // Desconectar
  disconnect() {
    if (this.socketRef) {
      this.socketRef.close();
    }
    // No limpiar callbacks ni socketRef aquí - solo cerrar la conexión
  }

  // Enviar mensaje (JSON)
  sendMessage(data) {
    if (this.socketRef && this.socketRef.readyState === WebSocket.OPEN) {
      this.socketRef.send(JSON.stringify(data));
    } else {
      console.warn('âš ï¸ No se pudo enviar: WebSocket no conectado');
    }
  }

  // --- Gestión de Callbacks ---
  
  addCallbacks(newMessageCallback) {
    // Solo agregar si no existe ya
    if (!this.callbacks['new_message']) {
      this.callbacks['new_message'] = newMessageCallback;
      console.log('✅ Callback registrado');
    } else {
      console.log('⚠️ Callback ya existe, no se duplica');
    }
  }
  
  removeCallbacks() {
    this.callbacks = {};
  }

  socketNewMessage(data) {
    const parsedData = JSON.parse(data);
    const callback = this.callbacks['new_message'];
    if (callback) {
      callback(parsedData);
    }
  }
}

const WebSocketInstance = WebSocketService.getInstance();

export default WebSocketInstance;