
import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function generateTenantQRCode(roomId: number): Promise<string> {
  const baseUrl = process.env.REPL_SLUG 
    ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
    : 'http://localhost:5000';
  
  const tenantPortalUrl = `${baseUrl}/tenant/${roomId}`;
  
  try {
    const qrCodeDataURL = await QRCode.toDataURL(tenantPortalUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

export function generateTenantToken(roomId: number, tenantData: { name: string; email?: string; phone?: string }): string {
  return jwt.sign(
    {
      roomId,
      tenantData,
      type: 'tenant_access'
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export function verifyTenantToken(token: string): { roomId: number; tenantData: any } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.type === 'tenant_access') {
      return {
        roomId: decoded.roomId,
        tenantData: decoded.tenantData
      };
    }
    return null;
  } catch (error) {
    return null;
  }
}
