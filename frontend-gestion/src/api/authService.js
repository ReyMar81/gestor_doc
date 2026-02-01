// authService.js (Forzando el header como prueba)
import apiClient from "./axiosConfig";

// Función de Login (con header forzado)
export const login = async (username, password) => {
    const data = {
        username,
        password,
    };

    // Opciones de configuración para esta llamada específica
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    // Pasamos la data y la configuración
    const response = await apiClient.post('/auth/login/', data, config);
    
    if (response.data.key) {
        localStorage.setItem('authToken', response.data.key);
    }
    return response.data;
};

// --- El resto de tus funciones (register, logout) ---

// UC-01: Registro
export const register = async (username, email, password1, password2) => {
    const response = await apiClient.post('/auth/register/', {
        username,
        email,
        password1: password1, 
        password2,
    });
    return response.data;
};

// UC-03: Cierre de sesión
export const logout = async () => {
  await apiClient.post('/auth/logout/');
};

/**
 * UC-06: Ver datos de usuario
 * Obtiene los datos del usuario autenticado.
 */
export const getUser = async () => {
    try {
        // apiClient ya tiene el token inyectado por AuthContext
        const response = await apiClient.get('/auth/user/');
        return response.data;
    } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
        throw error;
    }
};

/**
 * UC-07/08: Obtiene el perfil extendido del usuario.
 */
export const getProfile = async () => {
    try {
        const response = await apiClient.get('/profile/');
        return response.data;
    } catch (error) {
        console.error('Error al obtener el perfil:', error);
        throw error;
    }
};

/**
 * UC-07/08: Actualiza el perfil extendido del usuario.
 */
export const updateProfile = async (profileData) => {
    try {
        const response = await apiClient.patch('/profile/', profileData);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar el perfil:', error);
        throw error;
    }
};

/**
 * UC-04: Solicitar reseteo de contraseña.
 * Envía un email al usuario con un enlace de reseteo.
 */
export const requestPasswordReset = async (email) => {
    try {
        const response = await apiClient.post('/auth/password/reset/', { email });
        return response.data;
    } catch (error) {
        console.error('Error al solicitar reseteo de contraseña:', error);
        throw error;
    }
};

/**
 * UC-04: Confirmar nueva contraseña.
 * Envía la nueva contraseña junto con el uid y token de la URL.
 */
export const confirmPasswordReset = async (new_password1, new_password2, uid, token) => {
    try {
        const response = await apiClient.post('/auth/password/reset/confirm/', {
            new_password1,
            new_password2,
            uid,
            token,
        });
        return response.data;
    } catch (error) {
        console.error('Error al confirmar la nueva contraseña:', error);
        throw error;
    }
};

/**
 * SIMULACIÓN DE PAGO:
 * Llama al endpoint que convierte al usuario en Premium instantáneamente.
 */
export const upgradeToPremium = async () => {
    try {
        const response = await apiClient.post('/upgrade-premium/');
        return response.data;
    } catch (error) {
        console.error('Error al procesar el pago simulado:', error);
        throw error;
    }
};