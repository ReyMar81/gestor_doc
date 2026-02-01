import React, { useEffect, useState } from 'react';
import { Container, Alert, Button, Center, Loader } from '@mantine/core';
import { IconCheck, IconAlertCircle } from '@tabler/icons-react';
import { Link, useSearchParams } from 'react-router-dom';

const EmailVerifyPage = () => {
  // Hook para leer los parámetros de la URL (ej. ?success=true)
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'failure'

  useEffect(() => {
    const success = searchParams.get('success');
    if (success === 'true') {
      setStatus('success');
    } else if (success === 'false') {
      setStatus('failure');
    } else {
      setStatus('failure'); // Tratar cualquier otra cosa como un fallo
    }
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <Center style={{ height: '80vh' }}>
        <Loader />
      </Center>
    );
  }

  if (status === 'failure') {
    return (
      <Container size="xs" mt={100}>
        <Alert icon={<IconAlertCircle size="1.1rem" />} title="Error de Verificación" color="red">
          El enlace de verificación es inválido o ha expirado.
          Por favor, intenta registrarte de nuevo o contacta al soporte.
        </Alert>
      </Container>
    );
  }

  // (status === 'success')
  return (
    <Container size="xs" mt={100}>
      <Alert icon={<IconCheck size="1.1rem" />} title="¡Correo Verificado!" color="green">
        Tu correo ha sido verificado exitosamente. Ya puedes iniciar sesión.
        <Button component={Link} to="/login" fullWidth mt="md">
          Ir a Iniciar Sesión
        </Button>
      </Alert>
    </Container>
  );
};

export default EmailVerifyPage;