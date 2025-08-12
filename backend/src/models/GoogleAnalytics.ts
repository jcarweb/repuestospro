import mongoose, { Document, Schema } from 'mongoose';

export interface IGoogleAnalytics extends Document {
  measurementId: string; // GA4 Measurement ID (G-XXXXXXXXXX)
  propertyId: string; // GA4 Property ID
  trackingCode: string; // Código de seguimiento completo
  isEnabled: boolean;
  isConfigured: boolean;
  lastConfiguredBy: mongoose.Types.ObjectId;
  lastConfiguredAt: Date;
  customEvents: {
    userRegistration: boolean;
    userLogin: boolean;
    purchase: boolean;
    review: boolean;
    referral: boolean;
    rewardRedemption: boolean;
    locationUpdate: boolean;
  };
  customDimensions: {
    userId: boolean;
    userRole: boolean;
    loyaltyLevel: boolean;
    locationEnabled: boolean;
  };
  customMetrics: {
    pointsEarned: boolean;
    totalSpent: boolean;
    referralCount: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const googleAnalyticsSchema = new Schema<IGoogleAnalytics>({
  measurementId: {
    type: String,
    required: true,
    trim: true,
    match: /^G-[A-Z0-9]{10}$/ // Formato GA4 Measurement ID
  },
  propertyId: {
    type: String,
    required: true,
    trim: true
  },
  trackingCode: {
    type: String,
    required: true,
    trim: true
  },
  isEnabled: {
    type: Boolean,
    default: false
  },
  isConfigured: {
    type: Boolean,
    default: false
  },
  lastConfiguredBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastConfiguredAt: {
    type: Date,
    default: Date.now
  },
  customEvents: {
    userRegistration: {
      type: Boolean,
      default: true
    },
    userLogin: {
      type: Boolean,
      default: true
    },
    purchase: {
      type: Boolean,
      default: true
    },
    review: {
      type: Boolean,
      default: true
    },
    referral: {
      type: Boolean,
      default: true
    },
    rewardRedemption: {
      type: Boolean,
      default: true
    },
    locationUpdate: {
      type: Boolean,
      default: true
    }
  },
  customDimensions: {
    userId: {
      type: Boolean,
      default: true
    },
    userRole: {
      type: Boolean,
      default: true
    },
    loyaltyLevel: {
      type: Boolean,
      default: true
    },
    locationEnabled: {
      type: Boolean,
      default: true
    }
  },
  customMetrics: {
    pointsEarned: {
      type: Boolean,
      default: true
    },
    totalSpent: {
      type: Boolean,
      default: true
    },
    referralCount: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
googleAnalyticsSchema.index({ isEnabled: 1 });
googleAnalyticsSchema.index({ isConfigured: 1 });
googleAnalyticsSchema.index({ lastConfiguredBy: 1 });

const GoogleAnalytics = mongoose.model<IGoogleAnalytics>('GoogleAnalytics', googleAnalyticsSchema);

export default GoogleAnalytics; 