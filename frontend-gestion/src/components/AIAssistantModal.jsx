import React, { useState, useRef, useEffect } from 'react';
import { Textarea, Button, Loader, Alert, Stack, Text, ActionIcon, Tooltip, Badge, Group, Paper } from '@mantine/core';
import { IconSparkles, IconCheck, IconAlertCircle, IconX, IconMinus, IconMaximize, IconMinimize, IconArrowsMove } from '@tabler/icons-react';
import { sendAIPrompt } from '../api/aiService';

const AIAssistantModal = ({ opened, onClose, onSuccess }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth / 2 - 350, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState([]);
  
  const modalRef = useRef(null);



  useEffect(() => {
    if (!opened) {
      setIsMinimized(false);
      setIsMaximized(false);
    }
  }, [opened]);

  const handleMouseDown = (e) => {
    if (e.target.closest('.drag-handle')) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && !isMaximized) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      alert('Por favor escribe un comando');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const data = await sendAIPrompt(prompt);
      
      setResult({
        success: data.success,
        message: data.message
      });
      
      setHistory([{ 
        prompt, 
        result: data.message, 
        timestamp: new Date() 
      }, ...history]);
      
      if (data.success) {
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 1500);
      }
      
    } catch (error) {
      setResult({
        success: false,
        message: error.response?.data?.error || error.message || 'Error al procesar el comando'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPrompt('');
    setResult(null);
    onClose();
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  if (!opened) return null;

  const modalStyle = isMaximized 
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999
      }
    : {
        position: 'fixed',
        top: position.y,
        left: position.x,
        width: isMinimized ? '400px' : '700px',
        zIndex: 9999
      };

  return (
    <>
      {/* Overlay semi-transparente - SOLO cuando NO está minimizado */}
      {!isMinimized && !isMaximized && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            zIndex: 9998,
            backdropFilter: 'blur(2px)'
          }}
          onClick={handleClose}
        />
      )}
      
      {/* Overlay para modo maximizado */}
      {isMaximized && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9998
          }}
        />
      )}

      {/* Modal */}
      <Paper
        ref={modalRef}
        shadow="xl"
        style={{
          ...modalStyle,
          transition: 'all 0.2s ease',
          cursor: isDragging ? 'grabbing' : 'default'
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Header con controles */}
        <div
          className="drag-handle"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '12px 16px',
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            cursor: 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: 'white'
          }}
        >
          <Group gap="xs">
            <IconSparkles size={20} />
            <Text fw={600} size="md">Asistente IA</Text>
            {loading && <Loader size="xs" color="white" />}
          </Group>

          <Group gap={4}>
            <Tooltip label="Minimizar">
              <ActionIcon
                variant="subtle"
                color="white"
                onClick={(e) => { e.stopPropagation(); toggleMinimize(); }}
              >
                <IconMinus size={16} />
              </ActionIcon>
            </Tooltip>
            
            <Tooltip label={isMaximized ? "Restaurar" : "Maximizar"}>
              <ActionIcon
                variant="subtle"
                color="white"
                onClick={(e) => { e.stopPropagation(); toggleMaximize(); }}
              >
                {isMaximized ? <IconMinimize size={16} /> : <IconMaximize size={16} />}
              </ActionIcon>
            </Tooltip>

            <Tooltip label="Cerrar">
              <ActionIcon
                variant="subtle"
                color="white"
                onClick={(e) => { e.stopPropagation(); handleClose(); }}
              >
                <IconX size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </div>

        {/* Contenido */}
        {!isMinimized && (
          <div style={{ padding: '20px', maxHeight: isMaximized ? 'calc(100vh - 60px)' : '600px', overflowY: 'auto' }}>
            <Stack gap="md">
              {/* Descripción */}
              <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: 8, borderLeft: '4px solid #667eea' }}>
                <Text size="sm" fw={500} mb={8}>💡 Escribe un comando y la IA lo ejecutará</Text>
                <Text size="xs" c="dimmed" style={{ lineHeight: 1.6 }}>
                  • "Etiqueta el documento X según su contenido"<br />
                  • "Etiqueta todos mis documentos automáticamente"<br />                  
                  • "Resume el documento Z y guárdalo en la carpeta resúmenes" ó "Resume el documento Z"<br />
                  • "Traduce el documento W a español"<br />
                  • "Comparte el documento X con el usuario [nombre] con permiso de edición" <br />
                  • "Crea un mapa conceptual del documento nombre_del_documento.pdf/docx" <br />
                  • "Modifica la etiqueta SW1 y llámala Software 1" <br />
                  • "Elimina la etiqueta Tutorial Python" <br />
                  • "elimina el documento ia_gemini.docx" <br />
                  • "elimina todos los documentos" <br />
                  • "elimina todos los tags (etiquetas)"
                </Text>
              </div>
              

              {/* Área de texto */}
              <Textarea
                placeholder="Escribe tu comando aquí... Ej: 'Etiqueta todos mis documentos de Python con la etiqueta Programación'"
                value={prompt}
                onChange={(e) => setPrompt(e.currentTarget.value)}
                minRows={4}
                maxRows={8}
                disabled={loading}
                autoFocus
                styles={{
                  input: {
                    fontSize: 14,
                    borderColor: '#667eea',
                    '&:focus': {
                      borderColor: '#764ba2',
                      boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                    }
                  }
                }}
              />

              {/* Resultado */}
              {result && (
                <Alert
                  icon={result.success ? <IconCheck size={16} /> : <IconAlertCircle size={16} />}
                  title={result.success ? "✓ Completado" : "⚠ Error"}
                  color={result.success ? "green" : "red"}
                  styles={{
                    root: {
                      animation: 'slideIn 0.3s ease'
                    }
                  }}
                >
                  {result.message}
                </Alert>
              )}

              {/* Botón de acción */}
              <Button
                onClick={handleSubmit}
                loading={loading}
                leftSection={<IconSparkles size={18} />}
                fullWidth
                size="md"
                gradient={{ from: 'violet', to: 'blue', deg: 90 }}
                variant="gradient"
                disabled={!prompt.trim()}
              >
                {loading ? 'Procesando...' : 'Procesar con IA'}
              </Button>

              {/* Historial reciente */}
              {history.length > 0 && (
                <div>
                  <Text size="sm" fw={500} mb={8}>📜 Historial reciente:</Text>
                  <Stack gap="xs">
                    {history.slice(0, 3).map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: '#f8f9fa',
                          padding: '8px 12px',
                          borderRadius: 6,
                          fontSize: 12
                        }}
                      >
                        <Text size="xs" fw={500} c="dimmed">{item.prompt}</Text>
                        <Text size="xs" c="green" mt={4}>{item.result}</Text>
                      </div>
                    ))}
                  </Stack>
                </div>
              )}
            </Stack>
          </div>
        )}

        <style>{`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </Paper>
    </>
  );
};

export default AIAssistantModal;