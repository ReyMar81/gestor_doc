import React, { useState, useEffect } from 'react';
import { Modal, Button, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { renameFolder } from '../api/documentService';

// Recibe el 'folder' que se está editando
const RenameFolderModal = ({ opened, onClose, onSuccess, folder }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  // Cuando el modal se abre, llena el input con el nombre actual
  useEffect(() => {
    if (folder) {
      setName(folder.name);
    }
  }, [folder, opened]);

  const handleSubmit = async () => {
    if (!name || name === folder.name) {
      onClose(); // Cierra si no hay cambios
      return;
    }
    setLoading(true);
    try {
      await renameFolder(folder.id, name);
      notifications.show({ title: 'Éxito', message: 'Carpeta renombrada.', color: 'green' });
      onSuccess(); // Llama a refetch y cierra
    } catch (err) {
      notifications.show({ title: 'Error', message: 'No se pudo renombrar la carpeta.', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Renombrar Carpeta" centered>
      <TextInput
        label="Nuevo nombre"
        value={name}
        onChange={(e) => setName(e.currentTarget.value)}
        required
      />
      <Button onClick={handleSubmit} loading={loading} mt="lg" fullWidth>
        Guardar Cambios
      </Button>
    </Modal>
  );
};

export default RenameFolderModal;