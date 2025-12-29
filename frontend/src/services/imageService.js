import { apiClient, ApiError } from './api';

/**
 * Image Service - Profile Image API Operations
 * Handles student profile image GET and PUT operations
 */
export const ImageService = {
  /**
   * Get student profile image
   * @param {string|number} studentId - The student ID
   * @returns {Promise<string|null>} Base64 encoded image string or null
   */
  async getProfileImage(studentId) {
    try {
      const response = await apiClient.get(`/StudentPersonalInfo/${studentId}/profile-image`);
      
      // Backend returns { profileImageBase64: "data:image/jpeg;base64,..." }
      if (response.data && response.data.profileImageBase64) {
        return response.data.profileImageBase64;
      }
      
      return null;
    } catch (error) {
      // If 404, student doesn't have an image yet - this is normal
      if (error.response?.status === 404) {
        return null;
      }
      
      throw new ApiError(
        error.response?.data?.message || 'Profil resmi alınırken hata oluştu'
      );
    }
  },

  /**
   * Upload/Update student profile image
   * @param {string|number} studentId - The student ID
   * @param {string} imageBase64 - Base64 encoded image string (with data:image/... prefix)
   * @returns {Promise<Object>} Success response
   */
  async uploadProfileImage(studentId, imageBase64) {
    try {
      // Ensure the image has the data URI prefix
      if (!imageBase64.startsWith('data:image/')) {
        throw new ApiError('Geçersiz resim formatı. Base64 veri URI olmalı.');
      }

      const response = await apiClient.put(
        `/StudentPersonalInfo/${studentId}/profile-image`,
        {
          profileImageBase64: imageBase64
        }
      );
      
      return {
        success: true,
        message: response.data?.message || 'Profil resmi başarıyla güncellendi',
        data: response.data
      };
    } catch (error) {
      throw new ApiError(
        error.response?.data?.message || 'Profil resmi yüklenirken hata oluştu'
      );
    }
  },

  /**
   * Convert file to base64 string
   * @param {File} file - The image file
   * @returns {Promise<string>} Base64 encoded image string
   */
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('Dosya bulunamadı'));
        return;
      }

      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        reject(new Error('Sadece resim dosyaları yüklenebilir'));
        return;
      }

      // Check file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        reject(new Error('Dosya boyutu çok büyük (Max: 5MB)'));
        return;
      }

      const reader = new FileReader();
      
      reader.onloadend = () => {
        resolve(reader.result);
      };
      
      reader.onerror = () => {
        reject(new Error('Dosya okuma hatası'));
      };
      
      reader.readAsDataURL(file);
    });
  },

  /**
   * Validate image base64 string
   * @param {string} base64String - Base64 encoded image string
   * @returns {boolean} True if valid
   */
  isValidImageBase64(base64String) {
    if (!base64String || typeof base64String !== 'string') {
      return false;
    }
    
    // Check if it starts with data:image/
    return base64String.startsWith('data:image/');
  }
};

export default ImageService;

