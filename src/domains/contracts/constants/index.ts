export const CONTRACT_CONSTANTS = {
  DEFAULT_VALIDITY_DAYS: 365, // Default contract validity in days
  MIN_TITLE_LENGTH: 10,
  MAX_TITLE_LENGTH: 200,
  MIN_TERMS_COUNT: 1,
  MAX_TERMS_COUNT: 50,
  MAX_AMENDMENT_COUNT: 10,
  DIGITAL_SIGNATURE_LENGTH: 64, // Placeholder for signature data length
};

export const CONTRACT_EVENT_MESSAGES = {
  CREATED: 'Contract successfully created.',
  SIGNED: 'Contract successfully signed.',
  AMENDED: 'Contract successfully amended.',
  TERMINATED: 'Contract terminated.',
  EXPIRED: 'Contract has expired.',
  RENEWED: 'Contract successfully renewed.',
};
