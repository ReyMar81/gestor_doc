import { Box, Button, Container, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { useState } from 'react';
import { IconPhone, IconPlus } from '@tabler/icons-react';

const VoiceRoomPage = ({ onOpenVoiceRoom, activeVoiceRooms }) => {
  const [roomName, setRoomName] = useState('');
  const [joinRoomName, setJoinRoomName] = useState('');

  const generateRoomCode = () => {
    return 'voice-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  };

  const handleCreateRoom = () => {
    const newRoom = generateRoomCode();
    onOpenVoiceRoom(newRoom);
  };

  const handleJoinRoom = () => {
    if (joinRoomName.trim()) {
      onOpenVoiceRoom(joinRoomName.trim());
      setJoinRoomName('');
    }
  };

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Box>
          <Title order={1} mb="xs">
            🎙️ Llamadas de Voz en Tiempo Real
          </Title>
          <Text c="dimmed">
            Únete a llamadas de voz donde escuchas a cada participante en tu idioma preferencial con traducción instantánea.
          </Text>
        </Box>

        <Paper shadow="md" p="xl" radius="md" withBorder>
          <Stack gap="lg">
            {/* Crear nueva reunión */}
            <Box>
              <Text size="lg" fw={600} mb="md">
                Crear Nueva Reunión
              </Text>
              <Text size="sm" c="dimmed" mb="md">
                Crea una sala de voz y comparte el código con otros participantes.
              </Text>
              <Button
                leftSection={<IconPlus size={20} />}
                size="lg"
                fullWidth
                variant="filled"
                color="teal"
                onClick={handleCreateRoom}
              >
                Crear Reunión de Voz
              </Button>
            </Box>

            {/* Separador */}
            <Box style={{ borderTop: '1px solid #dee2e6', paddingTop: '1rem' }}>
              <Text size="lg" fw={600} mb="md">
                Unirse a una Reunión
              </Text>
              <Text size="sm" c="dimmed" mb="md">
                Ingresa el código de la reunión para unirte.
              </Text>
              <Group>
                <TextInput
                  placeholder="Código de la reunión (ej: voice-ABC123)"
                  value={joinRoomName}
                  onChange={(e) => setJoinRoomName(e.target.value)}
                  style={{ flex: 1 }}
                  size="lg"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleJoinRoom();
                  }}
                />
                <Button
                  leftSection={<IconPhone size={20} />}
                  size="lg"
                  variant="light"
                  color="teal"
                  onClick={handleJoinRoom}
                  disabled={!joinRoomName.trim()}
                >
                  Unirse
                </Button>
              </Group>
            </Box>
          </Stack>
        </Paper>

        {/* Instrucciones */}
        <Paper shadow="sm" p="lg" radius="md" bg="blue.0">
          <Title order={3} mb="md">
            📋 Cómo Usar
          </Title>
          <Stack gap="xs">
            <Text size="sm">
              <strong>1.</strong> Crea una llamada o únete con un código.
            </Text>
            <Text size="sm">
              <strong>2.</strong> Permite el acceso al micrófono cuando el navegador lo solicite.
            </Text>
            <Text size="sm">
              <strong>3.</strong> Activa tu micrófono y comienza a hablar naturalmente.
            </Text>
            <Text size="sm">
              <strong>4.</strong> Verás los avatares de quiénes están hablando con animaciones.
            </Text>
            <Text size="sm">
              <strong>5.</strong> Escucharás automáticamente a otros participantes traducidos a tu idioma - sin ver texto.
            </Text>
            <Text size="sm">
              <strong>6.</strong> La experiencia es como una llamada real, no como un chat.
            </Text>
          </Stack>
        </Paper>

        {/* Nota técnica */}
        <Paper shadow="sm" p="md" radius="md" bg="yellow.0">
          <Text size="sm" c="dimmed">
            <strong>Nota:</strong> Para mejor rendimiento, usa Chrome o Edge. Asegúrate de tener configurado tu idioma preferencial en tu perfil.
          </Text>
        </Paper>
      </Stack>
    </Container>
  );
};

export default VoiceRoomPage;
