import { useState } from 'react'; // <--- 1. Importar useState
import { AppShell } from '@mantine/core';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ChatWindow from './components/ChatWindow';
import VoiceRoomWindow from './components/VoiceRoomWindow';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProfilePage from './pages/ProfilePage';
import PasswordResetRequestPage from './pages/PasswordResetRequestPage';
import PasswordResetConfirmPage from './pages/PasswordResetConfirmPage';
import EmailVerifyPage from './pages/EmailVerifyPage';
import DocumentViewPage from './pages/DocumentViewPage';
import VoiceRoomPage from './pages/VoiceRoomPage';

function App() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // 2. Estado para controlar la sala activa (null = cerrado)
  const [activeRoom, setActiveRoom] = useState(null);
  
  // 3. Estado para controlar las salas de voz activas
  const [voiceRooms, setVoiceRooms] = useState([]);

  // Función para abrir sala de voz
  const openVoiceRoom = (roomName) => {
    if (!voiceRooms.find(room => room.name === roomName)) {
      setVoiceRooms([...voiceRooms, { name: roomName, position: voiceRooms.length }]);
    }
  };

  // Función para cerrar sala de voz
  const closeVoiceRoom = (roomName) => {
    setVoiceRooms(voiceRooms.filter(room => room.name !== roomName));
  };

  // Calcular posición del chat window (siempre después de las salas de voz)
  const chatPosition = voiceRooms.length;

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { mobile: !isAuthenticated, desktop: !isAuthenticated },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Navbar />
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {/* Solo renderizar el Sidebar si el usuario está autenticado */}
        {isAuthenticated && (
          <Sidebar onJoinRoom={(roomName) => setActiveRoom(roomName)} />
        )}
      </AppShell.Navbar>


      <AppShell.Main>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/password-reset" element={<PasswordResetRequestPage />} />
          <Route path="/password-reset/confirm" element={<PasswordResetConfirmPage />} />
          <Route path="/verify-email" element={<EmailVerifyPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
          />
          <Route
            path="/voice-room"
            element={
              <ProtectedRoute>
                <VoiceRoomPage 
                  onOpenVoiceRoom={openVoiceRoom}
                  activeVoiceRooms={voiceRooms}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documento/:id"
            element={<ProtectedRoute><DocumentViewPage /></ProtectedRoute>}
          />
        </Routes>

        {/* 4. El ChatWindow es dinámico ahora */}
        {isAuthenticated && activeRoom && (
          <ChatWindow
            roomName={activeRoom}
            onClose={() => setActiveRoom(null)}
            position={chatPosition}
          />
        )}

        {/* 5. Ventanas de voz activas */}
        {isAuthenticated && voiceRooms.map((room) => (
          <VoiceRoomWindow
            key={room.name}
            roomName={room.name}
            onClose={() => closeVoiceRoom(room.name)}
            position={room.position}
          />
        ))}
      </AppShell.Main>
    </AppShell>
  );
}

export default App;