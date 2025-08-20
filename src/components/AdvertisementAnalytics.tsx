import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  Users, 
  DollarSign,
  Calendar,
  MapPin,
  Smartphone,
  Monitor,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useLanguageChange } from '../hooks/useLanguageChange';

interface AdvertisementAnalyticsProps {
  advertisementId: string;
  dateRange: {
    start: string;
    end: string;
  };
  onExport?: (format: 'csv' | 'pdf') => void;
}

interface AnalyticsData {
  overview: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    ctr: number;
    cpm: number;
    cpc: number;
  };
  timeSeries: {
    date: string;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
  }[];
  deviceBreakdown: {
    android: number;
    ios: number;
    web: number;
  };
  locationBreakdown: {
    [location: string]: {
      impressions: number;
      clicks: number;
      conversions: number;
    };
  };
  hourlyBreakdown: {
    [hour: string]: {
      impressions: number;
      clicks: number;
    };
  };
  audienceSegments: {
    [segment: string]: {
      impressions: number;
      clicks: number;
      ctr: number;
    };
  };
}

const AdvertisementAnalytics: React.FC<AdvertisementAnalyticsProps> = ({
  advertisementId,
  dateRange,
  onExport
}) => {
  const { t } = useLanguage();
  const { forceUpdate } = useLanguageChange();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'impressions' | 'clicks' | 'conversions' | 'revenue'>('impressions');
  const [selectedPeriod, setSelectedPeriod] = useState<'hourly' | 'daily' | 'weekly'>('daily');

  useEffect(() => {
    fetchAnalyticsData();
  }, [advertisementId, dateRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simular datos de analytics - en producción esto vendría de la API
      const mockData: AnalyticsData = {
        overview: {
          impressions: 15420,
          clicks: 1234,
          conversions: 89,
          revenue: 2340.50,
          ctr: 8.0,
          cpm: 15.2,
          cpc: 1.9
        },
        timeSeries: [
          { date: '2024-01-01', impressions: 1200, clicks: 96, conversions: 7, revenue: 180.50 },
          { date: '2024-01-02', impressions: 1350, clicks: 108, conversions: 8, revenue: 200.00 },
          { date: '2024-01-03', impressions: 1100, clicks: 88, conversions: 6, revenue: 160.00 },
          { date: '2024-01-04', impressions: 1400, clicks: 112, conversions: 9, revenue: 220.00 },
          { date: '2024-01-05', impressions: 1600, clicks: 128, conversions: 10, revenue: 240.00 },
          { date: '2024-01-06', impressions: 1800, clicks: 144, conversions: 11, revenue: 260.00 },
          { date: '2024-01-07', impressions: 2000, clicks: 160, conversions: 12, revenue: 280.00 },
        ],
        deviceBreakdown: {
          android: 45,
          ios: 35,
          web: 20
        },
        locationBreakdown: {
          'Caracas': { impressions: 5000, clicks: 400, conversions: 30 },
          'Valencia': { impressions: 3000, clicks: 240, conversions: 18 },
          'Maracaibo': { impressions: 2500, clicks: 200, conversions: 15 },
          'Barquisimeto': { impressions: 2000, clicks: 160, conversions: 12 },
          [t('analytics.locations.others')]: { impressions: 2920, clicks: 234, conversions: 14 }
        },
        hourlyBreakdown: {
          '00:00': { impressions: 200, clicks: 16 },
          '06:00': { impressions: 300, clicks: 24 },
          '12:00': { impressions: 800, clicks: 64 },
          '18:00': { impressions: 600, clicks: 48 },
          '23:00': { impressions: 400, clicks: 32 }
        },
        audienceSegments: {
          [t('analytics.audience.newUsers')]: { impressions: 6000, clicks: 480, ctr: 8.0 },
          [t('analytics.audience.recurringUsers')]: { impressions: 8000, clicks: 640, ctr: 8.0 },
          [t('analytics.audience.premiumUsers')]: { impressions: 1420, clicks: 114, ctr: 8.0 }
        }
      };
      
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-VE').format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-[#FFC300] animate-spin" />
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">{t('analytics.noData')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#FFC300]">{t('analytics.title')}</h2>
        <div className="flex space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
          >
            <option value="hourly">{t('analytics.period.hourly')}</option>
            <option value="daily">{t('analytics.period.daily')}</option>
            <option value="weekly">{t('analytics.period.weekly')}</option>
          </select>
          <button
            onClick={() => onExport?.('csv')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>{t('button.export')}</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('analytics.metrics.impressions')}</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.overview.impressions)}</p>
            </div>
            <Eye className="w-8 h-8 text-[#FFC300]" />
          </div>
          <div className="mt-2">
            <span className="text-sm text-green-600">+12.5%</span>
            <span className="text-sm text-gray-500 ml-2">{t('analytics.comparison.vsPrevious')}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('analytics.metrics.clicks')}</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.overview.clicks)}</p>
            </div>
            <MousePointer className="w-8 h-8 text-[#FFC300]" />
          </div>
          <div className="mt-2">
            <span className="text-sm text-green-600">+8.2%</span>
            <span className="text-sm text-gray-500 ml-2">{t('analytics.comparison.vsPrevious')}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('analytics.metrics.ctr')}</p>
              <p className="text-2xl font-bold text-gray-900">{formatPercentage(analyticsData.overview.ctr)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-[#FFC300]" />
          </div>
          <div className="mt-2">
            <span className="text-sm text-green-600">+2.1%</span>
            <span className="text-sm text-gray-500 ml-2">{t('analytics.comparison.vsPrevious')}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('analytics.metrics.revenue')}</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.overview.revenue)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-[#FFC300]" />
          </div>
          <div className="mt-2">
            <span className="text-sm text-green-600">+15.3%</span>
            <span className="text-sm text-gray-500 ml-2">{t('analytics.comparison.vsPrevious')}</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Series Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">{t('analytics.sections.temporalPerformance')}</h3>
          <div className="space-y-4">
            {analyticsData.timeSeries.map((data, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium">{data.date}</span>
                </div>
                <div className="flex space-x-4 text-sm">
                  <span className="text-gray-600">{formatNumber(data.impressions)} {t('analytics.units.impressions')}</span>
                  <span className="text-gray-600">{formatNumber(data.clicks)} {t('analytics.units.clicks')}</span>
                  <span className="text-[#FFC300] font-medium">{formatCurrency(data.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">{t('analytics.sections.devices')}</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-[#FFC300]" />
                <span className="text-sm">{t('analytics.devices.android')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#FFC300] h-2 rounded-full" 
                    style={{ width: `${analyticsData.deviceBreakdown.android}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{analyticsData.deviceBreakdown.android}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-[#FFC300]" />
                <span className="text-sm">{t('analytics.devices.ios')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#FFC300] h-2 rounded-full" 
                    style={{ width: `${analyticsData.deviceBreakdown.ios}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{analyticsData.deviceBreakdown.ios}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Monitor className="w-4 h-4 text-[#FFC300]" />
                <span className="text-sm">{t('analytics.devices.web')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#FFC300] h-2 rounded-full" 
                    style={{ width: `${analyticsData.deviceBreakdown.web}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{analyticsData.deviceBreakdown.web}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location and Audience Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Location Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">{t('analytics.sections.locationPerformance')}</h3>
          <div className="space-y-3">
            {Object.entries(analyticsData.locationBreakdown).map(([location, data]) => (
              <div key={location} className="flex items-center justify-between p-3 border border-gray-100 rounded">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium">{location}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{formatNumber(data.impressions)} {t('analytics.units.impressions')}</div>
                  <div className="text-xs text-gray-500">{formatNumber(data.clicks)} {t('analytics.units.clicks')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audience Segments */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">{t('analytics.sections.audienceSegments')}</h3>
          <div className="space-y-3">
            {Object.entries(analyticsData.audienceSegments).map(([segment, data]) => (
              <div key={segment} className="flex items-center justify-between p-3 border border-gray-100 rounded">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium">{segment}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{formatNumber(data.impressions)} {t('analytics.units.impressions')}</div>
                  <div className="text-xs text-[#FFC300]">{formatPercentage(data.ctr)} {t('analytics.metrics.ctr')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">{t('analytics.sections.additionalMetrics')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#FFC300]">{formatCurrency(analyticsData.overview.cpm)}</p>
            <p className="text-sm text-gray-600">{t('analytics.metrics.cpm')}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#FFC300]">{formatCurrency(analyticsData.overview.cpc)}</p>
            <p className="text-sm text-gray-600">{t('analytics.metrics.cpc')}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#FFC300]">{formatNumber(analyticsData.overview.conversions)}</p>
            <p className="text-sm text-gray-600">{t('analytics.metrics.conversions')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvertisementAnalytics;
