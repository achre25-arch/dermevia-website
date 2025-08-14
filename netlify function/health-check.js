/**
 * ===================================================================
 * DERMEVIA LABS - HEALTH CHECK FUNCTION
 * System Status and Monitoring Endpoint
 * ===================================================================
 */

const crypto = require('crypto');

// ===================================================================
// CONFIGURATION
// ===================================================================
const CONFIG = {
  VERSION: '3.0.0',
  SERVICE_NAME: 'Dermevia Secure API',
  ENVIRONMENT: process.env.NODE_ENV || 'development',
  
  // Health check settings
  TELEGRAM_CHECK_TIMEOUT: 5000,
  EXTERNAL_API_TIMEOUT: 3000,
  
  // Status thresholds
  RESPONSE_TIME_WARNING: 1000, // 1 second
  RESPONSE_TIME_CRITICAL: 3000, // 3 seconds
  
  ALLOWED_ORIGINS: [
    'https://zenabiodz.com',
    'https://www.zenabiodz.com',
    'http://localhost:8888',
    'http://127.0.0.1:8888'
  ]
};

// ===================================================================
// UTILITY FUNCTIONS
// ===================================================================

/**
 * Check if origin is allowed
 */
function isValidOrigin(origin) {
  if (!origin) return false;
  return CONFIG.ALLOWED_ORIGINS.includes(origin);
}

/**
 * Get system information
 */
function getSystemInfo() {
  const startTime = Date.now();
  
  return {
    service: CONFIG.SERVICE_NAME,
    version: CONFIG.VERSION,
    environment: CONFIG.ENVIRONMENT,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024),
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
    },
    platform: {
      node: process.version,
      platform: process.platform,
      arch: process.arch
    }
  };
}

/**
 * Check Telegram Bot connectivity
 */
async function checkTelegramBot() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  
  if (!botToken || !chatId) {
    return {
      status: 'warning',
      message: 'Telegram credentials not configured',
      configured: false,
      responseTime: 0
    };
  }
  
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.TELEGRAM_CHECK_TIMEOUT);
    
    const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      const data = await response.json();
      return {
        status: 'healthy',
        message: 'Telegram bot is accessible',
        configured: true,
        responseTime,
        botInfo: {
          id: data.result?.id,
          username: data.result?.username,
          firstName: data.result?.first_name
        }
      };
    } else {
      return {
        status: 'error',
        message: `Telegram API returned ${response.status}`,
        configured: true,
        responseTime,
        error: response.statusText
      };
    }
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'error',
      message: 'Failed to connect to Telegram API',
      configured: true,
      responseTime,
      error: error.message
    };
  }
}

/**
 * Check external dependencies
 */
async function checkExternalDependencies() {
  const checks = [];
  
  // Check IP service
  const ipServiceStart = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.EXTERNAL_API_TIMEOUT);
    
    const response = await fetch('https://api.ipify.org?format=json', {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - ipServiceStart;
    
    if (response.ok) {
      checks.push({
        service: 'IP Detection Service',
        status: 'healthy',
        responseTime,
        url: 'https://api.ipify.org'
      });
    } else {
      checks.push({
        service: 'IP Detection Service',
        status: 'warning',
        responseTime,
        url: 'https://api.ipify.org',
        error: `HTTP ${response.status}`
      });
    }
  } catch (error) {
    checks.push({
      service: 'IP Detection Service',
      status: 'error',
      responseTime: Date.now() - ipServiceStart,
      url: 'https://api.ipify.org',
      error: error.message
    });
  }
  
  return checks;
}

/**
 * Check configuration
 */
function checkConfiguration() {
  const requiredEnvVars = [
    'TELEGRAM_BOT_TOKEN',
    'TELEGRAM_CHAT_ID',
    'RATE_LIMIT_SECRET'
  ];
  
  const optionalEnvVars = [
    'ENCRYPTION_KEY',
    'ALLOWED_ORIGINS',
    'MAX_ORDERS_PER_HOUR',
    'MAX_ORDERS_PER_DAY'
  ];
  
  const config = {
    required: {},
    optional: {},
    missing: [],
    warnings: []
  };
  
  // Check required variables
  requiredEnvVars.forEach(varName => {
    if (process.env[varName]) {
      config.required[varName] = '✓ Set';
    } else {
      config.required[varName] = '✗ Missing';
      config.missing.push(varName);
    }
  });
  
  // Check optional variables
  optionalEnvVars.forEach(varName => {
    if (process.env[varName]) {
      config.optional[varName] = '✓ Set';
    } else {
      config.optional[varName] = '- Not set';
      config.warnings.push(`${varName} not configured, using default`);
    }
  });
  
  return config;
}

/**
 * Perform comprehensive health check
 */
