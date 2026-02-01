import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Group, Button, Text, Anchor, Box, Avatar, Menu, ActionIcon } from '@mantine/core';
import { IconFileText, IconLogout, IconUser, IconChevronDown } from '@tabler/icons-react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <Box 
      h="100%" 
      px="xl" 
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        zIndex: 100
      }}
    >
      <Group justify="space-between" h="100%">
        {/* Logo y título */}
        <Anchor 
          component={Link} 
          to="/" 
          td="none"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <IconFileText size={28} color="white" />
          <Text 
            fw={700} 
            c="white" 
            size="xl"
            style={{
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            Gestor de Documentos
          </Text>
        </Anchor>

        <Group gap="md">
          {isAuthenticated ? (
            <>
              {/* Menú de usuario con avatar */}
              <Menu shadow="md" width={200} position="bottom-end">
                <Menu.Target>
                  <Button
                    variant="subtle"
                    color="white"
                    leftSection={
                      <Avatar 
                        size="sm" 
                        radius="xl"
                        color="violet"
                        style={{
                          border: '2px solid white'
                        }}
                      >
                        {user?.username?.[0]?.toUpperCase() || 'U'}
                      </Avatar>
                    }
                    rightSection={<IconChevronDown size={16} />}
                    styles={{
                      root: {
                        color: 'white',
                        fontWeight: 500,
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.15)'
                        }
                      }
                    }}
                  >
                    Hola, {user?.username || 'Usuario'}
                  </Button>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>Mi Cuenta</Menu.Label>
                  <Menu.Item
                    leftSection={<IconUser size={16} />}
                    onClick={() => navigate('/profile')}
                  >
                    Ver Perfil
                  </Menu.Item>
                  
                  <Menu.Divider />
                  
                  <Menu.Item
                    color="red"
                    leftSection={<IconLogout size={16} />}
                    onClick={handleLogout}
                  >
                    Cerrar Sesión
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </>
          ) : (
            <Group gap="sm">
              <Button 
                component={Link} 
                to="/login" 
                variant="white"
                color="violet"
                styles={{
                  root: {
                    fontWeight: 600
                  }
                }}
              >
                Iniciar Sesión
              </Button>
              <Button 
                component={Link} 
                to="/register" 
                variant="outline"
                styles={{
                  root: {
                    color: 'white',
                    borderColor: 'white',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.15)'
                    }
                  }
                }}
              >
                Registrarse
              </Button>
            </Group>
          )}
        </Group>
      </Group>
    </Box>
  );
};

export default Navbar;