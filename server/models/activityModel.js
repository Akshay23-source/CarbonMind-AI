/**
 * Carbon Activity Database Schema & Validation Model
 * 
 * Maps activities structure written directly to the Firebase Firestore 'activities' collection.
 */

export const ActivitySchema = {
  userId: { type: 'string', required: true },
  title: { type: 'string', required: true },
  category: { type: 'string', enum: ['travel', 'meal', 'energy', 'waste'], required: true },
  valueKg: { type: 'number', required: true },
  description: { type: 'string', default: '' },
  loggedAt: { type: 'string', default: 'current_timestamp' }
};

/**
 * Validates whether the firestore model matches required criteria.
 * @param activity Payload object
 */
export const validateActivityModel = (activity) => {
  const errors = [];

  if (!activity.userId) errors.push('userId is required');
  if (!activity.title || typeof activity.title !== 'string') errors.push('title must be a non-empty string');
  
  const allowedCategories = ['travel', 'meal', 'energy', 'waste'];
  if (!activity.category || !allowedCategories.includes(activity.category)) {
    errors.push(`category must be one of: ${allowedCategories.join(', ')}`);
  }

  if (typeof activity.valueKg !== 'number' || activity.valueKg < 0) {
    errors.push('valueKg must be a non-negative number');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};
export default validateActivityModel;
