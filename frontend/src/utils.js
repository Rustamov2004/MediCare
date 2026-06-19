export const formatPhone = (val) => {
    if (!val) return '+998';
    
    // Barcha raqam bo'lmagan belgilarni o'chirish (faqat raqamlar qoladi)
    let digits = val.replace(/\D/g, '');
    
    if (!digits) return '+998';

    // 998 bilan boshlanishiga ishonch hosil qilish
    if (!digits.startsWith('998')) {
        digits = '998' + digits;
    }
    
    // Maksimal 12 ta raqam (998 + 9 ta raqam)
    if (digits.length > 12) {
        digits = digits.slice(0, 12);
    }
    
    // Formatlash: +998-XX-XXX-XX-XX
    let formatted = '+' + digits.substring(0, 3);
    
    if (digits.length > 3) {
        formatted += '-' + digits.substring(3, 5);
    }
    if (digits.length > 5) {
        formatted += '-' + digits.substring(5, 8);
    }
    if (digits.length > 8) {
        formatted += '-' + digits.substring(8, 10);
    }
    if (digits.length > 10) {
        formatted += '-' + digits.substring(10, 12);
    }
    
    return formatted;
};

export const formatPrice = (val) => {
    if (!val) return '';
    
    // Stringga o'g'irish va faqat raqamlarni qoldirish
    let digits = String(val).replace(/\D/g, '');
    
    if (!digits) return '';
    
    // Orqa tomondan boshlab har 3ta raqamdan keyin probel qo'shish
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

export const parsePrice = (val) => {
    if (!val) return 0;
    const digits = String(val).replace(/\D/g, '');
    return parseInt(digits, 10) || 0;
};

export const isValidPhone = (val) => {
    if (!val) return false;
    const digits = String(val).replace(/\D/g, '');
    return digits.length === 12; // 998 + 9 ta raqam
};

