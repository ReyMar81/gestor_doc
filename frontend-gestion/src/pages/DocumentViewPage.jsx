import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Title, Textarea, Button, Loader, Center, Paper, Group, Anchor, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { getDocuments, downloadDocument } from '../api/documentService';
import { IconArrowLeft, IconDeviceFloppy, IconDownload } from '@tabler/icons-react';
import apiClient from '../api/axiosConfig';

const DocumentViewPage = () => {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        setLoading(true);
        // Obtener el documento desde la API
        const response = await apiClient.get(`/documents/${id}/`);
        const data = response.data;
        
        setDocument(data);
        setContent(data.extracted_content || 'No se pudo extraer contenido de este archivo.');
      } catch (err) {
        notifications.show({ title: 'Error', message: 'No se pudo cargar el documento.', color: 'red' });
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.patch(`/documents/${id}/`, {
        extracted_content: content
      });
      notifications.show({ title: 'Éxito', message: 'Contenido guardado.', color: 'green' });
    } catch (err) {
      notifications.show({ title: 'Error', message: 'No se pudo guardar el contenido.', color: 'red' });
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadContent = async () => {
    setDownloading(true);
    try {
      const originalName = document?.file?.split('/').pop() || 'documento';
      await downloadDocument(document.id, originalName);
      
      notifications.show({
        title: 'Éxito',
        message: 'Documento descargado correctamente.',
        color: 'green',
      });
    } catch (err) {
      console.error("Error al descargar:", err);
      notifications.show({
        title: 'Error',
        message: 'No se pudo descargar el archivo.',
        color: 'red',
      });
    } finally {
      setDownloading(false);
    }
  };

  // Función para obtener la extensión del archivo original
  const getFileExtension = () => {
    if (!document?.file) return 'archivo';
    const filename = document.file.split('/').pop();
    const ext = filename.split('.').pop().toUpperCase();
    return ext;
  };

  if (loading) {
    return <Center style={{ height: '80vh' }}><Loader /></Center>;
  }

  const fileExtension = getFileExtension();

  return (
    <Container size="md">
      <Group justify="space-between" mb="md">
        <Anchor component={Link} to="/" size="sm">
          <Group gap="xs">
            <IconArrowLeft size={14} />
            Volver a Mis Documentos
          </Group>
        </Anchor>
      </Group>

      <Paper withBorder shadow="md" p={30} radius="md">
        <Group justify="space-between" align="center" mb="lg">
          <Title order={2}>{document?.file?.split('/').pop() || 'Documento'}</Title>
          <Text size="sm" c="dimmed">Formato original: {fileExtension}</Text>
        </Group>
        
        <Textarea
          label="Contenido del Documento"
          description="Puedes editar el contenido y guardarlo. Al descargar, se generará en el formato original."
          value={content}
          onChange={(e) => setContent(e.currentTarget.value)}
          minRows={15}
          autosize
        />

        <Group grow mt="xl">
          <Button 
            onClick={handleDownloadContent}
            variant="light"
            leftSection={<IconDownload size={18} />}
            loading={downloading}
            disabled={saving}
          >
            Descargar como {fileExtension}
          </Button>
          <Button 
            onClick={handleSave} 
            loading={saving} 
            leftSection={<IconDeviceFloppy size={18} />}
            disabled={downloading}
          >
            Guardar Cambios
          </Button>
        </Group>
      </Paper>
    </Container>
  );
};

export default DocumentViewPage;