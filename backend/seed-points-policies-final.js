const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/repuestospro';

// Schema para PointsPolicy
const pointsPolicySchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['purchase', 'review', 'referral', 'share', 'redemption', 'login', 'birthday', 'anniversary']
  },
  points: {
    type: Number,
    required: true,
    default: 0
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  isActive: {
    type: Boolean,
    default: true
  },
  conditions: {
    minAmount: {
      type: Number,
      min: 0
    },
    maxAmount: {
      type: Number,
      min: 0
    },
    category: {
      type: String
    },
    frequency: {
      type: String,
      enum: ['once', 'daily', 'weekly', 'monthly'],
      default: 'once'
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const PointsPolicy = mongoose.model('PointsPolicy', pointsPolicySchema);

const defaultPolicies = [
  {
    action: 'purchase',
    points: 1,
    description: 'Puntos por cada compra realizada (1 punto por cada $1)',
    isActive: true,
    conditions: {
      minAmount: 1,
      frequency: 'once'
    }
  },
  {
    action: 'review',
    points: 10,
    description: 'Puntos por enviar una reseña de producto',
    isActive: true,
    conditions: {
      frequency: 'once'
    }
  },
  {
    action: 'referral',
    points: 50,
    description: 'Puntos por referir a un nuevo cliente que se registre',
    isActive: true,
    conditions: {
      frequency: 'once'
    }
  },
  {
    action: 'share',
    points: 5,
    description: 'Puntos por compartir productos en redes sociales',
    isActive: true,
    conditions: {
      frequency: 'daily'
    }
  },
  {
    action: 'login',
    points: 1,
    description: 'Puntos por iniciar sesión diariamente',
    isActive: true,
    conditions: {
      frequency: 'daily'
    }
  },
  {
    action: 'birthday',
    points: 100,
    description: 'Puntos por cumpleaños del cliente',
    isActive: true,
    conditions: {
      frequency: 'once'
    }
  },
  {
    action: 'anniversary',
    points: 25,
    description: 'Puntos por aniversario de registro',
    isActive: true,
    conditions: {
      frequency: 'monthly'
    }
  }
];

async function seedPointsPolicies() {
  try {
    // Conectar a la base de datos
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Eliminar políticas existentes
    await PointsPolicy.deleteMany({});
    console.log('🗑️ Políticas existentes eliminadas');

    // Crear nuevas políticas con un ObjectId generado
    const policiesToCreate = defaultPolicies.map(policy => ({
      ...policy,
      createdBy: new mongoose.Types.ObjectId()
    }));

    const createdPolicies = await PointsPolicy.insertMany(policiesToCreate);
    console.log(`✅ ${createdPolicies.length} políticas creadas exitosamente`);

    // Mostrar las políticas creadas
    console.log('\n📋 Políticas creadas:');
    createdPolicies.forEach(policy => {
      console.log(`- ${policy.action}: ${policy.points} puntos - ${policy.description}`);
    });

    console.log('\n🎉 Políticas de puntos inicializadas correctamente');
    console.log('💡 Puedes acceder al sistema de fidelización en /admin/loyalty');
  } catch (error) {
    console.error('❌ Error inicializando políticas de puntos:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar el script
seedPointsPolicies();
