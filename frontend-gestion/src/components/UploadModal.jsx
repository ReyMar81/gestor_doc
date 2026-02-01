import React, { useState, useEffect } from 'react';
import { Modal, Group, Button, Text, Loader, Center, Select } from '@mantine/core';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import { IconUpload, IconX, IconFile, IconFolder } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { uploadDocument, getAllFoldersFlat } from '../api/documentService';

const UploadModal = ({ opened, onClose, onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);

  // Cargar carpetas cuando se abre el modal
  useEffect(() => {
    if (opened) {
      console.log("Modal abierto, cargando carpetas..."); // <-- LOGGING
      const loadFolders = async () => {
        try {
          const data = await getAllFoldersFlat();
          console.log("Carpetas recibidas:", data); // <-- LOGGING
          const folderOptions = data.map(folder => ({
            value: folder.id.toString(),
            label: folder.name,
          }));
          setFolders(folderOptions);
        } catch (err) {
          console.error("No se pudo cargar la lista de carpetas", err); // <-- LOGGING
          // Notificar al usuario si la lista de carpetas falla
          notifications.show({
            title: 'Error de Red',
            message: 'No se pudo cargar la lista de carpetas. Los archivos se subirán a la raíz.',
            color: 'red',
          });
        }
      };
      loadFolders();
    } else {
      // Si el modal se cierra, reseteamos la lista
      setFolders([]);
      setSelectedFolder(null);
    }
  }, [opened]); // Se ejecuta cada vez que 'opened' cambia

  const handleDrop = async (files) => {
    const file = files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadDocument(file, selectedFolder);
      notifications.show({
        title: 'Éxito',
        message: 'El documento se ha subido correctamente.',
        color: 'green',
      });
      onUploadSuccess(); 

    } catch (err) {
      notifications.show({
        title: 'Error al subir',
        message: 'No se pudo subir el archivo. Inténtalo de nuevo.',
        color: 'red',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Subir Nuevo Documento"
      centered
      size="lg"
    >
      {isUploading ? (
        <Center style={{ minHeight: 200 }}>
          <Loader />
          <Text ml="md">Subiendo documento...</Text>
        </Center>
      ) : (
        <>
          {/* Dropdown de Carpetas */}
          <Select
            label="Elegir carpeta (Opcional)"
            placeholder="Subir a la raíz"
            data={folders}
            value={selectedFolder}
            onChange={setSelectedFolder}
            leftSection={<IconFolder size={16} />}
            clearable
            mb="md"
            withinPortal // Importante para que el dropdown se vea
          />
        
          {/* --- ¡SINTAXIS CORREGIDA! --- */}
          {/* Quitamos el wrapper '{(status) => ...}' que rompía el componente */}
          <Dropzone
            onDrop={handleDrop}
            onReject={(files) => console.log('Archivos rechazados:', files)}
            maxSize={5 * 1024 ** 2}
            accept={[MIME_TYPES.pdf, MIME_TYPES.doc, MIME_TYPES.docx, MIME_TYPES.txt]}
            multiple={false}
          >
            {/* Ponemos el Group directamente adentro, como en la versión que sí funcionaba */}
            <Group justify="center" gap="xl" 
               style={{ minHeight: 180, pointerEvents: 'none' }}
            >
              <Dropzone.Accept>
                <IconUpload size={50} stroke={1.5} />
              </Dropzone.Accept>
              <Dropzone.Reject>
                <IconX size={50} stroke={1.5} />
              </Dropzone.Reject>
              <Dropzone.Idle>
                <IconFile size={50} stroke={1.5} />
              </Dropzone.Idle>

              <div>
                <Text size="xl" inline>
                  Arrastra tu documento aquí o haz clic
                </Text>
                <Text size="sm" c="dimmed" inline mt={7}>
                  (PDF, DOCX, TXT... máx 5MB)
                </Text>
              </div>
            </Group>
          </Dropzone>
        </>
      )}

      <Button fullWidth onClick={onClose} mt="md" variant="default" disabled={isUploading}>
        Cancelar
      </Button>
    </Modal>
  );
};

export default UploadModal;