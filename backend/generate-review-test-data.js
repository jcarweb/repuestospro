const mongoose = require('mongoose');
const Review = require('./dist/models/Review').default;
const User = require('./dist/models/User').default;
const Product = require('./dist/models/Product').default;
const Order = require('./dist/models/Order').default;
require('dotenv').config();

// Conectar a la base de datos
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/repuestospro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const sampleReviews = [
  {
    rating: 5,
    title: 'Excelente producto',
    comment: 'El producto superó mis expectativas. Muy buena calidad y llegó en perfectas condiciones. Definitivamente lo recomiendo.',
    category: 'product',
    pointsEarned: 50,
    isVerified: true,
    helpful: 12
  },
  {
    rating: 4,
    title: 'Buen servicio de entrega',
    comment: 'El producto llegó a tiempo y en buen estado. El servicio de entrega fue eficiente y el repartidor muy amable.',
    category: 'delivery',
    pointsEarned: 40,
    isVerified: true,
    helpful: 8
  },
  {
    rating: 5,
    title: 'Aplicación muy útil',
    comment: 'La aplicación es muy fácil de usar y me ha ayudado mucho a encontrar los repuestos que necesito. Interfaz intuitiva.',
    category: 'app',
    pointsEarned: 50,
    isVerified: true,
    helpful: 15
  },
  {
    rating: 3,
    title: 'Producto regular',
    comment: 'El producto cumple su función pero la calidad podría ser mejor. El precio está bien para lo que ofrece.',
    category: 'product',
    pointsEarned: 30,
    isVerified: true,
    helpful: 3
  },
  {
    rating: 5,
    title: 'Atención al cliente excepcional',
    comment: 'El servicio al cliente fue increíble. Me ayudaron a resolver un problema rápidamente y con mucha paciencia.',
    category: 'service',
    pointsEarned: 50,
    isVerified: true,
    helpful: 20
  },
  {
    rating: 2,
    title: 'No recomendado',
    comment: 'El producto no funcionó como esperaba. Tuve problemas desde el primer día y el soporte no fue muy útil.',
    category: 'product',
    pointsEarned: 20,
    isVerified: true,
    helpful: 5
  },
  {
    rating: 4,
    title: 'Buen precio',
    comment: 'Encontré el repuesto que necesitaba a un precio muy competitivo. La calidad es buena para el precio.',
    category: 'product',
    pointsEarned: 40,
    isVerified: true,
    helpful: 7
  },
  {
    rating: 5,
    title: 'Entrega rápida',
    comment: 'Me sorprendió lo rápido que llegó mi pedido. El seguimiento fue muy claro y el producto llegó perfecto.',
    category: 'delivery',
    pointsEarned: 50,
    isVerified: true,
    helpful: 11
  },
  {
    rating: 4,
    title: 'Interfaz mejorable',
    comment: 'La aplicación funciona bien pero la interfaz podría ser más intuitiva. En general es útil.',
    category: 'app',
    pointsEarned: 40,
    isVerified: true,
    helpful: 6
  },
  {
    rating: 1,
    title: 'Muy decepcionado',
    comment: 'El producto llegó dañado y el servicio al cliente no quiso hacerse responsable. No volveré a comprar aquí.',
    category: 'product',
    pointsEarned: 10,
    isVerified: true,
    helpful: 2
  },
  {
    rating: 5,
    title: 'Excelente experiencia',
    comment: 'Todo el proceso fue perfecto: desde la búsqueda del producto hasta la entrega. Muy recomendado.',
    category: 'service',
    pointsEarned: 50,
    isVerified: true,
    helpful: 18
  },
  {
    rating: 3,
    title: 'Aceptable',
    comment: 'El producto cumple su función básica. No es extraordinario pero tampoco malo. Precio justo.',
    category: 'product',
    pointsEarned: 30,
    isVerified: true,
    helpful: 4
  },
  {
    rating: 4,
    title: 'Buen servicio',
    comment: 'El servicio fue bueno en general. El producto llegó a tiempo y funcionó correctamente.',
    category: 'service',
    pointsEarned: 40,
    isVerified: true,
    helpful: 9
  },
  {
    rating: 5,
    title: 'Super recomendado',
    comment: 'Increíble calidad y servicio. El producto superó todas mis expectativas y el soporte fue excelente.',
    category: 'product',
    pointsEarned: 50,
    isVerified: true,
    helpful: 25
  },
  {
    rating: 2,
    title: 'No cumplió expectativas',
    comment: 'El producto no era como lo describían. La calidad es inferior a lo esperado por el precio.',
    category: 'product',
    pointsEarned: 20,
    isVerified: true,
    helpful: 3
  }
];

