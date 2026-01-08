// test-prisma.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function test() {
  try {
    console.log('Testing Prisma Client...');
    
    // List all available models
    console.log('\n=== Available Prisma Models ===');
    const models = Object.keys(prisma).filter(key => 
      typeof prisma[key] === 'object' && 
      prisma[key] && 
      typeof prisma[key].findMany === 'function'
    );
    console.log('Models:', models);
    
    // Check if payment exists
    console.log('\n=== Checking Payment model ===');
    console.log('prisma.payment exists?', !!prisma.payment);
    console.log('prisma.Payment exists?', !!prisma.Payment);
    
    if (prisma.payment) {
      console.log('Trying to create a test payment...');
      
      // First check if we have a booking
      const bookings = await prisma.booking.findMany({ take: 1 });
      console.log('Existing bookings:', bookings.length);
      
      if (bookings.length > 0) {
        const booking = bookings[0];
        console.log('Using booking ID:', booking.id);
        
        const payment = await prisma.payment.create({
          data: {
            bookingId: booking.id,
            customerId: booking.customerId,
            amount: 100.00,
            paymentMethod: 'test',
            status: 'completed',
            paymentDate: new Date(),
          },
        });
        console.log('✅ Payment created:', payment);
      } else {
        console.log('❌ No bookings found');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

test();