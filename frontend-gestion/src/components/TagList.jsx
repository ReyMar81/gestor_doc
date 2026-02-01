import React, { useState, useEffect } from 'react';
// 1. Importar Menu, ActionIcon, y los nuevos iconos
import { Chip, Group, Loader, Text, Menu, ActionIcon } from '@mantine/core';
import { IconDotsVertical, IconPencil, IconTrash } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
// 2. Importar 'deleteTag'
import { getTags, deleteTag } from '../api/documentService';
import { notifications } from '@mantine/notifications';
// 3. Importar el modal de renombrar
import RenameTagModal from './RenameTagModal';

// Aceptar 'onRefetch'
const TagList = ({ refetchTrigger, onRefetch }) => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { loading: authLoading, selectedTagId, setSelectedTagId } = useAuth();
  
  // 4. Estado para el modal de renombrar
  // Guardamos LA ETIQUETA que se está editando
  const [editingTag, setEditingTag] = useState(null); 

  useEffect(() => {
    // ... (tu useEffect para cargar etiquetas está perfecto)
    const loadTags = async () => {
      try {
        setLoading(true);
        const data = await getTags();
        setTags(data);
      } catch (err) {
        setError('No se pudieron cargar las etiquetas.');
      } finally {
        setLoading(false);
      }
    };
    if (authLoading) return;
    loadTags();
  }, [authLoading, refetchTrigger]); 

  // 5. Función de eliminar
  const handleDelete = async (tag) => {
    if (window.confirm(`¿Seguro que quieres eliminar la etiqueta "${tag.name}"?`)) {
      try {
        await deleteTag(tag.id);
        notifications.show({ title: 'Éxito', message: 'Etiqueta eliminada.', color: 'green' });
        // Si eliminamos la etiqueta que estaba seleccionada, reseteamos el filtro
        if (selectedTagId === tag.id) {
          setSelectedTagId(null);
        }
        onRefetch(); // Recargar la lista
      } catch (err) {
        notifications.show({ title: 'Error', message: 'No se pudo eliminar la etiqueta.', color: 'red' });
      }
    }
  };

  // 6. Función de éxito para el modal de renombrar
  const handleRenameSuccess = () => {
    setEditingTag(null); // Cierra el modal
    onRefetch(); // Recarga la lista
  };

  if (authLoading || loading) return <Loader size="xs" />;
  if (error) return <Text c="red" size="sm">{error}</Text>;
  if (tags.length === 0) return <Text size="sm">No tienes etiquetas.</Text>;

  return (
    <>
      <Group gap="xs" style={{ userSelect: 'none' }}>
        {/* Botón "Todas" */}
        <Chip
          checked={selectedTagId === null}
          onChange={() => setSelectedTagId(null)}
          variant="filled"
        >
          Todas
        </Chip>
        
        {/* 7. Mapear las etiquetas en un nuevo componente de Grupo */}
        {tags.map((tag) => (
          <Group 
            key={tag.id} 
            gap={4} 
            wrap="nowrap" 
            onClick={() => setSelectedTagId(tag.id)}
            style={{ 
              paddingLeft: '12px',
              paddingRight: '4px',
              borderRadius: '16px',
              border: '1px solid var(--mantine-color-dark-4)',
              cursor: 'pointer',
              // Resaltar si está activo
              backgroundColor: selectedTagId === tag.id ? 'var(--mantine-color-blue-8)' : 'transparent'
            }}
          >
            {/* El nombre de la etiqueta */}
            <Text size="sm" style={{ whiteSpace: 'nowrap' }}>{tag.name}</Text>
            
            {/* 8. El Menú de "..." */}
            <Menu shadow="md" width={200} withinPortal>
              <Menu.Target>
                {/* 9. Detener la propagación del clic */}
                <ActionIcon 
                  variant="subtle" 
                  size="sm" 
                  radius="xl"
                  onClick={(e) => e.stopPropagation()} 
                >
                  <IconDotsVertical size={14} />
                </ActionIcon>
              </Menu.Target>
              
              <Menu.Dropdown>
                <Menu.Label>Acciones</Menu.Label>
                
                {/* 10. Botón de Renombrar (Editar) */}
                <Menu.Item 
                  leftSection={<IconPencil size={14} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingTag(tag);
                  }}
                >
                  Renombrar
                </Menu.Item>
                
                {/* 11. Botón de Eliminar */}
                <Menu.Item 
                  color="red" 
                  leftSection={<IconTrash size={14} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(tag);
                  }}
                >
                  Eliminar
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        ))}
      </Group>

      {/* 12. El modal de renombrar (oculto) */}
      <RenameTagModal 
        opened={!!editingTag} // El modal se abre si 'editingTag' no es null
        onClose={() => setEditingTag(null)}
        onSuccess={handleRenameSuccess}
        tag={editingTag} // Pasamos la etiqueta que se está editando
      />
    </>
  );
};

export default TagList;