/**
 * ===================================================================
 * DERMEVIA LABS - RATE LIMIT VALIDATION FUNCTION
 * Server-side Rate Limiting Check
 * ===================================================================
 */

const crypto = require('crypto');

// ===================================================================
// CONFIGURATION
// ===================================================================
const CONFIG = {
  MAX_REQUESTS_PER_HOUR: 5,
  MAX_REQUESTS_PER_DAY: 10,
  RATE_LIMIT_WINDOW: 3600000, // 1 hour
  DAILY_LIMIT_WINDOW: 86400000, // 24 hours
  
  ALLOWED_ORIGINS: [
    'https://zenabiodz.com',
    'https://www.zenabiodz.com',
    'http://localhost:8888',
    'http://127.0.0.1:8888'
  ]
};

// In-memory storage (shared with submit-form function)
const rateStore = new Map();

// ===================================================================
// UTILITY FUNCTIONS
// ===================================================================

/**
 * Generate secure hash for rate limiting
 */
function generateSecureHash(ip, phone) {
  const secret = process.env.RATE_LIMIT_SECRET || 'dermevia_default_secret';
  return crypto
    .createHmac('sha256', secret)
    .update(`${ip}:${phone}`)
    .digest('hex')
    .substring(0, 16);
}

/**
 * Get client IP address
 */
function getClientIP(event) {
  const forwarded = event.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return event.headers['x-nf-client-connection-ip'] || 
         event.headers['client-ip'] || 
         '127.0.0.1';
}

/**
 * Validate CORS origin
 */
function isValidOrigin(origin) {
  if (!origin) return false;
  return CONFIG.ALLOWED_ORIGINS.includes(origin);
}

/**
 * Check rate limiting
 */
function checkRateLimit(identifier) {
  const now = Date.now();
  const userRequests = rateStore.get(identifier) || [];
  
  // Clean old requests
  const validRequests = userRequests.filter(
    timestamp => (now - timestamp) < CONFIG.DAILY_LIMIT_WINDOW
  );
  
  // Check hourly limit
  const hourlyRequests = validRequests.filter(
    timestamp => (now - timestamp) < CONFIG.RATE_LIMIT_WINDOW
  );
  
  // Check daily limit
  const dailyCount = validRequests.length;
  const hourlyCount = hourlyRequests.length;
  
  let status = 'allowed';
  let timeLeft = 0;
  let reason = null;
  
  if (hourlyCount >= CONFIG.MAX_REQUESTS_PER_HOUR) {
    status = 'blocked';
    reason = 'hourly_limit';
    const oldestRequest = Math.min(...hourlyRequests);
    timeLeft = CONFIG.RATE_LIMIT_WINDOW - (now - oldestRequest);
  } else if (dailyCount >= CONFIG.MAX_REQUESTS_PER_DAY) {
    status = 'blocked';
    reason = 'daily_limit';
    const oldestRequest = Math.min(...validRequests);
    timeLeft = CONFIG.DAILY_LIMIT_WINDOW - (now - oldestRequest);
  }
  
  return {
    status,
    allowed: status === 'allowed',
    reason,
    timeLeft,
    counts: {
      hourly: hourlyCount,
      daily: dailyCount,
      maxHourly: CONFIG.MAX_REQUESTS_PER_HOUR,
      maxDaily: CONFIG.MAX_REQUESTS_PER_DAY
    },
    nextResetHourly: now + CONFIG.RATE_LIMIT_WINDOW,
    nextResetDaily: now + CONFIG.DAILY_LIMIT_WINDOW
  };
}

// ===================================================================
// MAIN HANDLER
// ===================================================================
exports.handler = async (event, context) => {
  const startTime = Date.now();
  
  try {
    const origin = event.headers.origin || event.headers.Origin;
    
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': isValidOrigin(origin) ? origin : CONFIG.ALLOWED_ORIGINS[0],
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
          'Access-Control-Max-Age': '86400'
        },
        body: ''
      };
    }
    
    // Only allow GET and POST
    if (!['GET', 'POST'].includes(event.httpMethod)) {
      return {
        statusCode: 405,
        headers: {
          'Access-Control-Allow-Origin': isValidOrigin(origin) ? origin : CONFIG.ALLOWED_ORIGINS[0],
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          success: false, 
          error: 'Method not allowed' 
        })
      };
    }
    
    // Get parameters
    let phone, ip;
    
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      phone = body.phone;
    } else {
      phone = event.queryStringParameters?.phone;
    }
    
    ip = getClientIP(event);
    
    // Validate phone parameter
    if (!phone || !/^(05|06|07)[0-9]{8}$/.test(phone.replace(/\D/g, ''))) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': isValidOrigin(origin) ? origin : CONFIG.ALLOWED_ORIGINS[0],
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          success: false, 
          error: 'Invalid phone number' 
        })
      };
    }
    
    // Generate rate limit identifier
    const rateLimitId = generateSecureHash(ip, phone);
    
    // Check rate limit
    const result = checkRateLimit(rateLimitId);
    
    const processingTime = Date.now() - startTime;
    
    // Return result
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': isValidOrigin(origin) ? origin : CONFIG.ALLOWED_ORIGINS[0],
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': CONFIG.MAX_REQUESTS_PER_HOUR.toString(),
        'X-RateLimit-Remaining': Math.max(0, CONFIG.MAX_REQUESTS_PER_HOUR - result.counts.hourly).toString(),
        'X-RateLimit-Reset': Math.ceil(result.nextResetHourly / 1000).toString(),
        'X-Processing-Time': processingTime.toString()
      },
      body: JSON.stringify({
        success: true,
        rateLimit: {
          ...result,
          identifier: rateLimitId.substring(0, 8) + '***', // Partial ID for debugging
          serverTime: Date.now(),
          processingTime
        }
      })
    };
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    console.error('Rate limit check error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': CONFIG.ALLOWED_ORIGINS[0],
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        processingTime 
      })
    };
  }
};