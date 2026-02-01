import React, { useState } from 'react';
import { 
  Modal, 
  Title, 
  Text, 
  Stack, 
  Group, 
  Button, 
  Card, 
  Badge,
  TextInput,
  NumberInput,
  Grid,
  Divider,
  List,
  ThemeIcon,
  Center,
  Loader,
  Alert,
  Radio
} from '@mantine/core';
import { 
  IconCrown, 
  IconCheck, 
  IconX,
  IconCreditCard,
  IconBrandStripe,
  IconShieldCheck,
  IconAlertCircle
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

const PricingModal = ({ opened, onClose, onUpgrade, isUpgrading }) => {
  const [step, setStep] = useState(1); // 1: Comparación, 2: Pago, 3: Confirmación
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  
  // Datos de pago simulados
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');

  // Validación básica
  const isFormValid = () => {
    return (
      cardNumber.length === 16 &&
      cardName.trim().length > 0 &&
      expiryMonth.length === 2 &&
      expiryYear.length === 4 &&
      cvv.length === 3
    );
  };

  const handlePayment = async () => {
    if (!isFormValid()) {
      notifications.show({
        title: 'Datos Incompletos',
        message: 'Por favor completa todos los campos del formulario.',
        color: 'orange',
        icon: <IconAlertCircle />
      });
      return;
    }

    setProcessing(true);
    
    // Simular procesamiento de pago
    setTimeout(async () => {
      try {
        // Llamar a la función real de upgrade
        await onUpgrade();
        
        setStep(3); // Ir a pantalla de confirmación
        
        // Cerrar modal después de 3 segundos
        setTimeout(() => {
          onClose();
          resetForm();
        }, 3000);
        
      } catch (error) {
        notifications.show({
          title: 'Error en el Pago',
          message: 'Hubo un problema al procesar tu pago. Intenta nuevamente.',
          color: 'red',
          icon: <IconX />
        });
      } finally {
        setProcessing(false);
      }
    }, 2500); // Simular delay de procesamiento
  };

  const resetForm = () => {
    setStep(1);
    setCardNumber('');
    setCardName('');
    setExpiryMonth('');
    setExpiryYear('');
    setCvv('');
    setPaymentMethod('card');
  };

  const handleClose = () => {
    if (!processing && !isUpgrading) {
      onClose();
      setTimeout(resetForm, 300);
    }
  };

  // Features de cada plan
  const freeFeatures = [
    { text: '5 documentos máximo', available: true },
    { text: '5 peticiones de IA por día', available: true },
    { text: '10 mensajes de chat por día', available: true },
    { text: 'Búsqueda básica', available: true },
    { text: 'Traducción de documentos limitado', available: true },
    { text: 'Mapas conceptuales con IA', available: false },
    { text: 'Almacenamiento ilimitado', available: false },
    { text: 'Asistente IA ilimitado', available: false },
    { text: 'Chat en tiempo real ilimitado', available: false },
  ];

  const premiumFeatures = [
    { text: 'Documentos ilimitados', available: true },
    { text: '30 peticiones de IA por día', available: true },
    { text: 'Chat ilimitado', available: true },
    { text: 'Búsqueda avanzada', available: true },
    { text: 'Traducción de documentos', available: true },
    { text: 'Mapas conceptuales con IA', available: true },
    { text: 'Almacenamiento ilimitado', available: true },
    { text: 'Asistente IA mejorado', available: true },
    { text: 'Soporte prioritario', available: true },
  ];

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      size={step === 1 ? "xl" : "lg"}
      centered
      closeOnClickOutside={!processing && !isUpgrading}
      closeOnEscape={!processing && !isUpgrading}
      withCloseButton={!processing && !isUpgrading}
      title={
        step === 1 ? "Mejora a Premium" : 
        step === 2 ? "Información de Pago" : 
        "¡Pago Exitoso!"
      }
    >
      {/* STEP 1: COMPARACIÓN DE PLANES */}
      {step === 1 && (
        <Stack gap="xl">
          <Text size="sm" c="dimmed" ta="center">
            Desbloquea todo el potencial de Lingua-Sync AI
          </Text>

          <Grid>
            {/* Plan Gratuito */}
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Card 
                withBorder 
                padding="lg" 
                radius="md"
                style={{ height: '100%' }}
              >
                <Stack gap="md">
                  <Group justify="space-between">
                    <Badge size="lg" color="gray">GRATIS</Badge>
                  </Group>
                  
                  <div>
                    <Text size="xl" fw={700}>$0</Text>
                    <Text size="xs" c="dimmed">por mes</Text>
                  </div>

                  <Divider />

                  <List
                    spacing="xs"
                    size="sm"
                    icon={
                      <ThemeIcon color="gray" size={20} radius="xl">
                        <IconCheck size={12} />
                      </ThemeIcon>
                    }
                  >
                    {freeFeatures.map((feature, idx) => (
                      <List.Item
                        key={idx}
                        icon={
                          feature.available ? (
                            <ThemeIcon color="green" size={20} radius="xl">
                              <IconCheck size={12} />
                            </ThemeIcon>
                          ) : (
                            <ThemeIcon color="gray.3" size={20} radius="xl">
                              <IconX size={12} />
                            </ThemeIcon>
                          )
                        }
                        style={{ 
                          opacity: feature.available ? 1 : 0.5,
                          textDecoration: feature.available ? 'none' : 'line-through'
                        }}
                      >
                        {feature.text}
                      </List.Item>
                    ))}
                  </List>

                  <Button variant="outline" color="gray" fullWidth disabled>
                    Plan Actual
                  </Button>
                </Stack>
              </Card>
            </Grid.Col>

            {/* Plan Premium */}
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Card 
                withBorder 
                padding="lg" 
                radius="md"
                style={{ 
                  height: '100%',
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                  borderColor: '#667eea',
                  borderWidth: 2
                }}
              >
                <Stack gap="md">
                  <Group justify="space-between">
                    <Badge 
                      size="lg" 
                      variant="gradient" 
                      gradient={{ from: 'violet', to: 'blue' }}
                      leftSection={<IconCrown size={14} />}
                    >
                      PREMIUM
                    </Badge>
                    <Badge size="sm" color="red">POPULAR</Badge>
                  </Group>
                  
                  <div>
                    <Group gap={4} align="baseline">
                      <Text size="xl" fw={700}>$10</Text>
                      <Text size="sm" c="dimmed">/mes</Text>
                    </Group>
                    <Text size="xs" c="dimmed">Cancela cuando quieras</Text>
                  </div>

                  <Divider />

                  <List
                    spacing="xs"
                    size="sm"
                    icon={
                      <ThemeIcon color="violet" size={20} radius="xl">
                        <IconCheck size={12} />
                      </ThemeIcon>
                    }
                  >
                    {premiumFeatures.map((feature, idx) => (
                      <List.Item key={idx}>
                        {feature.text}
                      </List.Item>
                    ))}
                  </List>

                  <Button 
                    variant="gradient" 
                    gradient={{ from: 'violet', to: 'blue' }}
                    fullWidth
                    size="md"
                    leftSection={<IconCrown size={18} />}
                    onClick={() => setStep(2)}
                  >
                    Mejorar Ahora
                  </Button>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>

          <Alert icon={<IconShieldCheck size={16} />} color="blue" variant="light">
            <Text size="xs">
              🔒 Pago seguro con encriptación SSL • Cancela en cualquier momento • Garantía de 30 días
            </Text>
          </Alert>
        </Stack>
      )}

      {/* STEP 2: FORMULARIO DE PAGO */}
      {step === 2 && (
        <Stack gap="lg">
          {/* Resumen del pedido */}
          <Card withBorder padding="md" radius="md" bg="gray.0">
            <Group justify="space-between" align="center">
              <div>
                <Text fw={600}>Plan Premium - Mensual</Text>
                <Text size="sm" c="dimmed">Acceso ilimitado a todas las funciones</Text>
              </div>
              <Text size="xl" fw={700}>$10.00</Text>
            </Group>
          </Card>

          {/* Método de pago */}
          <div>
            <Text size="sm" fw={500} mb="xs">Método de Pago</Text>
            <Radio.Group value={paymentMethod} onChange={setPaymentMethod}>
              <Stack gap="xs">
                <Radio 
                  value="card" 
                  label={
                    <Group gap="xs">
                      <IconCreditCard size={16} />
                      <Text size="sm">Tarjeta de Crédito/Débito</Text>
                    </Group>
                  }
                />
              </Stack>
            </Radio.Group>
          </div>

          <Divider />

          {/* Formulario de tarjeta */}
          <Stack gap="md">
            <TextInput
              label="Número de Tarjeta"
              placeholder="1234 5678 9012 3456"
              leftSection={<IconCreditCard size={16} />}
              value={cardNumber}
              onChange={(e) => {
                const value = e.currentTarget.value.replace(/\D/g, '');
                if (value.length <= 16) setCardNumber(value);
              }}
              maxLength={16}
              required
            />

            <TextInput
              label="Nombre en la Tarjeta"
              placeholder="JUAN PEREZ"
              value={cardName}
              onChange={(e) => setCardName(e.currentTarget.value.toUpperCase())}
              required
            />

            <Grid>
              <Grid.Col span={4}>
                <TextInput
                  label="Mes"
                  placeholder="MM"
                  value={expiryMonth}
                  onChange={(e) => {
                    const value = e.currentTarget.value.replace(/\D/g, '');
                    if (value.length <= 2 && (!value || parseInt(value) <= 12)) {
                      setExpiryMonth(value);
                    }
                  }}
                  maxLength={2}
                  required
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <TextInput
                  label="Año"
                  placeholder="AAAA"
                  value={expiryYear}
                  onChange={(e) => {
                    const value = e.currentTarget.value.replace(/\D/g, '');
                    if (value.length <= 4) setExpiryYear(value);
                  }}
                  maxLength={4}
                  required
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <TextInput
                  label="CVV"
                  placeholder="123"
                  type="password"
                  value={cvv}
                  onChange={(e) => {
                    const value = e.currentTarget.value.replace(/\D/g, '');
                    if (value.length <= 3) setCvv(value);
                  }}
                  maxLength={3}
                  required
                />
              </Grid.Col>
            </Grid>
          </Stack>

          <Alert icon={<IconBrandStripe size={16} />} color="blue" variant="light">
            <Text size="xs">
              Procesado de forma segura con tecnología Stripe (Simulación)
            </Text>
          </Alert>

          <Group justify="space-between" mt="md">
            <Button 
              variant="subtle" 
              onClick={() => setStep(1)}
              disabled={processing}
            >
              Volver
            </Button>
            <Button 
              variant="gradient" 
              gradient={{ from: 'violet', to: 'blue' }}
              onClick={handlePayment}
              loading={processing}
              disabled={!isFormValid()}
              leftSection={!processing && <IconShieldCheck size={18} />}
            >
              {processing ? 'Procesando Pago...' : 'Pagar $10.00'}
            </Button>
          </Group>
        </Stack>
      )}

      {/* STEP 3: CONFIRMACIÓN */}
      {step === 3 && (
        <Center style={{ minHeight: 300 }}>
          <Stack align="center" gap="xl">
            <ThemeIcon 
              size={80} 
              radius="xl" 
              variant="gradient" 
              gradient={{ from: 'violet', to: 'blue' }}
            >
              <IconCheck size={40} />
            </ThemeIcon>
            
            <Stack align="center" gap="xs">
              <Title order={2}>¡Pago Exitoso!</Title>
              <Text size="sm" c="dimmed" ta="center">
                Bienvenido a Premium. Ya tienes acceso completo a todas las funciones.
              </Text>
            </Stack>

            <Loader size="sm" />
            <Text size="xs" c="dimmed">Cerrando automáticamente...</Text>
          </Stack>
        </Center>
      )}
    </Modal>
  );
};

export default PricingModal;