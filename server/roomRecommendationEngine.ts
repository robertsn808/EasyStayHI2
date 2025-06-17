import { storage } from "./storage";

interface TenantPreferences {
  budgetRange?: {
    min: number;
    max: number;
  };
  preferredFloor?: string;
  quietRoom?: boolean;
  oceanView?: boolean;
  balcony?: boolean;
  accessibility?: boolean;
  petFriendly?: boolean;
  smokingAllowed?: boolean;
  stayDuration?: number; // in months
  moveInDate?: string;
  specialRequests?: string[];
}

interface RoomFeatures {
  id: number;
  number: string;
  size: string;
  floor: string;
  rent: number;
  amenities: string[];
  quietLevel: number; // 1-5 scale
  hasOceanView: boolean;
  hasBalcony: boolean;
  isAccessible: boolean;
  isPetFriendly: boolean;
  isSmokingAllowed: boolean;
  lastCleaned?: string;
  maintenanceHistory: string[];
  occupancyHistory: {
    averageStayDuration: number;
    satisfactionRating: number;
    maintenanceFrequency: number;
  };
}

interface RecommendationScore {
  roomId: number;
  score: number;
  reasons: string[];
  concerns: string[];
  matchingFeatures: string[];
}

export class RoomRecommendationEngine {
  constructor() {}

