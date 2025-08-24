import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { AdminCard, AdminButton, AdminInput, AdminTable } from './index';
import { Plus, Edit, Trash2 } from 'lucide-react';

// Ejemplo de módulo administrativo con tema y traducciones
const AdminModuleExample: React.FC = () => {
  const { t } = useLanguage();
  const [items, setItems] = useState([
    { id: 1, name: 'Ejemplo 1', status: 'Activo', date: '2024-01-15' },
    { id: 2, name: 'Ejemplo 2', status: 'Inactivo', date: '2024-01-14' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', status: 'Activo' });

  const columns = [
    {
      key: 'name',
      header: t('example.table.headers.name'),
      render: (value: string) => (
        <span className="font-medium text-gray-900 dark:text-white">{value}</span>
      )
    },
    {
      key: 'status',
      header: t('example.table.headers.status'),
      render: (value: string) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          value === 'Activo' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'date',
      header: t('example.table.headers.date')
    },
    {
      key: 'actions',
      header: t('example.table.headers.actions'),
      render: (value: any, row: any) => (
        <div className="flex space-x-2">
          <AdminButton
            size="sm"
            variant="secondary"
            icon={<Edit className="w-4 h-4" />}
            onClick={() => handleEdit(row)}
          >
            {t('example.actions.edit')}
          </AdminButton>
          <AdminButton
            size="sm"
            variant="danger"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => handleDelete(row.id)}
          >
            {t('example.actions.delete')}
          </AdminButton>
        </div>
      )
    }
  ];

  const handleEdit = (item: any) => {
    setFormData({ name: item.name, status: item.status });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      setItems([...items, { 
        id: Date.now(), 
        name: formData.name, 
        status: formData.status, 
        date: new Date().toISOString().split('T')[0] 
      }]);
      setFormData({ name: '', status: 'Activo' });
      setShowForm(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header del módulo */}
      <div className="bg-white dark:bg-[#333333] shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('example.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t('example.description')}
          </p>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="px-6 space-y-6">
        {/* Botón de acción principal */}
        <div className="flex justify-between items-center">
          <AdminButton
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setShowForm(true)}
          >
            {t('example.actions.create')}
          </AdminButton>
        </div>

        {/* Tabla de datos */}
        <AdminTable
          columns={columns}
          data={items}
          emptyMessage={t('example.table.emptyMessage')}
        />

        {/* Modal/Formulario */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <AdminCard
              title={t('example.form.title')}
              className="w-full max-w-md mx-4"
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <AdminInput
                  label={t('example.form.nameLabel')}
                  placeholder={t('example.form.namePlaceholder')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('example.form.statusLabel')}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#444444] text-gray-900 dark:text-white focus:ring-[#FFC300] focus:border-[#FFC300]"
                  >
                    <option value="Activo">{t('example.form.statusActive')}</option>
                    <option value="Inactivo">{t('example.form.statusInactive')}</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <AdminButton
                    type="submit"
                    variant="primary"
                    className="flex-1"
                  >
                    {t('example.form.save')}
                  </AdminButton>
                  <AdminButton
                    type="button"
                    variant="secondary"
                    onClick={() => setShowForm(false)}
                    className="flex-1"
                  >
                    {t('example.form.cancel')}
                  </AdminButton>
                </div>
              </form>
            </AdminCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminModuleExample;
