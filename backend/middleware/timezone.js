export const convertToUserTimezone = (date, timezone = 'UTC') => {
  if (!date) return null;
  
  try {
    const utcDate = new Date(date);
    return new Date(utcDate.toLocaleString('en-US', { timeZone: timezone }));
  } catch (error) {
    console.error('Error converting timezone:', error);
    return new Date(date);
  }
};

export const formatDateForUser = (date, timezone = 'UTC', locale = 'ru-RU') => {
  if (!date) return null;
  
  try {
    const userDate = convertToUserTimezone(date, timezone);
    return userDate.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: timezone
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return new Date(date).toLocaleDateString(locale);
  }
};

export const getStartOfDayInTimezone = (timezone = 'UTC') => {
  const now = new Date();
  const userNow = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
  userNow.setHours(0, 0, 0, 0);
  return userNow;
};

export const getEndOfDayInTimezone = (timezone = 'UTC') => {
  const now = new Date();
  const userNow = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
  userNow.setHours(23, 59, 59, 999);
  return userNow;
};

export const userTimezoneMiddleware = (req, res, next) => {
  if (req.headers['user-timezone']) {
    req.userTimezone = req.headers['user-timezone'];
  } else {
    req.userTimezone = 'UTC';
  }
  next();
};

export default {
  convertToUserTimezone,
  formatDateForUser,
  getStartOfDayInTimezone,
  getEndOfDayInTimezone,
  userTimezoneMiddleware
};