  async getRecommendations(
    preferences: TenantPreferences,
    limit: number = 5
  ): Promise<RecommendationScore[]> {
    // Get available rooms
    const rooms = await storage.getRooms();
    const availableRooms = rooms.filter(room => 
      room.status === 'available' || room.status === 'cleaning'
    );

    if (availableRooms.length === 0) {
      return [];
    }

    // Score each room
    const scoredRooms: RecommendationScore[] = [];

    for (const room of availableRooms) {
      const roomFeatures = await this.getRoomFeatures(room);
      const score = await this.calculateRoomScore(preferences, roomFeatures);
      scoredRooms.push(score);
    }

    // Sort by score (descending) and return top recommendations
    return scoredRooms
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private async getRoomFeatures(room: any): Promise<RoomFeatures> {
    // Get maintenance history
    const maintenanceRequests = await storage.getMaintenanceRequests(room.id);
    
    // Get occupancy history from guest profiles
    const guestHistory = await storage.getGuestProfilesByRoom(room.id);
    
    // Calculate occupancy statistics
    const occupancyHistory = this.calculateOccupancyStats(guestHistory);

    // Extract amenities from room description or features
    const amenities = this.extractAmenities(room.description || '');

    return {
      id: room.id,
      number: room.number,
      size: room.size || 'standard',
      floor: room.floor?.toString() || '1',
      rent: parseFloat(room.rentalRate || '1200'),
      amenities,
      quietLevel: this.calculateQuietLevel(room),
      hasOceanView: this.hasFeature(room, 'ocean view'),
      hasBalcony: this.hasFeature(room, 'balcony'),
      isAccessible: this.hasFeature(room, 'accessible'),
      isPetFriendly: this.hasFeature(room, 'pet friendly'),
      isSmokingAllowed: this.hasFeature(room, 'smoking'),
      lastCleaned: room.lastCleaned,
      maintenanceHistory: maintenanceRequests.map((req: any) => req.description),
      occupancyHistory
    };
  }

  private calculateOccupancyStats(guestHistory: any[]) {
    if (guestHistory.length === 0) {
      return {
        averageStayDuration: 0,
        satisfactionRating: 3.5,
        maintenanceFrequency: 0
      };
    }

    const avgDuration = guestHistory.reduce((sum, guest) => {
      if (guest.checkInDate && guest.checkOutDate) {
        const stay = new Date(guest.checkOutDate).getTime() - new Date(guest.checkInDate).getTime();
        return sum + (stay / (1000 * 60 * 60 * 24 * 30)); // convert to months
      }
      return sum + 3; // default 3 months if no checkout date
    }, 0) / guestHistory.length;

    return {
      averageStayDuration: avgDuration,
      satisfactionRating: 4.0, // Could be calculated from feedback
      maintenanceFrequency: 0.5 // requests per month
    };
  }

  private extractAmenities(description: string): string[] {
    const amenityKeywords = [
      'wifi', 'air conditioning', 'heating', 'kitchen', 'bathroom',
      'parking', 'laundry', 'gym', 'pool', 'elevator', 'balcony',
      'ocean view', 'mountain view', 'furnished', 'utilities included'
    ];

    return amenityKeywords.filter(keyword => 
      description.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  private hasFeature(room: any, feature: string): boolean {
    const searchText = `${room.description || ''} ${room.amenities || ''}`.toLowerCase();
    return searchText.includes(feature.toLowerCase());
  }

  private calculateQuietLevel(room: any): number {
    // Base quiet level on floor and room features
    let quietLevel = 3; // base level
    
    const floor = parseInt(room.floor || '1');
    if (floor >= 3) quietLevel += 1; // higher floors are quieter
    if (floor === 1) quietLevel -= 1; // ground floor is noisier
    
    const description = (room.description || '').toLowerCase();
    if (description.includes('street facing')) quietLevel -= 1;
    if (description.includes('courtyard') || description.includes('back')) quietLevel += 1;
    if (description.includes('corner')) quietLevel += 0.5;

    return Math.max(1, Math.min(5, quietLevel));
  }

  private async calculateRoomScore(
    preferences: TenantPreferences,
    roomFeatures: RoomFeatures
  ): Promise<RecommendationScore> {
    let score = 0;
    const reasons: string[] = [];
    const concerns: string[] = [];
    const matchingFeatures: string[] = [];

    // Budget compatibility (30% weight)
    if (preferences.budgetRange) {
      const { min, max } = preferences.budgetRange;
      if (roomFeatures.rent >= min && roomFeatures.rent <= max) {
        score += 30;
        reasons.push(`Within budget range ($${min}-$${max})`);
        matchingFeatures.push('Budget-friendly');
      } else if (roomFeatures.rent < min) {
        score += 25;
        reasons.push('Below budget - excellent value');
        matchingFeatures.push('Great value');
      } else if (roomFeatures.rent > max) {
        score -= 20;
        concerns.push(`Above budget by $${roomFeatures.rent - max}`);
      }
    }

    // Floor preference (10% weight)
    if (preferences.preferredFloor) {
      if (roomFeatures.floor === preferences.preferredFloor) {
        score += 10;
        reasons.push(`On preferred floor ${preferences.preferredFloor}`);
        matchingFeatures.push(`Floor ${preferences.preferredFloor}`);
      }
    }

    // Quiet room preference (15% weight)
    if (preferences.quietRoom) {
      const quietScore = (roomFeatures.quietLevel / 5) * 15;
      score += quietScore;
      if (roomFeatures.quietLevel >= 4) {
        reasons.push('Very quiet location');
        matchingFeatures.push('Quiet environment');
      } else if (roomFeatures.quietLevel <= 2) {
        concerns.push('May be noisy location');
      }
    }

    // View preferences (10% weight)
    if (preferences.oceanView && roomFeatures.hasOceanView) {
      score += 10;
      reasons.push('Beautiful ocean view');
      matchingFeatures.push('Ocean view');
    }

    // Balcony preference (8% weight)
    if (preferences.balcony && roomFeatures.hasBalcony) {
      score += 8;
      reasons.push('Private balcony available');
      matchingFeatures.push('Private balcony');
    }

    // Accessibility needs (20% weight)
    if (preferences.accessibility) {
      if (roomFeatures.isAccessible) {
        score += 20;
        reasons.push('Fully accessible room');
        matchingFeatures.push('Wheelchair accessible');
      } else {
        score -= 25;
        concerns.push('Not wheelchair accessible');
      }
    }

    // Pet-friendly (12% weight)
    if (preferences.petFriendly) {
      if (roomFeatures.isPetFriendly) {
        score += 12;
        reasons.push('Pets welcome');
        matchingFeatures.push('Pet-friendly');
      } else {
        score -= 15;
        concerns.push('Pets not allowed');
      }
    }

    // Smoking preference (8% weight)
    if (preferences.smokingAllowed) {
      if (roomFeatures.isSmokingAllowed) {
        score += 8;
        reasons.push('Smoking permitted');
        matchingFeatures.push('Smoking allowed');
      } else {
        concerns.push('No-smoking room');
      }
    }

    // Room condition and maintenance (10% weight)
    const maintenanceScore = this.calculateMaintenanceScore(roomFeatures);
    score += maintenanceScore;
    if (maintenanceScore >= 8) {
      reasons.push('Excellent maintenance record');
      matchingFeatures.push('Well-maintained');
    } else if (maintenanceScore <= 4) {
      concerns.push('Recent maintenance issues');
    }

    // Occupancy history bonus (7% weight)
    const historyScore = this.calculateHistoryScore(roomFeatures.occupancyHistory, preferences);
    score += historyScore;
    if (historyScore >= 5) {
      reasons.push('High tenant satisfaction history');
      matchingFeatures.push('Popular choice');
    }

    // Availability timing
    if (preferences.moveInDate) {
      const isAvailableWhenNeeded = await this.checkAvailability(roomFeatures.id, preferences.moveInDate);
      if (isAvailableWhenNeeded) {
        score += 5;
        reasons.push('Available for your move-in date');
      } else {
        score -= 10;
        concerns.push('May not be available for your preferred date');
      }
    }

    return {
      roomId: roomFeatures.id,
      score: Math.max(0, Math.min(100, score)),
      reasons,
      concerns,
      matchingFeatures
    };
  }

  private calculateMaintenanceScore(roomFeatures: RoomFeatures): number {
    const recentIssues = roomFeatures.maintenanceHistory.length;
    if (recentIssues === 0) return 10;
    if (recentIssues <= 2) return 7;
    if (recentIssues <= 4) return 4;
    return 2;
  }

  private calculateHistoryScore(occupancyHistory: any, preferences: TenantPreferences): number {
    let score = 0;
    
    // Satisfaction rating contribution
    score += (occupancyHistory.satisfactionRating / 5) * 4;
    
    // Stay duration match
    if (preferences.stayDuration) {
      const durationDiff = Math.abs(occupancyHistory.averageStayDuration - preferences.stayDuration);
      if (durationDiff <= 1) score += 3; // similar duration preferences
      else if (durationDiff <= 3) score += 1;
    }

    return score;
  }

  private async checkAvailability(roomId: number, moveInDate: string): Promise<boolean> {
    // Check if room will be available by the move-in date
    const currentGuests = await storage.getGuestProfilesByRoom(roomId);
    const activeGuest = currentGuests.find(guest => 
      guest.isActive && !guest.hasMovedOut
    );

    if (!activeGuest) return true;

    if (activeGuest.checkOutDate) {
      return new Date(activeGuest.checkOutDate) <= new Date(moveInDate);
    }

    return false; // No checkout date, assume occupied
  }

  // Machine learning-style recommendation based on similar tenant profiles
  async getPersonalizedRecommendations(
    preferences: TenantPreferences,
    tenantProfile: any
  ): Promise<RecommendationScore[]> {
    // Find similar tenants based on profile characteristics
    const allTenants = await storage.getTenants();
    const similarTenants = this.findSimilarTenants(tenantProfile, allTenants);

    // Get rooms that similar tenants were satisfied with
    const recommendedRooms = await this.getRoomsFromSimilarTenants(similarTenants);

    // Combine with preference-based recommendations
    const preferenceRecommendations = await this.getRecommendations(preferences);
    
    // Merge and re-score recommendations
    return this.mergeRecommendations(preferenceRecommendations, recommendedRooms);
  }

  private findSimilarTenants(profile: any, allTenants: any[]): any[] {
    // Simple similarity calculation based on budget and stay duration
    return allTenants
      .filter(tenant => tenant.status === 'active')
      .map(tenant => ({
        ...tenant,
        similarity: this.calculateTenantSimilarity(profile, tenant)
      }))
      .filter(tenant => tenant.similarity > 0.6)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10);
  }

  private calculateTenantSimilarity(profile1: any, profile2: any): number {
    let similarity = 0;
    let factors = 0;

    // Budget similarity
    if (profile1.monthlyRent && profile2.monthlyRent) {
      const budgetDiff = Math.abs(profile1.monthlyRent - profile2.monthlyRent);
      similarity += Math.max(0, 1 - (budgetDiff / 1000)); // normalize by $1000
      factors++;
    }

    // Stay duration similarity
    if (profile1.stayDuration && profile2.stayDuration) {
      const durationDiff = Math.abs(profile1.stayDuration - profile2.stayDuration);
      similarity += Math.max(0, 1 - (durationDiff / 12)); // normalize by 12 months
      factors++;
    }

    return factors > 0 ? similarity / factors : 0;
  }

  private async getRoomsFromSimilarTenants(similarTenants: any[]): Promise<number[]> {
    const roomIds: number[] = [];
    
    for (const tenant of similarTenants) {
      if (tenant.roomNumber) {
        const rooms = await storage.getRooms();
        const room = rooms.find(r => r.number === tenant.roomNumber);
        if (room) {
          roomIds.push(room.id);
        }
      }
    }

    return Array.from(new Set(roomIds)); // remove duplicates
  }

  private mergeRecommendations(
    preferenceRecs: RecommendationScore[],
    collaborativeRooms: number[]
  ): RecommendationScore[] {
    // Boost scores for rooms recommended by collaborative filtering
    return preferenceRecs.map(rec => {
      if (collaborativeRooms.includes(rec.roomId)) {
        return {
          ...rec,
          score: Math.min(100, rec.score + 10),
          reasons: [...rec.reasons, 'Recommended by similar tenants'],
          matchingFeatures: [...rec.matchingFeatures, 'Tenant favorite']
        };
      }
      return rec;
    });
  }

  // Generate explanation for recommendations
  generateRecommendationExplanation(recommendations: RecommendationScore[]): string {
    if (recommendations.length === 0) {
      return "No suitable rooms found matching your criteria. Please adjust your preferences.";
    }

    const topRoom = recommendations[0];
    let explanation = `Based on your preferences, Room ${topRoom.roomId} is your best match with a ${topRoom.score}% compatibility score.\n\n`;
    
    explanation += "Why this room is recommended:\n";
    topRoom.reasons.forEach(reason => {
      explanation += `• ${reason}\n`;
    });

    if (topRoom.concerns.length > 0) {
      explanation += "\nPlease consider:\n";
      topRoom.concerns.forEach(concern => {
        explanation += `• ${concern}\n`;
      });
    }

    if (recommendations.length > 1) {
      explanation += `\nWe've also found ${recommendations.length - 1} other suitable options for you to consider.`;
    }

    return explanation;
  }
}

export const roomRecommendationEngine = new RoomRecommendationEngine();