import React, { useState, useEffect } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface State {
  _id: string;
  name: string;
  code: string;
  capital: string;
  region: string;
}

interface Municipality {
  _id: string;
  name: string;
  code: string;
  capital: string;
  state: string;
}

interface Parish {
  _id: string;
  name: string;
  code: string;
  municipality: string;
}

interface AdministrativeDivisionSelectorProps {
  onLocationChange: (location: {
    stateId: string;
    municipalityId: string;
    parishId: string;
    stateName: string;
    municipalityName: string;
    parishName: string;
  }) => void;
  initialValues?: {
    stateId?: string;
    municipalityId?: string;
    parishId?: string;
  };
  required?: boolean;
  className?: string;
}

const AdministrativeDivisionSelector: React.FC<AdministrativeDivisionSelectorProps> = ({
  onLocationChange,
  initialValues = {},
  required = false,
  className = ''
}) => {
  const { t } = useLanguage();
  const [states, setStates] = useState<State[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [parishes, setParishes] = useState<Parish[]>([]);
  
  const [selectedState, setSelectedState] = useState(initialValues.stateId || '');
  const [selectedMunicipality, setSelectedMunicipality] = useState(initialValues.municipalityId || '');
  const [selectedParish, setSelectedParish] = useState(initialValues.parishId || '');
  
  const [loading, setLoading] = useState({
    states: false,
    municipalities: false,
    parishes: false
  });

  // Cargar estados al montar el componente
  useEffect(() => {
    loadStates();
  }, []);

  // Cargar municipios cuando se selecciona un estado
  useEffect(() => {
    if (selectedState) {
      loadMunicipalities(selectedState);
      setSelectedMunicipality('');
      setSelectedParish('');
    } else {
      setMunicipalities([]);
      setParishes([]);
    }
  }, [selectedState]);

  // Cargar parroquias cuando se selecciona un municipio
  useEffect(() => {
    if (selectedMunicipality) {
      loadParishes(selectedMunicipality);
      setSelectedParish('');
    } else {
      setParishes([]);
    }
  }, [selectedMunicipality]);

  // Notificar cambios en la ubicación
  useEffect(() => {
    if (selectedState && selectedMunicipality && selectedParish) {
      const state = states.find(s => s._id === selectedState);
      const municipality = municipalities.find(m => m._id === selectedMunicipality);
      const parish = parishes.find(p => p._id === selectedParish);

      if (state && municipality && parish) {
        onLocationChange({
          stateId: selectedState,
          municipalityId: selectedMunicipality,
          parishId: selectedParish,
          stateName: state.name,
          municipalityName: municipality.name,
          parishName: parish.name
        });
      }
    }
  }, [selectedState, selectedMunicipality, selectedParish, states, municipalities, parishes]);

  const loadStates = async () => {
    setLoading(prev => ({ ...prev, states: true }));
    try {
      const response = await fetch('process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000""""/api/locations/states');
      const data = await response.json();
      if (data.success) {
        setStates(data.data);
      }
    } catch (error) {
      console.error('Error cargando estados:', error);
    } finally {
      setLoading(prev => ({ ...prev, states: false }));
    }
  };

  const loadMunicipalities = async (stateId: string) => {
    setLoading(prev => ({ ...prev, municipalities: true }));
    try {
      const response = await fetch(`process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"/api/locations/states/${stateId}/municipalities`);
      const data = await response.json();
      if (data.success) {
        setMunicipalities(data.data);
      }
    } catch (error) {
      console.error('Error cargando municipios:', error);
    } finally {
      setLoading(prev => ({ ...prev, municipalities: false }));
    }
  };

  const loadParishes = async (municipalityId: string) => {
    setLoading(prev => ({ ...prev, parishes: true }));
    try {
      const response = await fetch(`process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"/api/locations/municipalities/${municipalityId}/parishes`);
      const data = await response.json();
      if (data.success) {
        setParishes(data.data);
      }
    } catch (error) {
      console.error('Error cargando parroquias:', error);
    } finally {
      setLoading(prev => ({ ...prev, parishes: false }));
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <MapPin className="inline h-4 w-4 mr-1" />
          {t('location.state')} {required && '*'}
        </label>
        <div className="relative">
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:border-transparent appearance-none bg-white"
            disabled={loading.states}
          >
            <option value="">{t('location.selectState')}</option>
            {states.map((state) => (
              <option key={state._id} value={state._id}>
                {state.name} ({state.code})
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
          {loading.states && (
            <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#FFC300]"></div>
            </div>
          )}
        </div>
      </div>

      {selectedState && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('location.municipality')} {required && '*'}
          </label>
          <div className="relative">
            <select
              value={selectedMunicipality}
              onChange={(e) => setSelectedMunicipality(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:border-transparent appearance-none bg-white"
              disabled={loading.municipalities}
            >
              <option value="">{t('location.selectMunicipality')}</option>
              {municipalities.map((municipality) => (
                <option key={municipality._id} value={municipality._id}>
                  {municipality.name} - {municipality.capital}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
            {loading.municipalities && (
              <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#FFC300]"></div>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedMunicipality && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('location.parish')} {required && '*'}
          </label>
          <div className="relative">
            <select
              value={selectedParish}
              onChange={(e) => setSelectedParish(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:border-transparent appearance-none bg-white"
              disabled={loading.parishes}
            >
              <option value="">{t('location.selectParish')}</option>
              {parishes.map((parish) => (
                <option key={parish._id} value={parish._id}>
                  {parish.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
            {loading.parishes && (
              <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#FFC300]"></div>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedState && selectedMunicipality && selectedParish && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <div className="flex items-center text-green-800">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">{t('location.locationSelected')}</span>
          </div>
          <div className="text-xs text-green-700 mt-1">
            <div>{states.find(s => s._id === selectedState)?.name}</div>
            <div>{municipalities.find(m => m._id === selectedMunicipality)?.name}</div>
            <div>{parishes.find(p => p._id === selectedParish)?.name}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdministrativeDivisionSelector;
