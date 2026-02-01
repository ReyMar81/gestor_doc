import apiClient from "./axiosConfig";


/**
 * Envía un prompt al asistente de IA
 */
export const sendAIPrompt = async (prompt) => {
    try {
        const response = await apiClient.post('/ai-assistant/', {
            prompt: prompt
        });
        return response.data;
    } catch (error) {
        console.error('Error al comunicarse con la IA:', error);
        throw error;
    }
};