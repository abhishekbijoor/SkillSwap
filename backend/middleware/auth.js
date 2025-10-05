// Temporary simple auth middleware for development
const checkJwt = (req, res, next) => {
  // Check if there's an Authorization header with a token
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    try {
      // Decode JWT token to get the actual Auth0 user ID
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const payload = JSON.parse(jsonPayload);
      
      // Use the actual Auth0 user ID from the token
      req.auth = {
        payload: {
          sub: payload.sub, // This is the real Auth0 user ID
          name: payload.name || payload.nickname || 'User',
          email: payload.email || `${payload.sub}@auth0.com`
        }
      };
      
      console.log(`Auth middleware: allowing request for Auth0 user ${payload.sub}`);
    } catch (error) {
      // If token parsing fails, create a fallback
      const fallbackUserId = `fallback-${Buffer.from(token).toString('base64').substring(0, 8)}`;
      req.auth = {
        payload: {
          sub: fallbackUserId,
          name: 'Fallback User',
          email: `${fallbackUserId}@auth0.com`
        }
      };
      console.log(`Auth middleware: token parsing failed, using fallback user ${fallbackUserId}`);
    }
  } else {
    // Fallback for requests without token (like health checks)
    req.auth = {
      payload: {
        sub: 'anonymous-user',
        name: 'Anonymous User',
        email: 'anonymous@example.com'
      }
    };
    
    console.log(`Auth middleware: allowing request for anonymous user`);
  }
  
  next();
};

module.exports = checkJwt;
