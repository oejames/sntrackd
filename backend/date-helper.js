// Convert relative time to actual date
function parseRelativeTime(relativeTime) {
    const now = new Date();
    const units = {
      'minute': 60 * 1000,
      'hour': 60 * 60 * 1000,
      'day': 24 * 60 * 60 * 1000,
      'week': 7 * 24 * 60 * 60 * 1000,
      'month': 30 * 24 * 60 * 60 * 1000,
      'year': 365 * 24 * 60 * 60 * 1000
    };
  
    // Handle "Streamed X time ago" format
    relativeTime = relativeTime.replace('Streamed ', '');
    
    // Handle "X time ago" format
    if (relativeTime.includes('ago')) {
      const [amount, unit] = relativeTime.replace(' ago', '').split(' ');
      const baseUnit = unit.replace(/s$/, ''); // Remove plural 's'
      const milliseconds = units[baseUnit] * parseInt(amount);
      return new Date(now.getTime() - milliseconds);
    }
    
    // If it's not a relative time, return the original time
    return now;
  }
  
  module.exports = { parseRelativeTime };