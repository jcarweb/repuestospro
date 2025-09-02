// Utilidades para probar la carga de imágenes

export interface ImageTestResult {
  url: string;
  success: boolean;
  loadTime?: number;
  error?: string;
  size?: {
    width: number;
    height: number;
  };
}

/**
 * Prueba si una imagen se puede cargar correctamente
 */
export const testImageLoad = (url: string): Promise<ImageTestResult> => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const img = new Image();
    
    img.onload = () => {
      const loadTime = Date.now() - startTime;
      resolve({
        url,
        success: true,
        loadTime,
        size: {
          width: img.naturalWidth,
          height: img.naturalHeight
        }
      });
    };
    
    img.onerror = () => {
      const loadTime = Date.now() - startTime;
      resolve({
        url,
        success: false,
        loadTime,
        error: 'Failed to load image'
      });
    };
    
    // Establecer timeout de 10 segundos
    setTimeout(() => {
      resolve({
        url,
        success: false,
        loadTime: 10000,
        error: 'Timeout loading image'
      });
    }, 10000);
    
    img.src = url;
  });
};

/**
 * Prueba múltiples imágenes en paralelo
 */
export const testMultipleImages = async (urls: string[]): Promise<ImageTestResult[]> => {
  const promises = urls.map(url => testImageLoad(url));
  return Promise.all(promises);
};

/**
 * Genera un reporte de las imágenes probadas
 */
export const generateImageTestReport = (results: ImageTestResult[]) => {
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  const avgLoadTime = successful.length > 0 
    ? successful.reduce((sum, r) => sum + (r.loadTime || 0), 0) / successful.length
    : 0;
  
  return {
    total: results.length,
    successful: successful.length,
    failed: failed.length,
    successRate: (successful.length / results.length) * 100,
    averageLoadTime: Math.round(avgLoadTime),
    failedUrls: failed.map(r => r.url),
    successfulUrls: successful.map(r => r.url)
  };
};

/**
 * Prueba las imágenes de un producto específico
 */
export const testProductImages = async (product: any): Promise<ImageTestResult[]> => {
  if (!product.images || product.images.length === 0) {
    return [{
      url: 'No images',
      success: false,
      error: 'Product has no images'
    }];
  }
  
  console.log(`🧪 Probando ${product.images.length} imágenes para producto: ${product.name}`);
  const results = await testMultipleImages(product.images);
  
  const report = generateImageTestReport(results);
  console.log('📊 Reporte de prueba de imágenes:', report);
  
  return results;
};

/**
 * Prueba las imágenes de múltiples productos
 */
export const testMultipleProducts = async (products: any[]): Promise<{
  productResults: { productId: string; productName: string; results: ImageTestResult[] }[];
  summary: any;
}> => {
  const productResults = [];
  
  for (const product of products) {
    const results = await testProductImages(product);
    productResults.push({
      productId: product._id,
      productName: product.name,
      results
    });
  }
  
  const allResults = productResults.flatMap(pr => pr.results);
  const summary = generateImageTestReport(allResults);
  
  return { productResults, summary };
};
