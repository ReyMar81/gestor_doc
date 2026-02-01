import { ActionIcon, Avatar, Badge, Box, Button, Group, Paper, RingProgress, Stack, Text, Transition } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { IconCheck, IconCopy, IconMicrophone, IconMicrophoneOff, IconMinus, IconPhone, IconPhoneOff, IconVolume, IconVolumeOff, IconX } from '@tabler/icons-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getProfile } from '../api/authService';
import VoiceSocketInstance from '../api/voiceSocketService';
import { useAuth } from '../context/AuthContext';

const VoiceRoomWindow = ({ roomName, onClose, position = 0 }) => { 
  const [opened, setOpened] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [participants, setParticipants] = useState(new Map()); // Cambio a Map para guardar estado de cada participante
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [myLanguage, setMyLanguage] = useState('es');
  const [audioEnabled, setAudioEnabled] = useState(true); // Control de audio entrante (escuchar a otros)
  const [isMicMuted, setIsMicMuted] = useState(false); // Control del micrófono (enviar tu voz)
  const [activeSpeakers, setActiveSpeakers] = useState(new Set()); // Quiénes están hablando ahora
  const [audioLevel, setAudioLevel] = useState(0); // Nivel de audio del micrófono
  const [isBrave, setIsBrave] = useState(false); // Detectar navegador Brave
  const [hasNetworkError, setHasNetworkError] = useState(false); // Error de red persistente
  const [interimText, setInterimText] = useState(''); // Texto intermedio en tiempo real
  
  const recognitionRef = useRef(null);
  const { user } = useAuth();
  const clipboard = useClipboard({ timeout: 2000 });
  const lastSentRef = useRef('');
  const accumulatedTextRef = useRef('');
  const streamIntervalRef = useRef(null);
  const speakingTimeoutRef = useRef({});
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  const audioEnabledRef = useRef(true); // Ref para audioEnabled

  // Sincronizar ref con estado
  useEffect(() => {
    audioEnabledRef.current = audioEnabled;
  }, [audioEnabled]);

  // Detectar navegador Brave
  useEffect(() => {
    const detectBrave = async () => {
      if (navigator.brave && await navigator.brave.isBrave()) {
        setIsBrave(true);
      }
    };
    detectBrave();
  }, []);

  // Obtener idioma preferido del usuario
  useEffect(() => {
    const fetchLanguage = async () => {
      try {
        const profile = await getProfile();
        const langMap = {
            'en': 'en-US',
            'es': 'es-ES',
            'fr': 'fr-FR',
            'de': 'de-DE',
            'pt': 'pt-BR',
            'it': 'it-IT',
            'zh': 'zh-CN',
            'ja': 'ja-JP'
        };
        const mappedLang = langMap[profile.language_preference] || 'es-ES';
        setMyLanguage(mappedLang);
        
        // Configurar reconocimiento de voz
        if (recognitionRef.current) {
          recognitionRef.current.lang = mappedLang;
        }
      } catch (error) {
        // Error al obtener idioma
      }
    };
    fetchLanguage();
  }, []);

  // Configurar reconocimiento de voz continuo
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; // Continuo para streaming
      recognitionRef.current.interimResults = true; // Resultados intermedios
      recognitionRef.current.lang = myLanguage;

      recognitionRef.current.onstart = () => {
        setIsSpeaking(true);
        retryCountRef.current = 0;
        setHasNetworkError(false);
      };

      recognitionRef.current.onend = () => {
        setIsSpeaking(false);
        // Solo reiniciar si está conectado Y el micrófono NO está silenciado
        if (isConnected && !isMicMuted) {
          setTimeout(() => {
            try {
              if (recognitionRef.current) {
                recognitionRef.current.start();
              }
            } catch (e) {
              // Error al reiniciar
            }
          }, 100);
        }
      };

      recognitionRef.current.onresult = (event) => {
        // Si el micrófono está silenciado, NO procesar NADA
        if (isMicMuted) {
          return;
        }
        
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        // Mostrar texto intermedio en UI (tiempo real)
        if (interimTranscript) {
          setInterimText(interimTranscript);
        }

        // Solo procesar texto final
        if (finalTranscript) {
          const textToSend = finalTranscript.trim();
          
          if (isConnected && textToSend && textToSend !== lastSentRef.current) {
            const messageData = { 
              message: textToSend,
              type: 'voice',
              timestamp: new Date().toISOString()
            };
            
            VoiceSocketInstance.sendMessage(messageData);
            lastSentRef.current = textToSend;
            setInterimText(''); // Limpiar texto intermedio después de enviar
          }
        }
      };

      recognitionRef.current.onerror = (event) => {
        if (event.error === 'no-speech') {
          retryCountRef.current = 0;
          if (isConnected) {
            setTimeout(() => {
              try {
                if (recognitionRef.current) {
                  recognitionRef.current.start();
                }
              } catch (e) {
                // Error al reiniciar
              }
            }, 100);
          }
        } else if (event.error === 'network') {
          retryCountRef.current++;
          
          if (retryCountRef.current <= maxRetries && isConnected) {
            const delay = Math.pow(2, retryCountRef.current) * 1000;
            
            setTimeout(() => {
              try {
                if (recognitionRef.current && isConnected) {
                  recognitionRef.current.start();
                }
              } catch (e) {
                // Error al reiniciar
              }
            }, delay);
          } else {
            setHasNetworkError(true);
          }
        } else if (event.error === 'not-allowed') {
          retryCountRef.current = maxRetries + 1;
        } else if (event.error === 'aborted') {
          retryCountRef.current = 0;
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
      }
    };
  }, [myLanguage, isConnected, isMicMuted]);

  // Ya no necesitamos intervalo - enviamos inmediatamente cuando hay texto final
  // Este useEffect ya no es necesario pero lo mantenemos por compatibilidad
  useEffect(() => {
    // Solo para mantener compatibilidad, ya no hace nada
    return () => {
      // Limpieza si es necesario
    };
  }, [isConnected]);

  // Función para reproducir texto automáticamente con indicador visual
  const speakMessage = useCallback((text, username) => {
    // Si el audio está silenciado, NO reproducir
    if (!window.speechSynthesis || !audioEnabledRef.current) {
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = myLanguage;
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    utterance.onstart = () => {
      setActiveSpeakers(prev => new Set([...prev, username]));
    };
    
    // Quitar indicador cuando termina
    utterance.onend = () => {
      setTimeout(() => {
        setActiveSpeakers(prev => {
          const newSet = new Set(prev);
          newSet.delete(username);
          return newSet;
        });
      }, 300); // Pequeño delay para suavizar la animación
    };
    
    window.speechSynthesis.speak(utterance);
  }, [myLanguage]); // audioEnabled se verifica dentro de la función, no necesita estar en dependencias

  // Conexión WebSocket
  useEffect(() => {
    if (roomName) {
      setOpened(true);
      
      // Limpiar callbacks anteriores antes de conectar
      VoiceSocketInstance.disconnect();
      
      VoiceSocketInstance.connect(roomName);
      
      // Definir callback UNA SOLA VEZ
      const handleMessage = (data) => {
        if (data.username === 'Sistema' || data.type === 'system') {
          return;
        }
        
        // Actualizar lista de participantes solo con usuarios reales
        if (data.username && data.username !== 'Sistema') {
          setParticipants((prev) => {
            const newMap = new Map(prev);
            const existingData = newMap.get(data.username) || {};
            newMap.set(data.username, {
              lastSeen: new Date(),
              isSpeaking: data.type === 'voice',
              isMuted: data.type === 'mute_status' ? data.isMuted : (existingData.isMuted || false)
            });
            return newMap;
          });
        }
        
        if (data.type === 'voice' && data.username !== user?.username && data.username !== 'Sistema') {
          speakMessage(data.message, data.username);
        }
        
        if (data.type === 'leave') {
          setParticipants((prev) => {
            const newMap = new Map(prev);
            newMap.delete(data.username);
            return newMap;
          });
          return;
        }
        
        if (data.type === 'presence_request' && data.username !== user?.username) {
          setTimeout(() => {
            const presenceResponse = {
              message: 'present',
              type: 'presence_response',
              timestamp: new Date().toISOString()
            };
            VoiceSocketInstance.sendMessage(presenceResponse);
          }, 100);
        }
      };
      
      // Registrar callback UNA SOLA VEZ
      VoiceSocketInstance.addCallbacks(handleMessage);
      
      setIsConnected(true);
      
      // Esperar a que el WebSocket esté realmente conectado antes de enviar mensajes
      setTimeout(() => {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            // Error al iniciar
          }
        }
        
        const joinMessage = {
          message: 'joined',
          type: 'join',
          timestamp: new Date().toISOString()
        };
        VoiceSocketInstance.sendMessage(joinMessage);
        
        setTimeout(() => {
          const presenceRequest = {
            message: 'request_presence',
            type: 'presence_request',
            timestamp: new Date().toISOString()
          };
          VoiceSocketInstance.sendMessage(presenceRequest);
        }, 200);
      }, 800);
    }
    
    return () => {
      // Solo limpiar callbacks y detener reconocimiento
      // NO desconectar WebSocket porque ChatWindow lo necesita
      VoiceSocketInstance.removeCallbacks();
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ya detenido
        }
      }
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
      }
      window.speechSynthesis.cancel();
      setIsConnected(false);
      setParticipants(new Map());
    };
  }, [roomName, user?.username]); // Removido audioEnabled y speakMessage para evitar reconexiones

  // Simular nivel de audio cuando estamos hablando
  useEffect(() => {
    let interval;
    if (isSpeaking) {
      interval = setInterval(() => {
        // Simular variación de nivel de audio
        setAudioLevel(Math.random() * 100);
      }, 100);
    } else {
      setAudioLevel(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSpeaking]);

  // Silenciar/activar audio entrante (escuchar a otros) - MUTE estilo TV
  const handleToggleAudio = () => {
    const newAudioState = !audioEnabled;
    setAudioEnabled(newAudioState);
    
    if (!newAudioState) {
      // Silenciar: cancelar el audio actual (limitación de la API)
      // No es posible seguir reproduciéndolo sin sonido
      window.speechSynthesis.cancel();
    }
    // Cuando se reanuda, los NUEVOS mensajes se escucharán normalmente
  };

  // Silenciar/activar micrófono (tu voz)
  const handleToggleMic = () => {
    const newMutedState = !isMicMuted;
    setIsMicMuted(newMutedState);
    
    if (!recognitionRef.current || !isConnected) return;
    
    // Si se silencia, DETENER el reconocimiento
    if (newMutedState) {
      try {
        recognitionRef.current.stop();
        setInterimText(''); // Limpiar texto intermedio
      } catch (e) {
        // Ya detenido
      }
    }
    // Si se activa, INICIAR el reconocimiento
    else {
      // Pequeño delay para asegurar que el stop() se complete primero
      setTimeout(() => {
        try {
          if (recognitionRef.current && isConnected) {
            recognitionRef.current.start();
          }
        } catch (e) {
          // Si falla, forzar recreación
          if (e.message.includes('already started')) {
            try {
              recognitionRef.current.stop();
              setTimeout(() => {
                if (recognitionRef.current && isConnected) {
                  recognitionRef.current.start();
                }
              }, 100);
            } catch (e2) {
              // Error irrecuperable
            }
          }
        }
      }, 50);
    }
  };

  const handleClose = () => {
    // IMPORTANTE: Establecer isConnected = false PRIMERO para evitar bucle
    setIsConnected(false);
    
    const leaveMessage = {
      message: 'left',
      type: 'leave',
      timestamp: new Date().toISOString()
    };
    VoiceSocketInstance.sendMessage(leaveMessage);
    
    // Desconectar WebSocket después de enviar el mensaje
    setTimeout(() => {
      VoiceSocketInstance.disconnect();
    }, 100);
    
    // Detener reconocimiento de voz
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ya detenido
      }
    }
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
    }
    window.speechSynthesis.cancel();
    setOpened(false);
    setTimeout(() => { 
      if (onClose) onClose(); 
    }, 300);
  };

  const handleConnect = () => {
    if (!isConnected) return;
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Ya iniciado
      }
    }
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
            background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
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
          <IconPhone size={30} color="white" />
          {participants.size > 0 && (
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
              {participants.size}
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
              position: 'fixed', 
              bottom: 20, 
              right: 20, 
              width: 400, 
              height: 600,
              zIndex: 1001, 
              display: 'flex', 
              flexDirection: 'column',
              overflow: 'hidden', 
              border: '1px solid #eee'
            }}
          >
            {/* Cabecera */}
            <Group justify="space-between" p="md" bg="teal" c="white">
              <Group gap="xs">
                <IconPhone />
                <Box>
                  <Text fw={700} size="sm" style={{ lineHeight: 1.2 }}>Reunión de Voz: {roomName}</Text>
                  <Group gap={4} style={{ cursor: 'pointer', opacity: 0.9 }} onClick={() => clipboard.copy(roomName)}>
                    <Text size="xs" c="gray.2">{clipboard.copied ? '¡Copiado!' : 'Copiar código'}</Text>
                    {clipboard.copied ? <IconCheck size={12}/> : <IconCopy size={12}/>}
                  </Group>
                </Box>
              </Group>
              <Group gap="xs">
                <ActionIcon variant="transparent" c="white" onClick={() => setMinimized(true)} title="Minimizar">
                  <IconMinus />
                </ActionIcon>
                <ActionIcon variant="transparent" c="white" onClick={handleClose} title="Colgar">
                  <IconX />
                </ActionIcon>
              </Group>
            </Group>

          {/* Estado de conexión y participantes */}
          <Box p="sm" bg="gray.1" style={{ borderBottom: '1px solid #dee2e6' }}>
            <Group justify="space-between" mb="xs">
              <Group gap="xs">
                <Badge color={isConnected ? 'green' : 'gray'} variant="filled">
                  {isConnected ? 'En Llamada' : 'Desconectado'}
                </Badge>
                <Badge color="blue" variant="light">
                  {participants.size} en llamada
                </Badge>
              </Group>
              <Text size="xs" c="dimmed">🌍 {myLanguage}</Text>
            </Group>
          </Box>

          {/* Vista de participantes - ESTILO LLAMADA */}
          <Box style={{ flex: 1, padding: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            {participants.size === 0 ? (
              <Stack align="center" justify="center" style={{ height: '100%' }} gap="md">
                <IconPhone size={48} color="white" style={{ opacity: 0.5 }} />
                <Text c="white" size="lg" fw={600} ta="center">
                  Esperando participantes...
                </Text>
                <Text c="white" size="sm" ta="center" style={{ opacity: 0.8 }}>
                  Comparte el código <b>{roomName}</b>
                </Text>
              </Stack>
            ) : (
              <Stack align="center" justify="center" style={{ height: '100%' }} gap="lg">
                {/* Grid de participantes */}
                <Box style={{ 
                  display: 'grid', 
                  gridTemplateColumns: participants.size === 1 ? '1fr' : participants.size === 2 ? '1fr 1fr' : 'repeat(2, 1fr)',
                  gap: '20px',
                  width: '100%'
                }}>
                  {Array.from(participants.keys()).map((participant, idx) => {
                    const isSpeakingNow = activeSpeakers.has(participant);
                    const isMe = participant === user?.username;
                    const participantData = participants.get(participant);
                    const participantIsMuted = participantData?.isMuted || false;
                    
                    return (
                      <Stack key={idx} align="center" gap="xs">
                        <Box style={{ position: 'relative' }}>
                          {/* Indicador de audio con ring progress */}
                          {isSpeakingNow && (
                            <Box style={{ position: 'absolute', top: -5, left: -5 }}>
                              <RingProgress
                                size={90}
                                thickness={4}
                                sections={[{ value: 100, color: 'green' }]}
                                rootColor="transparent"
                                style={{ 
                                  animation: 'pulse 1.5s infinite',
                                  filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.6))'
                                }}
                              />
                            </Box>
                          )}
                          
                          <Avatar 
                            size={80} 
                            radius="xl" 
                            color={isMe ? 'teal' : 'blue'}
                            style={{
                              border: isSpeakingNow ? '3px solid #22c55e' : '3px solid transparent',
                              boxShadow: isSpeakingNow ? '0 0 20px rgba(34, 197, 94, 0.8)' : 'none',
                              transition: 'all 0.3s ease',
                              transform: isSpeakingNow ? 'scale(1.1)' : 'scale(1)',
                              opacity: participantIsMuted ? 0.5 : 1
                            }}
                          >
                            <Text size="xl" fw={700} c="white">
                              {participant[0]?.toUpperCase()}
                            </Text>
                          </Avatar>
                          
                          {/* Indicador de micrófono silenciado */}
                          {participantIsMuted && (
                            <Box style={{ 
                              position: 'absolute', 
                              bottom: 0, 
                              right: 0, 
                              background: '#ef4444', 
                              borderRadius: '50%',
                              padding: 4,
                              border: '2px solid white'
                            }}>
                              <IconMicrophoneOff size={16} color="white" />
                            </Box>
                          )}
                        </Box>
                        
                        <Text c="white" size="sm" fw={600}>
                          {isMe ? 'Tú' : participant}
                        </Text>
                        
                        {participantIsMuted && (
                          <Badge color="red" variant="filled" size="xs">
                            🔇 Silenciado
                          </Badge>
                        )}
                        {!participantIsMuted && isSpeakingNow && (
                          <Badge 
                            color="green" 
                            variant="filled" 
                            size="xs"
                            style={{ animation: 'pulse 1s infinite' }}
                          >
                            🔴 En vivo
                          </Badge>
                        )}
                        {!participantIsMuted && !isSpeakingNow && !isMe && (
                          <Badge color="gray" variant="light" size="xs">
                            ✓ Listo
                          </Badge>
                        )}
                      </Stack>
                    );
                  })}
                </Box>
              </Stack>
            )}
          </Box>

          {/* Controles de voz */}
          <Box p="lg" style={{ borderTop: '2px solid #dee2e6', background: 'linear-gradient(to bottom, #f8f9fa, #ffffff)' }}>
            <Stack gap="md">
              {/* Advertencia sobre Brave */}
              {(isBrave || hasNetworkError) && (
                <Paper p="md" bg="yellow.1" style={{ border: '2px solid #fab005' }}>
                  <Stack gap="xs">
                    <Group gap="xs">
                      <Text size="sm" fw={700} c="yellow.9">
                        ⚠️ Problema con reconocimiento de voz
                      </Text>
                    </Group>
                    <Text size="xs" c="yellow.9">
                      {isBrave ? (
                        <>
                          <strong>Brave detectado:</strong> Los escudos de privacidad de Brave bloquean el reconocimiento de voz.
                          <br />
                          <strong>Solución:</strong> Haz clic en el icono del león (🦁) en la barra de direcciones y selecciona "Desactivar escudos para este sitio", luego recarga la página.
                        </>
                      ) : (
                        <>
                          <strong>Error de red:</strong> No se puede conectar al servicio de reconocimiento de voz.
                          <br />
                          <strong>Solución:</strong> Verifica tu conexión a Internet o usa Chrome/Edge/Firefox.
                        </>
                      )}
                    </Text>
                    <Button 
                      size="xs" 
                      variant="light" 
                      color="yellow.9"
                      onClick={() => window.location.reload()}
                    >
                      Recargar página
                    </Button>
                  </Stack>
                </Paper>
              )}
              {/* Indicador de estado */}
              <Group justify="center">
                {isMicMuted && (
                  <Badge color="red" variant="filled" size="lg">
                    🔇 Micrófono silenciado
                  </Badge>
                )}
                {!audioEnabled && !isMicMuted && (
                  <Badge color="gray" variant="filled" size="lg">
                    🔕 Audio silenciado
                  </Badge>
                )}
                {!isMicMuted && isSpeaking && audioEnabled && (
                  <Badge 
                    color="green" 
                    variant="filled" 
                    size="lg"
                    style={{ animation: 'pulse 2s infinite' }}
                  >
                    🎤 Capturando voz...
                  </Badge>
                )}
                {!isMicMuted && !isSpeaking && isConnected && audioEnabled && (
                  <Badge color="green" variant="light" size="lg">
                    ✓ Listo para hablar
                  </Badge>
                )}
              </Group>

              {/* Transcripción en tiempo real */}
              {interimText && !isMicMuted && (
                <Paper p="sm" bg="blue.0" style={{ border: '1px solid #339af0' }}>
                  <Text size="sm" c="blue.9" style={{ fontStyle: 'italic' }}>
                    🔊 "{interimText}"
                  </Text>
                </Paper>
              )}

              {/* Botones de control estilo Discord */}
              <Group justify="center" gap="md">
                {/* 1. Botón silenciar MICRÓFONO (tu voz) */}
                <ActionIcon
                  size={60}
                  radius="xl"
                  variant="light"
                  color={isMicMuted ? "red" : "blue"}
                  onClick={handleToggleMic}
                  title={isMicMuted ? "Activar micrófono" : "Silenciar micrófono"}
                >
                  {isMicMuted ? <IconMicrophoneOff size={28} /> : <IconMicrophone size={28} />}
                </ActionIcon>

                {/* 2. Botón silenciar AUDIO (escuchar a otros) */}
                <ActionIcon
                  size={60}
                  radius="xl"
                  variant="light"
                  color={audioEnabled ? "blue" : "gray"}
                  onClick={handleToggleAudio}
                  title={audioEnabled ? "Silenciar audio" : "Activar audio"}
                >
                  {audioEnabled ? <IconVolume size={28} /> : <IconVolumeOff size={28} />}
                </ActionIcon>

                {/* 3. Botón COLGAR (desconectar) */}
                <ActionIcon
                  size={70}
                  radius="xl"
                  variant="filled"
                  color="red"
                  onClick={handleClose}
                  title="Colgar"
                >
                  <IconPhoneOff size={30} />
                </ActionIcon>
              </Group>

              <Text size="xs" c="dimmed" ta="center">
                Habla naturalmente. Tus palabras se traducen automáticamente a cada participante.
              </Text>
            </Stack>
          </Box>
        </Paper>
      )}
    </Transition>
    </>
  );
};

export default VoiceRoomWindow;
