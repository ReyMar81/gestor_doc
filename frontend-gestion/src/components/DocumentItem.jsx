import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// 1. Importar 'Box' y 'Stack' para la nueva estructura
import { Paper, Text, Group, ActionIcon, Loader, Anchor, Badge, Box, Stack } from '@mantine/core'; 
import { IconFileText, IconDownload, IconTrash, IconShare, IconTag, IconLanguage, IconClock } from '@tabler/icons-react'; 
import { notifications } from '@mantine/notifications';
import { deleteDocument, downloadDocument } from '../api/documentService'; 
import ShareModal from './ShareModal';
// 2. Corregir el path (si es necesario, basado en tu código)
import AssignTagsModal from './AssignTagsModal'; 
import TranslateModal from './TranslateModal';

/**
 * Insignia para PROPIETARIO, EDITOR, LECTOR
 */
const getPermissionBadge = (level) => {
  let color = 'gray';
  let text = level;

  if (level === 'PROPIETARIO') {
    // 3. Usar 'violet' como en tu código
    color = 'violet'; 
    text = 'PROPIETARIO';
  } else if (level === 'EDITOR') {
    color = 'green';
    text = 'EDITOR';
  } else if (level === 'LECTOR') {
    color = 'gray';
    text = 'LECTOR';
  } else {
    return null;
  }
  return <Badge variant="light" color={color} size="sm">{text}</Badge>;
};

/**
 * Insignia para COMPARTIDO (si eres el propietario)
 */
const getSharedBadge = (isShared) => {
  if (!isShared) {
    return null;
  }
  
  return (
    <Badge 
      variant="filled" 
      // 4. Usar 'teal' como en tu código
      color="teal" 
      size="sm" 
      leftSection={<IconShare size={12} />}
    >
      COMPARTIDO
    </Badge>
  );
};

// Función para formatear fechas
const formatDate = (isoString) => {
  if (!isoString) return '---';
  try {
    return new Date(isoString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return isoString;
  }
};


const DocumentItem = ({ document, onDeleteSuccess }) => {
  const [shareModalOpened, setShareModalOpened] = useState(false);
  const [tagModalOpened, setTagModalOpened] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); 
  const [isDownloading, setIsDownloading] = useState(false);
  const [translateModalOpened, setTranslateModalOpened] = useState(false);
  
  const getFilename = (url) => {
    if (!url) return 'Documento';
    return url.split('/').pop(); 
  };
  const filename = getFilename(document.file);

  const handleDownload = async () => {
    const userConfirmed = window.confirm(
      "¿Deseas descargar el archivo ?"
    );

    if (!userConfirmed) {
      return; 
    }

    setIsDownloading(true);
    try {
      await downloadDocument(document.id, filename);
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: 'No se pudo descargar el documento.',
        color: 'red',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar "${filename}"?`)) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteDocument(document.id);
      notifications.show({
        title: 'Éxito',
        message: 'Documento eliminado correctamente.',
        color: 'green',
      });
      onDeleteSuccess();
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: 'No se pudo eliminar el documento.',
        color: 'red',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = () => {
    setShareModalOpened(true);
  };

  const handleTagSuccess = () => {
    setTagModalOpened(false);
    onDeleteSuccess(); 
  };

  return (
    <>
      {/* 5. Usar Stack para apilar las filas verticalmente */}
      <Paper withBorder p="md" radius="md">
        <Stack gap="sm"> {/* Usamos 'sm' (small) para el espacio entre filas */}
        
          {/* --- FILA 1: Nombre y Badges --- */}
          <Group justify="space-between" align="flex-start">
            <Group gap="xs">
              <IconFileText size={20} />
              <Anchor component={Link} to={`/documento/${document.id}`} size="sm" fw={500}>
                {filename}
              </Anchor>
              {getPermissionBadge(document.permission_level)}
              {getSharedBadge(document.is_shared)}
            </Group>
          </Group>

          {/* --- FILA 2: Iconos de Acción --- */}
          <Group justify="space-between">
            {/* Lado izquierdo vacío para alinear con la fila 3 */}
            <Box w={20} /> 
            
            <Group gap="xs">
              {isDeleting || isDownloading ? (
                <Loader size={16} />
              ) : (
                <>
                  <ActionIcon variant="light" size="sm" onClick={() => setTranslateModalOpened(true)}>
                    <IconLanguage size={16} />
                  </ActionIcon>
                  <ActionIcon variant="light" size="sm" onClick={() => setTagModalOpened(true)}>
                    <IconTag size={16} />
                  </ActionIcon>
                  <ActionIcon variant="light" size="sm" onClick={handleShare}>
                    <IconShare size={16} />
                  </ActionIcon>
                  <ActionIcon variant="light" size="sm" onClick={handleDownload}>
                    <IconDownload size={16} />
                  </ActionIcon>
                  <ActionIcon variant="light" color="red" size="sm" onClick={handleDelete}>
                    <IconTrash size={16} />
                  </ActionIcon>
                </>
              )}
            </Group>
          </Group>

          {/* --- FILA 3: Fechas (Debajo de las acciones) --- */}
          <Group gap="xs" ml={2}> {/* ml={2} para alinear con el icono de archivo */}
            <IconClock size={14} style={{ color: 'var(--mantine-color-dimmed)' }} />
            <Text size="xs" c="dimmed">
              Modificado: {formatDate(document.modified_at)}
            </Text>
            <Text size="xs" c="dimmed" ml="xs">
              Subido: {formatDate(document.uploaded_at)}
            </Text>
          </Group>

        </Stack>
      </Paper>

      {/* --- Modales --- */}
      <ShareModal
        opened={shareModalOpened}
        onClose={() => setShareModalOpened(false)}
        documentName={filename}
        documentId={document.id}
      />
      <AssignTagsModal
        opened={tagModalOpened}
        onClose={() => setTagModalOpened(false)}
        onSuccess={handleTagSuccess}
        document={document}
      />
      <TranslateModal
        opened={translateModalOpened}
        onClose={() => setTranslateModalOpened(false)}
        document={{...document, name: filename}}
      />
    </>
  );
};

export default DocumentItem;