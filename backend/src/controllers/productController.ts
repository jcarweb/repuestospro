import { Request, Response } from 'express';
import Product from '../models/Product';

class ProductController {
  // Obtener todos los productos (con paginación y filtros)
  async getProducts(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 12,
        category,
        brand,
        subcategory,
        minPrice,
        maxPrice,
        sortBy = 'popularity',
        sortOrder = 'desc',
        search
      } = req.query;

      const filter: any = { isActive: true };

      // Filtros
      if (category) filter.category = category;
      if (brand) filter.brand = brand;
      if (subcategory) filter.subcategory = subcategory;
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
      }

      // Búsqueda por texto
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { sku: { $regex: search, $options: 'i' } },
          { originalPartCode: { $regex: search, $options: 'i' } }
        ];
      }

      // Ordenamiento
      const sort: any = {};
      sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

      const skip = (Number(page) - 1) * Number(limit);

      const products = await Product.find(filter)
        .sort(sort)
        .limit(Number(limit))
        .skip(skip)
        .select('-__v');

      const total = await Product.countDocuments(filter);

      res.json({
        success: true,
        data: {
          products,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener un producto específico por ID
  async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const product = await Product.findOne({ _id: id, isActive: true })
        .select('-__v');

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      // Obtener productos relacionados
      const relatedProducts = await Product.find({
        _id: { $ne: id },
        isActive: true,
        $or: [
          { category: product.category },
          { brand: product.brand },
          { subcategory: product.subcategory }
        ]
      })
        .limit(4)
        .select('name price images category brand');

      res.json({
        success: true,
        data: {
          product,
          relatedProducts
        }
      });
    } catch (error) {
      console.error('Error obteniendo producto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener productos por categoría
  async getProductsByCategory(req: Request, res: Response) {
    try {
      const { category } = req.params;
      const { page = 1, limit = 12, sortBy = 'popularity', sortOrder = 'desc' } = req.query;

      const filter: any = { 
        isActive: true,
        category: category.toLowerCase()
      };

      const sort: any = {};
      sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

      const skip = (Number(page) - 1) * Number(limit);

      const products = await Product.find(filter)
        .sort(sort)
        .limit(Number(limit))
        .skip(skip)
        .select('-__v');

      const total = await Product.countDocuments(filter);

      // Obtener subcategorías de esta categoría
      const subcategories = await Product.distinct('subcategory', filter);

      res.json({
        success: true,
        data: {
          products,
          category,
          subcategories,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Error obteniendo productos por categoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener productos destacados
  async getFeaturedProducts(req: Request, res: Response) {
    try {
      const products = await Product.find({ 
        isActive: true, 
        isFeatured: true 
      })
        .sort({ popularity: -1 })
        .limit(8)
        .select('name price images category brand');

      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error('Error obteniendo productos destacados:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener categorías disponibles
  async getCategories(req: Request, res: Response) {
    try {
      const categories = await Product.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            avgPrice: { $avg: '$price' }
          }
        },
        { $sort: { count: -1 } }
      ]);

      res.json({
        success: true,
        data: categories.map(cat => ({
          name: cat._id,
          count: cat.count,
          avgPrice: Math.round(cat.avgPrice)
        }))
      });
    } catch (error) {
      console.error('Error obteniendo categorías:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener marcas disponibles
  async getBrands(req: Request, res: Response) {
    try {
      const brands = await Product.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$brand',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      res.json({
        success: true,
        data: brands.map(brand => ({
          name: brand._id,
          count: brand.count
        }))
      });
    } catch (error) {
      console.error('Error obteniendo marcas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

const productController = new ProductController();
export default productController; 