import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  Paper,
  Title,
  TextInput,
  PasswordInput,
  Button,
  Text,
  Anchor,
  Center,
  Container,
  Alert, Stack
} from '@mantine/core';
// 1. Importar el hook y los iconos
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  // 2. Ya no necesitamos 'setError' ni 'setSuccess'
  const [verificationUrl, setVerificationUrl] = useState('');
  const [showSuccess, setShowSuccess] = useState(false); // Estado para mostrar el mensaje de éxito
  const { register } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setVerificationUrl('');
    setShowSuccess(false);

    if (password !== password2) {
      notifications.show({ // 4. Notificación de error
        title: 'Error de Validación',
        message: 'Las contraseñas no coinciden.',
        color: 'red',
        icon: <IconAlertCircle />,
      });
      return;
    }

    try {
      const responseData = await register(username, email, password, password2);
      setShowSuccess(true); // Muestra el componente de éxito
      if (responseData.verification_url) {
        setVerificationUrl(responseData.verification_url);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        const errorMessages = Object.keys(errorData).map(key => {
          return `${key}: ${errorData[key].join(', ')}`;
        }).join(' | ');
        
        notifications.show({ // 5. Notificación de error del backend
          title: 'Error al Registrarse',
          message: errorMessages,
          color: 'red',
          icon: <IconAlertCircle />,
        });
      } else {
        notifications.show({
          title: 'Error',
          message: 'Error al registrarse. Intente de nuevo.',
          color: 'red',
          icon: <IconAlertCircle />,
        });
      }
      console.error(err);
    }
  };

  // Si el registro fue exitoso, muestra solo el mensaje
 if (showSuccess) {
    return (
      <Container size={420} my={40}>
        <Paper withBorder shadow="md" p={30} radius="md">
          <Alert icon={<IconCheck size="1.1rem" />} title="¡Registro Exitoso!" color="green">
            Cuenta creada correctamente.
          </Alert>
          
          {/* --- SECCIÓN MODIFICADA --- */}
          {verificationUrl && (
            <Stack mt="lg" align="center">
              <Text size="sm" ta="center">
                Para completar el proceso, haz clic en el botón de abajo:
              </Text>
              
              {/* Botón que actúa como enlace GET a la URL de verificación */}
              <Button 
                component="a" 
                href={verificationUrl}
                size="md"
                color="teal"
                fullWidth
              >
                CONFIRMAR CUENTA AHORA
              </Button>
              
              <Text size="xs" c="dimmed" ta="center" mt="xs">
                (Esto simula hacer clic en el enlace del correo)
              </Text>
            </Stack>
          )}
          {/* -------------------------- */}

          <Button component={Link} to="/login" variant="subtle" fullWidth mt="md">
            Ir a Iniciar Sesión
          </Button>
        </Paper>
      </Container>
    );
  }

  // Si no, muestra el formulario de registro
  return (
    <Container size={420} my={40}>
      <Center>
        <Paper withBorder shadow="md" p={30} radius="md" style={{ width: '100%' }}>
          <Title order={2} ta="center" mb="lg">
            Crear Cuenta
          </Title>
          
          <form onSubmit={handleSubmit}>
            <TextInput
              label="Username"
              placeholder="Tu nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.currentTarget.value)}
              required
            />
            <TextInput
              label="Email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              required
              mt="md"
            />
            <PasswordInput
              label="Password"
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              required
              mt="md"
            />
            <PasswordInput
              label="Confirmar Password"
              placeholder="Repite tu contraseña"
              value={password2}
              onChange={(e) => setPassword2(e.currentTarget.value)}
              required
              mt="md"
            />

            {/* 6. Ya no necesitamos el componente Notification aquí */}

            <Button fullWidth mt="xl" type="submit">
              Registrarse
            </Button>
          </form>

          <Text c="dimmed" size="sm" ta="center" mt="md">
            ¿Ya tienes una cuenta?{' '}
            <Anchor component={Link} to="/login" size="sm">
              Iniciar Sesión
            </Anchor>
          </Text>
        </Paper>
      </Center>
    </Container>
  );
};

export default RegisterPage;