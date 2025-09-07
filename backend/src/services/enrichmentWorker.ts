import StorePhoto from '../models/StorePhoto';
import { CryptoAuth } from '../utils/cryptoAuth';
import axios from 'axios';
import * as Tesseract from 'tesseract.js';

export class EnrichmentWorker {
  private isRunning = false;

  /**
   * Inicia el worker de enriquecimiento
   */
  async startWorker(): Promise<void> {
    if (this.isRunning) {
      console.log('Worker ya está ejecutándose');
      return;
    }

    this.isRunning = true;
    console.log('Iniciando worker de enriquecimiento...');

    // Ejecutar cada 30 segundos
    const interval = setInterval(async () => {
      if (!this.isRunning) {
        clearInterval(interval);
        return;
      }

      try {
        await this.processPendingPhotos();
      } catch (error) {
        console.error('Error en worker de enriquecimiento:', error);
      }
    }, 30000);

    // Procesar inmediatamente al iniciar
    await this.processPendingPhotos();
  }

  /**
   * Detiene el worker
   */
  stopWorker(): void {
    this.isRunning = false;
    console.log('Worker de enriquecimiento detenido');
  }

  /**
   * Procesa fotos pendientes
   */
  private async processPendingPhotos(): Promise<void> {
    try {
      const pendingPhotos = await StorePhoto.find({ status: 'pending' }).limit(5);
      
      if (pendingPhotos.length === 0) {
        return;
      }

      console.log(`Procesando ${pendingPhotos.length} fotos pendientes...`);

      for (const photo of pendingPhotos) {
        try {
          await this.enrichPhoto(photo);
        } catch (error) {
          console.error(`Error enriqueciendo foto ${photo._id}:`, error);
          await this.markPhotoAsError(photo._id, error.message);
        }
      }
    } catch (error) {
      console.error('Error procesando fotos pendientes:', error);
    }
  }

  /**
   * Enriquece una foto específica
   */
  async enrichPhoto(photo: any): Promise<void> {
    try {
      // Marcar como procesando
      await StorePhoto.findByIdAndUpdate(photo._id, { status: 'processing' });

      console.log(`Enriqueciendo foto: ${photo.name}`);

      // 1. OCR con Tesseract.js
      const ocrText = await this.performOCR(photo.imageUrl);
      
      // 2. Búsqueda en MercadoLibre
      const mercadoLibreData = await this.searchMercadoLibre(photo.name, ocrText);
      
      // 3. Búsqueda en DuckDuckGo
      const duckDuckGoData = await this.searchDuckDuckGo(photo.name, ocrText);
      
      // 4. Búsqueda en Instagram (opcional)
      const instagramData = await this.searchInstagram(photo.name);

      // Actualizar el documento con los resultados
      await StorePhoto.findByIdAndUpdate(photo._id, {
        ocrText,
        metrics: {
          mercadoLibre: mercadoLibreData,
          duckduckgo: duckDuckGoData,
          instagram: instagramData,
          whatsapp: { found: false, lastUpdated: new Date() }
        },
        status: 'enriched'
      });

      console.log(`Foto ${photo.name} enriquecida exitosamente`);
    } catch (error) {
      console.error(`Error enriqueciendo foto ${photo._id}:`, error);
      await this.markPhotoAsError(photo._id, error.message);
    }
  }

  /**
   * Realiza OCR en la imagen
   */
  private async performOCR(imageUrl: string): Promise<string> {
    try {
      console.log('Realizando OCR...');
      
      const { data: { text } } = await Tesseract.recognize(
        imageUrl,
        'spa+eng', // Español e inglés
        {
          logger: m => console.log('OCR Progress:', m)
        }
      );

      return text.trim();
    } catch (error) {
      console.error('Error en OCR:', error);
      return '';
    }
  }

