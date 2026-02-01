import React, { useState } from 'react';
import { Modal, Button, Text, TextInput, Select, Group, Loader } from '@mantine/core'; // 1. Importar Loader
import { notifications } from '@mantine/notifications'; // 2. Importar notificaciones
import { shareDocument } from '../api/documentService'; // 3. Importar la función

const ShareModal = ({ opened, onClose, documentName, documentId }) => { // 4. Recibir documentId
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('view');
  // 5. Estado de carga
  const [isSharing, setIsSharing] = useState(false);

  const handleSubmit = async () => {
    setIsSharing(true);
    try {
      // 6. Llamar a la API
      const response = await shareDocument(documentId, email, permission);
      
      notifications.show({
        title: 'Éxito',
        message: response.detail || 'Documento compartido.',
        color: 'green',
      });
      onClose(); // Cerrar el modal

    } catch (err) {
      // 7. Manejar errores de la API
      const message = err.response?.data?.detail || 'No se pudo compartir el documento.';
      notifications.show({
        title: 'Error',
        message: message,
        color: 'red',
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Compartir "${documentName}"`}
      centered
      // 8. Deshabilitar el cierre al hacer clic fuera si está cargando
      closeOnClickOutside={!isSharing}
    >
      <Text size="sm" mb="md">
        Ingresa el correo del usuario con quien quieres compartir.
      </Text>

      <TextInput
        label="Correo del Usuario"
        placeholder="usuario@ejemplo.com"
        value={email}
        onChange={(e) => setEmail(e.currentTarget.value)}
        type="email"
        disabled={isSharing} // 9. Deshabilitar campos
      />

      <Select
        label="Permiso"
        value={permission}
        onChange={setPermission}
        data={[
          { value: 'view', label: 'Ver' },
          { value: 'edit', label: 'Editar' },
        ]}
        mt="md"
        withinPortal // (Esto lo arreglamos antes, ¡se queda!)
        disabled={isSharing} // 9. Deshabilitar campos
      />

      <Group justify="flex-end" mt="xl">
        <Button variant="default" onClick={onClose} disabled={isSharing}>
          Cancelar
        </Button>
        {/* 10. Mostrar Loader en el botón */}
        <Button onClick={handleSubmit} loading={isSharing}>
          {isSharing ? 'Compartiendo...' : 'Compartir'}
        </Button>
      </Group>
    </Modal>
  );
};

export default ShareModal;