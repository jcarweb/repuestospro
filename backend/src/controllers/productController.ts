import { Request, Response } from 'express';
import Product from '../models/Product';
import Store from '../models/Store';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import { ContentFilterService } from '../middleware/contentFilter';
import { productUpload } from '../config/cloudinary';
import imageService from '../services/imageService';
import InventoryConfig from '../models/InventoryConfig'; // Added import for InventoryConfig

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.csv');
  }
});

export const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos CSV'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
});

class ProductController {
  // Endpoint de prueba simple
  async testEndpoint(req: Request, res: Response) {
    try {
      console.log('🔍 Test endpoint llamado');
      res.json({
        success: true,
        message: 'Backend funcionando correctamente',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error en test endpoint:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

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

      const filter: any = { isActive: true, deleted: { $ne: true } };

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

      const product = await Product.findOne({ _id: id, isActive: true, deleted: { $ne: true } })
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
        deleted: { $ne: true },
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
        isFeatured: true,
        deleted: { $ne: true }
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
        { $match: { isActive: true, deleted: { $ne: true } } },
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
        { $match: { isActive: true, deleted: { $ne: true } } },
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

  // Crear un producto individual (Admin/Store Manager) - VERSIÓN SIMPLIFICADA
  async createProduct(req: Request, res: Response) {
    try {
      const {
        name,
        description,
        price,
        category,
        brand,
        subcategory,
        sku,
        originalPartCode,
        stock,
        isFeatured,
        tags,
        specifications,
        images,
        storeId
      } = req.body;

      // Validaciones básicas
      if (!name || !description || !price || !category || !sku || !storeId) {
        return res.status(400).json({
          success: false,
          message: 'Los campos nombre, descripción, precio, categoría, SKU y storeId son obligatorios'
        });
      }

      // Procesar imágenes si se proporcionan
      let processedImages: string[] = [];
      if (images && images.length > 0) {
        try {
          const imageService = require('../services/imageService').default;
          
          // Convertir imágenes base64 a URLs de Cloudinary
          const uploadPromises = images.map(async (img: any, index: number) => {
            if (img.startsWith('data:image/')) {
              const result = await imageService.uploadBase64Image({
                data: img,
                format: img.split(';')[0].split('/')[1] || 'jpg',
                filename: `product_${Date.now()}_${index}`
              }, 'piezasya/products');
              return result.secureUrl;
            } else if (img.startsWith('http')) {
              return img;
            } else {
              return img;
            }
          });
          
          processedImages = await Promise.all(uploadPromises);
        } catch (imageError) {
          console.error('Error procesando imágenes:', imageError);
          processedImages = [];
        }
      }

      // Crear el producto con datos mínimos
      const productData = {
        name: String(name),
        description: String(description),
        price: Number(price),
        category: String(category),
        brand: brand ? String(brand) : undefined,
        subcategory: subcategory ? String(subcategory) : undefined,
        sku: String(sku),
        originalPartCode: originalPartCode ? String(originalPartCode) : undefined,
        stock: Number(stock) || 0,
        isActive: true,
        isFeatured: Boolean(isFeatured),
        tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((tag: string) => tag.trim())) : [],
        specifications: specifications ? (typeof specifications === 'string' ? { description: specifications } : specifications) : {},
        images: processedImages,
        store: storeId,
        createdBy: storeId // Temporalmente usar storeId como createdBy
      };

      try {
        const product = new Product(productData);
        await product.save();

        res.status(201).json({
          success: true,
          message: 'Producto creado exitosamente',
          data: product
        });
      } catch (saveError: any) {
        // Si es un error de validación de Mongoose
        if (saveError.name === 'ValidationError') {
          const validationErrors = Object.values(saveError.errors).map((err: any) => err.message);
          return res.status(400).json({
            success: false,
            message: 'Error de validación en los datos del producto',
            errors: validationErrors
          });
        }
        
        // Si es un error de duplicación de SKU
        if (saveError.code === 11000) {
          return res.status(400).json({
            success: false,
            message: 'El SKU ya existe en esta tienda'
          });
        }
        
        throw saveError;
      }
    } catch (error: any) {
      console.error('Error creando producto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Actualizar un producto - VERSIÓN SIMPLIFICADA
  async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Verificar si el producto existe
      const existingProduct = await Product.findById(id);
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      // Actualizar el producto
      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        message: 'Producto actualizado exitosamente',
        data: updatedProduct
      });
    } catch (error: any) {
      console.error('Error actualizando producto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Mover producto a papelera - VERSIÓN SIMPLIFICADA
  async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      // Marcar producto como eliminado (en papelera)
      product.isActive = false;
      product.deleted = true;
      product.deletedAt = new Date();
      await product.save();

      res.json({
        success: true,
        message: 'Producto movido a papelera exitosamente'
      });
    } catch (error: any) {
      console.error('Error moviendo producto a papelera:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener productos eliminados (en papelera)
  async getDeletedProducts(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 20,
        search
      } = req.query;

      const filter: any = { deleted: true };

      // Búsqueda por texto
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { sku: { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);

      const products = await Product.find(filter)
        .populate('store', 'name city state')
        .sort({ deletedAt: -1 })
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
    } catch (error: any) {
      console.error('Error obteniendo productos eliminados:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Restaurar producto desde la papelera
  async restoreProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      if (!product.deleted) {
        return res.status(400).json({
          success: false,
          message: 'El producto no está en la papelera'
        });
      }

      // Restaurar producto
      product.isActive = true;
      product.deleted = false;
      product.deletedAt = undefined;
      await product.save();

      res.json({
        success: true,
        message: 'Producto restaurado exitosamente',
        data: product
      });
    } catch (error: any) {
      console.error('Error restaurando producto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Eliminación física permanente
  async permanentlyDeleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      if (!product.deleted) {
        return res.status(400).json({
          success: false,
          message: 'Solo se pueden eliminar permanentemente productos en la papelera'
        });
      }

      // Eliminación física permanente
      await Product.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Producto eliminado permanentemente'
      });
    } catch (error: any) {
      console.error('Error eliminando producto permanentemente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Importar productos por lotes desde CSV
  async importProductsFromCSV(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se ha proporcionado ningún archivo'
        });
      }

      const { storeId } = req.body; // ID de la tienda desde el formulario
      const userId = (req as any).user._id;
      const userRole = (req as any).user.role;

      // Verificar permisos de tienda
      if (userRole === 'store_manager') {
        if (!storeId) {
          return res.status(400).json({
            success: false,
            message: 'Debe especificar una tienda'
          });
        }

        const store = await Store.findOne({
          _id: storeId,
          $or: [
            { owner: userId },
            { managers: userId }
          ],
          isActive: true
        });

        if (!store) {
          return res.status(403).json({
            success: false,
            message: 'No tiene permisos para importar productos en esta tienda'
          });
        }
      } else if (userRole === 'admin') {
        if (!storeId) {
          return res.status(400).json({
            success: false,
            message: 'Debe especificar una tienda'
          });
        }

        const store = await Store.findById(storeId);
        if (!store) {
          return res.status(404).json({
            success: false,
            message: 'Tienda no encontrada'
          });
        }
      }

      const results: any[] = [];
      const errors: any[] = [];
      let successCount = 0;
      let errorCount = 0;

      // Leer el archivo CSV
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          try {
            console.log(`📊 Procesando ${results.length} productos desde CSV...`);

            for (let i = 0; i < results.length; i++) {
              const row = results[i];
              
              try {
                // Validar campos obligatorios
                if (!row.name || !row.description || !row.price || !row.category || !row.sku) {
                  errors.push({
                    row: i + 2,
                    error: 'Campos obligatorios faltantes',
                    data: row
                  });
                  errorCount++;
                  continue;
                }

                // Verificar si el SKU ya existe en la tienda
                const existingProduct = await Product.findOne({ 
                  sku: row.sku, 
                  store: storeId 
                });
                if (existingProduct) {
                  errors.push({
                    row: i + 2,
                    error: 'SKU ya existe en esta tienda',
                    data: row
                  });
                  errorCount++;
                  continue;
                }

                // Crear el producto
                const product = new Product({
                  name: row.name.trim(),
                  description: row.description.trim(),
                  price: Number(row.price),
                  category: row.category.trim(),
                  brand: row.brand?.trim() || '',
                  subcategory: row.subcategory?.trim() || '',
                  sku: row.sku.trim(),
                  originalPartCode: row.originalPartCode?.trim() || '',
                  stock: Number(row.stock) || 0,
                  isFeatured: row.isFeatured === 'true' || row.isFeatured === '1',
                  tags: row.tags ? row.tags.split(',').map((tag: string) => tag.trim()) : [],
                  specifications: row.specifications ? JSON.parse(row.specifications) : {},
                  images: row.images ? row.images.split(',').map((img: string) => img.trim()) : [],
                  store: storeId,
                  createdBy: userId
                });

                await product.save();
                successCount++;

              } catch (error) {
                errors.push({
                  row: i + 2,
                  error: error instanceof Error ? error.message : 'Error desconocido',
                  data: row
                });
                errorCount++;
              }
            }

            // Eliminar el archivo temporal
            fs.unlinkSync(req.file.path);

            res.json({
              success: true,
              message: `Importación completada. ${successCount} productos importados exitosamente, ${errorCount} errores.`,
              data: {
                total: results.length,
                successCount,
                errorCount,
                errors: errors.slice(0, 10)
              }
            });

          } catch (error) {
            console.error('Error procesando CSV:', error);
            res.status(500).json({
              success: false,
              message: 'Error procesando el archivo CSV'
            });
          }
        })
        .on('error', (error) => {
          console.error('Error leyendo CSV:', error);
          res.status(500).json({
            success: false,
            message: 'Error leyendo el archivo CSV'
          });
        });

    } catch (error) {
      console.error('Error en importación de productos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener todos los productos para administración (con filtros)
  async getAdminProducts(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        brand,
        subcategory,
        minPrice,
        maxPrice,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search,
        status, // active, inactive, all
        storeId // Filtrar por tienda específica
      } = req.query;

      const filter: any = {
        deleted: { $ne: true } // Excluir productos eliminados (en papelera)
      };

      // Filtro de estado
      if (status === 'active') {
        filter.isActive = true;
      } else if (status === 'inactive') {
        filter.isActive = false;
      }

      // Filtro por tienda
      if (storeId) {
        filter.store = storeId;
      }

      // Otros filtros
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
        .populate('store', 'name city state')
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
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
      console.error('Error obteniendo productos para admin:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener productos para gestor de tienda (solo sus tiendas)
  async getStoreManagerProducts(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        brand,
        subcategory,
        minPrice,
        maxPrice,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search,
        status, // active, inactive, all
        storeId // Filtrar por tienda específica
      } = req.query;

      const userId = (req as any).user._id;

      // Obtener las tiendas del usuario
      const userStores = await Store.find({
        $or: [
          { owner: userId },
          { managers: userId }
        ],
        isActive: true
      }).select('_id');

      const storeIds = userStores.map(store => store._id);

      if (storeIds.length === 0) {
        return res.json({
          success: true,
          data: {
            products: [],
            pagination: {
              page: Number(page),
              limit: Number(limit),
              total: 0,
              totalPages: 0
            }
          }
        });
      }

      const filter: any = {
        store: { $in: storeIds },
        deleted: { $ne: true } // Excluir productos eliminados (en papelera)
      };

      // Filtro por tienda específica (si se especifica)
      if (storeId) {
        if (!storeIds.includes(storeId)) {
          return res.status(403).json({
            success: false,
            message: 'No tiene permisos para acceder a esta tienda'
          });
        }
        filter.store = storeId;
      }

      // Filtro de estado
      if (status === 'active') {
        filter.isActive = true;
      } else if (status === 'inactive') {
        filter.isActive = false;
      }

      // Otros filtros
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
        .populate('store', 'name city state')
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
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
      console.error('Error obteniendo productos para gestor de tienda:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener estadísticas de productos
  async getProductStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user._id;
      const userRole = (req as any).user.role;

      let filter: any = {
        deleted: { $ne: true } // Excluir productos eliminados (en papelera)
      };

      // Si es gestor de tienda, filtrar por sus tiendas
      if (userRole === 'store_manager') {
        const userStores = await Store.find({
          $or: [
            { owner: userId },
            { managers: userId }
          ],
          isActive: true
        }).select('_id');

        const storeIds = userStores.map(store => store._id);
        if (storeIds.length === 0) {
          return res.json({
            success: true,
            data: {
              totalProducts: 0,
              activeProducts: 0,
              featuredProducts: 0,
              lowStockProducts: 0,
              outOfStockProducts: 0,
              productsByCategory: [],
              productsByBrand: []
            }
          });
        }
        filter.store = { $in: storeIds };
      }

      const totalProducts = await Product.countDocuments(filter);
      const activeProducts = await Product.countDocuments({ ...filter, isActive: true });
      const featuredProducts = await Product.countDocuments({ ...filter, isFeatured: true });
      const lowStockProducts = await Product.countDocuments({ ...filter, stock: { $lt: 10 } });
      const outOfStockProducts = await Product.countDocuments({ ...filter, stock: 0 });

      // Productos por categoría
      const productsByCategory = await Product.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            avgPrice: { $avg: '$price' }
          }
        },
        { $sort: { count: -1 } }
      ]);

      // Productos por marca
      const productsByBrand = await Product.aggregate([
        { $match: { ...filter, brand: { $exists: true, $ne: '' } } },
        {
          $group: {
            _id: '$brand',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      res.json({
        success: true,
        data: {
          totalProducts,
          activeProducts,
          featuredProducts,
          lowStockProducts,
          outOfStockProducts,
          productsByCategory,
          productsByBrand
        }
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas de productos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Buscar productos por proximidad geográfica (público)
  async getProductsByLocation(req: Request, res: Response) {
    try {
      const { latitude, longitude, radius = 10, category, brand, limit = 50 } = req.query;
      
      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Se requieren coordenadas de latitud y longitud'
        });
      }

      const lat = parseFloat(latitude as string);
      const lng = parseFloat(longitude as string);
      const searchRadius = parseFloat(radius as string);
      const maxResults = parseInt(limit as string);

      // Construir filtro de búsqueda
      const filter: any = {
        isActive: true,
        stock: { $gt: 0 } // Solo productos con stock disponible
      };

      if (category) {
        filter.category = category;
      }

      if (brand) {
        filter.brand = brand;
      }

      // Buscar tiendas dentro del radio especificado
      const nearbyStores = await Store.find({
        coordinates: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat] // MongoDB usa [longitude, latitude]
            },
            $maxDistance: searchRadius * 1000 // Convertir km a metros
          }
        },
        isActive: true
      }).select('_id name city state coordinates');

      if (nearbyStores.length === 0) {
        return res.json({
          success: true,
          data: {
            products: [],
            stores: [],
            total: 0,
            message: 'No se encontraron tiendas cercanas'
          }
        });
      }

      // Obtener IDs de tiendas cercanas
      const storeIds = nearbyStores.map(store => store._id);

      // Buscar productos en tiendas cercanas
      const products = await Product.find({
        ...filter,
        store: { $in: storeIds }
      })
      .populate('store', 'name city state coordinates')
      .limit(maxResults)
      .sort({ popularity: -1, price: 1 });

      // Calcular distancia para cada producto
      const productsWithDistance = products.map(product => {
        const store = product.store as any;
        const distance = this.calculateDistance(
          lat, lng,
          store.coordinates.latitude,
          store.coordinates.longitude
        );

        return {
          ...product.toObject(),
          distance: Math.round(distance * 100) / 100, // Redondear a 2 decimales
          storeInfo: {
            name: store.name,
            city: store.city,
            state: store.state,
            coordinates: store.coordinates
          }
        };
      });

      // Ordenar por distancia
      productsWithDistance.sort((a, b) => a.distance - b.distance);

      res.json({
        success: true,
        data: {
          products: productsWithDistance,
          stores: nearbyStores.map(store => ({
            id: store._id,
            name: store.name,
            city: store.city,
            state: store.state,
            coordinates: store.coordinates
          })),
          total: productsWithDistance.length,
          searchRadius: searchRadius,
          userLocation: { latitude: lat, longitude: lng }
        }
      });
    } catch (error) {
      console.error('❌ Error buscando productos por ubicación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al buscar productos'
      });
    }
  }

  // Función para calcular distancia entre dos puntos geográficos (fórmula de Haversine)
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en kilómetros
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distancia en kilómetros
    return distance;
  }
}

const productController = new ProductController();
export default productController; 