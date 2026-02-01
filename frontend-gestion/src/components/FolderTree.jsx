import React, { useState, useEffect } from 'react';
// 1. Importar Collapse y el icono de chevron
import { NavLink, Loader, Text, Group, ActionIcon, Menu, Collapse } from '@mantine/core'; 
import { IconFolder, IconDotsVertical, IconPencil, IconTrash, IconChevronRight } from '@tabler/icons-react';
import { getFolders, deleteFolder } from '../api/documentService';
import { useAuth } from '../context/AuthContext';
import { notifications } from '@mantine/notifications';
import RenameFolderModal from './RenameFolderModal';

// --- Subcomponente RenderFolderNode (NUEVA VERSIÓN) ---
const RenderFolderNode = ({ node, onFolderSelect, selectedFolderId, onRefetch }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [renameModalOpened, setRenameModalOpened] = useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    setIsExpanded((prev) => !prev); // Simplemente cambia el estado de expansión
    onFolderSelect(node.id);
  };

  const handleDelete = async () => {
    if (window.confirm(`¿Seguro que quieres eliminar "${node.name}"? Esto es permanente.`)) {
      try {
        await deleteFolder(node.id);
        notifications.show({ title: 'Éxito', message: 'Carpeta eliminada.', color: 'green' });
        onRefetch(); // Recargar el árbol
      } catch (err) {
        notifications.show({ title: 'Error', message: 'No se pudo eliminar la carpeta.', color: 'red' });
      }
    }
  };
  
  const handleRenameSuccess = () => {
    setRenameModalOpened(false);
    onRefetch();
  };

  const stopPropagation = (e) => e.stopPropagation();
  
  // Comprobar si tiene hijos
  const hasChildren = node.subfolders && node.subfolders.length > 0;

  return (
    <>
      <Group justify="space-between" gap="xs" wrap="nowrap">
        {/* 2. El NavLink ya no tiene 'opened' y no envuelve a los hijos */}
        <NavLink
          key={node.id}
          label={node.name}
          leftSection={<IconFolder size="1rem" />}
          
          // 3. Añadimos NUESTRO PROPIO chevron como 'rightSection'
          rightSection={
            hasChildren ? (
              <IconChevronRight
                size={14}
                stroke={1.5}
                style={{
                  transform: isExpanded ? 'rotate(90deg)' : 'none',
                  transition: 'transform 200ms ease',
                }}
              />
            ) : null // No mostrar nada si no tiene hijos
          }
          
          onClick={handleClick}
          component="button"
          active={selectedFolderId === node.id}
          style={{ flexGrow: 1, overflow: 'hidden' }}
        />

        {/* 4. El Menú de 3 puntos (sin cambios) */}
        <Menu shadow="md" width={200} withinPortal>
          <Menu.Target>
            <ActionIcon variant="subtle" size="sm">
              <IconDotsVertical size={16} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item 
              leftSection={<IconPencil size={14} />}
              onClick={(e) => {
                e.stopPropagation(); 
                setRenameModalOpened(true);
              }}
            >
              Renombrar
            </Menu.Item>
            <Menu.Item 
              color="red" 
              leftSection={<IconTrash size={14} />}
              onClick={(e) => {
                e.stopPropagation(); 
                handleDelete();
              }}
            >
              Eliminar
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      {/* 5. Renderizar los hijos DENTRO DE UN <Collapse> */}
      {hasChildren && (
        <Collapse in={isExpanded}>
          {/* Añadimos padding para la indentación */}
          <div style={{ paddingLeft: '28px' }}> 
            {node.subfolders.map((childNode) => (
              <RenderFolderNode 
                key={childNode.id} 
                node={childNode} 
                onFolderSelect={onFolderSelect}
                selectedFolderId={selectedFolderId}
                onRefetch={onRefetch}
              />
            ))}
          </div>
        </Collapse>
      )}

      {/* Modal de renombrar (oculto) */}
      <RenameFolderModal 
        opened={renameModalOpened}
        onClose={() => setRenameModalOpened(false)}
        onSuccess={handleRenameSuccess}
        folder={node}
      />
    </>
  );
};

// --- Componente Principal FolderTree (Sin cambios) ---
const FolderTree = ({ onFolderSelect, refetchTrigger, onRefetch }) => {
  
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { loading: authLoading, selectedFolderId } = useAuth();
  
  useEffect(() => {
    const loadFolders = async () => {
      try {
        setLoading(true);
        const data = await getFolders();
        setFolders(data);
      } catch (err) {
        setError('No se pudieron cargar las carpetas.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (authLoading) return;
    loadFolders();
  }, [authLoading, refetchTrigger]); 

  if (authLoading || loading) return <Loader size="xs" />;
  if (error) return <Text c="red" size="sm">{error}</Text>;
  if (folders.length === 0) return <Text size="sm">No tienes carpetas.</Text>;

  return (
    <>
      <NavLink
        label="Todos los Documentos"
        leftSection={<IconFolder size="1rem" />}
        onClick={() => onFolderSelect(null)}
        component="button"
        variant="filled"
        active={selectedFolderId === null} 
      />

      {folders.map((rootNode) => (
        <RenderFolderNode 
          key={rootNode.id} 
          node={rootNode} 
          onFolderSelect={onFolderSelect} 
          selectedFolderId={selectedFolderId}
          onRefetch={onRefetch}
        />
      ))}
    </>
  );
};

export default FolderTree;