  /**
   * Busca en MercadoLibre API
   */
  private async searchMercadoLibre(storeName: string, ocrText: string): Promise<any> {
    try {
      console.log('Buscando en MercadoLibre...');
      
      const searchTerm = this.extractSearchTerm(storeName, ocrText);
      const encodedTerm = encodeURIComponent(searchTerm);
      
      // API gratuita de MercadoLibre
      const response = await axios.get(
        `https://api.mercadolibre.com/sites/MLV/search?q=${encodedTerm}&limit=10`,
        { timeout: 10000 }
      );

      return {
        found: response.data.results && response.data.results.length > 0,
        results: response.data.results || [],
        searchTerm,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error buscando en MercadoLibre:', error);
      return {
        found: false,
        results: [],
        searchTerm: storeName,
        lastUpdated: new Date(),
        error: error.message
      };
    }
  }

  /**
   * Busca en DuckDuckGo
   */
  private async searchDuckDuckGo(storeName: string, ocrText: string): Promise<any> {
    try {
      console.log('Buscando en DuckDuckGo...');
      
      const searchTerm = this.extractSearchTerm(storeName, ocrText);
      
      // Usar DuckDuckGo Instant Answer API (gratuita)
      const response = await axios.get(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(searchTerm)}&format=json&no_html=1&skip_disambig=1`,
        { timeout: 10000 }
      );

      return {
        found: response.data.AbstractText || response.data.RelatedTopics?.length > 0,
        results: {
          abstract: response.data.AbstractText,
          relatedTopics: response.data.RelatedTopics || [],
          definition: response.data.Definition
        },
        searchTerm,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error buscando en DuckDuckGo:', error);
      return {
        found: false,
        results: {},
        searchTerm: storeName,
        lastUpdated: new Date(),
        error: error.message
      };
    }
  }

  /**
   * Busca en Instagram (simulado - en producción usarías la API oficial)
   */
  private async searchInstagram(storeName: string): Promise<any> {
    try {
      console.log('Buscando en Instagram...');
      
      // Simulación de búsqueda en Instagram
      // En producción, usarías la Instagram Basic Display API o Graph API
      const mockData = {
        found: Math.random() > 0.5, // Simulación aleatoria
        followers: Math.floor(Math.random() * 10000),
        username: storeName.toLowerCase().replace(/\s+/g, ''),
        lastUpdated: new Date()
      };

      return mockData;
    } catch (error) {
      console.error('Error buscando en Instagram:', error);
      return {
        found: false,
        lastUpdated: new Date(),
        error: error.message
      };
    }
  }

  /**
   * Extrae términos de búsqueda relevantes
   */
  private extractSearchTerm(storeName: string, ocrText: string): string {
    // Combinar nombre de la tienda con texto OCR relevante
    const relevantWords = ocrText
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 3); // Tomar las primeras 3 palabras relevantes

    return `${storeName} ${relevantWords.join(' ')}`.trim();
  }

  /**
   * Marca una foto como error
   */
  private async markPhotoAsError(photoId: string, errorMessage: string): Promise<void> {
    await StorePhoto.findByIdAndUpdate(photoId, {
      status: 'error',
      errorMessage
    });
  }

  /**
   * Procesa una foto específica por ID
   */
  async processPhotoById(photoId: string): Promise<boolean> {
    try {
      const photo = await StorePhoto.findById(photoId);
      if (!photo) {
        throw new Error('Foto no encontrada');
      }

      if (photo.status === 'enriched') {
        throw new Error('Foto ya fue enriquecida');
      }

      await this.enrichPhoto(photo);
      return true;
    } catch (error) {
      console.error(`Error procesando foto ${photoId}:`, error);
      return false;
    }
  }

  /**
   * Obtiene estadísticas del worker
   */
  async getStats(): Promise<any> {
    const stats = await StorePhoto.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    return {
      total: await StorePhoto.countDocuments(),
      byStatus: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      isRunning: this.isRunning
    };
  }
}

// Instancia singleton del worker
export const enrichmentWorker = new EnrichmentWorker();
