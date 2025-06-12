interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatResponse {
  response: string;
  conversationId?: string;
}

export class FallbackAI {
  private propertyKnowledge = {
    rentPayment: {
      methods: ['Online portal', 'Bank transfer', 'Check', 'Money order'],
      dueDate: '1st of each month',
      lateFee: '$50 after 5 days',
      autoPayAvailable: true
    },
    maintenance: {
      emergencyContacts: 'Call (808) 555-0123 for urgent issues',
      normalRequests: 'Use the maintenance tab in your tenant portal',
      responseTime: '24-48 hours for non-emergency requests',
      categories: ['Plumbing', 'Electrical', 'HVAC', 'Appliances', 'General']
    },
    propertyInfo: {
      quietHours: '10 PM - 7 AM',
      parkingPolicy: 'One assigned space per unit',
      petPolicy: 'Cats and small dogs allowed with $200 deposit',
      amenities: ['Fitness center', 'Pool', 'Laundry facilities', 'Parking']
    },
    local: {
      transportation: 'Bus routes 19, 20, 42 serve this area',
      shopping: 'Ala Moana Center 10 minutes away',
      dining: 'Numerous restaurants within walking distance',
      beaches: 'Waikiki Beach 5 minutes, Ala Moana Beach Park 8 minutes'
    }
  };

  async handleTenantInquiry(message: string, conversationHistory: ChatMessage[] = []): Promise<ChatResponse> {
    const lowerMessage = message.toLowerCase();
    
    // Payment-related inquiries
    if (lowerMessage.includes('rent') || lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
      return this.handlePaymentInquiry(message);
    }
    
    // Maintenance-related inquiries
    if (lowerMessage.includes('maintenance') || lowerMessage.includes('repair') || lowerMessage.includes('broken') || lowerMessage.includes('fix')) {
      return this.handleMaintenanceInquiry(message);
    }
    
    // Property information
    if (lowerMessage.includes('policy') || lowerMessage.includes('rules') || lowerMessage.includes('quiet') || lowerMessage.includes('parking')) {
      return this.handlePropertyInquiry(message);
    }
    
    // Local area information
    if (lowerMessage.includes('restaurant') || lowerMessage.includes('beach') || lowerMessage.includes('shopping') || lowerMessage.includes('transport')) {
      return this.handleLocalInquiry(message);
    }
    
    // Emergency situations
    if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent') || lowerMessage.includes('water') || lowerMessage.includes('electric')) {
      return {
        response: `For EMERGENCIES, please call (808) 555-0123 immediately. This includes:
        
• Water leaks or flooding
• Electrical hazards
• Gas leaks
• Lock-outs after hours
• Security concerns

For non-emergency maintenance, please use the maintenance tab in your tenant portal. How else can I help you today?`
      };
    }
    
    // General greeting or help
    return {
      response: `Hello! I'm your EasyStay HI virtual assistant. I can help you with:

• **Rent payments** - Due dates, payment methods, late fees
• **Maintenance requests** - How to submit, emergency contacts
• **Property policies** - Quiet hours, parking, pet policy
• **Local recommendations** - Restaurants, beaches, transportation

What would you like to know more about?`
    };
  }

  private async handlePaymentInquiry(message: string): Promise<ChatResponse> {
    const info = this.propertyKnowledge.rentPayment;
    
    return {
      response: `**Rent Payment Information:**

• **Due Date:** ${info.dueDate}
• **Late Fee:** ${info.lateFee}
• **Payment Methods:** ${info.methods.join(', ')}
• **Auto-Pay:** Available through your tenant portal

To make a payment, use the "Payments" tab in your tenant portal. You can set up automatic payments to never miss a due date.

Need help with a specific payment issue? Let me know!`
    };
  }

  private async handleMaintenanceInquiry(message: string): Promise<ChatResponse> {
    const info = this.propertyKnowledge.maintenance;
    
    return {
      response: `**Maintenance Request Help:**

• **Emergency Issues:** ${info.emergencyContacts}
• **Normal Requests:** ${info.normalRequests}
• **Response Time:** ${info.responseTime}

**Common Categories:**
${info.categories.map(cat => `• ${cat}`).join('\n')}

To submit a request, go to the "Maintenance" tab in your portal and fill out the form with details about the issue.

Is this an emergency that needs immediate attention?`
    };
  }

  private async handlePropertyInquiry(message: string): Promise<ChatResponse> {
    const info = this.propertyKnowledge.propertyInfo;
    
    return {
      response: `**Property Information:**

• **Quiet Hours:** ${info.quietHours}
• **Parking:** ${info.parkingPolicy}
• **Pets:** ${info.petPolicy}

**Amenities Available:**
${info.amenities.map(amenity => `• ${amenity}`).join('\n')}

Need more details about any specific policy or amenity?`
    };
  }

  private async handleLocalInquiry(message: string): Promise<ChatResponse> {
    const info = this.propertyKnowledge.local;
    
    return {
      response: `**Local Area Information:**

• **Transportation:** ${info.transportation}
• **Shopping:** ${info.shopping}
• **Dining:** ${info.dining}
• **Beaches:** ${info.beaches}

Would you like specific recommendations for restaurants, activities, or getting around the island?`
    };
  }

  async handlePropertyManagementInquiry(message: string, conversationHistory: ChatMessage[] = []): Promise<ChatResponse> {
    return {
      response: `Welcome to EasyStay HI property management support! I can help with:

• Property policies and procedures
• Tenant services and amenities
• Building information and contacts
• General property management inquiries

What specific information do you need about our properties?`
    };
  }

  async handleMaintenanceSupport(message: string, roomNumber?: string): Promise<ChatResponse> {
    const roomText = roomNumber ? ` for Room ${roomNumber}` : '';
    
    return {
      response: `**Maintenance Support${roomText}:**

To submit a maintenance request:
1. Use the "Maintenance" tab in your tenant portal
2. Select the issue category (Plumbing, Electrical, HVAC, etc.)
3. Describe the problem in detail
4. Set priority level (Emergency, High, Normal, Low)

**Emergency situations:** Call (808) 555-0123 immediately for:
• Water leaks • Electrical hazards • Gas leaks • Lock-outs

**Response times:** 24-48 hours for normal requests, immediate for emergencies.

What type of maintenance issue are you experiencing?`
    };
  }

  async handlePaymentSupport(message: string, roomNumber?: string): Promise<ChatResponse> {
    const roomText = roomNumber ? ` for Room ${roomNumber}` : '';
    
    return {
      response: `**Payment Information${roomText}:**

• **Rent Due:** 1st of each month
• **Late Fee:** $50 after 5 days late
• **Payment Methods:** Online portal, bank transfer, check, money order

**To make payments:**
1. Go to "Payments" tab in your tenant portal
2. Choose your payment method
3. Enter payment amount
4. Submit payment

**Auto-Pay:** Set up automatic payments to avoid late fees!

Do you need help with making a payment or setting up auto-pay?`
    };
  }
}

export const fallbackAI = new FallbackAI();