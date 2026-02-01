import apiClient from "./axiosConfig";

/**
 * UC-13: Listar carpetas raíz
 */
export const getFolders = async () => {
    try {
        // Llama al endpoint que solo devuelve las carpetas raíz
        const response = await apiClient.get('/folders/');
        return response.data;
    } catch (error) {
        console.error('Error al obtener las carpetas:', error);
        throw error;
    }
};

/**
 * NUEVO: Obtiene una lista plana de TODAS las carpetas
 * (Usado para el modal de subida)
 */
export const getAllFoldersFlat = async () => {
    try {
        const response = await apiClient.get('/folders/list-all/');
        return response.data;
    } catch (error) {
        console.error('Error al obtener la lista de carpetas:', error);
        throw error;
    }
};

/**
 * UC-14: Listar Etiquetas
 */
export const getTags = async () => {
    try {
        const response = await apiClient.get('/tags/');
        return response.data;
    } catch (error) {
        console.error('Error al obtener las etiquetas:', error);
        throw error;
    }
};

/**
 * UC-15: Listar y Buscar Documentos
 */
export const getDocuments = async (searchQuery, folderId, tagId) => {
    try {
        const params = new URLSearchParams();
        if (searchQuery) {
            params.append('search', searchQuery);
        }
        if (folderId) {
            params.append('folder', folderId);
        }
        if (tagId) { // 2. Ahora 'tagId' sí está definido
            params.append('tags', tagId);
        }
        
        const response = await apiClient.get('/documents/', { params });
        return response.data;
    } catch (error) {
        console.error('Error al obtener los documentos:', error);
        throw error;
    }
};
/**
 * UC-09: Subir Documento (Actualizado)
 * Sube un nuevo archivo, ahora aceptando un folderId opcional.
 */
export const uploadDocument = async (file, folderId) => {
    const formData = new FormData();
    formData.append('file', file);

    // Si se proporciona un folderId, lo añadimos al FormData
    if (folderId) {
        formData.append('folder', folderId);
    }

    try {
        const response = await apiClient.post('/documents/', formData, {
            headers: {
                'Content-Type': null, // Permite al navegador setear el multipart/form-data
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error al subir el documento:', error);
        throw error;
    }
};

/**
 * UC-11: Eliminar Documento
 */
export const deleteDocument = async (documentId) => {
    try {
        await apiClient.delete(`/documents/${documentId}/`);
    } catch (error) {
        console.error('Error al eliminar el documento:', error);
        throw error;
    }
};

/**
 * UC-16: Compartir un Documento
 */
export const shareDocument = async (documentId, email, permissionLevel) => {
    try {
        const response = await apiClient.post(
            `/documents/${documentId}/share/`, 
            {
                email: email,
                permission_level: permissionLevel,
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error al compartir el documento:', error);
        throw error;
    }
};

/**
 * UC-10: Descargar Documento
 */
export const downloadDocument = async (documentId, filename) => {
    try {
        const response = await apiClient.get(
            `/documents/${documentId}/download/`,
            {
                responseType: 'blob',
            }
        );

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);

    } catch (error) {
        console.error('Error al descargar el documento:', error);
        throw error;
    }
};

export const renameFolder = async (folderId, newName) => {
    try {
        const response = await apiClient.patch(`/folders/${folderId}/`, {
            name: newName,
        });
        return response.data;
    } catch (error) {
        console.error('Error al renombrar la carpeta:', error);
        throw error;
    }
};

/**
 * Elimina una carpeta (Delete).
 */
export const deleteFolder = async (folderId) => {
    try {
        await apiClient.delete(`/folders/${folderId}/`);
    } catch (error) {
        console.error('Error al eliminar la carpeta:', error);
        throw error;
    }
};

export const createFolder = async (name, parentId = null) => {
    try {
        const response = await apiClient.post('/folders/', {
            name: name,
            parent: parentId,
        });
        return response.data;
    } catch (error) {
        console.error('Error al crear la carpeta:', error);
        throw error;
    }
};

export const createTag = async (name) => {
    try {
        const response = await apiClient.post('/tags/', {
            name: name,
        });
        return response.data;
    } catch (error) {
        console.error('Error al crear la etiqueta:', error);
        throw error;
    }
};

export const renameTag = async (tagId, newName) => {
    try {
        const response = await apiClient.patch(`/tags/${tagId}/`, {
            name: newName,
        });
        return response.data;
    } catch (error) {
        console.error('Error al renombrar la etiqueta:', error);
        throw error;
    }
};

/**
 * Elimina una etiqueta (Delete).
 */
export const deleteTag = async (tagId) => {
    try {
        await apiClient.delete(`/tags/${tagId}/`);
    } catch (error) {
        console.error('Error al eliminar la etiqueta:', error);
        throw error;
    }
};

export const assignTagsToDocument = async (documentId, tagIdList) => {
    try {
        const response = await apiClient.patch(`/documents/${documentId}/`, {
            tags: tagIdList, // Envía la lista de IDs de etiquetas
        });
        return response.data;
    } catch (error) {
        console.error('Error al asignar las etiquetas:', error);
        throw error;
    }
};

/**
 * UC-17/18: Traducir un documento completo.
 * Llama a la API para traducir el 'extracted_content' del documento.
 */
export const translateDocument = async (documentId, targetLanguage, sourceLanguage = null) => {
    try {
        const payload = {
            target_language: targetLanguage,
        };
        if (sourceLanguage) {
            payload.source_language = sourceLanguage;
        }
        
        const response = await apiClient.post(
            `/documents/${documentId}/translate-document/`, 
            payload
        );
        return response.data; // Devuelve { translated_text: "...", ... }
    } catch (error) {
        console.error('Error al traducir el documento:', error);
        throw error;
    }
};


/**
 * Obtiene los detalles completos de un solo documento (incl. contenido)
 */
export const getDocumentDetails = async (documentId) => {
  try {
    const response = await apiClient.get(`/documents/${documentId}/`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los detalles del documento:', error);
    throw error;
  }
};

/**
 * Actualiza el contenido extraído de un documento
 */
export const updateDocumentContent = async (documentId, newContent) => {
  try {
    const response = await apiClient.patch(`/documents/${documentId}/`, {
      extracted_content: newContent,
    });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar el documento:', error);
    throw error;
  }
};