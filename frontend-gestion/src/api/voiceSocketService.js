class VoiceSocketService {
  static instance = null;
  callbacks = {}; // Almacena funciones para actualizar la UI

  static getInstance() {
    if (!VoiceSocketService.instance) {
      VoiceSocketService.instance = new VoiceSocketService();
    }
    return VoiceSocketService.instance;
  }

  constructor() {
    this.socketRef = null;
  }

  // Iniciar conexión
  connect(roomName) {
    // Cerrar conexión anterior si existe
    if (this.socketRef && this.socketRef.readyState !== WebSocket.CLOSED) {
      console.log('🔄 [VOICE] Cerrando conexión anterior antes de conectar a nueva sala de voz');
      this.socketRef.close();
    }
    
    const token = localStorage.getItem('authToken'); 

    if (!token) {
      console.error("❌ [VOICE] No hay token de autenticación. No se puede conectar a la sala de voz.");
      return;
    }

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = import.meta.env.VITE_WS_URL || `${wsProtocol}//${window.location.host}`;
    const path = `${wsHost}/ws/chat/${roomName}/?token=${token}`;
    
    this.socketRef = new WebSocket(path);

    this.socketRef.onopen = () => { 
      console.log('✅ [VOICE] WebSocket de voz conectado correctamente'); 
    };
    
    this.socketRef.onmessage = (e) => { 
      this.socketNewMessage(e.data); 
    };
    
    this.socketRef.onerror = (e) => { 
      console.error('❌ [VOICE] Error de WebSocket:', e); 
    };
    
    this.socketRef.onclose = () => { 
      console.log('🔌 [VOICE] WebSocket de voz desconectado'); 
    };
  }

  // Desconectar
  disconnect() {
    if (this.socketRef) {
      this.socketRef.close();
    }
  }

  // Enviar mensaje (JSON)
  sendMessage(data) {
    if (this.socketRef && this.socketRef.readyState === WebSocket.OPEN) {
      this.socketRef.send(JSON.stringify(data));
    } else {
      console.warn('⚠️ [VOICE] No se pudo enviar: WebSocket no conectado');
    }
  }

  // --- Gestión de Callbacks ---
  
  addCallbacks(newMessageCallback) {
    if (!this.callbacks['new_message']) {
      this.callbacks['new_message'] = newMessageCallback;
      console.log('✅ [VOICE] Callback registrado');
    } else {
      console.log('⚠️ [VOICE] Callback ya existe, no se duplica');
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

  // Estado
  state() {
    return this.socketRef ? this.socketRef.readyState : WebSocket.CLOSED;
  }
}

const VoiceSocketInstance = VoiceSocketService.getInstance();
export default VoiceSocketInstance;
