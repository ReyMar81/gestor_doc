import { ActionIcon, Avatar, Badge, Box, Group, Paper, ScrollArea, Text, TextInput, Transition } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { IconCheck, IconCopy, IconMessageChatbot, IconMicrophone, IconMicrophoneOff, IconMinus, IconSend, IconVolume, IconX } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import { getProfile } from '../api/authService';
import WebSocketInstance from '../api/socketService';
import { useAuth } from '../context/AuthContext';
import useSpeechRecognition from '../hooks/useSpeechRecognition';

const ChatWindow = ({ roomName, onClose, position = 0 }) => { 
  const [opened, setOpened] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [myLanguage, setMyLanguage] = useState('es'); 
  
  const viewport = useRef(null);
  const { user } = useAuth();
  const clipboard = useClipboard({ timeout: 2000 });

  const { isListening, transcript, startListening, stopListening, hasSupport } = useSpeechRecognition();

  // Obtener idioma preferido del usuario para la voz
  useEffect(() => {
    const fetchLanguage = async () => {
      try {
        const profile = await getProfile();
        const langMap = {
            'en': 'en-US',
            'es': 'es-ES',
            'fr': 'fr-FR',
            'de': 'de-DE',
            'pt': 'pt-BR'
        };
        setMyLanguage(langMap[profile.language_preference] || 'es-ES');
      } catch (error) {
        console.error("No se pudo obtener idioma", error);
      }
    };
    fetchLanguage();
  }, []);

  useEffect(() => {
    if (transcript) {
      setInputValue((prev) => {
        const spacer = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
        return prev + spacer + transcript;
      });
    }
  }, [transcript]);

  // FunciÃ³n para leer texto (Solo manual ahora)
  const speakMessage = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = myLanguage; 
    utterance.rate = 1.0; 
    window.speechSynthesis.speak(utterance);
  };

  // ConexiÃ³n WebSocket
  useEffect(() => {
    if (roomName) {
      setOpened(true);
      WebSocketInstance.connect(roomName);
      
      WebSocketInstance.addCallbacks((data) => {
        setMessages((prev) => [...prev, data]);
        
      });
    }
    
    return () => {
      WebSocketInstance.disconnect();
      if (isListening) stopListening();
      window.speechSynthesis.cancel();
    };
  }, [roomName]); 

  useEffect(() => {
    viewport.current?.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;
    const messageData = { message: inputValue };
    WebSocketInstance.sendMessage(messageData);
    setInputValue('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  const handleClose = () => {
    setOpened(false);
    setTimeout(() => { if (onClose) onClose(); }, 300);
  };

  return (
    <>
      {/* Vista minimizada - Globo estilo Facebook */}
      {minimized && (
        <Box
          onClick={() => setMinimized(false)}
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20 + (position * 80), // Posicionamiento dinámico
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #7950f2 0%, #9775fa 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 1002,
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <IconMessageChatbot size={30} color="white" />
          {messages.length > 0 && (
            <Badge
              color="red"
              variant="filled"
              size="sm"
              style={{
                position: 'absolute',
                top: -5,
                right: -5,
                minWidth: 20,
                height: 20,
                borderRadius: '50%',
                padding: '0 5px',
              }}
            >
              {messages.length}
            </Badge>
          )}
        </Box>
      )}

      {/* Vista completa */}
      <Transition transition="slide-up" mounted={opened && !minimized}>
        {(styles) => (
          <Paper
            shadow="xl"
            radius="lg"
            style={{
              ...styles,
              position: 'fixed', bottom: 20, right: 20, width: 350, height: 500,
              zIndex: 1001, display: 'flex', flexDirection: 'column',
              overflow: 'hidden', border: '1px solid #eee'
            }}
          >
            {/* Cabecera */}
            <Group justify="space-between" p="md" bg="violet" c="white">
              <Group gap="xs">
                <IconMessageChatbot />
                <Box>
                  <Text fw={700} size="sm" style={{ lineHeight: 1.2 }}>Sala: {roomName}</Text>
                  <Group gap={4} style={{ cursor: 'pointer', opacity: 0.9 }} onClick={() => clipboard.copy(roomName)}>
                    <Text size="xs" c="gray.2">{clipboard.copied ? '¡Copiado!' : 'Copiar codigo'}</Text>
                    {clipboard.copied ? <IconCheck size={12}/> : <IconCopy size={12}/>}
                  </Group>
                </Box>
              </Group>
              <Group gap="xs">
                <ActionIcon variant="transparent" c="white" onClick={() => setMinimized(true)} title="Minimizar">
                  <IconMinus />
                </ActionIcon>
                <ActionIcon variant="transparent" c="white" onClick={handleClose} title="Cerrar">
                  <IconX />
                </ActionIcon>
              </Group>
            </Group>

          {/* Ãrea de Mensajes */}
          <ScrollArea viewportRef={viewport} style={{ flex: 1, padding: '15px' }} bg="gray.0">
            {messages.length === 0 && (
              <Text c="dimmed" size="sm" ta="center" mt="xl">
                Sala lista. Comparte el codigo <b>{roomName}</b>.
              </Text>
            )}
            
            {messages.map((msg, index) => {
              const isMe = msg.username === user?.username;
              return (
                <Box key={index} mb="sm" style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                  {!isMe && (
                    <Avatar size="sm" radius="xl" color="blue" mr="xs">
                      {msg.username?.[0]?.toUpperCase()}
                    </Avatar>
                  )}
                  <Box
                    bg={isMe ? 'violet' : 'white'}
                    c={isMe ? 'white' : 'black'}
                    style={{
                      maxWidth: '80%', padding: '8px 12px', borderRadius: '12px',
                      borderBottomRightRadius: isMe ? 0 : 12, borderBottomLeftRadius: !isMe ? 0 : 12,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}
                  >
                    {!isMe && (
                      <Group justify="space-between" mb={2}>
                          <Text size="xs" c="dimmed">{msg.username}</Text>
                          {/* BotÃ³n para escuchar MANUALMENTE */}
                          <ActionIcon size="xs" variant="transparent" color="blue" onClick={() => speakMessage(msg.message)}>
                            <IconVolume size={14} />
                          </ActionIcon>
                      </Group>
                    )}
                    <Text size="sm">{msg.message}</Text>
                  </Box>
                </Box>
              );
            })}
          </ScrollArea>

          {/* Input Area */}
          <Box p="md" style={{ borderTop: '1px solid #eee' }}>
            <Group gap="xs">
              {hasSupport && (
                <ActionIcon
                  variant={isListening ? "filled" : "light"} 
                  color={isListening ? "red" : "gray"}
                  size="lg"
                  onClick={isListening ? stopListening : startListening}
                  style={isListening ? { animation: 'pulse 2s infinite' } : {}}
                >
                  {isListening ? <IconMicrophoneOff size={18} /> : <IconMicrophone size={18} />}
                </ActionIcon>
              )}
              <TextInput 
                placeholder={isListening ? "Escuchando..." : "Escribe..."}
                style={{ flex: 1 }}
                value={inputValue}
                onChange={(e) => setInputValue(e.currentTarget.value)}
                onKeyDown={handleKeyPress}
              />
              <ActionIcon variant="filled" color="violet" size="lg" onClick={handleSendMessage} disabled={!inputValue.trim()}>
                <IconSend size={18} />
              </ActionIcon>
            </Group>
          </Box>
        </Paper>
      )}
    </Transition>
    </>
  );
};

export default ChatWindow;