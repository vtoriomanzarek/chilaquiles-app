import { jwtVerify, JWTVerifyResult } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

// Clave secreta para JWT (en producción debe estar en variables de entorno)
// IMPORTANTE: Esta clave debe ser exactamente la misma que se usa en el endpoint de login
const JWT_SECRET = process.env.JWT_SECRET || 'chilaquiles-secret-key-change-in-production'

// Convertir la clave secreta a formato de bytes una sola vez
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET)

interface AuthResult {
  success: boolean
  user?: {
    id: string
    email: string
    name?: string
    role: string
  }
  error?: string
}

/**
 * Función auxiliar para extraer el token de autenticación de todas las fuentes posibles
 */
function extractToken(request: Request | NextRequest): string | null {
  let token: string | null = null;
  
  // 1. Intentar obtener el token del header Authorization
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7);
    console.log('Token encontrado en header Authorization');
    return token;
  }
  
  // 2. Intentar obtener el token de las cookies del servidor
  try {
    const cookieStore = cookies();
    token = cookieStore.get('authToken')?.value || null;
    if (token) {
      console.log('Token encontrado en cookies del servidor');
      return token;
    }
  } catch (cookieError) {
    console.log('No se pudo acceder a las cookies del servidor');
  }
  
  // 3. Intentar obtener el token de las cookies de la solicitud
  try {
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
      const authCookie = cookies.find(cookie => cookie.startsWith('authToken='));
      if (authCookie) {
        token = authCookie.substring('authToken='.length);
        console.log('Token encontrado en header de cookies');
        return token;
      }
    }
  } catch (cookieError) {
    console.log('Error al parsear cookies de la solicitud');
  }
  
  return null;
}

/**
 * Verifica la autenticación del usuario a partir del token JWT
 * @param request - Objeto Request de Next.js
 * @returns Resultado de la autenticación con datos del usuario si es exitosa
 */
/**
 * Función simplificada para verificar la autenticación
 */
export async function verifyAuth(request: Request | NextRequest): Promise<AuthResult> {
  console.log('Verificando autenticación...');
  
  try {
    // 1. Obtener el token de todas las fuentes posibles
    const token = extractToken(request);
    
    if (!token) {
      console.error('No se encontró token de autenticación');
      return { 
        success: false, 
        error: 'No se proporcionó token de autenticación' 
      };
    }
    
    // 2. Verificar el token
    console.log('Verificando token JWT...');
    
    try {
      // Intentar verificar el token
      const { payload } = await jwtVerify(token, SECRET_KEY);
      
      // Verificar que el payload tenga los datos necesarios
      if (!payload.userId || !payload.email || !payload.role) {
        console.error('Token inválido: faltan datos requeridos', payload);
        return { 
          success: false, 
          error: 'Token inválido: faltan datos requeridos' 
        };
      }
      
      // Verificar que el rol sea válido
      const validRoles = ['ADMIN', 'STAFF', 'KITCHEN', 'WAITER'];
      if (!validRoles.includes(payload.role as string)) {
        console.error('Rol no válido:', payload.role);
        return { 
          success: false, 
          error: 'No tiene permisos para acceder a esta sección' 
        };
      }
      
      console.log('Token verificado correctamente para:', payload.email);
      
      // Autenticación exitosa
      return {
        success: true,
        user: {
          id: payload.userId as string,
          email: payload.email as string,
          name: payload.name as string || undefined,
          role: payload.role as string
        }
      };
    } catch (jwtError) {
      console.error('Error al verificar JWT:', jwtError);
      return { 
        success: false, 
        error: 'Token inválido o expirado' 
      };
    }
  } catch (error) {
    console.error('Error general al verificar autenticación:', error);
    return { 
      success: false, 
      error: 'Error al verificar la autenticación' 
    };
  }
}
