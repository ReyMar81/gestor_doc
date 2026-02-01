import React, { useState, useEffect } from 'react';
import { Modal, Button, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { renameTag } from '../api/documentService';

// Recibe la 'tag' que se está editando
const RenameTagModal = ({ opened, onClose, onSuccess, tag }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tag) {
      setName(tag.name);
    }
  }, [tag, opened]);

  const handleSubmit = async () => {
    if (!name || (tag && name === tag.name)) {
      onClose(); // Cierra si no hay cambios
      return;
    }
    setLoading(true);
    try {
      await renameTag(tag.id, name);
      notifications.show({ title: 'Éxito', message: 'Etiqueta renombrada.', color: 'green' });
      onSuccess(); // Llama a refetch y cierra
    } catch (err) {
      notifications.show({ title: 'Error', message: 'No se pudo renombrar la etiqueta.', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Renombrar Etiqueta" centered>
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

export default RenameTagModal;