import React, { useState } from 'react';
import { Modal, Button, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { createTag } from '../api/documentService';

const CreateTagModal = ({ opened, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name) {
      notifications.show({ title: 'Error', message: 'El nombre es requerido.', color: 'red' });
      return;
    }
    setLoading(true);
    try {
      await createTag(name);
      notifications.show({ title: 'Éxito', message: 'Etiqueta creada.', color: 'green' });
      onSuccess(); // Llama a la función de refetch y cierra
    } catch (err) {
      notifications.show({ title: 'Error', message: 'No se pudo crear la etiqueta.', color: 'red' });
    } finally {
      setLoading(false);
      setName(''); // Limpiar el input
    }
  };

  return (
    <Modal 
      opened={opened} 
      onClose={onClose} 
      title="Crear Nueva Etiqueta" 
      centered
    >
      <TextInput
        label="Nombre de la Etiqueta"
        placeholder="Ej: Urgente"
        value={name}
        onChange={(e) => setName(e.currentTarget.value)}
        required
      />
      <Button onClick={handleSubmit} loading={loading} mt="lg" fullWidth>
        Crear Etiqueta
      </Button>
    </Modal>
  );
};

export default CreateTagModal;