import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  return res.status(200).json({
    status: 'ok',
    service: 'Smart Grocery Pro Cloud Backend',
    version: '4.0.0',
    runtime: `Node.js ${process.version}`,
    language: 'TypeScript 5.x',
    platform: 'Vercel Serverless Edge/Node Engine',
    timestamp: new Date().toISOString()
  });
}
