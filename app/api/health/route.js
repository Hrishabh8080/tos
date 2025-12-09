import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get connection state before attempting connection
    const connectionStateBefore = mongoose.connection.readyState;
    const connectionStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    // Attempt to connect
    await connectDB();
    
    // Get connection state after connection attempt
    const connectionStateAfter = mongoose.connection.readyState;
    const connection = mongoose.connection;

    // Get database name
    const dbName = connection.db?.databaseName || 'unknown';

    return NextResponse.json({
      status: 'ok',
      message: 'Server is running',
      database: {
        connected: connectionStateAfter === 1,
        state: connectionStates[connectionStateAfter] || 'unknown',
        stateBefore: connectionStates[connectionStateBefore] || 'unknown',
        name: dbName,
        host: connection.host || 'unknown',
        port: connection.port || 'unknown',
        readyState: connectionStateAfter,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const connectionState = mongoose.connection.readyState;
    const connectionStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    return NextResponse.json(
      {
        status: 'error',
        message: 'Database connection failed',
        database: {
          connected: false,
          state: connectionStates[connectionState] || 'unknown',
          readyState: connectionState,
        },
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

