import React, { useState } from 'react';
import { Modal, Button, Select, Loader, Textarea, Text, Group } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { translateDocument, updateDocumentContent } from '../api/documentService';
import { IconDownload, IconDeviceFloppy } from '@tabler/icons-react';

// Lista de idiomas (puedes expandirla)
const languages = [
  { value: 'en', label: 'Inglés' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Francés' },
  { value: 'de', label: 'Alemán' },
  { value: 'pt', label: 'Portugués' },
];

const TranslateModal = ({ opened, onClose, document }) => {
  const [targetLanguage, setTargetLanguage] = useState('en'); // 'en' por defecto
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleTranslate = async () => {
    if (!document) return;
    
    setLoading(true);
    setTranslatedText(''); // Limpiar traducción anterior
    try {
      const result = await translateDocument(document.id, targetLanguage);
      setTranslatedText(result.translated_text);
      notifications.show({
        title: 'Traducción Completa',
        message: `Traducido de ${result.detected_source_language} a ${targetLanguage}.`,
        color: 'green',
      });
    } catch (err) {
      const message = err.response?.data?.error || 'No se pudo traducir el documento.';
      notifications.show({
        title: 'Error de Traducción',
        message: message,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTranslation = async () => {
    setIsSaving(true);
    try {
      // Llamamos a la función que ya existe en el documentService
      await updateDocumentContent(document.id, translatedText);
      notifications.show({ 
        title: 'Éxito', 
        message: 'Traducción guardada como el contenido principal del documento.', 
        color: 'green' 
      });
      onClose(); // Cerrar el modal después de guardar
    } catch (err) {
      notifications.show({ title: 'Error', message: 'No se pudo guardar la traducción.', color: 'red' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadTranslation = () => {
  const element = document.createElement("a");
  const file = new Blob([translatedText], {type: 'text/plain;charset=utf-8'});
  element.href = URL.createObjectURL(file);

  // Obtener el nombre original y añadirle el sufijo
  const originalName = document?.name || 'documento';
  const baseName = originalName.substring(0, originalName.lastIndexOf('.'));
  element.download = `${baseName}_${targetLanguage}.txt`;

  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

  // Limpiar estado cuando se cierra el modal
  const handleClose = () => {
    setTranslatedText('');
    setLoading(false);
    setIsSaving(false);
    onClose();
  };

  return (
    <Modal 
      opened={opened} 
      onClose={handleClose} 
      title={`Traducir "${document?.name || 'Documento'}"`}
      centered
      size="lg"
    >
      <Select
        label="Traducir a:"
        placeholder="Selecciona un idioma"
        data={languages}
        value={targetLanguage}
        onChange={setTargetLanguage}
        disabled={loading || isSaving} // <-- DESHABILITAR
      />
      
      <Button onClick={handleTranslate} loading={loading} mt="md" fullWidth disabled={isSaving}>
        Traducir
      </Button>

      {translatedText && (
        <>
          <Textarea
            label="Resultado de la Traducción:"
            value={translatedText}
            readOnly
            mt="md"
            minRows={10}
            autosize
          />
          
          {/* --- MODIFICAR ESTA SECCIÓN --- */}
          <Group grow mt="sm">
            <Button 
              onClick={handleDownloadTranslation} 
              variant="light"
              leftSection={<IconDownload size={18} />}
              disabled={isSaving} // <-- DESHABILITAR
            >
              Descargar
            </Button>
            <Button 
              onClick={handleSaveTranslation}
              loading={isSaving}
              leftSection={<IconDeviceFloppy size={18} />}
              color="blue" // <-- Color primario para la acción principal
            >
              Guardar Traducción
            </Button>
          </Group>
          {/* --- FIN DE LA MODIFICACIÓN --- */}
        </>
      )}
    </Modal>
  );
};

export default TranslateModal;