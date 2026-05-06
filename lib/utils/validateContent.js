export const VALIDATION_RULES = {
  title: { min: 5, max: 200 },
  content: { min: 20, max: 50000 },
  summary: { min: 0, max: 500 },
  tags: { max: 5 },
};

export function validateContent({ title, content, summary = '', tags = [] }) {
  const errors = [];

  if (!title || title.trim().length < VALIDATION_RULES.title.min) {
    errors.push(`Title must be at least ${VALIDATION_RULES.title.min} characters`);
  }
  if (title && title.trim().length > VALIDATION_RULES.title.max) {
    errors.push(`Title must be under ${VALIDATION_RULES.title.max} characters`);
  }

  if (!content || content.trim().length < VALIDATION_RULES.content.min) {
    errors.push(`Content must be at least ${VALIDATION_RULES.content.min} characters`);
  }
  if (content && content.trim().length > VALIDATION_RULES.content.max) {
    errors.push(`Content must be under ${VALIDATION_RULES.content.max} characters`);
  }

  if (summary && summary.length > VALIDATION_RULES.summary.max) {
    errors.push(`Summary must be under ${VALIDATION_RULES.summary.max} characters`);
  }

  if (tags.length > VALIDATION_RULES.tags.max) {
    errors.push(`Maximum ${VALIDATION_RULES.tags.max} tags allowed`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateField(field, value) {
  const rules = VALIDATION_RULES[field];
  if (!rules) return { isValid: true, error: null };

  if (rules.min !== undefined && (!value || value.length < rules.min)) {
    return { isValid: false, error: `${field} must be at least ${rules.min} characters` };
  }
  if (rules.max !== undefined && value && value.length > rules.max) {
    return { isValid: false, error: `${field} must be under ${rules.max} characters` };
  }

  return { isValid: true, error: null };
}