const generateReviewData = async () => {
  try {
    console.log('🔍 Obteniendo usuarios, productos y órdenes...');
    
    // Obtener usuarios (clientes)
    const users = await User.find({ role: 'client' }).limit(10);
    if (users.length === 0) {
      console.log('❌ No se encontraron usuarios clientes. Creando algunos...');
      // Crear usuarios de prueba si no existen
      const testUsers = [];
      for (let i = 1; i <= 5; i++) {
        const user = new User({
          name: `Cliente Test ${i}`,
          email: `cliente${i}@test.com`,
          password: 'password123',
          role: 'client',
          isVerified: true
        });
        await user.save();
        testUsers.push(user);
      }
      users.push(...testUsers);
    }

    // Obtener productos
    const products = await Product.find().limit(10);
    if (products.length === 0) {
      console.log('❌ No se encontraron productos. Necesitas crear productos primero.');
      return;
    }

    // Obtener órdenes
    const orders = await Order.find().limit(10);
    if (orders.length === 0) {
      console.log('❌ No se encontraron órdenes. Necesitas crear órdenes primero.');
      return;
    }

    console.log(`✅ Encontrados: ${users.length} usuarios, ${products.length} productos, ${orders.length} órdenes`);

    // Generar reseñas
    const reviewsToCreate = [];
    const categories = ['product', 'service', 'delivery', 'app'];

    for (let i = 0; i < 50; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const randomOrder = orders[Math.floor(Math.random() * orders.length)];
      const randomReview = sampleReviews[Math.floor(Math.random() * sampleReviews.length)];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];

      // Crear fecha aleatoria en los últimos 3 meses
      const randomDate = new Date();
      randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 90));

      const reviewData = {
        userId: randomUser._id,
        productId: randomCategory === 'product' ? randomProduct._id : undefined,
        orderId: ['service', 'delivery'].includes(randomCategory) ? randomOrder._id : undefined,
        rating: randomReview.rating,
        title: randomReview.title,
        comment: randomReview.comment,
        category: randomCategory,
        pointsEarned: randomReview.pointsEarned,
        isVerified: randomReview.isVerified,
        helpful: randomReview.helpful,
        createdAt: randomDate,
        updatedAt: randomDate
      };

      reviewsToCreate.push(reviewData);
    }

    console.log('🗑️ Limpiando reseñas existentes...');
    await Review.deleteMany({});

    console.log('📝 Creando reseñas de prueba...');
    const createdReviews = await Review.insertMany(reviewsToCreate);

    console.log(`✅ Se crearon ${createdReviews.length} reseñas de prueba exitosamente`);
    
    // Mostrar estadísticas
    const stats = await Review.aggregate([
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          totalPoints: { $sum: '$pointsEarned' }
        }
      }
    ]);

    if (stats.length > 0) {
      console.log('\n📊 Estadísticas de las reseñas creadas:');
      console.log(`   Total de reseñas: ${stats[0].totalReviews}`);
      console.log(`   Calificación promedio: ${stats[0].averageRating.toFixed(1)}`);
      console.log(`   Puntos totales: ${stats[0].totalPoints}`);
    }

    // Mostrar distribución por categoría
    const categoryStats = await Review.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    console.log('\n📈 Distribución por categoría:');
    categoryStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} reseñas (promedio: ${stat.averageRating.toFixed(1)})`);
    });

  } catch (error) {
    console.error('❌ Error generando datos de prueba:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de la base de datos');
  }
};

// Ejecutar el script
generateReviewData();
