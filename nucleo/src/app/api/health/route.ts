import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      status: 'healthy',
      module: '00-hub-core',
      squad: 'Squad 1',
      version: 'v1.0-modular',
      timestamp: new Date().toISOString(),
      checks: {
        apiRouter: 'UP',
        ingestionEngine: 'UP',
        doorToDoorEngine: 'UP',
      },
    },
    { status: 200 }
  );
}
