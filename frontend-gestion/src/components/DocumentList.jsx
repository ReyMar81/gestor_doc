import React, { useState, useEffect } from 'react';
import { SimpleGrid, Text, Loader, Center } from '@mantine/core';
import DocumentItem from './DocumentItem';
import { useAuth } from '../context/AuthContext';
import { getDocuments } from '../api/documentService';

// 1. Las props 'selectedFolderId' y 'selectedTagId' ya se están aceptando
const DocumentList = ({ searchQuery, refetchTrigger, onDataChange, selectedFolderId, selectedTagId }) => {  
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    const loadDocuments = async () => {
      try {
        setLoading(true);
        
        // --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
        // 2. Pasar 'selectedTagId' a la función getDocuments
        const data = await getDocuments(searchQuery, selectedFolderId, selectedTagId); 
        // ---------------------------------
        
        setDocuments(data);
      } catch (err) {
        setError('No se pudieron cargar los documentos.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();

  // 3. El array de dependencias ya es correcto
  }, [authLoading, searchQuery, refetchTrigger, selectedFolderId, selectedTagId]); 

  // ... (el resto de tu componente para manejar 'loading', 'error', y 'document.length === 0') ...
  if (authLoading || loading) {
    return (
      <Center style={{ height: 200 }}>
        <Loader />
      </Center>
    );
  }

  if (error) {
    return <Text c="red">{error}</Text>;
  }

  if (documents.length === 0) {
    return <Text>No se encontraron documentos.</Text>;
  }

  return (
    <SimpleGrid
      cols={{ base: 1, sm: 2, md: 3 }}
      spacing="md"
    >
      {documents.map((doc) => (
        <DocumentItem
          key={doc.id}
          document={doc}
          onDeleteSuccess={onDataChange}
        />
      ))}
    </SimpleGrid>
  );
};

export default DocumentList;