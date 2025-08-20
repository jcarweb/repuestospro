import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity extends Document {
  userId: mongoose.Types.ObjectId;
    type: 'login' | 'logout' | 'register' | 'password_reset' | 'password_changed' | 'email_verification' | 
                'cart_add' | 'cart_remove' | 'cart_clear' | 'purchase' | 'profile_update' | 'preferences_update' |
                'push_notifications_update' | 'avatar_upload' |
                'pin_setup' | 'fingerprint_setup' | 'google_login' | 'account_lock' | 'account_unlock' |
                'two_factor_enabled' | 'two_factor_disabled' | 'two_factor_verification' | 'backup_codes_generated' |
                'location_update' | 'location_enabled' | 'location_disabled' |
                'points_earned' | 'reward_redeemed' | 'referral_used' | 'review_submitted';
  description: string;
  metadata?: {
    ip?: string;
    userAgent?: string;
    device?: string;
    location?: string;
    productId?: string;
    productName?: string;
    quantity?: number;
    total?: number;
    paymentMethod?: string;
    orderId?: string;
  };
  success: boolean;
  errorMessage?: string;
  createdAt: Date;
}

const activitySchema = new Schema<IActivity>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
              'login', 'logout', 'register', 'password_reset', 'password_changed', 'email_verification',
        'cart_add', 'cart_remove', 'cart_clear', 'purchase', 'profile_update', 'preferences_update',
        'push_notifications_update', 'avatar_upload',
        'pin_setup', 'fingerprint_setup', 'google_login', 'account_lock', 'account_unlock',
        'two_factor_enabled', 'two_factor_disabled', 'two_factor_verification', 'backup_codes_generated',
        'location_update', 'location_enabled', 'location_disabled',
        'points_earned', 'reward_redeemed', 'referral_used', 'review_submitted'
    ]
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    ip: String,
    userAgent: String,
    device: String,
    location: String,
    productId: String,
    productName: String,
    quantity: Number,
    total: Number,
    paymentMethod: String,
    orderId: String
  },
  success: {
    type: Boolean,
    required: true,
    default: true
  },
  errorMessage: String
}, {
  timestamps: true
});

// Índices para optimizar consultas
activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ type: 1, createdAt: -1 });
activitySchema.index({ success: 1 });
activitySchema.index({ createdAt: -1 });

// Método estático para crear actividad
activitySchema.statics.createActivity = async function(
  userId: string,
  type: IActivity['type'],
  description: string,
  metadata?: any,
  success: boolean = true,
  errorMessage?: string
): Promise<IActivity> {
  return this.create({
    userId,
    type,
    description,
    metadata,
    success,
    errorMessage
  });
};

// Método estático para obtener actividades de un usuario
activitySchema.statics.getUserActivities = async function(
  userId: string,
  limit: number = 50,
  skip: number = 0
): Promise<IActivity[]> {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Método estático para obtener estadísticas de actividades
activitySchema.statics.getActivityStats = async function(
  userId: string,
  days: number = 30
): Promise<any> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const stats = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        successCount: {
          $sum: { $cond: ['$success', 1, 0] }
        }
      }
    }
  ]);

  return stats;
};

const Activity = mongoose.model<IActivity>('Activity', activitySchema);

export default Activity;