import { apiClient, ApiError } from './api';

// Tarih formatını dönüştür: ISO date -> "Kasım 2024"
function formatDateToMonthYear(isoDate) {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

// Tarih formatını dönüştür: ISO date -> "19.11.2024"
function formatDateToDDMMYYYY(isoDate) {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

/**
 * Payment Service - Backend API İşlemleri
 */
export const PaymentService = {
  /**
   * Öğrencinin ödeme bilgilerini getir (detaylı)
   * @param {string|number} studentId - Öğrenci ID'si
   * @returns {Promise<Object>} Öğrenci ve borç bilgileri
   */
  async getStudentPaymentDetails(studentId) {
    try {
      const response = await apiClient.get(`/Debts/student/${studentId}/details`);
      // Backend'den gelen veriyi frontend formatına dönüştür
      const data = response.data || {};
      const allDebts = data.allDebts || [];
      
      return {
        student: data.student || {},
        totalDebt: data.totalDebt || 0,
        debts: allDebts.map(debt => ({
          debtId: debt.debtId || debt.id,
          dueDate: debt.dueDate ? new Date(debt.dueDate) : null,
          dateOfPayment: debt.dateOfPayment ? new Date(debt.dateOfPayment) : null,
          fee: debt.monthlyTuitionFee || 0,
          equipment: debt.materialFee || 0,
          paid: debt.amountPaid || 0,
          debt: debt.deptAmount || 0,
          isPaid: debt.isPaid || false
        }))
      };
    } catch (error) {
      // 404 durumunda boş obje döndür (öğrencinin ödemesi yoksa)
      if (error.response?.status === 404) {
        return { student: {}, totalDebt: 0, debts: [] };
      }
      console.error(`Öğrenci ${studentId} ödeme detayları yüklenirken hata:`, error);
      return { student: {}, totalDebt: 0, debts: [] };
    }
  },

  /**
   * Öğrencinin ödeme bilgilerini getir (eski metod - geriye dönük uyumluluk için)
   * @param {string|number} studentId - Öğrenci ID'si
   * @returns {Promise<Array>} Ödeme listesi
   */
  async getStudentPayments(studentId) {
    try {
      const response = await apiClient.get(`/Debts/student/${studentId}`);
      // Backend'den gelen veriyi frontend formatına dönüştür
      const debts = response.data || [];
      return debts.map(debt => ({
        debtId: debt.debtId || debt.id,
        dueDate: debt.dueDate ? new Date(debt.dueDate) : null,
        dateOfPayment: debt.dateOfPayment ? new Date(debt.dateOfPayment) : null,
        monthlyTuitionFee: debt.monthlyTuitionFee || 0,
        materialFee: debt.materialFee || 0,
        amountPaid: debt.amountPaid || 0,
        deptAmount: debt.deptAmount || 0,
        isPaid: debt.isPaid || false,
        // Eski format için (geriye dönük uyumluluk)
        monthYear: debt.dueDate ? formatDateToMonthYear(new Date(debt.dueDate)) : '',
        paymentDate: debt.dateOfPayment ? formatDateToDDMMYYYY(new Date(debt.dateOfPayment)) : '',
        fee: debt.monthlyTuitionFee || 0,
        equipment: debt.materialFee || 0,
        paid: debt.amountPaid || 0
      }));
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
   * Grup ve tarih aralığına göre borç bilgilerini getir
   * @param {string|null} groupId - Grup ID'si (null ise tüm gruplar)
   * @param {number} year - Yıl
   * @param {number} month - Ay (1-12)
   * @returns {Promise<Array>} Borç bilgileri listesi
   */
  async getGroupPeriodDebts(groupId, year, month) {
    try {
      // Ay bilgisini 1-12 arası sayı olarak garanti et (string değil)
      const monthNumber = typeof month === 'string' ? parseInt(month, 10) : Number(month);
      const yearNumber = typeof year === 'string' ? parseInt(year, 10) : Number(year);
      
      // Ay 1-12 arası olmalı
      if (isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
        console.warn(`Geçersiz ay değeri: ${monthNumber}. 1-12 arası olmalı.`);
        return [];
      }
      
      if (isNaN(yearNumber) || yearNumber < 2000 || yearNumber > 2100) {
        console.warn(`Geçersiz yıl değeri: ${yearNumber}.`);
        return [];
      }
      
      const params = {
        year: yearNumber, // Sayı olarak gönder
        month: monthNumber // Backend'e 1-12 arası sayı olarak gönder
      };
      
      // Eğer groupId null değilse ekle (tüm gruplar için groupId gönderme)
      if (groupId) {
        params.groupId = groupId;
      }
      
      // Debug: Backend'e gönderilen parametreleri logla
      console.log('Backend\'e gönderilen parametreler:', {
        year: params.year,
        month: params.month,
        yearType: typeof params.year,
        monthType: typeof params.month,
        groupId: params.groupId || null
      });
      
      const response = await apiClient.get('/Debts/group-period-filter', {
        params: params
      });
      
      // Debug: Backend'den gelen response'u logla
      console.log('Backend\'den gelen response:', response.data);
      
      return response.data || [];
    } catch (error) {
      console.error(`Grup ${groupId || 'Tüm Grup'} için ${year}/${month} borç bilgileri yüklenirken hata:`, error);
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
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
  },

  /**
   * Yeni ödeme ekle (POST)
   * @param {Object} paymentData - Ödeme verisi
   * @param {string} paymentData.studentId - Öğrenci ID'si
   * @param {string} paymentData.dueDate - Vade tarihi (ISO format)
   * @param {number} paymentData.monthlyTuitionFee - Aylık ücret
   * @param {number} paymentData.materialFee - Malzeme ücreti
   * @param {number} paymentData.amountPaid - Yapılan ödeme
   * @param {string} paymentData.dateOfPayment - Ödeme tarihi (ISO format)
   * @returns {Promise<Object>} Oluşturulan ödeme
   */
  async createPayment(paymentData) {
    try {
      const response = await apiClient.post('/Debts', {
        studentId: paymentData.studentId,
        dueDate: paymentData.dueDate,
        monthlyTuitionFee: paymentData.monthlyTuitionFee || 0,
        materialFee: paymentData.materialFee || 0,
        amountPaid: paymentData.amountPaid || 0,
        dateOfPayment: paymentData.dateOfPayment
      });
      return response.data;
    } catch (error) {
      console.error('Ödeme oluşturulurken hata:', error);
      throw error;
    }
  },

  /**
   * Ödeme güncelle (PUT)
   * @param {Object} paymentData - Ödeme verisi
   * @param {string} paymentData.debtId - Borç ID'si
   * @param {string} paymentData.studentId - Öğrenci ID'si
   * @param {string} paymentData.dueDate - Vade tarihi (ISO format)
   * @param {number} paymentData.monthlyTuitionFee - Aylık ücret
   * @param {number} paymentData.materialFee - Malzeme ücreti
   * @param {number} paymentData.amountPaid - Yapılan ödeme
   * @param {string} paymentData.dateOfPayment - Ödeme tarihi (ISO format)
   * @returns {Promise<Object>} Güncellenen ödeme
   */
  async updatePayment(paymentData) {
    try {
      const response = await apiClient.put('/Debts', {
        debtId: paymentData.debtId,
        studentId: paymentData.studentId,
        dueDate: paymentData.dueDate,
        monthlyTuitionFee: paymentData.monthlyTuitionFee || 0,
        materialFee: paymentData.materialFee || 0,
        amountPaid: paymentData.amountPaid || 0,
        dateOfPayment: paymentData.dateOfPayment
      });
      return response.data;
    } catch (error) {
      console.error('Ödeme güncellenirken hata:', error);
      throw error;
    }
  }
};

