import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Save, Plus, Trash2, ShoppingCart, Star, Share2, UserPlus, Gift } from 'lucide-react';

interface PointsPolicy {
  action: string;
  points: number;
  description: string;
  isActive: boolean;
}

interface PointsPolicyFormProps {
  policies: PointsPolicy[];
  onSave: (policies: PointsPolicy[]) => void;
  isLoading?: boolean;
}

const PointsPolicyForm: React.FC<PointsPolicyFormProps> = ({
  policies,
  onSave,
  isLoading = false
}) => {
  const { t } = useLanguage();
  const [currentPolicies, setCurrentPolicies] = useState<PointsPolicy[]>(policies);
  const [newPolicy, setNewPolicy] = useState<PointsPolicy>({
    action: '',
    points: 0,
    description: '',
    isActive: true
  });

  const predefinedActions = [
    {
      value: 'purchase',
      label: t('adminLoyalty.policies.actions.purchase'),
      description: t('adminLoyalty.policies.actions.purchaseDesc'),
      icon: ShoppingCart
    },
    {
      value: 'review',
      label: t('adminLoyalty.policies.actions.review'),
      description: t('adminLoyalty.policies.actions.reviewDesc'),
      icon: Star
    },
    {
      value: 'referral',
      label: t('adminLoyalty.policies.actions.referral'),
      description: t('adminLoyalty.policies.actions.referralDesc'),
      icon: UserPlus
    },
    {
      value: 'share',
      label: t('adminLoyalty.policies.actions.share'),
      description: t('adminLoyalty.policies.actions.shareDesc'),
      icon: Share2
    },
    {
      value: 'redemption',
      label: t('adminLoyalty.policies.actions.redemption'),
      description: t('adminLoyalty.policies.actions.redemptionDesc'),
      icon: Gift
    }
  ];

  const handleAddPolicy = () => {
    if (newPolicy.action && newPolicy.points > 0 && newPolicy.description) {
      setCurrentPolicies(prev => [...prev, { ...newPolicy }]);
      setNewPolicy({
        action: '',
        points: 0,
        description: '',
        isActive: true
      });
    }
  };

  const handleRemovePolicy = (index: number) => {
    setCurrentPolicies(prev => prev.filter((_, i) => i !== index));
  };

  const handlePolicyChange = (index: number, field: keyof PointsPolicy, value: any) => {
    setCurrentPolicies(prev => prev.map((policy, i) => 
      i === index ? { ...policy, [field]: value } : policy
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(currentPolicies);
  };

  const getActionIcon = (action: string) => {
    const actionConfig = predefinedActions.find(a => a.value === action);
    return actionConfig ? actionConfig.icon : ShoppingCart;
  };

  const getActionLabel = (action: string) => {
    const actionConfig = predefinedActions.find(a => a.value === action);
    return actionConfig ? actionConfig.label : action;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#FFC300] mb-2">
          {t('adminLoyalty.policies.title')}
        </h2>
        <p className="text-gray-700">
          {t('adminLoyalty.policies.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Políticas existentes */}
        <div>
          <h3 className="text-lg font-semibold text-[#FFC300] mb-4">
            {t('adminLoyalty.policies.currentPolicies')}
          </h3>
          
          {currentPolicies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Gift className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>{t('adminLoyalty.policies.noPolicies')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentPolicies.map((policy, index) => {
                const ActionIcon = getActionIcon(policy.action);
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <ActionIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {getActionLabel(policy.action)}
                          </h4>
                          <p className="text-sm text-gray-600">{policy.description}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePolicy(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('adminLoyalty.policies.points')}
                        </label>
                        <input
                          type="number"
                          value={policy.points}
                          onChange={(e) => handlePolicyChange(index, 'points', Number(e.target.value))}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] bg-white text-gray-900"
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`active-${index}`}
                          checked={policy.isActive}
                          onChange={(e) => handlePolicyChange(index, 'isActive', e.target.checked)}
                          className="h-4 w-4 text-[#FFC300] focus:ring-[#FFC300] border-gray-300 rounded"
                        />
                        <label htmlFor={`active-${index}`} className="ml-2 block text-sm text-gray-700">
                          {t('adminLoyalty.policies.activePolicy')}
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Agregar nueva política */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-[#FFC300] mb-4">
            {t('adminLoyalty.policies.addNewPolicy')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('adminLoyalty.policies.action')}
              </label>
              <select
                value={newPolicy.action}
                onChange={(e) => {
                  const action = e.target.value;
                  const actionConfig = predefinedActions.find(a => a.value === action);
                  setNewPolicy(prev => ({
                    ...prev,
                    action,
                    description: actionConfig ? actionConfig.description : ''
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] bg-white text-gray-900"
              >
                <option value="">{t('adminLoyalty.policies.selectAction')}</option>
                {predefinedActions.map(action => (
                  <option key={action.value} value={action.value}>
                    {action.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('adminLoyalty.policies.points')}
              </label>
              <input
                type="number"
                value={newPolicy.points}
                onChange={(e) => setNewPolicy(prev => ({ ...prev, points: Number(e.target.value) }))}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] bg-white text-gray-900"
                placeholder="0"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('adminLoyalty.policies.description')}
            </label>
            <textarea
              value={newPolicy.description}
              onChange={(e) => setNewPolicy(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] bg-white text-gray-900"
              placeholder={t('adminLoyalty.policies.descriptionPlaceholder')}
            />
          </div>

          <button
            type="button"
            onClick={handleAddPolicy}
            disabled={!newPolicy.action || newPolicy.points <= 0 || !newPolicy.description}
            className="flex items-center space-x-2 px-4 py-2 bg-[#FFC300] text-white rounded-md hover:bg-[#E6B000] disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>{t('adminLoyalty.policies.addPolicy')}</span>
          </button>
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">{t('adminLoyalty.policies.info.title')}</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>{t('adminLoyalty.policies.actions.purchase')}:</strong> {t('adminLoyalty.policies.info.purchase')}</li>
            <li>• <strong>{t('adminLoyalty.policies.actions.review')}:</strong> {t('adminLoyalty.policies.info.review')}</li>
            <li>• <strong>{t('adminLoyalty.policies.actions.referral')}:</strong> {t('adminLoyalty.policies.info.referral')}</li>
            <li>• <strong>{t('adminLoyalty.policies.actions.share')}:</strong> {t('adminLoyalty.policies.info.share')}</li>
            <li>• <strong>{t('adminLoyalty.policies.actions.redemption')}:</strong> {t('adminLoyalty.policies.info.redemption')}</li>
          </ul>
        </div>

        {/* Botón de guardar */}
        <div className="flex justify-end pt-6 border-t">
          <button
            type="submit"
            disabled={isLoading || currentPolicies.length === 0}
            className="flex items-center space-x-2 px-6 py-2 bg-[#FFC300] text-white rounded-md hover:bg-[#E6B000] disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{t('adminLoyalty.policies.savePolicies')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default PointsPolicyForm;
