import prisma from './prisma';

/**
 * Test database connection
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats() {
  try {
    const [userCount, appointmentCount, messageCount, ratingCount] = await Promise.all([
      prisma.user.count(),
      prisma.appointment.count(),
      prisma.message.count(),
      prisma.rating.count(),
    ]);

    return {
      users: userCount,
      appointments: appointmentCount,
      messages: messageCount,
      ratings: ratingCount,
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    throw error;
  }
}

/**
 * Parse availability slots from JSON string
 */
export function parseAvailabilitySlots(slotsJson: string | null): Array<{ day: string; startTime: string; endTime: string }> {
  if (!slotsJson) return [];
  try {
    return JSON.parse(slotsJson);
  } catch (error) {
    console.error('Error parsing availability slots:', error);
    return [];
  }
}

/**
 * Stringify availability slots to JSON
 */
export function stringifyAvailabilitySlots(slots: Array<{ day: string; startTime: string; endTime: string }>): string {
  return JSON.stringify(slots);
}