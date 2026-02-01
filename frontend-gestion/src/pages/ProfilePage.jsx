import React, { useState, useEffect, useCallback } from 'react';
import { Container, Title, Paper, TextInput, Select, Button, Loader, Center, Badge, Group, Text, Card, Image } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCrown, IconSparkles, IconArrowLeft } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile, upgradeToPremium } from '../api/authService';
import PricingModal from '../components/PricingModal';
import { useNavigate } from 'react-router-dom'; 

import logo from '../assets/logos.png'; 

const ProfilePage = () => {
  const { user, globalRefetch } = useAuth(); 
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [pricingModalOpened, setPricingModalOpened] = useState(false);

  const [language, setLanguage] = useState('');
  const navigate = useNavigate();

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      setProfile(data);
      setLanguage(data.language_preference);
    } catch (err) {
      notifications.show({ title: 'Error', message: 'No se pudo cargar el perfil.', color: 'red' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedData = { language_preference: language };
      await updateProfile(updatedData);
      notifications.show({ title: 'Éxito', message: 'Perfil actualizado.', color: 'green' });
    } catch (err) {
      notifications.show({ title: 'Error', message: 'No se pudo actualizar el perfil.', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = useCallback(async () => {
    if (isUpgrading) return;

    setIsUpgrading(true);
    try {
      await upgradeToPremium();
      
      notifications.show({ 
        title: '¡Bienvenido a Premium!', 
        message: 'Tu suscripción ha sido activada exitosamente.', 
        color: 'green',
        icon: <IconCrown />,
        autoClose: 5000
      });
      
      await fetchProfile();
      globalRefetch();

    } catch (err) {
      console.error("Error en handleUpgrade:", err);
      throw err; // Re-lanzar para que el modal lo maneje
    } finally {
      setIsUpgrading(false);
    }
  }, [isUpgrading, fetchProfile, globalRefetch]);

  if (loading && !profile) {
    return <Center style={{ height: '80vh' }}><Loader /></Center>;
  }

  const isPremium = profile?.subscription_plan === 'premium';

  return (
    <Container size="sm" mt="lg">

    
      <Group mb="xl" align="center">
          <Button 
            variant="light" 
            size="sm"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate('/')} // Vuelve al Home
          >
            Volver
          </Button>        

         <Image src={logo} w={60} />
         <Title order={1}>Mi Perfil</Title>
      </Group>
      
      <Card 
        withBorder 
        shadow="sm" 
        radius="md" 
        mb="xl" 
        padding="lg" 
        style={{ 
          borderColor: isPremium ? '#845ef7' : undefined,
          background: isPremium 
            ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
            : undefined
        }}
      >


      
        <Group justify="space-between" mb="xs">
            <Text fw={700} size="lg">Tu Plan Actual</Text>
            {isPremium ? (
                <Badge 
                  size="lg" 
                  variant="gradient" 
                  gradient={{ from: 'violet', to: 'blue' }} 
                  leftSection={<IconCrown size={14} />}
                >
                  PREMIUM
                </Badge>
            ) : (
                <Badge size="lg" color="gray">GRATIS</Badge>
            )}
        </Group>

        <Text c="dimmed" size="sm" mb="md">
            {isPremium 
                ? "¡Tienes acceso ilimitado a todas las funciones de IA y almacenamiento!" 
                : "Estás usando el plan gratuito con límites de almacenamiento y consultas."}
        </Text>
        
        {!isPremium && (
            <Button 
                onClick={() => setPricingModalOpened(true)}
                variant="gradient" 
                gradient={{ from: 'violet', to: 'blue' }}
                fullWidth
                leftSection={<IconSparkles size={18} />}
            >
                Ver Planes y Mejorar a Premium
            </Button>
        )}

        {isPremium && (
          <Group gap="xs">
            <Text size="sm" c="dimmed">
              💎 Disfrutando de todos los beneficios Premium
            </Text>
          </Group>
        )}
      </Card>

      <Paper withBorder shadow="md" p={30} radius="md">
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Username"
            value={user?.username || ''}
            disabled
          />
          <TextInput
            label="Email"
            value={user?.email || ''}
            disabled
            mt="md"
          />

          <Select
            label="Idioma de Preferencia"
            value={language}
            onChange={setLanguage}
            data={[
              { value: 'en', label: 'Inglés' },
              { value: 'es', label: 'Español' },
              { value: 'fr', label: 'Francés' },
              { value: 'de', label: 'Alemán' },
              { value: 'pt', label: 'Portugués' },
            ]}
            mt="md"
            disabled={loading}
          />

          <Button type="submit" loading={loading} fullWidth mt="xl">
            Guardar Cambios
          </Button>
        </form>
      </Paper>

      <PricingModal
        opened={pricingModalOpened}
        onClose={() => setPricingModalOpened(false)}
        onUpgrade={handleUpgrade}
        isUpgrading={isUpgrading}
      />
    </Container>
  );
};

export default ProfilePage;