import React, { useState, useEffect } from 'react';
import { Modal, Button, TextInput, Select } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { createFolder, getAllFoldersFlat } from '../api/documentService';

const CreateFolderModal = ({ opened, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [folders, setFolders] = useState([]);

  // Cargar lista de carpetas para el dropdown de "padre"
  useEffect(() => {
    if (opened) {
      const loadFolders = async () => {
        const data = await getAllFoldersFlat();
        const options = data.map(f => ({ value: f.id.toString(), label: f.name }));
        setFolders(options);
      };
      loadFolders();
    } else {
      // Limpiar el formulario cuando se cierra
      setName('');
      setParentId(null);
    }
  }, [opened]);

  const handleSubmit = async () => {
    if (!name) {
      notifications.show({ title: 'Error', message: 'El nombre es requerido.', color: 'red' });
      return;
    }
    setLoading(true);
    try {
      await createFolder(name, parentId);
      notifications.show({ title: 'Éxito', message: 'Carpeta creada.', color: 'green' });
      onSuccess(); // Llama a la función de refetch y cierra
    } catch (err) {
      notifications.show({ title: 'Error', message: 'No se pudo crear la carpeta.', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Crear Nueva Carpeta" centered>
      <TextInput
        label="Nombre de la Carpeta"
        placeholder="Ej: Contratos"
        value={name}
        onChange={(e) => setName(e.currentTarget.value)}
        required
      />
      <Select
        label="Carpeta Padre (Opcional)"
        placeholder="Raíz"
        data={folders}
        value={parentId}
        onChange={setParentId}
        clearable
        mt="md"
        withinPortal
      />
      <Button onClick={handleSubmit} loading={loading} mt="lg" fullWidth>
        Crear Carpeta
      </Button>
    </Modal>
  );
};

export default CreateFolderModal;