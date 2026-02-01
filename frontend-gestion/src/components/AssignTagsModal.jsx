import React, { useState, useEffect } from 'react';
import { Modal, Button, MultiSelect, Loader } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { getTags, assignTagsToDocument } from '../api/documentService';

const AssignTagsModal = ({ opened, onClose, onSuccess, document }) => {
  const [allTags, setAllTags] = useState([]); // Todas las etiquetas disponibles
  const [selectedTagIds, setSelectedTagIds] = useState([]); // Las etiquetas seleccionadas
  const [loading, setLoading] = useState(true);

  // 1. Cargar todas las etiquetas disponibles cuando se abre el modal
  useEffect(() => {
    if (opened) {
      setLoading(true);
      getTags()
        .then((data) => {
          // Formatear los datos para el MultiSelect
          const options = data.map(tag => ({
            value: tag.id.toString(), // El valor debe ser string
            label: tag.name,
          }));
          setAllTags(options);
          
          // 2. Pre-seleccionar las etiquetas que el documento ya tiene
          // 'document.tags' es una lista de IDs (ej. [1, 2])
          const currentTags = document.tags.map(id => id.toString());
          setSelectedTagIds(currentTags);
        })
        .catch(() => {
          notifications.show({ title: 'Error', message: 'No se pudieron cargar las etiquetas.', color: 'red' });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [opened, document]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Convertir de nuevo a números (IDs) para la API
      const tagIds = selectedTagIds.map(id => parseInt(id, 10));
      
      await assignTagsToDocument(document.id, tagIds);
      notifications.show({ title: 'Éxito', message: 'Etiquetas actualizadas.', color: 'green' });
      onSuccess(); // Llama a refetch y cierra
    } catch (err) {
      notifications.show({ title: 'Error', message: 'No se pudieron actualizar las etiquetas.', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={`Etiquetas para "${document?.name}"`} centered>
      {loading ? (
        <Loader />
      ) : (
        <MultiSelect
          label="Asignar etiquetas"
          placeholder="Selecciona etiquetas..."
          data={allTags}
          value={selectedTagIds}
          onChange={setSelectedTagIds}
          searchable
          clearable
          withinPortal
        />
      )}
      <Button onClick={handleSubmit} loading={loading} mt="lg" fullWidth>
        Guardar Etiquetas
      </Button>
    </Modal>
  );
};

export default AssignTagsModal;