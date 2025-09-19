import { NextResponse } from 'next/server';
import { getUserDetails } from '@/lib/server-actions';

export async function GET() {
  try {
    const userResult = await getUserDetails();
    
    if (userResult.success && userResult.user) {
      return NextResponse.json({
        success: true,
        user: userResult.user
      });
    } else {
      return NextResponse.json({
        success: false,
        error: userResult.error || 'Failed to fetch user'
      }, { status: 401 });
    }
  } catch (error) {
    console.error('API: Error fetching user:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}