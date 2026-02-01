import React, { useState, useEffect } from 'react';
import { Title, Box, Group, TextInput, Button, Image } from '@mantine/core';
import { IconSearch, IconSparkles } from '@tabler/icons-react';
import DocumentList from '../components/DocumentList';
import UploadButton from '../components/UploadButton';
import AIAssistantModal from '../components/AIAssistantModal';
import PlanBadge from '../components/PlanBadge';
import PricingModal from '../components/PricingModal';
import { useAuth } from '../context/AuthContext';
import { upgradeToPremium } from '../api/authService';
import { notifications } from '@mantine/notifications';

import logo from '../assets/logos.png';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [aiModalOpened, setAiModalOpened] = useState(false);
  const [pricingModalOpened, setPricingModalOpened] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  
  const { selectedFolderId, selectedTagId, globalRefetch, globalRefetchTrigger, user } = useAuth();
  
  const refetchData = () => {
    globalRefetch();
  };

  // Obtener el plan del usuario
  const [userPlan, setUserPlan] = useState('free');

  useEffect(() => {
    const fetchUserPlan = async () => {
      try {
        const { getProfile } = await import('../api/authService');
        const profile = await getProfile();
        setUserPlan(profile.subscription_plan);
      } catch (err) {
        console.error('Error al obtener el plan del usuario:', err);
      }
    };
    
    if (user) {
      fetchUserPlan();
    }
  }, [user, globalRefetchTrigger]);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      await upgradeToPremium();
      
      notifications.show({
        title: '¡Bienvenido a Premium!',
        message: 'Tu suscripción ha sido activada exitosamente.',
        color: 'green',
      });
      
      // Actualizar el plan local
      setUserPlan('premium');
      globalRefetch();
      
    } catch (err) {
      console.error('Error al mejorar a Premium:', err);
      throw err; // Re-lanzar para que el modal lo maneje
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <Box>
      <Group justify="space-between" mb="xl" align="center">
        <Group gap="xs">
          <Image 
            src={logo} 
            alt="Lingua-Sync AI" 
            w={50} 
            h={50} 
            fit="contain" 
          />
          <Title order={1}>Mis Documentos</Title>
          
          {/* Badge del Plan con clic para abrir modal de upgrade */}
          <Box 
            onClick={() => userPlan === 'free' && setPricingModalOpened(true)}
            style={{ cursor: userPlan === 'free' ? 'pointer' : 'default' }}
          >
            <PlanBadge plan={userPlan} />
          </Box>
        </Group>

        <Group>
          <Button 
            leftSection={<IconSparkles size={14} />}
            onClick={() => setAiModalOpened(true)}
            variant="gradient"
            gradient={{ from: 'violet', to: 'blue', deg: 90 }}
          >
            Asistente IA
          </Button>
          <UploadButton onUploadSuccess={refetchData} />
        </Group>
      </Group>

      <TextInput
        placeholder="Buscar en mis documentos..."
        leftSection={<IconSearch size={16} />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.currentTarget.value)}
        mb="lg"
      />

      <DocumentList
        searchQuery={searchQuery}
        refetchTrigger={globalRefetchTrigger} 
        onDataChange={refetchData}
        selectedFolderId={selectedFolderId}
        selectedTagId={selectedTagId}
      />

      <AIAssistantModal
        opened={aiModalOpened}
        onClose={() => setAiModalOpened(false)}
        onSuccess={refetchData}
      />

      <PricingModal
        opened={pricingModalOpened}
        onClose={() => setPricingModalOpened(false)}
        onUpgrade={handleUpgrade}
        isUpgrading={isUpgrading}
      />
    </Box>
  );
};

export default HomePage;