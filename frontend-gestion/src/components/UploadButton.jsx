import React, { useState } from 'react';
import { Button } from '@mantine/core';
import { IconUpload } from '@tabler/icons-react';
import UploadModal from './UploadModal';

// 1. Aceptar la nueva prop
const UploadButton = ({ onUploadSuccess }) => {
  const [modalOpened, setModalOpened] = useState(false);

  const handleClose = () => {
    setModalOpened(false);
  };

  const handleSuccess = () => {
    onUploadSuccess(); // 2. Llamar a la función del padre
    handleClose(); // 3. Cerrar el modal
  };

  return (
    <>
      <Button
        leftSection={<IconUpload size={14} />}
        onClick={() => setModalOpened(true)}
      >
        Subir Documento
      </Button>

      <UploadModal
        opened={modalOpened}
        onClose={handleClose}
        // 4. Pasar la función de éxito al modal
        onUploadSuccess={handleSuccess}
      />
    </>
  );
};

export default UploadButton;