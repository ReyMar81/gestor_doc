// src/context/StorageContext.jsx
import React, { createContext, useContext } from 'react';

// Storage Helper que funciona tanto en Claude como en desarrollo local
class StorageHelper {
  constructor() {
    this.isClaudeStorage = typeof window !== 'undefined' && window.storage;
    console.log(`📦 Storage inicializado: ${this.isClaudeStorage ? 'Claude Storage' : 'localStorage'}`);
  }

  async get(key, shared = false) {
    if (this.isClaudeStorage) {
      try {
        return await window.storage.get(key, shared);
      } catch (error) {
        console.warn(`⚠️ Key no encontrada en Claude Storage: ${key}`);
        return null;
      }
    } else {
      // Fallback a localStorage
      try {
        const value = localStorage.getItem(key);
        return value ? { key, value, shared } : null;
      } catch (error) {
        console.error(`❌ Error en localStorage.get para ${key}:`, error);
        return null;
      }
    }
  }

  async set(key, value, shared = false) {
    if (this.isClaudeStorage) {
      try {
        return await window.storage.set(key, value, shared);
      } catch (error) {
        console.error(`❌ Error en window.storage.set para ${key}:`, error);
        return null;
      }
    } else {
      // Fallback a localStorage
      try {
        localStorage.setItem(key, value);
        return { key, value, shared };
      } catch (error) {
        console.error(`❌ Error en localStorage.set para ${key}:`, error);
        return null;
      }
    }
  }

  async delete(key, shared = false) {
    if (this.isClaudeStorage) {
      try {
        return await window.storage.delete(key, shared);
      } catch (error) {
        console.error(`❌ Error en window.storage.delete para ${key}:`, error);
        return null;
      }
    } else {
      // Fallback a localStorage
      try {
        localStorage.removeItem(key);
        return { key, deleted: true, shared };
      } catch (error) {
        console.error(`❌ Error en localStorage.delete para ${key}:`, error);
        return null;
      }
    }
  }

  async list(prefix = '', shared = false) {
    if (this.isClaudeStorage) {
      try {
        return await window.storage.list(prefix, shared);
      } catch (error) {
        console.error(`❌ Error en window.storage.list para ${prefix}:`, error);
        return { keys: [], prefix, shared };
      }
    } else {
      // Fallback a localStorage
      try {
        const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix));
        return { keys, prefix, shared };
      } catch (error) {
        console.error(`❌ Error en localStorage.list para ${prefix}:`, error);
        return { keys: [], prefix, shared };
      }
    }
  }
}

// Crear contexto
const StorageContext = createContext(null);

// Provider
export const StorageProvider = ({ children }) => {
  const storage = new StorageHelper();
  
  return (
    <StorageContext.Provider value={storage}>
      {children}
    </StorageContext.Provider>
  );
};

// Hook personalizado
export const useStorage = () => {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage debe usarse dentro de StorageProvider');
  }
  return context;
};

export default StorageContext;