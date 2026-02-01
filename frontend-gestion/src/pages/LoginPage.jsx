// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import {
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Anchor,
  Container,
  Group,
  Image, // <--- Importa Image
} from '@mantine/core';
import { useAuth } from '../context/AuthContext';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';

import logo from '../assets/logos.png';

const LoginPage = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      notifications.show({ title: 'Éxito', message: 'Inicio de sesión correcto', color: 'green' });
      navigate('/');
    } catch (error) {
      notifications.show({ title: 'Error', message: error.message || 'Credenciales inválidas', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Group justify="center" mb="xl">
        <Image
          src={logo}
          alt="Lingua-Sync AI Logo"
          w={70}
          h={70}
          fit="contain"
        />
      </Group>

      <Title ta="center" order={2}>
        Bienvenido de nuevo!
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        ¿No tienes cuenta?{' '}
        <Anchor size="sm" component="button" onClick={() => navigate('/register')}>
          Crea una
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={handleLogin}>
          <TextInput
            label="Usuario"
            placeholder="Tu usuario"
            required
            value={username}
            onChange={(event) => setUsername(event.currentTarget.value)}
          />
          <PasswordInput
            label="Contraseña"
            placeholder="Tu contraseña"
            required
            mt="md"
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
          />
          <Button type="submit" fullWidth mt="xl" loading={loading}>
            Iniciar Sesión
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default LoginPage;