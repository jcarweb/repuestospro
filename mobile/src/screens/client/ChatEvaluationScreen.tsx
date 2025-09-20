import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';

interface ChatEvaluation {
  chatId: string;
  rating: number;
  categories: {
    responseTime: number;
    helpfulness: number;
    professionalism: number;
    problemResolution: number;
  };
  comments: string;
  wouldRecommend: boolean;
  timestamp: Date;
}

const ChatEvaluationScreen: React.FC = () => {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const [rating, setRating] = useState(0);
  const [categories, setCategories] = useState({
    responseTime: 0,
    helpfulness: 0,
    professionalism: 0,
    problemResolution: 0,
  });
  const [comments, setComments] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryLabels = {
    responseTime: 'Tiempo de Respuesta',
    helpfulness: 'Utilidad de la Ayuda',
    professionalism: 'Profesionalismo',
    problemResolution: 'Resolución del Problema',
  };

  const handleRatingPress = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleCategoryRating = (category: keyof typeof categories, value: number) => {
    setCategories(prev => ({
      ...prev,
      [category]: value,
    }));
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      showToast('Por favor califica tu experiencia general', 'error');
      return;
    }

    if (Object.values(categories).some(cat => cat === 0)) {
      showToast('Por favor califica todas las categorías', 'error');
      return;
    }

    if (wouldRecommend === null) {
      showToast('Por favor indica si recomendarías el servicio', 'error');
      return;
    }

    try {
      setIsSubmitting(true);

      const evaluation: ChatEvaluation = {
        chatId: 'chat_123',
        rating,
        categories,
        comments,
        wouldRecommend,
        timestamp: new Date(),
      };

      // Simular envío de evaluación
      await new Promise(resolve => setTimeout(resolve, 2000));

      showToast('¡Gracias por tu evaluación!', 'success');
      
      // Simular navegación de regreso
      setTimeout(() => {
        // navigation.goBack();
      }, 1500);

    } catch (error) {
      console.error('Error enviando evaluación:', error);
      showToast('Error al enviar evaluación', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (currentRating: number, onPress: (rating: number) => void) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onPress(star)}
            style={styles.starButton}
          >
            <Ionicons
              name={star <= currentRating ? "star" : "star-outline"}
              size={24}
              color={star <= currentRating ? colors.primary : colors.textTertiary}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderCategoryRating = (category: keyof typeof categories, label: string) => {
    const currentRating = categories[category];
    
    return (
      <View style={styles.categoryContainer}>
        <Text style={[styles.categoryLabel, { color: colors.textPrimary }]}>
          {label}
        </Text>
        {renderStars(currentRating, (rating) => handleCategoryRating(category, rating))}
        {currentRating > 0 && (
          <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
            {currentRating}/5
          </Text>
        )}
      </View>
    );
  };

  if (isSubmitting) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Enviando evaluación...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Evaluar Chat
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Ayúdanos a mejorar nuestro servicio
        </Text>
      </View>

      <View style={styles.content}>
        {/* Calificación General */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            ¿Cómo calificarías tu experiencia general?
          </Text>
          {renderStars(rating, handleRatingPress)}
          {rating > 0 && (
            <Text style={[styles.ratingDescription, { color: colors.textSecondary }]}>
              {rating === 1 && 'Muy mala'}
              {rating === 2 && 'Mala'}
              {rating === 3 && 'Regular'}
              {rating === 4 && 'Buena'}
              {rating === 5 && 'Excelente'}
            </Text>
          )}
        </View>

        {/* Categorías Específicas */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Califica aspectos específicos
          </Text>
          
          {renderCategoryRating('responseTime', categoryLabels.responseTime)}
          {renderCategoryRating('helpfulness', categoryLabels.helpfulness)}
          {renderCategoryRating('professionalism', categoryLabels.professionalism)}
          {renderCategoryRating('problemResolution', categoryLabels.problemResolution)}
        </View>

        {/* Recomendación */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            ¿Recomendarías nuestro servicio de chat?
          </Text>
          
          <View style={styles.recommendationContainer}>
            <TouchableOpacity
              style={[
                styles.recommendationButton,
                { 
                  backgroundColor: wouldRecommend === true ? colors.success : colors.surfaceSecondary,
                  borderColor: colors.border 
                }
              ]}
              onPress={() => setWouldRecommend(true)}
            >
              <Ionicons
                name="thumbs-up"
                size={20}
                color={wouldRecommend === true ? 'white' : colors.textSecondary}
              />
              <Text style={[
                styles.recommendationText,
                { color: wouldRecommend === true ? 'white' : colors.textSecondary }
              ]}>
                Sí, definitivamente
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.recommendationButton,
                { 
                  backgroundColor: wouldRecommend === false ? colors.error : colors.surfaceSecondary,
                  borderColor: colors.border 
                }
              ]}
              onPress={() => setWouldRecommend(false)}
            >
              <Ionicons
                name="thumbs-down"
                size={20}
                color={wouldRecommend === false ? 'white' : colors.textSecondary}
              />
              <Text style={[
                styles.recommendationText,
                { color: wouldRecommend === false ? 'white' : colors.textSecondary }
              ]}>
                No, no lo recomiendo
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Comentarios */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Comentarios adicionales (opcional)
          </Text>
          
          <TextInput
            style={[
              styles.commentsInput,
              { 
                backgroundColor: colors.surfaceSecondary,
                borderColor: colors.border,
                color: colors.textPrimary 
              }
            ]}
            placeholder="Cuéntanos más sobre tu experiencia..."
            placeholderTextColor={colors.textTertiary}
            value={comments}
            onChangeText={setComments}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          
          <Text style={[styles.characterCount, { color: colors.textTertiary }]}>
            {comments.length}/500 caracteres
          </Text>
        </View>

        {/* Información sobre Estrategia Antifuga */}
        <View style={[styles.infoSection, { backgroundColor: colors.warning + '20', borderColor: colors.warning }]}>
          <Ionicons name="shield-checkmark" size={24} color={colors.warning} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: colors.warning }]}>
              Estrategia Antifuga
            </Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Tu evaluación ayuda a mantener la calidad del servicio y prevenir la pérdida de clientes. Los gestores son evaluados en tiempo real.
            </Text>
          </View>
        </View>

        {/* Botón de Envío */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: colors.primary }
          ]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>
            Enviar Evaluación
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  content: {
    padding: 16,
  },
  section: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  starButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  ratingText: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 8,
  },
  ratingDescription: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  recommendationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  recommendationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  recommendationText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  commentsInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
    marginTop: 8,
  },
  infoSection: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ChatEvaluationScreen;
