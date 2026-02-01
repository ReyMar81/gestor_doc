import { ActionIcon, Button, Divider, Group, Modal, Stack, Text, TextInput, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks'; // Necesario para el modal
import { IconLogin, IconMessagePlus, IconPhone, IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CreateFolderModal from './CreateFolderModal';
import CreateTagModal from './CreateTagModal';
import FolderTree from './FolderTree';
import TagList from './TagList';

// 1. Recibimos onJoinRoom como prop
const Sidebar = ({ onJoinRoom }) => {
  const { setSelectedFolderId, globalRefetch, globalRefetchTrigger } = useAuth();
  const navigate = useNavigate();
  
  const [folderModalOpened, setFolderModalOpened] = useState(false);
  const [tagModalOpened, setTagModalOpened] = useState(false);

  // Estados para el chat
  const [joinModalOpened, { open: openJoinModal, close: closeJoinModal }] = useDisclosure(false);
  const [roomCodeInput, setRoomCodeInput] = useState('');

  const handleFolderSuccess = () => {
    globalRefetch();
    setFolderModalOpened(false);
  };

  const handleTagSuccess = () => {
    globalRefetch();
    setTagModalOpened(false); 
  };

  // --- LÃ“GICA DE SALAS ---
  const handleCreateRoom = () => {
    // Genera un ID aleatorio simple (ej: conf-9382)
    const randomId = 'conf-' + Math.floor(1000 + Math.random() * 9000);
    if (onJoinRoom) onJoinRoom(randomId);
  };

  const handleJoinRoom = () => {
    if (roomCodeInput.trim()) {
      if (onJoinRoom) onJoinRoom(roomCodeInput.trim());
      setRoomCodeInput('');
      closeJoinModal();
    }
  };

  const handleGoToVoiceRoom = () => {
    navigate('/voice-room');
  };
  
  return (
    <>
      {/* --- SECCIÃ“N CONFERENCIAS --- */}
      <Text size="xs" fw={500} c="dimmed" mb={5}>CONFERENCIAS</Text>
      <Stack gap="xs" mb="xl">
        <Button 
          variant="light" 
          color="violet" 
          fullWidth 
          leftSection={<IconMessagePlus size={18}/>}
          onClick={handleCreateRoom}
        >
          Crear Chat
        </Button>
        <Button 
          variant="outline" 
          color="violet" 
          fullWidth
          leftSection={<IconLogin size={18}/>}
          onClick={openJoinModal}
        >
          Unirse con Código
        </Button>
        <Button 
          variant="filled" 
          color="teal" 
          fullWidth
          leftSection={<IconPhone size={18}/>}
          onClick={handleGoToVoiceRoom}
        >
          Llamada de Voz
        </Button>
      </Stack>

      <Divider my="sm" label="Documentos" labelPosition="center" />

      {/* --- SECCIÃ“N CARPETAS (Tu codigo original) --- */}
      <Group justify="space-between" mb="sm">
        <Title order={4}>Carpetas</Title>
        <ActionIcon size="sm" variant="default" onClick={() => setFolderModalOpened(true)}>
          <IconPlus size={16} />
        </ActionIcon>
      </Group>
      
      <FolderTree 
        onFolderSelect={setSelectedFolderId} 
        refetchTrigger={globalRefetchTrigger}
        onRefetch={handleFolderSuccess}
      />

      {/* --- SECCIÃ“N ETIQUETAS (Tu codigo original) --- */}
      <Group justify="space-between" mt="xl" mb="sm">
        <Title order={4}>Etiquetas</Title>
        <ActionIcon size="sm" variant="default" onClick={() => setTagModalOpened(true)}>
          <IconPlus size={16} />
        </ActionIcon>
      </Group>
      
      <TagList 
        refetchTrigger={globalRefetchTrigger} 
        onRefetch={handleTagSuccess}
      />
      
      {/* --- MODALES --- */}
      <CreateFolderModal 
        opened={folderModalOpened} 
        onClose={() => setFolderModalOpened(false)}
        onSuccess={handleFolderSuccess}
      />
      
      <CreateTagModal 
        opened={tagModalOpened} 
        onClose={() => setTagModalOpened(false)}
        onSuccess={handleTagSuccess}
      />

      {/* Modal para Unirse a Sala */}
      <Modal opened={joinModalOpened} onClose={closeJoinModal} title="Unirse al Chat" centered>
        <Stack>
          <TextInput
            label="codigo de la Sala"
            placeholder="Ej: conf-1234"
            value={roomCodeInput}
            onChange={(e) => setRoomCodeInput(e.currentTarget.value)}
            data-autofocus
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={closeJoinModal}>Cancelar</Button>
            <Button color="violet" onClick={handleJoinRoom}>Entrar</Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export default Sidebar;