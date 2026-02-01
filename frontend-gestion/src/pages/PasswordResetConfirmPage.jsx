import React, { useState } from 'react';
import { Container, Title, Paper, PasswordInput, Button, Center, Alert } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconAlertCircle } from '@tabler/icons-react';
import { confirmPasswordReset } from '../api/authService';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

const PasswordResetConfirmPage = () => {
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Hook para leer los parámetros de la URL
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== password2) {
      notifications.show({ title: 'Error', message: 'Las contraseñas no coinciden.', color: 'red' });
      return;
    }
    
    // Obtener uid y token de la URL
    const uid = searchParams.get('uid');
    const token = searchParams.get('token');

    if (!uid || !token) {
      notifications.show({ title: 'Error', message: 'Enlace inválido o expirado.', color: 'red' });
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(password, password2, uid, token);
      setSuccess(true);
    } catch (err) {
      notifications.show({ title: 'Error', message: 'No se pudo resetear la contraseña. El enlace puede haber expirado.', color: 'red', icon: <IconAlertCircle /> });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container size="xs" mt={100}>
        <Alert icon={<IconCheck size="1.1rem" />} title="¡Éxito!" color="green">
          Tu contraseña ha sido actualizada. Ya puedes iniciar sesión.
          <Button component={Link} to="/login" fullWidth mt="md">
            Ir a Iniciar Sesión
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container size={420} my={40}>
      <Center>
        <Paper withBorder shadow="md" p={30} radius="md" style={{ width: '100%' }}>
          <Title order={2} ta="center" mb="lg">
            Ingresa tu Nueva Contraseña
          </Title>
          <form onSubmit={handleSubmit}>
            <PasswordInput
              label="Nueva Contraseña"
              placeholder="Tu nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              required
            />
            <PasswordInput
              label="Confirmar Nueva Contraseña"
              placeholder="Repite tu contraseña"
              value={password2}
              onChange={(e) => setPassword2(e.currentTarget.value)}
              required
              mt="md"
            />
            <Button type="submit" loading={loading} fullWidth mt="xl">
              Guardar Nueva Contraseña
            </Button>
          </form>
        </Paper>
      </Center>
    </Container>
  );
};

export default PasswordResetConfirmPage;