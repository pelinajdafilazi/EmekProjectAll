import React, { useState, useEffect } from 'react';
import { ImageService } from '../../../services/imageService';

/**
 * StudentImage Component
 * Loads student profile image from the backend image endpoint
 * Falls back to student.photo if available, then to mock avatars
 */
export default function StudentImage({ student, alt, className, style, ...imgProps }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadImage = async () => {
      if (!student || !student.id) {
        // No student or ID, use fallback
        setImageSrc(getFallbackAvatar(student));
        setIsLoading(false);
        return;
      }

      // First, try to load from image endpoint
      try {
        const profileImage = await ImageService.getProfileImage(student.id);
        if (profileImage && ImageService.isValidImageBase64(profileImage)) {
          setImageSrc(profileImage);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        // 404 is expected if no image exists, other errors are logged
        if (error.response?.status !== 404) {
          console.warn('Image load error for student', student.id, error);
        }
      }

      // Second, check if student already has a photo (base64 or URL)
      if (student.photo) {
        // Check if it's a valid base64 or URL
        if (student.photo.startsWith('data:image/') || 
            student.photo.startsWith('http') || 
            student.photo.startsWith('/')) {
          setImageSrc(student.photo);
          setIsLoading(false);
          return;
        }
      }

      // Check other photo fields
      const photoFields = [
        student.photoUrl,
        student.photoBase64,
        student.profileImageBase64,
        student._backendData?.photo,
        student._backendData?.photoUrl,
        student._backendData?.photoBase64,
        student._backendData?.profileImageBase64
      ];

      for (const photo of photoFields) {
        if (photo && (photo.startsWith('data:image/') || photo.startsWith('http') || photo.startsWith('/'))) {
          setImageSrc(photo);
          setIsLoading(false);
          return;
        }
      }

      // Final fallback to mock avatar
      setImageSrc(getFallbackAvatar(student));
      setIsLoading(false);
    };

    loadImage();
  }, [student?.id, student?.photo]);

  // Helper function to get fallback avatar
  const getFallbackAvatar = (student) => {
    if (!student || !student.id) {
      return '/avatars/student-1.svg';
    }

    const avatars = [
      '/avatars/student-1.svg',
      '/avatars/student-2.svg',
      '/avatars/student-3.svg',
      '/avatars/student-4.svg',
      '/avatars/student-5.svg',
      '/avatars/student-6.svg',
      '/avatars/student-7.svg',
      '/avatars/student-8.svg',
      '/avatars/student-9.svg'
    ];

    // Use student ID to deterministically select avatar
    const studentId = String(student.id || student._backendData?.id || '');
    const idNum = parseInt(studentId.replace(/\D/g, '')) || 
                  studentId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const avatarIndex = idNum % avatars.length;
    return avatars[avatarIndex];
  };

  if (isLoading && !imageSrc) {
    // Show placeholder while loading
    return (
      <img
        src={getFallbackAvatar(student)}
        alt={alt || student?.name || 'Öğrenci'}
        className={className}
        style={{ opacity: 0.5, ...style }}
        {...imgProps}
      />
    );
  }

  return (
    <img
      src={imageSrc || getFallbackAvatar(student)}
      alt={alt || student?.name || 'Öğrenci'}
      className={className}
      style={style}
      onError={(e) => {
        // If image fails to load, use fallback
        e.target.src = getFallbackAvatar(student);
      }}
      {...imgProps}
    />
  );
}

