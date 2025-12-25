import { apiClient, ApiError } from './api';

/**
 * Payment Service - Backend API İşlemleri
 */
export const PaymentService = {
  /**
   * Öğrencinin ödeme bilgilerini getir
   * @param {string|number} studentId - Öğrenci ID'si
   * @returns {Promise<Array>} Ödeme listesi
   */
  async getStudentPayments(studentId) {
    try {
      // Backend endpoint'ini buraya ekleyin
      // Örnek: const response = await apiClient.get(`/Payments/student/${studentId}`);
      // Şimdilik boş array döndürüyoruz, backend bağlandığında güncellenecek
      const response = await apiClient.get(`/Payments/student/${studentId}`);
      return response.data || [];
    } catch (error) {
      // 404 durumunda boş array döndür (öğrencinin ödemesi yoksa)
      if (error.response?.status === 404) {
        return [];
      }
      console.error(`Öğrenci ${studentId} ödemeleri yüklenirken hata:`, error);
      return [];
    }
  },

  /**
   * Öğrencinin ödeme durumunu hesapla (toplam borç > 0 ise unpaid)
   * @param {Array} payments - Ödeme listesi
   * @returns {string} 'paid' veya 'unpaid'
   */
  calculatePaymentStatus(payments) {
    if (!payments || payments.length === 0) {
      return 'unpaid'; // Ödeme yoksa unpaid
    }

    const totalDebt = payments.reduce((sum, payment) => {
      const total = (payment.fee || 0) + (payment.equipment || 0);
      const paid = payment.paid || 0;
      const debt = total - paid;
      return sum + debt;
    }, 0);

    return totalDebt > 0 ? 'unpaid' : 'paid';
  }
};

