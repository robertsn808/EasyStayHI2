import fetch from 'node-fetch';
import { fallbackAI } from './fallbackAI';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  sendMessage: string;
}

interface ChatResponse {
  response: string;
  conversationId?: string;
}

export class AIChatBot {
  private rapidApiKey: string;
  private baseUrl = 'https://ai-chat-bot-virtual-assistant-business-automation.p.rapidapi.com';

  constructor() {
    this.rapidApiKey = process.env.RAPIDAPI_KEY || '';
    if (!this.rapidApiKey) {
      throw new Error('RAPIDAPI_KEY environment variable is required');
    }
  }

  async sendMessage(chatRequest: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat?noqueue=1`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-host': 'ai-chat-bot-virtual-assistant-business-automation.p.rapidapi.com',
          'x-rapidapi-key': this.rapidApiKey,
        },
        body: JSON.stringify(chatRequest),
      });

      if (!response.ok) {
        throw new Error(`AI Chat Bot API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as any;
      
      return {
        response: data.response || data.message || 'I apologize, but I could not process your request at this time.',
        conversationId: data.conversationId,
      };
    } catch (error) {
      console.error('AI Chat Bot Error:', error);
      // Return a fallback error instead of throwing
      return {
        response: 'I apologize, but I could not process your request at this time. Please try again or contact support directly.',
        conversationId: undefined
      };
    }
  }

  // Property management specific chat contexts
  createPropertyManagementContext(): ChatMessage[] {
    return [
      {
        role: 'system',
        content: `You are an AI assistant for EasyStay HI, a property management company in Hawaii. You help tenants with:
        - Rent payment inquiries and assistance
        - Maintenance request guidance
        - Property information and policies
        - Local area recommendations
        - Emergency contact information
        - Move-in/move-out procedures
        
        Always be helpful, professional, and provide accurate information about property management services.
        If you don't know specific details, direct users to contact the property management office.`
      }
    ];
  }

  createTenantSupportContext(): ChatMessage[] {
    return [
      {
        role: 'system',
        content: `You are a tenant support specialist for EasyStay HI properties. Help with:
        - Answering questions about rent payments and due dates
        - Explaining how to submit maintenance requests
        - Providing information about property amenities
        - Guidance on emergency procedures
        - Local area information and recommendations
        - Move-in/move-out assistance
        
        Be friendly, helpful, and always prioritize tenant satisfaction while following property policies.`
      }
    ];
  }

  async handleTenantInquiry(message: string, conversationHistory: ChatMessage[] = []): Promise<ChatResponse> {
    try {
      const systemContext = this.createTenantSupportContext();
      const messages = [...systemContext, ...conversationHistory];
      
      return await this.sendMessage({
        messages,
        sendMessage: message
      });
    } catch (error) {
      console.log('Using fallback AI for tenant inquiry');
      return await fallbackAI.handleTenantInquiry(message, conversationHistory);
    }
  }

  async handlePropertyInquiry(message: string, conversationHistory: ChatMessage[] = []): Promise<ChatResponse> {
    try {
      const systemContext = this.createPropertyManagementContext();
      const messages = [...systemContext, ...conversationHistory];
      
      return await this.sendMessage({
        messages,
        sendMessage: message
      });
    } catch (error) {
      console.log('Using fallback AI for property inquiry');
      return await fallbackAI.handlePropertyManagementInquiry(message, conversationHistory);
    }
  }

  async handleMaintenanceInquiry(message: string, roomNumber?: string): Promise<ChatResponse> {
    try {
      const maintenanceContext: ChatMessage[] = [
        {
          role: 'system',
          content: `You are a maintenance support assistant for EasyStay HI. Help tenants with:
          - Submitting maintenance requests
          - Understanding maintenance procedures
          - Emergency maintenance situations
          - Maintenance scheduling and timing
          - What to expect during maintenance visits
          
          ${roomNumber ? `The tenant is in room ${roomNumber}.` : ''}
          Always encourage tenants to submit official maintenance requests through the proper channels.`
        }
      ];
      
      return await this.sendMessage({
        messages: maintenanceContext,
        sendMessage: message
      });
    } catch (error) {
      console.log('Using fallback AI for maintenance inquiry');
      return await fallbackAI.handleMaintenanceSupport(message, roomNumber);
    }
  }

  async handlePaymentInquiry(message: string, roomNumber?: string): Promise<ChatResponse> {
    try {
      const paymentContext: ChatMessage[] = [
        {
          role: 'system',
          content: `You are a payment support assistant for EasyStay HI. Help tenants with:
          - Payment due dates and amounts
          - Payment methods accepted
          - Late payment policies
          - Payment confirmation and receipts
          - Setting up automatic payments
          
          ${roomNumber ? `The tenant is in room ${roomNumber}.` : ''}
          Always direct tenants to use the official payment portal for actual payments.`
        }
      ];
      
      return await this.sendMessage({
        messages: paymentContext,
        sendMessage: message
      });
    } catch (error) {
      console.log('Using fallback AI for payment inquiry');
      return await fallbackAI.handlePaymentSupport(message, roomNumber);
    }
  }
}

export const aiChatBot = new AIChatBot();