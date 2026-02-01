import React from 'react';
import { Badge, Group, Tooltip } from '@mantine/core';
import { IconCrown, IconUser } from '@tabler/icons-react';

const PlanBadge = ({ plan }) => {
  const isPremium = plan === 'premium';
  
  return (
    <Tooltip 
      label={isPremium ? "Plan Premium Activo" : "Plan Gratuito - Mejora a Premium"}
      position="bottom"
    >
      <Badge 
        size="lg" 
        variant={isPremium ? "gradient" : "light"}
        gradient={isPremium ? { from: 'violet', to: 'blue' } : undefined}
        color={isPremium ? undefined : "gray"}
        leftSection={isPremium ? <IconCrown size={14} /> : <IconUser size={14} />}
        style={{ 
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          fontWeight: 600
        }}
        styles={{
          root: {
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }
          }
        }}
      >
        {isPremium ? 'PREMIUM' : 'GRATIS'}
      </Badge>
    </Tooltip>
  );
};

export default PlanBadge;