/**
 * Project One Solution: Business Validators
 */

export const Validators = {
  /**
   * GSTIN (Goods and Services Tax Identification Number) Validator
   * Format: 22AAAAA0000A1Z5
   */
  isValidGSTIN: (gstin: string): boolean => {
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin);
  },

  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidPhone: (phone: string): boolean => {
    // International format support
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  },

  isValidOrgName: (name: string): boolean => {
    return name.length >= 3 && name.length <= 100;
  },

  isValidAmount: (amount: number): boolean => {
    return amount > 0 && Number.isFinite(amount);
  },

  isValidRFQQuantity: (quantity: number): boolean => {
    return quantity > 0 && Number.isInteger(quantity);
  }
};
