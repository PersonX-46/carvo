// src/app/api/ai/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

interface BookingAction {
  type: 'create_booking' | 'view_bookings' | 'update_booking' | 'cancel_booking';
  data?: any;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body safely
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { message, context } = body;

    // Validate message parameter
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();

    if (!user || user.type !== 'customer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if this is a booking-related request
    const bookingAction = detectBookingAction(message, user.id);
    
    if (bookingAction) {
      return await handleBookingAction(bookingAction, user.id);
    }

    // Regular AI chat response
    const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
    
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.2:1b',
        prompt: `${context || "You are a helpful AI assistant for CARVO Auto Service in Malaysia. Provide friendly, professional responses about vehicle services, bookings, pricing, and general automotive advice. Keep responses concise but helpful."}\n\nCustomer: ${message}\n\nAssistant:`,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 500,
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Ollama API request failed');
    }

    const data = await response.json();
    
    return NextResponse.json({
      response: data.response,
      type: 'chat'
    });

  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    );
  }
}

function detectBookingAction(message: string, customerId: number): BookingAction | null {
  // Add null check for message
  if (!message || typeof message !== 'string') {
    return null;
  }

  const lowerMessage = message.toLowerCase();

  // Create booking detection
  if (lowerMessage.includes('book') || lowerMessage.includes('schedule') || lowerMessage.includes('appointment')) {
    return { type: 'create_booking' };
  }

  // View bookings detection
  if (lowerMessage.includes('my bookings') || lowerMessage.includes('view bookings') || 
      lowerMessage.includes('upcoming appointments') || lowerMessage.includes('booking status')) {
    return { type: 'view_bookings' };
  }

  // Cancel booking detection
  if (lowerMessage.includes('cancel') || lowerMessage.includes('reschedule') || 
      lowerMessage.includes('change appointment')) {
    return { type: 'cancel_booking' };
  }

  return null;
}

async function handleBookingAction(action: BookingAction, customerId: number) {
  try {
    switch (action.type) {
      case 'create_booking':
        return await handleCreateBooking(customerId);
      
      case 'view_bookings':
        return await handleViewBookings(customerId);
      
      case 'cancel_booking':
        return await handleCancelBooking(customerId);
      
      default:
        return NextResponse.json({
          response: "I'm not sure how to help with that booking request. Please try rephrasing.",
          type: 'chat'
        });
    }
  } catch (error) {
    console.error('Booking action error:', error);
    return NextResponse.json({
      response: "Sorry, I encountered an error processing your booking request. Please try again or contact support.",
      type: 'chat'
    });
  }
}

async function handleCreateBooking(customerId: number) {
  // Get customer's vehicles for booking
  const vehicles = await prisma.vehicle.findMany({
    where: { customerId },
    select: { id: true, model: true, registrationNumber: true }
  });

  if (vehicles.length === 0) {
    return NextResponse.json({
      response: "I see you don't have any vehicles registered yet. Please add a vehicle first before booking a service.",
      type: 'chat',
      action: 'add_vehicle_first'
    });
  }

  const response = {
    response: `I can help you book a service! Here are your available vehicles:\n\n${vehicles.map(v => `• ${v.model} (${v.registrationNumber})`).join('\n')}\n\nPlease tell me:\n1. Which vehicle needs service?\n2. What type of service do you need?\n3. Your preferred date and time\n\nOr click the "Book Service" button below to use our booking form.`,
    type: 'booking',
    action: 'create_booking',
    data: {
      vehicles,
      nextStep: 'vehicle_selection'
    }
  };

  return NextResponse.json(response);
}

async function handleViewBookings(customerId: number) {
  const bookings = await prisma.booking.findMany({
    where: { customerId },
    include: {
      vehicle: {
        select: { model: true, registrationNumber: true }
      },
      service: {
        select: { serviceStatus: true, serviceCost: true }
      }
    },
    orderBy: { bookingDate: 'desc' },
    take: 5
  });

  if (bookings.length === 0) {
    return NextResponse.json({
      response: "You don't have any upcoming bookings. Would you like to schedule a new service appointment?",
      type: 'chat'
    });
  }

  const bookingList = bookings.map(booking => 
    `• ${booking.vehicle.model} - ${new Date(booking.bookingDate).toLocaleDateString()} - ${booking.status}${booking.service ? ` - ${booking.service.serviceStatus}` : ''}`
  ).join('\n');

  return NextResponse.json({
    response: `Here are your recent bookings:\n\n${bookingList}\n\nYou can click on any booking to view details or make changes.`,
    type: 'booking',
    action: 'view_bookings',
    data: { bookings }
  });
}

async function handleCancelBooking(customerId: number) {
  const upcomingBookings = await prisma.booking.findMany({
    where: { 
      customerId,
      status: { in: ['Pending', 'Confirmed'] },
      bookingDate: { gte: new Date() }
    },
    include: {
      vehicle: {
        select: { model: true, registrationNumber: true }
      }
    },
    orderBy: { bookingDate: 'asc' }
  });

  if (upcomingBookings.length === 0) {
    return NextResponse.json({
      response: "You don't have any upcoming bookings that can be cancelled.",
      type: 'chat'
    });
  }

  const bookingOptions = upcomingBookings.map((booking, index) => 
    `${index + 1}. ${booking.vehicle.model} - ${new Date(booking.bookingDate).toLocaleDateString()} (${booking.status})`
  ).join('\n');

  return NextResponse.json({
    response: `I can help you cancel a booking. Here are your upcoming appointments:\n\n${bookingOptions}\n\nPlease tell me which booking you'd like to cancel, or click the booking to cancel directly.`,
    type: 'booking',
    action: 'cancel_booking',
    data: { bookings: upcomingBookings }
  });
}