async function performHealthCheck() {
  const startTime = Date.now();
  const results = {
    overall: 'healthy',
    timestamp: new Date().toISOString(),
    responseTime: 0,
    system: getSystemInfo(),
    services: {},
    configuration: checkConfiguration(),
    dependencies: [],
    warnings: [],
    errors: []
  };
  
  try {
    // Check Telegram
    results.services.telegram = await checkTelegramBot();
    if (results.services.telegram.status === 'error') {
      results.errors.push('Telegram service unavailable');
      results.overall = 'degraded';
    } else if (results.services.telegram.status === 'warning') {
      results.warnings.push('Telegram not fully configured');
    }
    
    // Check external dependencies
    results.dependencies = await checkExternalDependencies();
    const failedDependencies = results.dependencies.filter(dep => dep.status === 'error');
    if (failedDependencies.length > 0) {
      results.warnings.push(`${failedDependencies.length} external service(s) unavailable`);
    }
    
    // Check configuration issues
    if (results.configuration.missing.length > 0) {
      results.errors.push(`Missing required configuration: ${results.configuration.missing.join(', ')}`);
      results.overall = 'error';
    }
    
    if (results.configuration.warnings.length > 0) {
      results.warnings.push(...results.configuration.warnings);
    }
    
    // Calculate overall status
    if (results.errors.length > 0) {
      results.overall = 'error';
    } else if (results.warnings.length > 0 && results.overall === 'healthy') {
      results.overall = 'warning';
    }
    
  } catch (error) {
    results.overall = 'error';
    results.errors.push(`Health check failed: ${error.message}`);
  }
  
  results.responseTime = Date.now() - startTime;
  
  // Add performance warnings
  if (results.responseTime > CONFIG.RESPONSE_TIME_CRITICAL) {
    results.errors.push('Critical response time detected');
    results.overall = 'error';
  } else if (results.responseTime > CONFIG.RESPONSE_TIME_WARNING) {
    results.warnings.push('Slow response time detected');
    if (results.overall === 'healthy') {
      results.overall = 'warning';
    }
  }
  
  return results;
}

/**
 * Generate simple status response
 */
function getSimpleStatus() {
  return {
    status: 'ok',
    service: CONFIG.SERVICE_NAME,
    version: CONFIG.VERSION,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime())
  };
}

// ===================================================================
// MAIN HANDLER
// ===================================================================
exports.handler = async (event, context) => {
  const startTime = Date.now();
  
  try {
    const origin = event.headers.origin || event.headers.Origin;
    const userAgent = event.headers['user-agent'] || '';
    const clientIP = event.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                    event.headers['x-nf-client-connection-ip'] || 
                    'unknown';
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': isValidOrigin(origin) ? origin : CONFIG.ALLOWED_ORIGINS[0],
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
      'Access-Control-Max-Age': '3600'
    };
    
    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: 'CORS preflight OK' })
      };
    }
    
    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
      return {
        statusCode: 405,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'Method not allowed',
          allowed: ['GET', 'OPTIONS']
        })
      };
    }
    
    // Get query parameters
    const params = event.queryStringParameters || {};
    const detailed = params.detailed === 'true' || params.full === 'true';
    const format = params.format || 'json';
    
    // Determine response type
    let healthData;
    let statusCode = 200;
    
    if (detailed) {
      console.log('🔍 Performing detailed health check...');
      healthData = await performHealthCheck();
      
      // Set appropriate status code based on health
      if (healthData.overall === 'error') {
        statusCode = 503; // Service Unavailable
      } else if (healthData.overall === 'degraded' || healthData.overall === 'warning') {
        statusCode = 200; // OK but with warnings
      }
      
    } else {
      healthData = getSimpleStatus();
    }
    
    // Add request metadata
    const responseTime = Date.now() - startTime;
    const responseData = {
      ...healthData,
      request: {
        method: event.httpMethod,
        path: event.path,
        userAgent: userAgent.substring(0, 100),
        clientIP,
        responseTime,
        timestamp: new Date().toISOString()
      }
    };
    
    // Format response
    let responseBody;
    let contentType = 'application/json';
    
    if (format === 'plain' || format === 'text') {
      contentType = 'text/plain';
      if (detailed) {
        responseBody = `Status: ${responseData.overall.toUpperCase()}\n` +
                      `Service: ${responseData.system.service}\n` +
                      `Version: ${responseData.system.version}\n` +
                      `Response Time: ${responseData.responseTime}ms\n` +
                      `Timestamp: ${responseData.timestamp}\n` +
                      `Errors: ${responseData.errors?.length || 0}\n` +
                      `Warnings: ${responseData.warnings?.length || 0}`;
      } else {
        responseBody = `Status: OK\nService: ${responseData.service}\nVersion: ${responseData.version}`;
      }
    } else {
      responseBody = JSON.stringify(responseData, null, params.pretty === 'true' ? 2 : 0);
    }
    
    return {
      statusCode,
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'X-Response-Time': responseTime.toString(),
        'X-Service-Version': CONFIG.VERSION,
        'X-Health-Status': detailed ? responseData.overall : 'ok',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      body: responseBody
    };
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    console.error('Health check error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': CONFIG.ALLOWED_ORIGINS[0],
        'Content-Type': 'application/json',
        'X-Response-Time': responseTime.toString()
      },
      body: JSON.stringify({
        status: 'error',
        service: CONFIG.SERVICE_NAME,
        error: 'Health check failed',
        message: error.message,
        timestamp: new Date().toISOString(),
        responseTime
      })
    };
  }
};

// ===================================================================
// USAGE EXAMPLES
// ===================================================================
/*
Health check endpoints:

1. Simple check:
   GET /.netlify/functions/health-check
   
2. Detailed check:
   GET /.netlify/functions/health-check?detailed=true
   
3. Plain text format:
   GET /.netlify/functions/health-check?format=plain
   
4. Pretty JSON:
   GET /.netlify/functions/health-check?detailed=true&pretty=true

Response status codes:
- 200: Service is healthy or has warnings
- 503: Service has critical errors
- 500: Health check itself failed

*/