import React, { useState } from 'react';
import { Container, Title, Paper, TextInput, Button, Center, Alert, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';
import { requestPasswordReset } from '../api/authService';

const PasswordResetRequestPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestPasswordReset(email);
      // Por seguridad, siempre mostramos éxito,
      // incluso si el email no existe.
      setSubmitted(true);
    } catch (err) {
      // Manejar el error en silencio pero registrarlo
      console.error(err);
      setSubmitted(true); // Mostrar el mismo mensaje
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Container size="xs" mt={100}>
        <Alert icon={<IconCheck size="1.1rem" />} title="¡Correo Enviado!" color="green">
          Si existe una cuenta con ese email, recibirás un correo con instrucciones para resetear tu contraseña.
        </Alert>
      </Container>
    );
  }

  return (
    <Container size={420} my={40}>
      <Center>
        <Paper withBorder shadow="md" p={30} radius="md" style={{ width: '100%' }}>
          <Title order={2} ta="center" mb="lg">
            Resetear Contraseña
          </Title>
          <Text c="dimmed" size="sm" ta="center" mb="lg">
            Ingresa tu email y te enviaremos un enlace para resetear tu contraseña.
          </Text>
          <form onSubmit={handleSubmit}>
            <TextInput
              label="Email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              required
              type="email"
            />
            <Button type="submit" loading={loading} fullWidth mt="xl">
              Enviar Enlace de Reseteo
            </Button>
          </form>
        </Paper>
      </Center>
    </Container>
  );
};

export default PasswordResetRequestPage;