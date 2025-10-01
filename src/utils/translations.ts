export type Language = 'es' | 'en' | 'pt';

export interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

export const translations: Translations = {
  // ===== NAVEGACIÓN PRINCIPAL =====
  'nav.home': {
    es: 'Inicio',
    en: 'Home',
    pt: 'Início'
  },
  'nav.categories': {
    es: 'Categorías',
    en: 'Categories',
    pt: 'Categorias'
  },
  'nav.products': {
    es: 'Productos',
    en: 'Products',
    pt: 'Produtos'
  },
  'nav.cart': {
    es: 'Carrito',
    en: 'Cart',
    pt: 'Carrinho'
  },
  'nav.favorites': {
    es: 'Favoritos',
    en: 'Favorites',
    pt: 'Favoritos'
  },
  'nav.profile': {
    es: 'Perfil',
    en: 'Profile',
    pt: 'Perfil'
  },
  'nav.settings': {
    es: 'Configuración',
    en: 'Settings',
    pt: 'Configurações'
  },
  'nav.security': {
    es: 'Seguridad',
    en: 'Security',
    pt: 'Segurança'
  },
  'nav.loyalty': {
    es: 'Fidelización',
    en: 'Loyalty',
    pt: 'Fidelização'
  },
  'nav.orders': {
    es: 'Pedidos',
    en: 'Orders',
    pt: 'Pedidos'
  },
  'nav.notifications': {
    es: 'Notificaciones',
    en: 'Notifications',
    pt: 'Notificações'
  },
  'nav.logout': {
    es: 'Cerrar Sesión',
    en: 'Logout',
    pt: 'Sair'
  },

  // ===== PANEL DE ADMINISTRACIÓN =====
  'admin.dashboard': {
    es: 'Panel de Control',
    en: 'Dashboard',
    pt: 'Painel de Controle'
  },
  'admin.users': {
    es: 'Usuarios',
    en: 'Users',
    pt: 'Usuários'
  },
  'admin.stores': {
    es: 'Tiendas',
    en: 'Stores',
    pt: 'Lojas'
  },
  'admin.products': {
    es: 'Productos',
    en: 'Products',
    pt: 'Produtos'
  },
  'admin.categories': {
    es: 'Categorías',
    en: 'Categories',
    pt: 'Categorias'
  },
  'admin.subcategories': {
    es: 'Subcategorías',
    en: 'Subcategories',
    pt: 'Subcategorias'
  },
  'admin.promotions': {
    es: 'Promociones',
    en: 'Promotions',
    pt: 'Promoções'
  },
  'admin.advertisements': {
    es: 'Anuncios',
    en: 'Advertisements',
    pt: 'Anúncios'
  },
  'admin.sales': {
    es: 'Ventas',
    en: 'Sales',
    pt: 'Vendas'
  },
  'admin.loyalty': {
    es: 'Fidelización',
    en: 'Loyalty',
    pt: 'Fidelização'
  },
  'admin.analytics': {
    es: 'Analíticas',
    en: 'Analytics',
    pt: 'Analytics'
  },
  'admin.registrationCodes': {
    es: 'Códigos de Registro',
    en: 'Registration Codes',
    pt: 'Códigos de Registro'
  },
  'admin.searchConfig': {
    es: 'Configuración de Búsqueda',
    en: 'Search Configuration',
    pt: 'Configuração de Busca'
  },
  'admin.generateProducts': {
    es: 'Generar Productos',
    en: 'Generate Products',
    pt: 'Gerar Produtos'
  },

  // ===== PANEL DE GESTOR DE TIENDA =====
  'store.dashboard': {
    es: 'Panel de Tienda',
    en: 'Store Dashboard',
    pt: 'Painel da Loja'
  },
  'store.products': {
    es: 'Mis Productos',
    en: 'My Products',
    pt: 'Meus Produtos'
  },
  'store.promotions': {
    es: 'Mis Promociones',
    en: 'My Promotions',
    pt: 'Minhas Promoções'
  },
  'store.sales': {
    es: 'Mis Ventas',
    en: 'My Sales',
    pt: 'Minhas Vendas'
  },
  'store.orders': {
    es: 'Mis Pedidos',
    en: 'My Orders',
    pt: 'Meus Pedidos'
  },
  'store.delivery': {
    es: 'Entrega',
    en: 'Delivery',
    pt: 'Entrega'
  },
  'store.analytics': {
    es: 'Analíticas',
    en: 'Analytics',
    pt: 'Analytics'
  },
  'store.messages': {
    es: 'Mensajes',
    en: 'Messages',
    pt: 'Mensagens'
  },
  'store.reviews': {
    es: 'Reseñas',
    en: 'Reviews',
    pt: 'Avaliações'
  },
  'store.settings': {
    es: 'Configuración',
    en: 'Settings',
    pt: 'Configurações'
  },

  // ===== PANEL DE DELIVERY =====
  'delivery.dashboard': {
    es: 'Panel de Entrega',
    en: 'Delivery Dashboard',
    pt: 'Painel de Entrega'
  },
  'delivery.orders': {
    es: 'Pedidos',
    en: 'Orders',
    pt: 'Pedidos'
  },
  'delivery.map': {
    es: 'Mapa',
    en: 'Map',
    pt: 'Mapa'
  },
  'delivery.report': {
    es: 'Reporte',
    en: 'Report',
    pt: 'Relatório'
  },
  'delivery.ratings': {
    es: 'Calificaciones',
    en: 'Ratings',
    pt: 'Avaliações'
  },
  'delivery.schedule': {
    es: 'Horario',
    en: 'Schedule',
    pt: 'Horário'
  },
  'delivery.status': {
    es: 'Estado',
    en: 'Status',
    pt: 'Status'
  },
  'delivery.profile': {
    es: 'Perfil',
    en: 'Profile',
    pt: 'Perfil'
  },

  // ===== BOTONES COMUNES =====
  'button.save': {
    es: 'Guardar',
    en: 'Save',
    pt: 'Salvar'
  },
  'button.cancel': {
    es: 'Cancelar',
    en: 'Cancel',
    pt: 'Cancelar'
  },
  'button.edit': {
    es: 'Editar',
    en: 'Edit',
    pt: 'Editar'
  },
  'button.delete': {
    es: 'Eliminar',
    en: 'Delete',
    pt: 'Excluir'
  },
  'button.add': {
    es: 'Agregar',
    en: 'Add',
    pt: 'Adicionar'
  },
  'button.create': {
    es: 'Crear',
    en: 'Create',
    pt: 'Criar'
  },
  'button.update': {
    es: 'Actualizar',
    en: 'Update',
    pt: 'Atualizar'
  },
  'button.search': {
    es: 'Buscar',
    en: 'Search',
    pt: 'Buscar'
  },
  'button.filter': {
    es: 'Filtrar',
    en: 'Filter',
    pt: 'Filtrar'
  },
  'button.clear': {
    es: 'Limpiar',
    en: 'Clear',
    pt: 'Limpar'
  },
  'button.back': {
    es: 'Volver',
    en: 'Back',
    pt: 'Voltar'
  },
  'button.next': {
    es: 'Siguiente',
    en: 'Next',
    pt: 'Próximo'
  },
  'button.previous': {
    es: 'Anterior',
    en: 'Previous',
    pt: 'Anterior'
  },
  'button.submit': {
    es: 'Enviar',
    en: 'Submit',
    pt: 'Enviar'
  },
  'button.confirm': {
    es: 'Confirmar',
    en: 'Confirm',
    pt: 'Confirmar'
  },
  'button.approve': {
    es: 'Aprobar',
    en: 'Approve',
    pt: 'Aprovar'
  },
  'button.reject': {
    es: 'Rechazar',
    en: 'Reject',
    pt: 'Rejeitar'
  },
  'button.enable': {
    es: 'Habilitar',
    en: 'Enable',
    pt: 'Habilitar'
  },
  'button.disable': {
    es: 'Deshabilitar',
    en: 'Disable',
    pt: 'Desabilitar'
  },
  'button.view': {
    es: 'Ver',
    en: 'View',
    pt: 'Ver'
  },
  'button.download': {
    es: 'Descargar',
    en: 'Download',
    pt: 'Baixar'
  },
  'button.upload': {
    es: 'Subir',
    en: 'Upload',
    pt: 'Enviar'
  },
  'button.export': {
    es: 'Exportar',
    en: 'Export',
    pt: 'Exportar'
  },
  'button.import': {
    es: 'Importar',
    en: 'Import',
    pt: 'Importar'
  },

  // ===== ESTADOS Y MENSAJES =====
  'status.loading': {
    es: 'Cargando...',
    en: 'Loading...',
    pt: 'Carregando...'
  },
  'status.success': {
    es: 'Éxito',
    en: 'Success',
    pt: 'Sucesso'
  },
  'status.error': {
    es: 'Error',
    en: 'Error',
    pt: 'Erro'
  },
  'status.warning': {
    es: 'Advertencia',
    en: 'Warning',
    pt: 'Aviso'
  },
  'status.info': {
    es: 'Información',
    en: 'Information',
    pt: 'Informação'
  },
  'status.enabled': {
    es: 'Habilitado',
    en: 'Enabled',
    pt: 'Habilitado'
  },
  'status.disabled': {
    es: 'Deshabilitado',
    en: 'Disabled',
    pt: 'Desabilitado'
  },
  'status.active': {
    es: 'Activo',
    en: 'Active',
    pt: 'Ativo'
  },
  'status.inactive': {
    es: 'Inactivo',
    en: 'Inactive',
    pt: 'Inativo'
  },
  'status.pending': {
    es: 'Pendiente',
    en: 'Pending',
    pt: 'Pendente'
  },
  'status.completed': {
    es: 'Completado',
    en: 'Completed',
    pt: 'Concluído'
  },
  'status.cancelled': {
    es: 'Cancelado',
    en: 'Cancelled',
    pt: 'Cancelado'
  },

  // ===== MENSAJES DE ÉXITO =====
  'message.success.saved': {
    es: 'Guardado exitosamente',
    en: 'Saved successfully',
    pt: 'Salvo com sucesso'
  },
  'message.success.updated': {
    es: 'Actualizado exitosamente',
    en: 'Updated successfully',
    pt: 'Atualizado com sucesso'
  },
  'message.success.deleted': {
    es: 'Eliminado exitosamente',
    en: 'Deleted successfully',
    pt: 'Excluído com sucesso'
  },
  'message.success.created': {
    es: 'Creado exitosamente',
    en: 'Created successfully',
    pt: 'Criado com sucesso'
  },
  'message.success.uploaded': {
    es: 'Subido exitosamente',
    en: 'Uploaded successfully',
    pt: 'Enviado com sucesso'
  },
  'message.success.imported': {
    es: 'Importado exitosamente',
    en: 'Imported successfully',
    pt: 'Importado com sucesso'
  },
  'message.success.exported': {
    es: 'Exportado exitosamente',
    en: 'Exported successfully',
    pt: 'Exportado com sucesso'
  },

  // ===== MENSAJES DE ERROR =====
  'message.error.general': {
    es: 'Ha ocurrido un error',
    en: 'An error has occurred',
    pt: 'Ocorreu um erro'
  },
  'message.error.network': {
    es: 'Error de conexión',
    en: 'Connection error',
    pt: 'Erro de conexão'
  },
  'message.error.validation': {
    es: 'Error de validación',
    en: 'Validation error',
    pt: 'Erro de validação'
  },
  'message.error.unauthorized': {
    es: 'No autorizado',
    en: 'Unauthorized',
    pt: 'Não autorizado'
  },
  'message.error.forbidden': {
    es: 'Acceso denegado',
    en: 'Access denied',
    pt: 'Acesso negado'
  },
  'message.error.notFound': {
    es: 'No encontrado',
    en: 'Not found',
    pt: 'Não encontrado'
  },
  'message.error.server': {
    es: 'Error del servidor',
    en: 'Server error',
    pt: 'Erro do servidor'
  },

  // ===== FORMULARIOS =====
  'form.required': {
    es: 'Campo requerido',
    en: 'Required field',
    pt: 'Campo obrigatório'
  },
  'form.invalid': {
    es: 'Campo inválido',
    en: 'Invalid field',
    pt: 'Campo inválido'
  },
  'form.email.invalid': {
    es: 'Email inválido',
    en: 'Invalid email',
    pt: 'Email inválido'
  },
  'form.password.weak': {
    es: 'Contraseña débil',
    en: 'Weak password',
    pt: 'Senha fraca'
  },
  'form.password.mismatch': {
    es: 'Las contraseñas no coinciden',
    en: 'Passwords do not match',
    pt: 'As senhas não coincidem'
  },
  'form.file.tooLarge': {
    es: 'Archivo demasiado grande',
    en: 'File too large',
    pt: 'Arquivo muito grande'
  },
  'form.file.invalidType': {
    es: 'Tipo de archivo inválido',
    en: 'Invalid file type',
    pt: 'Tipo de arquivo inválido'
  },

  // ===== CAMPOS DE FORMULARIO =====
  'field.name': {
    es: 'Nombre',
    en: 'Name',
    pt: 'Nome'
  },
  'field.email': {
    es: 'Email',
    en: 'Email',
    pt: 'Email'
  },
  'field.password': {
    es: 'Contraseña',
    en: 'Password',
    pt: 'Senha'
  },
  'field.confirmPassword': {
    es: 'Confirmar Contraseña',
    en: 'Confirm Password',
    pt: 'Confirmar Senha'
  },
  'field.phone': {
    es: 'Teléfono',
    en: 'Phone',
    pt: 'Telefone'
  },
  'field.address': {
    es: 'Dirección',
    en: 'Address',
    pt: 'Endereço'
  },
  'field.city': {
    es: 'Ciudad',
    en: 'City',
    pt: 'Cidade'
  },
  'field.state': {
    es: 'Estado',
    en: 'State',
    pt: 'Estado'
  },
  'field.country': {
    es: 'País',
    en: 'Country',
    pt: 'País'
  },
  'field.zipCode': {
    es: 'Código Postal',
    en: 'Zip Code',
    pt: 'Código Postal'
  },
  'field.description': {
    es: 'Descripción',
    en: 'Description',
    pt: 'Descrição'
  },
  'field.price': {
    es: 'Precio',
    en: 'Price',
    pt: 'Preço'
  },
  'field.quantity': {
    es: 'Cantidad',
    en: 'Quantity',
    pt: 'Quantidade'
  },
  'field.category': {
    es: 'Categoría',
    en: 'Category',
    pt: 'Categoria'
  },
  'field.subcategory': {
    es: 'Subcategoría',
    en: 'Subcategory',
    pt: 'Subcategoria'
  },
  'field.brand': {
    es: 'Marca',
    en: 'Brand',
    pt: 'Marca'
  },
  'field.image': {
    es: 'Imagen',
    en: 'Image',
    pt: 'Imagem'
  },
  'field.status': {
    es: 'Estado',
    en: 'Status',
    pt: 'Status'
  },
  'field.date': {
    es: 'Fecha',
    en: 'Date',
    pt: 'Data'
  },
  'field.time': {
    es: 'Hora',
    en: 'Time',
    pt: 'Hora'
  },
  'field.notes': {
    es: 'Notas',
    en: 'Notes',
    pt: 'Notas'
  },

  // ===== TABLAS Y LISTAS =====
  'table.noData': {
    es: 'No hay datos disponibles',
    en: 'No data available',
    pt: 'Nenhum dado disponível'
  },
  'table.loading': {
    es: 'Cargando datos...',
    en: 'Loading data...',
    pt: 'Carregando dados...'
  },
  'table.actions': {
    es: 'Acciones',
    en: 'Actions',
    pt: 'Ações'
  },
  'table.selectAll': {
    es: 'Seleccionar Todo',
    en: 'Select All',
    pt: 'Selecionar Tudo'
  },
  'table.selected': {
    es: 'seleccionado(s)',
    en: 'selected',
    pt: 'selecionado(s)'
  },
  'table.rowsPerPage': {
    es: 'Filas por página',
    en: 'Rows per page',
    pt: 'Linhas por página'
  },
  'table.of': {
    es: 'de',
    en: 'of',
    pt: 'de'
  },
  'table.previous': {
    es: 'Anterior',
    en: 'Previous',
    pt: 'Anterior'
  },
  'table.next': {
    es: 'Siguiente',
    en: 'Next',
    pt: 'Próximo'
  },

  // ===== MODALES Y DIÁLOGOS =====
  'modal.confirm': {
    es: 'Confirmar',
    en: 'Confirm',
    pt: 'Confirmar'
  },
  'modal.cancel': {
    es: 'Cancelar',
    en: 'Cancel',
    pt: 'Cancelar'
  },
  'modal.close': {
    es: 'Cerrar',
    en: 'Close',
    pt: 'Fechar'
  },
  'modal.delete.title': {
    es: 'Confirmar Eliminación',
    en: 'Confirm Deletion',
    pt: 'Confirmar Exclusão'
  },
  'modal.delete.message': {
    es: '¿Está seguro de que desea eliminar este elemento? Esta acción no se puede deshacer.',
    en: 'Are you sure you want to delete this item? This action cannot be undone.',
    pt: 'Tem certeza de que deseja excluir este item? Esta ação não pode ser desfeita.'
  },
  'modal.unsaved.title': {
    es: 'Cambios Sin Guardar',
    en: 'Unsaved Changes',
    pt: 'Alterações Não Salvas'
  },
  'modal.unsaved.message': {
    es: 'Tiene cambios sin guardar. ¿Desea salir sin guardar?',
    en: 'You have unsaved changes. Do you want to leave without saving?',
    pt: 'Você tem alterações não salvas. Deseja sair sem salvar?'
  },

  // ===== CONFIGURACIÓN =====
  'configuration.title': {
    es: 'Configuración',
    en: 'Configuration',
    pt: 'Configuração'
  },
  'configuration.subtitle': {
    es: 'Personaliza tu experiencia',
    en: 'Customize your experience',
    pt: 'Personalize sua experiência'
  },
  'configuration.loading': {
    es: 'Cargando configuración...',
    en: 'Loading configuration...',
    pt: 'Carregando configuração...'
  },

  // Apariencia
  'appearance.title': {
    es: 'Apariencia',
    en: 'Appearance',
    pt: 'Aparência'
  },
  'appearance.theme': {
    es: 'Tema',
    en: 'Theme',
    pt: 'Tema'
  },
  'appearance.theme.description': {
    es: 'Elige entre tema claro u oscuro',
    en: 'Choose between light or dark theme',
    pt: 'Escolha entre tema claro ou escuro'
  },
  'appearance.light': {
    es: 'Claro',
    en: 'Light',
    pt: 'Claro'
  },
  'appearance.dark': {
    es: 'Oscuro',
    en: 'Dark',
    pt: 'Escuro'
  },

  // Tema
  'theme.dark': {
    es: 'Oscuro',
    en: 'Dark',
    pt: 'Escuro'
  },
  'theme.light': {
    es: 'Claro',
    en: 'Light',
    pt: 'Claro'
  },
  'theme.switchToDark': {
    es: 'Cambiar a modo oscuro',
    en: 'Switch to dark mode',
    pt: 'Mudar para modo escuro'
  },
  'theme.switchToLight': {
    es: 'Cambiar a modo claro',
    en: 'Switch to light mode',
    pt: 'Mudar para modo claro'
  },

  // Idioma
  'language.title': {
    es: 'Idioma',
    en: 'Language',
    pt: 'Idioma'
  },
  'language.description': {
    es: 'Selecciona tu idioma preferido',
    en: 'Select your preferred language',
    pt: 'Selecione seu idioma preferido'
  },
  'language.es': {
    es: 'Español',
    en: 'Spanish',
    pt: 'Espanhol'
  },
  'language.en': {
    es: 'Inglés',
    en: 'English',
    pt: 'Inglês'
  },
  'language.pt': {
    es: 'Portugués',
    en: 'Portuguese',
    pt: 'Português'
  },

  // Notificaciones
  'notifications.title': {
    es: 'Notificaciones',
    en: 'Notifications',
    pt: 'Notificações'
  },
  'notifications.email': {
    es: 'Notificaciones por Email',
    en: 'Email Notifications',
    pt: 'Notificações por Email'
  },
  'notifications.email.description': {
    es: 'Recibe notificaciones importantes por email',
    en: 'Receive important notifications by email',
    pt: 'Receba notificações importantes por email'
  },
  'notifications.push': {
    es: 'Notificaciones Push',
    en: 'Push Notifications',
    pt: 'Notificações Push'
  },
  'notifications.push.description': {
    es: 'Notificaciones en tiempo real',
    en: 'Real-time notifications',
    pt: 'Notificações em tempo real'
  },
  'notifications.sms': {
    es: 'Notificaciones SMS',
    en: 'SMS Notifications',
    pt: 'Notificações SMS'
  },
  'notifications.sms.description': {
    es: 'Mensajes de texto importantes',
    en: 'Important text messages',
    pt: 'Mensagens de texto importantes'
  },
  'notifications.push.setup': {
    es: 'Configurar Notificaciones Push',
    en: 'Setup Push Notifications',
    pt: 'Configurar Notificações Push'
  },
  'notifications.push.setup.description': {
    es: 'Habilita las notificaciones push para recibir alertas en tiempo real',
    en: 'Enable push notifications to receive real-time alerts',
    pt: 'Ative as notificações push para receber alertas em tempo real'
  },
  'notifications.push.permission.required': {
    es: 'Se requieren permisos de notificación',
    en: 'Notification permissions required',
    pt: 'Permissões de notificação necessárias'
  },
  'notifications.push.permission.denied': {
    es: 'Permisos de notificación denegados',
    en: 'Notification permissions denied',
    pt: 'Permissões de notificação negadas'
  },
  'notifications.push.subscribed': {
    es: 'Suscrito a notificaciones push',
    en: 'Subscribed to push notifications',
    pt: 'Inscrito em notificações push'
  },
  'notifications.push.unsubscribed': {
    es: 'Desuscrito de notificaciones push',
    en: 'Unsubscribed from push notifications',
    pt: 'Cancelado inscrição em notificações push'
  },
  'notifications.description': {
    es: 'Gestiona todas tus notificaciones y alertas',
    en: 'Manage all your notifications and alerts',
    pt: 'Gerencie todas as suas notificações e alertas'
  },
  'notifications.noNotifications': {
    es: 'No hay notificaciones',
    en: 'No notifications',
    pt: 'Nenhuma notificação'
  },
  'notifications.markAsRead': {
    es: 'Marcar como leída',
    en: 'Mark as read',
    pt: 'Marcar como lida'
  },
  'notifications.markSelectedAsRead': {
    es: 'Marcar seleccionadas como leídas',
    en: 'Mark selected as read',
    pt: 'Marcar selecionadas como lidas'
  },
  'notifications.markAllAsRead': {
    es: 'Marcar todas como leídas',
    en: 'Mark all as read',
    pt: 'Marcar todas como lidas'
  },
  'notifications.archive': {
    es: 'Archivar',
    en: 'Archive',
    pt: 'Arquivar'
  },
  'notifications.viewAll': {
    es: 'Ver todas',
    en: 'View all',
    pt: 'Ver todas'
  },
  'notifications.filters': {
    es: 'Filtros',
    en: 'Filters',
    pt: 'Filtros'
  },
  'notifications.search': {
    es: 'Buscar notificaciones...',
    en: 'Search notifications...',
    pt: 'Buscar notificações...'
  },
  'notifications.clear': {
    es: 'Limpiar',
    en: 'Clear',
    pt: 'Limpar'
  },
  'notifications.categories.all': {
    es: 'Todas las categorías',
    en: 'All categories',
    pt: 'Todas as categorias'
  },
  'notifications.categories.order': {
    es: 'Pedidos',
    en: 'Orders',
    pt: 'Pedidos'
  },
  'notifications.categories.delivery': {
    es: 'Entrega',
    en: 'Delivery',
    pt: 'Entrega'
  },
  'notifications.categories.promotion': {
    es: 'Promociones',
    en: 'Promotions',
    pt: 'Promoções'
  },
  'notifications.categories.security': {
    es: 'Seguridad',
    en: 'Security',
    pt: 'Segurança'
  },
  'notifications.categories.system': {
    es: 'Sistema',
    en: 'System',
    pt: 'Sistema'
  },
  'notifications.categories.marketing': {
    es: 'Marketing',
    en: 'Marketing',
    pt: 'Marketing'
  },
  'notifications.status.all': {
    es: 'Todas las notificaciones',
    en: 'All notifications',
    pt: 'Todas as notificações'
  },
  'notifications.status.unread': {
    es: 'No leídas',
    en: 'Unread',
    pt: 'Não lidas'
  },
  'notifications.status.read': {
    es: 'Leídas',
    en: 'Read',
    pt: 'Lidas'
  },
  'notifications.pagination.showing': {
    es: 'Mostrando',
    en: 'Showing',
    pt: 'Mostrando'
  },
  'notifications.pagination.to': {
    es: 'a',
    en: 'to',
    pt: 'a'
  },
  'notifications.pagination.of': {
    es: 'de',
    en: 'of',
    pt: 'de'
  },
  'notifications.pagination.notifications': {
    es: 'notificaciones',
    en: 'notifications',
    pt: 'notificações'
  },
  'notifications.pagination.previous': {
    es: 'Anterior',
    en: 'Previous',
    pt: 'Anterior'
  },
  'notifications.pagination.next': {
    es: 'Siguiente',
    en: 'Next',
    pt: 'Próximo'
  },
  'notifications.pagination.page': {
    es: 'Página',
    en: 'Page',
    pt: 'Página'
  },
  'notifications.stats.total': {
    es: 'Total',
    en: 'Total',
    pt: 'Total'
  },
  'notifications.stats.unread': {
    es: 'No leídas',
    en: 'Unread',
    pt: 'Não lidas'
  },
  'notifications.stats.read': {
    es: 'Leídas',
    en: 'Read',
    pt: 'Lidas'
  },
  'notifications.stats.categories': {
    es: 'Categorías',
    en: 'Categories',
    pt: 'Categorias'
  },
  'notifications.actions.createTest': {
    es: 'Crear Prueba',
    en: 'Create Test',
    pt: 'Criar Teste'
  },
  'notifications.actions.refresh': {
    es: 'Actualizar',
    en: 'Refresh',
    pt: 'Atualizar'
  },
  'notifications.actions.search': {
    es: 'Buscar',
    en: 'Search',
    pt: 'Buscar'
  },
  'notifications.actions.selectAll': {
    es: 'Seleccionar todas',
    en: 'Select all',
    pt: 'Selecionar todas'
  },
  'notifications.actions.selected': {
    es: 'seleccionada',
    en: 'selected',
    pt: 'selecionada'
  },
  'notifications.actions.selectedPlural': {
    es: 'seleccionadas',
    en: 'selected',
    pt: 'selecionadas'
  },
  'notifications.empty.title': {
    es: 'No hay notificaciones',
    en: 'No notifications',
    pt: 'Nenhuma notificação'
  },
  'notifications.empty.description': {
    es: 'No se encontraron notificaciones con los filtros aplicados.',
    en: 'No notifications found with the applied filters.',
    pt: 'Nenhuma notificação encontrada com os filtros aplicados.'
  },

  // Privacidad
  'privacy.title': {
    es: 'Privacidad',
    en: 'Privacy',
    pt: 'Privacidade'
  },
  'privacy.profile.visibility': {
    es: 'Visibilidad del Perfil',
    en: 'Profile Visibility',
    pt: 'Visibilidade do Perfil'
  },
  'privacy.profile.visibility.description': {
    es: 'Quién puede ver tu perfil',
    en: 'Who can see your profile',
    pt: 'Quem pode ver seu perfil'
  },
  'privacy.profile.public': {
    es: 'Público',
    en: 'Public',
    pt: 'Público'
  },
  'privacy.profile.friends': {
    es: 'Solo amigos',
    en: 'Friends only',
    pt: 'Apenas amigos'
  },
  'privacy.profile.private': {
    es: 'Privado',
    en: 'Private',
    pt: 'Privado'
  },
  'privacy.show.email': {
    es: 'Mostrar Email',
    en: 'Show Email',
    pt: 'Mostrar Email'
  },
  'privacy.show.email.description': {
    es: 'Permitir que otros vean tu email',
    en: 'Allow others to see your email',
    pt: 'Permitir que outros vejam seu email'
  },
  'privacy.show.phone': {
    es: 'Mostrar Teléfono',
    en: 'Show Phone',
    pt: 'Mostrar Telefone'
  },
  'privacy.show.phone.description': {
    es: 'Permitir que otros vean tu teléfono',
    en: 'Allow others to see your phone',
    pt: 'Permitir que outros vejam seu telefone'
  },

  // Actividad
  'activity.title': {
    es: 'Historial de Actividades',
    en: 'Activity History',
    pt: 'Histórico de Atividades'
  },
  'activity.show': {
    es: 'Ver historial',
    en: 'Show history',
    pt: 'Ver histórico'
  },
  'activity.hide': {
    es: 'Ocultar',
    en: 'Hide',
    pt: 'Ocultar'
  },

  // ===== MENSAJES DE ÉXITO Y ERROR =====
  'message.success': {
    es: 'Configuración actualizada correctamente',
    en: 'Configuration updated successfully',
    pt: 'Configuração atualizada com sucesso'
  },
  'message.error': {
    es: 'Error al actualizar la configuración',
    en: 'Error updating configuration',
    pt: 'Erro ao atualizar configuração'
  },
  'message.notifications.updated': {
    es: 'Configuraciones de notificaciones actualizadas correctamente',
    en: 'Notification settings updated successfully',
    pt: 'Configurações de notificação atualizadas com sucesso'
  },
  'message.privacy.updated': {
    es: 'Configuraciones de privacidad actualizadas correctamente',
    en: 'Privacy settings updated successfully',
    pt: 'Configurações de privacidade atualizadas com sucesso'
  },
  'message.preferences.updated': {
    es: 'Preferencias actualizadas correctamente',
    en: 'Preferences updated successfully',
    pt: 'Preferências atualizadas com sucesso'
  },

  // ===== ANALYTICS DE PUBLICIDAD =====
  'analytics.title': {
    es: 'Analytics de Publicidad',
    en: 'Advertisement Analytics',
    pt: 'Analytics de Publicidade'
  },
  'analytics.period.hourly': {
    es: 'Por Hora',
    en: 'Hourly',
    pt: 'Por Hora'
  },
  'analytics.period.daily': {
    es: 'Por Día',
    en: 'Daily',
    pt: 'Por Dia'
  },
  'analytics.period.weekly': {
    es: 'Por Semana',
    en: 'Weekly',
    pt: 'Por Semana'
  },
  'analytics.metrics.impressions': {
    es: 'Impresiones',
    en: 'Impressions',
    pt: 'Impressões'
  },
  'analytics.metrics.clicks': {
    es: 'Clicks',
    en: 'Clicks',
    pt: 'Cliques'
  },
  'analytics.metrics.ctr': {
    es: 'CTR',
    en: 'CTR',
    pt: 'CTR'
  },
  'analytics.metrics.revenue': {
    es: 'Ingresos',
    en: 'Revenue',
    pt: 'Receita'
  },
  'analytics.metrics.conversions': {
    es: 'Conversiones',
    en: 'Conversions',
    pt: 'Conversões'
  },
  'analytics.metrics.cpm': {
    es: 'CPM (Costo por 1000 impresiones)',
    en: 'CPM (Cost per 1000 impressions)',
    pt: 'CPM (Custo por 1000 impressões)'
  },
  'analytics.metrics.cpc': {
    es: 'CPC (Costo por click)',
    en: 'CPC (Cost per click)',
    pt: 'CPC (Custo por clique)'
  },
  'analytics.comparison.vsPrevious': {
    es: 'vs período anterior',
    en: 'vs previous period',
    pt: 'vs período anterior'
  },
  'analytics.sections.temporalPerformance': {
    es: 'Rendimiento Temporal',
    en: 'Temporal Performance',
    pt: 'Desempenho Temporal'
  },
  'analytics.sections.devices': {
    es: 'Dispositivos',
    en: 'Devices',
    pt: 'Dispositivos'
  },
  'analytics.sections.locationPerformance': {
    es: 'Rendimiento por Ubicación',
    en: 'Location Performance',
    pt: 'Desempenho por Localização'
  },
  'analytics.sections.audienceSegments': {
    es: 'Segmentos de Audiencia',
    en: 'Audience Segments',
    pt: 'Segmentos de Audiência'
  },
  'analytics.sections.additionalMetrics': {
    es: 'Métricas Adicionales',
    en: 'Additional Metrics',
    pt: 'Métricas Adicionais'
  },
  'analytics.devices.android': {
    es: 'Android',
    en: 'Android',
    pt: 'Android'
  },
  'analytics.devices.ios': {
    es: 'iOS',
    en: 'iOS',
    pt: 'iOS'
  },
  'analytics.devices.web': {
    es: 'Web',
    en: 'Web',
    pt: 'Web'
  },
  'analytics.audience.newUsers': {
    es: 'Nuevos usuarios',
    en: 'New users',
    pt: 'Novos usuários'
  },
  'analytics.audience.recurringUsers': {
    es: 'Usuarios recurrentes',
    en: 'Recurring users',
    pt: 'Usuários recorrentes'
  },
  'analytics.audience.premiumUsers': {
    es: 'Usuarios premium',
    en: 'Premium users',
    pt: 'Usuários premium'
  },
  'analytics.locations.others': {
    es: 'Otros',
    en: 'Others',
    pt: 'Outros'
  },
  'analytics.noData': {
    es: 'No hay datos de analytics disponibles',
    en: 'No analytics data available',
    pt: 'Nenhum dado de analytics disponível'
  },
  'analytics.units.impressions': {
    es: 'imp.',
    en: 'imp.',
    pt: 'imp.'
  },
  'analytics.units.clicks': {
    es: 'clicks',
    en: 'clicks',
    pt: 'cliques'
  },

  // ===== HEADER Y NAVEGACIÓN =====
  'common.search': {
    es: 'Buscar repuestos...',
    en: 'Search parts...',
    pt: 'Buscar peças...'
  },
  'common.profile': {
    es: 'Perfil',
    en: 'Profile',
    pt: 'Perfil'
  },
  'common.security': {
    es: 'Seguridad',
    en: 'Security',
    pt: 'Segurança'
  },
  'common.settings': {
    es: 'Configuración',
    en: 'Settings',
    pt: 'Configurações'
  },
  'common.logout': {
    es: 'Cerrar Sesión',
    en: 'Logout',
    pt: 'Sair'
  },
  'common.login': {
    es: 'Iniciar Sesión',
    en: 'Login',
    pt: 'Entrar'
  },
  'common.register': {
    es: 'Registrarse',
    en: 'Register',
    pt: 'Registrar'
  },
  'common.nearbyProducts': {
    es: 'Repuestos Cercanos',
    en: 'Nearby Parts',
    pt: 'Peças Próximas'
  },
  'common.categories': {
    es: 'Categorías',
    en: 'Categories',
    pt: 'Categorias'
  },
  'common.home': {
    es: 'Inicio',
    en: 'Home',
    pt: 'Início'
  },
  'common.user': {
    es: 'Usuario',
    en: 'User',
    pt: 'Usuário'
  },
  'common.hide': {
    es: 'Ocultar',
    en: 'Hide',
    pt: 'Ocultar'
  },

  // ===== FOOTER =====
  'footer.tagline': {
    es: 'El repuesto que buscas, al instante. Tu tienda de confianza para repuestos de vehículos con la mejor calidad y servicio.',
    en: 'The part you need, instantly. Your trusted store for vehicle parts with the best quality and service.',
    pt: 'A peça que você precisa, instantaneamente. Sua loja de confiança para peças de veículos com a melhor qualidade e serviço.'
  },
  'footer.quickLinks': {
    es: 'Enlaces Rápidos',
    en: 'Quick Links',
    pt: 'Links Rápidos'
  },
  'footer.autoParts': {
    es: 'Repuestos Autos',
    en: 'Auto Parts',
    pt: 'Peças de Carros'
  },
  'footer.motorcycleParts': {
    es: 'Repuestos Motos',
    en: 'Motorcycle Parts',
    pt: 'Peças de Motos'
  },
  'footer.truckParts': {
    es: 'Repuestos Camiones',
    en: 'Truck Parts',
    pt: 'Peças de Caminhões'
  },
  'footer.offers': {
    es: 'Ofertas',
    en: 'Offers',
    pt: 'Ofertas'
  },
  'footer.contact': {
    es: 'Contacto',
    en: 'Contact',
    pt: 'Contato'
  },
  'footer.copyright': {
    es: '© 2025 PiezasYA. Todos los derechos reservados.',
    en: '© 2025 PiezasYA. All rights reserved.',
    pt: '© 2025 PiezasYA. Todos os direitos reservados.'
  },
  'footer.privacy': {
    es: 'Política de Privacidad',
    en: 'Privacy Policy',
    pt: 'Política de Privacidade'
  },
  'footer.terms': {
    es: 'Términos de Servicio',
    en: 'Terms of Service',
    pt: 'Termos de Serviço'
  },
  'footer.shipping': {
    es: 'Política de Envío',
    en: 'Shipping Policy',
    pt: 'Política de Envio'
  },

  // ===== SIDEBAR Y NAVEGACIÓN =====
  'sidebar.roles.admin': {
    es: 'Administrador',
    en: 'Administrator',
    pt: 'Administrador'
  },
  'sidebar.roles.storeManager': {
    es: 'Gestor de Tienda',
    en: 'Store Manager',
    pt: 'Gerente de Loja'
  },
  'sidebar.roles.delivery': {
    es: 'Delivery',
    en: 'Delivery',
    pt: 'Entrega'
  },
  'sidebar.roles.client': {
    es: 'Cliente',
    en: 'Client',
    pt: 'Cliente'
  },
  'sidebar.admin.title': {
    es: 'Panel de Administración',
    en: 'Administration Panel',
    pt: 'Painel de Administração'
  },
  'sidebar.storeManager.title': {
    es: 'Gestor de Tienda',
    en: 'Store Manager',
    pt: 'Gerente de Loja'
  },
  'sidebar.admin.dashboard': {
    es: 'Dashboard',
    en: 'Dashboard',
    pt: 'Painel'
  },
  'sidebar.admin.users': {
    es: 'Usuarios',
    en: 'Users',
    pt: 'Usuários'
  },
  'sidebar.admin.stores': {
    es: 'Tiendas',
    en: 'Stores',
    pt: 'Lojas'
  },
  'sidebar.admin.subcategories': {
    es: 'Subcategorías',
    en: 'Subcategories',
    pt: 'Subcategorias'
  },
  'sidebar.admin.advertisements': {
    es: 'Publicidad',
    en: 'Advertisements',
    pt: 'Publicidade'
  },
  'sidebar.admin.products': {
    es: 'Productos',
    en: 'Products',
    pt: 'Produtos'
  },
  'sidebar.admin.inventory': {
    es: 'Inventario',
    en: 'Inventory',
    pt: 'Inventário'
  },
  'sidebar.admin.categories': {
    es: 'Categorías',
    en: 'Categories',
    pt: 'Categorias'
  },
  'sidebar.admin.promotions': {
    es: 'Promociones',
    en: 'Promotions',
    pt: 'Promoções'
  },
  'sidebar.admin.sales': {
    es: 'Ventas',
    en: 'Sales',
    pt: 'Vendas'
  },
  'sidebar.admin.salesReports': {
    es: 'Reportes de Ventas',
    en: 'Sales Reports',
    pt: 'Relatórios de Vendas'
  },
  'sidebar.admin.delivery': {
    es: 'Delivery',
    en: 'Delivery',
    pt: 'Entrega'
  },
  'sidebar.admin.loyalty': {
    es: 'Fidelización',
    en: 'Loyalty',
    pt: 'Fidelização'
  },
  'sidebar.admin.analytics': {
    es: 'Analytics',
    en: 'Analytics',
    pt: 'Analytics'
  },
  'sidebar.admin.registrationCodes': {
    es: 'Códigos de Registro',
    en: 'Registration Codes',
    pt: 'Códigos de Registro'
  },
  'sidebar.admin.searchConfig': {
    es: 'Configuración de Búsqueda',
    en: 'Search Configuration',
    pt: 'Configuração de Busca'
  },
  'sidebar.admin.generateProducts': {
    es: 'Generar Productos',
    en: 'Generate Products',
    pt: 'Gerar Produtos'
  },
  'sidebar.admin.globalSettings': {
    es: 'Configuración Global',
    en: 'Global Settings',
    pt: 'Configurações Globais'
  },
  'sidebar.admin.dataEnrichment': {
    es: 'Enriquecimiento de Datos',
    en: 'Data Enrichment',
    pt: 'Enriquecimento de Dados'
  },
  'sidebar.admin.monetization': {
    es: 'Monetización',
    en: 'Monetization',
    pt: 'Monetização'
  },
  'sidebar.storeManager.dashboard': {
    es: 'Dashboard',
    en: 'Dashboard',
    pt: 'Painel'
  },
  'sidebar.storeManager.products': {
    es: 'Productos',
    en: 'Products',
    pt: 'Produtos'
  },
  'sidebar.storeManager.promotions': {
    es: 'Promociones',
    en: 'Promotions',
    pt: 'Promoções'
  },
  'sidebar.storeManager.sales': {
    es: 'Ventas',
    en: 'Sales',
    pt: 'Vendas'
  },
  'sidebar.storeManager.orders': {
    es: 'Pedidos',
    en: 'Orders',
    pt: 'Pedidos'
  },
  'sidebar.storeManager.delivery': {
    es: 'Delivery',
    en: 'Delivery',
    pt: 'Entrega'
  },
  'sidebar.storeManager.analytics': {
    es: 'Analytics',
    en: 'Analytics',
    pt: 'Analytics'
  },
  'sidebar.storeManager.messages': {
    es: 'Mensajes',
    en: 'Messages',
    pt: 'Mensagens'
  },
  'sidebar.storeManager.reviews': {
    es: 'Reseñas',
    en: 'Reviews',
    pt: 'Avaliações'
  },
  'sidebar.storeManager.sellers': {
    es: 'Vendedores',
    en: 'Sellers',
    pt: 'Vendedores'
  },
  'sidebar.storeManager.settings': {
    es: 'Configuración',
    en: 'Settings',
    pt: 'Configurações'
  },
    'sidebar.storeManager.inventory': {
      es: 'Gestión de Inventario',
      en: 'Inventory Management',
      pt: 'Gestão de Inventário'
    },
    'sidebar.storeManager.inventoryAlerts': {
      es: 'Alertas de Inventario',
      en: 'Inventory Alerts',
      pt: 'Alertas de Inventário'
    },
    'sidebar.storeManager.notifications': {
      es: 'Notificaciones',
      en: 'Notifications',
      pt: 'Notificações'
    },
  'sidebar.storeManager.branches': {
    es: 'Gestión de Sucursales',
    en: 'Branch Management',
    pt: 'Gestão de Filiais'
  },
  'store.activeStore': {
    es: 'Tienda Activa:',
    en: 'Active Store:',
    pt: 'Loja Ativa:'
  },
  'store.selectStore': {
    es: 'Seleccionar Tienda',
    en: 'Select Store',
    pt: 'Selecionar Loja'
  },
  'store.noStores': {
    es: 'Sin tiendas',
    en: 'No stores',
    pt: 'Sem lojas'
  },
  // ===== GESTIÓN DE SUCURSALES =====
  'branches.title': {
    es: 'Gestión de Sucursales',
    en: 'Branch Management',
    pt: 'Gestão de Filiais'
  },
  'branches.subtitle': {
    es: 'Administra tus tiendas y sucursales',
    en: 'Manage your stores and branches',
    pt: 'Gerencie suas lojas e filiais'
  },
  'branches.mainStore': {
    es: 'Tienda Principal',
    en: 'Main Store',
    pt: 'Loja Principal'
  },
  'branches.branch': {
    es: 'Sucursal',
    en: 'Branch',
    pt: 'Filia'
  },
  'branches.setAsMain': {
    es: 'Establecer como Principal',
    en: 'Set as Main',
    pt: 'Definir como Principal'
  },
  'branches.createBranch': {
    es: 'Crear Nueva Sucursal',
    en: 'Create New Branch',
    pt: 'Criar Nova Filial'
  },
  'branches.createFirstBranch': {
    es: 'Crear Primera Sucursal',
    en: 'Create First Branch',
    pt: 'Criar Primeira Filial'
  },
  'branches.noBranches': {
    es: 'No tienes sucursales',
    en: 'You have no branches',
    pt: 'Você não tem filiais'
  },
  'branches.noBranchesDescription': {
    es: 'Comienza creando tu primera sucursal',
    en: 'Start by creating your first branch',
    pt: 'Comece criando sua primeira filial'
  },
  'branches.totalBranches': {
    es: 'Tus Sucursales',
    en: 'Your Branches',
    pt: 'Suas Filiais'
  },
  'branches.status.active': {
    es: 'Activa',
    en: 'Active',
    pt: 'Ativa'
  },
  'branches.status.inactive': {
    es: 'Inactiva',
    en: 'Inactive',
    pt: 'Inativa'
  },
  'branches.status.main': {
    es: 'Principal',
    en: 'Main',
    pt: 'Principal'
  },
  'branches.status.mainStore': {
    es: 'Tienda Principal',
    en: 'Main Store',
    pt: 'Loja Principal'
  },
  'branches.status.mainStoreDescription': {
    es: 'Esta es la tienda principal de tu negocio',
    en: 'This is the main store of your business',
    pt: 'Esta é a loja principal do seu negócio'
  },
  'branches.actions.edit': {
    es: 'Editar',
    en: 'Edit',
    pt: 'Editar'
  },
  'branches.actions.delete': {
    es: 'Eliminar',
    en: 'Delete',
    pt: 'Excluir'
  },
  'branches.actions.activate': {
    es: 'Activar',
    en: 'Activate',
    pt: 'Ativar'
  },
  'branches.actions.deactivate': {
    es: 'Desactivar',
    en: 'Deactivate',
    pt: 'Desativar'
  },
  'branches.actions.setMain': {
    es: 'Establecer como Principal',
    en: 'Set as Main',
    pt: 'Definir como Principal'
  },
  'branches.confirmDelete': {
    es: '¿Estás seguro de que quieres eliminar esta sucursal?',
    en: 'Are you sure you want to delete this branch?',
    pt: 'Tem certeza de que deseja excluir esta filial?'
  },
  'branches.confirmSetMain': {
    es: '¿Estás seguro de que quieres establecer esta sucursal como principal?',
    en: 'Are you sure you want to set this branch as main?',
    pt: 'Tem certeza de que deseja definir esta filial como principal?'
  },
  'branches.confirmActivate': {
    es: '¿Estás seguro de que quieres activar esta sucursal?',
    en: 'Are you sure you want to activate this branch?',
    pt: 'Tem certeza de que deseja ativar esta filial?'
  },
  'branches.confirmDeactivate': {
    es: '¿Estás seguro de que quieres desactivar esta sucursal?',
    en: 'Are you sure you want to deactivate this branch?',
    pt: 'Tem certeza de que deseja desativar esta filial?'
  },
  'branches.form.title': {
    es: 'Crear Nueva Sucursal',
    en: 'Create New Branch',
    pt: 'Criar Nova Filial'
  },
  'branches.form.editTitle': {
    es: 'Editar Sucursal',
    en: 'Edit Branch',
    pt: 'Editar Filial'
  },
  'branches.form.name': {
    es: 'Nombre de la Sucursal',
    en: 'Branch Name',
    pt: 'Nome da Filial'
  },
  'branches.form.namePlaceholder': {
    es: 'Ej: Sucursal Centro, Sucursal Norte',
    en: 'Ex: Downtown Branch, North Branch',
    pt: 'Ex: Filial Centro, Filial Norte'
  },
  'branches.form.description': {
    es: 'Descripción',
    en: 'Description',
    pt: 'Descrição'
  },
  'branches.form.descriptionPlaceholder': {
    es: 'Descripción de la sucursal',
    en: 'Branch description',
    pt: 'Descrição da filial'
  },
  'branches.form.address': {
    es: 'Dirección',
    en: 'Address',
    pt: 'Endereço'
  },
  'branches.form.city': {
    es: 'Ciudad',
    en: 'City',
    pt: 'Cidade'
  },
  'branches.form.state': {
    es: 'Estado',
    en: 'State',
    pt: 'Estado'
  },
  'branches.form.zipCode': {
    es: 'Código Postal',
    en: 'Zip Code',
    pt: 'Código Postal'
  },
  'branches.form.phone': {
    es: 'Teléfono',
    en: 'Phone',
    pt: 'Telefone'
  },
  'branches.form.email': {
    es: 'Email',
    en: 'Email',
    pt: 'Email'
  },
  'branches.form.website': {
    es: 'Sitio Web',
    en: 'Website',
    pt: 'Site Web'
  },
  'branches.form.save': {
    es: 'Guardar Sucursal',
    en: 'Save Branch',
    pt: 'Salvar Filial'
  },
  'branches.form.cancel': {
    es: 'Cancelar',
    en: 'Cancel',
    pt: 'Cancelar'
  },
  'branches.form.isMainStore': {
    es: 'Establecer como Tienda Principal',
    en: 'Set as Main Store',
    pt: 'Definir como Loja Principal'
  },
  'branches.form.isMainStoreHelp': {
    es: 'Solo una tienda puede ser principal. Si seleccionas esta opción, la tienda principal actual será cambiada a sucursal.',
    en: 'Only one store can be main. If you select this option, the current main store will be changed to a branch.',
    pt: 'Apenas uma loja pode ser principal. Se você selecionar esta opção, a loja principal atual será alterada para filial.'
  },
  // ===== HORARIOS DE TRABAJO =====
  'businessHours.title': {
    es: 'Horarios de Trabajo',
    en: 'Business Hours',
    pt: 'Horários de Funcionamento'
  },
  'businessHours.quickTemplates': {
    es: 'Plantillas Rápidas',
    en: 'Quick Templates',
    pt: 'Modelos Rápidos'
  },
  'businessHours.dailySchedule': {
    es: 'Horario Diario',
    en: 'Daily Schedule',
    pt: 'Horário Diário'
  },
  'businessHours.open': {
    es: 'Abierto',
    en: 'Open',
    pt: 'Aberto'
  },
  'businessHours.closed': {
    es: 'Cerrado',
    en: 'Closed',
    pt: 'Fechado'
  },
  'businessHours.openTime': {
    es: 'Hora de Apertura',
    en: 'Opening Time',
    pt: 'Horário de Abertura'
  },
  'businessHours.closeTime': {
    es: 'Hora de Cierre',
    en: 'Closing Time',
    pt: 'Horário de Fechamento'
  },
  'businessHours.templates.weekdays': {
    es: 'Días Laborables',
    en: 'Weekdays',
    pt: 'Dias Úteis'
  },
  'businessHours.templates.weekend': {
    es: 'Fin de Semana',
    en: 'Weekend',
    pt: 'Fim de Semana'
  },
  'businessHours.templates.all': {
    es: 'Todos los Días',
    en: 'All Days',
    pt: 'Todos os Dias'
  },
  'businessHours.monday': {
    es: 'Lunes',
    en: 'Monday',
    pt: 'Segunda-feira'
  },
  'businessHours.tuesday': {
    es: 'Martes',
    en: 'Tuesday',
    pt: 'Terça-feira'
  },
  'businessHours.wednesday': {
    es: 'Miércoles',
    en: 'Wednesday',
    pt: 'Quarta-feira'
  },
  'businessHours.thursday': {
    es: 'Jueves',
    en: 'Thursday',
    pt: 'Quinta-feira'
  },
  'businessHours.friday': {
    es: 'Viernes',
    en: 'Friday',
    pt: 'Sexta-feira'
  },
  'businessHours.saturday': {
    es: 'Sábado',
    en: 'Saturday',
    pt: 'Sábado'
  },
  'businessHours.sunday': {
    es: 'Domingo',
    en: 'Sunday',
    pt: 'Domingo'
  },
  'businessHours.info.title': {
    es: 'Información Importante',
    en: 'Important Information',
    pt: 'Informação Importante'
  },
  'businessHours.info.description': {
    es: 'Los horarios configurados aquí serán visibles para los clientes y determinarán cuándo pueden realizar pedidos.',
    en: 'The hours configured here will be visible to customers and will determine when they can place orders.',
    pt: 'Os horários configurados aqui serão visíveis para os clientes e determinarão quando eles podem fazer pedidos.'
  },
  'businessHours.save': {
    es: 'Guardar Horarios',
    en: 'Save Hours',
    pt: 'Salvar Horários'
  },
  'businessHours.saving': {
    es: 'Guardando...',
    en: 'Saving...',
    pt: 'Salvando...'
  },
  'businessHours.cancel': {
    es: 'Cancelar',
    en: 'Cancel',
    pt: 'Cancelar'
  },
  'branches.actions.businessHours': {
    es: 'Horarios de Trabajo',
    en: 'Business Hours',
    pt: 'Horários de Funcionamento'
  },
  // ===== UBICACIÓN Y MAPA =====
  'location.administrativeDivision': {
    es: 'División Administrativa',
    en: 'Administrative Division',
    pt: 'Divisão Administrativa'
  },
  'location.administrativeDivisionHelp': {
    es: 'Selecciona el Estado, Municipio y Parroquia donde se encuentra la sucursal. Esto permite búsquedas más precisas y mejor ubicación para los clientes.',
    en: 'Select the State, Municipality and Parish where the branch is located. This allows for more precise searches and better location for customers.',
    pt: 'Selecione o Estado, Município e Paróquia onde a filial está localizada. Isso permite buscas mais precisas e melhor localização para os clientes.'
  },
  'location.gpsLocation': {
    es: 'Ubicación GPS',
    en: 'GPS Location',
    pt: 'Localização GPS'
  },
  'location.mapHelp': {
    es: 'Haz clic en el mapa para seleccionar la ubicación exacta de la sucursal. Esto ayudará a los clientes a encontrar tu tienda más fácilmente.',
    en: 'Click on the map to select the exact location of the branch. This will help customers find your store more easily.',
    pt: 'Clique no mapa para selecionar a localização exata da filial. Isso ajudará os clientes a encontrar sua loja mais facilmente.'
  },
  'location.selectLocation': {
    es: 'Debe seleccionar una ubicación en el mapa',
    en: 'You must select a location on the map',
    pt: 'Você deve selecionar uma localização no mapa'
  },
  'location.selectAdministrativeDivision': {
    es: 'Debe seleccionar estado, municipio y parroquia',
    en: 'You must select state, municipality and parish',
    pt: 'Você deve selecionar estado, município e paróquia'
  },
  // ===== DIVISIÓN ADMINISTRATIVA =====
  'location.state': {
    es: 'Estado',
    en: 'State',
    pt: 'Estado'
  },
  'location.municipality': {
    es: 'Municipio',
    en: 'Municipality',
    pt: 'Município'
  },
  'location.parish': {
    es: 'Parroquia',
    en: 'Parish',
    pt: 'Paróquia'
  },
  'location.selectState': {
    es: 'Selecciona un estado',
    en: 'Select a state',
    pt: 'Selecione um estado'
  },
  'location.selectMunicipality': {
    es: 'Selecciona un municipio',
    en: 'Select a municipality',
    pt: 'Selecione um município'
  },
  'location.selectParish': {
    es: 'Selecciona una parroquia',
    en: 'Select a parish',
    pt: 'Selecione uma paróquia'
  },
  'location.locationSelected': {
    es: 'Ubicación seleccionada',
    en: 'Location selected',
    pt: 'Localização selecionada'
  },
  // ===== REDES SOCIALES =====
  'socialMedia.title': {
    es: 'Redes Sociales',
    en: 'Social Media',
    pt: 'Redes Sociais'
  },
  'socialMedia.facebook': {
    es: 'Facebook',
    en: 'Facebook',
    pt: 'Facebook'
  },
  'socialMedia.instagram': {
    es: 'Instagram',
    en: 'Instagram',
    pt: 'Instagram'
  },
  'socialMedia.twitter': {
    es: 'Twitter',
    en: 'Twitter',
    pt: 'Twitter'
  },
  'socialMedia.facebookPlaceholder': {
    es: 'https://facebook.com/tuempresa',
    en: 'https://facebook.com/yourcompany',
    pt: 'https://facebook.com/suaempresa'
  },
  'socialMedia.instagramPlaceholder': {
    es: 'https://instagram.com/tuempresa',
    en: 'https://instagram.com/yourcompany',
    pt: 'https://instagram.com/suaempresa'
  },
  'socialMedia.twitterPlaceholder': {
    es: 'https://twitter.com/tuempresa',
    en: 'https://twitter.com/yourcompany',
    pt: 'https://twitter.com/suaempresa'
  },
  'socialMedia.tiktok': {
    es: 'TikTok',
    en: 'TikTok',
    pt: 'TikTok'
  },
  'socialMedia.tiktokPlaceholder': {
    es: 'https://tiktok.com/@tuempresa',
    en: 'https://tiktok.com/@yourcompany',
    pt: 'https://tiktok.com/@suaempresa'
  },
  // ===== BOTONES Y ACCIONES =====
  'branches.actions.manage': {
    es: 'Gestionar',
    en: 'Manage',
    pt: 'Gerenciar'
  },
  'branches.actions.continueToDashboard': {
    es: 'Continuar al Dashboard',
    en: 'Continue to Dashboard',
    pt: 'Continuar para o Dashboard'
  },
  // ===== MENSAJES DE ELIMINACIÓN =====
  'branches.delete.warning': {
    es: '¡Advertencia!',
    en: 'Warning!',
    pt: 'Aviso!'
  },
  'branches.delete.willDelete': {
    es: 'Esta acción eliminará permanentemente:',
    en: 'This action will permanently delete:',
    pt: 'Esta ação irá excluir permanentemente:'
  },
  'branches.delete.products': {
    es: 'Todos los productos asociados',
    en: 'All associated products',
    pt: 'Todos os produtos associados'
  },
  'branches.delete.orders': {
    es: 'Historial de pedidos',
    en: 'Order history',
    pt: 'Histórico de pedidos'
  },
  'branches.delete.customers': {
    es: 'Datos de clientes',
    en: 'Customer data',
    pt: 'Dados dos clientes'
  },
  'branches.delete.settings': {
    es: 'Configuraciones de la sucursal',
    en: 'Branch settings',
    pt: 'Configurações da filial'
  },
  'branches.delete.cannotUndo': {
    es: 'Esta acción no se puede deshacer.',
    en: 'This action cannot be undone.',
    pt: 'Esta ação não pode ser desfeita.'
  },
  'branches.delete.permanently': {
    es: 'Eliminar Permanentemente',
    en: 'Delete Permanently',
    pt: 'Excluir Permanentemente'
  },
  // ===== EJEMPLO DE MÓDULO ADMINISTRATIVO =====
  'example.title': {
    es: 'Ejemplo de Módulo',
    en: 'Module Example',
    pt: 'Exemplo de Módulo'
  },
  'example.description': {
    es: 'Este es un ejemplo de cómo implementar un módulo administrativo con tema y traducciones',
    en: 'This is an example of how to implement an administrative module with theme and translations',
    pt: 'Este é um exemplo de como implementar um módulo administrativo com tema e traduções'
  },
  'example.actions.create': {
    es: 'Crear Nuevo',
    en: 'Create New',
    pt: 'Criar Novo'
  },
  'example.actions.edit': {
    es: 'Editar',
    en: 'Edit',
    pt: 'Editar'
  },
  'example.actions.delete': {
    es: 'Eliminar',
    en: 'Delete',
    pt: 'Excluir'
  },
  'example.table.headers.name': {
    es: 'Nombre',
    en: 'Name',
    pt: 'Nome'
  },
  'example.table.headers.status': {
    es: 'Estado',
    en: 'Status',
    pt: 'Status'
  },
  'example.table.headers.date': {
    es: 'Fecha',
    en: 'Date',
    pt: 'Data'
  },
  'example.table.headers.actions': {
    es: 'Acciones',
    en: 'Actions',
    pt: 'Ações'
  },
  'example.table.emptyMessage': {
    es: 'No hay elementos disponibles',
    en: 'No items available',
    pt: 'Nenhum item disponível'
  },
  'example.form.title': {
    es: 'Crear Nuevo Elemento',
    en: 'Create New Item',
    pt: 'Criar Novo Item'
  },
  'example.form.nameLabel': {
    es: 'Nombre',
    en: 'Name',
    pt: 'Nome'
  },
  'example.form.namePlaceholder': {
    es: 'Ingrese el nombre',
    en: 'Enter name',
    pt: 'Digite o nome'
  },
  'example.form.statusLabel': {
    es: 'Estado',
    en: 'Status',
    pt: 'Status'
  },
  'example.form.statusActive': {
    es: 'Activo',
    en: 'Active',
    pt: 'Ativo'
  },
  'example.form.statusInactive': {
    es: 'Inactivo',
    en: 'Inactive',
    pt: 'Inativo'
  },
  'example.form.save': {
    es: 'Guardar',
    en: 'Save',
    pt: 'Salvar'
  },
  'example.form.cancel': {
    es: 'Cancelar',
    en: 'Cancel',
    pt: 'Cancelar'
  },
  'sidebar.delivery.dashboard': {
    es: 'Dashboard',
    en: 'Dashboard',
    pt: 'Painel'
  },
  'sidebar.delivery.assignedOrders': {
    es: 'Pedidos Asignados',
    en: 'Assigned Orders',
    pt: 'Pedidos Atribuídos'
  },
  'sidebar.delivery.routeMap': {
    es: 'Mapa de Rutas',
    en: 'Route Map',
    pt: 'Mapa de Rotas'
  },
  'sidebar.delivery.deliveryReport': {
    es: 'Reportar Entrega',
    en: 'Delivery Report',
    pt: 'Relatório de Entrega'
  },
  'sidebar.delivery.ratings': {
    es: 'Calificaciones',
    en: 'Ratings',
    pt: 'Avaliações'
  },
  'sidebar.delivery.workSchedule': {
    es: 'Horario de Trabajo',
    en: 'Work Schedule',
    pt: 'Horário de Trabalho'
  },
  'sidebar.delivery.availabilityStatus': {
    es: 'Estado de Disponibilidad',
    en: 'Availability Status',
    pt: 'Status de Disponibilidade'
  },
  'sidebar.delivery.profile': {
    es: 'Perfil',
    en: 'Profile',
    pt: 'Perfil'
  },
  'sidebar.client.home': {
    es: 'Inicio',
    en: 'Home',
    pt: 'Início'
  },
  'sidebar.client.products': {
    es: 'Productos',
    en: 'Products',
    pt: 'Produtos'
  },
  'sidebar.client.categories': {
    es: 'Categorías',
    en: 'Categories',
    pt: 'Categorias'
  },
  'sidebar.client.cart': {
    es: 'Carrito',
    en: 'Cart',
    pt: 'Carrinho'
  },
  'sidebar.client.favorites': {
    es: 'Favoritos',
    en: 'Favorites',
    pt: 'Favoritos'
  },
  'sidebar.client.loyalty': {
    es: 'Fidelización',
    en: 'Loyalty',
    pt: 'Fidelização'
  },
  'sidebar.client.myOrders': {
    es: 'Mis Pedidos',
    en: 'My Orders',
    pt: 'Meus Pedidos'
  },
  'sidebar.client.profile': {
    es: 'Perfil',
    en: 'Profile',
    pt: 'Perfil'
  },
  'sidebar.client.security': {
    es: 'Seguridad',
    en: 'Security',
    pt: 'Segurança'
  },
  'sidebar.client.notifications': {
    es: 'Notificaciones',
    en: 'Notifications',
    pt: 'Notificações'
  },

  // ===== DELIVERY ORDERS =====
  'deliveryOrders.title': {
    es: 'Pedidos Asignados',
    en: 'Assigned Orders',
    pt: 'Pedidos Atribuídos'
  },
  'deliveryOrders.subtitle': {
    es: 'Gestiona tus pedidos asignados y actualiza su estado',
    en: 'Manage your assigned orders and update their status',
    pt: 'Gerencie seus pedidos atribuídos e atualize seu status'
  },
  'deliveryOrders.filters.all': {
    es: 'Todos',
    en: 'All',
    pt: 'Todos'
  },
  'deliveryOrders.filters.pending': {
    es: 'Pendientes',
    en: 'Pending',
    pt: 'Pendentes'
  },
  'deliveryOrders.filters.assigned': {
    es: 'Asignados',
    en: 'Assigned',
    pt: 'Atribuídos'
  },
  'deliveryOrders.filters.accepted': {
    es: 'Aceptados',
    en: 'Accepted',
    pt: 'Aceitos'
  },
  'deliveryOrders.filters.pickedUp': {
    es: 'Recogidos',
    en: 'Picked Up',
    pt: 'Coletados'
  },
  'deliveryOrders.filters.inTransit': {
    es: 'En Tránsito',
    en: 'In Transit',
    pt: 'Em Trânsito'
  },
  'deliveryOrders.filters.delivered': {
    es: 'Entregados',
    en: 'Delivered',
    pt: 'Entregues'
  },
  'deliveryOrders.filters.cancelled': {
    es: 'Cancelados',
    en: 'Cancelled',
    pt: 'Cancelados'
  },
  'deliveryOrders.search.placeholder': {
    es: 'Buscar por código de seguimiento, cliente...',
    en: 'Search by tracking code, customer...',
    pt: 'Buscar por código de rastreamento, cliente...'
  },
  'deliveryOrders.status.pending': {
    es: 'Pendiente',
    en: 'Pending',
    pt: 'Pendente'
  },
  'deliveryOrders.status.assigned': {
    es: 'Asignado',
    en: 'Assigned',
    pt: 'Atribuído'
  },
  'deliveryOrders.status.accepted': {
    es: 'Aceptado',
    en: 'Accepted',
    pt: 'Aceito'
  },
  'deliveryOrders.status.pickedUp': {
    es: 'Recogido',
    en: 'Picked Up',
    pt: 'Coletado'
  },
  'deliveryOrders.status.inTransit': {
    es: 'En Tránsito',
    en: 'In Transit',
    pt: 'Em Trânsito'
  },
  'deliveryOrders.status.delivered': {
    es: 'Entregado',
    en: 'Delivered',
    pt: 'Entregue'
  },
  'deliveryOrders.status.cancelled': {
    es: 'Cancelado',
    en: 'Cancelled',
    pt: 'Cancelado'
  },
  'deliveryOrders.status.failed': {
    es: 'Fallido',
    en: 'Failed',
    pt: 'Falhou'
  },
  'deliveryOrders.order.trackingCode': {
    es: 'Código de Seguimiento',
    en: 'Tracking Code',
    pt: 'Código de Rastreamento'
  },
  'deliveryOrders.order.customer': {
    es: 'Cliente',
    en: 'Customer',
    pt: 'Cliente'
  },
  'deliveryOrders.order.store': {
    es: 'Tienda',
    en: 'Store',
    pt: 'Loja'
  },
  'deliveryOrders.order.pickupLocation': {
    es: 'Punto de Recogida',
    en: 'Pickup Location',
    pt: 'Local de Coleta'
  },
  'deliveryOrders.order.deliveryLocation': {
    es: 'Punto de Entrega',
    en: 'Delivery Location',
    pt: 'Local de Entrega'
  },
  'deliveryOrders.order.deliveryFee': {
    es: 'Tarifa de Entrega',
    en: 'Delivery Fee',
    pt: 'Taxa de Entrega'
  },
  'deliveryOrders.order.riderPayment': {
    es: 'Pago al Repartidor',
    en: 'Rider Payment',
    pt: 'Pagamento do Entregador'
  },
  'deliveryOrders.order.estimatedPickup': {
    es: 'Recogida Estimada',
    en: 'Estimated Pickup',
    pt: 'Coleta Estimada'
  },
  'deliveryOrders.order.estimatedDelivery': {
    es: 'Entrega Estimada',
    en: 'Estimated Delivery',
    pt: 'Entrega Estimada'
  },
  'deliveryOrders.order.instructions': {
    es: 'Instrucciones',
    en: 'Instructions',
    pt: 'Instruções'
  },
  'deliveryOrders.actions.accept': {
    es: 'Aceptar',
    en: 'Accept',
    pt: 'Aceitar'
  },
  'deliveryOrders.actions.pickup': {
    es: 'Recoger',
    en: 'Pick Up',
    pt: 'Coletar'
  },
  'deliveryOrders.actions.startDelivery': {
    es: 'Iniciar Entrega',
    en: 'Start Delivery',
    pt: 'Iniciar Entrega'
  },
  'deliveryOrders.actions.completeDelivery': {
    es: 'Completar Entrega',
    en: 'Complete Delivery',
    pt: 'Completar Entrega'
  },
  'deliveryOrders.actions.cancel': {
    es: 'Cancelar',
    en: 'Cancel',
    pt: 'Cancelar'
  },
  'deliveryOrders.actions.viewDetails': {
    es: 'Ver Detalles',
    en: 'View Details',
    pt: 'Ver Detalhes'
  },
  'deliveryOrders.actions.callCustomer': {
    es: 'Llamar Cliente',
    en: 'Call Customer',
    pt: 'Ligar para Cliente'
  },
  'deliveryOrders.actions.callStore': {
    es: 'Llamar Tienda',
    en: 'Call Store',
    pt: 'Ligar para Loja'
  },
  'deliveryOrders.stats.total': {
    es: 'Total de Pedidos',
    en: 'Total Orders',
    pt: 'Total de Pedidos'
  },
  'deliveryOrders.stats.pending': {
    es: 'Pendientes',
    en: 'Pending',
    pt: 'Pendentes'
  },
  'deliveryOrders.stats.inProgress': {
    es: 'En Progreso',
    en: 'In Progress',
    pt: 'Em Andamento'
  },
  'deliveryOrders.stats.completed': {
    es: 'Completados',
    en: 'Completed',
    pt: 'Concluídos'
  },
  'deliveryOrders.empty.title': {
    es: 'No hay pedidos asignados',
    en: 'No assigned orders',
    pt: 'Nenhum pedido atribuído'
  },
  'deliveryOrders.empty.subtitle': {
    es: 'Cuando tengas pedidos asignados, aparecerán aquí',
    en: 'When you have assigned orders, they will appear here',
    pt: 'Quando você tiver pedidos atribuídos, eles aparecerão aqui'
  },
  'deliveryOrders.refresh': {
    es: 'Actualizar',
    en: 'Refresh',
    pt: 'Atualizar'
  },
  'deliveryOrders.loading': {
    es: 'Cargando pedidos...',
    en: 'Loading orders...',
    pt: 'Carregando pedidos...'
  },
  'deliveryOrders.error': {
    es: 'Error al cargar los pedidos',
    en: 'Error loading orders',
    pt: 'Erro ao carregar pedidos'
  },

  // ===== DELIVERY MAP =====
  'deliveryMap.title': {
    es: 'Mapa de Rutas',
    en: 'Route Map',
    pt: 'Mapa de Rotas'
  },
  'deliveryMap.subtitle': {
    es: 'Visualiza tus rutas de entrega y optimiza tu recorrido',
    en: 'View your delivery routes and optimize your journey',
    pt: 'Visualize suas rotas de entrega e otimize sua jornada'
  },
  'deliveryMap.currentLocation': {
    es: 'Mi Ubicación',
    en: 'My Location',
    pt: 'Minha Localização'
  },
  'deliveryMap.pickupPoints': {
    es: 'Puntos de Recogida',
    en: 'Pickup Points',
    pt: 'Pontos de Coleta'
  },
  'deliveryMap.deliveryPoints': {
    es: 'Puntos de Entrega',
    en: 'Delivery Points',
    pt: 'Pontos de Entrega'
  },
  'deliveryMap.routeOptimization': {
    es: 'Optimizar Ruta',
    en: 'Optimize Route',
    pt: 'Otimizar Rota'
  },
  'deliveryMap.showRoute': {
    es: 'Mostrar Ruta',
    en: 'Show Route',
    pt: 'Mostrar Rota'
  },
  'deliveryMap.hideRoute': {
    es: 'Ocultar Ruta',
    en: 'Hide Route',
    pt: 'Ocultar Rota'
  },
  'deliveryMap.estimatedTime': {
    es: 'Tiempo Estimado',
    en: 'Estimated Time',
    pt: 'Tempo Estimado'
  },
  'deliveryMap.totalDistance': {
    es: 'Distancia Total',
    en: 'Total Distance',
    pt: 'Distância Total'
  },
  'deliveryMap.startNavigation': {
    es: 'Iniciar Navegación',
    en: 'Start Navigation',
    pt: 'Iniciar Navegação'
  },
  'deliveryMap.navigateToStore': {
    es: 'Navegar a Tienda',
    en: 'Navigate to Store',
    pt: 'Navegar para Loja'
  },
  'deliveryMap.refreshLocation': {
    es: 'Actualizar Ubicación',
    en: 'Refresh Location',
    pt: 'Atualizar Localização'
  },
  'deliveryMap.loading': {
    es: 'Cargando mapa...',
    en: 'Loading map...',
    pt: 'Carregando mapa...'
  },
  'deliveryMap.error': {
    es: 'Error al cargar el mapa',
    en: 'Error loading map',
    pt: 'Erro ao carregar mapa'
  },
  'deliveryMap.noOrders': {
    es: 'No hay pedidos para mostrar en el mapa',
    en: 'No orders to show on map',
    pt: 'Nenhum pedido para mostrar no mapa'
  },
  'deliveryMap.orderDetails': {
    es: 'Detalles del Pedido',
    en: 'Order Details',
    pt: 'Detalhes do Pedido'
  },
  'deliveryMap.customer': {
    es: 'Cliente',
    en: 'Customer',
    pt: 'Cliente'
  },
  'deliveryMap.store': {
    es: 'Tienda',
    en: 'Store',
    pt: 'Loja'
  },
  'deliveryMap.trackingCode': {
    es: 'Código de Seguimiento',
    en: 'Tracking Code',
    pt: 'Código de Rastreamento'
  },
  'deliveryMap.status': {
    es: 'Estado',
    en: 'Status',
    pt: 'Status'
  },
  'deliveryMap.estimatedPickup': {
    es: 'Recogida Estimada',
    en: 'Estimated Pickup',
    pt: 'Coleta Estimada'
  },
  'deliveryMap.estimatedDelivery': {
    es: 'Entrega Estimada',
    en: 'Estimated Delivery',
    pt: 'Entrega Estimada'
  },
  'deliveryMap.instructions': {
    es: 'Instrucciones',
    en: 'Instructions',
    pt: 'Instruções'
  },
  'deliveryMap.callCustomer': {
    es: 'Llamar Cliente',
    en: 'Call Customer',
    pt: 'Ligar para Cliente'
  },
  'deliveryMap.callStore': {
    es: 'Llamar Tienda',
    en: 'Call Store',
    pt: 'Ligar para Loja'
  },
  'deliveryMap.viewOrder': {
    es: 'Ver Pedido',
    en: 'View Order',
    pt: 'Ver Pedido'
  },
  'deliveryMap.mapControls': {
    es: 'Controles del Mapa',
    en: 'Map Controls',
    pt: 'Controles do Mapa'
  },
  'deliveryMap.zoomIn': {
    es: 'Acercar',
    en: 'Zoom In',
    pt: 'Aproximar'
  },
  'deliveryMap.zoomOut': {
    es: 'Alejar',
    en: 'Zoom Out',
    pt: 'Afastar'
  },
  'deliveryMap.centerMap': {
    es: 'Centrar Mapa',
    en: 'Center Map',
    pt: 'Centralizar Mapa'
  },
  'deliveryMap.layers': {
    es: 'Capas',
    en: 'Layers',
    pt: 'Camadas'
  },
  'deliveryMap.traffic': {
    es: 'Tráfico',
    en: 'Traffic',
    pt: 'Tráfego'
  },
  'deliveryMap.satellite': {
    es: 'Satélite',
    en: 'Satellite',
    pt: 'Satélite'
  },
  'deliveryMap.terrain': {
    es: 'Terreno',
    en: 'Terrain',
    pt: 'Terreno'
  },

  // ===== ADMIN DASHBOARD =====
  'adminDashboard.title': {
    es: 'Panel de Administración',
    en: 'Administration Panel',
    pt: 'Painel de Administração'
  },
  'adminDashboard.welcome': {
    es: 'Bienvenido',
    en: 'Welcome',
    pt: 'Bem-vindo'
  },
  'adminDashboard.stats.users': {
    es: 'Usuarios',
    en: 'Users',
    pt: 'Usuários'
  },
  'adminDashboard.stats.products': {
    es: 'Productos',
    en: 'Products',
    pt: 'Produtos'
  },
  'adminDashboard.stats.sales': {
    es: 'Ventas',
    en: 'Sales',
    pt: 'Vendas'
  },
  'adminDashboard.stats.orders': {
    es: 'Órdenes',
    en: 'Orders',
    pt: 'Pedidos'
  },
  'adminDashboard.quickActions.title': {
    es: 'Acciones Rápidas',
    en: 'Quick Actions',
    pt: 'Ações Rápidas'
  },
  'adminDashboard.quickActions.manageUsers': {
    es: 'Gestionar Usuarios',
    en: 'Manage Users',
    pt: 'Gerenciar Usuários'
  },
  'adminDashboard.quickActions.manageProducts': {
    es: 'Gestionar Productos',
    en: 'Manage Products',
    pt: 'Gerenciar Produtos'
  },
  'adminDashboard.quickActions.settings': {
    es: 'Configuración',
    en: 'Settings',
    pt: 'Configurações'
  },
  'adminDashboard.recentActivity.title': {
    es: 'Actividad Reciente',
    en: 'Recent Activity',
    pt: 'Atividade Recente'
  },
  'adminDashboard.recentActivity.newUser': {
    es: 'Nuevo usuario registrado',
    en: 'New user registered',
    pt: 'Novo usuário registrado'
  },
  'adminDashboard.recentActivity.productAdded': {
    es: 'Producto agregado',
    en: 'Product added',
    pt: 'Produto adicionado'
  },
  'adminDashboard.recentActivity.orderCompleted': {
    es: 'Orden completada',
    en: 'Order completed',
    pt: 'Pedido concluído'
  },
  'adminDashboard.recentActivity.ago': {
    es: 'Hace',
    en: 'Ago',
    pt: 'Atrás'
  },
  'adminDashboard.recentActivity.minutes': {
    es: 'minutos',
    en: 'minutes',
    pt: 'minutos'
  },
  'adminDashboard.recentActivity.hour': {
    es: 'hora',
    en: 'hour',
    pt: 'hora'
  },
  'adminDashboard.stats.title': {
    es: 'Estadísticas',
    en: 'Statistics',
    pt: 'Estatísticas'
  },
  'adminDashboard.stats.monthlySales': {
    es: 'Ventas del mes',
    en: 'Monthly sales',
    pt: 'Vendas do mês'
  },
  'adminDashboard.stats.activeUsers': {
    es: 'Usuarios activos',
    en: 'Active users',
    pt: 'Usuários ativos'
  },
  'adminDashboard.stats.productsSold': {
    es: 'Productos vendidos',
    en: 'Products sold',
    pt: 'Produtos vendidos'
  },

  // ===== HOME PAGE =====
  'home.hero.tagline': {
    es: 'El repuesto que buscas, al instante',
    en: 'The part you need, instantly',
    pt: 'A peça que você precisa, instantaneamente'
  },
  'home.search.placeholder': {
    es: 'Buscar repuestos, marcas, códigos...',
    en: 'Search parts, brands, codes...',
    pt: 'Buscar peças, marcas, códigos...'
  },
  'home.actions.viewCategories': {
    es: 'Ver Categorías',
    en: 'View Categories',
    pt: 'Ver Categorias'
  },
  'home.actions.specialOffers': {
    es: 'Ofertas Especiales',
    en: 'Special Offers',
    pt: 'Ofertas Especiais'
  },
  'home.features.subtitle': {
    es: 'La mejor plataforma para encontrar repuestos de calidad',
    en: 'The best platform to find quality parts',
    pt: 'A melhor plataforma para encontrar peças de qualidade'
  },
  'home.features.catalog.title': {
    es: 'Amplio Catálogo',
    en: 'Wide Catalog',
    pt: 'Amplo Catálogo'
  },
  'home.features.catalog.description': {
    es: 'Más de 10,000 productos de las mejores marcas',
    en: 'More than 10,000 products from the best brands',
    pt: 'Mais de 10.000 produtos das melhores marcas'
  },
  'home.features.shipping.title': {
    es: 'Envío Rápido',
    en: 'Fast Shipping',
    pt: 'Envio Rápido'
  },
  'home.features.shipping.description': {
    es: 'Entrega en 24-48 horas en toda Colombia',
    en: 'Delivery in 24-48 hours throughout Colombia',
    pt: 'Entrega em 24-48 horas em toda a Colômbia'
  },
  'home.features.warranty.title': {
    es: 'Garantía Total',
    en: 'Total Warranty',
    pt: 'Garantia Total'
  },
  'home.features.warranty.description': {
    es: 'Todos nuestros productos tienen garantía',
    en: 'All our products have warranty',
    pt: 'Todos os nossos produtos têm garantia'
  },
  'home.cta.title': {
    es: '¿Listo para encontrar tu repuesto?',
    en: 'Ready to find your part?',
    pt: 'Pronto para encontrar sua peça?'
  },
  'home.cta.subtitle': {
    es: 'Únete a miles de clientes satisfechos',
    en: 'Join thousands of satisfied customers',
    pt: 'Junte-se a milhares de clientes satisfeitos'
  },
  'home.cta.exploreCategories': {
    es: 'Explorar Categorías',
    en: 'Explore Categories',
    pt: 'Explorar Categorias'
  },

  // ===== ADMIN USERS =====
  'adminUsers.title': {
    es: 'Gestión de Usuarios',
    en: 'User Management',
    pt: 'Gerenciamento de Usuários'
  },
  'adminUsers.subtitle': {
    es: 'Administra los usuarios del sistema',
    en: 'Manage system users',
    pt: 'Gerencie os usuários do sistema'
  },
  'adminUsers.addUser': {
    es: 'Agregar Usuario',
    en: 'Add User',
    pt: 'Adicionar Usuário'
  },
  'adminUsers.searchPlaceholder': {
    es: 'Buscar usuarios...',
    en: 'Search users...',
    pt: 'Buscar usuários...'
  },
  'adminUsers.filters.allRoles': {
    es: 'Todos los roles',
    en: 'All roles',
    pt: 'Todos os papéis'
  },
  'adminUsers.filters.allStatuses': {
    es: 'Todos los estados',
    en: 'All statuses',
    pt: 'Todos os status'
  },
  'adminUsers.filters.active': {
    es: 'Activo',
    en: 'Active',
    pt: 'Ativo'
  },
  'adminUsers.filters.inactive': {
    es: 'Inactivo',
    en: 'Inactive',
    pt: 'Inativo'
  },
  'adminUsers.filters.pending': {
    es: 'Pendiente',
    en: 'Pending',
    pt: 'Pendente'
  },
  'adminUsers.table.title': {
    es: 'Usuarios',
    en: 'Users',
    pt: 'Usuários'
  },
  'adminUsers.table.headers.user': {
    es: 'Usuario',
    en: 'User',
    pt: 'Usuário'
  },
  'adminUsers.table.headers.email': {
    es: 'Email',
    en: 'Email',
    pt: 'Email'
  },
  'adminUsers.table.headers.role': {
    es: 'Rol',
    en: 'Role',
    pt: 'Papel'
  },
  'adminUsers.table.headers.status': {
    es: 'Estado',
    en: 'Status',
    pt: 'Status'
  },
  'adminUsers.table.headers.registrationDate': {
    es: 'Fecha de Registro',
    en: 'Registration Date',
    pt: 'Data de Registro'
  },
  'adminUsers.table.headers.actions': {
    es: 'Acciones',
    en: 'Actions',
    pt: 'Ações'
  },
  'adminUsers.roles.admin': {
    es: 'Administrador',
    en: 'Administrator',
    pt: 'Administrador'
  },
  'adminUsers.roles.client': {
    es: 'Cliente',
    en: 'Client',
    pt: 'Cliente'
  },
  'adminUsers.roles.delivery': {
    es: 'Repartidor',
    en: 'Delivery',
    pt: 'Entregador'
  },
  'adminUsers.roles.storeManager': {
    es: 'Gestor de Tienda',
    en: 'Store Manager',
    pt: 'Gerente de Loja'
  },
  'adminUsers.status.active': {
    es: 'Activo',
    en: 'Active',
    pt: 'Ativo'
  },
  'adminUsers.status.inactive': {
    es: 'Inactivo',
    en: 'Inactive',
    pt: 'Inativo'
  },
  'adminUsers.status.pending': {
    es: 'Pendiente',
    en: 'Pending',
    pt: 'Pendente'
  },
  'adminUsers.actions.view': {
    es: 'Ver detalles',
    en: 'View details',
    pt: 'Ver detalhes'
  },
  'adminUsers.actions.edit': {
    es: 'Editar',
    en: 'Edit',
    pt: 'Editar'
  },
  'adminUsers.actions.resetPassword': {
    es: 'Resetear contraseña',
    en: 'Reset password',
    pt: 'Redefinir senha'
  },
  'adminUsers.actions.deactivate': {
    es: 'Desactivar',
    en: 'Deactivate',
    pt: 'Desativar'
  },
  'adminUsers.modals.create.title': {
    es: 'Crear Usuario',
    en: 'Create User',
    pt: 'Criar Usuário'
  },
  'adminUsers.modals.edit.title': {
    es: 'Editar Usuario',
    en: 'Edit User',
    pt: 'Editar Usuário'
  },
  'adminUsers.modals.view.title': {
    es: 'Detalles del Usuario',
    en: 'User Details',
    pt: 'Detalhes do Usuário'
  },
  'adminUsers.form.fullName': {
    es: 'Nombre completo',
    en: 'Full name',
    pt: 'Nome completo'
  },
  'adminUsers.form.email': {
    es: 'Email',
    en: 'Email',
    pt: 'Email'
  },
  'adminUsers.form.phone': {
    es: 'Teléfono',
    en: 'Phone',
    pt: 'Telefone'
  },
  'adminUsers.form.role': {
    es: 'Rol',
    en: 'Role',
    pt: 'Papel'
  },
  'adminUsers.form.roleNote': {
    es: 'Los usuarios con roles especiales se crean mediante códigos de referidos',
    en: 'Users with special roles are created through referral codes',
    pt: 'Usuários com papéis especiais são criados através de códigos de referência'
  },
  'adminUsers.form.cancel': {
    es: 'Cancelar',
    en: 'Cancel',
    pt: 'Cancelar'
  },
  'adminUsers.form.create': {
    es: 'Crear Usuario',
    en: 'Create User',
    pt: 'Criar Usuário'
  },
  'adminUsers.form.save': {
    es: 'Guardar Cambios',
    en: 'Save Changes',
    pt: 'Salvar Alterações'
  },
  'adminUsers.form.close': {
    es: 'Cerrar',
    en: 'Close',
    pt: 'Fechar'
  },
  'adminUsers.details.phone': {
    es: 'Teléfono',
    en: 'Phone',
    pt: 'Telefone'
  },
  'adminUsers.details.role': {
    es: 'Rol',
    en: 'Role',
    pt: 'Papel'
  },
  'adminUsers.details.status': {
    es: 'Estado',
    en: 'Status',
    pt: 'Status'
  },
  'adminUsers.details.emailVerified': {
    es: 'Email Verificado',
    en: 'Email Verified',
    pt: 'Email Verificado'
  },
  'adminUsers.details.registrationDate': {
    es: 'Fecha de Registro',
    en: 'Registration Date',
    pt: 'Data de Registro'
  },
  'adminUsers.details.notSpecified': {
    es: 'No especificado',
    en: 'Not specified',
    pt: 'Não especificado'
  },
  'adminUsers.details.yes': {
    es: 'Sí',
    en: 'Yes',
    pt: 'Sim'
  },
  'adminUsers.details.no': {
    es: 'No',
    en: 'No',
    pt: 'Não'
  },
  'adminUsers.details.na': {
    es: 'N/A',
    en: 'N/A',
    pt: 'N/A'
  },
  'adminUsers.confirmations.deactivate': {
    es: '¿Estás seguro de que deseas desactivar este usuario? El usuario no podrá acceder al sistema.',
    en: 'Are you sure you want to deactivate this user? The user will not be able to access the system.',
    pt: 'Tem certeza de que deseja desativar este usuário? O usuário não poderá acessar o sistema.'
  },
  'adminUsers.confirmations.resetPassword': {
    es: '¿Estás seguro de que deseas resetear la contraseña de {userName}? Se enviará un email con una contraseña temporal.',
    en: 'Are you sure you want to reset the password for {userName}? An email will be sent with a temporary password.',
    pt: 'Tem certeza de que deseja redefinir a senha de {userName}? Um email será enviado com uma senha temporária.'
  },
  'adminUsers.messages.userCreated': {
    es: 'Usuario creado exitosamente',
    en: 'User created successfully',
    pt: 'Usuário criado com sucesso'
  },
  'adminUsers.messages.userUpdated': {
    es: 'Usuario actualizado exitosamente',
    en: 'User updated successfully',
    pt: 'Usuário atualizado com sucesso'
  },
  'adminUsers.messages.userDeactivated': {
    es: 'Usuario desactivado correctamente',
    en: 'User deactivated successfully',
    pt: 'Usuário desativado com sucesso'
  },
  'adminUsers.messages.passwordReset': {
    es: 'Contraseña reseteada exitosamente. Se ha enviado un email al usuario con la contraseña temporal.',
    en: 'Password reset successfully. An email has been sent to the user with the temporary password.',
    pt: 'Senha redefinida com sucesso. Um email foi enviado ao usuário com a senha temporária.'
  },
  'adminUsers.errors.loadUsers': {
    es: 'Error al cargar usuarios',
    en: 'Error loading users',
    pt: 'Erro ao carregar usuários'
  },
  'adminUsers.errors.createUser': {
    es: 'Error al crear usuario',
    en: 'Error creating user',
    pt: 'Erro ao criar usuário'
  },
  'adminUsers.errors.updateUser': {
    es: 'Error al actualizar usuario',
    en: 'Error updating user',
    pt: 'Erro ao atualizar usuário'
  },
  'adminUsers.errors.deactivateUser': {
    es: 'Error al desactivar usuario',
    en: 'Error deactivating user',
    pt: 'Erro ao desativar usuário'
  },
  'adminUsers.errors.resetPassword': {
    es: 'Error al resetear contraseña',
    en: 'Error resetting password',
    pt: 'Erro ao redefinir senha'
  },
  'adminUsers.errors.noToken': {
    es: 'No hay token de autenticación',
    en: 'No authentication token',
    pt: 'Sem token de autenticação'
  },

  // ===== ADMIN STORES =====
  'adminStores.title': {
    es: 'Gestión de Tiendas',
    en: 'Store Management',
    pt: 'Gerenciamento de Lojas'
  },
  'adminStores.subtitle': {
    es: 'Administra las tiendas del sistema',
    en: 'Manage system stores',
    pt: 'Gerencie as lojas do sistema'
  },
  'adminStores.createStore': {
    es: 'Crear Tienda',
    en: 'Create Store',
    pt: 'Criar Loja'
  },
  'adminStores.searchPlaceholder': {
    es: 'Buscar tiendas...',
    en: 'Search stores...',
    pt: 'Buscar lojas...'
  },
  'adminStores.filters.allCities': {
    es: 'Todas las ciudades',
    en: 'All cities',
    pt: 'Todas as cidades'
  },
  'adminStores.filters.allStates': {
    es: 'Todos los estados',
    en: 'All states',
    pt: 'Todos os estados'
  },
  'adminStores.filters.allStatuses': {
    es: 'Todos los estados',
    en: 'All statuses',
    pt: 'Todos os status'
  },
  'adminStores.filters.active': {
    es: 'Activas',
    en: 'Active',
    pt: 'Ativas'
  },
  'adminStores.filters.inactive': {
    es: 'Inactivas',
    en: 'Inactive',
    pt: 'Inativas'
  },
  'adminStores.stats.total': {
    es: 'Total',
    en: 'Total',
    pt: 'Total'
  },
  'adminStores.stats.active': {
    es: 'Activas',
    en: 'Active',
    pt: 'Ativas'
  },
  'adminStores.stats.inactive': {
    es: 'Inactivas',
    en: 'Inactive',
    pt: 'Inativas'
  },
  'adminStores.stats.cities': {
    es: 'Ciudades',
    en: 'Cities',
    pt: 'Cidades'
  },
  'adminStores.table.headers.store': {
    es: 'Tienda',
    en: 'Store',
    pt: 'Loja'
  },
  'adminStores.table.headers.location': {
    es: 'Ubicación',
    en: 'Location',
    pt: 'Localização'
  },
  'adminStores.table.headers.contact': {
    es: 'Contacto',
    en: 'Contact',
    pt: 'Contato'
  },
  'adminStores.table.headers.owner': {
    es: 'Propietario',
    en: 'Owner',
    pt: 'Proprietário'
  },
  'adminStores.table.headers.managers': {
    es: 'Managers',
    en: 'Managers',
    pt: 'Gerentes'
  },
  'adminStores.table.headers.status': {
    es: 'Estado',
    en: 'Status',
    pt: 'Status'
  },
  'adminStores.table.headers.actions': {
    es: 'Acciones',
    en: 'Actions',
    pt: 'Ações'
  },
  'adminStores.table.loading': {
    es: 'Cargando tiendas...',
    en: 'Loading stores...',
    pt: 'Carregando lojas...'
  },
  'adminStores.table.noData': {
    es: 'No se encontraron tiendas',
    en: 'No stores found',
    pt: 'Nenhuma loja encontrada'
  },
  'adminStores.table.managersCount': {
    es: 'managers',
    en: 'managers',
    pt: 'gerentes'
  },
  'adminStores.status.active': {
    es: 'Activa',
    en: 'Active',
    pt: 'Ativa'
  },
  'adminStores.status.inactive': {
    es: 'Inactiva',
    en: 'Inactive',
    pt: 'Inativa'
  },
  'adminStores.actions.view': {
    es: 'Ver detalles',
    en: 'View details',
    pt: 'Ver detalhes'
  },
  'adminStores.actions.edit': {
    es: 'Editar',
    en: 'Edit',
    pt: 'Editar'
  },
  'adminStores.actions.manageManagers': {
    es: 'Gestionar managers',
    en: 'Manage managers',
    pt: 'Gerenciar gerentes'
  },
  'adminStores.actions.deactivate': {
    es: 'Desactivar',
    en: 'Deactivate',
    pt: 'Desativar'
  },
  'adminStores.pagination.showing': {
    es: 'Mostrando',
    en: 'Showing',
    pt: 'Mostrando'
  },
  'adminStores.pagination.to': {
    es: 'a',
    en: 'to',
    pt: 'a'
  },
  'adminStores.pagination.of': {
    es: 'de',
    en: 'of',
    pt: 'de'
  },
  'adminStores.pagination.results': {
    es: 'resultados',
    en: 'results',
    pt: 'resultados'
  },
  'adminStores.pagination.previous': {
    es: 'Anterior',
    en: 'Previous',
    pt: 'Anterior'
  },
  'adminStores.pagination.next': {
    es: 'Siguiente',
    en: 'Next',
    pt: 'Próximo'
  },
  'adminStores.modals.create.title': {
    es: 'Crear Nueva Tienda',
    en: 'Create New Store',
    pt: 'Criar Nova Loja'
  },
  'adminStores.modals.edit.title': {
    es: 'Editar Tienda',
    en: 'Edit Store',
    pt: 'Editar Loja'
  },
  'adminStores.modals.view.title': {
    es: 'Detalles de la Tienda',
    en: 'Store Details',
    pt: 'Detalhes da Loja'
  },
  'adminStores.modals.managers.title': {
    es: 'Gestionar Managers',
    en: 'Manage Managers',
    pt: 'Gerenciar Gerentes'
  },
  'adminStores.form.storeName': {
    es: 'Nombre de la tienda *',
    en: 'Store name *',
    pt: 'Nome da loja *'
  },
  'adminStores.form.storeNamePlaceholder': {
    es: 'Nombre de la tienda',
    en: 'Store name',
    pt: 'Nome da loja'
  },
  'adminStores.form.email': {
    es: 'Email *',
    en: 'Email *',
    pt: 'Email *'
  },
  'adminStores.form.description': {
    es: 'Descripción *',
    en: 'Description *',
    pt: 'Descrição *'
  },
  'adminStores.form.descriptionPlaceholder': {
    es: 'Descripción',
    en: 'Description',
    pt: 'Descrição'
  },
  'adminStores.form.location': {
    es: 'Ubicación de la Tienda *',
    en: 'Store Location *',
    pt: 'Localização da Loja *'
  },
  'adminStores.form.locationSelected': {
    es: 'Ubicación seleccionada:',
    en: 'Selected location:',
    pt: 'Localização selecionada:'
  },
  'adminStores.form.address': {
    es: 'Dirección *',
    en: 'Address *',
    pt: 'Endereço *'
  },
  'adminStores.form.addressPlaceholder': {
    es: 'Dirección',
    en: 'Address',
    pt: 'Endereço'
  },
  'adminStores.form.city': {
    es: 'Ciudad *',
    en: 'City *',
    pt: 'Cidade *'
  },
  'adminStores.form.cityPlaceholder': {
    es: 'Ciudad',
    en: 'City',
    pt: 'Cidade'
  },
  'adminStores.form.state': {
    es: 'Estado *',
    en: 'State *',
    pt: 'Estado *'
  },
  'adminStores.form.statePlaceholder': {
    es: 'Estado',
    en: 'State',
    pt: 'Estado'
  },
  'adminStores.form.zipCode': {
    es: 'Código Postal *',
    en: 'Zip Code *',
    pt: 'Código Postal *'
  },
  'adminStores.form.zipCodePlaceholder': {
    es: 'Código Postal',
    en: 'Zip Code',
    pt: 'Código Postal'
  },
  'adminStores.form.phone': {
    es: 'Teléfono *',
    en: 'Phone *',
    pt: 'Telefone *'
  },
  'adminStores.form.phonePlaceholder': {
    es: 'Teléfono',
    en: 'Phone',
    pt: 'Telefone'
  },
  'adminStores.form.website': {
    es: 'Sitio web (opcional)',
    en: 'Website (optional)',
    pt: 'Site web (opcional)'
  },
  'adminStores.form.websitePlaceholder': {
    es: 'Sitio web (opcional)',
    en: 'Website (optional)',
    pt: 'Site web (opcional)'
  },
  'adminStores.form.cancel': {
    es: 'Cancelar',
    en: 'Cancel',
    pt: 'Cancelar'
  },
  'adminStores.form.create': {
    es: 'Crear',
    en: 'Create',
    pt: 'Criar'
  },
  'adminStores.form.update': {
    es: 'Actualizar',
    en: 'Update',
    pt: 'Atualizar'
  },
  'adminStores.form.close': {
    es: 'Cerrar',
    en: 'Close',
    pt: 'Fechar'
  },
  'adminStores.details.name': {
    es: 'Nombre:',
    en: 'Name:',
    pt: 'Nome:'
  },
  'adminStores.details.description': {
    es: 'Descripción:',
    en: 'Description:',
    pt: 'Descrição:'
  },
  'adminStores.details.noDescription': {
    es: 'Sin descripción',
    en: 'No description',
    pt: 'Sem descrição'
  },
  'adminStores.details.address': {
    es: 'Dirección:',
    en: 'Address:',
    pt: 'Endereço:'
  },
  'adminStores.details.contact': {
    es: 'Contacto:',
    en: 'Contact:',
    pt: 'Contato:'
  },
  'adminStores.details.owner': {
    es: 'Propietario:',
    en: 'Owner:',
    pt: 'Proprietário:'
  },
  'adminStores.details.managers': {
    es: 'Managers:',
    en: 'Managers:',
    pt: 'Gerentes:'
  },
  'adminStores.details.status': {
    es: 'Estado:',
    en: 'Status:',
    pt: 'Status:'
  },
  'adminStores.details.settings': {
    es: 'Configuración:',
    en: 'Settings:',
    pt: 'Configurações:'
  },
  'adminStores.details.currency': {
    es: 'Moneda:',
    en: 'Currency:',
    pt: 'Moeda:'
  },
  'adminStores.details.taxRate': {
    es: 'IVA:',
    en: 'Tax Rate:',
    pt: 'IVA:'
  },
  'adminStores.details.deliveryRadius': {
    es: 'Radio de entrega:',
    en: 'Delivery radius:',
    pt: 'Raio de entrega:'
  },
  'adminStores.details.km': {
    es: 'km',
    en: 'km',
    pt: 'km'
  },
  'adminStores.managers.addManager': {
    es: 'Agregar Manager',
    en: 'Add Manager',
    pt: 'Adicionar Gerente'
  },
  'adminStores.managers.userEmail': {
    es: 'Email del usuario',
    en: 'User email',
    pt: 'Email do usuário'
  },
  'adminStores.managers.add': {
    es: 'Agregar',
    en: 'Add',
    pt: 'Adicionar'
  },
  'adminStores.managers.currentManagers': {
    es: 'Managers Actuales',
    en: 'Current Managers',
    pt: 'Gerentes Atuais'
  },
  'adminStores.managers.noManagers': {
    es: 'No hay managers asignados',
    en: 'No managers assigned',
    pt: 'Nenhum gerente atribuído'
  },
  'adminStores.managers.remove': {
    es: 'Remover manager',
    en: 'Remove manager',
    pt: 'Remover gerente'
  },
  'adminStores.confirmations.deactivate': {
    es: '¿Estás seguro de que deseas desactivar esta tienda?',
    en: 'Are you sure you want to deactivate this store?',
    pt: 'Tem certeza de que deseja desativar esta loja?'
  },
  'adminStores.confirmations.removeManager': {
    es: '¿Estás seguro de que deseas remover este manager?',
    en: 'Are you sure you want to remove this manager?',
    pt: 'Tem certeza de que deseja remover este gerente?'
  },
  'adminStores.messages.storeCreated': {
    es: 'Tienda creada exitosamente',
    en: 'Store created successfully',
    pt: 'Loja criada com sucesso'
  },
  'adminStores.messages.storeUpdated': {
    es: 'Tienda actualizada exitosamente',
    en: 'Store updated successfully',
    pt: 'Loja atualizada com sucesso'
  },
  'adminStores.messages.storeDeactivated': {
    es: 'Tienda desactivada exitosamente',
    en: 'Store deactivated successfully',
    pt: 'Loja desativada com sucesso'
  },
  'adminStores.messages.managerAdded': {
    es: 'Manager agregado exitosamente',
    en: 'Manager added successfully',
    pt: 'Gerente adicionado com sucesso'
  },
  'adminStores.messages.managerRemoved': {
    es: 'Manager removido exitosamente',
    en: 'Manager removed successfully',
    pt: 'Gerente removido com sucesso'
  },
  'adminStores.errors.loadStores': {
    es: 'Error al cargar tiendas',
    en: 'Error loading stores',
    pt: 'Erro ao carregar lojas'
  },
  'adminStores.errors.createStore': {
    es: 'Error al crear tienda',
    en: 'Error creating store',
    pt: 'Erro ao criar loja'
  },
  'adminStores.errors.updateStore': {
    es: 'Error al actualizar tienda',
    en: 'Error updating store',
    pt: 'Erro ao atualizar loja'
  },
  'adminStores.errors.deactivateStore': {
    es: 'Error al desactivar tienda',
    en: 'Error deactivating store',
    pt: 'Erro ao desativar loja'
  },
  'adminStores.errors.addManager': {
    es: 'Error al agregar manager',
    en: 'Error adding manager',
    pt: 'Erro ao adicionar gerente'
  },
  'adminStores.errors.removeManager': {
    es: 'Error al remover manager',
    en: 'Error removing manager',
    pt: 'Erro ao remover gerente'
  },
  'adminStores.errors.connection': {
    es: 'Error de conexión',
    en: 'Connection error',
    pt: 'Erro de conexão'
  },
  'adminStores.errors.locationRequired': {
    es: 'Por favor selecciona la ubicación de la tienda en el mapa',
    en: 'Please select the store location on the map',
    pt: 'Por favor selecione a localização da loja no mapa'
  },
  'adminStores.errors.requiredFields': {
    es: 'Los campos nombre, dirección, ciudad, estado, código postal, teléfono y email son obligatorios',
    en: 'The fields name, address, city, state, zip code, phone and email are required',
    pt: 'Os campos nome, endereço, cidade, estado, código postal, telefone e email são obrigatórios'
  },
  'adminStores.access.denied': {
    es: 'Acceso Denegado',
    en: 'Access Denied',
    pt: 'Acesso Negado'
  },
  'adminStores.access.noPermissions': {
    es: 'No tienes permisos para acceder a esta página.',
    en: 'You do not have permissions to access this page.',
    pt: 'Você não tem permissões para acessar esta página.'
  },

  // ===== ADMIN PRODUCTS =====
  'adminProducts.title': {
    es: 'Gestión de Productos',
    en: 'Product Management',
    pt: 'Gerenciamento de Produtos'
  },
  'adminProducts.subtitle': {
    es: 'Administra el catálogo de productos',
    en: 'Manage the product catalog',
    pt: 'Gerencie o catálogo de produtos'
  },
  'adminProducts.createProduct': {
    es: 'Agregar Producto',
    en: 'Add Product',
    pt: 'Adicionar Produto'
  },
  'adminProducts.importCSV': {
    es: 'Importar CSV',
    en: 'Import CSV',
    pt: 'Importar CSV'
  },
  'adminProducts.searchPlaceholder': {
    es: 'Buscar productos...',
    en: 'Search products...',
    pt: 'Buscar produtos...'
  },
  'adminProducts.allCategories': {
    es: 'Todas las categorías',
    en: 'All categories',
    pt: 'Todas as categorias'
  },
  'adminProducts.allStores': {
    es: 'Todas las tiendas',
    en: 'All stores',
    pt: 'Todas as lojas'
  },
  'adminProducts.allStatuses': {
    es: 'Todos los estados',
    en: 'All statuses',
    pt: 'Todos os status'
  },
  'adminProducts.active': {
    es: 'Activos',
    en: 'Active',
    pt: 'Ativos'
  },
  'adminProducts.inactive': {
    es: 'Inactivos',
    en: 'Inactive',
    pt: 'Inativos'
  },
  'adminProducts.stats.total': {
    es: 'Total',
    en: 'Total',
    pt: 'Total'
  },
  'adminProducts.stats.active': {
    es: 'Activos',
    en: 'Active',
    pt: 'Ativos'
  },
  'adminProducts.stats.featured': {
    es: 'Destacados',
    en: 'Featured',
    pt: 'Destaques'
  },
  'adminProducts.stats.lowStock': {
    es: 'Stock Bajo',
    en: 'Low Stock',
    pt: 'Estoque Baixo'
  },
  'adminProducts.stats.outOfStock': {
    es: 'Sin Stock',
    en: 'Out of Stock',
    pt: 'Sem Estoque'
  },
  'adminProducts.table.product': {
    es: 'Producto',
    en: 'Product',
    pt: 'Produto'
  },
  'adminProducts.table.store': {
    es: 'Tienda',
    en: 'Store',
    pt: 'Loja'
  },
  'adminProducts.table.category': {
    es: 'Categoría',
    en: 'Category',
    pt: 'Categoria'
  },
  'adminProducts.table.sku': {
    es: 'SKU',
    en: 'SKU',
    pt: 'SKU'
  },
  'adminProducts.table.price': {
    es: 'Precio',
    en: 'Price',
    pt: 'Preço'
  },
  'adminProducts.table.stock': {
    es: 'Stock',
    en: 'Stock',
    pt: 'Estoque'
  },
  'adminProducts.table.status': {
    es: 'Estado',
    en: 'Status',
    pt: 'Status'
  },
  'adminProducts.table.actions': {
    es: 'Acciones',
    en: 'Actions',
    pt: 'Ações'
  },
  'adminProducts.loading': {
    es: 'Cargando productos...',
    en: 'Loading products...',
    pt: 'Carregando produtos...'
  },
  'adminProducts.noProducts': {
    es: 'No se encontraron productos',
    en: 'No products found',
    pt: 'Nenhum produto encontrado'
  },
  'adminProducts.status.active': {
    es: 'Activo',
    en: 'Active',
    pt: 'Ativo'
  },
  'adminProducts.status.inactive': {
    es: 'Inactivo',
    en: 'Inactive',
    pt: 'Inativo'
  },
  'adminProducts.actions.viewDetails': {
    es: 'Ver detalles',
    en: 'View details',
    pt: 'Ver detalhes'
  },
  'adminProducts.actions.edit': {
    es: 'Editar',
    en: 'Edit',
    pt: 'Editar'
  },
  'adminProducts.actions.deactivate': {
    es: 'Desactivar',
    en: 'Deactivate',
    pt: 'Desativar'
  },
  'adminProducts.pagination.showing': {
    es: 'Mostrando {{start}} a {{end}} de {{total}} resultados',
    en: 'Showing {{start}} to {{end}} of {{total}} results',
    pt: 'Mostrando {{start}} a {{end}} de {{total}} resultados'
  },
  'adminProducts.pagination.to': {
    es: 'a',
    en: 'to',
    pt: 'a'
  },
  'adminProducts.pagination.of': {
    es: 'de',
    en: 'of',
    pt: 'de'
  },
  'adminProducts.pagination.results': {
    es: 'resultados',
    en: 'results',
    pt: 'resultados'
  },
  'adminProducts.pagination.previous': {
    es: 'Anterior',
    en: 'Previous',
    pt: 'Anterior'
  },
  'adminProducts.pagination.next': {
    es: 'Siguiente',
    en: 'Next',
    pt: 'Próximo'
  },
  'adminProducts.modals.create.title': {
    es: 'Crear Nuevo Producto',
    en: 'Create New Product',
    pt: 'Criar Novo Produto'
  },
  'adminProducts.modals.edit.title': {
    es: 'Editar Producto',
    en: 'Edit Product',
    pt: 'Editar Produto'
  },
  'adminProducts.modals.view.title': {
    es: 'Detalles del Producto',
    en: 'Product Details',
    pt: 'Detalhes do Produto'
  },
  'adminProducts.modals.import.title': {
    es: 'Importar Productos desde CSV',
    en: 'Import Products from CSV',
    pt: 'Importar Produtos do CSV'
  },
  'adminProducts.modals.selectStore': {
    es: 'Seleccionar tienda',
    en: 'Select store',
    pt: 'Selecionar loja'
  },
  'adminProducts.modals.productName': {
    es: 'Nombre del producto',
    en: 'Product name',
    pt: 'Nome do produto'
  },
  'adminProducts.modals.description': {
    es: 'Descripción',
    en: 'Description',
    pt: 'Descrição'
  },
  'adminProducts.modals.price': {
    es: 'Precio',
    en: 'Price',
    pt: 'Preço'
  },
  'adminProducts.modals.category': {
    es: 'Categoría',
    en: 'Category',
    pt: 'Categoria'
  },
  'adminProducts.modals.sku': {
    es: 'SKU',
    en: 'SKU',
    pt: 'SKU'
  },
  'adminProducts.modals.stock': {
    es: 'Stock',
    en: 'Stock',
    pt: 'Estoque'
  },
  'adminProducts.modals.featured': {
    es: 'Producto destacado',
    en: 'Featured product',
    pt: 'Produto em destaque'
  },
  'adminProducts.modals.cancel': {
    es: 'Cancelar',
    en: 'Cancel',
    pt: 'Cancelar'
  },
  'adminProducts.modals.create': {
    es: 'Crear',
    en: 'Create',
    pt: 'Criar'
  },
  'adminProducts.modals.update': {
    es: 'Actualizar',
    en: 'Update',
    pt: 'Atualizar'
  },
  'adminProducts.modals.close': {
    es: 'Cerrar',
    en: 'Close',
    pt: 'Fechar'
  },
  'adminProducts.modals.clickToSelect': {
    es: 'Haz clic para seleccionar archivo CSV',
    en: 'Click to select CSV file',
    pt: 'Clique para selecionar arquivo CSV'
  },
  'adminProducts.modals.requiredFormat': {
    es: 'Formato requerido:',
    en: 'Required format:',
    pt: 'Formato obrigatório:'
  },
  'adminProducts.modals.importing': {
    es: 'Importando...',
    en: 'Importing...',
    pt: 'Importando...'
  },
  'adminProducts.modals.import': {
    es: 'Importar',
    en: 'Import',
    pt: 'Importar'
  },
  'adminProducts.modals.importCompleted': {
    es: 'Importación completada:',
    en: 'Import completed:',
    pt: 'Importação concluída:'
  },
  'adminProducts.modals.successful': {
    es: 'exitosos',
    en: 'successful',
    pt: 'bem-sucedidos'
  },
  'adminProducts.modals.errors': {
    es: 'errores',
    en: 'errors',
    pt: 'erros'
  },
  'adminProducts.messages.productCreated': {
    es: 'Producto creado exitosamente',
    en: 'Product created successfully',
    pt: 'Produto criado com sucesso'
  },
  'adminProducts.messages.productUpdated': {
    es: 'Producto actualizado exitosamente',
    en: 'Product updated successfully',
    pt: 'Produto atualizado com sucesso'
  },
  'adminProducts.messages.productDeactivated': {
    es: 'Producto desactivado exitosamente',
    en: 'Product deactivated successfully',
    pt: 'Produto desativado com sucesso'
  },
  'adminProducts.messages.importSuccess': {
    es: 'Importación completada.',
    en: 'Import completed.',
    pt: 'Importação concluída.'
  },
  'adminProducts.errors.connection': {
    es: 'Error de conexión',
    en: 'Connection error',
    pt: 'Erro de conexão'
  },
  'adminProducts.errors.creatingProduct': {
    es: 'Error creando producto',
    en: 'Error creating product',
    pt: 'Erro ao criar produto'
  },
  'adminProducts.errors.updatingProduct': {
    es: 'Error actualizando producto',
    en: 'Error updating product',
    pt: 'Erro ao atualizar produto'
  },
  'adminProducts.errors.deactivatingProduct': {
    es: 'Error desactivando producto',
    en: 'Error deactivating product',
    pt: 'Erro ao desativar produto'
  },
  'adminProducts.errors.importingProducts': {
    es: 'Error importando productos',
    en: 'Error importing products',
    pt: 'Erro ao importar produtos'
  },
  'adminProducts.errors.selectCSV': {
    es: 'Por favor selecciona un archivo CSV',
    en: 'Please select a CSV file',
    pt: 'Por favor selecione um arquivo CSV'
  },
  'adminProducts.errors.selectStore': {
    es: 'Por favor selecciona una tienda',
    en: 'Please select a store',
    pt: 'Por favor selecione uma loja'
  },
  'adminProducts.confirm.delete': {
    es: '¿Estás seguro de que deseas desactivar este producto?',
    en: 'Are you sure you want to deactivate this product?',
    pt: 'Tem certeza de que deseja desativar este produto?'
  },
  'adminProducts.access.noPermissions': {
    es: 'No tienes permisos para acceder a esta página.',
    en: 'You do not have permissions to access this page.',
    pt: 'Você não tem permissões para acessar esta página.'
  },

  // ===== ADMIN CATEGORIES =====
  'adminCategories.title': {
    es: 'Gestión de Categorías',
    en: 'Category Management',
    pt: 'Gerenciamento de Categorias'
  },
  'adminCategories.subtitle': {
    es: 'Organiza los productos por categorías y subcategorías',
    en: 'Organize products by categories and subcategories',
    pt: 'Organize produtos por categorias e subcategorias'
  },
  'adminCategories.newCategory': {
    es: 'Nueva Categoría',
    en: 'New Category',
    pt: 'Nova Categoria'
  },
  'adminCategories.searchPlaceholder': {
    es: 'Buscar categorías...',
    en: 'Search categories...',
    pt: 'Buscar categorias...'
  },
  'adminCategories.allStatuses': {
    es: 'Todos los estados',
    en: 'All statuses',
    pt: 'Todos os status'
  },
  'adminCategories.active': {
    es: 'Activas',
    en: 'Active',
    pt: 'Ativas'
  },
  'adminCategories.inactive': {
    es: 'Inactivas',
    en: 'Inactive',
    pt: 'Inativas'
  },
  'adminCategories.stats.total': {
    es: 'Total',
    en: 'Total',
    pt: 'Total'
  },
  'adminCategories.stats.active': {
    es: 'Activas',
    en: 'Active',
    pt: 'Ativas'
  },
  'adminCategories.stats.inactive': {
    es: 'Inactivas',
    en: 'Inactive',
    pt: 'Inativas'
  },
  'adminCategories.stats.withProducts': {
    es: 'Con Productos',
    en: 'With Products',
    pt: 'Com Produtos'
  },
  'adminCategories.order': {
    es: 'Orden',
    en: 'Order',
    pt: 'Ordem'
  },
  'adminCategories.products': {
    es: 'Productos',
    en: 'Products',
    pt: 'Produtos'
  },
  'adminCategories.status.active': {
    es: 'Activa',
    en: 'Active',
    pt: 'Ativa'
  },
  'adminCategories.status.inactive': {
    es: 'Inactiva',
    en: 'Inactive',
    pt: 'Inativa'
  },
  'adminCategories.actions.viewDetails': {
    es: 'Ver detalles',
    en: 'View details',
    pt: 'Ver detalhes'
  },
  'adminCategories.actions.edit': {
    es: 'Editar',
    en: 'Edit',
    pt: 'Editar'
  },
  'adminCategories.actions.activate': {
    es: 'Activar',
    en: 'Activate',
    pt: 'Ativar'
  },
  'adminCategories.actions.deactivate': {
    es: 'Desactivar',
    en: 'Deactivate',
    pt: 'Desativar'
  },
  'adminCategories.actions.delete': {
    es: 'Eliminar',
    en: 'Delete',
    pt: 'Excluir'
  },
  'adminCategories.loading': {
    es: 'Cargando categorías...',
    en: 'Loading categories...',
    pt: 'Carregando categorias...'
  },
  'adminCategories.noCategories': {
    es: 'No se encontraron categorías',
    en: 'No categories found',
    pt: 'Nenhuma categoria encontrada'
  },
  'adminCategories.createFirst': {
    es: 'Crea tu primera categoría para empezar',
    en: 'Create your first category to get started',
    pt: 'Crie sua primeira categoria para começar'
  },
  'adminCategories.modals.create.title': {
    es: 'Crear Nueva Categoría',
    en: 'Create New Category',
    pt: 'Criar Nova Categoria'
  },
  'adminCategories.modals.edit.title': {
    es: 'Editar Categoría',
    en: 'Edit Category',
    pt: 'Editar Categoria'
  },
  'adminCategories.modals.view.title': {
    es: 'Detalles de la Categoría',
    en: 'Category Details',
    pt: 'Detalhes da Categoria'
  },
  'adminCategories.modals.name': {
    es: 'Nombre',
    en: 'Name',
    pt: 'Nome'
  },
  'adminCategories.modals.namePlaceholder': {
    es: 'Nombre de la categoría',
    en: 'Category name',
    pt: 'Nome da categoria'
  },
  'adminCategories.modals.description': {
    es: 'Descripción',
    en: 'Description',
    pt: 'Descrição'
  },
  'adminCategories.modals.descriptionPlaceholder': {
    es: 'Descripción de la categoría',
    en: 'Category description',
    pt: 'Descrição da categoria'
  },
  'adminCategories.modals.imageUrl': {
    es: 'URL de imagen (opcional)',
    en: 'Image URL (optional)',
    pt: 'URL da imagem (opcional)'
  },
  'adminCategories.modals.imagePlaceholder': {
    es: 'https://ejemplo.com/imagen.jpg',
    en: 'https://example.com/image.jpg',
    pt: 'https://exemplo.com/imagem.jpg'
  },
  'adminCategories.modals.parentCategory': {
    es: 'Categoría padre (opcional)',
    en: 'Parent category (optional)',
    pt: 'Categoria pai (opcional)'
  },
  'adminCategories.modals.noParent': {
    es: 'Sin categoría padre',
    en: 'No parent category',
    pt: 'Sem categoria pai'
  },
  'adminCategories.modals.order': {
    es: 'Orden',
    en: 'Order',
    pt: 'Ordem'
  },
  'adminCategories.modals.cancel': {
    es: 'Cancelar',
    en: 'Cancel',
    pt: 'Cancelar'
  },
  'adminCategories.modals.create': {
    es: 'Crear',
    en: 'Create',
    pt: 'Criar'
  },
  'adminCategories.modals.update': {
    es: 'Actualizar',
    en: 'Update',
    pt: 'Atualizar'
  },
  'adminCategories.modals.close': {
    es: 'Cerrar',
    en: 'Close',
    pt: 'Fechar'
  },
  'adminCategories.modals.parentCategoryName': {
    es: 'Categoría padre:',
    en: 'Parent category:',
    pt: 'Categoria pai:'
  },
  'adminCategories.modals.created': {
    es: 'Creada:',
    en: 'Created:',
    pt: 'Criada:'
  },
  'adminCategories.messages.categoryCreated': {
    es: 'Categoría creada exitosamente',
    en: 'Category created successfully',
    pt: 'Categoria criada com sucesso'
  },
  'adminCategories.messages.categoryUpdated': {
    es: 'Categoría actualizada exitosamente',
    en: 'Category updated successfully',
    pt: 'Categoria atualizada com sucesso'
  },
  'adminCategories.messages.categoryDeleted': {
    es: 'Categoría eliminada exitosamente',
    en: 'Category deleted successfully',
    pt: 'Categoria excluída com sucesso'
  },
  'adminCategories.messages.statusUpdated': {
    es: 'Estado de categoría actualizado exitosamente',
    en: 'Category status updated successfully',
    pt: 'Status da categoria atualizado com sucesso'
  },
  'adminCategories.errors.connection': {
    es: 'Error de conexión',
    en: 'Connection error',
    pt: 'Erro de conexão'
  },
  'adminCategories.errors.creatingCategory': {
    es: 'Error creando categoría',
    en: 'Error creating category',
    pt: 'Erro ao criar categoria'
  },
  'adminCategories.errors.updatingCategory': {
    es: 'Error actualizando categoría',
    en: 'Error updating category',
    pt: 'Erro ao atualizar categoria'
  },
  'adminCategories.errors.deletingCategory': {
    es: 'Error eliminando categoría',
    en: 'Error deleting category',
    pt: 'Erro ao excluir categoria'
  },
  'adminCategories.errors.updatingStatus': {
    es: 'Error actualizando estado',
    en: 'Error updating status',
    pt: 'Erro ao atualizar status'
  },
  'adminCategories.errors.requiredFields': {
    es: 'Los campos nombre y descripción son obligatorios',
    en: 'Name and description fields are required',
    pt: 'Os campos nome e descrição são obrigatórios'
  },
  'adminCategories.confirm.delete': {
    es: '¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer.',
    en: 'Are you sure you want to delete this category? This action cannot be undone.',
    pt: 'Tem certeza de que deseja excluir esta categoria? Esta ação não pode ser desfeita.'
  },
  'adminCategories.access.noPermissions': {
    es: 'No tienes permisos para acceder a esta página.',
    en: 'You do not have permissions to access this page.',
    pt: 'Você não tem permissões para acessar esta página.'
  },
  'adminCategories.newCategoryButton': {
    es: 'Nueva Categoría',
    en: 'New Category',
    pt: 'Nova Categoria'
  },
  'adminCategories.statusFilter.all': {
    es: 'Todos los estados',
    en: 'All statuses',
    pt: 'Todos os status'
  },
  'adminCategories.statusFilter.active': {
    es: 'Activas',
    en: 'Active',
    pt: 'Ativas'
  },
  'adminCategories.statusFilter.inactive': {
    es: 'Inactivas',
    en: 'Inactive',
    pt: 'Inativas'
  },
  'adminCategories.categoryList.order': {
    es: 'Orden',
    en: 'Order',
    pt: 'Ordem'
  },
  'adminCategories.categoryList.products': {
    es: 'Productos',
    en: 'Products',
    pt: 'Produtos'
  },
  'adminCategories.categoryList.active': {
    es: 'Activa',
    en: 'Active',
    pt: 'Ativa'
  },
  'adminCategories.categoryList.inactive': {
    es: 'Inactiva',
    en: 'Inactive',
    pt: 'Inativa'
  },
  'adminCategories.categoryList.viewDetails': {
    es: 'Ver detalles',
    en: 'View details',
    pt: 'Ver detalhes'
  },
  'adminCategories.categoryList.edit': {
    es: 'Editar',
    en: 'Edit',
    pt: 'Editar'
  },
  'adminCategories.categoryList.activate': {
    es: 'Activar',
    en: 'Activate',
    pt: 'Ativar'
  },
  'adminCategories.categoryList.deactivate': {
    es: 'Desactivar',
    en: 'Deactivate',
    pt: 'Desativar'
  },
  'adminCategories.categoryList.delete': {
    es: 'Eliminar',
    en: 'Delete',
    pt: 'Excluir'
  },
  'adminCategories.loadingCategories': {
    es: 'Cargando categorías...',
    en: 'Loading categories...',
    pt: 'Carregando categorias...'
  },
  'adminCategories.noCategoriesFound': {
    es: 'No se encontraron categorías',
    en: 'No categories found',
    pt: 'Nenhuma categoria encontrada'
  },
  'adminCategories.createFirstCategory': {
    es: 'Crea tu primera categoría para empezar',
    en: 'Create your first category to get started',
    pt: 'Crie sua primeira categoria para começar'
  },
  'adminCategories.delete.confirm': {
    es: '¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer.',
    en: 'Are you sure you want to delete this category? This action cannot be undone.',
    pt: 'Tem certeza de que deseja excluir esta categoria? Esta ação não pode ser desfeita.'
  },
  'adminCategories.accessDenied.title': {
    es: 'Acceso Denegado',
    en: 'Access Denied',
    pt: 'Acesso Negado'
  },
  'adminCategories.accessDenied.message': {
    es: 'No tienes permisos para acceder a esta página.',
    en: 'You do not have permissions to access this page.',
    pt: 'Você não tem permissões para acessar esta página.'
  },
  'adminCategories.createModal.title': {
    es: 'Crear Nueva Categoría',
    en: 'Create New Category',
    pt: 'Criar Nova Categoria'
  },
  'adminCategories.createModal.name': {
    es: 'Nombre',
    en: 'Name',
    pt: 'Nome'
  },
  'adminCategories.createModal.namePlaceholder': {
    es: 'Nombre de la categoría',
    en: 'Category name',
    pt: 'Nome da categoria'
  },
  'adminCategories.createModal.description': {
    es: 'Descripción',
    en: 'Description',
    pt: 'Descrição'
  },
  'adminCategories.createModal.descriptionPlaceholder': {
    es: 'Descripción de la categoría',
    en: 'Category description',
    pt: 'Descrição da categoria'
  },
  'adminCategories.createModal.imageUrlPlaceholder': {
    es: 'https://ejemplo.com/imagen.jpg',
    en: 'https://example.com/image.jpg',
    pt: 'https://exemplo.com/imagem.jpg'
  },
  'adminCategories.createModal.parentCategoryOptional': {
    es: 'Categoría padre (opcional)',
    en: 'Parent category (optional)',
    pt: 'Categoria pai (opcional)'
  },
  'adminCategories.createModal.noParentCategory': {
    es: 'Sin categoría padre',
    en: 'No parent category',
    pt: 'Sem categoria pai'
  },
  'adminCategories.createModal.order': {
    es: 'Orden',
    en: 'Order',
    pt: 'Ordem'
  },
  'adminCategories.createModal.cancel': {
    es: 'Cancelar',
    en: 'Cancel',
    pt: 'Cancelar'
  },
  'adminCategories.createModal.create': {
    es: 'Crear',
    en: 'Create',
    pt: 'Criar'
  },
  'adminCategories.editModal.title': {
    es: 'Editar Categoría',
    en: 'Edit Category',
    pt: 'Editar Categoria'
  },
  'adminCategories.editModal.name': {
    es: 'Nombre',
    en: 'Name',
    pt: 'Nome'
  },
  'adminCategories.editModal.namePlaceholder': {
    es: 'Nombre de la categoría',
    en: 'Category name',
    pt: 'Nome da categoria'
  },
  'adminCategories.editModal.description': {
    es: 'Descripción',
    en: 'Description',
    pt: 'Descrição'
  },
  'adminCategories.editModal.descriptionPlaceholder': {
    es: 'Descripción de la categoría',
    en: 'Category description',
    pt: 'Descrição da categoria'
  },
  'adminCategories.editModal.imageUrlOptional': {
    es: 'URL de imagen (opcional)',
    en: 'Image URL (optional)',
    pt: 'URL da imagem (opcional)'
  },
  'adminCategories.editModal.imageUrlPlaceholder': {
    es: 'https://ejemplo.com/imagen.jpg',
    en: 'https://example.com/image.jpg',
    pt: 'https://exemplo.com/imagem.jpg'
  },
  'adminCategories.editModal.parentCategoryOptional': {
    es: 'Categoría padre (opcional)',
    en: 'Parent category (optional)',
    pt: 'Categoria pai (opcional)'
  },
  'adminCategories.editModal.noParentCategory': {
    es: 'Sin categoría padre',
    en: 'No parent category',
    pt: 'Sem categoria pai'
  },
  'adminCategories.editModal.order': {
    es: 'Orden',
    en: 'Order',
    pt: 'Ordem'
  },
  'adminCategories.editModal.cancel': {
    es: 'Cancelar',
    en: 'Cancel',
    pt: 'Cancelar'
  },
  'adminCategories.editModal.update': {
    es: 'Actualizar',
    en: 'Update',
    pt: 'Atualizar'
  },
  'adminCategories.viewModal.title': {
    es: 'Detalles de la Categoría',
    en: 'Category Details',
    pt: 'Detalhes da Categoria'
  },
  'adminCategories.viewModal.name': {
    es: 'Nombre',
    en: 'Name',
    pt: 'Nome'
  },
  'adminCategories.viewModal.description': {
    es: 'Descripción',
    en: 'Description',
    pt: 'Descrição'
  },
  'adminCategories.viewModal.image': {
    es: 'Imagen',
    en: 'Image',
    pt: 'Imagem'
  },
  'adminCategories.viewModal.parentCategory': {
    es: 'Categoría padre',
    en: 'Parent category',
    pt: 'Categoria pai'
  },
  'adminCategories.viewModal.noParentCategory': {
    es: 'Sin categoría padre',
    en: 'No parent category',
    pt: 'Sem categoria pai'
  },
  'adminCategories.viewModal.order': {
    es: 'Orden',
    en: 'Order',
    pt: 'Ordem'
  },
  'adminCategories.viewModal.status': {
    es: 'Estado',
    en: 'Status',
    pt: 'Status'
  },
  'adminCategories.viewModal.active': {
    es: 'Activa',
    en: 'Active',
    pt: 'Ativa'
  },
  'adminCategories.viewModal.inactive': {
    es: 'Inactiva',
    en: 'Inactive',
    pt: 'Inativa'
  },
  'adminCategories.viewModal.products': {
    es: 'Productos',
    en: 'Products',
    pt: 'Produtos'
  },
  'adminCategories.viewModal.createdAt': {
    es: 'Creada',
    en: 'Created',
    pt: 'Criada'
  },
  'adminCategories.viewModal.close': {
    es: 'Cerrar',
    en: 'Close',
    pt: 'Fechar'
  },
  'adminCategories.errors.createError': {
    es: 'Error al crear la categoría',
    en: 'Error creating category',
    pt: 'Erro ao criar categoria'
  },
  'adminCategories.errors.updateError': {
    es: 'Error al actualizar la categoría',
    en: 'Error updating category',
    pt: 'Erro ao atualizar categoria'
  },
  'adminCategories.errors.deleteError': {
    es: 'Error al eliminar la categoría',
    en: 'Error deleting category',
    pt: 'Erro ao excluir categoria'
  },
  'adminCategories.errors.statusUpdateError': {
    es: 'Error al actualizar el estado',
    en: 'Error updating status',
    pt: 'Erro ao atualizar status'
  },

  // ===== FORMULARIO DE PRODUCTOS =====
  'productForm.createTitle': {
    es: 'Crear Nuevo Producto',
    en: 'Create New Product',
    pt: 'Criar Novo Produto'
  },
  'productForm.createSubtitle': {
    es: 'Completa la información del producto para agregarlo al catálogo',
    en: 'Complete the product information to add it to the catalog',
    pt: 'Complete as informações do produto para adicioná-lo ao catálogo'
  },
  'productForm.editTitle': {
    es: 'Editar Producto',
    en: 'Edit Product',
    pt: 'Editar Produto'
  },
  'productForm.editSubtitle': {
    es: 'Modifica la información del producto',
    en: 'Modify the product information',
    pt: 'Modifique as informações do produto'
  },
  'productForm.name': {
    es: 'Nombre del Producto',
    en: 'Product Name',
    pt: 'Nome do Produto'
  },
  'productForm.namePlaceholder': {
    es: 'Ej: Filtro de Aceite Motor, Pastillas de Freno',
    en: 'Ex: Oil Filter, Brake Pads',
    pt: 'Ex: Filtro de Óleo, Pastilhas de Freio'
  },
  'productForm.sku': {
    es: 'SKU',
    en: 'SKU',
    pt: 'SKU'
  },
  'productForm.skuPlaceholder': {
    es: 'Código único del producto',
    en: 'Unique product code',
    pt: 'Código único do produto'
  },
  'productForm.description': {
    es: 'Descripción',
    en: 'Description',
    pt: 'Descrição'
  },
  'productForm.descriptionPlaceholder': {
    es: 'Describe las características y beneficios del producto',
    en: 'Describe the features and benefits of the product',
    pt: 'Descreva as características e benefícios do produto'
  },
  'productForm.price': {
    es: 'Precio',
    en: 'Price',
    pt: 'Preço'
  },
  'productForm.stock': {
    es: 'Stock',
    en: 'Stock',
    pt: 'Estoque'
  },
  'productForm.originalPartCode': {
    es: 'Código de Pieza Original',
    en: 'Original Part Code',
    pt: 'Código da Peça Original'
  },
  'productForm.originalPartCodePlaceholder': {
    es: 'Código del fabricante original',
    en: 'Original manufacturer code',
    pt: 'Código do fabricante original'
  },
  'productForm.category': {
    es: 'Categoría',
    en: 'Category',
    pt: 'Categoria'
  },
  'productForm.selectCategory': {
    es: 'Selecciona una categoría',
    en: 'Select a category',
    pt: 'Selecione uma categoria'
  },
  'productForm.brand': {
    es: 'Marca',
    en: 'Brand',
    pt: 'Marca'
  },
  'productForm.selectBrand': {
    es: 'Selecciona una marca',
    en: 'Select a brand',
    pt: 'Selecione uma marca'
  },
  'productForm.subcategory': {
    es: 'Subcategoría',
    en: 'Subcategory',
    pt: 'Subcategoria'
  },
  'productForm.subcategoryPlaceholder': {
    es: 'Ej: Filtros, Pastillas, Baterías',
    en: 'Ex: Filters, Pads, Batteries',
    pt: 'Ex: Filtros, Pastilhas, Baterias'
  },
  'productForm.tags': {
    es: 'Etiquetas',
    en: 'Tags',
    pt: 'Tags'
  },
  'productForm.tagsPlaceholder': {
    es: 'filtro, aceite, motor, toyota',
    en: 'filter, oil, engine, toyota',
    pt: 'filtro, óleo, motor, toyota'
  },
  'productForm.tagsHelp': {
    es: 'Separa las etiquetas con comas para facilitar la búsqueda',
    en: 'Separate tags with commas to facilitate search',
    pt: 'Separe as tags com vírgulas para facilitar a busca'
  },
  'productForm.specifications': {
    es: 'Especificaciones',
    en: 'Specifications',
    pt: 'Especificações'
  },
  'productForm.specificationsPlaceholder': {
    es: '{"material": "papel", "tamaño": "estándar", "compatibilidad": "Toyota"}',
    en: '{"material": "paper", "size": "standard", "compatibility": "Toyota"}',
    pt: '{"material": "papel", "tamanho": "padrão", "compatibilidade": "Toyota"}'
  },
  'productForm.specificationsHelp': {
    es: 'Ingresa las especificaciones en formato JSON válido',
    en: 'Enter specifications in valid JSON format',
    pt: 'Digite as especificações em formato JSON válido'
  },
  'productForm.images': {
    es: 'Imágenes',
    en: 'Images',
    pt: 'Imagens'
  },
  'productForm.isFeatured': {
    es: 'Producto Destacado',
    en: 'Featured Product',
    pt: 'Produto em Destaque'
  },
  'productForm.errors.nameRequired': {
    es: 'El nombre del producto es obligatorio',
    en: 'Product name is required',
    pt: 'Nome do produto é obrigatório'
  },
  'productForm.errors.descriptionRequired': {
    es: 'La descripción es obligatoria',
    en: 'Description is required',
    pt: 'Descrição é obrigatória'
  },
  'productForm.errors.priceRequired': {
    es: 'El precio es obligatorio y debe ser mayor a 0',
    en: 'Price is required and must be greater than 0',
    pt: 'Preço é obrigatório e deve ser maior que 0'
  },
  'productForm.errors.categoryRequired': {
    es: 'La categoría es obligatoria',
    en: 'Category is required',
    pt: 'Categoria é obrigatória'
  },
  'productForm.errors.skuRequired': {
    es: 'El SKU es obligatorio',
    en: 'SKU is required',
    pt: 'SKU é obrigatório'
  },
  'productForm.errors.storeRequired': {
    es: 'Debe seleccionar una tienda',
    en: 'You must select a store',
    pt: 'Você deve selecionar uma loja'
  },

  // ===== BOTONES COMUNES =====
  'common.cancel': {
    es: 'Cancelar',
    en: 'Cancel',
    pt: 'Cancelar'
  },
  'common.create': {
    es: 'Crear',
    en: 'Create',
    pt: 'Criar'
  },
  'common.update': {
    es: 'Actualizar',
    en: 'Update',
    pt: 'Atualizar'
  },
  'common.saving': {
    es: 'Guardando...',
    en: 'Saving...',
    pt: 'Salvando...'
  },

  // ===== ADMIN SUBCATEGORIES =====
  'adminSubcategories.title': {
    es: 'Gestión de Subcategorías',
    en: 'Subcategory Management',
    pt: 'Gerenciamento de Subcategorias'
  },
  'adminSubcategories.subtitle': {
    es: 'Organiza los productos por subcategorías específicas',
    en: 'Organize products by specific subcategories',
    pt: 'Organize produtos por subcategorias específicas'
  },
  'adminSubcategories.newSubcategory': {
    es: 'Nueva Subcategoría',
    en: 'New Subcategory',
    pt: 'Nova Subcategoria'
  },
  'adminSubcategories.searchPlaceholder': {
    es: 'Buscar subcategorías...',
    en: 'Search subcategories...',
    pt: 'Buscar subcategorias...'
  },
  'adminSubcategories.allCategories': {
    es: 'Todas las categorías',
    en: 'All categories',
    pt: 'Todas as categorias'
  },
  'adminSubcategories.allTypes': {
    es: 'Todos los tipos',
    en: 'All types',
    pt: 'Todos os tipos'
  },
  'adminSubcategories.allStatuses': {
    es: 'Todos los estados',
    en: 'All statuses',
    pt: 'Todos os status'
  },
  'adminSubcategories.active': {
    es: 'Activas',
    en: 'Active',
    pt: 'Ativas'
  },
  'adminSubcategories.inactive': {
    es: 'Inactivas',
    en: 'Inactive',
    pt: 'Inativas'
  },
  'adminSubcategories.vehicleTypes.car': {
    es: 'Automóviles',
    en: 'Automobiles',
    pt: 'Automóveis'
  },
  'adminSubcategories.vehicleTypes.motorcycle': {
    es: 'Motocicletas',
    en: 'Motorcycles',
    pt: 'Motocicletas'
  },
  'adminSubcategories.vehicleTypes.truck': {
    es: 'Camiones',
    en: 'Trucks',
    pt: 'Caminhões'
  },
  'adminSubcategories.vehicleTypes.bus': {
    es: 'Autobuses',
    en: 'Buses',
    pt: 'Ônibus'
  },
  'adminSubcategories.stats.total': {
    es: 'Total',
    en: 'Total',
    pt: 'Total'
  },
  'adminSubcategories.stats.active': {
    es: 'Activas',
    en: 'Active',
    pt: 'Ativas'
  },
  'adminSubcategories.stats.inactive': {
    es: 'Inactivas',
    en: 'Inactive',
    pt: 'Inativas'
  },
  'adminSubcategories.stats.withProducts': {
    es: 'Con Productos',
    en: 'With Products',
    pt: 'Com Produtos'
  },
  'adminSubcategories.stats.automobiles': {
    es: 'Automóviles',
    en: 'Automobiles',
    pt: 'Automóveis'
  },
  'adminSubcategories.stats.motorcycles': {
    es: 'Motocicletas',
    en: 'Motorcycles',
    pt: 'Motocicletas'
  },
  'adminSubcategories.subcategories': {
    es: 'Subcategorías',
    en: 'Subcategories',
    pt: 'Subcategorias'
  },
  'adminSubcategories.status.active': {
    es: 'Activa',
    en: 'Active',
    pt: 'Ativa'
  },
  'adminSubcategories.status.inactive': {
    es: 'Inactiva',
    en: 'Inactive',
    pt: 'Inativa'
  },
  'adminSubcategories.actions.viewDetails': {
    es: 'Ver detalles',
    en: 'View details',
    pt: 'Ver detalhes'
  },
  'adminSubcategories.actions.edit': {
    es: 'Editar',
    en: 'Edit',
    pt: 'Editar'
  },
  'adminSubcategories.actions.activate': {
    es: 'Activar',
    en: 'Activate',
    pt: 'Ativar'
  },
  'adminSubcategories.actions.deactivate': {
    es: 'Desactivar',
    en: 'Deactivate',
    pt: 'Desativar'
  },
  'adminSubcategories.actions.delete': {
    es: 'Eliminar',
    en: 'Delete',
    pt: 'Excluir'
  },
  'adminSubcategories.loading': {
    es: 'Cargando subcategorías...',
    en: 'Loading subcategories...',
    pt: 'Carregando subcategorias...'
  },
  'adminSubcategories.noSubcategories': {
    es: 'No se encontraron subcategorías',
    en: 'No subcategories found',
    pt: 'Nenhuma subcategoria encontrada'
  },
  'adminSubcategories.createFirst': {
    es: 'Crea tu primera subcategoría para empezar',
    en: 'Create your first subcategory to get started',
    pt: 'Crie sua primeira subcategoria para começar'
  },
  'adminSubcategories.modals.create.title': {
    es: 'Crear Nueva Subcategoría',
    en: 'Create New Subcategory',
    pt: 'Criar Nova Subcategoria'
  },
  'adminSubcategories.modals.edit.title': {
    es: 'Editar Subcategoría',
    en: 'Edit Subcategory',
    pt: 'Editar Subcategoria'
  },
  'adminSubcategories.modals.view.title': {
    es: 'Detalles de la Subcategoría',
    en: 'Subcategory Details',
    pt: 'Detalhes da Subcategoria'
  },
  'adminSubcategories.modals.name': {
    es: 'Nombre',
    en: 'Name',
    pt: 'Nome'
  },
  'adminSubcategories.modals.namePlaceholder': {
    es: 'Nombre de la subcategoría',
    en: 'Subcategory name',
    pt: 'Nome da subcategoria'
  },
  'adminSubcategories.modals.description': {
    es: 'Descripción',
    en: 'Description',
    pt: 'Descrição'
  },
  'adminSubcategories.modals.descriptionPlaceholder': {
    es: 'Descripción de la subcategoría',
    en: 'Subcategory description',
    pt: 'Descrição da subcategoria'
  },
  'adminSubcategories.modals.category': {
    es: 'Categoría',
    en: 'Category',
    pt: 'Categoria'
  },
  'adminSubcategories.modals.selectCategory': {
    es: 'Seleccionar categoría',
    en: 'Select category',
    pt: 'Selecionar categoria'
  },
  'adminSubcategories.modals.vehicleType': {
    es: 'Tipo de Vehículo',
    en: 'Vehicle Type',
    pt: 'Tipo de Veículo'
  },
  'adminSubcategories.modals.car': {
    es: 'Automóvil',
    en: 'Automobile',
    pt: 'Automóvel'
  },
  'adminSubcategories.modals.motorcycle': {
    es: 'Motocicleta',
    en: 'Motorcycle',
    pt: 'Motocicleta'
  },
  'adminSubcategories.modals.truck': {
    es: 'Camión',
    en: 'Truck',
    pt: 'Caminhão'
  },
  'adminSubcategories.modals.bus': {
    es: 'Autobús',
    en: 'Bus',
    pt: 'Ônibus'
  },
  'adminSubcategories.modals.imageUrl': {
    es: 'URL de imagen (opcional)',
    en: 'Image URL (optional)',
    pt: 'URL da imagem (opcional)'
  },
  'adminSubcategories.modals.imagePlaceholder': {
    es: 'https://ejemplo.com/imagen.jpg',
    en: 'https://example.com/image.jpg',
    pt: 'https://exemplo.com/imagem.jpg'
  },
  'adminSubcategories.modals.order': {
    es: 'Orden',
    en: 'Order',
    pt: 'Ordem'
  },
  'adminSubcategories.modals.cancel': {
    es: 'Cancelar',
    en: 'Cancel',
    pt: 'Cancelar'
  },
  'adminSubcategories.modals.create': {
    es: 'Crear',
    en: 'Create',
    pt: 'Criar'
  },
  'adminSubcategories.modals.update': {
    es: 'Actualizar',
    en: 'Update',
    pt: 'Atualizar'
  },
  'adminSubcategories.modals.close': {
    es: 'Cerrar',
    en: 'Close',
    pt: 'Fechar'
  },
  'adminSubcategories.modals.noDescription': {
    es: 'Sin descripción',
    en: 'No description',
    pt: 'Sem descrição'
  },
  'adminSubcategories.modals.vehicleTypeLabel': {
    es: 'Tipo de Vehículo:',
    en: 'Vehicle Type:',
    pt: 'Tipo de Veículo:'
  },
  'adminSubcategories.modals.created': {
    es: 'Creada:',
    en: 'Created:',
    pt: 'Criada:'
  },
  'adminSubcategories.messages.subcategoryCreated': {
    es: 'Subcategoría creada exitosamente',
    en: 'Subcategory created successfully',
    pt: 'Subcategoria criada com sucesso'
  },
  'adminSubcategories.messages.subcategoryUpdated': {
    es: 'Subcategoría actualizada exitosamente',
    en: 'Subcategory updated successfully',
    pt: 'Subcategoria atualizada com sucesso'
  },
  'adminSubcategories.messages.subcategoryDeleted': {
    es: 'Subcategoría eliminada exitosamente',
    en: 'Subcategory deleted successfully',
    pt: 'Subcategoria excluída com sucesso'
  },
  'adminSubcategories.messages.statusUpdated': {
    es: 'Estado de subcategoría actualizado exitosamente',
    en: 'Subcategory status updated successfully',
    pt: 'Status da subcategoria atualizado com sucesso'
  },
  'adminSubcategories.errors.connection': {
    es: 'Error de conexión',
    en: 'Connection error',
    pt: 'Erro de conexão'
  },
  'adminSubcategories.errors.creatingSubcategory': {
    es: 'Error creando subcategoría',
    en: 'Error creating subcategory',
    pt: 'Erro ao criar subcategoria'
  },
  'adminSubcategories.errors.updatingSubcategory': {
    es: 'Error actualizando subcategoría',
    en: 'Error updating subcategory',
    pt: 'Erro ao atualizar subcategoria'
  },
  'adminSubcategories.errors.deletingSubcategory': {
    es: 'Error eliminando subcategoría',
    en: 'Error deleting subcategory',
    pt: 'Erro ao excluir subcategoria'
  },
  'adminSubcategories.errors.updatingStatus': {
    es: 'Error actualizando estado',
    en: 'Error updating status',
    pt: 'Erro ao atualizar status'
  },
  'adminSubcategories.errors.requiredFields': {
    es: 'Los campos nombre y categoría son obligatorios',
    en: 'Name and category fields are required',
    pt: 'Os campos nome e categoria são obrigatórios'
  },
  'adminSubcategories.confirm.delete': {
    es: '¿Estás seguro de que deseas eliminar esta subcategoría? Esta acción no se puede deshacer.',
    en: 'Are you sure you want to delete this subcategory? This action cannot be undone.',
    pt: 'Tem certeza de que deseja excluir esta subcategoria? Esta ação não pode ser desfeita.'
  },
  'adminSubcategories.access.noPermissions': {
    es: 'No tienes permisos para acceder a esta página.',
    en: 'You do not have permissions to access this page.',
    pt: 'Você não tem permissões para acessar esta página.'
  },
  'adminSubcategories.order': {
    es: 'Orden',
    en: 'Order',
    pt: 'Ordem'
  },
  'adminSubcategories.products': {
    es: 'Productos',
    en: 'Products',
    pt: 'Produtos'
  },
  'adminSubcategories.accessDenied.title': {
    es: 'Acceso Denegado',
    en: 'Access Denied',
    pt: 'Acesso Negado'
  },

  // ===== ADMIN PROMOTIONS =====
  'adminPromotions.title': {
    es: 'Gestión de Promociones',
    en: 'Promotions Management',
    pt: 'Gerenciamento de Promoções'
  },
  'adminPromotions.subtitle': {
    es: 'Administra las promociones y ofertas especiales',
    en: 'Manage promotions and special offers',
    pt: 'Gerencie promoções e ofertas especiais'
  },
  'adminPromotions.stats.total': {
    es: 'Total',
    en: 'Total',
    pt: 'Total'
  },
  'adminPromotions.stats.active': {
    es: 'Activas',
    en: 'Active',
    pt: 'Ativas'
  },
  'adminPromotions.stats.inactive': {
    es: 'Inactivas',
    en: 'Inactive',
    pt: 'Inativas'
  },
  'adminPromotions.stats.expiringSoon': {
    es: 'Por Expirar',
    en: 'Expiring Soon',
    pt: 'Expirando em Breve'
  },
  'adminPromotions.stats.stores': {
    es: 'Tiendas',
    en: 'Stores',
    pt: 'Lojas'
  },
  'adminPromotions.searchPlaceholder': {
    es: 'Buscar promociones...',
    en: 'Search promotions...',
    pt: 'Buscar promoções...'
  },
  'adminPromotions.allStores': {
    es: 'Todas las tiendas',
    en: 'All stores',
    pt: 'Todas as lojas'
  },
  'adminPromotions.allTypes': {
    es: 'Todos los tipos',
    en: 'All types',
    pt: 'Todos os tipos'
  },
  'adminPromotions.allStatuses': {
    es: 'Todos los estados',
    en: 'All statuses',
    pt: 'Todos os status'
  },
  'adminPromotions.promotionTypes.percentage': {
    es: 'Porcentaje',
    en: 'Percentage',
    pt: 'Porcentagem'
  },
  'adminPromotions.promotionTypes.fixed': {
    es: 'Monto Fijo',
    en: 'Fixed Amount',
    pt: 'Valor Fixo'
  },
  'adminPromotions.promotionTypes.buyXGetY': {
    es: 'Compra X Obtén Y',
    en: 'Buy X Get Y',
    pt: 'Compre X Ganhe Y'
  },
  'adminPromotions.promotionTypes.custom': {
    es: 'Personalizada',
    en: 'Custom',
    pt: 'Personalizada'
  },
  'adminPromotions.status.active': {
    es: 'Activas',
    en: 'Active',
    pt: 'Ativas'
  },
  'adminPromotions.status.inactive': {
    es: 'Inactivas',
    en: 'Inactive',
    pt: 'Inativas'
  },
  'adminPromotions.newPromotion': {
    es: 'Nueva Promoción',
    en: 'New Promotion',
    pt: 'Nova Promoção'
  },

  // ===== STORE MANAGER PROMOTIONS =====
  'promotions.title': {
    es: 'Gestión de Promociones',
    en: 'Promotions Management',
    pt: 'Gerenciamento de Promoções'
  },
  'promotions.subtitle': {
    es: 'Administra las promociones de {storeName}',
    en: 'Manage promotions for {storeName}',
    pt: 'Gerencie promoções de {storeName}'
  },
  'promotions.newPromotion': {
    es: 'Nueva Promoción',
    en: 'New Promotion',
    pt: 'Nova Promoção'
  },
  'promotions.stats.total': {
    es: 'Total Promociones',
    en: 'Total Promotions',
    pt: 'Total de Promoções'
  },
  'promotions.stats.active': {
    es: 'Activas',
    en: 'Active',
    pt: 'Ativas'
  },
  'promotions.stats.upcoming': {
    es: 'Próximas',
    en: 'Upcoming',
    pt: 'Próximas'
  },
  'promotions.stats.expired': {
    es: 'Expiradas',
    en: 'Expired',
    pt: 'Expiradas'
  },
  'promotions.noActiveStore.title': {
    es: 'No hay tienda activa',
    en: 'No active store',
    pt: 'Nenhuma loja ativa'
  },
  'promotions.noActiveStore.description': {
    es: 'Selecciona una tienda para gestionar las promociones',
    en: 'Select a store to manage promotions',
    pt: 'Selecione uma loja para gerenciar promoções'
  },
  'promotions.premium.title': {
    es: 'Funcionalidad Premium',
    en: 'Premium Feature',
    pt: 'Recurso Premium'
  },
  'promotions.premium.description': {
    es: 'Las promociones están disponibles solo en planes superiores',
    en: 'Promotions are only available in higher plans',
    pt: 'Promoções estão disponíveis apenas em planos superiores'
  },
  'promotions.premium.upgradeTitle': {
    es: 'Actualiza tu Plan',
    en: 'Upgrade Your Plan',
    pt: 'Atualize Seu Plano'
  },
  'promotions.premium.upgradeDescription': {
    es: 'Desbloquea las promociones y otras funcionalidades premium',
    en: 'Unlock promotions and other premium features',
    pt: 'Desbloqueie promoções e outros recursos premium'
  },
  'promotions.premium.viewPlans': {
    es: 'Ver Planes Disponibles',
    en: 'View Available Plans',
    pt: 'Ver Planos Disponíveis'
  },
  'promotions.premium.modal.title': {
    es: 'Actualizar Plan',
    en: 'Upgrade Plan',
    pt: 'Atualizar Plano'
  },
  'promotions.premium.modal.subtitle': {
    es: 'Funcionalidad Premium',
    en: 'Premium Feature',
    pt: 'Recurso Premium'
  },
  'promotions.premium.modal.description': {
    es: 'Para acceder a promociones y otras funcionalidades premium, necesitas actualizar tu plan.',
    en: 'To access promotions and other premium features, you need to upgrade your plan.',
    pt: 'Para acessar promoções e outros recursos premium, você precisa atualizar seu plano.'
  },
  'promotions.premium.modal.proPlan.title': {
    es: 'Plan Pro - $29.99/mes',
    en: 'Pro Plan - $29.99/month',
    pt: 'Plano Pro - $29.99/mês'
  },
  'promotions.premium.modal.proPlan.feature1': {
    es: 'Promociones ilimitadas',
    en: 'Unlimited promotions',
    pt: 'Promoções ilimitadas'
  },
  'promotions.premium.modal.proPlan.feature2': {
    es: 'Analytics avanzado',
    en: 'Advanced analytics',
    pt: 'Analytics avançado'
  },
  'promotions.premium.modal.proPlan.feature3': {
    es: 'Soporte prioritario',
    en: 'Priority support',
    pt: 'Suporte prioritário'
  },
  'promotions.premium.modal.proPlan.feature4': {
    es: 'Hasta 200 productos',
    en: 'Up to 200 products',
    pt: 'Até 200 produtos'
  },
  'promotions.premium.modal.elitePlan.title': {
    es: 'Plan Elite - $99.99/mes',
    en: 'Elite Plan - $99.99/month',
    pt: 'Plano Elite - $99.99/mês'
  },
  'promotions.premium.modal.elitePlan.feature1': {
    es: 'Todo del Plan Pro',
    en: 'Everything from Pro Plan',
    pt: 'Tudo do Plano Pro'
  },
  'promotions.premium.modal.elitePlan.feature2': {
    es: 'Publicidad in-app',
    en: 'In-app advertising',
    pt: 'Publicidade no app'
  },
  'promotions.premium.modal.elitePlan.feature3': {
    es: 'Dominio personalizado',
    en: 'Custom domain',
    pt: 'Domínio personalizado'
  },
  'promotions.premium.modal.elitePlan.feature4': {
    es: 'Productos ilimitados',
    en: 'Unlimited products',
    pt: 'Produtos ilimitados'
  },
  'promotions.premium.modal.managePlans': {
    es: 'Gestionar Planes',
    en: 'Manage Plans',
    pt: 'Gerenciar Planos'
  },
  'promotions.premium.modal.contactAdmin': {
    es: 'Contacta al administrador del sistema para actualizar tu plan.',
    en: 'Contact the system administrator to upgrade your plan.',
    pt: 'Entre em contato com o administrador do sistema para atualizar seu plano.'
  },
  'promotions.premium.modal.understood': {
    es: 'Entendido',
    en: 'Understood',
    pt: 'Entendido'
  },
  'promotions.search.placeholder': {
    es: 'Buscar promociones...',
    en: 'Search promotions...',
    pt: 'Buscar promoções...'
  },
  'promotions.filters.allTypes': {
    es: 'Todos los tipos',
    en: 'All types',
    pt: 'Todos os tipos'
  },
  'promotions.filters.percentage': {
    es: 'Porcentaje',
    en: 'Percentage',
    pt: 'Porcentagem'
  },
  'promotions.filters.fixed': {
    es: 'Monto fijo',
    en: 'Fixed amount',
    pt: 'Valor fixo'
  },
  'promotions.filters.buyXGetY': {
    es: 'Compra X, obtén Y',
    en: 'Buy X, get Y',
    pt: 'Compre X, ganhe Y'
  },
  'promotions.filters.custom': {
    es: 'Personalizado',
    en: 'Custom',
    pt: 'Personalizado'
  },
  'promotions.filters.allStatuses': {
    es: 'Todos los estados',
    en: 'All statuses',
    pt: 'Todos os status'
  },
  'promotions.filters.active': {
    es: 'Activas',
    en: 'Active',
    pt: 'Ativas'
  },
  'promotions.filters.inactive': {
    es: 'Inactivas',
    en: 'Inactive',
    pt: 'Inativas'
  },
  'promotions.filters.expired': {
    es: 'Expiradas',
    en: 'Expired',
    pt: 'Expiradas'
  },
  'promotions.filters.upcoming': {
    es: 'Próximas',
    en: 'Upcoming',
    pt: 'Próximas'
  },
  'promotions.filters.sortBy.createdAt': {
    es: 'Fecha de creación',
    en: 'Creation date',
    pt: 'Data de criação'
  },
  'promotions.filters.sortBy.name': {
    es: 'Nombre',
    en: 'Name',
    pt: 'Nome'
  },
  'promotions.filters.sortBy.startDate': {
    es: 'Fecha de inicio',
    en: 'Start date',
    pt: 'Data de início'
  },
  'promotions.filters.sortBy.endDate': {
    es: 'Fecha de fin',
    en: 'End date',
    pt: 'Data de fim'
  },
  'promotions.filters.sortBy.uses': {
    es: 'Usos',
    en: 'Uses',
    pt: 'Usos'
  },
  'promotions.loading': {
    es: 'Cargando promociones...',
    en: 'Loading promotions...',
    pt: 'Carregando promoções...'
  },
  'promotions.retry': {
    es: 'Reintentar',
    en: 'Retry',
    pt: 'Tentar novamente'
  },
  'promotions.noPromotions.title': {
    es: 'No hay promociones',
    en: 'No promotions',
    pt: 'Nenhuma promoção'
  },
  'promotions.noPromotions.filtered': {
    es: 'No se encontraron promociones con los filtros aplicados',
    en: 'No promotions found with the applied filters',
    pt: 'Nenhuma promoção encontrada com os filtros aplicados'
  },
  'promotions.noPromotions.empty': {
    es: 'Crea tu primera promoción para empezar',
    en: 'Create your first promotion to get started',
    pt: 'Crie sua primeira promoção para começar'
  },
  'promotions.createFirst': {
    es: 'Crear Promoción',
    en: 'Create Promotion',
    pt: 'Criar Promoção'
  },
  'promotions.table.promotion': {
    es: 'Promoción',
    en: 'Promotion',
    pt: 'Promoção'
  },
  'promotions.table.type': {
    es: 'Tipo',
    en: 'Type',
    pt: 'Tipo'
  },
  'promotions.table.dates': {
    es: 'Fechas',
    en: 'Dates',
    pt: 'Datas'
  },
  'promotions.table.status': {
    es: 'Estado',
    en: 'Status',
    pt: 'Status'
  },
  'promotions.table.uses': {
    es: 'Usos',
    en: 'Uses',
    pt: 'Usos'
  },
  'promotions.table.actions': {
    es: 'Acciones',
    en: 'Actions',
    pt: 'Ações'
  },
  'promotions.table.createdBy': {
    es: 'Creada por {name}',
    en: 'Created by {name}',
    pt: 'Criado por {name}'
  },
  'promotions.table.startDate': {
    es: 'Inicio',
    en: 'Start',
    pt: 'Início'
  },
  'promotions.table.endDate': {
    es: 'Fin',
    en: 'End',
    pt: 'Fim'
  },
  'promotions.status.active': {
    es: 'Activa',
    en: 'Active',
    pt: 'Ativa'
  },
  'promotions.status.expired': {
    es: 'Expirada',
    en: 'Expired',
    pt: 'Expirada'
  },
  'promotions.status.upcoming': {
    es: 'Próxima',
    en: 'Upcoming',
    pt: 'Próxima'
  },
  'promotions.status.inactive': {
    es: 'Inactiva',
    en: 'Inactive',
    pt: 'Inativa'
  },
  'promotions.actions.viewDetails': {
    es: 'Ver detalles',
    en: 'View details',
    pt: 'Ver detalhes'
  },
  'promotions.actions.edit': {
    es: 'Editar',
    en: 'Edit',
    pt: 'Editar'
  },
  'promotions.actions.activate': {
    es: 'Activar',
    en: 'Activate',
    pt: 'Ativar'
  },
  'promotions.actions.deactivate': {
    es: 'Desactivar',
    en: 'Deactivate',
    pt: 'Desativar'
  },
  'promotions.actions.delete': {
    es: 'Eliminar',
    en: 'Delete',
    pt: 'Excluir'
  },
  'promotions.pagination.previous': {
    es: 'Anterior',
    en: 'Previous',
    pt: 'Anterior'
  },
  'promotions.pagination.next': {
    es: 'Siguiente',
    en: 'Next',
    pt: 'Próximo'
  },
  'promotions.pagination.showing': {
    es: 'Mostrando {start} a {end} de {total} resultados',
    en: 'Showing {start} to {end} of {total} results',
    pt: 'Mostrando {start} a {end} de {total} resultados'
  },
  'promotions.modal.view.title': {
    es: 'Detalles de Promoción',
    en: 'Promotion Details',
    pt: 'Detalhes da Promoção'
  },
  'adminPromotions.loading': {
    es: 'Cargando promociones...',
    en: 'Loading promotions...',
    pt: 'Carregando promoções...'
  },
  'adminPromotions.noPromotions': {
    es: 'No se encontraron promociones',
    en: 'No promotions found',
    pt: 'Nenhuma promoção encontrada'
  },
  'adminPromotions.createFirst': {
    es: 'Crea tu primera promoción para empezar',
    en: 'Create your first promotion to get started',
    pt: 'Crie sua primeira promoção para começar'
  },
  'adminPromotions.products': {
    es: 'productos',
    en: 'products',
    pt: 'produtos'
  },
  'adminPromotions.status.pending': {
    es: 'Pendiente',
    en: 'Pending',
    pt: 'Pendente'
  },
  'adminPromotions.status.expired': {
    es: 'Expirada',
    en: 'Expired',
    pt: 'Expirada'
  },
  'adminPromotions.status.vigent': {
    es: 'Vigente',
    en: 'Active',
    pt: 'Vigente'
  },
  'adminPromotions.actions.viewDetails': {
    es: 'Ver detalles',
    en: 'View details',
    pt: 'Ver detalhes'
  },
  'adminPromotions.actions.edit': {
    es: 'Editar',
    en: 'Edit',
    pt: 'Editar'
  },
  'adminPromotions.actions.activate': {
    es: 'Activar',
    en: 'Activate',
    pt: 'Ativar'
  },
  'adminPromotions.actions.deactivate': {
    es: 'Desactivar',
    en: 'Deactivate',
    pt: 'Desativar'
  },
  'adminPromotions.actions.delete': {
    es: 'Eliminar',
    en: 'Delete',
    pt: 'Excluir'
  },
  'adminPromotions.modals.view.title': {
    es: 'Detalles de la Promoción',
    en: 'Promotion Details',
    pt: 'Detalhes da Promoção'
  },
  'adminPromotions.modals.view.generalInfo': {
    es: 'Información General',
    en: 'General Information',
    pt: 'Informações Gerais'
  },
  'adminPromotions.modals.view.name': {
    es: 'Nombre',
    en: 'Name',
    pt: 'Nome'
  },
  'adminPromotions.modals.view.type': {
    es: 'Tipo',
    en: 'Type',
    pt: 'Tipo'
  },
  'adminPromotions.modals.view.status': {
    es: 'Estado',
    en: 'Status',
    pt: 'Status'
  },
  'adminPromotions.modals.view.store': {
    es: 'Tienda',
    en: 'Store',
    pt: 'Loja'
  },
  'adminPromotions.modals.view.description': {
    es: 'Descripción',
    en: 'Description',
    pt: 'Descrição'
  },
  'adminPromotions.modals.view.discountConfig': {
    es: 'Configuración de Descuento',
    en: 'Discount Configuration',
    pt: 'Configuração de Desconto'
  },
  'adminPromotions.modals.view.discountPercentage': {
    es: 'Porcentaje de Descuento',
    en: 'Discount Percentage',
    pt: 'Percentual de Desconto'
  },
  'adminPromotions.modals.view.discountAmount': {
    es: 'Monto de Descuento',
    en: 'Discount Amount',
    pt: 'Valor do Desconto'
  },
  'adminPromotions.modals.view.buyQuantity': {
    es: 'Compra',
    en: 'Buy',
    pt: 'Compre'
  },
  'adminPromotions.modals.view.getQuantity': {
    es: 'Obtén',
    en: 'Get',
    pt: 'Ganhe'
  },
  'adminPromotions.modals.view.customText': {
    es: 'Texto Personalizado',
    en: 'Custom Text',
    pt: 'Texto Personalizado'
  },
  'adminPromotions.modals.view.dates': {
    es: 'Fechas de Vigencia',
    en: 'Validity Dates',
    pt: 'Datas de Validade'
  },
  'adminPromotions.modals.view.startDate': {
    es: 'Fecha de Inicio',
    en: 'Start Date',
    pt: 'Data de Início'
  },
  'adminPromotions.modals.view.endDate': {
    es: 'Fecha de Fin',
    en: 'End Date',
    pt: 'Data de Fim'
  },
  'adminPromotions.modals.view.products': {
    es: 'Productos',
    en: 'Products',
    pt: 'Produtos'
  },
  'adminPromotions.modals.view.visualConfig': {
    es: 'Configuración Visual',
    en: 'Visual Configuration',
    pt: 'Configuração Visual'
  },
  'adminPromotions.modals.view.ribbonText': {
    es: 'Texto del Cintillo',
    en: 'Ribbon Text',
    pt: 'Texto da Fita'
  },
  'adminPromotions.modals.view.ribbonPosition': {
    es: 'Posición del Cintillo',
    en: 'Ribbon Position',
    pt: 'Posição da Fita'
  },
  'adminPromotions.modals.view.showOriginalPrice': {
    es: 'Mostrar Precio Original',
    en: 'Show Original Price',
    pt: 'Mostrar Preço Original'
  },
  'adminPromotions.modals.view.showDiscountAmount': {
    es: 'Mostrar Monto de Descuento',
    en: 'Show Discount Amount',
    pt: 'Mostrar Valor do Desconto'
  },
  'adminPromotions.modals.view.additionalInfo': {
    es: 'Información Adicional',
    en: 'Additional Information',
    pt: 'Informações Adicionais'
  },
  'adminPromotions.modals.view.createdBy': {
    es: 'Creado por',
    en: 'Created by',
    pt: 'Criado por'
  },
  'adminPromotions.modals.view.createdAt': {
    es: 'Fecha de Creación',
    en: 'Creation Date',
    pt: 'Data de Criação'
  },
  'adminPromotions.modals.view.usageLimit': {
    es: 'Límite de Usos',
    en: 'Usage Limit',
    pt: 'Limite de Usos'
  },
  'adminPromotions.modals.view.close': {
    es: 'Cerrar',
    en: 'Close',
    pt: 'Fechar'
  },
  'adminPromotions.modals.view.yes': {
    es: 'Sí',
    en: 'Yes',
    pt: 'Sim'
  },
  'adminPromotions.modals.view.no': {
    es: 'No',
    en: 'No',
    pt: 'Não'
  },
  'adminPromotions.messages.promotionCreated': {
    es: 'Promoción creada exitosamente',
    en: 'Promotion created successfully',
    pt: 'Promoção criada com sucesso'
  },
  'adminPromotions.messages.promotionUpdated': {
    es: 'Promoción actualizada exitosamente',
    en: 'Promotion updated successfully',
    pt: 'Promoção atualizada com sucesso'
  },
  'adminPromotions.messages.promotionDeleted': {
    es: 'Promoción eliminada exitosamente',
    en: 'Promotion deleted successfully',
    pt: 'Promoção excluída com sucesso'
  },
  'adminPromotions.messages.statusUpdated': {
    es: 'Estado de promoción actualizado exitosamente',
    en: 'Promotion status updated successfully',
    pt: 'Status da promoção atualizado com sucesso'
  },
  'adminPromotions.errors.connection': {
    es: 'Error de conexión',
    en: 'Connection error',
    pt: 'Erro de conexão'
  },
  'adminPromotions.errors.creatingPromotion': {
    es: 'Error creando promoción',
    en: 'Error creating promotion',
    pt: 'Erro ao criar promoção'
  },
  'adminPromotions.errors.updatingPromotion': {
    es: 'Error actualizando promoción',
    en: 'Error updating promotion',
    pt: 'Erro ao atualizar promoção'
  },
  'adminPromotions.errors.deletingPromotion': {
    es: 'Error eliminando promoción',
    en: 'Error deleting promotion',
    pt: 'Erro ao excluir promoção'
  },
  'adminPromotions.errors.updatingStatus': {
    es: 'Error actualizando estado',
    en: 'Error updating status',
    pt: 'Erro ao atualizar status'
  },
  'adminPromotions.confirm.delete': {
    es: '¿Estás seguro de que quieres eliminar esta promoción? Esta acción no se puede deshacer.',
    en: 'Are you sure you want to delete this promotion? This action cannot be undone.',
    pt: 'Tem certeza de que deseja excluir esta promoção? Esta ação não pode ser desfeita.'
  },
  'adminPromotions.accessDenied.title': {
    es: 'Acceso Denegado',
    en: 'Access Denied',
    pt: 'Acesso Negado'
  },
  'adminPromotions.accessDenied.message': {
    es: 'No tienes permisos para acceder a esta página.',
    en: 'You do not have permissions to access this page.',
    pt: 'Você não tem permissões para acessar esta página.'
  },
  'adminPromotions.modals.view.units': {
    es: 'unidades',
    en: 'units',
    pt: 'unidades'
  },
  'adminPromotions.modals.view.at': {
    es: 'a las',
    en: 'at',
    pt: 'às'
  },
  'promotionForm.title.create': {
    es: 'Crear Nueva Promoción',
    en: 'Create New Promotion',
    pt: 'Criar Nova Promoção'
  },
  'promotionForm.title.edit': {
    es: 'Editar Promoción',
    en: 'Edit Promotion',
    pt: 'Editar Promoção'
  },
  'promotionForm.name': {
    es: 'Nombre de la Promoción *',
    en: 'Promotion Name *',
    pt: 'Nome da Promoção *'
  },
  'promotionForm.namePlaceholder': {
    es: 'Ej: Descuento de Verano',
    en: 'Ex: Summer Discount',
    pt: 'Ex: Desconto de Verão'
  },
  'promotionForm.type': {
    es: 'Tipo de Promoción *',
    en: 'Promotion Type *',
    pt: 'Tipo de Promoção *'
  },
  'promotionForm.types.percentage': {
    es: 'Porcentaje',
    en: 'Percentage',
    pt: 'Porcentagem'
  },
  'promotionForm.types.fixed': {
    es: 'Monto Fijo',
    en: 'Fixed Amount',
    pt: 'Valor Fixo'
  },
  'promotionForm.types.buyXGetY': {
    es: 'Compra X Obtén Y',
    en: 'Buy X Get Y',
    pt: 'Compre X Ganhe Y'
  },
  'promotionForm.types.custom': {
    es: 'Personalizado',
    en: 'Custom',
    pt: 'Personalizado'
  },
  'promotionForm.store': {
    es: 'Tienda *',
    en: 'Store *',
    pt: 'Loja *'
  },
  'promotionForm.selectStore': {
    es: 'Seleccionar tienda',
    en: 'Select store',
    pt: 'Selecionar loja'
  },
  'promotionForm.assignedStore': {
    es: 'Tienda asignada:',
    en: 'Assigned store:',
    pt: 'Loja atribuída:'
  },
  'promotionForm.assignedStoreMessage': {
    es: 'La promoción se creará automáticamente para tu tienda',
    en: 'The promotion will be created automatically for your store',
    pt: 'A promoção será criada automaticamente para sua loja'
  },
  'promotionForm.description': {
    es: 'Descripción *',
    en: 'Description *',
    pt: 'Descrição *'
  },
  'promotionForm.descriptionPlaceholder': {
    es: 'Describe la promoción...',
    en: 'Describe the promotion...',
    pt: 'Descreva a promoção...'
  },
  'promotionForm.discountPercentage': {
    es: 'Porcentaje de Descuento *',
    en: 'Discount Percentage *',
    pt: 'Percentual de Desconto *'
  },
  'promotionForm.discountAmount': {
    es: 'Monto de Descuento *',
    en: 'Discount Amount *',
    pt: 'Valor do Desconto *'
  },
  'promotionForm.buyQuantity': {
    es: 'Cantidad a Comprar *',
    en: 'Buy Quantity *',
    pt: 'Quantidade para Comprar *'
  },
  'promotionForm.getQuantity': {
    es: 'Cantidad a Obtener *',
    en: 'Get Quantity *',
    pt: 'Quantidade para Ganhar *'
  },
  'promotionForm.customText': {
    es: 'Texto Personalizado *',
    en: 'Custom Text *',
    pt: 'Texto Personalizado *'
  },
  'promotionForm.startDate': {
    es: 'Fecha de Inicio *',
    en: 'Start Date *',
    pt: 'Data de Início *'
  },
  'promotionForm.startTime': {
    es: 'Hora de Inicio',
    en: 'Start Time',
    pt: 'Hora de Início'
  },
  'promotionForm.endDate': {
    es: 'Fecha de Fin *',
    en: 'End Date *',
    pt: 'Data de Fim *'
  },
  'promotionForm.endTime': {
    es: 'Hora de Fin',
    en: 'End Time',
    pt: 'Hora de Fim'
  },
  'promotionForm.timeTip': {
    es: 'Consejo: Si no especificas una hora, la promoción se activará a las 00:00 del día de inicio y terminará a las 23:59 del día de fin.',
    en: 'Tip: If you don\'t specify a time, the promotion will activate at 00:00 on the start day and end at 23:59 on the end day.',
    pt: 'Dica: Se você não especificar uma hora, a promoção será ativada às 00:00 no dia de início e terminará às 23:59 no dia de fim.'
  },
  'promotionForm.products': {
    es: 'Productos',
    en: 'Products',
    pt: 'Produtos'
  },
  'promotionForm.cancel': {
    es: 'Cancelar',
    en: 'Cancel',
    pt: 'Cancelar'
  },
  'promotionForm.create': {
    es: 'Crear Promoción',
    en: 'Create Promotion',
    pt: 'Criar Promoção'
  },
  'promotionForm.update': {
    es: 'Actualizar Promoción',
    en: 'Update Promotion',
    pt: 'Atualizar Promoção'
  },
  'promotionForm.saving': {
    es: 'Guardando...',
    en: 'Saving...',
    pt: 'Salvando...'
  },
  'promotionForm.selectStoreFirst': {
    es: 'Selecciona una tienda',
    en: 'Select a store',
    pt: 'Selecione uma loja'
  },
  'promotionForm.selectStoreFirstMessage': {
    es: 'para ver los productos disponibles',
    en: 'to see available products',
    pt: 'para ver produtos disponíveis'
  },
  'promotionForm.selectedProducts': {
    es: 'Productos Seleccionados',
    en: 'Selected Products',
    pt: 'Produtos Selecionados'
  },
  'promotionForm.showOriginalPrice': {
    es: 'Mostrar precio original tachado',
    en: 'Show original price crossed out',
    pt: 'Mostrar preço original riscado'
  },
  'promotionForm.showDiscountAmount': {
    es: 'Mostrar monto de descuento',
    en: 'Show discount amount',
    pt: 'Mostrar valor do desconto'
  },
  'promotionForm.additionalConfig': {
    es: 'Configuración Adicional',
    en: 'Additional Configuration',
    pt: 'Configuração Adicional'
  },
  'promotionForm.usageLimit': {
    es: 'Límite de Usos (Opcional)',
    en: 'Usage Limit (Optional)',
    pt: 'Limite de Usos (Opcional)'
  },
  'promotionForm.noLimit': {
    es: 'Sin límite',
    en: 'No limit',
    pt: 'Sem limite'
  },
  'promotionForm.activePromotion': {
    es: 'Promoción activa',
    en: 'Active promotion',
    pt: 'Promoção ativa'
  },
  'promotionForm.searchProducts': {
    es: 'Buscar Productos',
    en: 'Search Products',
    pt: 'Buscar Produtos'
  },
  'promotionForm.searchProductsPlaceholder': {
    es: 'Buscar por nombre o categoría...',
    en: 'Search by name or category...',
    pt: 'Buscar por nome ou categoria...'
  },
  'promotionForm.noProductsAvailable': {
    es: 'No hay productos disponibles en esta tienda',
    en: 'No products available in this store',
    pt: 'Nenhum produto disponível nesta loja'
  },
  'promotionForm.visualConfig': {
    es: 'Configuración Visual',
    en: 'Visual Configuration',
    pt: 'Configuração Visual'
  },
  'promotionForm.ribbonText': {
    es: 'Texto del Cintillo',
    en: 'Ribbon Text',
    pt: 'Texto da Fita'
  },
  'promotionForm.ribbonPosition': {
    es: 'Posición del Cintillo',
    en: 'Ribbon Position',
    pt: 'Posição da Fita'
  },
  'promotionForm.ribbonPositions.topLeft': {
    es: 'Superior Izquierda',
    en: 'Top Left',
    pt: 'Superior Esquerda'
  },
  'promotionForm.ribbonPositions.topRight': {
    es: 'Superior Derecha',
    en: 'Top Right',
    pt: 'Superior Direita'
  },
  'promotionForm.ribbonPositions.bottomLeft': {
    es: 'Inferior Izquierda',
    en: 'Bottom Left',
    pt: 'Inferior Esquerda'
  },
  'promotionForm.ribbonPositions.bottomRight': {
    es: 'Inferior Derecha',
    en: 'Bottom Right',
    pt: 'Inferior Direita'
  },
  'promotionForm.datesAndTimes': {
    es: 'Fechas y Horas de Vigencia',
    en: 'Validity Dates and Times',
    pt: 'Datas e Horas de Validade'
  },
  'promotionForm.tip': {
    es: 'Consejo:',
    en: 'Tip:',
    pt: 'Dica:'
  },
  'promotionForm.customTextPlaceholder': {
    es: 'Ej: ¡Oferta Especial!',
    en: 'Ex: Special Offer!',
    pt: 'Ex: Oferta Especial!'
  },
  // ===== ADMIN ADVERTISEMENTS =====
  'adminAdvertisements.title': {
    es: 'Gestión de Publicidad',
    en: 'Advertisement Management',
    pt: 'Gestão de Publicidade'
  },
  'adminAdvertisements.subtitle': {
    es: 'Administra las campañas publicitarias de la plataforma',
    en: 'Manage platform advertising campaigns',
    pt: 'Gerencie campanhas publicitárias da plataforma'
  },
  'adminAdvertisements.stats.total': {
    es: 'Total',
    en: 'Total',
    pt: 'Total'
  },
  'adminAdvertisements.stats.active': {
    es: 'Activas',
    en: 'Active',
    pt: 'Ativas'
  },
  'adminAdvertisements.stats.draft': {
    es: 'Borradores',
    en: 'Drafts',
    pt: 'Rascunhos'
  },
  'adminAdvertisements.stats.pending': {
    es: 'Pendientes',
    en: 'Pending',
    pt: 'Pendentes'
  },
  'adminAdvertisements.searchPlaceholder': {
    es: 'Buscar publicidad...',
    en: 'Search advertisements...',
    pt: 'Buscar publicidades...'
  },
  'adminAdvertisements.filterAll': {
    es: 'Todos los estados',
    en: 'All statuses',
    pt: 'Todos os status'
  },
  'adminAdvertisements.filterActive': {
    es: 'Activas',
    en: 'Active',
    pt: 'Ativas'
  },
  'adminAdvertisements.filterDraft': {
    es: 'Borradores',
    en: 'Drafts',
    pt: 'Rascunhos'
  },
  'adminAdvertisements.filterPending': {
    es: 'Pendientes',
    en: 'Pending',
    pt: 'Pendentes'
  },
  'adminAdvertisements.newAdvertisement': {
    es: 'Nueva Publicidad',
    en: 'New Advertisement',
    pt: 'Nova Publicidade'
  },
  'adminAdvertisements.loading': {
    es: 'Cargando publicidades...',
    en: 'Loading advertisements...',
    pt: 'Carregando publicidades...'
  },
  'adminAdvertisements.noAdvertisements': {
    es: 'No hay publicidades disponibles',
    en: 'No advertisements available',
    pt: 'Nenhuma publicidade disponível'
  },
  'adminAdvertisements.viewDetails': {
    es: 'Ver detalles',
    en: 'View details',
    pt: 'Ver detalhes'
  },
  'adminAdvertisements.edit': {
    es: 'Editar',
    en: 'Edit',
    pt: 'Editar'
  },
  'adminAdvertisements.delete': {
    es: 'Eliminar',
    en: 'Delete',
    pt: 'Excluir'
  },
  'adminAdvertisements.confirmDelete': {
    es: '¿Estás seguro de que quieres eliminar esta publicidad?',
    en: 'Are you sure you want to delete this advertisement?',
    pt: 'Tem certeza de que deseja excluir esta publicidade?'
  },
  'adminAdvertisements.deleteSuccess': {
    es: 'Publicidad eliminada exitosamente',
    en: 'Advertisement deleted successfully',
    pt: 'Publicidade excluída com sucesso'
  },
  'adminAdvertisements.deleteError': {
    es: 'Error al eliminar la publicidad',
    en: 'Error deleting advertisement',
    pt: 'Erro ao excluir publicidade'
  },
  'adminAdvertisements.accessDenied': {
    es: 'Acceso denegado. No tienes permisos para gestionar publicidad.',
    en: 'Access denied. You do not have permissions to manage advertisements.',
    pt: 'Acesso negado. Você não tem permissões para gerenciar publicidades.'
  },
  // ===== ADVERTISEMENT FORM =====
  'advertisementForm.title.create': {
    es: 'Nueva Publicidad',
    en: 'New Advertisement',
    pt: 'Nova Publicidade'
  },
  'advertisementForm.title.edit': {
    es: 'Editar Publicidad',
    en: 'Edit Advertisement',
    pt: 'Editar Publicidade'
  },
  'advertisementForm.tabs.basic': {
    es: 'Información Básica',
    en: 'Basic Information',
    pt: 'Informações Básicas'
  },
  'advertisementForm.tabs.targeting': {
    es: 'Segmentación',
    en: 'Targeting',
    pt: 'Segmentação'
  },
  'advertisementForm.tabs.schedule': {
    es: 'Programación',
    en: 'Schedule',
    pt: 'Programação'
  },
  'advertisementForm.tabs.display': {
    es: 'Configuración',
    en: 'Configuration',
    pt: 'Configuração'
  },
  'advertisementForm.basic.title': {
    es: 'Título *',
    en: 'Title *',
    pt: 'Título *'
  },
  'advertisementForm.basic.store': {
    es: 'Tienda *',
    en: 'Store *',
    pt: 'Loja *'
  },
  'advertisementForm.basic.selectStore': {
    es: 'Seleccionar tienda',
    en: 'Select store',
    pt: 'Selecionar loja'
  },
  'advertisementForm.basic.description': {
    es: 'Descripción *',
    en: 'Description *',
    pt: 'Descrição *'
  },
  'advertisementForm.basic.content': {
    es: 'Contenido *',
    en: 'Content *',
    pt: 'Conteúdo *'
  },
  'advertisementForm.basic.contentPlaceholder': {
    es: 'Contenido completo de la publicidad...',
    en: 'Complete advertisement content...',
    pt: 'Conteúdo completo da publicidade...'
  },
  'advertisementForm.basic.imageUrl': {
    es: 'URL de Imagen',
    en: 'Image URL',
    pt: 'URL da Imagem'
  },
  'advertisementForm.basic.videoUrl': {
    es: 'URL de Video',
    en: 'Video URL',
    pt: 'URL do Vídeo'
  },
  'advertisementForm.basic.navigationUrl': {
    es: 'URL de Navegación',
    en: 'Navigation URL',
    pt: 'URL de Navegação'
  },
  'advertisementForm.basic.navigationUrlHelp': {
    es: 'URL a la que navegará el cliente cuando haga clic en la publicidad',
    en: 'URL to which the customer will navigate when clicking on the advertisement',
    pt: 'URL para a qual o cliente navegará ao clicar na publicidade'
  },
  'advertisementForm.basic.displayType': {
    es: 'Tipo de Display *',
    en: 'Display Type *',
    pt: 'Tipo de Exibição *'
  },
  'advertisementForm.basic.targetPlatform': {
    es: 'Plataforma Objetivo *',
    en: 'Target Platform *',
    pt: 'Plataforma Alvo *'
  },
  'advertisementForm.displayTypes.fullscreen': {
    es: 'Pantalla Completa',
    en: 'Full Screen',
    pt: 'Tela Cheia'
  },
  'advertisementForm.displayTypes.footer': {
    es: 'Pie de Página',
    en: 'Footer',
    pt: 'Rodapé'
  },
  'advertisementForm.displayTypes.midScreen': {
    es: 'Mitad de Pantalla',
    en: 'Mid Screen',
    pt: 'Meia Tela'
  },
  'advertisementForm.displayTypes.searchCard': {
    es: 'Card de Búsqueda',
    en: 'Search Card',
    pt: 'Card de Busca'
  },
  'advertisementForm.platforms.android': {
    es: 'Android',
    en: 'Android',
    pt: 'Android'
  },
  'advertisementForm.platforms.ios': {
    es: 'iOS',
    en: 'iOS',
    pt: 'iOS'
  },
  'advertisementForm.platforms.both': {
    es: 'Ambas',
    en: 'Both',
    pt: 'Ambas'
  },
  'advertisementForm.targeting.userRoles': {
    es: 'Roles de Usuario',
    en: 'User Roles',
    pt: 'Funções do Usuário'
  },
  'advertisementForm.targeting.loyaltyLevels': {
    es: 'Niveles de Fidelización',
    en: 'Loyalty Levels',
    pt: 'Níveis de Fidelidade'
  },
  'advertisementForm.targeting.deviceTypes': {
    es: 'Tipos de Dispositivo',
    en: 'Device Types',
    pt: 'Tipos de Dispositivo'
  },
  'advertisementForm.targeting.operatingSystems': {
    es: 'Sistemas Operativos',
    en: 'Operating Systems',
    pt: 'Sistemas Operacionais'
  },
  'advertisementForm.targeting.locations': {
    es: 'Ubicaciones',
    en: 'Locations',
    pt: 'Localizações'
  },
  'advertisementForm.targeting.interests': {
    es: 'Intereses',
    en: 'Interests',
    pt: 'Interesses'
  },
  'advertisementForm.schedule.startDate': {
    es: 'Fecha de Inicio *',
    en: 'Start Date *',
    pt: 'Data de Início *'
  },
  'advertisementForm.schedule.endDate': {
    es: 'Fecha de Fin *',
    en: 'End Date *',
    pt: 'Data de Fim *'
  },
  'advertisementForm.schedule.startTime': {
    es: 'Hora de Inicio *',
    en: 'Start Time *',
    pt: 'Hora de Início *'
  },
  'advertisementForm.schedule.endTime': {
    es: 'Hora de Fin *',
    en: 'End Time *',
    pt: 'Hora de Fim *'
  },
  'advertisementForm.schedule.daysOfWeek': {
    es: 'Días de la Semana',
    en: 'Days of the Week',
    pt: 'Dias da Semana'
  },
  'advertisementForm.schedule.daysOfWeekHelp': {
    es: 'Si no seleccionas ningún día, la publicidad se mostrará todos los días',
    en: 'If you do not select any day, the advertisement will be shown every day',
    pt: 'Se você não selecionar nenhum dia, a publicidade será exibida todos os dias'
  },
  'advertisementForm.schedule.timeSlots': {
    es: 'Slots de Tiempo Específicos',
    en: 'Specific Time Slots',
    pt: 'Slots de Tempo Específicos'
  },
  'advertisementForm.schedule.addSlot': {
    es: '+ Agregar Slot',
    en: '+ Add Slot',
    pt: '+ Adicionar Slot'
  },
  'advertisementForm.schedule.timeSlotsHelp': {
    es: 'Si no agregas slots específicos, se usará el horario general',
    en: 'If you do not add specific slots, the general schedule will be used',
    pt: 'Se você não adicionar slots específicos, o horário geral será usado'
  },
  'advertisementForm.schedule.to': {
    es: 'a',
    en: 'to',
    pt: 'a'
  },
  'advertisementForm.display.maxImpressions': {
    es: 'Impresiones Máximas',
    en: 'Maximum Impressions',
    pt: 'Impressões Máximas'
  },
  'advertisementForm.display.maxImpressionsHelp': {
    es: '0 = sin límite de impresiones',
    en: '0 = no impression limit',
    pt: '0 = sem limite de impressões'
  },
  'advertisementForm.display.maxClicks': {
    es: 'Clicks Máximos',
    en: 'Maximum Clicks',
    pt: 'Cliques Máximos'
  },
  'advertisementForm.display.maxClicksHelp': {
    es: '0 = sin límite de clicks',
    en: '0 = no click limit',
    pt: '0 = sem limite de cliques'
  },
  'advertisementForm.display.frequency': {
    es: 'Frecuencia por Usuario',
    en: 'Frequency per User',
    pt: 'Frequência por Usuário'
  },
  'advertisementForm.display.frequencyHelp': {
    es: 'Número de veces que se mostrará por usuario',
    en: 'Number of times it will be shown per user',
    pt: 'Número de vezes que será exibido por usuário'
  },
  'advertisementForm.display.priority': {
    es: 'Prioridad',
    en: 'Priority',
    pt: 'Prioridade'
  },
  'advertisementForm.display.priorityHelp': {
    es: '1 = más baja, 10 = más alta',
    en: '1 = lowest, 10 = highest',
    pt: '1 = mais baixa, 10 = mais alta'
  },
  'advertisementForm.display.activateImmediately': {
    es: 'Activar publicidad inmediatamente',
    en: 'Activate advertisement immediately',
    pt: 'Ativar publicidade imediatamente'
  },
  'advertisementForm.display.activateImmediatelyHelp': {
    es: 'Si no está marcado, la publicidad se creará como borrador',
    en: 'If not checked, the advertisement will be created as a draft',
    pt: 'Se não estiver marcado, a publicidade será criada como rascunho'
  },
  'advertisementForm.buttons.cancel': {
    es: 'Cancelar',
    en: 'Cancel',
    pt: 'Cancelar'
  },
  'advertisementForm.buttons.saving': {
    es: 'Guardando...',
    en: 'Saving...',
    pt: 'Salvando...'
  },
  'advertisementForm.buttons.update': {
    es: 'Actualizar',
    en: 'Update',
    pt: 'Atualizar'
  },
  'advertisementForm.buttons.create': {
    es: 'Crear',
    en: 'Create',
    pt: 'Criar'
  },
  'advertisementForm.daysOfWeek.sunday': {
    es: 'Domingo',
    en: 'Sunday',
    pt: 'Domingo'
  },
  'advertisementForm.daysOfWeek.monday': {
    es: 'Lunes',
    en: 'Monday',
    pt: 'Segunda-feira'
  },
  'advertisementForm.daysOfWeek.tuesday': {
    es: 'Martes',
    en: 'Tuesday',
    pt: 'Terça-feira'
  },
  'advertisementForm.daysOfWeek.wednesday': {
    es: 'Miércoles',
    en: 'Wednesday',
    pt: 'Quarta-feira'
  },
  'advertisementForm.daysOfWeek.thursday': {
    es: 'Jueves',
    en: 'Thursday',
    pt: 'Quinta-feira'
  },
  'advertisementForm.daysOfWeek.friday': {
    es: 'Viernes',
    en: 'Friday',
    pt: 'Sexta-feira'
  },
  'advertisementForm.daysOfWeek.saturday': {
    es: 'Sábado',
    en: 'Saturday',
    pt: 'Sábado'
  },
  // ===== ADMIN SALES =====
  'adminSales.title': {
    es: 'Gestión de Ventas',
    en: 'Sales Management',
    pt: 'Gestão de Vendas'
  },
  'adminSales.subtitle': {
    es: 'Monitorea y gestiona las ventas del negocio',
    en: 'Monitor and manage business sales',
    pt: 'Monitore e gerencie as vendas do negócio'
  },
  'adminSales.stats.todaySales': {
    es: 'Ventas Hoy',
    en: 'Today Sales',
    pt: 'Vendas Hoje'
  },
  'adminSales.stats.monthlySales': {
    es: 'Ventas del Mes',
    en: 'Monthly Sales',
    pt: 'Vendas do Mês'
  },
  'adminSales.stats.pendingOrders': {
    es: 'Órdenes Pendientes',
    en: 'Pending Orders',
    pt: 'Pedidos Pendentes'
  },
  'adminSales.salesHistory.title': {
    es: 'Historial de Ventas',
    en: 'Sales History',
    pt: 'Histórico de Vendas'
  },
  'adminSales.salesHistory.comingSoon': {
    es: 'Esta funcionalidad estará disponible próximamente',
    en: 'This functionality will be available soon',
    pt: 'Esta funcionalidade estará disponível em breve'
  },
  'adminSales.salesHistory.description': {
    es: 'Aquí podrás ver el historial completo de ventas y gestionar órdenes',
    en: 'Here you will be able to see the complete sales history and manage orders',
    pt: 'Aqui você poderá ver o histórico completo de vendas e gerenciar pedidos'
  },
  // ===== SIDEBAR DESCRIPTIONS =====
  'sidebar.admin.sales.description': {
    es: 'Reportes de ventas globales',
    en: 'Global sales reports',
    pt: 'Relatórios de vendas globais'
  },
  'sidebar.storeManager.sales.description': {
    es: 'Reportes de ventas de la tienda',
    en: 'Store sales reports',
    pt: 'Relatórios de vendas da loja'
  },
  // Descripciones de menús de administrador
  'sidebar.admin.dashboard.description': {
    es: 'Panel principal de administración',
    en: 'Main administration panel',
    pt: 'Painel principal de administração'
  },
  'sidebar.admin.users.description': {
    es: 'Gestión de usuarios del sistema',
    en: 'System user management',
    pt: 'Gestão de usuários do sistema'
  },
  'sidebar.admin.products.description': {
    es: 'Gestión de productos global',
    en: 'Global product management',
    pt: 'Gestão global de produtos'
  },
  'sidebar.admin.categories.description': {
    es: 'Gestión de categorías y subcategorías',
    en: 'Categories and subcategories management',
    pt: 'Gestão de categorias e subcategorias'
  },
  'sidebar.admin.promotions.description': {
    es: 'Gestión de promociones globales',
    en: 'Global promotions management',
    pt: 'Gestão global de promoções'
  },
  'sidebar.admin.analytics.description': {
    es: 'Estadísticas y métricas del sistema',
    en: 'System statistics and metrics',
    pt: 'Estatísticas e métricas do sistema'
  },
  'sidebar.admin.loyalty.description': {
    es: 'Sistema de lealtad y premios',
    en: 'Loyalty and rewards system',
    pt: 'Sistema de fidelidade e recompensas'
  },
  'sidebar.admin.registrationCodes.description': {
    es: 'Generar códigos de registro',
    en: 'Generate registration codes',
    pt: 'Gerar códigos de registro'
  },
  'sidebar.admin.globalSettings.description': {
    es: 'Configuración del sistema',
    en: 'System configuration',
    pt: 'Configuração do sistema'
  },
  // Descripciones de menús de gestor de tienda
  'sidebar.storeManager.dashboard.description': {
    es: 'Panel de gestión de tienda',
    en: 'Store management panel',
    pt: 'Painel de gestão da loja'
  },
  'sidebar.storeManager.inventory.description': {
    es: 'Configurar y gestionar inventario',
    en: 'Configure and manage inventory',
    pt: 'Configurar e gerenciar inventário'
  },
  'sidebar.storeManager.products.description': {
    es: 'Gestión de productos de la tienda',
    en: 'Store product management',
    pt: 'Gestão de produtos da loja'
  },
  'sidebar.storeManager.promotions.description': {
    es: 'Promociones de la tienda',
    en: 'Store promotions',
    pt: 'Promoções da loja'
  },
  'sidebar.storeManager.orders.description': {
    es: 'Gestión de pedidos',
    en: 'Order management',
    pt: 'Gestão de pedidos'
  },
  'sidebar.storeManager.delivery.description': {
    es: 'Asignar y gestionar delivery',
    en: 'Assign and manage delivery',
    pt: 'Atribuir e gerenciar entrega'
  },
  'sidebar.storeManager.analytics.description': {
    es: 'Estadísticas de la tienda',
    en: 'Store statistics',
    pt: 'Estatísticas da loja'
  },
  'sidebar.storeManager.messages.description': {
    es: 'Mensajería con clientes',
    en: 'Customer messaging',
    pt: 'Mensagens com clientes'
  },
  'sidebar.storeManager.reviews.description': {
    es: 'Reseñas de productos',
    en: 'Product reviews',
    pt: 'Avaliações de produtos'
  },
  'sidebar.storeManager.settings.description': {
    es: 'Configuración de la tienda',
    en: 'Store settings',
    pt: 'Configurações da loja'
  },
  // Descripciones de menús de delivery
  'sidebar.delivery.dashboard.description': {
    es: 'Panel de delivery',
    en: 'Delivery panel',
    pt: 'Painel de entrega'
  },
  'sidebar.delivery.assignedOrders.description': {
    es: 'Ver pedidos asignados',
    en: 'View assigned orders',
    pt: 'Ver pedidos atribuídos'
  },
  'sidebar.delivery.routeMap.description': {
    es: 'Mapa con rutas de entrega',
    en: 'Map with delivery routes',
    pt: 'Mapa com rotas de entrega'
  },
  'sidebar.delivery.deliveryReport.description': {
    es: 'Reportar estado de entregas',
    en: 'Report delivery status',
    pt: 'Relatar status de entrega'
  },
  'sidebar.delivery.ratings.description': {
    es: 'Ver calificaciones recibidas',
    en: 'View received ratings',
    pt: 'Ver avaliações recebidas'
  },
  'sidebar.delivery.workSchedule.description': {
    es: 'Configurar horario de trabajo',
    en: 'Configure work schedule',
    pt: 'Configurar horário de trabalho'
  },
  'sidebar.delivery.availabilityStatus.description': {
    es: 'Cambiar estado de disponibilidad',
    en: 'Change availability status',
    pt: 'Alterar status de disponibilidade'
  },
  'sidebar.delivery.profile.description': {
    es: 'Configuración del perfil',
    en: 'Profile settings',
    pt: 'Configurações do perfil'
  },
  // Descripciones de menús de cliente
  'sidebar.client.home.description': {
    es: 'Página principal',
    en: 'Home page',
    pt: 'Página inicial'
  },
  'sidebar.client.products.description': {
    es: 'Explorar productos',
    en: 'Explore products',
    pt: 'Explorar produtos'
  },
  'sidebar.client.categories.description': {
    es: 'Ver categorías',
    en: 'View categories',
    pt: 'Ver categorias'
  },
  'sidebar.client.cart.description': {
    es: 'Ver carrito de compras',
    en: 'View shopping cart',
    pt: 'Ver carrinho de compras'
  },
  'sidebar.client.favorites.description': {
    es: 'Productos favoritos',
    en: 'Favorite products',
    pt: 'Produtos favoritos'
  },
  'sidebar.client.loyalty.description': {
    es: 'Puntos y premios',
    en: 'Points and rewards',
    pt: 'Pontos e recompensas'
  },
  'sidebar.client.myOrders.description': {
    es: 'Historial de pedidos',
    en: 'Order history',
    pt: 'Histórico de pedidos'
  },
  'sidebar.client.profile.description': {
    es: 'Configuración del perfil',
    en: 'Profile settings',
    pt: 'Configurações do perfil'
  },
  'sidebar.client.security.description': {
    es: 'Configuración de seguridad',
    en: 'Security settings',
    pt: 'Configurações de segurança'
  },
  'sidebar.client.notifications.description': {
    es: 'Configurar notificaciones',
    en: 'Configure notifications',
    pt: 'Configurar notificações'
  },


  // ===== STORE MANAGER SALES =====
  'storeManagerSales.title': {
    es: 'Reportes de Ventas',
    en: 'Sales Reports',
    pt: 'Relatórios de Vendas'
  },
  'storeManagerSales.subtitle': {
    es: 'Analiza el rendimiento de ventas de tu tienda',
    en: 'Analyze your store sales performance',
    pt: 'Analise o desempenho de vendas da sua loja'
  },
  'storeManagerSales.development': {
    es: 'Funcionalidad en desarrollo',
    en: 'Feature in development',
    pt: 'Funcionalidade em desenvolvimento'
  },

  // ===== HEADER CLIENTE =====
  'header.profile': {
    es: 'Perfil',
    en: 'Profile',
    pt: 'Perfil'
  },
  'header.profile.description': {
    es: 'Gestionar información personal',
    en: 'Manage personal information',
    pt: 'Gerenciar informações pessoais'
  },
  'header.security': {
    es: 'Seguridad',
    en: 'Security',
    pt: 'Segurança'
  },
  'header.security.description': {
    es: 'Configurar seguridad y contraseñas',
    en: 'Configure security and passwords',
    pt: 'Configurar segurança e senhas'
  },
  'header.settings': {
    es: 'Configuración',
    en: 'Settings',
    pt: 'Configurações'
  },
  'header.settings.description': {
    es: 'Preferencias de la cuenta',
    en: 'Account preferences',
    pt: 'Preferências da conta'
  },
  'header.logout': {
    es: 'Cerrar Sesión',
    en: 'Logout',
    pt: 'Sair'
  },
  'header.logout.description': {
    es: 'Cerrar sesión de la cuenta',
    en: 'Sign out of account',
    pt: 'Sair da conta'
  },
  'header.continueShopping': {
    es: 'Continuar Comprando',
    en: 'Continue Shopping',
    pt: 'Continuar Comprando'
  },
  'header.favorites': {
    es: 'Favoritos',
    en: 'Favorites',
    pt: 'Favoritos'
  },
  'header.notifications': {
    es: 'Notificaciones',
    en: 'Notifications',
    pt: 'Notificações'
  },
  'header.cart': {
    es: 'Carrito',
    en: 'Cart',
    pt: 'Carrinho'
  },
  'header.hideSidebar': {
    es: 'Ocultar menú lateral',
    en: 'Hide sidebar',
    pt: 'Ocultar menu lateral'
  },
  'header.showSidebar': {
    es: 'Mostrar menú lateral',
    en: 'Show sidebar',
    pt: 'Mostrar menu lateral'
  },
  'header.noNotifications': {
    es: 'No tienes notificaciones nuevas',
    en: 'You have no new notifications',
    pt: 'Você não tem notificações novas'
  },
  
  // ===== DASHBOARD CLIENTE =====
  'dashboard.welcome': {
    es: 'Bienvenido',
    en: 'Welcome',
    pt: 'Bem-vindo'
  },
  'dashboard.subtitle': {
    es: 'Gestiona tus compras y revisa tu actividad',
    en: 'Manage your purchases and review your activity',
    pt: 'Gerencie suas compras e revise sua atividade'
  },
  'dashboard.continueShopping': {
    es: 'Continuar Comprando',
    en: 'Continue Shopping',
    pt: 'Continuar Comprando'
  },
  'dashboard.continueShopping.description': {
    es: 'Explorar más productos',
    en: 'Explore more products',
    pt: 'Explorar mais produtos'
  },
  'dashboard.viewCart': {
    es: 'Ver Carrito',
    en: 'View Cart',
    pt: 'Ver Carrinho'
  },
  'dashboard.viewCart.description': {
    es: 'Revisar productos en carrito',
    en: 'Review products in cart',
    pt: 'Revisar produtos no carrinho'
  },
  'dashboard.myOrders': {
    es: 'Mis Pedidos',
    en: 'My Orders',
    pt: 'Meus Pedidos'
  },
  'dashboard.myOrders.description': {
    es: 'Ver historial de pedidos',
    en: 'View order history',
    pt: 'Ver histórico de pedidos'
  },
  'dashboard.favorites': {
    es: 'Favoritos',
    en: 'Favorites',
    pt: 'Favoritos'
  },
  'dashboard.favorites.description': {
    es: 'Productos guardados',
    en: 'Saved products',
    pt: 'Produtos salvos'
  },
  'dashboard.totalOrders': {
    es: 'Total de Pedidos',
    en: 'Total Orders',
    pt: 'Total de Pedidos'
  },
  'dashboard.totalSpent': {
    es: 'Total Gastado',
    en: 'Total Spent',
    pt: 'Total Gasto'
  },
  'dashboard.loyaltyPoints': {
    es: 'Puntos de Fidelización',
    en: 'Loyalty Points',
    pt: 'Pontos de Fidelidade'
  },
  'dashboard.favoriteProducts': {
    es: 'Productos Favoritos',
    en: 'Favorite Products',
    pt: 'Produtos Favoritos'
  },
  'dashboard.quickActions': {
    es: 'Acciones Rápidas',
    en: 'Quick Actions',
    pt: 'Ações Rápidas'
  },
  'dashboard.recentOrders': {
    es: 'Pedidos Recientes',
    en: 'Recent Orders',
    pt: 'Pedidos Recentes'
  },
  'dashboard.recentActivity': {
    es: 'Actividad Reciente',
    en: 'Recent Activity',
    pt: 'Atividade Recente'
  },
  'dashboard.loyaltyProgram': {
    es: 'Programa de Fidelización',
    en: 'Loyalty Program',
    pt: 'Programa de Fidelidade'
  },
  'dashboard.pointsEarned': {
    es: 'Puntos Ganados',
    en: 'Points Earned',
    pt: 'Pontos Ganhos'
  },
  'dashboard.nextReward': {
    es: 'Próxima Recompensa',
    en: 'Next Reward',
    pt: 'Próxima Recompensa'
  },
  'dashboard.availableRewards': {
    es: 'Recompensas Disponibles',
    en: 'Available Rewards',
    pt: 'Recompensas Disponíveis'
  },
  'dashboard.viewAllOrders': {
    es: 'Ver Todos los Pedidos',
    en: 'View All Orders',
    pt: 'Ver Todos os Pedidos'
  },
  'dashboard.status.delivered': {
    es: 'Entregado',
    en: 'Delivered',
    pt: 'Entregue'
  },
  'dashboard.status.inTransit': {
    es: 'En Tránsito',
    en: 'In Transit',
    pt: 'Em Trânsito'
  },
  'dashboard.status.processing': {
    es: 'Procesando',
    en: 'Processing',
    pt: 'Processando'
  },

  // ===== SIDEBAR CLIENTE =====
  'sidebar.expand': {
    es: 'Expandir menú',
    en: 'Expand menu',
    pt: 'Expandir menu'
  },
  'sidebar.collapse': {
    es: 'Colapsar menú',
    en: 'Collapse menu',
    pt: 'Colapsar menu'
  },
  'sidebar.theme': {
    es: 'Tema',
    en: 'Theme',
    pt: 'Tema'
  },
  'sidebar.language': {
    es: 'Idioma',
    en: 'Language',
    pt: 'Idioma'
  },

  // ===== PEDIDOS DEL CLIENTE =====
  'orders.title': {
    es: 'Mis Pedidos',
    en: 'My Orders',
    pt: 'Meus Pedidos'
  },
  'orders.subtitle': {
    es: 'Gestiona y revisa el estado de tus pedidos',
    en: 'Manage and review the status of your orders',
    pt: 'Gerencie e revise o status dos seus pedidos'
  },
  'orders.total': {
    es: 'Total de pedidos',
    en: 'Total orders',
    pt: 'Total de pedidos'
  },
  'orders.search.placeholder': {
    es: 'Buscar por número de orden o producto...',
    en: 'Search by order number or product...',
    pt: 'Buscar por número do pedido ou produto...'
  },
  'orders.status.all': {
    es: 'Todos los pedidos',
    en: 'All orders',
    pt: 'Todos os pedidos'
  },
  'orders.status.pending': {
    es: 'Pendientes',
    en: 'Pending',
    pt: 'Pendentes'
  },
  'orders.status.confirmed': {
    es: 'Confirmados',
    en: 'Confirmed',
    pt: 'Confirmados'
  },
  'orders.status.processing': {
    es: 'En proceso',
    en: 'Processing',
    pt: 'Em processamento'
  },
  'orders.status.shipped': {
    es: 'Enviados',
    en: 'Shipped',
    pt: 'Enviados'
  },
  'orders.status.delivered': {
    es: 'Entregados',
    en: 'Delivered',
    pt: 'Entregues'
  },
  'orders.status.cancelled': {
    es: 'Cancelados',
    en: 'Cancelled',
    pt: 'Cancelados'
  },
  'orders.actions.view': {
    es: 'Ver Detalles',
    en: 'View Details',
    pt: 'Ver Detalhes'
  },
  'orders.actions.download': {
    es: 'Imprimir Factura',
    en: 'Print Invoice',
    pt: 'Imprimir Fatura'
  },
  'orders.actions.rate': {
    es: 'Calificar',
    en: 'Rate',
    pt: 'Avaliar'
  },

  // ===== FAVORITOS =====
  'favorites.title': {
    es: 'Mis Favoritos',
    en: 'My Favorites',
    pt: 'Meus Favoritos'
  },
  'favorites.subtitle': {
    es: 'Productos que te han gustado',
    en: 'Products you liked',
    pt: 'Produtos que você gostou'
  },
  'favorites.product': {
    es: 'producto',
    en: 'product',
    pt: 'produto'
  },
  'favorites.products': {
    es: 'productos',
    en: 'products',
    pt: 'produtos'
  },
  'favorites.inFavorites': {
    es: 'en tus favoritos',
    en: 'in your favorites',
    pt: 'nos seus favoritos'
  },
  'favorites.empty.title': {
    es: 'No tienes favoritos',
    en: 'You have no favorites',
    pt: 'Você não tem favoritos'
  },
  'favorites.empty.description': {
    es: 'Agrega productos a tus favoritos para verlos aquí',
    en: 'Add products to your favorites to see them here',
    pt: 'Adicione produtos aos seus favoritos para vê-los aqui'
  },
  'favorites.empty.explore': {
    es: 'Explorar Productos',
    en: 'Explore Products',
    pt: 'Explorar Produtos'
  },
  'favorites.search.placeholder': {
    es: 'Buscar en favoritos...',
    en: 'Search in favorites...',
    pt: 'Buscar nos favoritos...'
  },
  'favorites.filters.allCategories': {
    es: 'Todas las categorías',
    en: 'All categories',
    pt: 'Todas as categorias'
  },
  'favorites.sort.date': {
    es: 'Más recientes',
    en: 'Most recent',
    pt: 'Mais recentes'
  },
  'favorites.sort.name': {
    es: 'Por nombre',
    en: 'By name',
    pt: 'Por nome'
  },
  'favorites.sort.price': {
    es: 'Por precio',
    en: 'By price',
    pt: 'Por preço'
  },
  'favorites.actions.addToCart': {
    es: 'Agregar',
    en: 'Add',
    pt: 'Adicionar'
  },
  'favorites.actions.remove': {
    es: 'Eliminar de favoritos',
    en: 'Remove from favorites',
    pt: 'Remover dos favoritos'
  },
  'favorites.actions.share': {
    es: 'Compartir producto',
    en: 'Share product',
    pt: 'Compartilhar produto'
  },
  'favorites.addedOn': {
    es: 'Agregado el',
    en: 'Added on',
    pt: 'Adicionado em'
  },
  'favorites.noResults.title': {
    es: 'No se encontraron resultados',
    en: 'No results found',
    pt: 'Nenhum resultado encontrado'
  },
  'favorites.noResults.description': {
    es: 'Intenta ajustar tus filtros de búsqueda',
    en: 'Try adjusting your search filters',
    pt: 'Tente ajustar seus filtros de busca'
  },
  'favorites.continueExploring': {
    es: 'Continuar Explorando',
    en: 'Continue Exploring',
    pt: 'Continuar Explorando'
  },

  // ===== CARRITO =====
  'cart.title': {
    es: 'Carrito de Compras',
    en: 'Shopping Cart',
    pt: 'Carrinho de Compras'
  },
  'cart.subtitle': {
    es: 'Revisa tus productos seleccionados',
    en: 'Review your selected products',
    pt: 'Revise seus produtos selecionados'
  },
  'cart.product': {
    es: 'producto',
    en: 'product',
    pt: 'produto'
  },
  'cart.products': {
    es: 'productos',
    en: 'products',
    pt: 'produtos'
  },
  'cart.inCart': {
    es: 'en tu carrito',
    en: 'in your cart',
    pt: 'no seu carrinho'
  },
  'cart.empty.title': {
    es: 'Tu carrito está vacío',
    en: 'Your cart is empty',
    pt: 'Seu carrinho está vazio'
  },
  'cart.empty.description': {
    es: 'Agrega productos a tu carrito para comenzar a comprar',
    en: 'Add products to your cart to start shopping',
    pt: 'Adicione produtos ao seu carrinho para começar a comprar'
  },
  'cart.empty.explore': {
    es: 'Explorar Productos',
    en: 'Explore Products',
    pt: 'Explorar Produtos'
  },
  'cart.items.title': {
    es: 'Productos',
    en: 'Products',
    pt: 'Produtos'
  },
  'cart.summary.title': {
    es: 'Resumen del Pedido',
    en: 'Order Summary',
    pt: 'Resumo do Pedido'
  },
  'cart.summary.subtotal': {
    es: 'Subtotal',
    en: 'Subtotal',
    pt: 'Subtotal'
  },
  'cart.summary.shipping': {
    es: 'Envío',
    en: 'Shipping',
    pt: 'Envio'
  },
  'cart.summary.free': {
    es: 'Gratis',
    en: 'Free',
    pt: 'Grátis'
  },
  'cart.summary.taxes': {
    es: 'Impuestos',
    en: 'Taxes',
    pt: 'Impostos'
  },
  'cart.summary.total': {
    es: 'Total',
    en: 'Total',
    pt: 'Total'
  },
  'cart.actions.checkout': {
    es: 'Proceder al Pago',
    en: 'Proceed to Payment',
    pt: 'Prosseguir para Pagamento'
  },
  'cart.actions.continueShopping': {
    es: 'Continuar Comprando',
    en: 'Continue Shopping',
    pt: 'Continuar Comprando'
  },
  'cart.actions.clear': {
    es: 'Vaciar Carrito',
    en: 'Clear Cart',
    pt: 'Limpar Carrinho'
  },
  'cart.actions.confirm': {
    es: 'Confirmar',
    en: 'Confirm',
    pt: 'Confirmar'
  },
  'cart.actions.cancel': {
    es: 'Cancelar',
    en: 'Cancel',
    pt: 'Cancelar'
  },
  'cart.actions.remove': {
    es: 'Eliminar producto',
    en: 'Remove product',
    pt: 'Remover produto'
  },
  'cart.actions.share': {
    es: 'Compartir carrito',
    en: 'Share cart',
    pt: 'Compartilhar carrinho'
  },
  'cart.info.title': {
    es: 'Información importante',
    en: 'Important information',
    pt: 'Informação importante'
  },
  'cart.info.description': {
    es: 'Los precios pueden variar según la disponibilidad. El envío es gratuito para pedidos superiores a $50.',
    en: 'Prices may vary based on availability. Shipping is free for orders over $50.',
    pt: 'Os preços podem variar conforme a disponibilidade. O envio é gratuito para pedidos acima de $50.'
  },
  'cart.benefits.title': {
    es: 'Beneficios de tu compra',
    en: 'Benefits of your purchase',
    pt: 'Benefícios da sua compra'
  },
  'cart.benefits.freeShipping': {
    es: 'Envío gratuito',
    en: 'Free shipping',
    pt: 'Envio gratuito'
  },
  'cart.benefits.securePayment': {
    es: 'Pago seguro',
    en: 'Secure payment',
    pt: 'Pagamento seguro'
  },
  'cart.benefits.returns': {
    es: 'Devoluciones fáciles',
    en: 'Easy returns',
    pt: 'Devoluções fáceis'
  },
  'cart.share.title': {
    es: 'Mi carrito de compras',
    en: 'My shopping cart',
    pt: 'Meu carrinho de compras'
  },
  'cart.share.total': {
    es: 'Total',
    en: 'Total',
    pt: 'Total'
  },
  'cart.checkout.development': {
    es: 'Funcionalidad de checkout en desarrollo',
    en: 'Checkout functionality in development',
    pt: 'Funcionalidade de checkout em desenvolvimento'
  },

  // Nuevas funcionalidades del carrito
  'cart.actions.more': {
    es: 'Más acciones',
    en: 'More actions',
    pt: 'Mais ações'
  },
  'cart.actions.print': {
    es: 'Imprimir carrito',
    en: 'Print cart',
    pt: 'Imprimir carrinho'
  },
  'cart.actions.download': {
    es: 'Descargar carrito',
    en: 'Download cart',
    pt: 'Baixar carrinho'
  },
  'cart.actions.copySummary': {
    es: 'Copiar resumen',
    en: 'Copy summary',
    pt: 'Copiar resumo'
  },
  'cart.actions.compare': {
    es: 'Comparar productos',
    en: 'Compare products',
    pt: 'Comparar produtos'
  },
  'cart.actions.coupon': {
    es: 'Cupón',
    en: 'Coupon',
    pt: 'Cupom'
  },
  'cart.actions.quickView': {
    es: 'Vista rápida',
    en: 'Quick view',
    pt: 'Visualização rápida'
  },
  'cart.actions.addToFavorites': {
    es: 'Agregar a favoritos',
    en: 'Add to favorites',
    pt: 'Adicionar aos favoritos'
  },
  'cart.actions.saveForLater': {
    es: 'Guardar para después',
    en: 'Save for later',
    pt: 'Salvar para depois'
  },
  'cart.actions.copied': {
    es: 'Resumen copiado al portapapeles',
    en: 'Summary copied to clipboard',
    pt: 'Resumo copiado para a área de transferência'
  },
  'cart.actions.compareFeature': {
    es: 'Funcionalidad de comparación en desarrollo',
    en: 'Compare feature in development',
    pt: 'Funcionalidade de comparação em desenvolvimento'
  },
  'cart.actions.addedToFavorites': {
    es: 'Producto agregado a favoritos',
    en: 'Product added to favorites',
    pt: 'Produto adicionado aos favoritos'
  },

  // Cupones
  'cart.coupon.title': {
    es: 'Aplicar Cupón',
    en: 'Apply Coupon',
    pt: 'Aplicar Cupom'
  },
  'cart.coupon.code': {
    es: 'Código de cupón',
    en: 'Coupon code',
    pt: 'Código do cupom'
  },
  'cart.coupon.placeholder': {
    es: 'Ingresa tu código de cupón',
    en: 'Enter your coupon code',
    pt: 'Digite seu código de cupom'
  },
  'cart.coupon.available': {
    es: 'Cupones disponibles',
    en: 'Available coupons',
    pt: 'Cupons disponíveis'
  },
  'cart.coupon.apply': {
    es: 'Aplicar',
    en: 'Apply',
    pt: 'Aplicar'
  },
  'cart.coupon.applied': {
    es: 'Cupón aplicado exitosamente',
    en: 'Coupon applied successfully',
    pt: 'Cupom aplicado com sucesso'
  },
  'cart.coupon.invalid': {
    es: 'Código de cupón inválido',
    en: 'Invalid coupon code',
    pt: 'Código de cupom inválido'
  },
  'cart.coupon.minAmount': {
    es: 'Monto mínimo requerido: ${amount}',
    en: 'Minimum amount required: ${amount}',
    pt: 'Valor mínimo necessário: ${amount}'
  },

  // Envío
  'cart.shipping.title': {
    es: 'Opciones de Envío',
    en: 'Shipping Options',
    pt: 'Opções de Envio'
  },
  'cart.shipping.free': {
    es: 'Gratis',
    en: 'Free',
    pt: 'Grátis'
  },
  'cart.shipping.confirm': {
    es: 'Confirmar envío',
    en: 'Confirm shipping',
    pt: 'Confirmar envio'
  },

  // Vista rápida
  'cart.quickView.title': {
    es: 'Vista Rápida del Producto',
    en: 'Product Quick View',
    pt: 'Visualização Rápida do Produto'
  },
  'cart.quickView.quantity': {
    es: 'Cantidad',
    en: 'Quantity',
    pt: 'Quantidade'
  },
  'cart.quickView.close': {
    es: 'Cerrar',
    en: 'Close',
    pt: 'Fechar'
  },

  // Guardado para después
  'cart.saved.title': {
    es: 'Guardado para Después',
    en: 'Saved for Later',
    pt: 'Salvo para Depois'
  },
  'cart.saved.moveToCart': {
    es: 'Mover al carrito',
    en: 'Move to cart',
    pt: 'Mover para o carrinho'
  },
  'cart.saved.confirmTitle': {
    es: 'Guardar para Después',
    en: 'Save for Later',
    pt: 'Salvar para Depois'
  },
  'cart.saved.confirmMessage': {
    es: '¿Estás seguro de que quieres guardar este producto para después? Se moverá de tu carrito a la sección "Guardado para después".',
    en: 'Are you sure you want to save this product for later? It will be moved from your cart to the "Saved for Later" section.',
    pt: 'Tem certeza de que deseja salvar este produto para depois? Ele será movido do seu carrinho para a seção "Salvo para Depois".'
  },
  'cart.saved.confirm': {
    es: 'Guardar',
    en: 'Save',
    pt: 'Salvar'
  },

  // Resumen del pedido - nuevas funcionalidades
  'cart.summary.coupon': {
    es: 'Cupón',
    en: 'Coupon',
    pt: 'Cupom'
  },
  'cart.summary.subtotalAfterDiscount': {
    es: 'Subtotal después del descuento',
    en: 'Subtotal after discount',
    pt: 'Subtotal após desconto'
  },
  'cart.summary.savings': {
    es: 'Ahorro total',
    en: 'Total savings',
    pt: 'Economia total'
  },
  'orders.downloading': {
    es: 'Generando factura...',
    en: 'Generating invoice...',
    pt: 'Gerando fatura...'
  },
  'orders.download.success': {
    es: 'Factura generada exitosamente',
    en: 'Invoice generated successfully',
    pt: 'Fatura gerada com sucesso'
  },
  'orders.download.error': {
    es: 'Error al generar la factura',
    en: 'Error generating invoice',
    pt: 'Erro ao gerar a fatura'
  },

  // ===== STORE MANAGER DASHBOARD =====
  'storeManagerDashboard.title': {
    es: 'Dashboard de Gestión de Tienda',
    en: 'Store Management Dashboard',
    pt: 'Dashboard de Gerenciamento da Loja'
  },
  'storeManagerDashboard.welcome': {
    es: 'Bienvenido',
    en: 'Welcome',
    pt: 'Bem-vindo'
  },
  'storeManagerDashboard.stats.products': {
    es: 'Productos',
    en: 'Products',
    pt: 'Produtos'
  },
  'storeManagerDashboard.stats.activePromotions': {
    es: 'Promociones Activas',
    en: 'Active Promotions',
    pt: 'Promoções Ativas'
  },
  'storeManagerDashboard.stats.pendingOrders': {
    es: 'Pedidos Pendientes',
    en: 'Pending Orders',
    pt: 'Pedidos Pendentes'
  },
  'storeManagerDashboard.stats.monthlySales': {
    es: 'Ventas del Mes',
    en: 'Monthly Sales',
    pt: 'Vendas do Mês'
  },
  'storeManagerDashboard.stats.averageRating': {
    es: 'Calificación Promedio',
    en: 'Average Rating',
    pt: 'Avaliação Média'
  },
  'storeManagerDashboard.stats.monthlyGrowth': {
    es: 'Crecimiento Mensual',
    en: 'Monthly Growth',
    pt: 'Crescimento Mensal'
  },
  'storeManagerDashboard.stats.conversionRate': {
    es: 'Tasa de Conversión',
    en: 'Conversion Rate',
    pt: 'Taxa de Conversão'
  },

  // ===== GESTIÓN DE INVENTARIO =====
  'inventory.title': {
    es: 'Gestión de Inventario',
    en: 'Inventory Management',
    pt: 'Gestão de Inventário'
  },
  'inventory.subtitle': {
    es: 'Configura y gestiona el inventario de tus tiendas y sucursales',
    en: 'Configure and manage inventory for your stores and branches',
    pt: 'Configure e gerencie o inventário das suas lojas e filiais'
  },
  'inventory.types.title': {
    es: 'Tipos de Inventario',
    en: 'Inventory Types',
    pt: 'Tipos de Inventário'
  },
  'inventory.types.global': {
    es: 'Global - Stock centralizado',
    en: 'Global - Centralized stock',
    pt: 'Global - Estoque centralizado'
  },
  'inventory.types.separate': {
    es: 'Separado - Stock independiente',
    en: 'Separate - Independent stock',
    pt: 'Separado - Estoque independente'
  },
  'inventory.types.hybrid': {
    es: 'Híbrido - Combinación',
    en: 'Hybrid - Combination',
    pt: 'Híbrido - Combinação'
  },
  'inventory.stats.title': {
    es: 'Estadísticas',
    en: 'Statistics',
    pt: 'Estatísticas'
  },
  'inventory.stats.totalProducts': {
    es: 'Productos totales:',
    en: 'Total products:',
    pt: 'Produtos totais:'
  },
  'inventory.stats.lowStock': {
    es: 'Stock bajo:',
    en: 'Low stock:',
    pt: 'Estoque baixo:'
  },
  'inventory.stats.noStock': {
    es: 'Sin stock:',
    en: 'No stock:',
    pt: 'Sem estoque:'
  },
  'inventory.actions.title': {
    es: 'Acciones',
    en: 'Actions',
    pt: 'Ações'
  },
  'inventory.actions.configure': {
    es: 'Configurar Inventario',
    en: 'Configure Inventory',
    pt: 'Configurar Inventário'
  },
  'inventory.actions.reports': {
    es: 'Ver Reportes',
    en: 'View Reports',
    pt: 'Ver Relatórios'
  },
  'inventory.actions.transfers': {
    es: 'Transferencias',
    en: 'Transfers',
    pt: 'Transferências'
  },
  'inventory.alerts.title': {
    es: 'Alertas de Inventario',
    en: 'Inventory Alerts',
    pt: 'Alertas de Inventário'
  },
  'inventory.alerts.lowStock': {
    es: '12 productos con stock bajo',
    en: '12 products with low stock',
    pt: '12 produtos com estoque baixo'
  },
  'inventory.alerts.noStock': {
    es: '3 productos sin stock',
    en: '3 products with no stock',
    pt: '3 produtos sem estoque'
  },
  'inventory.alerts.pendingTransfers': {
    es: '2 transferencias pendientes',
    en: '2 pending transfers',
    pt: '2 transferências pendentes'
  },
  'inventoryReports.title': {
    es: 'Reportes de Inventario',
    en: 'Inventory Reports',
    pt: 'Relatórios de Inventário'
  },
  'inventoryReports.subtitle': {
    es: 'Analiza y visualiza el estado de tu inventario',
    en: 'Analyze and visualize your inventory status',
    pt: 'Analise e visualize o status do seu inventário'
  },
  'inventoryReports.overview': {
    es: 'Vista General',
    en: 'Overview',
    pt: 'Visão Geral'
  },
  'inventoryReports.movements': {
    es: 'Movimientos',
    en: 'Movements',
    pt: 'Movimentos'
  },
  'inventoryReports.topProducts': {
    es: 'Productos Top',
    en: 'Top Products',
    pt: 'Produtos Top'
  },
  'inventoryReports.alerts': {
    es: 'Alertas',
    en: 'Alerts',
    pt: 'Alertas'
  },
  'inventoryReports.export': {
    es: 'Exportar',
    en: 'Export',
    pt: 'Exportar'
  },
  'inventoryReports.period': {
    es: 'Período',
    en: 'Period',
    pt: 'Período'
  },
  'inventoryReports.last7Days': {
    es: 'Últimos 7 días',
    en: 'Last 7 days',
    pt: 'Últimos 7 dias'
  },
  'inventoryReports.last30Days': {
    es: 'Últimos 30 días',
    en: 'Last 30 days',
    pt: 'Últimos 30 dias'
  },
  'inventoryReports.last90Days': {
    es: 'Últimos 90 días',
    en: 'Last 90 days',
    pt: 'Últimos 90 dias'
  },
  'inventoryReports.lastYear': {
    es: 'Último año',
    en: 'Last year',
    pt: 'Último ano'
  },
  'inventoryReports.totalProducts': {
    es: 'Total Productos',
    en: 'Total Products',
    pt: 'Total de Produtos'
  },
  'inventoryReports.lowStock': {
    es: 'Stock Bajo',
    en: 'Low Stock',
    pt: 'Estoque Baixo'
  },
  'inventoryReports.noStock': {
    es: 'Sin Stock',
    en: 'No Stock',
    pt: 'Sem Estoque'
  },
  'inventoryReports.totalValue': {
    es: 'Valor Total',
    en: 'Total Value',
    pt: 'Valor Total'
  },
  'inventoryReports.movementsTitle': {
    es: 'Movimientos de Inventario',
    en: 'Inventory Movements',
    pt: 'Movimentos de Inventário'
  },
  'inventoryReports.date': {
    es: 'Fecha',
    en: 'Date',
    pt: 'Data'
  },
  'inventoryReports.type': {
    es: 'Tipo',
    en: 'Type',
    pt: 'Tipo'
  },
  'inventoryReports.product': {
    es: 'Producto',
    en: 'Product',
    pt: 'Produto'
  },
  'inventoryReports.quantity': {
    es: 'Cantidad',
    en: 'Quantity',
    pt: 'Quantidade'
  },
  'inventoryReports.entry': {
    es: 'Entrada',
    en: 'Entry',
    pt: 'Entrada'
  },
  'inventoryReports.exit': {
    es: 'Salida',
    en: 'Exit',
    pt: 'Saída'
  },
  'inventoryReports.topProductsTitle': {
    es: 'Productos Más Vendidos',
    en: 'Top Selling Products',
    pt: 'Produtos Mais Vendidos'
  },
  'inventoryReports.stock': {
    es: 'Stock',
    en: 'Stock',
    pt: 'Estoque'
  },
  'inventoryReports.sales': {
    es: 'ventas',
    en: 'sales',
    pt: 'vendas'
  },
  'inventoryReports.alertsTitle': {
    es: 'Alertas de Inventario',
    en: 'Inventory Alerts',
    pt: 'Alertas de Inventário'
  },
  'inventoryReports.noStockAlert': {
    es: 'Productos sin stock',
    en: 'Products with no stock',
    pt: 'Produtos sem estoque'
  },
  'inventoryReports.lowStockAlert': {
    es: 'Stock bajo',
    en: 'Low stock',
    pt: 'Estoque baixo'
  },
  'inventoryReports.pendingTransfersAlert': {
    es: 'Transferencias pendientes',
    en: 'Pending transfers',
    pt: 'Transferências pendentes'
  },
  'inventoryReports.noStockDescription': {
    es: '3 productos requieren reabastecimiento inmediato',
    en: '3 products require immediate restocking',
    pt: '3 produtos requerem reabastecimento imediato'
  },
  'inventoryReports.lowStockDescription': {
    es: '12 productos con stock por debajo del mínimo',
    en: '12 products with stock below minimum',
    pt: '12 produtos com estoque abaixo do mínimo'
  },
  'inventoryReports.pendingTransfersDescription': {
    es: '2 transferencias entre sucursales en proceso',
    en: '2 transfers between branches in process',
    pt: '2 transferências entre filiais em processo'
  },
  'inventoryTransfers.title': {
    es: 'Transferencias de Inventario',
    en: 'Inventory Transfers',
    pt: 'Transferências de Inventário'
  },
  'inventoryTransfers.subtitle': {
    es: 'Gestiona las transferencias de productos entre sucursales',
    en: 'Manage product transfers between branches',
    pt: 'Gerencie transferências de produtos entre filiais'
  },
  'inventoryTransfers.newTransfer': {
    es: 'Nueva Transferencia',
    en: 'New Transfer',
    pt: 'Nova Transferência'
  },
  'inventoryTransfers.filterByStatus': {
    es: 'Filtrar por Estado',
    en: 'Filter by Status',
    pt: 'Filtrar por Status'
  },
  'inventoryTransfers.all': {
    es: 'Todas',
    en: 'All',
    pt: 'Todas'
  },
  'inventoryTransfers.pending': {
    es: 'Pendientes',
    en: 'Pending',
    pt: 'Pendentes'
  },
  'inventoryTransfers.inTransit': {
    es: 'En Tránsito',
    en: 'In Transit',
    pt: 'Em Trânsito'
  },
  'inventoryTransfers.completed': {
    es: 'Completadas',
    en: 'Completed',
    pt: 'Concluídas'
  },
  'inventoryTransfers.cancelled': {
    es: 'Canceladas',
    en: 'Cancelled',
    pt: 'Canceladas'
  },
  'inventoryTransfers.totalTransfers': {
    es: 'Total Transferencias',
    en: 'Total Transfers',
    pt: 'Total de Transferências'
  },
  'inventoryTransfers.pendingTransfers': {
    es: 'Pendientes',
    en: 'Pending',
    pt: 'Pendentes'
  },
  'inventoryTransfers.inTransitTransfers': {
    es: 'En Tránsito',
    en: 'In Transit',
    pt: 'Em Trânsito'
  },
  'inventoryTransfers.completedTransfers': {
    es: 'Completadas',
    en: 'Completed',
    pt: 'Concluídas'
  },
  'inventoryTransfers.transfers': {
    es: 'Transferencias',
    en: 'Transfers',
    pt: 'Transferências'
  },
  'inventoryTransfers.id': {
    es: 'ID',
    en: 'ID',
    pt: 'ID'
  },
  'inventoryTransfers.from': {
    es: 'Desde',
    en: 'From',
    pt: 'De'
  },
  'inventoryTransfers.to': {
    es: 'Hacia',
    en: 'To',
    pt: 'Para'
  },
  'inventoryTransfers.status': {
    es: 'Estado',
    en: 'Status',
    pt: 'Status'
  },
  'inventoryTransfers.date': {
    es: 'Fecha',
    en: 'Date',
    pt: 'Data'
  },
  'inventoryTransfers.actions': {
    es: 'Acciones',
    en: 'Actions',
    pt: 'Ações'
  },
  'inventoryTransfers.complete': {
    es: 'Completar',
    en: 'Complete',
    pt: 'Completar'
  },
  'inventoryTransfers.cancel': {
    es: 'Cancelar',
    en: 'Cancel',
    pt: 'Cancelar'
  },
  'inventoryTransfers.pendingStatus': {
    es: 'Pendiente',
    en: 'Pending',
    pt: 'Pendente'
  },
  'inventoryTransfers.inTransitStatus': {
    es: 'En Tránsito',
    en: 'In Transit',
    pt: 'Em Trânsito'
  },
  'inventoryTransfers.completedStatus': {
    es: 'Completada',
    en: 'Completed',
    pt: 'Concluída'
  },
  'inventoryTransfers.cancelledStatus': {
    es: 'Cancelada',
    en: 'Cancelled',
    pt: 'Cancelada'
  },
  'inventoryTransfers.unknown': {
    es: 'Desconocido',
    en: 'Unknown',
    pt: 'Desconhecido'
  },
  'inventoryTransfers.noTransfersFound': {
    es: 'No se encontraron transferencias con los filtros seleccionados',
    en: 'No transfers found with selected filters',
    pt: 'Nenhuma transferência encontrada com os filtros selecionados'
  },
  'inventoryTransfers.newTransferModal': {
    es: 'Nueva Transferencia',
    en: 'New Transfer',
    pt: 'Nova Transferência'
  },
  'inventoryTransfers.newTransferDescription': {
    es: 'Funcionalidad en desarrollo. Aquí se implementará el formulario para crear nuevas transferencias.',
    en: 'Feature under development. The form to create new transfers will be implemented here.',
    pt: 'Funcionalidade em desenvolvimento. O formulário para criar novas transferências será implementado aqui.'
  },
  'inventoryTransfers.cancelButton': {
    es: 'Cancelar',
    en: 'Cancel',
    pt: 'Cancelar'
  },
  'inventoryTransfers.createButton': {
    es: 'Crear',
    en: 'Create',
    pt: 'Criar'
  },
  'inventoryTransfers.fromStore': {
    es: 'Tienda de Origen',
    en: 'From Store',
    pt: 'Loja de Origem'
  },
  'inventoryTransfers.toStore': {
    es: 'Tienda de Destino',
    en: 'To Store',
    pt: 'Loja de Destino'
  },
  'inventoryTransfers.product': {
    es: 'Producto',
    en: 'Product',
    pt: 'Produto'
  },
  'inventoryTransfers.quantity': {
    es: 'Cantidad',
    en: 'Quantity',
    pt: 'Quantidade'
  },
  'inventoryTransfers.notes': {
    es: 'Notas',
    en: 'Notes',
    pt: 'Notas'
  },
  'inventoryTransfers.required': {
    es: 'Requerido',
    en: 'Required',
    pt: 'Obrigatório'
  },
  'inventoryTransfers.optional': {
    es: 'Opcional',
    en: 'Optional',
    pt: 'Opcional'
  },
  'inventoryTransfers.selectFromStore': {
    es: 'Seleccionar tienda de origen',
    en: 'Select origin store',
    pt: 'Selecionar loja de origem'
  },
  'inventoryTransfers.selectToStore': {
    es: 'Seleccionar tienda de destino',
    en: 'Select destination store',
    pt: 'Selecionar loja de destino'
  },
  'inventoryTransfers.selectProduct': {
    es: 'Seleccionar producto',
    en: 'Select product',
    pt: 'Selecionar produto'
  },
  'inventoryTransfers.enterQuantity': {
    es: 'Ingrese la cantidad',
    en: 'Enter quantity',
    pt: 'Digite a quantidade'
  },
  'inventoryTransfers.addNotes': {
    es: 'Agregue notas adicionales sobre la transferencia...',
    en: 'Add additional notes about the transfer...',
    pt: 'Adicione notas adicionais sobre a transferência...'
  },
  'inventoryTransfers.maxStock': {
    es: 'Máx',
    en: 'Max',
    pt: 'Máx'
  },
  'inventoryTransfers.stockAvailable': {
    es: 'Stock disponible',
    en: 'Stock available',
    pt: 'Estoque disponível'
  },
  'inventoryTransfers.transferCreated': {
    es: '¡Transferencia Creada!',
    en: 'Transfer Created!',
    pt: 'Transferência Criada!'
  },
  'inventoryTransfers.transferCreatedMessage': {
    es: 'La transferencia ha sido creada exitosamente y está pendiente de aprobación.',
    en: 'The transfer has been created successfully and is pending approval.',
    pt: 'A transferência foi criada com sucesso e está pendente de aprovação.'
  },
  'inventoryTransfers.creating': {
    es: 'Creando...',
    en: 'Creating...',
    pt: 'Criando...'
  },
  'inventoryReports.exportModal.title': {
    es: 'Exportar Reporte',
    en: 'Export Report',
    pt: 'Exportar Relatório'
  },
  'inventoryReports.exportModal.reportDetails': {
    es: 'Detalles del Reporte',
    en: 'Report Details',
    pt: 'Detalhes do Relatório'
  },
  'inventoryReports.exportModal.type': {
    es: 'Tipo',
    en: 'Type',
    pt: 'Tipo'
  },
  'inventoryReports.exportModal.period': {
    es: 'Período',
    en: 'Period',
    pt: 'Período'
  },
  'inventoryReports.exportModal.exportFormat': {
    es: 'Formato de Exportación',
    en: 'Export Format',
    pt: 'Formato de Exportação'
  },
  'inventoryReports.exportModal.excelDescription': {
    es: 'Formato ideal para análisis y manipulación de datos',
    en: 'Ideal format for data analysis and manipulation',
    pt: 'Formato ideal para análise e manipulação de dados'
  },
  'inventoryReports.exportModal.pdfDescription': {
    es: 'Formato perfecto para presentaciones y reportes formales',
    en: 'Perfect format for presentations and formal reports',
    pt: 'Formato perfeito para apresentações e relatórios formais'
  },
  'inventoryReports.exportModal.csvDescription': {
    es: 'Formato simple para importar a otras aplicaciones',
    en: 'Simple format to import into other applications',
    pt: 'Formato simples para importar em outras aplicações'
  },
  'inventoryReports.exportModal.additionalOptions': {
    es: 'Opciones Adicionales',
    en: 'Additional Options',
    pt: 'Opções Adicionais'
  },
  'inventoryReports.exportModal.includeCharts': {
    es: 'Incluir gráficos y visualizaciones',
    en: 'Include charts and visualizations',
    pt: 'Incluir gráficos e visualizações'
  },
  'inventoryReports.exportModal.customDateRange': {
    es: 'Rango de Fechas Personalizado',
    en: 'Custom Date Range',
    pt: 'Intervalo de Datas Personalizado'
  },
  'inventoryReports.exportModal.startDate': {
    es: 'Fecha de Inicio',
    en: 'Start Date',
    pt: 'Data de Início'
  },
  'inventoryReports.exportModal.endDate': {
    es: 'Fecha de Fin',
    en: 'End Date',
    pt: 'Data de Fim'
  },
  'inventoryReports.exportModal.exportReport': {
    es: 'Exportar Reporte',
    en: 'Export Report',
    pt: 'Exportar Relatório'
  },
  'inventoryReports.exportModal.exporting': {
    es: 'Exportando...',
    en: 'Exporting...',
    pt: 'Exportando...'
  },
  'inventoryReports.exportModal.exportSuccess': {
    es: '¡Reporte Exportado!',
    en: 'Report Exported!',
    pt: 'Relatório Exportado!'
  },
  'inventoryReports.exportModal.exportSuccessMessage': {
    es: 'El reporte se ha descargado exitosamente en tu dispositivo.',
    en: 'The report has been successfully downloaded to your device.',
    pt: 'O relatório foi baixado com sucesso no seu dispositivo.'
  },
  'storeManagerDashboard.quickActions.title': {
    es: 'Acciones Rápidas',
    en: 'Quick Actions',
    pt: 'Ações Rápidas'
  },
  'storeManagerDashboard.quickActions.addProduct': {
    es: 'Agregar Producto',
    en: 'Add Product',
    pt: 'Adicionar Produto'
  },
  'storeManagerDashboard.quickActions.createPromotion': {
    es: 'Crear Promoción',
    en: 'Create Promotion',
    pt: 'Criar Promoção'
  },
  'storeManagerDashboard.quickActions.viewOrders': {
    es: 'Ver Pedidos',
    en: 'View Orders',
    pt: 'Ver Pedidos'
  },
  'storeManagerDashboard.quickActions.messages': {
    es: 'Mensajes',
    en: 'Messages',
    pt: 'Mensagens'
  },
  'storeManagerDashboard.recentOrders.title': {
    es: 'Pedidos Recientes',
    en: 'Recent Orders',
    pt: 'Pedidos Recentes'
  },
  'storeManagerDashboard.recentOrders.id': {
    es: 'ID',
    en: 'ID',
    pt: 'ID'
  },
  'storeManagerDashboard.recentOrders.customer': {
    es: 'Cliente',
    en: 'Customer',
    pt: 'Cliente'
  },
  'storeManagerDashboard.recentOrders.amount': {
    es: 'Monto',
    en: 'Amount',
    pt: 'Valor'
  },
  'storeManagerDashboard.recentOrders.status': {
    es: 'Estado',
    en: 'Status',
    pt: 'Status'
  },
  'storeManagerDashboard.recentOrders.date': {
    es: 'Fecha',
    en: 'Date',
    pt: 'Data'
  },
  'storeManagerDashboard.recentOrders.statuses.pending': {
    es: 'Pendiente',
    en: 'Pending',
    pt: 'Pendente'
  },
  'storeManagerDashboard.recentOrders.statuses.inProcess': {
    es: 'En proceso',
    en: 'In Process',
    pt: 'Em Processo'
  },
  'storeManagerDashboard.recentOrders.statuses.delivered': {
    es: 'Entregado',
    en: 'Delivered',
    pt: 'Entregue'
  },

  // ===== ADMIN LOYALTY =====
  'adminLoyalty.title': {
    es: 'Gestión de Fidelización',
    en: 'Loyalty Management',
    pt: 'Gerenciamento de Fidelização'
  },
  'adminLoyalty.subtitle': {
    es: 'Administra el programa de lealtad de clientes',
    en: 'Manage the customer loyalty program',
    pt: 'Gerencie o programa de fidelidade de clientes'
  },
  'adminLoyalty.tabs.overview': {
    es: 'Resumen',
    en: 'Overview',
    pt: 'Visão Geral'
  },
  'adminLoyalty.tabs.rewards': {
    es: 'Premios',
    en: 'Rewards',
    pt: 'Prêmios'
  },
  'adminLoyalty.tabs.redemptions': {
    es: 'Canjes',
    en: 'Redemptions',
    pt: 'Resgates'
  },
  'adminLoyalty.tabs.policies': {
    es: 'Políticas',
    en: 'Policies',
    pt: 'Políticas'
  },
  'adminLoyalty.stats.activeCustomers': {
    es: 'Clientes Activos',
    en: 'Active Customers',
    pt: 'Clientes Ativos'
  },
  'adminLoyalty.stats.pointsAwarded': {
    es: 'Puntos Otorgados',
    en: 'Points Awarded',
    pt: 'Pontos Concedidos'
  },
  'adminLoyalty.stats.rewardsRedeemed': {
    es: 'Premios Canjeados',
    en: 'Rewards Redeemed',
    pt: 'Prêmios Resgatados'
  },
  'adminLoyalty.stats.averageRating': {
    es: 'Valoración Promedio',
    en: 'Average Rating',
    pt: 'Avaliação Média'
  },
  'adminLoyalty.overview.activeRewards': {
    es: 'Premios Activos',
    en: 'Active Rewards',
    pt: 'Prêmios Ativos'
  },
  'adminLoyalty.overview.recentRedemptions': {
    es: 'Canjes Recientes',
    en: 'Recent Redemptions',
    pt: 'Resgates Recentes'
  },
  'adminLoyalty.overview.active': {
    es: 'Activo',
    en: 'Active',
    pt: 'Ativo'
  },
  'adminLoyalty.overview.inactive': {
    es: 'Inactivo',
    en: 'Inactive',
    pt: 'Inativo'
  },
  'adminLoyalty.rewards.title': {
    es: 'Gestión de Premios',
    en: 'Rewards Management',
    pt: 'Gerenciamento de Prêmios'
  },
  'adminLoyalty.rewards.newReward': {
    es: 'Nuevo Premio',
    en: 'New Reward',
    pt: 'Novo Prêmio'
  },
  'adminLoyalty.rewards.editReward': {
    es: 'Editar Premio',
    en: 'Edit Reward',
    pt: 'Editar Prêmio'
  },
  'adminLoyalty.rewards.createNewReward': {
    es: 'Crear Nuevo Premio',
    en: 'Create New Reward',
    pt: 'Criar Novo Prêmio'
  },
  'adminLoyalty.rewards.table.reward': {
    es: 'Premio',
    en: 'Reward',
    pt: 'Prêmio'
  },
  'adminLoyalty.rewards.table.points': {
    es: 'Puntos',
    en: 'Points',
    pt: 'Pontos'
  },
  'adminLoyalty.rewards.table.stock': {
    es: 'Stock',
    en: 'Stock',
    pt: 'Estoque'
  },
  'adminLoyalty.rewards.table.status': {
    es: 'Estado',
    en: 'Status',
    pt: 'Status'
  },
  'adminLoyalty.rewards.table.actions': {
    es: 'Acciones',
    en: 'Actions',
    pt: 'Ações'
  },
  'adminLoyalty.rewards.edit': {
    es: 'Editar',
    en: 'Edit',
    pt: 'Editar'
  },
  'adminLoyalty.redemptions.title': {
    es: 'Gestión de Canjes',
    en: 'Redemption Management',
    pt: 'Gerenciamento de Resgates'
  },
  'adminLoyalty.policies.title': {
    es: 'Políticas de Puntos',
    en: 'Points Policies',
    pt: 'Políticas de Pontos'
  },
  'adminLoyalty.policies.subtitle': {
    es: 'Configura cuántos puntos se otorgan por cada acción de los clientes',
    en: 'Configure how many points are awarded for each customer action',
    pt: 'Configure quantos pontos são concedidos para cada ação do cliente'
  },
  'adminLoyalty.policies.currentPolicies': {
    es: 'Políticas Actuales',
    en: 'Current Policies',
    pt: 'Políticas Atuais'
  },
  'adminLoyalty.policies.noPolicies': {
    es: 'No hay políticas configuradas',
    en: 'No policies configured',
    pt: 'Nenhuma política configurada'
  },
  'adminLoyalty.policies.points': {
    es: 'Puntos',
    en: 'Points',
    pt: 'Pontos'
  },
  'adminLoyalty.policies.activePolicy': {
    es: 'Política activa',
    en: 'Active policy',
    pt: 'Política ativa'
  },
  'adminLoyalty.policies.addNewPolicy': {
    es: 'Agregar Nueva Política',
    en: 'Add New Policy',
    pt: 'Adicionar Nova Política'
  },
  'adminLoyalty.policies.action': {
    es: 'Acción',
    en: 'Action',
    pt: 'Ação'
  },
  'adminLoyalty.policies.selectAction': {
    es: 'Seleccionar acción',
    en: 'Select action',
    pt: 'Selecionar ação'
  },
  'adminLoyalty.policies.description': {
    es: 'Descripción',
    en: 'Description',
    pt: 'Descrição'
  },
  'adminLoyalty.policies.descriptionPlaceholder': {
    es: 'Describe la política de puntos...',
    en: 'Describe the points policy...',
    pt: 'Descreva a política de pontos...'
  },
  'adminLoyalty.policies.addPolicy': {
    es: 'Agregar Política',
    en: 'Add Policy',
    pt: 'Adicionar Política'
  },
  'adminLoyalty.policies.info.title': {
    es: 'Información sobre las políticas',
    en: 'Information about policies',
    pt: 'Informações sobre as políticas'
  },
  'adminLoyalty.policies.info.purchase': {
    es: 'Compra: Puntos por cada compra realizada (ej: 1 punto por cada $1)',
    en: 'Purchase: Points for each purchase made (e.g., 1 point per $1)',
    pt: 'Compra: Pontos para cada compra realizada (ex: 1 ponto por $1)'
  },
  'adminLoyalty.policies.info.review': {
    es: 'Reseña: Puntos por enviar una reseña de producto',
    en: 'Review: Points for submitting a product review',
    pt: 'Avaliação: Pontos por enviar uma avaliação de produto'
  },
  'adminLoyalty.policies.info.referral': {
    es: 'Referido: Puntos por referir a un nuevo cliente que se registre',
    en: 'Referral: Points for referring a new customer who registers',
    pt: 'Indicação: Pontos por indicar um novo cliente que se registre'
  },
  'adminLoyalty.policies.info.share': {
    es: 'Compartir: Puntos por compartir productos en redes sociales',
    en: 'Share: Points for sharing products on social media',
    pt: 'Compartilhar: Pontos por compartilhar produtos nas redes sociais'
  },
  'adminLoyalty.policies.info.redemption': {
    es: 'Canje: Puntos por canjear un premio (puede ser negativo)',
    en: 'Redemption: Points for redeeming a reward (can be negative)',
    pt: 'Resgate: Pontos por resgatar um prêmio (pode ser negativo)'
  },
  'adminLoyalty.policies.savePolicies': {
    es: 'Guardar Políticas',
    en: 'Save Policies',
    pt: 'Salvar Políticas'
  },
  'adminLoyalty.policies.actions.purchase': {
    es: 'Compra',
    en: 'Purchase',
    pt: 'Compra'
  },
  'adminLoyalty.policies.actions.purchaseDesc': {
    es: 'Puntos por cada compra realizada',
    en: 'Points for each purchase made',
    pt: 'Pontos para cada compra realizada'
  },
  'adminLoyalty.policies.actions.review': {
    es: 'Reseña',
    en: 'Review',
    pt: 'Avaliação'
  },
  'adminLoyalty.policies.actions.reviewDesc': {
    es: 'Puntos por enviar una reseña de producto',
    en: 'Points for submitting a product review',
    pt: 'Pontos por enviar uma avaliação de produto'
  },
  'adminLoyalty.policies.actions.referral': {
    es: 'Referido',
    en: 'Referral',
    pt: 'Indicação'
  },
  'adminLoyalty.policies.actions.referralDesc': {
    es: 'Puntos por referir a un nuevo cliente',
    en: 'Points for referring a new customer',
    pt: 'Pontos por indicar um novo cliente'
  },
  'adminLoyalty.policies.actions.share': {
    es: 'Compartir',
    en: 'Share',
    pt: 'Compartilhar'
  },
  'adminLoyalty.policies.actions.shareDesc': {
    es: 'Puntos por compartir en redes sociales',
    en: 'Points for sharing on social media',
    pt: 'Pontos por compartilhar nas redes sociais'
  },
  'adminLoyalty.policies.actions.redemption': {
    es: 'Canje',
    en: 'Redemption',
    pt: 'Resgate'
  },
  'adminLoyalty.policies.actions.redemptionDesc': {
    es: 'Puntos por canjear un premio',
    en: 'Points for redeeming a reward',
    pt: 'Pontos por resgatar um prêmio'
  },
  'adminLoyalty.messages.rewardCreated': {
    es: 'Premio creado exitosamente',
    en: 'Reward created successfully',
    pt: 'Prêmio criado com sucesso'
  },
  'adminLoyalty.messages.rewardUpdated': {
    es: 'Premio actualizado exitosamente',
    en: 'Reward updated successfully',
    pt: 'Prêmio atualizado com sucesso'
  },
  'adminLoyalty.messages.statusUpdated': {
    es: '✅ Premio marcado como entregado exitosamente',
    en: '✅ Reward marked as delivered successfully',
    pt: '✅ Prêmio marcado como entregue com sucesso'
  },
  'adminLoyalty.messages.error.noToken': {
    es: 'Error: No hay token de autenticación. Por favor, inicia sesión nuevamente.',
    en: 'Error: No authentication token. Please log in again.',
    pt: 'Erro: Sem token de autenticação. Por favor, faça login novamente.'
  },
  'adminLoyalty.messages.error.createReward': {
    es: 'Error al crear premio',
    en: 'Error creating reward',
    pt: 'Erro ao criar prêmio'
  },
  'adminLoyalty.messages.error.updateReward': {
    es: 'Error al actualizar premio',
    en: 'Error updating reward',
    pt: 'Erro ao atualizar prêmio'
  },
  'adminLoyalty.messages.error.updateStatus': {
    es: 'Error al actualizar estado',
    en: 'Error updating status',
    pt: 'Erro ao atualizar status'
  },
  'adminLoyalty.messages.error.connection': {
    es: 'Error al crear premio. Verifica la conexión.',
    en: 'Error creating reward. Check connection.',
    pt: 'Erro ao criar prêmio. Verifique a conexão.'
  },
  'adminLoyalty.messages.error.unknown': {
    es: 'Error desconocido',
    en: 'Unknown error',
    pt: 'Erro desconhecido'
  },

  // ===== REWARD FORM =====
  'rewardForm.name': {
    es: 'Nombre del Premio *',
    en: 'Reward Name *',
    pt: 'Nome do Prêmio *'
  },
  'rewardForm.namePlaceholder': {
    es: 'Ej: Gorra con logo, Descuento 20%',
    en: 'E.g., Cap with logo, 20% discount',
    pt: 'Ex: Boné com logo, Desconto 20%'
  },
  'rewardForm.description': {
    es: 'Descripción *',
    en: 'Description *',
    pt: 'Descrição *'
  },
  'rewardForm.descriptionPlaceholder': {
    es: 'Describe el premio...',
    en: 'Describe the reward...',
    pt: 'Descreva o prêmio...'
  },
  'rewardForm.image': {
    es: 'Imagen del Premio',
    en: 'Reward Image',
    pt: 'Imagem do Prêmio'
  },
  'rewardForm.uploadImage': {
    es: 'Subir Imagen',
    en: 'Upload Image',
    pt: 'Enviar Imagem'
  },
  'rewardForm.removeImage': {
    es: 'Eliminar',
    en: 'Remove',
    pt: 'Remover'
  },
  'rewardForm.pointsRequired': {
    es: 'Puntos Requeridos *',
    en: 'Points Required *',
    pt: 'Pontos Necessários *'
  },
  'rewardForm.cashRequired': {
    es: 'Dinero Requerido',
    en: 'Cash Required',
    pt: 'Dinheiro Necessário'
  },
  'rewardForm.category': {
    es: 'Categoría *',
    en: 'Category *',
    pt: 'Categoria *'
  },
  'rewardForm.stock': {
    es: 'Stock Disponible *',
    en: 'Available Stock *',
    pt: 'Estoque Disponível *'
  },
  'rewardForm.isActive': {
    es: 'Premio Activo',
    en: 'Active Reward',
    pt: 'Prêmio Ativo'
  },
  'rewardForm.categories.tools': {
    es: 'Herramientas',
    en: 'Tools',
    pt: 'Ferramentas'
  },
  'rewardForm.categories.electronics': {
    es: 'Electrónicos',
    en: 'Electronics',
    pt: 'Eletrônicos'
  },
  'rewardForm.categories.accessories': {
    es: 'Accesorios',
    en: 'Accessories',
    pt: 'Acessórios'
  },
  'rewardForm.categories.giftCards': {
    es: 'Tarjetas de Regalo',
    en: 'Gift Cards',
    pt: 'Cartões Presente'
  },
  'rewardForm.categories.discounts': {
    es: 'Descuentos',
    en: 'Discounts',
    pt: 'Descontos'
  },
  'rewardForm.buttons.cancel': {
    es: 'Cancelar',
    en: 'Cancel',
    pt: 'Cancelar'
  },
  'rewardForm.buttons.save': {
    es: 'Guardar',
    en: 'Save',
    pt: 'Salvar'
  },
  'rewardForm.buttons.update': {
    es: 'Actualizar',
    en: 'Update',
    pt: 'Atualizar'
  },
  'rewardForm.mixedRewardsHelp': {
    es: 'Para premios mixtos (ej: gorra + $5)',
    en: 'For mixed rewards (e.g., cap + $5)',
    pt: 'Para prêmios mistos (ex: boné + $5)'
  },

  // ===== REDEMPTION MANAGEMENT =====
  'redemptionManagement.stats.total': {
    es: 'Total',
    en: 'Total',
    pt: 'Total'
  },
  'redemptionManagement.stats.pending': {
    es: 'Pendientes',
    en: 'Pending',
    pt: 'Pendentes'
  },
  'redemptionManagement.stats.delivered': {
    es: 'Entregados',
    en: 'Delivered',
    pt: 'Entregues'
  },
  'redemptionManagement.loading': {
    es: 'Cargando canjes...',
    en: 'Loading redemptions...',
    pt: 'Carregando resgates...'
  },
  'redemptionManagement.searchPlaceholder': {
    es: 'Buscar por cliente, premio...',
    en: 'Search by customer, reward...',
    pt: 'Buscar por cliente, prêmio...'
  },
  'redemptionManagement.filterAll': {
    es: 'Todos los estados',
    en: 'All statuses',
    pt: 'Todos os status'
  },
  'redemptionManagement.filterPending': {
    es: 'Pendiente',
    en: 'Pending',
    pt: 'Pendente'
  },
  'redemptionManagement.filterApproved': {
    es: 'Aprobado',
    en: 'Approved',
    pt: 'Aprovado'
  },
  'redemptionManagement.filterRejected': {
    es: 'Rechazado',
    en: 'Rejected',
    pt: 'Rejeitado'
  },
  'redemptionManagement.filterShipped': {
    es: 'Enviado',
    en: 'Shipped',
    pt: 'Enviado'
  },
  'redemptionManagement.filterDelivered': {
    es: 'Entregado',
    en: 'Delivered',
    pt: 'Entregue'
  },
  'redemptionManagement.filterDeliveredOnly': {
    es: 'Solo Entregados',
    en: 'Delivered Only',
    pt: 'Apenas Entregues'
  },
  'redemptionManagement.table.customer': {
    es: 'Cliente',
    en: 'Customer',
    pt: 'Cliente'
  },
  'redemptionManagement.table.reward': {
    es: 'Premio',
    en: 'Reward',
    pt: 'Prêmio'
  },
  'redemptionManagement.table.points': {
    es: 'Puntos',
    en: 'Points',
    pt: 'Pontos'
  },
  'redemptionManagement.table.status': {
    es: 'Estado',
    en: 'Status',
    pt: 'Status'
  },
  'redemptionManagement.table.date': {
    es: 'Fecha',
    en: 'Date',
    pt: 'Data'
  },
  'redemptionManagement.table.actions': {
    es: 'Acciones',
    en: 'Actions',
    pt: 'Ações'
  },
  'redemptionManagement.actions.view': {
    es: 'Ver',
    en: 'View',
    pt: 'Ver'
  },
  'redemptionManagement.actions.approve': {
    es: 'Aprobar',
    en: 'Approve',
    pt: 'Aprovar'
  },
  'redemptionManagement.actions.reject': {
    es: 'Rechazar',
    en: 'Reject',
    pt: 'Rejeitar'
  },
  'redemptionManagement.actions.ship': {
    es: 'Enviar',
    en: 'Ship',
    pt: 'Enviar'
  },
  'redemptionManagement.actions.deliver': {
    es: 'Entregar',
    en: 'Deliver',
    pt: 'Entregar'
  },
  'redemptionManagement.modal.title': {
    es: 'Detalles del Canje',
    en: 'Redemption Details',
    pt: 'Detalhes do Resgate'
  },
  'redemptionManagement.modal.customer': {
    es: 'Cliente',
    en: 'Customer',
    pt: 'Cliente'
  },
  'redemptionManagement.modal.reward': {
    es: 'Premio',
    en: 'Reward',
    pt: 'Prêmio'
  },
  'redemptionManagement.modal.pointsSpent': {
    es: 'Puntos Gastados',
    en: 'Points Spent',
    pt: 'Pontos Gastos'
  },
  'redemptionManagement.modal.points': {
    es: 'puntos',
    en: 'points',
    pt: 'pontos'
  },
  'redemptionManagement.modal.cashSpent': {
    es: 'Dinero Gastado',
    en: 'Cash Spent',
    pt: 'Dinheiro Gasto'
  },
  'redemptionManagement.modal.status': {
    es: 'Estado',
    en: 'Status',
    pt: 'Status'
  },
  'redemptionManagement.modal.date': {
    es: 'Fecha',
    en: 'Date',
    pt: 'Data'
  },
  'redemptionManagement.modal.shippingAddress': {
    es: 'Dirección de Envío',
    en: 'Shipping Address',
    pt: 'Endereço de Envio'
  },
  'redemptionManagement.modal.trackingNumber': {
    es: 'Número de Seguimiento',
    en: 'Tracking Number',
    pt: 'Número de Rastreamento'
  },
  'redemptionManagement.modal.notes': {
    es: 'Notas',
    en: 'Notes',
    pt: 'Notas'
  },
  'redemptionManagement.modal.notesPlaceholder': {
    es: 'Agregar notas sobre el canje...',
    en: 'Add notes about the redemption...',
    pt: 'Adicionar notas sobre o resgate...'
  },
  'redemptionManagement.modal.updateTracking': {
    es: 'Actualizar Seguimiento',
    en: 'Update Tracking',
    pt: 'Atualizar Rastreamento'
  },
  'redemptionManagement.modal.close': {
    es: 'Cerrar',
    en: 'Close',
    pt: 'Fechar'
  },
  'redemptionManagement.modal.actions': {
    es: 'Acciones',
    en: 'Actions',
    pt: 'Ações'
  },
  'redemptionManagement.modal.changeStatus': {
    es: 'Cambiar Estado',
    en: 'Change Status',
    pt: 'Alterar Status'
  },
  'redemptionManagement.modal.markAsDelivered': {
    es: 'Marcar como Entregado',
    en: 'Mark as Delivered',
    pt: 'Marcar como Entregue'
  },
  'redemptionManagement.modal.markAsDeliveredDesc': {
    es: 'Confirma que el premio ha sido entregado al cliente',
    en: 'Confirm that the reward has been delivered to the customer',
    pt: 'Confirme que o prêmio foi entregue ao cliente'
  },
  'redemptionManagement.modal.confirmDelivered': {
    es: '¿Estás seguro de que quieres marcar este premio como entregado?',
    en: 'Are you sure you want to mark this reward as delivered?',
    pt: 'Tem certeza de que deseja marcar este prêmio como entregue?'
  },
  'redemptionManagement.modal.add': {
    es: 'Agregar',
    en: 'Add',
    pt: 'Adicionar'
  },
  'redemptionManagement.modal.notesOptional': {
    es: 'Notas (opcional)',
    en: 'Notes (optional)',
    pt: 'Notas (opcional)'
  },
  'redemptionManagement.modal.addressNotSpecified': {
    es: 'No especificada',
    en: 'Not specified',
    pt: 'Não especificada'
  },

  // ===== LOYALTY DASHBOARD =====
  'loyaltyDashboard.stats.totalUsers': {
    es: 'Usuarios Totales',
    en: 'Total Users',
    pt: 'Usuários Totais'
  },
  'loyaltyDashboard.stats.thisMonth': {
    es: 'este mes',
    en: 'this month',
    pt: 'este mês'
  },
  'loyaltyDashboard.stats.totalPoints': {
    es: 'Puntos Totales',
    en: 'Total Points',
    pt: 'Pontos Totais'
  },
  'loyaltyDashboard.stats.issued': {
    es: 'emitidos',
    en: 'issued',
    pt: 'emitidos'
  },
  'loyaltyDashboard.stats.redeemed': {
    es: 'canjeados',
    en: 'redeemed',
    pt: 'resgatados'
  },
  'loyaltyDashboard.stats.activeRewards': {
    es: 'Premios Activos',
    en: 'Active Rewards',
    pt: 'Prêmios Ativos'
  },
  'loyaltyDashboard.stats.ofTotal': {
    es: 'de',
    en: 'of',
    pt: 'de'
  },
  'loyaltyDashboard.stats.total': {
    es: 'total',
    en: 'total',
    pt: 'total'
  },
  'loyaltyDashboard.stats.completedRedemptions': {
    es: 'Canjes Completados',
    en: 'Completed Redemptions',
    pt: 'Resgates Concluídos'
  },
  'loyaltyDashboard.stats.pending': {
    es: 'pendientes',
    en: 'pending',
    pt: 'pendentes'
  },
  'loyaltyDashboard.sections.popularRewards': {
    es: 'Premios Más Populares',
    en: 'Most Popular Rewards',
    pt: 'Prêmios Mais Populares'
  },
  'loyaltyDashboard.sections.recentActivity': {
    es: 'Actividad Reciente',
    en: 'Recent Activity',
    pt: 'Atividade Recente'
  },
  'loyaltyDashboard.rewards.points': {
    es: 'puntos',
    en: 'points',
    pt: 'pontos'
  },
  'loyaltyDashboard.rewards.redemptions': {
    es: 'canjes',
    en: 'redemptions',
    pt: 'resgates'
  },
  'loyaltyDashboard.activity.purchase': {
    es: 'Compra realizada por',
    en: 'Purchase made by',
    pt: 'Compra realizada por'
  },
  'loyaltyDashboard.activity.review': {
    es: 'Reseña enviada por',
    en: 'Review sent by',
    pt: 'Avaliação enviada por'
  },
  'loyaltyDashboard.activity.referral': {
    es: 'Nuevo cliente referido por',
    en: 'New client referred by',
    pt: 'Novo cliente indicado por'
  },
  'loyaltyDashboard.activity.redemption': {
    es: 'Premio canjeado por',
    en: 'Reward redeemed by',
    pt: 'Prêmio resgatado por'
  },
  'loyaltyDashboard.stats.averageRating': {
    es: 'Valoración Promedio',
    en: 'Average Rating',
    pt: 'Avaliação Média'
  },
  'loyaltyDashboard.stats.reviews': {
    es: 'reseñas',
    en: 'reviews',
    pt: 'avaliações'
  },
  'loyaltyDashboard.stats.activeUsers': {
    es: 'Usuarios Activos',
    en: 'Active Users',
    pt: 'Usuários Ativos'
  },
  'loyaltyDashboard.stats.ofTotalUsers': {
    es: '% del total',
    en: '% of total',
    pt: '% do total'
  },
  'loyaltyDashboard.stats.conversionRate': {
    es: 'Tasa de Conversión',
    en: 'Conversion Rate',
    pt: 'Taxa de Conversão'
  },
  'loyaltyDashboard.stats.usersWhoRedeemed': {
    es: 'usuarios que canjearon',
    en: 'users who redeemed',
    pt: 'usuários que resgataram'
  },

  // ===== GOOGLE ANALYTICS =====
  'adminAnalytics.title': {
    es: 'Configuración de Google Analytics',
    en: 'Google Analytics Configuration',
    pt: 'Configuração do Google Analytics'
  },
  'adminAnalytics.subtitle': {
    es: 'Configura Google Analytics para rastrear el comportamiento de los usuarios en tu aplicación.',
    en: 'Configure Google Analytics to track user behavior in your application.',
    pt: 'Configure o Google Analytics para rastrear o comportamento dos usuários em sua aplicação.'
  },
  'adminAnalytics.accessDenied': {
    es: 'Acceso Denegado',
    en: 'Access Denied',
    pt: 'Acesso Negado'
  },
  'adminAnalytics.accessDeniedMessage': {
    es: 'Solo los administradores pueden acceder a esta página.',
    en: 'Only administrators can access this page.',
    pt: 'Apenas administradores podem acessar esta página.'
  },
  'adminAnalytics.loading': {
    es: 'Cargando configuración...',
    en: 'Loading configuration...',
    pt: 'Carregando configuração...'
  },
  'adminAnalytics.currentStatus': {
    es: 'Estado Actual',
    en: 'Current Status',
    pt: 'Status Atual'
  },
  'adminAnalytics.configured': {
    es: 'Configurado',
    en: 'Configured',
    pt: 'Configurado'
  },
  'adminAnalytics.notConfigured': {
    es: 'No Configurado',
    en: 'Not Configured',
    pt: 'Não Configurado'
  },
  'adminAnalytics.disable': {
    es: 'Deshabilitar',
    en: 'Disable',
    pt: 'Desabilitar'
  },
  'adminAnalytics.enable': {
    es: 'Habilitar',
    en: 'Enable',
    pt: 'Habilitar'
  },
  'adminAnalytics.measurementId': {
    es: 'Measurement ID:',
    en: 'Measurement ID:',
    pt: 'ID de Medição:'
  },
  'adminAnalytics.propertyId': {
    es: 'Property ID:',
    en: 'Property ID:',
    pt: 'ID da Propriedade:'
  },
  'adminAnalytics.lastConfiguration': {
    es: 'Última configuración:',
    en: 'Last configuration:',
    pt: 'Última configuração:'
  },
  'adminAnalytics.configuration': {
    es: 'Configuración',
    en: 'Configuration',
    pt: 'Configuração'
  },
  'adminAnalytics.measurementIdLabel': {
    es: 'Measurement ID (G-XXXXXXXXXX)',
    en: 'Measurement ID (G-XXXXXXXXXX)',
    pt: 'ID de Medição (G-XXXXXXXXXX)'
  },
  'adminAnalytics.measurementIdPlaceholder': {
    es: 'G-XXXXXXXXXX',
    en: 'G-XXXXXXXXXX',
    pt: 'G-XXXXXXXXXX'
  },
  'adminAnalytics.measurementIdHelp': {
    es: 'Encuentra esto en tu cuenta de Google Analytics',
    en: 'Find this in your Google Analytics account',
    pt: 'Encontre isso na sua conta do Google Analytics'
  },
  'adminAnalytics.propertyIdLabel': {
    es: 'Property ID',
    en: 'Property ID',
    pt: 'ID da Propriedade'
  },
  'adminAnalytics.propertyIdPlaceholder': {
    es: '123456789',
    en: '123456789',
    pt: '123456789'
  },
  'adminAnalytics.customEvents': {
    es: 'Eventos Personalizados',
    en: 'Custom Events',
    pt: 'Eventos Personalizados'
  },
  'adminAnalytics.customDimensions': {
    es: 'Dimensiones Personalizadas',
    en: 'Custom Dimensions',
    pt: 'Dimensões Personalizadas'
  },
  'adminAnalytics.customMetrics': {
    es: 'Métricas Personalizadas',
    en: 'Custom Metrics',
    pt: 'Métricas Personalizadas'
  },
  'adminAnalytics.trackingCode': {
    es: 'Código de Seguimiento',
    en: 'Tracking Code',
    pt: 'Código de Rastreamento'
  },
  'adminAnalytics.trackingCodeHelp': {
    es: 'Este código debe ser incluido en el <head> de tu aplicación',
    en: 'This code must be included in the <head> of your application',
    pt: 'Este código deve ser incluído no <head> da sua aplicação'
  },
  'adminAnalytics.saveConfiguration': {
    es: 'Guardar Configuración',
    en: 'Save Configuration',
    pt: 'Salvar Configuração'
  },
  'adminAnalytics.saving': {
    es: 'Guardando...',
    en: 'Saving...',
    pt: 'Salvando...'
  },
  'adminAnalytics.configurationSaved': {
    es: 'Configuración guardada exitosamente',
    en: 'Configuration saved successfully',
    pt: 'Configuração salva com sucesso'
  },
  'adminAnalytics.errorLoading': {
    es: 'Error cargando configuración',
    en: 'Error loading configuration',
    pt: 'Erro ao carregar configuração'
  },
  'adminAnalytics.errorSaving': {
    es: 'Error guardando configuración',
    en: 'Error saving configuration',
    pt: 'Erro ao salvar configuração'
  },
  'adminAnalytics.connectionError': {
    es: 'Error de conexión',
    en: 'Connection error',
    pt: 'Erro de conexão'
  },
  'adminAnalytics.analyticsEnabled': {
    es: 'Google Analytics habilitado exitosamente',
    en: 'Google Analytics enabled successfully',
    pt: 'Google Analytics habilitado com sucesso'
  },
  'adminAnalytics.analyticsDisabled': {
    es: 'Google Analytics deshabilitado exitosamente',
    en: 'Google Analytics disabled successfully',
    pt: 'Google Analytics desabilitado com sucesso'
  },
  'adminAnalytics.errorChangingStatus': {
    es: 'Error cambiando estado',
    en: 'Error changing status',
    pt: 'Erro ao alterar status'
  },
  // Eventos personalizados
  'adminAnalytics.events.userRegistration': {
    es: 'Registro de Usuario',
    en: 'User Registration',
    pt: 'Registro de Usuário'
  },
  'adminAnalytics.events.userLogin': {
    es: 'Inicio de Sesión',
    en: 'User Login',
    pt: 'Login do Usuário'
  },
  'adminAnalytics.events.purchase': {
    es: 'Compra',
    en: 'Purchase',
    pt: 'Compra'
  },
  'adminAnalytics.events.review': {
    es: 'Reseña',
    en: 'Review',
    pt: 'Avaliação'
  },
  'adminAnalytics.events.referral': {
    es: 'Referido',
    en: 'Referral',
    pt: 'Indicação'
  },
  'adminAnalytics.events.rewardRedemption': {
    es: 'Canje de Premio',
    en: 'Reward Redemption',
    pt: 'Resgate de Prêmio'
  },
  'adminAnalytics.events.locationUpdate': {
    es: 'Actualización de Ubicación',
    en: 'Location Update',
    pt: 'Atualização de Localização'
  },
  // Dimensiones personalizadas
  'adminAnalytics.dimensions.userId': {
    es: 'ID de Usuario',
    en: 'User ID',
    pt: 'ID do Usuário'
  },
  'adminAnalytics.dimensions.userRole': {
    es: 'Rol de Usuario',
    en: 'User Role',
    pt: 'Função do Usuário'
  },
  'adminAnalytics.dimensions.loyaltyLevel': {
    es: 'Nivel de Fidelización',
    en: 'Loyalty Level',
    pt: 'Nível de Fidelização'
  },
  'adminAnalytics.dimensions.locationEnabled': {
    es: 'Ubicación Habilitada',
    en: 'Location Enabled',
    pt: 'Localização Habilitada'
  },
  // Métricas personalizadas
  'adminAnalytics.metrics.pointsEarned': {
    es: 'Puntos Ganados',
    en: 'Points Earned',
    pt: 'Pontos Ganhos'
  },
  'adminAnalytics.metrics.totalSpent': {
    es: 'Total Gastado',
    en: 'Total Spent',
    pt: 'Total Gasto'
  },
  'adminAnalytics.metrics.referralCount': {
    es: 'Conteo de Referidos',
    en: 'Referral Count',
    pt: 'Contagem de Indicações'
  },

  // ===== REGISTRATION CODES =====
  'adminRegistrationCodes.title': {
    es: 'Códigos de Registro',
    en: 'Registration Codes',
    pt: 'Códigos de Registro'
  },
  'adminRegistrationCodes.subtitle': {
    es: 'Gestiona los códigos de registro para administradores, gestores de tienda y delivery.',
    en: 'Manage registration codes for administrators, store managers and delivery.',
    pt: 'Gerencie códigos de registro para administradores, gerentes de loja e entrega.'
  },
  'adminRegistrationCodes.accessDenied': {
    es: 'Acceso Denegado',
    en: 'Access Denied',
    pt: 'Acesso Negado'
  },
  'adminRegistrationCodes.accessDeniedMessage': {
    es: 'Solo los administradores pueden acceder a esta página.',
    en: 'Only administrators can access this page.',
    pt: 'Apenas administradores podem acessar esta página.'
  },
  'adminRegistrationCodes.currentRole': {
    es: 'Tu rol actual:',
    en: 'Your current role:',
    pt: 'Seu papel atual:'
  },
  'adminRegistrationCodes.loadingUser': {
    es: 'Cargando usuario...',
    en: 'Loading user...',
    pt: 'Carregando usuário...'
  },
  'adminRegistrationCodes.loadingCodes': {
    es: 'Cargando códigos de registro...',
    en: 'Loading registration codes...',
    pt: 'Carregando códigos de registro...'
  },
  'adminRegistrationCodes.cleanExpired': {
    es: 'Limpiar Expirados',
    en: 'Clean Expired',
    pt: 'Limpar Expirados'
  },
  'adminRegistrationCodes.createCode': {
    es: 'Crear Código',
    en: 'Create Code',
    pt: 'Criar Código'
  },
  'adminRegistrationCodes.reload': {
    es: 'Recargar',
    en: 'Reload',
    pt: 'Recarregar'
  },
  'adminRegistrationCodes.stats.total': {
    es: 'Total',
    en: 'Total',
    pt: 'Total'
  },
  'adminRegistrationCodes.stats.pending': {
    es: 'Pendientes',
    en: 'Pending',
    pt: 'Pendentes'
  },
  'adminRegistrationCodes.stats.used': {
    es: 'Usados',
    en: 'Used',
    pt: 'Usados'
  },
  'adminRegistrationCodes.stats.expired': {
    es: 'Expirados',
    en: 'Expired',
    pt: 'Expirados'
  },
  'adminRegistrationCodes.stats.revoked': {
    es: 'Revocados',
    en: 'Revoked',
    pt: 'Revogados'
  },
  'adminRegistrationCodes.table.title': {
    es: 'Códigos de Registro',
    en: 'Registration Codes',
    pt: 'Códigos de Registro'
  },
  'adminRegistrationCodes.table.code': {
    es: 'Código',
    en: 'Code',
    pt: 'Código'
  },
  'adminRegistrationCodes.table.email': {
    es: 'Email',
    en: 'Email',
    pt: 'Email'
  },
  'adminRegistrationCodes.table.role': {
    es: 'Rol',
    en: 'Role',
    pt: 'Função'
  },
  'adminRegistrationCodes.table.status': {
    es: 'Estado',
    en: 'Status',
    pt: 'Status'
  },
  'adminRegistrationCodes.table.expires': {
    es: 'Expira',
    en: 'Expires',
    pt: 'Expira'
  },
  'adminRegistrationCodes.table.usedBy': {
    es: 'Usado Por',
    en: 'Used By',
    pt: 'Usado Por'
  },
  'adminRegistrationCodes.table.actions': {
    es: 'Acciones',
    en: 'Actions',
    pt: 'Ações'
  },
  'adminRegistrationCodes.status.pending': {
    es: 'Pendiente',
    en: 'Pending',
    pt: 'Pendente'
  },
  'adminRegistrationCodes.status.used': {
    es: 'Usado',
    en: 'Used',
    pt: 'Usado'
  },
  'adminRegistrationCodes.status.expired': {
    es: 'Expirado',
    en: 'Expired',
    pt: 'Expirado'
  },
  'adminRegistrationCodes.status.revoked': {
    es: 'Revocado',
    en: 'Revoked',
    pt: 'Revogado'
  },
  'adminRegistrationCodes.roles.admin': {
    es: 'Administrador',
    en: 'Administrator',
    pt: 'Administrador'
  },
  'adminRegistrationCodes.roles.storeManager': {
    es: 'Gestor de Tienda',
    en: 'Store Manager',
    pt: 'Gerente de Loja'
  },
  'adminRegistrationCodes.roles.delivery': {
    es: 'Delivery',
    en: 'Delivery',
    pt: 'Entrega'
  },
  'adminRegistrationCodes.roles.seller': {
    es: 'Vendedor',
    en: 'Seller',
    pt: 'Vendedor'
  },
  'adminRegistrationCodes.notUsed': {
    es: 'No usado',
    en: 'Not used',
    pt: 'Não usado'
  },
  'adminRegistrationCodes.modal.title': {
    es: 'Crear Código de Registro',
    en: 'Create Registration Code',
    pt: 'Criar Código de Registro'
  },
  'adminRegistrationCodes.modal.email': {
    es: 'Email',
    en: 'Email',
    pt: 'Email'
  },
  'adminRegistrationCodes.modal.role': {
    es: 'Rol',
    en: 'Role',
    pt: 'Função'
  },
  'adminRegistrationCodes.modal.expirationDays': {
    es: 'Días de Expiración',
    en: 'Expiration Days',
    pt: 'Dias de Expiração'
  },
  'adminRegistrationCodes.modal.cancel': {
    es: 'Cancelar',
    en: 'Cancel',
    pt: 'Cancelar'
  },
  'adminRegistrationCodes.modal.creating': {
    es: 'Creando...',
    en: 'Creating...',
    pt: 'Criando...'
  },
  'adminRegistrationCodes.modal.createCode': {
    es: 'Crear Código',
    en: 'Create Code',
    pt: 'Criar Código'
  },
  'adminRegistrationCodes.confirmRevoke': {
    es: '¿Estás seguro de que quieres revocar este código?',
    en: 'Are you sure you want to revoke this code?',
    pt: 'Tem certeza de que deseja revogar este código?'
  },
  'adminRegistrationCodes.errorLoadingCodes': {
    es: 'Error cargando códigos',
    en: 'Error loading codes',
    pt: 'Erro ao carregar códigos'
  },
  'adminRegistrationCodes.errorCreatingCode': {
    es: 'Error creando código',
    en: 'Error creating code',
    pt: 'Erro ao criar código'
  },
  'adminRegistrationCodes.errorRevokingCode': {
    es: 'Error revocando código',
    en: 'Error revoking code',
    pt: 'Erro ao revogar código'
  },
  'adminRegistrationCodes.errorCleaningCodes': {
    es: 'Error limpiando códigos',
    en: 'Error cleaning codes',
    pt: 'Erro ao limpar códigos'
  },
  'adminRegistrationCodes.connectionError': {
    es: 'Error de conexión',
    en: 'Connection error',
    pt: 'Erro de conexão'
  },
  'adminRegistrationCodes.codeCreated': {
    es: 'Código creado exitosamente',
    en: 'Code created successfully',
    pt: 'Código criado com sucesso'
  },
  'adminRegistrationCodes.codeRevoked': {
    es: 'Código revocado exitosamente',
    en: 'Code revoked successfully',
    pt: 'Código revogado com sucesso'
  },
  // Register with Code
  'registerWithCode.title': {
    es: 'Registro con Código',
    en: 'Register with Code',
    pt: 'Registro com Código'
  },
  'registerWithCode.subtitle': {
    es: 'Completa tu registro usando el código proporcionado',
    en: 'Complete your registration using the provided code',
    pt: 'Complete seu registro usando o código fornecido'
  },
  'registerWithCode.registrationCode': {
    es: 'Código de Registro',
    en: 'Registration Code',
    pt: 'Código de Registro'
  },
  'registerWithCode.enterCode': {
    es: 'Ingresa el código',
    en: 'Enter the code',
    pt: 'Digite o código'
  },
  'registerWithCode.verify': {
    es: 'Verificar',
    en: 'Verify',
    pt: 'Verificar'
  },
  'registerWithCode.noCodeMessage': {
    es: '¿No tienes un código? Contacta con la administración.',
    en: "Don't have a code? Contact administration.",
    pt: 'Não tem um código? Entre em contato com a administração.'
  },
  'registerWithCode.codeValid': {
    es: 'Código Válido',
    en: 'Valid Code',
    pt: 'Código Válido'
  },
  'registerWithCode.expires': {
    es: 'Expira:',
    en: 'Expires:',
    pt: 'Expira:'
  },
  'registerWithCode.roleDescriptions.admin': {
    es: 'Acceso completo al sistema de administración',
    en: 'Full access to the administration system',
    pt: 'Acesso completo ao sistema de administração'
  },
  'registerWithCode.roleDescriptions.storeManager': {
    es: 'Gestión de inventario y ventas de la tienda',
    en: 'Inventory and store sales management',
    pt: 'Gerenciamento de inventário e vendas da loja'
  },
  'registerWithCode.roleDescriptions.delivery': {
    es: 'Gestión de entregas y logística',
    en: 'Delivery and logistics management',
    pt: 'Gerenciamento de entregas e logística'
  },
  'registerWithCode.roleDescriptions.user': {
    es: 'Acceso básico al sistema',
    en: 'Basic system access',
    pt: 'Acesso básico ao sistema'
  },
  'registerWithCode.fullName': {
    es: 'Nombre Completo',
    en: 'Full Name',
    pt: 'Nome Completo'
  },
  'registerWithCode.phone': {
    es: 'Teléfono',
    en: 'Phone',
    pt: 'Telefone'
  },
  'registerWithCode.password': {
    es: 'Contraseña',
    en: 'Password',
    pt: 'Senha'
  },
  'registerWithCode.confirmPassword': {
    es: 'Confirmar Contraseña',
    en: 'Confirm Password',
    pt: 'Confirmar Senha'
  },
  'registerWithCode.emailCannotChange': {
    es: 'El email no se puede cambiar',
    en: 'Email cannot be changed',
    pt: 'O email não pode ser alterado'
  },
  'registerWithCode.completeRegistration': {
    es: 'Completar Registro',
    en: 'Complete Registration',
    pt: 'Completar Registro'
  },
  'registerWithCode.registering': {
    es: 'Registrando...',
    en: 'Registering...',
    pt: 'Registrando...'
  },
  'registerWithCode.useAnotherCode': {
    es: 'Usar otro código',
    en: 'Use another code',
    pt: 'Usar outro código'
  },
  'registerWithCode.errorInvalidCode': {
    es: 'Código inválido o expirado',
    en: 'Invalid or expired code',
    pt: 'Código inválido ou expirado'
  },
  'registerWithCode.errorVerifyingCode': {
    es: 'Error verificando código',
    en: 'Error verifying code',
    pt: 'Erro ao verificar código'
  },
  'registerWithCode.errorStartingRegistration': {
    es: 'Error iniciando registro',
    en: 'Error starting registration',
    pt: 'Erro ao iniciar registro'
  },
  'registerWithCode.errorCompletingRegistration': {
    es: 'Error completando registro',
    en: 'Error completing registration',
    pt: 'Erro ao completar registro'
  },
  'registerWithCode.errorRegisteringUser': {
    es: 'Error registrando usuario',
    en: 'Error registering user',
    pt: 'Erro ao registrar usuário'
  },
  'registerWithCode.passwordsDoNotMatch': {
    es: 'Las contraseñas no coinciden',
    en: 'Passwords do not match',
    pt: 'As senhas não coincidem'
  },
  'registerWithCode.pleaseEnterCode': {
    es: 'Por favor ingresa un código de registro',
    en: 'Please enter a registration code',
    pt: 'Por favor, digite um código de registro'
  },
  // ===== SEARCH CONFIGURATION =====
  'adminSearchConfig.title': {
    es: 'Configuración de Búsqueda',
    en: 'Search Configuration',
    pt: 'Configuração de Busca'
  },
  'adminSearchConfig.subtitle': {
    es: 'Configura los parámetros del sistema de búsqueda inteligente similar a Algolia',
    en: 'Configure the parameters of the intelligent search system similar to Algolia',
    pt: 'Configure os parâmetros do sistema de busca inteligente similar ao Algolia'
  },
  'adminSearchConfig.accessDenied': {
    es: 'Acceso Denegado',
    en: 'Access Denied',
    pt: 'Acesso Negado'
  },
  'adminSearchConfig.accessDeniedMessage': {
    es: 'Solo los administradores pueden acceder a esta página.',
    en: 'Only administrators can access this page.',
    pt: 'Apenas administradores podem acessar esta página.'
  },
  'adminSearchConfig.errorLoading': {
    es: 'Error cargando configuración',
    en: 'Error loading configuration',
    pt: 'Erro ao carregar configuração'
  },
  'adminSearchConfig.errorSaving': {
    es: 'Error guardando configuración',
    en: 'Error saving configuration',
    pt: 'Erro ao salvar configuração'
  },
  'adminSearchConfig.configurationSaved': {
    es: 'Configuración guardada exitosamente',
    en: 'Configuration saved successfully',
    pt: 'Configuração salva com sucesso'
  },
  'adminSearchConfig.errorLoadingConfig': {
    es: 'No se pudo cargar la configuración de búsqueda.',
    en: 'Could not load search configuration.',
    pt: 'Não foi possível carregar a configuração de busca.'
  },
  'adminSearchConfig.semanticSearch': {
    es: 'Búsqueda Semántica',
    en: 'Semantic Search',
    pt: 'Busca Semântica'
  },
  'adminSearchConfig.semanticThreshold': {
    es: 'Umbral semántico (0-1)',
    en: 'Semantic threshold (0-1)',
    pt: 'Limiar semântico (0-1)'
  },
  'adminSearchConfig.errorCorrection': {
    es: 'Corrección de Errores',
    en: 'Error Correction',
    pt: 'Correção de Erros'
  },
  'adminSearchConfig.enableErrorCorrection': {
    es: 'Habilitar corrección de errores',
    en: 'Enable error correction',
    pt: 'Habilitar correção de erros'
  },
  'adminSearchConfig.maxEditDistance': {
    es: 'Distancia máxima de edición',
    en: 'Maximum edit distance',
    pt: 'Distância máxima de edição'
  },
  'adminSearchConfig.minWordLength': {
    es: 'Longitud mínima de palabra',
    en: 'Minimum word length',
    pt: 'Comprimento mínimo da palavra'
  },
  'adminSearchConfig.searchFields': {
    es: 'Campos de Búsqueda',
    en: 'Search Fields',
    pt: 'Campos de Busca'
  },
  'adminSearchConfig.searchableFields': {
    es: 'Campos buscables (separados por comas)',
    en: 'Searchable fields (comma separated)',
    pt: 'Campos pesquisáveis (separados por vírgulas)'
  },
  'adminSearchConfig.fieldWeights': {
    es: 'Peso de campos (JSON)',
    en: 'Field weights (JSON)',
    pt: 'Pesos dos campos (JSON)'
  },
  'adminSearchConfig.resultsAndFilters': {
    es: 'Resultados y Filtros',
    en: 'Results and Filters',
    pt: 'Resultados e Filtros'
  },
  'adminSearchConfig.maxResults': {
    es: 'Máximo de resultados',
    en: 'Maximum results',
    pt: 'Máximo de resultados'
  },
  'adminSearchConfig.minRelevanceScore': {
    es: 'Puntuación mínima de relevancia (0-1)',
    en: 'Minimum relevance score (0-1)',
    pt: 'Pontuação mínima de relevância (0-1)'
  },
  'adminSearchConfig.synonymGroups': {
    es: 'Grupos de Sinónimos',
    en: 'Synonym Groups',
    pt: 'Grupos de Sinônimos'
  },
  'adminSearchConfig.enableSynonyms': {
    es: 'Habilitar sinónimos',
    en: 'Enable synonyms',
    pt: 'Habilitar sinônimos'
  },
  'adminSearchConfig.words': {
    es: 'Palabras (separadas por comas)',
    en: 'Words (comma separated)',
    pt: 'Palavras (separadas por vírgulas)'
  },
  'adminSearchConfig.weight': {
    es: 'Peso',
    en: 'Weight',
    pt: 'Peso'
  },
  'adminSearchConfig.remove': {
    es: 'Eliminar',
    en: 'Remove',
    pt: 'Remover'
  },
  'adminSearchConfig.addSynonymGroup': {
    es: 'Agregar Grupo de Sinónimos',
    en: 'Add Synonym Group',
    pt: 'Adicionar Grupo de Sinônimos'
  },
  'adminSearchConfig.autocomplete': {
    es: 'Autocompletado',
    en: 'Autocomplete',
    pt: 'Autocompletar'
  },
  'adminSearchConfig.minLengthForAutocomplete': {
    es: 'Longitud mínima para autocompletado',
    en: 'Minimum length for autocomplete',
    pt: 'Comprimento mínimo para autocompletar'
  },
  'adminSearchConfig.maxSuggestions': {
    es: 'Máximo de sugerencias',
    en: 'Maximum suggestions',
    pt: 'Máximo de sugestões'
  },
  'adminSearchConfig.queryAnalysis': {
    es: 'Análisis de Consultas',
    en: 'Query Analysis',
    pt: 'Análise de Consultas'
  },
  'adminSearchConfig.enableQueryAnalysis': {
    es: 'Habilitar análisis de consultas',
    en: 'Enable query analysis',
    pt: 'Habilitar análise de consultas'
  },
  'adminSearchConfig.intentRecognition': {
    es: 'Reconocimiento de intención',
    en: 'Intent recognition',
    pt: 'Reconhecimento de intenção'
  },
  'adminSearchConfig.saveConfiguration': {
    es: 'Guardar Configuración',
    en: 'Save Configuration',
    pt: 'Salvar Configuração'
  },
  'adminSearchConfig.saving': {
    es: 'Guardando...',
    en: 'Saving...',
    pt: 'Salvando...'
  },
  // ===== PRODUCT GENERATION FOR QA =====
  'adminGenerateProducts.title': {
    es: 'Generar Datos de Prueba',
    en: 'Generate Test Data',
    pt: 'Gerar Dados de Teste'
  },
  'adminGenerateProducts.subtitle': {
    es: 'Genera tiendas y productos de prueba para probar el sistema multi-tienda',
    en: 'Generate test stores and products to test the multi-store system',
    pt: 'Gere lojas e produtos de teste para testar o sistema multi-loja'
  },
  'adminGenerateProducts.accessDenied': {
    es: 'Acceso Denegado',
    en: 'Access Denied',
    pt: 'Acesso Negado'
  },
  'adminGenerateProducts.accessDeniedMessage': {
    es: 'Solo los administradores pueden acceder a esta página.',
    en: 'Only administrators can access this page.',
    pt: 'Apenas administradores podem acessar esta página.'
  },
  'adminGenerateProducts.generateStores': {
    es: 'Generar Tiendas',
    en: 'Generate Stores',
    pt: 'Gerar Lojas'
  },
  'adminGenerateProducts.generateProducts': {
    es: 'Generar Productos',
    en: 'Generate Products',
    pt: 'Gerar Produtos'
  },
  'adminGenerateProducts.storesGenerated': {
    es: 'Generadas {count} tiendas de prueba exitosamente',
    en: 'Generated {count} test stores successfully',
    pt: 'Geradas {count} lojas de teste com sucesso'
  },
  'adminGenerateProducts.productsGenerated': {
    es: 'Generados {count} productos de prueba exitosamente para la tienda seleccionada',
    en: 'Generated {count} test products successfully for the selected store',
    pt: 'Gerados {count} produtos de teste com sucesso para a loja selecionada'
  },
  'adminGenerateProducts.errorGeneratingStores': {
    es: 'Error generando tiendas',
    en: 'Error generating stores',
    pt: 'Erro ao gerar lojas'
  },
  'adminGenerateProducts.errorGeneratingProducts': {
    es: 'Error generando productos',
    en: 'Error generating products',
    pt: 'Erro ao gerar produtos'
  },
  'adminGenerateProducts.connectionErrorStores': {
    es: 'Error de conexión al generar tiendas',
    en: 'Connection error while generating stores',
    pt: 'Erro de conexão ao gerar lojas'
  },
  'adminGenerateProducts.connectionErrorProducts': {
    es: 'Error de conexión al generar productos',
    en: 'Connection error while generating products',
    pt: 'Erro de conexão ao gerar produtos'
  },
  'adminGenerateProducts.selectStoreRequired': {
    es: 'Debes seleccionar una tienda para generar productos',
    en: 'You must select a store to generate products',
    pt: 'Você deve selecionar uma loja para gerar produtos'
  },
  'adminGenerateProducts.whatWillBeGenerated': {
    es: '¿Qué se generará?',
    en: 'What will be generated?',
    pt: 'O que será gerado?'
  },
  'adminGenerateProducts.storesList': {
    es: '• 5 tiendas de prueba',
    en: '• 5 test stores',
    pt: '• 5 lojas de teste'
  },
  'adminGenerateProducts.storesList2': {
    es: '• Diferentes ciudades de Venezuela',
    en: '• Different cities in Venezuela',
    pt: '• Diferentes cidades da Venezuela'
  },
  'adminGenerateProducts.storesList3': {
    es: '• Propietarios y managers asignados',
    en: '• Assigned owners and managers',
    pt: '• Proprietários e gerentes designados'
  },
  'adminGenerateProducts.storesList4': {
    es: '• Configuración completa de negocio',
    en: '• Complete business configuration',
    pt: '• Configuração completa do negócio'
  },
  'adminGenerateProducts.storesList5': {
    es: '• Horarios de atención',
    en: '• Business hours',
    pt: '• Horários de funcionamento'
  },
  'adminGenerateProducts.storesList6': {
    es: '• Coordenadas GPS realistas',
    en: '• Realistic GPS coordinates',
    pt: '• Coordenadas GPS realistas'
  },
  'adminGenerateProducts.productsList': {
    es: '• 150 productos de prueba',
    en: '• 150 test products',
    pt: '• 150 produtos de teste'
  },
  'adminGenerateProducts.productsList2': {
    es: '• 15 marcas diferentes',
    en: '• 15 different brands',
    pt: '• 15 marcas diferentes'
  },
  'adminGenerateProducts.productsList3': {
    es: '• 11 categorías principales',
    en: '• 11 main categories',
    pt: '• 11 categorias principais'
  },
  'adminGenerateProducts.productsList4': {
    es: '• Múltiples subcategorías',
    en: '• Multiple subcategories',
    pt: '• Múltiplas subcategorias'
  },
  'adminGenerateProducts.productsList5': {
    es: '• SKUs únicos por tienda',
    en: '• Unique SKUs per store',
    pt: '• SKUs únicos por loja'
  },
  'adminGenerateProducts.productsList6': {
    es: '• Precios variados ($10 - $510)',
    en: '• Varied prices ($10 - $510)',
    pt: '• Preços variados ($10 - $510)'
  },
  'adminGenerateProducts.productsList7': {
    es: '• Stock aleatorio (1-50 unidades)',
    en: '• Random stock (1-50 units)',
    pt: '• Estoque aleatório (1-50 unidades)'
  },
  'adminGenerateProducts.productsList8': {
    es: '• Productos destacados (20%)',
    en: '• Featured products (20%)',
    pt: '• Produtos em destaque (20%)'
  },
  'adminGenerateProducts.generate5Stores': {
    es: 'Generar 5 Tiendas de Prueba',
    en: 'Generate 5 Test Stores',
    pt: 'Gerar 5 Lojas de Teste'
  },
  'adminGenerateProducts.generate150Products': {
    es: 'Generar 150 Productos',
    en: 'Generate 150 Products',
    pt: 'Gerar 150 Produtos'
  },
  'adminGenerateProducts.generatingStores': {
    es: 'Generando tiendas...',
    en: 'Generating stores...',
    pt: 'Gerando lojas...'
  },
  'adminGenerateProducts.generatingProducts': {
    es: 'Generando productos...',
    en: 'Generating products...',
    pt: 'Gerando produtos...'
  },
  'adminGenerateProducts.warningCreateStores': {
    es: '⚠️ Esta acción creará nuevas tiendas de prueba',
    en: '⚠️ This action will create new test stores',
    pt: '⚠️ Esta ação criará novas lojas de teste'
  },
  'adminGenerateProducts.warningStoreProducts': {
    es: '⚠️ Los productos se generarán para la tienda seleccionada',
    en: '⚠️ Products will be generated for the selected store',
    pt: '⚠️ Os produtos serão gerados para a loja selecionada'
  },
  'adminGenerateProducts.selectStore': {
    es: 'Seleccionar Tienda:',
    en: 'Select Store:',
    pt: 'Selecionar Loja:'
  },
  'adminGenerateProducts.selectStoreOption': {
    es: 'Seleccionar una tienda',
    en: 'Select a store',
    pt: 'Selecionar uma loja'
  },
  'adminGenerateProducts.noStoresAvailable': {
    es: 'No hay tiendas disponibles. Genera tiendas primero.',
    en: 'No stores available. Generate stores first.',
    pt: 'Não há lojas disponíveis. Gere lojas primeiro.'
  },
  'adminGenerateProducts.statistics': {
    es: 'Estadísticas',
    en: 'Statistics',
    pt: 'Estatísticas'
  },
  'adminGenerateProducts.update': {
    es: 'Actualizar',
    en: 'Update',
    pt: 'Atualizar'
  },
  'adminGenerateProducts.totalProducts': {
    es: 'Total Productos',
    en: 'Total Products',
    pt: 'Total de Produtos'
  },
  'adminGenerateProducts.categories': {
    es: 'Categorías',
    en: 'Categories',
    pt: 'Categorias'
  },
  'adminGenerateProducts.brands': {
    es: 'Marcas',
    en: 'Brands',
    pt: 'Marcas'
  },
  'adminGenerateProducts.featured': {
    es: 'Destacados',
    en: 'Featured',
    pt: 'Em Destaque'
  },
  'adminGenerateProducts.byCategory': {
    es: 'Por Categoría:',
    en: 'By Category:',
    pt: 'Por Categoria:'
  },
  'adminGenerateProducts.noStatisticsAvailable': {
    es: 'No hay estadísticas disponibles',
    en: 'No statistics available',
    pt: 'Não há estatísticas disponíveis'
  },
  'adminGenerateProducts.loadStatistics': {
    es: 'Cargar Estadísticas',
    en: 'Load Statistics',
    pt: 'Carregar Estatísticas'
  },
  'adminGenerateProducts.recentlyGeneratedStores': {
    es: 'Tiendas Generadas Recientemente',
    en: 'Recently Generated Stores',
    pt: 'Lojas Geradas Recentemente'
  },
  'adminGenerateProducts.new': {
    es: 'Nueva',
    en: 'New',
    pt: 'Nova'
  },
  'adminGenerateProducts.systemTestInfo': {
    es: 'Información del Sistema de Prueba',
    en: 'Test System Information',
    pt: 'Informações do Sistema de Teste'
  },
  'adminGenerateProducts.generatedStores': {
    es: 'Tiendas Generadas:',
    en: 'Generated Stores:',
    pt: 'Lojas Geradas:'
  },
  'adminGenerateProducts.includedCategories': {
    es: 'Categorías Incluidas:',
    en: 'Included Categories:',
    pt: 'Categorias Incluídas:'
  },
  'adminGenerateProducts.includedBrands': {
    es: 'Marcas Incluidas:',
    en: 'Included Brands:',
    pt: 'Marcas Incluídas:'
  },
  'adminGenerateProducts.usageInstructions': {
    es: 'Instrucciones de Uso',
    en: 'Usage Instructions',
    pt: 'Instruções de Uso'
  },
  'adminGenerateProducts.recommendedFlow': {
    es: 'Flujo Recomendado:',
    en: 'Recommended Flow:',
    pt: 'Fluxo Recomendado:'
  },
  'adminGenerateProducts.flowStep1': {
    es: '1. Generar Tiendas: Crea las tiendas de prueba primero',
    en: '1. Generate Stores: Create test stores first',
    pt: '1. Gerar Lojas: Crie as lojas de teste primeiro'
  },
  'adminGenerateProducts.flowStep2': {
    es: '2. Seleccionar Tienda: Elige una tienda del dropdown',
    en: '2. Select Store: Choose a store from the dropdown',
    pt: '2. Selecionar Loja: Escolha uma loja do dropdown'
  },
  'adminGenerateProducts.flowStep3': {
    es: '3. Generar Productos: Crea productos para esa tienda',
    en: '3. Generate Products: Create products for that store',
    pt: '3. Gerar Produtos: Crie produtos para essa loja'
  },
  'adminGenerateProducts.flowStep4': {
    es: '4. Repetir: Puedes generar productos para otras tiendas',
    en: '4. Repeat: You can generate products for other stores',
    pt: '4. Repetir: Você pode gerar produtos para outras lojas'
  },
  'adminGenerateProducts.flowStep5': {
    es: '5. Gestionar: Los gestores pueden acceder con sus credenciales',
    en: '5. Manage: Managers can access with their credentials',
    pt: '5. Gerenciar: Gerentes podem acessar com suas credenciais'
  },
  'adminGenerateProducts.systemFeatures': {
    es: 'Características del Sistema:',
    en: 'System Features:',
    pt: 'Características do Sistema:'
  },
  'adminGenerateProducts.feature1': {
    es: '• SKUs únicos por tienda: Mismo SKU en diferentes tiendas',
    en: '• Unique SKUs per store: Same SKU in different stores',
    pt: '• SKUs únicos por loja: Mesmo SKU em lojas diferentes'
  },
  'adminGenerateProducts.feature2': {
    es: '• Gestores asignados: Usuarios con rol store_manager',
    en: '• Assigned managers: Users with store_manager role',
    pt: '• Gerentes designados: Usuários com papel store_manager'
  },
  'adminGenerateProducts.feature3': {
    es: '• Configuración completa: Horarios, impuestos, entrega',
    en: '• Complete configuration: Hours, taxes, delivery',
    pt: '• Configuração completa: Horários, impostos, entrega'
  },
  'adminGenerateProducts.feature4': {
    es: '• Geolocalización: Coordenadas GPS realistas',
    en: '• Geolocation: Realistic GPS coordinates',
    pt: '• Geolocalização: Coordenadas GPS realistas'
  },
  'adminGenerateProducts.feature5': {
    es: '• Estadísticas por tienda: Filtros automáticos',
    en: '• Statistics per store: Automatic filters',
    pt: '• Estatísticas por loja: Filtros automáticos'
  },
  'adminGenerateProducts.feature6': {
    es: '• Credenciales de gestores: manager1@test.com - password123',
    en: '• Manager credentials: manager1@test.com - password123',
    pt: '• Credenciais de gerentes: manager1@test.com - password123'
  },
  'adminGenerateProducts.managerCredentials': {
    es: 'Credenciales de Gestores Generados',
    en: 'Generated Manager Credentials',
    pt: 'Credenciais de Gerentes Geradas'
  },
  'adminGenerateProducts.credentialsDescription': {
    es: 'Se han creado automáticamente gestores para las tiendas. Puedes usar estas credenciales para acceder como gestor:',
    en: 'Managers have been automatically created for the stores. You can use these credentials to access as a manager:',
    pt: 'Gerentes foram criados automaticamente para as lojas. Você pode usar essas credenciais para acessar como gerente:'
  },
  'adminGenerateProducts.manager': {
    es: 'Manager',
    en: 'Manager',
    pt: 'Gerente'
  },
  'adminGenerateProducts.email': {
    es: 'Email:',
    en: 'Email:',
    pt: 'Email:'
  },
  'adminGenerateProducts.password': {
    es: 'Contraseña:',
    en: 'Password:',
    pt: 'Senha:'
  },
  'adminGenerateProducts.role': {
    es: 'Rol:',
    en: 'Role:',
    pt: 'Papel:'
  },
  'adminGenerateProducts.storeManager': {
    es: 'store_manager',
    en: 'store_manager',
    pt: 'store_manager'
  },
  'adminGenerateProducts.credentialsNote': {
    es: 'Nota: Estos gestores pueden acceder al panel de gestión de tiendas y administrar productos, pedidos y configuraciones específicas de su tienda asignada.',
    en: 'Note: These managers can access the store management panel and manage products, orders and specific configurations of their assigned store.',
    pt: 'Nota: Esses gerentes podem acessar o painel de gerenciamento de lojas e gerenciar produtos, pedidos e configurações específicas de sua loja designada.'
  },
  // ===== HEADER MENU =====
  'header.admin': {
    es: 'Administrador',
    en: 'Administrator',
    pt: 'Administrador'
  },
  // ===== PROFILE PAGE =====
  'profile.title': {
    es: 'Mi Perfil',
    en: 'My Profile',
    pt: 'Meu Perfil'
  },
  'profile.loading': {
    es: 'Cargando perfil...',
    en: 'Loading profile...',
    pt: 'Carregando perfil...'
  },
  'profile.errorLoading': {
    es: 'Error al cargar el perfil',
    en: 'Error loading profile',
    pt: 'Erro ao carregar perfil'
  },
  'profile.errorUpdating': {
    es: 'Error al actualizar el perfil',
    en: 'Error updating profile',
    pt: 'Erro ao atualizar perfil'
  },
  'profile.errorSavingLocation': {
    es: 'Error al guardar la ubicación',
    en: 'Error saving location',
    pt: 'Erro ao salvar localização'
  },
  'profile.savedLocation': {
    es: 'Ubicación guardada',
    en: 'Saved location',
    pt: 'Localização salva'
  },
  'profile.personalInfo': {
    es: 'Información Personal',
    en: 'Personal Information',
    pt: 'Informações Pessoais'
  },
  'profile.name': {
    es: 'Nombre',
    en: 'Name',
    pt: 'Nome'
  },
  'profile.email': {
    es: 'Correo Electrónico',
    en: 'Email',
    pt: 'Email'
  },
  'profile.phone': {
    es: 'Teléfono',
    en: 'Phone',
    pt: 'Telefone'
  },
  'profile.address': {
    es: 'Dirección',
    en: 'Address',
    pt: 'Endereço'
  },
  'profile.edit': {
    es: 'Editar',
    en: 'Edit',
    pt: 'Editar'
  },
  'profile.save': {
    es: 'Guardar',
    en: 'Save',
    pt: 'Salvar'
  },
  'profile.cancel': {
    es: 'Cancelar',
    en: 'Cancel',
    pt: 'Cancelar'
  },
  'profile.location': {
    es: 'Ubicación',
    en: 'Location',
    pt: 'Localização'
  },
  'profile.activityHistory': {
    es: 'Historial de Actividad',
    en: 'Activity History',
    pt: 'Histórico de Atividade'
  },
  'profile.viewActivity': {
    es: 'Ver Actividad',
    en: 'View Activity',
    pt: 'Ver Atividade'
  },
  'profile.viewLocation': {
    es: 'Ver Ubicación',
    en: 'View Location',
    pt: 'Ver Localização'
  },
  'profile.configureLocation': {
    es: 'Configurar ubicación',
    en: 'Configure location',
    pt: 'Configurar localização'
  },
  'profile.configuredLocation': {
    es: 'Ubicación configurada',
    en: 'Configured location',
    pt: 'Localização configurada'
  },
  'profile.coordinates': {
    es: 'Coordenadas',
    en: 'Coordinates',
    pt: 'Coordenadas'
  },
  'profile.noLocationConfigured': {
    es: 'No hay ubicación configurada',
    en: 'No location configured',
    pt: 'Nenhuma localização configurada'
  },
  'profile.locationDescription': {
    es: 'Configura tu ubicación para mejorar la experiencia de búsqueda de productos cercanos.',
    en: 'Configure your location to improve the experience of searching for nearby products.',
    pt: 'Configure sua localização para melhorar a experiência de busca por produtos próximos.'
  },
  'profile.viewHistory': {
    es: 'Ver historial',
    en: 'View history',
    pt: 'Ver histórico'
  },
  'profile.locationUpdated': {
    es: 'Ubicación actualizada correctamente',
    en: 'Location updated successfully',
    pt: 'Localização atualizada com sucesso'
  },
  'profile.avatar': {
    es: 'Foto de Perfil',
    en: 'Profile Picture',
    pt: 'Foto do Perfil'
  },
  'profile.avatarDescription': {
    es: 'Sube una foto de perfil para personalizar tu cuenta. Formatos soportados: JPG, PNG, GIF. Tamaño máximo: 5MB.',
    en: 'Upload a profile picture to personalize your account. Supported formats: JPG, PNG, GIF. Maximum size: 5MB.',
    pt: 'Faça upload de uma foto de perfil para personalizar sua conta. Formatos suportados: JPG, PNG, GIF. Tamanho máximo: 5MB.'
  },
  'profile.uploadAvatar': {
    es: 'Subir Foto',
    en: 'Upload Photo',
    pt: 'Fazer Upload da Foto'
  },
  'profile.deleteAvatar': {
    es: 'Eliminar Foto',
    en: 'Delete Photo',
    pt: 'Excluir Foto'
  },
  'profile.invalidImageType': {
    es: 'Tipo de archivo no válido. Solo se permiten imágenes.',
    en: 'Invalid file type. Only images are allowed.',
    pt: 'Tipo de arquivo inválido. Apenas imagens são permitidas.'
  },
  'profile.imageTooLarge': {
    es: 'La imagen es demasiado grande. Tamaño máximo: 5MB.',
    en: 'The image is too large. Maximum size: 5MB.',
    pt: 'A imagem é muito grande. Tamanho máximo: 5MB.'
  },
  'profile.errorUploadingAvatar': {
    es: 'Error al subir la foto de perfil',
    en: 'Error uploading profile picture',
    pt: 'Erro ao fazer upload da foto do perfil'
  },
  'profile.errorDeletingAvatar': {
    es: 'Error al eliminar la foto de perfil',
    en: 'Error deleting profile picture',
    pt: 'Erro ao excluir a foto do perfil'
  },
  // ===== SECURITY PAGE =====
  'security.title': {
    es: 'Configuración de Seguridad',
    en: 'Security Settings',
    pt: 'Configurações de Segurança'
  },
  'security.subtitle': {
    es: 'Gestiona la seguridad de tu cuenta y protege tu información personal',
    en: 'Manage your account security and protect your personal information',
    pt: 'Gerencie a segurança da sua conta e proteja suas informações pessoais'
  },
  'security.errorLoading': {
    es: 'Error al cargar el perfil',
    en: 'Error loading profile',
    pt: 'Erro ao carregar perfil'
  },
  'security.errorChangingPassword': {
    es: 'Error al cambiar contraseña',
    en: 'Error changing password',
    pt: 'Erro ao alterar senha'
  },
  'security.errorSettingPin': {
    es: 'Error al configurar PIN',
    en: 'Error setting PIN',
    pt: 'Erro ao configurar PIN'
  },
  'security.errorSettingFingerprint': {
    es: 'Error al configurar huella digital',
    en: 'Error setting fingerprint',
    pt: 'Erro ao configurar impressão digital'
  },
  'security.errorSetting2FA': {
    es: 'Error al configurar 2FA',
    en: 'Error setting 2FA',
    pt: 'Erro ao configurar 2FA'
  },
  'security.errorSendingEmail': {
    es: 'Error al enviar email de verificación',
    en: 'Error sending verification email',
    pt: 'Erro ao enviar email de verificação'
  },
  'security.passwordChanged': {
    es: 'Contraseña cambiada correctamente',
    en: 'Password changed successfully',
    pt: 'Senha alterada com sucesso'
  },
  'security.pinConfigured': {
    es: 'PIN configurado correctamente',
    en: 'PIN configured successfully',
    pt: 'PIN configurado com sucesso'
  },
  'security.fingerprintConfigured': {
    es: 'Huella digital configurada correctamente',
    en: 'Fingerprint configured successfully',
    pt: 'Impressão digital configurada com sucesso'
  },
  'security.2FAConfigured': {
    es: '2FA configurado correctamente',
    en: '2FA configured successfully',
    pt: '2FA configurado com sucesso'
  },
  'security.emailSent': {
    es: 'Email de verificación enviado',
    en: 'Verification email sent',
    pt: 'Email de verificação enviado'
  },
  'security.password': {
    es: 'Contraseña',
    en: 'Password',
    pt: 'Senha'
  },
  'security.pin': {
    es: 'PIN',
    en: 'PIN',
    pt: 'PIN'
  },
  'security.fingerprint': {
    es: 'Huella Digital',
    en: 'Fingerprint',
    pt: 'Impressão Digital'
  },
  'security.twoFactor': {
    es: 'Autenticación de Dos Factores',
    en: 'Two-Factor Authentication',
    pt: 'Autenticação de Dois Fatores'
  },
  'security.emailVerification': {
    es: 'Verificación de Email',
    en: 'Email Verification',
    pt: 'Verificação de Email'
  },
  'security.changePassword': {
    es: 'Cambiar Contraseña',
    en: 'Change Password',
    pt: 'Alterar Senha'
  },
  'security.setupPin': {
    es: 'Configurar PIN',
    en: 'Setup PIN',
    pt: 'Configurar PIN'
  },
  'security.setupFingerprint': {
    es: 'Configurar Huella Digital',
    en: 'Setup Fingerprint',
    pt: 'Configurar Impressão Digital'
  },
  'security.setup2FA': {
    es: 'Configurar 2FA',
    en: 'Setup 2FA',
    pt: 'Configurar 2FA'
  },
  'security.verifyEmail': {
    es: 'Verificar Email',
    en: 'Verify Email',
    pt: 'Verificar Email'
  },
  'security.enabled': {
    es: 'Habilitado',
    en: 'Enabled',
    pt: 'Habilitado'
  },
  'security.configure': {
    es: 'Configurar',
    en: 'Configure',
    pt: 'Configurar'
  },
  'security.manage': {
    es: 'Gestionar',
    en: 'Manage',
    pt: 'Gerenciar'
  },
  'security.currentPassword': {
    es: 'Contraseña Actual',
    en: 'Current Password',
    pt: 'Senha Atual'
  },
  'security.newPassword': {
    es: 'Nueva Contraseña',
    en: 'New Password',
    pt: 'Nova Senha'
  },
  'security.confirmPassword': {
    es: 'Confirmar Contraseña',
    en: 'Confirm Password',
    pt: 'Confirmar Senha'
  },
  'security.pinCode': {
    es: 'Código PIN',
    en: 'PIN Code',
    pt: 'Código PIN'
  },
  'security.confirmPin': {
    es: 'Confirmar PIN',
    en: 'Confirm PIN',
    pt: 'Confirmar PIN'
  },
  'security.securityTips': {
    es: 'Consejos de Seguridad',
    en: 'Security Tips',
    pt: 'Dicas de Segurança'
  },
  'security.strongPassword': {
    es: 'Usa una contraseña fuerte con al menos 8 caracteres',
    en: 'Use a strong password with at least 8 characters',
    pt: 'Use uma senha forte com pelo menos 8 caracteres'
  },
  'security.uniquePin': {
    es: 'Usa un PIN único que no uses en otros servicios',
    en: 'Use a unique PIN that you don\'t use in other services',
    pt: 'Use um PIN único que você não usa em outros serviços'
  },
  'security.secureDevice': {
    es: 'Asegúrate de que tu dispositivo esté seguro',
    en: 'Make sure your device is secure',
    pt: 'Certifique-se de que seu dispositivo esteja seguro'
  },
  'security.securityOptions': {
    es: 'Opciones de Seguridad',
    en: 'Security Options',
    pt: 'Opções de Segurança'
  },
  'security.changePasswordDescription': {
    es: 'Cambia tu contraseña de acceso',
    en: 'Change your access password',
    pt: 'Altere sua senha de acesso'
  },
  'security.pinDescription': {
    es: 'PIN configurado',
    en: 'PIN configured',
    pt: 'PIN configurado'
  },
  'security.pinNotConfigured': {
    es: 'PIN no configurado',
    en: 'PIN not configured',
    pt: 'PIN não configurado'
  },
  'security.configured': {
    es: 'Configurado',
    en: 'Configured',
    pt: 'Configurado'
  },
  'security.notConfigured': {
    es: 'No configurado',
    en: 'Not configured',
    pt: 'Não configurado'
  },
  'security.emailVerified': {
    es: 'Email verificado',
    en: 'Email verified',
    pt: 'Email verificado'
  },
  'security.emailNotVerified': {
    es: 'Email no verificado',
    en: 'Email not verified',
    pt: 'Email não verificado'
  },
  'security.verified': {
    es: 'Verificado',
    en: 'Verified',
    pt: 'Verificado'
  },
  'security.pending': {
    es: 'Pendiente',
    en: 'Pending',
    pt: 'Pendente'
  },
  'security.view': {
    es: 'Ver',
    en: 'View',
    pt: 'Ver'
  },

  'security.fingerprintNotConfigured': {
    es: 'Huella no configurada',
    en: 'Fingerprint not configured',
    pt: 'Impressão digital não configurada'
  },
  'security.active': {
    es: 'Activada',
    en: 'Active',
    pt: 'Ativa'
  },
  'security.inactive': {
    es: 'Inactiva',
    en: 'Inactive',
    pt: 'Inativa'
  },
  'security.activate': {
    es: 'Activar',
    en: 'Activate',
    pt: 'Ativar'
  },
  'security.deactivate': {
    es: 'Desactivar',
    en: 'Deactivate',
    pt: 'Desativar'
  },
  'security.2FAEnabled': {
    es: '2FA activada',
    en: '2FA enabled',
    pt: '2FA ativada'
  },
  'security.2FANotEnabled': {
    es: '2FA no activada',
    en: '2FA not enabled',
    pt: '2FA não ativada'
  },
  'security.emailSentSuccess': {
    es: 'Email de verificación enviado correctamente',
    en: 'Verification email sent successfully',
    pt: 'Email de verificação enviado com sucesso'
  },
  'security.2FAEnabledSuccess': {
    es: 'Autenticación de dos factores activada correctamente',
    en: 'Two-factor authentication enabled successfully',
    pt: 'Autenticação de dois fatores ativada com sucesso'
  },
  'security.2FADisabledSuccess': {
    es: 'Autenticación de dos factores desactivada correctamente',
    en: 'Two-factor authentication disabled successfully',
    pt: 'Autenticação de dois fatores desativada com sucesso'
  },

  // ===== SECURITY MODALS =====
  'securityModals.pin.title': {
    es: 'Configurar PIN',
    en: 'Setup PIN',
    pt: 'Configurar PIN'
  },
  'securityModals.pin.updateTitle': {
    es: 'Actualizar PIN',
    en: 'Update PIN',
    pt: 'Atualizar PIN'
  },
  'securityModals.pin.currentPassword': {
    es: 'Contraseña actual',
    en: 'Current password',
    pt: 'Senha atual'
  },
  'securityModals.pin.currentPasswordPlaceholder': {
    es: 'Ingresa tu contraseña actual',
    en: 'Enter your current password',
    pt: 'Digite sua senha atual'
  },
  'securityModals.pin.newPin': {
    es: 'Nuevo PIN (4 dígitos)',
    en: 'New PIN (4 digits)',
    pt: 'Novo PIN (4 dígitos)'
  },
  'securityModals.pin.confirmPin': {
    es: 'Confirmar PIN',
    en: 'Confirm PIN',
    pt: 'Confirmar PIN'
  },
  'securityModals.pin.pinInfo': {
    es: 'Información del PIN:',
    en: 'PIN Information:',
    pt: 'Informações do PIN:'
  },
  'securityModals.pin.pinRules': {
    es: '• El PIN debe tener exactamente 4 dígitos',
    en: '• The PIN must have exactly 4 digits',
    pt: '• O PIN deve ter exatamente 4 dígitos'
  },
  'securityModals.pin.pinRules2': {
    es: '• Solo se permiten números del 0 al 9',
    en: '• Only numbers from 0 to 9 are allowed',
    pt: '• Apenas números de 0 a 9 são permitidos'
  },
  'securityModals.pin.pinRules3': {
    es: '• Se usará para acceso rápido a la aplicación',
    en: '• It will be used for quick access to the application',
    pt: '• Será usado para acesso rápido à aplicação'
  },
  'securityModals.pin.pinRules4': {
    es: '• Mantén tu PIN en un lugar seguro',
    en: '• Keep your PIN in a safe place',
    pt: 'Mantenha seu PIN em um local seguro'
  },
  'securityModals.pin.exactly4Digits': {
    es: 'Ingresa exactamente 4 dígitos numéricos',
    en: 'Enter exactly 4 numeric digits',
    pt: 'Digite exatamente 4 dígitos numéricos'
  },
  'securityModals.pin.pinMismatch': {
    es: 'Los PINs no coinciden',
    en: 'PINs do not match',
    pt: 'PINs não coincidem'
  },
  'securityModals.pin.currentPasswordRequired': {
    es: 'Debes ingresar tu contraseña actual',
    en: 'You must enter your current password',
    pt: 'Você deve digitar sua senha atual'
  },
  'securityModals.pin.pinMustBe4Digits': {
    es: 'El PIN debe tener exactamente 4 dígitos',
    en: 'The PIN must have exactly 4 digits',
    pt: 'O PIN deve ter exatamente 4 dígitos'
  },
  'securityModals.pin.pinUpdated': {
    es: 'PIN actualizado correctamente',
    en: 'PIN updated successfully',
    pt: 'PIN atualizado com sucesso'
  },
  'securityModals.pin.pinConfigured': {
    es: 'PIN configurado correctamente',
    en: 'PIN configured successfully',
    pt: 'PIN configurado com sucesso'
  },
  'securityModals.pin.errorConfiguring': {
    es: 'Error al configurar el PIN',
    en: 'Error configuring PIN',
    pt: 'Erro ao configurar PIN'
  },
  'securityModals.pin.saving': {
    es: 'Guardando...',
    en: 'Saving...',
    pt: 'Salvando...'
  },
  'securityModals.pin.updatePin': {
    es: 'Actualizar PIN',
    en: 'Update PIN',
    pt: 'Atualizar PIN'
  },
  'securityModals.pin.setupPin': {
    es: 'Configurar PIN',
    en: 'Setup PIN',
    pt: 'Configurar PIN'
  },

  // Fingerprint Modal
  'securityModals.fingerprint.activateTitle': {
    es: 'Activar Huella Digital',
    en: 'Activate Fingerprint',
    pt: 'Ativar Impressão Digital'
  },
  'securityModals.fingerprint.deactivateTitle': {
    es: 'Desactivar Huella Digital',
    en: 'Deactivate Fingerprint',
    pt: 'Desativar Impressão Digital'
  },
  'securityModals.fingerprint.activateQuestion': {
    es: '¿Activar huella digital?',
    en: 'Activate fingerprint?',
    pt: 'Ativar impressão digital?'
  },
  'securityModals.fingerprint.deactivateQuestion': {
    es: '¿Desactivar huella digital?',
    en: 'Deactivate fingerprint?',
    pt: 'Desativar impressão digital?'
  },
  'securityModals.fingerprint.activateDescription': {
    es: 'Podrás usar tu huella digital para acceder rápidamente a la aplicación.',
    en: 'You will be able to use your fingerprint to quickly access the application.',
    pt: 'Você poderá usar sua impressão digital para acessar rapidamente a aplicação.'
  },
  'securityModals.fingerprint.deactivateDescription': {
    es: 'Tu huella digital será removida del dispositivo. Podrás volver a configurarla más tarde.',
    en: 'Your fingerprint will be removed from the device. You can configure it again later.',
    pt: 'Sua impressão digital será removida do dispositivo. Você pode configurá-la novamente mais tarde.'
  },
  'securityModals.fingerprint.information': {
    es: 'Información:',
    en: 'Information:',
    pt: 'Informações:'
  },
  'securityModals.fingerprint.info1': {
    es: '• Solo funciona en dispositivos con sensor de huella',
    en: '• Only works on devices with fingerprint sensor',
    pt: '• Só funciona em dispositivos com sensor de impressão digital'
  },
  'securityModals.fingerprint.info2': {
    es: '• Los datos se almacenan de forma segura en tu dispositivo',
    en: '• Data is stored securely on your device',
    pt: '• Os dados são armazenados de forma segura no seu dispositivo'
  },
  'securityModals.fingerprint.info3': {
    es: '• Puedes desactivarla en cualquier momento',
    en: '• You can deactivate it at any time',
    pt: '• Você pode desativá-la a qualquer momento'
  },
  'securityModals.fingerprint.info4': {
    es: '• Siempre tendrás acceso con tu contraseña',
    en: '• You will always have access with your password',
    pt: '• Você sempre terá acesso com sua senha'
  },
  'securityModals.fingerprint.activated': {
    es: 'Huella digital activada',
    en: 'Fingerprint activated',
    pt: 'Impressão digital ativada'
  },
  'securityModals.fingerprint.deactivated': {
    es: 'Huella digital desactivada',
    en: 'Fingerprint deactivated',
    pt: 'Impressão digital desativada'
  },
  'securityModals.fingerprint.errorConfiguring': {
    es: 'Error al configurar la huella digital',
    en: 'Error configuring fingerprint',
    pt: 'Erro ao configurar impressão digital'
  },
  'securityModals.fingerprint.processing': {
    es: 'Procesando...',
    en: 'Processing...',
    pt: 'Processando...'
  },
  'securityModals.fingerprint.activate': {
    es: 'Activar',
    en: 'Activate',
    pt: 'Ativar'
  },
  'securityModals.fingerprint.deactivate': {
    es: 'Desactivar',
    en: 'Deactivate',
    pt: 'Desativar'
  },

  // Two Factor Modal
  'securityModals.2fa.title': {
    es: 'Autenticación de Dos Factores',
    en: 'Two-Factor Authentication',
    pt: 'Autenticação de Dois Fatores'
  },
  'securityModals.2fa.activateQuestion': {
    es: '¿Activar 2FA?',
    en: 'Activate 2FA?',
    pt: 'Ativar 2FA?'
  },
  'securityModals.2fa.deactivateQuestion': {
    es: '¿Desactivar 2FA?',
    en: 'Deactivate 2FA?',
    pt: 'Desativar 2FA?'
  },
  'securityModals.2fa.activateDescription': {
    es: 'Añadirá una capa extra de seguridad a tu cuenta usando códigos de verificación.',
    en: 'It will add an extra layer of security to your account using verification codes.',
    pt: 'Adicionará uma camada extra de segurança à sua conta usando códigos de verificação.'
  },
  'securityModals.2fa.deactivateDescription': {
    es: 'Tu cuenta volverá a usar solo contraseña para el acceso.',
    en: 'Your account will return to using only password for access.',
    pt: 'Sua conta voltará a usar apenas senha para acesso.'
  },
  'securityModals.2fa.setupGoogleAuthenticator': {
    es: 'Configurar Google Authenticator',
    en: 'Setup Google Authenticator',
    pt: 'Configurar Google Authenticator'
  },
  'securityModals.2fa.scanQRDescription': {
    es: 'Escanea este código QR con Google Authenticator o cualquier aplicación compatible',
    en: 'Scan this QR code with Google Authenticator or any compatible app',
    pt: 'Escaneie este código QR com Google Authenticator ou qualquer aplicativo compatível'
  },
  'securityModals.2fa.manualCode': {
    es: 'Código manual (si no puedes escanear):',
    en: 'Manual code (if you cannot scan):',
    pt: 'Código manual (se não conseguir escanear):'
  },
  'securityModals.2fa.instructions': {
    es: 'Instrucciones:',
    en: 'Instructions:',
    pt: 'Instruções:'
  },
  'securityModals.2fa.instruction1': {
    es: 'Descarga Google Authenticator desde tu tienda de aplicaciones',
    en: 'Download Google Authenticator from your app store',
    pt: 'Baixe Google Authenticator da sua loja de aplicativos'
  },
  'securityModals.2fa.instruction2': {
    es: 'Abre la aplicación y toca el botón "+"',
    en: 'Open the app and tap the "+" button',
    pt: 'Abra o aplicativo e toque no botão "+"'
  },
  'securityModals.2fa.instruction3': {
    es: 'Selecciona "Escanear código QR"',
    en: 'Select "Scan QR code"',
    pt: 'Selecione "Escanear código QR"'
  },
  'securityModals.2fa.instruction4': {
    es: 'Apunta la cámara al código QR de arriba',
    en: 'Point the camera at the QR code above',
    pt: 'Aponte a câmera para o código QR acima'
  },
  'securityModals.2fa.instruction5': {
    es: 'O ingresa manualmente el código secreto',
    en: 'Or enter the secret code manually',
    pt: 'Ou digite o código secreto manualmente'
  },
  'securityModals.2fa.backupCodes': {
    es: 'Códigos de respaldo:',
    en: 'Backup codes:',
    pt: 'Códigos de backup:'
  },
  'securityModals.2fa.backupCodesDescription': {
    es: 'Guarda estos códigos en un lugar seguro. Te permitirán acceder si pierdes tu dispositivo.',
    en: 'Save these codes in a safe place. They will allow you to access if you lose your device.',
    pt: 'Salve estes códigos em um local seguro. Eles permitirão que você acesse se perder seu dispositivo.'
  },
  'securityModals.2fa.downloadCodes': {
    es: 'Descargar códigos',
    en: 'Download codes',
    pt: 'Baixar códigos'
  },
  'securityModals.2fa.verifySetup': {
    es: 'Verificar configuración',
    en: 'Verify setup',
    pt: 'Verificar configuração'
  },
  'securityModals.2fa.verifyDescription': {
    es: 'Abre Google Authenticator y ingresa el código de 6 dígitos que aparece',
    en: 'Open Google Authenticator and enter the 6-digit code that appears',
    pt: 'Abra Google Authenticator e digite o código de 6 dígitos que aparece'
  },
  'securityModals.2fa.codeChangesEvery30': {
    es: 'El código cambia cada 30 segundos',
    en: 'The code changes every 30 seconds',
    pt: 'O código muda a cada 30 segundos'
  },
  'securityModals.2fa.codeMustBe6Digits': {
    es: 'El código debe tener 6 dígitos',
    en: 'The code must have 6 digits',
    pt: 'O código deve ter 6 dígitos'
  },
  'securityModals.2fa.invalidCode': {
    es: 'Código inválido',
    en: 'Invalid code',
    pt: 'Código inválido'
  },
  'securityModals.2fa.activatedSuccessfully': {
    es: 'Autenticación de dos factores activada correctamente',
    en: 'Two-factor authentication activated successfully',
    pt: 'Autenticação de dois fatores ativada com sucesso'
  },
  'securityModals.2fa.deactivatedSuccessfully': {
    es: 'Autenticación de dos factores desactivada',
    en: 'Two-factor authentication deactivated',
    pt: 'Autenticação de dois fatores desativada'
  },
  'securityModals.2fa.errorActivating': {
    es: 'Error al activar 2FA',
    en: 'Error activating 2FA',
    pt: 'Erro ao ativar 2FA'
  },
  'securityModals.2fa.errorDeactivating': {
    es: 'Error al desactivar 2FA',
    en: 'Error deactivating 2FA',
    pt: 'Erro ao desativar 2FA'
  },
  'securityModals.2fa.processing': {
    es: 'Procesando...',
    en: 'Processing...',
    pt: 'Processando...'
  },
  'securityModals.2fa.verifying': {
    es: 'Verificando...',
    en: 'Verifying...',
    pt: 'Verificando...'
  },
  'securityModals.2fa.verifyAndActivate': {
    es: 'Verificar y Activar',
    en: 'Verify and Activate',
    pt: 'Verificar e Ativar'
  },

  // Email Verification Modal
  'securityModals.email.title': {
    es: 'Verificación de Email',
    en: 'Email Verification',
    pt: 'Verificação de Email'
  },
  'securityModals.email.verified': {
    es: 'Email Verificado',
    en: 'Email Verified',
    pt: 'Email Verificado'
  },
  'securityModals.email.verifiedDescription': {
    es: 'Tu email está verificado y tu cuenta está completamente activa.',
    en: 'Your email is verified and your account is fully active.',
    pt: 'Seu email está verificado e sua conta está totalmente ativa.'
  },
  'securityModals.email.accountVerified': {
    es: 'Cuenta verificada y segura',
    en: 'Account verified and secure',
    pt: 'Conta verificada e segura'
  },
  'securityModals.email.verifyEmail': {
    es: 'Verificar Email',
    en: 'Verify Email',
    pt: 'Verificar Email'
  },
  'securityModals.email.verifyDescription': {
    es: 'Necesitas verificar tu email para completar la configuración de tu cuenta.',
    en: 'You need to verify your email to complete your account setup.',
    pt: 'Você precisa verificar seu email para completar a configuração da sua conta.'
  },
  'securityModals.email.verificationSteps': {
    es: 'Pasos para verificar:',
    en: 'Steps to verify:',
    pt: 'Passos para verificar:'
  },
  'securityModals.email.step1': {
    es: '• Revisa tu bandeja de entrada',
    en: '• Check your inbox',
    pt: '• Verifique sua caixa de entrada'
  },
  'securityModals.email.step2': {
    es: '• Busca el email de verificación',
    en: '• Look for the verification email',
    pt: '• Procure pelo email de verificação'
  },
  'securityModals.email.step3': {
    es: '• Haz clic en el enlace de verificación',
    en: '• Click on the verification link',
    pt: '• Clique no link de verificação'
  },
  'securityModals.email.step4': {
    es: '• Si no lo encuentras, revisa la carpeta de spam',
    en: '• If you cannot find it, check the spam folder',
    pt: '• Se não encontrar, verifique a pasta de spam'
  },
  'securityModals.email.emailSentSuccessfully': {
    es: 'Email de verificación enviado correctamente',
    en: 'Verification email sent successfully',
    pt: 'Email de verificação enviado com sucesso'
  },
  'securityModals.email.errorSendingEmail': {
    es: 'Error al enviar el email de verificación',
    en: 'Error sending verification email',
    pt: 'Erro ao enviar email de verificação'
  },
  'securityModals.email.sending': {
    es: 'Enviando...',
    en: 'Sending...',
    pt: 'Enviando...'
  },
  'securityModals.email.resendEmail': {
    es: 'Reenviar Email',
    en: 'Resend Email',
    pt: 'Reenviar Email'
  },
  'securityModals.email.close': {
    es: 'Cerrar',
    en: 'Close',
    pt: 'Fechar'
  },

  // ===== SECURITY MODALS =====


  'securityModal.passwordChangedSuccess': {
    es: 'Contraseña cambiada exitosamente',
    en: 'Password changed successfully',
    pt: 'Senha alterada com sucesso'
  },
  'securityModal.errorChangingPassword': {
    es: 'Error al cambiar la contraseña',
    en: 'Error changing password',
    pt: 'Erro ao alterar senha'
  },
  'securityModal.passwordRequirements': {
    es: 'Requisitos de la contraseña',
    en: 'Password requirements',
    pt: 'Requisitos da senha'
  },
  'securityModal.minLength': {
    es: 'Al menos 8 caracteres',
    en: 'At least 8 characters',
    pt: 'Pelo menos 8 caracteres'
  },
  'securityModal.uppercase': {
    es: 'Al menos una mayúscula',
    en: 'At least one uppercase',
    pt: 'Pelo menos uma maiúscula'
  },
  'securityModal.lowercase': {
    es: 'Al menos una minúscula',
    en: 'At least one lowercase',
    pt: 'Pelo menos uma minúscula'
  },
  'securityModal.number': {
    es: 'Al menos un número',
    en: 'At least one number',
    pt: 'Pelo menos um número'
  },
  'securityModal.specialChar': {
    es: 'Al menos un carácter especial',
    en: 'At least one special character',
    pt: 'Pelo menos um caractere especial'
  },
  'securityModal.passwordsMatch': {
    es: 'Las contraseñas coinciden',
    en: 'Passwords match',
    pt: 'As senhas coincidem'
  },
  'securityModal.passwordsNotMatch': {
    es: 'Las contraseñas no coinciden',
    en: 'Passwords do not match',
    pt: 'As senhas não coincidem'
  },
  'securityModal.change': {
    es: 'Cambiar',
    en: 'Change',
    pt: 'Alterar'
  },
  'securityModal.cancel': {
    es: 'Cancelar',
    en: 'Cancel',
    pt: 'Cancelar'
  },
  'securityModal.changePassword': {
    es: 'Cambiar Contraseña',
    en: 'Change Password',
    pt: 'Alterar Senha'
  },
  'securityModal.changePasswordDescription': {
    es: 'Actualiza tu contraseña de seguridad',
    en: 'Update your security password',
    pt: 'Atualize sua senha de segurança'
  },
  'securityModal.currentPassword': {
    es: 'Contraseña Actual',
    en: 'Current Password',
    pt: 'Senha Atual'
  },
  'securityModal.currentPasswordPlaceholder': {
    es: 'Ingresa tu contraseña actual',
    en: 'Enter your current password',
    pt: 'Digite sua senha atual'
  },
  'securityModal.newPassword': {
    es: 'Nueva Contraseña',
    en: 'New Password',
    pt: 'Nova Senha'
  },
  'securityModal.newPasswordPlaceholder': {
    es: 'Ingresa tu nueva contraseña',
    en: 'Enter your new password',
    pt: 'Digite sua nova senha'
  },
  'securityModal.confirmPassword': {
    es: 'Confirmar Nueva Contraseña',
    en: 'Confirm New Password',
    pt: 'Confirmar Nova Senha'
  },
  'securityModal.confirmPasswordPlaceholder': {
    es: 'Confirma tu nueva contraseña',
    en: 'Confirm your new password',
    pt: 'Confirme sua nova senha'
  },
  'securityModal.passwordMustContain': {
    es: 'La contraseña debe contener:',
    en: 'Password must contain:',
    pt: 'A senha deve conter:'
  },
  'securityModal.securityTips': {
    es: 'Consejos de seguridad:',
    en: 'Security tips:',
    pt: 'Dicas de segurança:'
  },
  'securityModal.tip1': {
    es: 'No uses información personal como fechas de nacimiento',
    en: 'Do not use personal information like birth dates',
    pt: 'Não use informações pessoais como datas de nascimento'
  },
  'securityModal.tip2': {
    es: 'Evita contraseñas comunes como "123456" o "password"',
    en: 'Avoid common passwords like "123456" or "password"',
    pt: 'Evite senhas comuns como "123456" ou "password"'
  },
  'securityModal.tip3': {
    es: 'Considera usar un gestor de contraseñas',
    en: 'Consider using a password manager',
    pt: 'Considere usar um gerenciador de senhas'
  },
  'securityModal.tip4': {
    es: 'Cambia tu contraseña regularmente',
    en: 'Change your password regularly',
    pt: 'Altere sua senha regularmente'
  },
  'securityModal.changing': {
    es: 'Cambiando...',
    en: 'Changing...',
    pt: 'Alterando...'
  },
  'securityModals.2fa.manualCodeTitle': {
    es: 'Código manual (si no puedes escanear):',
    en: 'Manual code (if you cannot scan):',
    pt: 'Código manual (se não conseguir escanear):'
  },
  'securityModals.2fa.instructionsTitle': {
    es: 'Instrucciones:',
    en: 'Instructions:',
    pt: 'Instruções:'
  },
  'securityModals.2fa.backupCodesTitle': {
    es: 'Códigos de respaldo:',
    en: 'Backup codes:',
    pt: 'Códigos de backup:'
  },
  'securityModals.2fa.backupCodesSaveDescription': {
    es: 'Guarda estos códigos en un lugar seguro. Te permitirán acceder si pierdes tu dispositivo.',
    en: 'Save these codes in a safe place. They will allow you to access if you lose your device.',
    pt: 'Guarde esses códigos em um local seguro. Eles permitirão que você acesse se perder seu dispositivo.'
  },
  'securityModals.2fa.downloadCodesButton': {
    es: 'Descargar códigos',
    en: 'Download codes',
    pt: 'Baixar códigos'
  },
  'securityModals.2fa.verifyConfiguration': {
    es: 'Verificar configuración',
    en: 'Verify configuration',
    pt: 'Verificar configuração'
  },
  'securityModals.2fa.verifyConfigurationDescription': {
    es: 'Abre Google Authenticator y ingresa el código de 6 dígitos que aparece',
    en: 'Open Google Authenticator and enter the 6-digit code that appears',
    pt: 'Abra o Google Authenticator e digite o código de 6 dígitos que aparece'
  },
  'securityModals.2fa.codeChangesEvery30Seconds': {
    es: 'El código cambia cada 30 segundos',
    en: 'The code changes every 30 seconds',
    pt: 'O código muda a cada 30 segundos'
  },
  'securityModals.2fa.activate': {
    es: 'Activar',
    en: 'Activate',
    pt: 'Ativar'
  },
  'securityModals.2fa.deactivate': {
    es: 'Desactivar',
    en: 'Deactivate',
    pt: 'Desativar'
  },
  'redemptionManagement.noRedemptions': {
    es: 'No se encontraron canjes',
    en: 'No redemptions found',
    pt: 'Nenhum resgate encontrado'
  },

  // ===== MÓDULO DE MONETIZACIÓN =====
  'monetization.title': {
    es: 'Monetización',
    en: 'Monetization',
    pt: 'Monetização'
  },
  'monetization.exchangeRate.title': {
    es: 'Tasa de Cambio',
    en: 'Exchange Rate',
    pt: 'Taxa de Câmbio'
  },
  'monetization.exchangeRate.updateManually': {
    es: 'Actualizar Manualmente',
    en: 'Update Manually',
    pt: 'Atualizar Manualmente'
  },
  'monetization.exchangeRate.history': {
    es: 'Historial de Tasas',
    en: 'Rate History',
    pt: 'Histórico de Taxas'
  },
  'monetization.exchangeRate.sourceUrl': {
    es: 'URL de Fuente',
    en: 'Source URL',
    pt: 'URL da Fonte'
  },
  'monetization.exchangeRate.manualRate': {
    es: 'Tasa Manual',
    en: 'Manual Rate',
    pt: 'Taxa Manual'
  },
  'monetization.exchangeRate.reason': {
    es: 'Motivo de Actualización',
    en: 'Update Reason',
    pt: 'Motivo da Atualização'
  },
  'monetization.exchangeRate.lastUpdated': {
    es: 'Última Actualización',
    en: 'Last Updated',
    pt: 'Última Atualização'
  },
  'monetization.exchangeRate.source': {
    es: 'Fuente',
    en: 'Source',
    pt: 'Fonte'
  },
  'monetization.exchangeRate.manual': {
    es: 'Manual',
    en: 'Manual',
    pt: 'Manual'
  },
  'monetization.exchangeRate.bcv': {
    es: 'BCV',
    en: 'BCV',
    pt: 'BCV'
  },

  'monetization.commissions.title': {
    es: 'Comisiones',
    en: 'Commissions',
    pt: 'Comissões'
  },
  'monetization.commissions.create': {
    es: 'Crear Comisión',
    en: 'Create Commission',
    pt: 'Criar Comissão'
  },
  'monetization.commissions.edit': {
    es: 'Editar Comisión',
    en: 'Edit Commission',
    pt: 'Editar Comissão'
  },
  'monetization.commissions.name': {
    es: 'Nombre',
    en: 'Name',
    pt: 'Nome'
  },
  'monetization.commissions.description': {
    es: 'Descripción',
    en: 'Description',
    pt: 'Descrição'
  },
  'monetization.commissions.type': {
    es: 'Tipo',
    en: 'Type',
    pt: 'Tipo'
  },
  'monetization.commissions.baseRate': {
    es: 'Tasa Base',
    en: 'Base Rate',
    pt: 'Taxa Base'
  },
  'monetization.commissions.storeType': {
    es: 'Tipo de Tienda',
    en: 'Store Type',
    pt: 'Tipo de Loja'
  },
  'monetization.commissions.percentage': {
    es: 'Porcentaje',
    en: 'Percentage',
    pt: 'Percentual'
  },
  'monetization.commissions.fixed': {
    es: 'Fijo',
    en: 'Fixed',
    pt: 'Fixo'
  },
  'monetization.commissions.tiered': {
    es: 'Por Niveles',
    en: 'Tiered',
    pt: 'Por Níveis'
  },
  'monetization.commissions.storeTypes.new': {
    es: 'Nueva',
    en: 'New',
    pt: 'Nova'
  },
  'monetization.commissions.storeTypes.growing': {
    es: 'En Crecimiento',
    en: 'Growing',
    pt: 'Em Crescimento'
  },
  'monetization.commissions.storeTypes.established': {
    es: 'Establecida',
    en: 'Established',
    pt: 'Estabelecida'
  },
  'monetization.commissions.storeTypes.premium': {
    es: 'Premium',
    en: 'Premium',
    pt: 'Premium'
  },

  'monetization.subscriptions.title': {
    es: 'Suscripciones',
    en: 'Subscriptions',
    pt: 'Assinaturas'
  },
  'monetization.subscriptions.create': {
    es: 'Crear Plan',
    en: 'Create Plan',
    pt: 'Criar Plano'
  },
  'monetization.subscriptions.name': {
    es: 'Nombre del Plan',
    en: 'Plan Name',
    pt: 'Nome do Plano'
  },
  'monetization.subscriptions.price': {
    es: 'Precio',
    en: 'Price',
    pt: 'Preço'
  },
  'monetization.subscriptions.currency': {
    es: 'Moneda',
    en: 'Currency',
    pt: 'Moeda'
  },
  'monetization.subscriptions.billingCycle': {
    es: 'Ciclo de Facturación',
    en: 'Billing Cycle',
    pt: 'Ciclo de Cobrança'
  },
  'monetization.subscriptions.monthly': {
    es: 'Mensual',
    en: 'Monthly',
    pt: 'Mensal'
  },
  'monetization.subscriptions.yearly': {
    es: 'Anual',
    en: 'Yearly',
    pt: 'Anual'
  },
  'monetization.subscriptions.features': {
    es: 'Características',
    en: 'Features',
    pt: 'Recursos'
  },
  'monetization.subscriptions.types.basic': {
    es: 'Básico',
    en: 'Basic',
    pt: 'Básico'
  },
  'monetization.subscriptions.types.pro': {
    es: 'Pro',
    en: 'Pro',
    pt: 'Pro'
  },
  'monetization.subscriptions.types.elite': {
    es: 'Élite',
    en: 'Élite',
    pt: 'Élite'
  },

  'monetization.taxes.title': {
    es: 'Impuestos',
    en: 'Taxes',
    pt: 'Impostos'
  },
  'monetization.taxes.create': {
    es: 'Crear Impuesto',
    en: 'Create Tax',
    pt: 'Criar Imposto'
  },
  'monetization.taxes.name': {
    es: 'Nombre del Impuesto',
    en: 'Tax Name',
    pt: 'Nome do Imposto'
  },
  'monetization.taxes.rate': {
    es: 'Tasa',
    en: 'Rate',
    pt: 'Taxa'
  },
  'monetization.taxes.type': {
    es: 'Tipo de Impuesto',
    en: 'Tax Type',
    pt: 'Tipo de Imposto'
  },
  'monetization.taxes.iva': {
    es: 'IVA',
    en: 'VAT',
    pt: 'IVA'
  },
  'monetization.taxes.islr': {
    es: 'ISLR',
    en: 'ISLR',
    pt: 'ISLR'
  },
  'monetization.taxes.custom': {
    es: 'Personalizado',
    en: 'Custom',
    pt: 'Personalizado'
  },
  'monetization.taxes.country': {
    es: 'País',
    en: 'Country',
    pt: 'País'
  },
  'monetization.taxes.state': {
    es: 'Estado',
    en: 'State',
    pt: 'Estado'
  },

  'monetization.calculator.title': {
    es: 'Calculadora',
    en: 'Calculator',
    pt: 'Calculadora'
  },
  'monetization.calculator.commission': {
    es: 'Calcular Comisión',
    en: 'Calculate Commission',
    pt: 'Calcular Comissão'
  },
  'monetization.calculator.taxes': {
    es: 'Calcular Impuestos',
    en: 'Calculate Taxes',
    pt: 'Calcular Impostos'
  },
  'monetization.calculator.amount': {
    es: 'Monto',
    en: 'Amount',
    pt: 'Valor'
  },
  'monetization.calculator.monthlySales': {
    es: 'Ventas Mensuales',
    en: 'Monthly Sales',
    pt: 'Vendas Mensais'
  },
  'monetization.calculator.calculate': {
    es: 'Calcular',
    en: 'Calculate',
    pt: 'Calcular'
  },
  'monetization.calculator.results': {
    es: 'Resultados',
    en: 'Results',
    pt: 'Resultados'
  },
  'monetization.calculator.commissionAmount': {
    es: 'Comisión',
    en: 'Commission',
    pt: 'Comissão'
  },
  'monetization.calculator.netAmount': {
    es: 'Monto Neto',
    en: 'Net Amount',
    pt: 'Valor Líquido'
  },
  'monetization.calculator.totalTax': {
    es: 'Total de Impuestos',
    en: 'Total Tax',
    pt: 'Total de Impostos'
  },
  'monetization.calculator.total': {
    es: 'Total',
    en: 'Total',
    pt: 'Total'
  },

  'monetization.common.save': {
    es: 'Guardar',
    en: 'Save',
    pt: 'Salvar'
  },
  'monetization.common.cancel': {
    es: 'Cancelar',
    en: 'Cancel',
    pt: 'Cancelar'
  },
  'monetization.common.edit': {
    es: 'Editar',
    en: 'Edit',
    pt: 'Editar'
  },
  'monetization.common.delete': {
    es: 'Eliminar',
    en: 'Delete',
    pt: 'Excluir'
  },
  'monetization.common.create': {
    es: 'Crear',
    en: 'Create',
    pt: 'Criar'
  },
  'monetization.common.update': {
    es: 'Actualizar',
    en: 'Update',
    pt: 'Atualizar'
  },
  'monetization.common.success': {
    es: 'Operación exitosa',
    en: 'Operation successful',
    pt: 'Operação bem-sucedida'
  },
  'monetization.common.error': {
    es: 'Error en la operación',
    en: 'Operation error',
    pt: 'Erro na operação'
  },
  'monetization.common.loading': {
    es: 'Cargando...',
    en: 'Loading...',
    pt: 'Carregando...'
  },
  'monetization.common.noData': {
    es: 'No hay datos disponibles',
    en: 'No data available',
    pt: 'Nenhum dado disponível'
  },

  // ===== MÓDULO DE RESEÑAS =====
  'storeManager.reviews.title': {
    es: 'Gestión de Reseñas',
    en: 'Reviews Management',
    pt: 'Gestão de Avaliações'
  },
  'storeManager.reviews.description': {
    es: 'Administra y responde a las reseñas de tus productos y servicios',
    en: 'Manage and respond to reviews of your products and services',
    pt: 'Gerencie e responda às avaliações dos seus produtos e serviços'
  },
  'storeManager.reviews.tabs.all': {
    es: 'Todas las Reseñas',
    en: 'All Reviews',
    pt: 'Todas as Avaliações'
  },
  'storeManager.reviews.tabs.pending': {
    es: 'Pendientes de Respuesta',
    en: 'Pending Replies',
    pt: 'Pendentes de Resposta'
  },
  'storeManager.reviews.tabs.stats': {
    es: 'Estadísticas',
    en: 'Statistics',
    pt: 'Estatísticas'
  },
  'storeManager.reviews.stats.averageRating': {
    es: 'Calificación Promedio',
    en: 'Average Rating',
    pt: 'Avaliação Média'
  },
  'storeManager.reviews.stats.totalReviews': {
    es: 'Total de Reseñas',
    en: 'Total Reviews',
    pt: 'Total de Avaliações'
  },
  'storeManager.reviews.stats.pendingReplies': {
    es: 'Pendientes de Respuesta',
    en: 'Pending Replies',
    pt: 'Pendentes de Resposta'
  },
  'storeManager.reviews.stats.totalPoints': {
    es: 'Puntos Totales',
    en: 'Total Points',
    pt: 'Pontos Totais'
  },
  'storeManager.reviews.filters.rating': {
    es: 'Calificación',
    en: 'Rating',
    pt: 'Avaliação'
  },
  'storeManager.reviews.filters.allRatings': {
    es: 'Todas las calificaciones',
    en: 'All ratings',
    pt: 'Todas as avaliações'
  },
  'storeManager.reviews.filters.stars': {
    es: 'estrellas',
    en: 'stars',
    pt: 'estrelas'
  },
  'storeManager.reviews.filters.star': {
    es: 'estrella',
    en: 'star',
    pt: 'estrela'
  },
  'storeManager.reviews.filters.category': {
    es: 'Categoría',
    en: 'Category',
    pt: 'Categoria'
  },
  'storeManager.reviews.filters.allCategories': {
    es: 'Todas las categorías',
    en: 'All categories',
    pt: 'Todas as categorias'
  },
  'storeManager.reviews.filters.verified': {
    es: 'Verificada',
    en: 'Verified',
    pt: 'Verificada'
  },
  'storeManager.reviews.filters.all': {
    es: 'Todas',
    en: 'All',
    pt: 'Todas'
  },
  'storeManager.reviews.filters.notVerified': {
    es: 'No verificada',
    en: 'Not verified',
    pt: 'Não verificada'
  },
  'storeManager.reviews.filters.sortBy': {
    es: 'Ordenar por',
    en: 'Sort by',
    pt: 'Ordenar por'
  },
  'storeManager.reviews.filters.newest': {
    es: 'Más recientes',
    en: 'Newest',
    pt: 'Mais recentes'
  },
  'storeManager.reviews.filters.oldest': {
    es: 'Más antiguas',
    en: 'Oldest',
    pt: 'Mais antigas'
  },
  'storeManager.reviews.filters.highestRating': {
    es: 'Mayor calificación',
    en: 'Highest rating',
    pt: 'Maior avaliação'
  },
  'storeManager.reviews.filters.lowestRating': {
    es: 'Menor calificación',
    en: 'Lowest rating',
    pt: 'Menor avaliação'
  },
  'storeManager.reviews.noReviews': {
    es: 'No hay reseñas',
    en: 'No reviews',
    pt: 'Nenhuma avaliação'
  },
  'storeManager.reviews.noReviewsDescription': {
    es: 'Cuando los clientes escriban reseñas, aparecerán aquí',
    en: 'When customers write reviews, they will appear here',
    pt: 'Quando os clientes escreverem avaliações, elas aparecerão aqui'
  },
  'storeManager.reviews.reply.title': {
    es: 'Responder a la Reseña',
    en: 'Reply to Review',
    pt: 'Responder à Avaliação'
  },
  'storeManager.reviews.reply.placeholder': {
    es: 'Escribe tu respuesta...',
    en: 'Write your reply...',
    pt: 'Escreva sua resposta...'
  },
  'storeManager.reviews.reply.send': {
    es: 'Enviar Respuesta',
    en: 'Send Reply',
    pt: 'Enviar Resposta'
  },

  // ===== CATEGORÍAS DE RESEÑAS =====
  'reviews.categories.product': {
    es: 'Producto',
    en: 'Product',
    pt: 'Produto'
  },
  'reviews.categories.service': {
    es: 'Servicio',
    en: 'Service',
    pt: 'Serviço'
  },
  'reviews.categories.delivery': {
    es: 'Entrega',
    en: 'Delivery',
    pt: 'Entrega'
  },
  'reviews.categories.app': {
    es: 'Aplicación',
    en: 'App',
    pt: 'Aplicativo'
  },

  // ===== TRADUCCIONES COMUNES =====
  'common.previous': {
    es: 'Anterior',
    en: 'Previous',
    pt: 'Anterior'
  },
  'common.next': {
    es: 'Siguiente',
    en: 'Next',
    pt: 'Próximo'
  },
  'common.sending': {
    es: 'Enviando...',
    en: 'Sending...',
    pt: 'Enviando...'
  },

  // ===== ESTADÍSTICAS =====
  'stats.periods.last7Days': {
    es: 'Últimos 7 días',
    en: 'Last 7 days',
    pt: 'Últimos 7 dias'
  },
  'stats.periods.last30Days': {
    es: 'Últimos 30 días',
    en: 'Last 30 days',
    pt: 'Últimos 30 dias'
  },
  'stats.periods.last90Days': {
    es: 'Últimos 90 días',
    en: 'Last 90 days',
    pt: 'Últimos 90 dias'
  },
  'stats.periods.lastYear': {
    es: 'Último año',
    en: 'Last year',
    pt: 'Último ano'
  },
  'storeManager.reviews.stats.title': {
    es: 'Estadísticas de Reseñas',
    en: 'Review Statistics',
    pt: 'Estatísticas de Avaliações'
  },
  'storeManager.reviews.stats.ratingDistribution': {
    es: 'Distribución de Calificaciones',
    en: 'Rating Distribution',
    pt: 'Distribuição de Avaliações'
  },
  'storeManager.reviews.stats.positiveReviews': {
    es: 'Reseñas Positivas',
    en: 'Positive Reviews',
    pt: 'Avaliações Positivas'
  },
  'storeManager.reviews.stats.negativeReviews': {
    es: 'Reseñas Negativas',
    en: 'Negative Reviews',
    pt: 'Avaliações Negativas'
  },

  // ===== DELIVERY REPORT =====
  'deliveryReport.title': { es: 'Reportar Entrega', en: 'Delivery Report', pt: 'Relatório de Entrega' },
  'deliveryReport.subtitle': { es: 'Gestiona y reporta el estado de tus entregas', en: 'Manage and report the status of your deliveries', pt: 'Gerencie e relate o status de suas entregas' },
  'deliveryReport.activeDeliveries': { es: 'Entregas Activas', en: 'Active Deliveries', pt: 'Entregas Ativas' },
  'deliveryReport.completedDeliveries': { es: 'Entregas Completadas', en: 'Completed Deliveries', pt: 'Entregas Concluídas' },
  'deliveryReport.pendingDeliveries': { es: 'Entregas Pendientes', en: 'Pending Deliveries', pt: 'Entregas Pendentes' },
  'deliveryReport.reportDelivery': { es: 'Reportar Entrega', en: 'Report Delivery', pt: 'Relatar Entrega' },
  'deliveryReport.updateStatus': { es: 'Actualizar Estado', en: 'Update Status', pt: 'Atualizar Status' },
  'deliveryReport.deliveryDetails': { es: 'Detalles de Entrega', en: 'Delivery Details', pt: 'Detalhes da Entrega' },
  'deliveryReport.customerSignature': { es: 'Firma del Cliente', en: 'Customer Signature', pt: 'Assinatura do Cliente' },
  'deliveryReport.deliveryPhoto': { es: 'Foto de Entrega', en: 'Delivery Photo', pt: 'Foto da Entrega' },
  'deliveryReport.deliveryNotes': { es: 'Notas de Entrega', en: 'Delivery Notes', pt: 'Notas da Entrega' },
  'deliveryReport.reportIssue': { es: 'Reportar Problema', en: 'Report Issue', pt: 'Relatar Problema' },
  'deliveryReport.issueType': { es: 'Tipo de Problema', en: 'Issue Type', pt: 'Tipo de Problema' },
  'deliveryReport.issueDescription': { es: 'Descripción del Problema', en: 'Issue Description', pt: 'Descrição do Problema' },
  'deliveryReport.customerNotAvailable': { es: 'Cliente No Disponible', en: 'Customer Not Available', pt: 'Cliente Não Disponível' },
  'deliveryReport.wrongAddress': { es: 'Dirección Incorrecta', en: 'Wrong Address', pt: 'Endereço Incorreto' },
  'deliveryReport.packageDamaged': { es: 'Paquete Dañado', en: 'Package Damaged', pt: 'Pacote Danificado' },
  'deliveryReport.other': { es: 'Otro', en: 'Other', pt: 'Outro' },
  'deliveryReport.submitReport': { es: 'Enviar Reporte', en: 'Submit Report', pt: 'Enviar Relatório' },
  'deliveryReport.reportSubmitted': { es: 'Reporte Enviado', en: 'Report Submitted', pt: 'Relatório Enviado' },
  'deliveryReport.deliveryCompleted': { es: 'Entrega Completada', en: 'Delivery Completed', pt: 'Entrega Concluída' },
  'deliveryReport.deliveryFailed': { es: 'Entrega Fallida', en: 'Delivery Failed', pt: 'Entrega Falhou' },
  'deliveryReport.deliveryAttempted': { es: 'Entrega Intentada', en: 'Delivery Attempted', pt: 'Entrega Tentada' },
  'deliveryReport.uploadPhoto': { es: 'Subir Foto', en: 'Upload Photo', pt: 'Carregar Foto' },
  'deliveryReport.takePhoto': { es: 'Tomar Foto', en: 'Take Photo', pt: 'Tirar Foto' },
  'deliveryReport.signatureRequired': { es: 'Firma Requerida', en: 'Signature Required', pt: 'Assinatura Obrigatória' },
  'deliveryReport.customerRefused': { es: 'Cliente Rechazó', en: 'Customer Refused', pt: 'Cliente Recusou' },
  'deliveryReport.paymentIssue': { es: 'Problema de Pago', en: 'Payment Issue', pt: 'Problema de Pagamento' },
  'deliveryReport.weatherIssue': { es: 'Problema Climático', en: 'Weather Issue', pt: 'Problema Climático' },
  'deliveryReport.trafficIssue': { es: 'Problema de Tráfico', en: 'Traffic Issue', pt: 'Problema de Trânsito' },
  'deliveryReport.vehicleIssue': { es: 'Problema del Vehículo', en: 'Vehicle Issue', pt: 'Problema do Veículo' },
  'deliveryReport.confirmDelivery': { es: 'Confirmar Entrega', en: 'Confirm Delivery', pt: 'Confirmar Entrega' },
  'deliveryReport.confirmPickup': { es: 'Confirmar Recogida', en: 'Confirm Pickup', pt: 'Confirmar Coleta' },
  'deliveryReport.startDelivery': { es: 'Iniciar Entrega', en: 'Start Delivery', pt: 'Iniciar Entrega' },
  'deliveryReport.completeDelivery': { es: 'Completar Entrega', en: 'Complete Delivery', pt: 'Completar Entrega' },
  'deliveryReport.returnToStore': { es: 'Devolver a Tienda', en: 'Return to Store', pt: 'Devolver à Loja' },
  'deliveryReport.deliveryTime': { es: 'Tiempo de Entrega', en: 'Delivery Time', pt: 'Tempo de Entrega' },
  'deliveryReport.estimatedTime': { es: 'Tiempo Estimado', en: 'Estimated Time', pt: 'Tempo Estimado' },
  'deliveryReport.actualTime': { es: 'Tiempo Real', en: 'Actual Time', pt: 'Tempo Real' },
  'deliveryReport.distance': { es: 'Distancia', en: 'Distance', pt: 'Distância' },
  'deliveryReport.fuelConsumption': { es: 'Consumo de Combustible', en: 'Fuel Consumption', pt: 'Consumo de Combustível' },
  'deliveryReport.earnings': { es: 'Ganancias', en: 'Earnings', pt: 'Ganhos' },
  'deliveryReport.todayEarnings': { es: 'Ganancias de Hoy', en: 'Today\'s Earnings', pt: 'Ganhos de Hoje' },
  'deliveryReport.weeklyEarnings': { es: 'Ganancias Semanales', en: 'Weekly Earnings', pt: 'Ganhos Semanais' },
  'deliveryReport.monthlyEarnings': { es: 'Ganancias Mensuales', en: 'Monthly Earnings', pt: 'Ganhos Mensais' },
  'deliveryReport.deliveryStats': { es: 'Estadísticas de Entrega', en: 'Delivery Statistics', pt: 'Estatísticas de Entrega' },
  'deliveryReport.completedToday': { es: 'Completadas Hoy', en: 'Completed Today', pt: 'Concluídas Hoje' },
  'deliveryReport.failedToday': { es: 'Fallidas Hoy', en: 'Failed Today', pt: 'Falharam Hoje' },
  'deliveryReport.avgDeliveryTime': { es: 'Tiempo Promedio', en: 'Average Time', pt: 'Tempo Médio' },
  'deliveryReport.totalDistance': { es: 'Distancia Total', en: 'Total Distance', pt: 'Distância Total' },
  'deliveryReport.customerRating': { es: 'Calificación del Cliente', en: 'Customer Rating', pt: 'Avaliação do Cliente' },
  'deliveryReport.ratingSubmitted': { es: 'Calificación Enviada', en: 'Rating Submitted', pt: 'Avaliação Enviada' },
  'deliveryReport.thankCustomer': { es: 'Gracias al Cliente', en: 'Thank Customer', pt: 'Agradecer Cliente' },
  'deliveryReport.rateExperience': { es: 'Calificar Experiencia', en: 'Rate Experience', pt: 'Avaliar Experiência' },
  'deliveryReport.excellent': { es: 'Excelente', en: 'Excellent', pt: 'Excelente' },
  'deliveryReport.good': { es: 'Bueno', en: 'Good', pt: 'Bom' },
  'deliveryReport.fair': { es: 'Regular', en: 'Fair', pt: 'Regular' },
  'deliveryReport.poor': { es: 'Malo', en: 'Poor', pt: 'Ruim' },
  'deliveryReport.veryPoor': { es: 'Muy Malo', en: 'Very Poor', pt: 'Muito Ruim' },

  // ===== CAPTURA DE FIRMA Y FOTO =====
  'capture.signature.title': { es: 'Capturar Firma del Cliente', en: 'Capture Customer Signature', pt: 'Capturar Assinatura do Cliente' },
  'capture.signature.instructions': { es: 'Dibuja tu firma en el área de arriba', en: 'Draw your signature in the area above', pt: 'Desenhe sua assinatura na área acima' },
  'capture.signature.captured': { es: 'Firma capturada ✓', en: 'Signature captured ✓', pt: 'Assinatura capturada ✓' },
  'capture.signature.clear': { es: 'Limpiar', en: 'Clear', pt: 'Limpar' },
  'capture.signature.capture': { es: 'Capturar', en: 'Capture', pt: 'Capturar' },
  'capture.photo.title': { es: 'Tomar Foto de Entrega', en: 'Take Delivery Photo', pt: 'Tirar Foto da Entrega' },
  'capture.photo.instructions': { es: 'Posiciona la cámara y toma la foto', en: 'Position the camera and take the photo', pt: 'Posicione a câmera e tire a foto' },
  'capture.photo.upload': { es: 'Sube una imagen desde tu dispositivo', en: 'Upload an image from your device', pt: 'Faça upload de uma imagem do seu dispositivo' },
  'capture.photo.captured': { es: 'Foto capturada ✓', en: 'Photo captured ✓', pt: 'Foto capturada ✓' },
  'capture.photo.take': { es: 'Tomar Foto', en: 'Take Photo', pt: 'Tirar Foto' },
  'capture.photo.activate': { es: 'Activar Cámara', en: 'Activate Camera', pt: 'Ativar Câmera' },
  'capture.photo.retake': { es: 'Volver a Tomar', en: 'Retake', pt: 'Tirar Novamente' },
  'capture.photo.confirm': { es: 'Confirmar', en: 'Confirm', pt: 'Confirmar' },
  'capture.photo.error': { es: 'No se pudo acceder a la cámara. Puedes subir una imagen desde tu dispositivo.', en: 'Could not access camera. You can upload an image from your device.', pt: 'Não foi possível acessar a câmera. Você pode fazer upload de uma imagem do seu dispositivo.' },
  'capture.photo.invalidFile': { es: 'Por favor selecciona un archivo de imagen válido.', en: 'Please select a valid image file.', pt: 'Por favor selecione um arquivo de imagem válido.' },

  // ===== SISTEMA DE CALIFICACIONES =====
  'rating.excellent': { es: 'Excelente', en: 'Excellent', pt: 'Excelente' },
  'rating.good': { es: 'Bueno', en: 'Good', pt: 'Bom' },
  'rating.fair': { es: 'Regular', en: 'Fair', pt: 'Regular' },
  'rating.poor': { es: 'Malo', en: 'Poor', pt: 'Ruim' },
  'rating.veryPoor': { es: 'Muy Malo', en: 'Very Poor', pt: 'Muito Ruim' },
  'rating.stats.title': { es: 'Estadísticas de Calificaciones', en: 'Rating Statistics', pt: 'Estatísticas de Avaliações' },
  'rating.stats.totalRatings': { es: 'calificaciones', en: 'ratings', pt: 'avaliações' },
  'rating.stats.excellent': { es: 'Excelentes', en: 'Excellent', pt: 'Excelentes' },
  'rating.stats.needsImprovement': { es: 'Necesitan Mejora', en: 'Need Improvement', pt: 'Precisam Melhorar' },
  'rating.title': { es: 'Calificaciones', en: 'Ratings', pt: 'Avaliações' },
  'rating.subtitle': { es: 'Gestiona y revisa las calificaciones de tus entregas', en: 'Manage and review your delivery ratings', pt: 'Gerencie e revise as avaliações de suas entregas' },
  'rating.myRatings': { es: 'Mis Calificaciones', en: 'My Ratings', pt: 'Minhas Avaliações' },
  'rating.customerRatings': { es: 'Calificaciones de Clientes', en: 'Customer Ratings', pt: 'Avaliações de Clientes' },
  'rating.givenRatings': { es: 'Calificaciones Dadas', en: 'Given Ratings', pt: 'Avaliações Dadas' },
  'rating.receivedRatings': { es: 'Calificaciones Recibidas', en: 'Received Ratings', pt: 'Avaliações Recebidas' },
  'rating.averageRating': { es: 'Calificación Promedio', en: 'Average Rating', pt: 'Avaliação Média' },
  'rating.totalDeliveries': { es: 'Total de Entregas', en: 'Total Deliveries', pt: 'Total de Entregas' },
  'rating.thisMonth': { es: 'Este Mes', en: 'This Month', pt: 'Este Mês' },
  'rating.lastMonth': { es: 'Mes Pasado', en: 'Last Month', pt: 'Mês Passado' },
  'rating.ratingHistory': { es: 'Historial de Calificaciones', en: 'Rating History', pt: 'Histórico de Avaliações' },
  'rating.recentRatings': { es: 'Calificaciones Recientes', en: 'Recent Ratings', pt: 'Avaliações Recentes' },
  'rating.rateCustomer': { es: 'Calificar Cliente', en: 'Rate Customer', pt: 'Avaliar Cliente' },
  'rating.rateDelivery': { es: 'Calificar Entrega', en: 'Rate Delivery', pt: 'Avaliar Entrega' },
  'rating.submitRating': { es: 'Enviar Calificación', en: 'Submit Rating', pt: 'Enviar Avaliação' },
  'rating.ratingSubmitted': { es: 'Calificación Enviada', en: 'Rating Submitted', pt: 'Avaliação Enviada' },
  'rating.comment': { es: 'Comentario', en: 'Comment', pt: 'Comentário' },
  'rating.commentPlaceholder': { es: 'Agrega un comentario sobre tu experiencia...', en: 'Add a comment about your experience...', pt: 'Adicione um comentário sobre sua experiência...' },
  'rating.noRatings': { es: 'No hay calificaciones disponibles', en: 'No ratings available', pt: 'Nenhuma avaliação disponível' },
  'rating.filterByRating': { es: 'Filtrar por Calificación', en: 'Filter by Rating', pt: 'Filtrar por Avaliação' },
  'rating.allRatings': { es: 'Todas las Calificaciones', en: 'All Ratings', pt: 'Todas as Avaliações' },
  'rating.5stars': { es: '5 Estrellas', en: '5 Stars', pt: '5 Estrelas' },
  'rating.4stars': { es: '4 Estrellas', en: '4 Stars', pt: '4 Estrelas' },
  'rating.3stars': { es: '3 Estrellas', en: '3 Stars', pt: '3 Estrelas' },
  'rating.2stars': { es: '2 Estrellas', en: '2 Stars', pt: '2 Estrelas' },
  'rating.1star': { es: '1 Estrella', en: '1 Star', pt: '1 Estrela' },
  'rating.orderNumber': { es: 'Número de Pedido', en: 'Order Number', pt: 'Número do Pedido' },
  'rating.customerName': { es: 'Nombre del Cliente', en: 'Customer Name', pt: 'Nome do Cliente' },
  'rating.deliveryDate': { es: 'Fecha de Entrega', en: 'Delivery Date', pt: 'Data da Entrega' },
  'rating.ratingValue': { es: 'Calificación', en: 'Rating', pt: 'Avaliação' },
  'rating.actions': { es: 'Acciones', en: 'Actions', pt: 'Ações' },
  'rating.exportRatings': { es: 'Exportar Calificaciones', en: 'Export Ratings', pt: 'Exportar Avaliações' },
  'rating.ratingTrends': { es: 'Tendencias de Calificación', en: 'Rating Trends', pt: 'Tendências de Avaliação' },
  'rating.weeklyAverage': { es: 'Promedio Semanal', en: 'Weekly Average', pt: 'Média Semanal' },
  'rating.monthlyAverage': { es: 'Promedio Mensual', en: 'Monthly Average', pt: 'Média Mensal' },
  'rating.ratingImprovement': { es: 'Mejora de Calificación', en: 'Rating Improvement', pt: 'Melhoria da Avaliação' },
  'rating.ratingDecline': { es: 'Disminución de Calificación', en: 'Rating Decline', pt: 'Queda da Avaliação' },
  'rating.ratingStable': { es: 'Calificación Estable', en: 'Rating Stable', pt: 'Avaliação Estável' },
  'rating.clearFilters': { es: 'Limpiar Filtros', en: 'Clear Filters', pt: 'Limpar Filtros' },
  'rating.activeFilters': { es: 'Filtros activos', en: 'Active filters', pt: 'Filtros ativos' },
  'rating.clearAll': { es: 'Limpiar todos', en: 'Clear all', pt: 'Limpar todos' },
  'rating.ratingsFound': { es: 'calificaciones encontradas', en: 'ratings found', pt: 'avaliações encontradas' },
  'rating.noOrdersToRate': { es: 'No hay pedidos disponibles para calificar', en: 'No orders available to rate', pt: 'Nenhum pedido disponível para avaliar' },
  'rating.statsCopied': { es: 'Estadísticas copiadas al portapapeles', en: 'Statistics copied to clipboard', pt: 'Estatísticas copiadas para a área de transferência' },
  'rating.exportSuccess': { es: 'Calificaciones exportadas exitosamente', en: 'Ratings exported successfully', pt: 'Avaliações exportadas com sucesso' },
  'rating.shareTitle': { es: 'Mis Calificaciones de Delivery', en: 'My Delivery Ratings', pt: 'Minhas Avaliações de Entrega' },
  'rating.editRating': { es: 'Editar calificación', en: 'Edit rating', pt: 'Editar avaliação' },

  // ===== HORARIO DE TRABAJO =====
  'schedule.title': { es: 'Horario de Trabajo', en: 'Work Schedule', pt: 'Horário de Trabalho' },
  'schedule.subtitle': { es: 'Gestiona tu horario de trabajo y disponibilidad', en: 'Manage your work schedule and availability', pt: 'Gerencie seu horário de trabalho e disponibilidade' },
  'schedule.weeklySchedule': { es: 'Horario Semanal', en: 'Weekly Schedule', pt: 'Cronograma Semanal' },
  'schedule.availability': { es: 'Disponibilidad', en: 'Availability', pt: 'Disponibilidade' },
  'schedule.timeOff': { es: 'Tiempo Libre', en: 'Time Off', pt: 'Tempo Livre' },
  'schedule.currentWeek': { es: 'Semana Actual', en: 'Current Week', pt: 'Semana Atual' },
  'schedule.nextWeek': { es: 'Próxima Semana', en: 'Next Week', pt: 'Próxima Semana' },
  'schedule.previousWeek': { es: 'Semana Anterior', en: 'Previous Week', pt: 'Semana Anterior' },
  'schedule.today': { es: 'Hoy', en: 'Today', pt: 'Hoje' },
  'schedule.workingHours': { es: 'Horas de Trabajo', en: 'Working Hours', pt: 'Horas de Trabalho' },
  'schedule.breakTime': { es: 'Tiempo de Descanso', en: 'Break Time', pt: 'Tempo de Descanso' },
  'schedule.totalHours': { es: 'Total de Horas', en: 'Total Hours', pt: 'Total de Horas' },
  'schedule.averageHours': { es: 'Promedio de Horas', en: 'Average Hours', pt: 'Média de Horas' },
  'schedule.workingDays': { es: 'Días de Trabajo', en: 'Working Days', pt: 'Dias de Trabalho' },
  'schedule.status.available': { es: 'Disponible', en: 'Available', pt: 'Disponível' },
  'schedule.status.busy': { es: 'Ocupado', en: 'Busy', pt: 'Ocupado' },
  'schedule.status.offline': { es: 'Desconectado', en: 'Offline', pt: 'Desconectado' },
  'schedule.status.break': { es: 'En Descanso', en: 'On Break', pt: 'Em Descanso' },
  'schedule.status.pending': { es: 'Pendiente', en: 'Pending', pt: 'Pendente' },
  'schedule.status.approved': { es: 'Aprobado', en: 'Approved', pt: 'Aprovado' },
  'schedule.status.rejected': { es: 'Rechazado', en: 'Rejected', pt: 'Rejeitado' },
  'schedule.updateStatus': { es: 'Actualizar Estado', en: 'Update Status', pt: 'Atualizar Status' },
  'schedule.requestTimeOff': { es: 'Solicitar Tiempo Libre', en: 'Request Time Off', pt: 'Solicitar Tempo Livre' },
  'schedule.viewRequests': { es: 'Ver Solicitudes', en: 'View Requests', pt: 'Ver Solicitações' },
  'schedule.startTime': { es: 'Hora de Inicio', en: 'Start Time', pt: 'Hora de Início' },
  'schedule.endTime': { es: 'Hora de Fin', en: 'End Time', pt: 'Hora de Fim' },
  'schedule.breakStart': { es: 'Inicio de Descanso', en: 'Break Start', pt: 'Início do Descanso' },
  'schedule.breakEnd': { es: 'Fin de Descanso', en: 'Break End', pt: 'Fim do Descanso' },
  'schedule.reason': { es: 'Motivo', en: 'Reason', pt: 'Motivo' },
  'schedule.notes': { es: 'Notas', en: 'Notes', pt: 'Notas' },
  'schedule.submit': { es: 'Enviar', en: 'Submit', pt: 'Enviar' },
  'schedule.cancel': { es: 'Cancelar', en: 'Cancel', pt: 'Cancelar' },
  'schedule.save': { es: 'Guardar', en: 'Save', pt: 'Salvar' },
  'schedule.edit': { es: 'Editar', en: 'Edit', pt: 'Editar' },
  'schedule.delete': { es: 'Eliminar', en: 'Delete', pt: 'Excluir' },
  'schedule.active': { es: 'Activo', en: 'Active', pt: 'Ativo' },
  'schedule.inactive': { es: 'Inactivo', en: 'Inactive', pt: 'Inativo' },
  'schedule.noShifts': { es: 'No hay turnos programados', en: 'No shifts scheduled', pt: 'Nenhum turno programado' },
  'schedule.noRequests': { es: 'No hay solicitudes de tiempo libre', en: 'No time off requests', pt: 'Nenhuma solicitação de tempo livre' },
  'schedule.requestSubmitted': { es: 'Solicitud enviada exitosamente', en: 'Request submitted successfully', pt: 'Solicitação enviada com sucesso' },
  'schedule.statusUpdated': { es: 'Estado actualizado exitosamente', en: 'Status updated successfully', pt: 'Status atualizado com sucesso' },
  'schedule.confirmDelete': { es: '¿Estás seguro de que quieres eliminar este turno?', en: 'Are you sure you want to delete this shift?', pt: 'Tem certeza de que deseja excluir este turno?' },
  'schedule.days.monday': { es: 'Lunes', en: 'Monday', pt: 'Segunda-feira' },
  'schedule.days.tuesday': { es: 'Martes', en: 'Tuesday', pt: 'Terça-feira' },
  'schedule.days.wednesday': { es: 'Miércoles', en: 'Wednesday', pt: 'Quarta-feira' },
  'schedule.days.thursday': { es: 'Jueves', en: 'Thursday', pt: 'Quinta-feira' },
  'schedule.days.friday': { es: 'Viernes', en: 'Friday', pt: 'Sexta-feira' },
  'schedule.days.saturday': { es: 'Sábado', en: 'Saturday', pt: 'Sábado' },
  'schedule.days.sunday': { es: 'Domingo', en: 'Sunday', pt: 'Domingo' },
  'schedule.timeOffTypes.vacation': { es: 'Vacaciones', en: 'Vacation', pt: 'Férias' },
  'schedule.timeOffTypes.sick': { es: 'Enfermedad', en: 'Sick Leave', pt: 'Licença Médica' },
  'schedule.timeOffTypes.personal': { es: 'Personal', en: 'Personal', pt: 'Pessoal' },
  'schedule.timeOffTypes.other': { es: 'Otro', en: 'Other', pt: 'Outro' },

  // ===== ESTADO DE DISPONIBILIDAD =====
  'availability.title': { es: 'Estado de Disponibilidad', en: 'Availability Status', pt: 'Status de Disponibilidade' },
  'availability.subtitle': { es: 'Gestiona y visualiza tu estado de disponibilidad en tiempo real', en: 'Manage and view your availability status in real time', pt: 'Gerencie e visualize seu status de disponibilidade em tempo real' },
  'availability.quickStats': { es: 'Estadísticas Rápidas', en: 'Quick Statistics', pt: 'Estatísticas Rápidas' },
  'availability.totalTime': { es: 'Tiempo Total', en: 'Total Time', pt: 'Tempo Total' },
  'availability.availableTime': { es: 'Disponible', en: 'Available', pt: 'Disponível' },
  'availability.busyTime': { es: 'Ocupado', en: 'Busy', pt: 'Ocupado' },
  'availability.breakTime': { es: 'En Descanso', en: 'On Break', pt: 'Em Descanso' },
  'availability.availabilityRate': { es: 'Tasa de Disponibilidad', en: 'Availability Rate', pt: 'Taxa de Disponibilidade' },
  'availability.quickActions': { es: 'Acciones Rápidas', en: 'Quick Actions', pt: 'Ações Rápidas' },
  'availability.configureLocation': { es: 'Configurar Ubicación', en: 'Configure Location', pt: 'Configurar Localização' },
  'availability.scheduleAvailability': { es: 'Programar Disponibilidad', en: 'Schedule Availability', pt: 'Programar Disponibilidade' },
  'availability.settings': { es: 'Configuraciones', en: 'Settings', pt: 'Configurações' },
  'availability.period': { es: 'Período', en: 'Period', pt: 'Período' },
  'availability.today': { es: 'Hoy', en: 'Today', pt: 'Hoje' },
  'availability.thisWeek': { es: 'Esta Semana', en: 'This Week', pt: 'Esta Semana' },
  'availability.thisMonth': { es: 'Este Mes', en: 'This Month', pt: 'Este Mês' },
  'availability.status': { es: 'Estado', en: 'Status', pt: 'Status' },
  'availability.all': { es: 'Todos', en: 'All', pt: 'Todos' },
  'availability.searchPlaceholder': { es: 'Buscar en notas o ubicación...', en: 'Search in notes or location...', pt: 'Pesquisar em notas ou localização...' },
  'availability.recordsFound': { es: 'registros encontrados', en: 'records found', pt: 'registros encontrados' },
  'availability.history': { es: 'Historial de Disponibilidad', en: 'Availability History', pt: 'Histórico de Disponibilidade' },
  'availability.noRecords': { es: 'No hay registros de disponibilidad', en: 'No availability records', pt: 'Nenhum registro de disponibilidade' },
  'availability.noRecordsFiltered': { es: 'No se encontraron registros con los filtros aplicados', en: 'No records found with applied filters', pt: 'Nenhum registro encontrado com os filtros aplicados' },
  'availability.noHistory': { es: 'Aún no hay historial de disponibilidad registrado', en: 'No availability history recorded yet', pt: 'Ainda não há histórico de disponibilidade registrado' },
  'availability.noDuration': { es: 'Sin duración', en: 'No duration', pt: 'Sem duração' },
  'availability.notes': { es: 'Notas', en: 'Notes', pt: 'Notas' },
  'availability.location': { es: 'Ubicación', en: 'Location', pt: 'Localização' },
  'availability.configureLocationTitle': { es: 'Configurar Ubicación', en: 'Configure Location', pt: 'Configurar Localização' },
  'availability.configureLocationDesc': { es: 'Configura tu ubicación actual para mejorar la precisión de tu estado de disponibilidad.', en: 'Configure your current location to improve the accuracy of your availability status.', pt: 'Configure sua localização atual para melhorar a precisão do seu status de disponibilidade.' },
  'availability.scheduleTitle': { es: 'Programar Disponibilidad', en: 'Schedule Availability', pt: 'Programar Disponibilidade' },
  'availability.scheduleDesc': { es: 'Programa tu disponibilidad para días específicos y horarios.', en: 'Schedule your availability for specific days and times.', pt: 'Programe sua disponibilidade para dias e horários específicos.' },
  'availability.configure': { es: 'Configurar', en: 'Configure', pt: 'Configurar' },
  'availability.schedule': { es: 'Programar', en: 'Schedule', pt: 'Programar' },

  // ===== COMPARTIR PRODUCTOS =====
  'product.share': { es: 'Compartir', en: 'Share', pt: 'Compartilhar' },
  'product.shareOptions': { es: 'Opciones de compartir', en: 'Share options', pt: 'Opções de compartilhamento' },
  'product.copyLink': { es: 'Copiar enlace', en: 'Copy link', pt: 'Copiar link' },
  'product.linkCopied': { es: 'Enlace copiado', en: 'Link copied', pt: 'Link copiado' },
  'product.shareOnFacebook': { es: 'Compartir en Facebook', en: 'Share on Facebook', pt: 'Compartilhar no Facebook' },
  'product.shareOnTwitter': { es: 'Compartir en Twitter', en: 'Share on Twitter', pt: 'Compartilhar no Twitter' },
  'product.shareOnWhatsApp': { es: 'Compartir en WhatsApp', en: 'Share on WhatsApp', pt: 'Compartilhar no WhatsApp' },
  'product.shareByEmail': { es: 'Compartir por email', en: 'Share by email', pt: 'Compartilhar por email' },

  // ===== COTIZACIONES =====
  'quotes.title': { es: 'Gestión de Cotizaciones', en: 'Quotes Management', pt: 'Gestão de Cotações' },
  'quotes.subtitle': { es: 'Crea, envía y gestiona cotizaciones para tus clientes', en: 'Create, send and manage quotes for your customers', pt: 'Crie, envie e gerencie cotações para seus clientes' },
  
  // Acciones
  'quotes.actions.newQuote': { es: 'Nueva Cotización', en: 'New Quote', pt: 'Nova Cotação' },
  'quotes.actions.newQuoteComingSoon': { es: 'Funcionalidad de nueva cotización próximamente', en: 'New quote functionality coming soon', pt: 'Funcionalidade de nova cotação em breve' },
  'quotes.actions.sendQuote': { es: 'Enviar Cotización', en: 'Send Quote', pt: 'Enviar Cotação' },
  'quotes.actions.duplicate': { es: 'Duplicar', en: 'Duplicate', pt: 'Duplicar' },
  'quotes.actions.delete': { es: 'Eliminar', en: 'Delete', pt: 'Excluir' },
  'quotes.actions.view': { es: 'Ver detalles', en: 'View details', pt: 'Ver detalhes' },
  'quotes.actions.send': { es: 'Enviar cotización', en: 'Send quote', pt: 'Enviar cotação' },
  'quotes.actions.copyInfo': { es: 'Copiar Info', en: 'Copy Info', pt: 'Copiar Info' },
  'quotes.actions.copied': { es: 'Información copiada al portapapeles', en: 'Information copied to clipboard', pt: 'Informação copiada para a área de transferência' },

  // Estadísticas
  'quotes.stats.total': { es: 'Total Cotizaciones', en: 'Total Quotes', pt: 'Total de Cotações' },
  'quotes.stats.pending': { es: 'Pendientes', en: 'Pending', pt: 'Pendentes' },
  'quotes.stats.accepted': { es: 'Aceptadas', en: 'Accepted', pt: 'Aceitas' },
  'quotes.stats.totalValue': { es: 'Valor Total', en: 'Total Value', pt: 'Valor Total' },

  // Estados
  'quotes.status.draft': { es: 'Borrador', en: 'Draft', pt: 'Rascunho' },
  'quotes.status.sent': { es: 'Enviado', en: 'Sent', pt: 'Enviado' },
  'quotes.status.viewed': { es: 'Visto', en: 'Viewed', pt: 'Visualizado' },
  'quotes.status.accepted': { es: 'Aceptado', en: 'Accepted', pt: 'Aceito' },
  'quotes.status.rejected': { es: 'Rechazado', en: 'Rejected', pt: 'Rejeitado' },
  'quotes.status.expired': { es: 'Expirado', en: 'Expired', pt: 'Expirado' },

  // Filtros
  'quotes.filters.title': { es: 'Filtros', en: 'Filters', pt: 'Filtros' },
  'quotes.filters.allStatuses': { es: 'Todos los estados', en: 'All statuses', pt: 'Todos os status' },
  'quotes.filters.allDates': { es: 'Todas las fechas', en: 'All dates', pt: 'Todas as datas' },
  'quotes.filters.today': { es: 'Hoy', en: 'Today', pt: 'Hoje' },
  'quotes.filters.thisWeek': { es: 'Esta semana', en: 'This week', pt: 'Esta semana' },
  'quotes.filters.thisMonth': { es: 'Este mes', en: 'This month', pt: 'Este mês' },
  'quotes.filters.thisQuarter': { es: 'Este trimestre', en: 'This quarter', pt: 'Este trimestre' },
  'quotes.filters.status': { es: 'Estado', en: 'Status', pt: 'Status' },
  'quotes.filters.dateRange': { es: 'Rango de Fecha', en: 'Date Range', pt: 'Intervalo de Data' },
  'quotes.filters.sortBy': { es: 'Ordenar por', en: 'Sort by', pt: 'Ordenar por' },
  'quotes.filters.search': { es: 'Buscar', en: 'Search', pt: 'Buscar' },
  'quotes.filters.searchPlaceholder': { es: 'Cliente, teléfono, email...', en: 'Customer, phone, email...', pt: 'Cliente, telefone, email...' },

  // Ordenamiento
  'quotes.sort.createdAt': { es: 'Fecha de creación', en: 'Creation date', pt: 'Data de criação' },
  'quotes.sort.expiresAt': { es: 'Fecha de expiración', en: 'Expiration date', pt: 'Data de expiração' },
  'quotes.sort.finalTotal': { es: 'Valor total', en: 'Total value', pt: 'Valor total' },
  'quotes.sort.customerName': { es: 'Cliente', en: 'Customer', pt: 'Cliente' },
  'quotes.sort.status': { es: 'Estado', en: 'Status', pt: 'Status' },

  // Tabla
  'quotes.table.quote': { es: 'Cotización', en: 'Quote', pt: 'Cotação' },
  'quotes.table.customer': { es: 'Cliente', en: 'Customer', pt: 'Cliente' },
  'quotes.table.products': { es: 'Productos', en: 'Products', pt: 'Produtos' },
  'quotes.table.total': { es: 'Total', en: 'Total', pt: 'Total' },
  'quotes.table.status': { es: 'Estado', en: 'Status', pt: 'Status' },
  'quotes.table.expires': { es: 'Expira', en: 'Expires', pt: 'Expira' },
  'quotes.table.actions': { es: 'Acciones', en: 'Actions', pt: 'Ações' },
  'quotes.table.productCount': { es: 'producto', en: 'product', pt: 'produto' },
  'quotes.table.productCounts': { es: 'productos', en: 'products', pt: 'produtos' },

  // Detalles
  'quotes.details.title': { es: 'Cotización', en: 'Quote', pt: 'Cotação' },
  'quotes.details.customerInfo': { es: 'Información del Cliente', en: 'Customer Information', pt: 'Informações do Cliente' },
  'quotes.details.quoteDetails': { es: 'Detalles de la Cotización', en: 'Quote Details', pt: 'Detalhes da Cotação' },
  'quotes.details.status': { es: 'Estado', en: 'Status', pt: 'Status' },
  'quotes.details.created': { es: 'Creada', en: 'Created', pt: 'Criada' },
  'quotes.details.expires': { es: 'Expira', en: 'Expires', pt: 'Expira' },
  'quotes.details.validFor': { es: 'Válida por', en: 'Valid for', pt: 'Válida por' },
  'quotes.details.products': { es: 'Productos', en: 'Products', pt: 'Produtos' },
  'quotes.details.quantity': { es: 'Cantidad', en: 'Quantity', pt: 'Quantidade' },
  'quotes.details.unitPrice': { es: 'Precio unitario', en: 'Unit price', pt: 'Preço unitário' },
  'quotes.details.total': { es: 'Total', en: 'Total', pt: 'Total' },
  'quotes.details.priceSummary': { es: 'Resumen de Precios', en: 'Price Summary', pt: 'Resumo de Preços' },
  'quotes.details.subtotal': { es: 'Subtotal', en: 'Subtotal', pt: 'Subtotal' },
  'quotes.details.discount': { es: 'Descuento', en: 'Discount', pt: 'Desconto' },
  'quotes.details.notes': { es: 'Notas', en: 'Notes', pt: 'Notas' },
  'quotes.details.terms': { es: 'Términos y Condiciones', en: 'Terms and Conditions', pt: 'Termos e Condições' },

  // Otros
  'quotes.urgent': { es: 'Urgente', en: 'Urgent', pt: 'Urgente' },
  'quotes.expired': { es: 'Expirado', en: 'Expired', pt: 'Expirado' },
  'quotes.days': { es: 'días', en: 'days', pt: 'dias' },

  // Modal de Nueva Cotización
  'quotes.newQuote.title': { es: 'Nueva Cotización', en: 'New Quote', pt: 'Nova Cotação' },
  'quotes.newQuote.subtitle': { es: 'Crea una cotización personalizada para tu cliente', en: 'Create a personalized quote for your customer', pt: 'Crie uma cotação personalizada para seu cliente' },
  'quotes.newQuote.tutorial': { es: 'Tutorial', en: 'Tutorial', pt: 'Tutorial' },
  'quotes.newQuote.searchProducts': { es: 'Buscar Productos', en: 'Search Products', pt: 'Buscar Produtos' },
  'quotes.newQuote.searchPlaceholder': { es: 'Buscar por nombre, SKU, código original...', en: 'Search by name, SKU, original code...', pt: 'Buscar por nome, SKU, código original...' },
  'quotes.newQuote.customerInfo': { es: 'Información del Cliente', en: 'Customer Information', pt: 'Informações do Cliente' },
  'quotes.newQuote.selectCustomer': { es: 'Seleccionar Cliente', en: 'Select Customer', pt: 'Selecionar Cliente' },
  'quotes.newQuote.quoteItems': { es: 'Productos en la Cotización', en: 'Quote Items', pt: 'Itens da Cotação' },
  'quotes.newQuote.noItems': { es: 'No hay productos en la cotización', en: 'No items in the quote', pt: 'Nenhum item na cotação' },
  'quotes.newQuote.summary': { es: 'Resumen', en: 'Summary', pt: 'Resumo' },
  'quotes.newQuote.configuration': { es: 'Configuración', en: 'Configuration', pt: 'Configuração' },
  'quotes.newQuote.validityDays': { es: 'Días de validez', en: 'Validity days', pt: 'Dias de validade' },
  'quotes.newQuote.discount': { es: 'Descuento', en: 'Discount', pt: 'Desconto' },
  'quotes.newQuote.notes': { es: 'Notas', en: 'Notes', pt: 'Notas' },
  'quotes.newQuote.notesPlaceholder': { es: 'Notas adicionales para la cotización...', en: 'Additional notes for the quote...', pt: 'Notas adicionais para a cotação...' },
  'quotes.newQuote.save': { es: 'Guardar Cotización', en: 'Save Quote', pt: 'Salvar Cotação' },
  'quotes.newQuote.validation.required': { es: 'Debe seleccionar un cliente y agregar al menos un producto', en: 'You must select a customer and add at least one product', pt: 'Você deve selecionar um cliente e adicionar pelo menos um produto' },
  'quotes.newQuote.errors.save': { es: 'Error al guardar la cotización', en: 'Error saving the quote', pt: 'Erro ao salvar a cotação' },
  
  // Selección de clientes
  'quotes.newQuote.changeCustomer': { es: 'Cambiar Cliente', en: 'Change Customer', pt: 'Alterar Cliente' },
  'quotes.newQuote.removeCustomer': { es: 'Remover Cliente', en: 'Remove Customer', pt: 'Remover Cliente' },
  'quotes.newQuote.searchCustomerPlaceholder': { es: 'Buscar cliente por nombre, email o teléfono...', en: 'Search customer by name, email or phone...', pt: 'Buscar cliente por nome, email ou telefone...' },
  'quotes.newQuote.noCustomersFound': { es: 'No se encontraron clientes', en: 'No customers found', pt: 'Nenhum cliente encontrado' },
  'quotes.newQuote.createNewCustomer': { es: 'Crear Nuevo Cliente', en: 'Create New Customer', pt: 'Criar Novo Cliente' },
  
  // Vista previa
  'quotes.newQuote.preview': { es: 'Vista Previa de la Cotización', en: 'Quote Preview', pt: 'Visualização da Cotação' },
  'quotes.newQuote.quoteTitle': { es: 'COTIZACIÓN', en: 'QUOTE', pt: 'COTAÇÃO' },
  'quotes.newQuote.quoteSubtitle': { es: 'PiezasYA - Repuestos Automotrices', en: 'PiezasYA - Automotive Parts', pt: 'PiezasYA - Peças Automotivas' },
  'quotes.newQuote.products': { es: 'Productos', en: 'Products', pt: 'Produtos' },
  'quotes.newQuote.product': { es: 'Producto', en: 'Product', pt: 'Produto' },
  'quotes.newQuote.quantity': { es: 'Cantidad', en: 'Quantity', pt: 'Quantidade' },
  'quotes.newQuote.unitPrice': { es: 'Precio Unit.', en: 'Unit Price', pt: 'Preço Unit.' },
  'quotes.newQuote.total': { es: 'Total', en: 'Total', pt: 'Total' },
  'quotes.newQuote.termsAndConditions': { es: 'Términos y Condiciones', en: 'Terms and Conditions', pt: 'Termos e Condições' },
  'quotes.newQuote.validityTerms': { es: 'Esta cotización tiene una validez de {days} días.', en: 'This quote is valid for {days} days.', pt: 'Esta cotação é válida por {days} dias.' },
  'quotes.newQuote.priceTerms': { es: 'Los precios están sujetos a cambios sin previo aviso.', en: 'Prices are subject to change without notice.', pt: 'Os preços estão sujeitos a alterações sem aviso prévio.' },
  'quotes.newQuote.paymentTerms': { es: 'El pago debe realizarse según las condiciones acordadas.', en: 'Payment must be made according to agreed conditions.', pt: 'O pagamento deve ser feito de acordo com as condições acordadas.' },
  'quotes.newQuote.deliveryTerms': { es: 'Los tiempos de entrega son estimados y pueden variar.', en: 'Delivery times are estimated and may vary.', pt: 'Os tempos de entrega são estimados e podem variar.' },
  'quotes.newQuote.close': { es: 'Cerrar', en: 'Close', pt: 'Fechar' },
  'quotes.newQuote.saveQuote': { es: 'Guardar Cotización', en: 'Save Quote', pt: 'Salvar Cotação' },

  // Configuración de Condiciones
  'quotes.conditions.title': { es: 'Configuración de Condiciones', en: 'Conditions Configuration', pt: 'Configuração de Condições' },
  'quotes.conditions.subtitle': { es: 'Gestiona las condiciones y cláusulas de las cotizaciones', en: 'Manage quote conditions and clauses', pt: 'Gerencie as condições e cláusulas das cotações' },
  'quotes.conditions.tutorial': { es: 'Tutorial', en: 'Tutorial', pt: 'Tutorial' },
  'quotes.conditions.configure': { es: 'Condiciones', en: 'Conditions', pt: 'Condições' },
  'quotes.conditions.addNew': { es: 'Agregar Nueva Condición', en: 'Add New Condition', pt: 'Adicionar Nova Condição' },
  'quotes.conditions.addCondition': { es: 'Agregar Condición', en: 'Add Condition', pt: 'Adicionar Condição' },
  'quotes.conditions.editCondition': { es: 'Editar Condición', en: 'Edit Condition', pt: 'Editar Condição' },
  'quotes.conditions.title': { es: 'Título', en: 'Title', pt: 'Título' },
  'quotes.conditions.titlePlaceholder': { es: 'Ej: Validez de la Cotización', en: 'Ex: Quote Validity', pt: 'Ex: Validade da Cotação' },
  'quotes.conditions.content': { es: 'Contenido', en: 'Content', pt: 'Conteúdo' },
  'quotes.conditions.contentPlaceholder': { es: 'Ej: Esta cotización tiene una validez de {days} días...', en: 'Ex: This quote is valid for {days} days...', pt: 'Ex: Esta cotação é válida por {days} dias...' },
  'quotes.conditions.category': { es: 'Categoría', en: 'Category', pt: 'Categoria' },
  'quotes.conditions.categories.general': { es: 'General', en: 'General', pt: 'Geral' },
  'quotes.conditions.categories.validity': { es: 'Validez', en: 'Validity', pt: 'Validade' },
  'quotes.conditions.categories.payment': { es: 'Pago', en: 'Payment', pt: 'Pagamento' },
  'quotes.conditions.categories.delivery': { es: 'Entrega', en: 'Delivery', pt: 'Entrega' },
  'quotes.conditions.categories.warranty': { es: 'Garantía', en: 'Warranty', pt: 'Garantia' },
  'quotes.conditions.active': { es: 'Activa', en: 'Active', pt: 'Ativa' },
  'quotes.conditions.inactive': { es: 'Inactiva', en: 'Inactive', pt: 'Inativa' },
  'quotes.conditions.cancel': { es: 'Cancelar', en: 'Cancel', pt: 'Cancelar' },
  'quotes.conditions.update': { es: 'Actualizar', en: 'Update', pt: 'Atualizar' },
  'quotes.conditions.add': { es: 'Agregar', en: 'Add', pt: 'Adicionar' },
  'quotes.conditions.existingConditions': { es: 'Condiciones Existentes', en: 'Existing Conditions', pt: 'Condições Existentes' },
  'quotes.conditions.noConditions': { es: 'No hay condiciones configuradas', en: 'No conditions configured', pt: 'Nenhuma condição configurada' },
  'quotes.conditions.order': { es: 'Orden', en: 'Order', pt: 'Ordem' },
  'quotes.conditions.edit': { es: 'Editar', en: 'Edit', pt: 'Editar' },
  'quotes.conditions.deactivate': { es: 'Desactivar', en: 'Deactivate', pt: 'Desativar' },
  'quotes.conditions.activate': { es: 'Activar', en: 'Activate', pt: 'Ativar' },
  'quotes.conditions.delete': { es: 'Eliminar', en: 'Delete', pt: 'Excluir' },
  'quotes.conditions.save': { es: 'Guardar Configuración', en: 'Save Configuration', pt: 'Salvar Configuração' },
  'quotes.conditions.validation.required': { es: 'Debe completar todos los campos', en: 'You must complete all fields', pt: 'Você deve preencher todos os campos' },
  'quotes.conditions.confirmDelete': { es: '¿Estás seguro de que quieres eliminar esta condición?', en: 'Are you sure you want to delete this condition?', pt: 'Tem certeza de que deseja excluir esta condição?' },

  // Información de la tienda y vendedor
  'quotes.storeInfo.description': { es: 'Repuestos Automotrices de Calidad', en: 'Quality Automotive Parts', pt: 'Peças Automotivas de Qualidade' },
  'quotes.storeInfo.businessHours': { es: 'Horarios de Atención', en: 'Business Hours', pt: 'Horários de Funcionamento' },
  'quotes.quoteNumber': { es: 'Cotización N°', en: 'Quote No.', pt: 'Cotação N°' },
  'quotes.quoteDate': { es: 'Fecha', en: 'Date', pt: 'Data' },
  'quotes.sellerInfo.manager': { es: 'Gestor de Tienda', en: 'Store Manager', pt: 'Gerente da Loja' },
  'quotes.sellerInfo.seller': { es: 'Vendedor', en: 'Seller', pt: 'Vendedor' },
  'quotes.sellerInfo.employeeId': { es: 'ID Empleado', en: 'Employee ID', pt: 'ID do Funcionário' },
  'quotes.sellerInfo.attendedBy': { es: 'Atendido por', en: 'Attended by', pt: 'Atendido por' },

  // Configuración de la Tienda
  'quotes.storeConfig.title': { es: 'Configuración de la Tienda', en: 'Store Configuration', pt: 'Configuração da Loja' },
  'quotes.storeConfig.subtitle': { es: 'Personaliza la información que aparece en las cotizaciones', en: 'Customize the information that appears in quotes', pt: 'Personalize as informações que aparecem nas cotações' },
  'quotes.storeConfig.configure': { es: 'Tienda', en: 'Store', pt: 'Loja' },
  'quotes.storeConfig.basicInfo': { es: 'Información Básica', en: 'Basic Information', pt: 'Informações Básicas' },
  'quotes.storeConfig.businessHours': { es: 'Horarios', en: 'Hours', pt: 'Horários' },
  'quotes.storeConfig.socialMedia': { es: 'Redes Sociales', en: 'Social Media', pt: 'Redes Sociais' },
  'quotes.storeConfig.storeName': { es: 'Nombre de la Tienda', en: 'Store Name', pt: 'Nome da Loja' },
  'quotes.storeConfig.storeNamePlaceholder': { es: 'Ej: PiezasYA - Repuestos Automotrices', en: 'Ex: PiezasYA - Automotive Parts', pt: 'Ex: PiezasYA - Peças Automotivas' },
  'quotes.storeConfig.ruc': { es: 'RUC', en: 'RUC', pt: 'RUC' },
  'quotes.storeConfig.description': { es: 'Descripción', en: 'Description', pt: 'Descrição' },
  'quotes.storeConfig.descriptionPlaceholder': { es: 'Breve descripción de la tienda...', en: 'Brief store description...', pt: 'Breve descrição da loja...' },
  'quotes.storeConfig.address': { es: 'Dirección', en: 'Address', pt: 'Endereço' },
  'quotes.storeConfig.addressPlaceholder': { es: 'Av. Principal 123, Ciudad, País', en: 'Main St 123, City, Country', pt: 'Av. Principal 123, Cidade, País' },
  'quotes.storeConfig.phone': { es: 'Teléfono', en: 'Phone', pt: 'Telefone' },
  'quotes.storeConfig.email': { es: 'Email', en: 'Email', pt: 'Email' },
  'quotes.storeConfig.website': { es: 'Sitio Web', en: 'Website', pt: 'Site Web' },
  'quotes.storeConfig.hoursInfo': { es: 'Los horarios de atención aparecerán en las cotizaciones para que los clientes sepan cuándo pueden contactarte.', en: 'Business hours will appear in quotes so customers know when they can contact you.', pt: 'Os horários de funcionamento aparecerão nas cotações para que os clientes saibam quando podem entrar em contato.' },
  'quotes.storeConfig.socialInfo': { es: 'Las redes sociales ayudan a los clientes a conectarse contigo y conocer más sobre tu tienda.', en: 'Social media helps customers connect with you and learn more about your store.', pt: 'As redes sociais ajudam os clientes a se conectarem com você e conhecerem mais sobre sua loja.' },
  'quotes.storeConfig.cancel': { es: 'Cancelar', en: 'Cancel', pt: 'Cancelar' },
  'quotes.storeConfig.save': { es: 'Guardar Configuración', en: 'Save Configuration', pt: 'Salvar Configuração' },
  'quotes.storeConfig.days.monday': { es: 'Lunes', en: 'Monday', pt: 'Segunda' },
  'quotes.storeConfig.days.tuesday': { es: 'Martes', en: 'Tuesday', pt: 'Terça' },
  'quotes.storeConfig.days.wednesday': { es: 'Miércoles', en: 'Wednesday', pt: 'Quarta' },
  'quotes.storeConfig.days.thursday': { es: 'Jueves', en: 'Thursday', pt: 'Quinta' },
  'quotes.storeConfig.days.friday': { es: 'Viernes', en: 'Friday', pt: 'Sexta' },
  'quotes.storeConfig.days.saturday': { es: 'Sábado', en: 'Saturday', pt: 'Sábado' },
  'quotes.storeConfig.days.sunday': { es: 'Domingo', en: 'Sunday', pt: 'Domingo' },

  // Consulta de Precios
  'prices.title': { es: 'Consulta de Precios', en: 'Price Inquiry', pt: 'Consulta de Preços' },
  'prices.subtitle': { es: 'Busca productos y consulta precios en tiempo real', en: 'Search products and check prices in real-time', pt: 'Busque produtos e consulte preços em tempo real' },
  'prices.filters': { es: 'Filtros', en: 'Filters', pt: 'Filtros' },
  'prices.update': { es: 'Actualizar', en: 'Update', pt: 'Atualizar' },
  'prices.category': { es: 'Categoría', en: 'Category', pt: 'Categoria' },
  'prices.allCategories': { es: 'Todas las categorías', en: 'All categories', pt: 'Todas as categorias' },
  'prices.brand': { es: 'Marca', en: 'Brand', pt: 'Marca' },
  'prices.allBrands': { es: 'Todas las marcas', en: 'All brands', pt: 'Todas as marcas' },
  'prices.priceRange': { es: 'Rango de Precio', en: 'Price Range', pt: 'Faixa de Preço' },
  'prices.sortBy': { es: 'Ordenar por', en: 'Sort by', pt: 'Ordenar por' },
  'prices.sortOptions.name': { es: 'Nombre', en: 'Name', pt: 'Nome' },
  'prices.sortOptions.priceLow': { es: 'Precio: Menor a Mayor', en: 'Price: Low to High', pt: 'Preço: Menor para Maior' },
  'prices.sortOptions.priceHigh': { es: 'Precio: Mayor a Menor', en: 'Price: High to Low', pt: 'Preço: Maior para Menor' },
  'prices.sortOptions.rating': { es: 'Calificación', en: 'Rating', pt: 'Avaliação' },
  'prices.sortOptions.stock': { es: 'Stock', en: 'Stock', pt: 'Estoque' },
  'prices.searchPlaceholder': { es: 'Buscar productos por nombre, marca o descripción...', en: 'Search products by name, brand or description...', pt: 'Buscar produtos por nome, marca ou descrição...' },
  'prices.stock': { es: 'Stock', en: 'Stock', pt: 'Estoque' },
  'prices.quote': { es: 'Cotizar', en: 'Quote', pt: 'Cotar' },
  'prices.chat': { es: 'Chat', en: 'Chat', pt: 'Chat' },
  'prices.createQuote': { es: 'Crear Cotización', en: 'Create Quote', pt: 'Criar Cotação' },
  'prices.selectedProduct': { es: 'Producto Seleccionado', en: 'Selected Product', pt: 'Produto Selecionado' },
  'prices.customerName': { es: 'Nombre del Cliente', en: 'Customer Name', pt: 'Nome do Cliente' },
  'prices.customerNamePlaceholder': { es: 'Nombre completo del cliente', en: 'Full customer name', pt: 'Nome completo do cliente' },
  'prices.customerEmail': { es: 'Email del Cliente', en: 'Customer Email', pt: 'Email do Cliente' },
  'prices.customerEmailPlaceholder': { es: 'email@ejemplo.com', en: 'email@example.com', pt: 'email@exemplo.com' },
  'prices.quantity': { es: 'Cantidad', en: 'Quantity', pt: 'Quantidade' },
  'prices.notes': { es: 'Notas Adicionales', en: 'Additional Notes', pt: 'Notas Adicionais' },
  'prices.notesPlaceholder': { es: 'Notas adicionales para la cotización...', en: 'Additional notes for the quote...', pt: 'Notas adicionais para a cotação...' },
  'prices.cancel': { es: 'Cancelar', en: 'Cancel', pt: 'Cancelar' },
  'prices.quoteCreated': { es: 'Cotización creada exitosamente', en: 'Quote created successfully', pt: 'Cotação criada com sucesso' },

  // Pedidos de Delivery
  'deliveryOrders.title': { es: 'Pedidos Asignados', en: 'Assigned Orders', pt: 'Pedidos Atribuídos' },
  'deliveryOrders.subtitle': { es: 'Gestiona tus pedidos de entrega asignados', en: 'Manage your assigned delivery orders', pt: 'Gerencie seus pedidos de entrega atribuídos' },
  'deliveryOrders.loading': { es: 'Cargando pedidos...', en: 'Loading orders...', pt: 'Carregando pedidos...' },
  'deliveryOrders.error': { es: 'Error al cargar los pedidos', en: 'Error loading orders', pt: 'Erro ao carregar pedidos' },
  'deliveryOrders.refresh': { es: 'Actualizar', en: 'Refresh', pt: 'Atualizar' },
  'deliveryOrders.searchPlaceholder': { es: 'Buscar por código de seguimiento, cliente o tienda...', en: 'Search by tracking code, customer or store...', pt: 'Buscar por código de rastreamento, cliente ou loja...' },
  'deliveryOrders.filters.allStatuses': { es: 'Todos los estados', en: 'All statuses', pt: 'Todos os status' },
  'deliveryOrders.filters.pending': { es: 'Pendiente', en: 'Pending', pt: 'Pendente' },
  'deliveryOrders.filters.assigned': { es: 'Asignado', en: 'Assigned', pt: 'Atribuído' },
  'deliveryOrders.filters.accepted': { es: 'Aceptado', en: 'Accepted', pt: 'Aceito' },
  'deliveryOrders.filters.pickedUp': { es: 'Recogido', en: 'Picked Up', pt: 'Coletado' },
  'deliveryOrders.filters.inTransit': { es: 'En Tránsito', en: 'In Transit', pt: 'Em Trânsito' },
  'deliveryOrders.filters.delivered': { es: 'Entregado', en: 'Delivered', pt: 'Entregue' },
  'deliveryOrders.filters.cancelled': { es: 'Cancelado', en: 'Cancelled', pt: 'Cancelado' },
  'deliveryOrders.stats.total': { es: 'Total Pedidos', en: 'Total Orders', pt: 'Total de Pedidos' },
  'deliveryOrders.stats.pending': { es: 'Pendientes', en: 'Pending', pt: 'Pendentes' },
  'deliveryOrders.stats.inProgress': { es: 'En Progreso', en: 'In Progress', pt: 'Em Progresso' },
  'deliveryOrders.stats.completed': { es: 'Completados', en: 'Completed', pt: 'Completados' },
  'deliveryOrders.table.order': { es: 'Pedido', en: 'Order', pt: 'Pedido' },
  'deliveryOrders.table.customer': { es: 'Cliente', en: 'Customer', pt: 'Cliente' },
  'deliveryOrders.table.status': { es: 'Estado', en: 'Status', pt: 'Status' },
  'deliveryOrders.table.estimatedDelivery': { es: 'Entrega Estimada', en: 'Estimated Delivery', pt: 'Entrega Estimada' },
  'deliveryOrders.table.earnings': { es: 'Ganancias', en: 'Earnings', pt: 'Ganhos' },
  'deliveryOrders.table.actions': { es: 'Acciones', en: 'Actions', pt: 'Ações' },
  'deliveryOrders.status.pending': { es: 'Pendiente', en: 'Pending', pt: 'Pendente' },
  'deliveryOrders.status.assigned': { es: 'Asignado', en: 'Assigned', pt: 'Atribuído' },
  'deliveryOrders.status.accepted': { es: 'Aceptado', en: 'Accepted', pt: 'Aceito' },
  'deliveryOrders.status.pickedUp': { es: 'Recogido', en: 'Picked Up', pt: 'Coletado' },
  'deliveryOrders.status.inTransit': { es: 'En Tránsito', en: 'In Transit', pt: 'Em Trânsito' },
  'deliveryOrders.status.delivered': { es: 'Entregado', en: 'Delivered', pt: 'Entregue' },
  'deliveryOrders.status.cancelled': { es: 'Cancelado', en: 'Cancelled', pt: 'Cancelado' },
  'deliveryOrders.status.failed': { es: 'Fallido', en: 'Failed', pt: 'Falhou' },
  'deliveryOrders.orderDetails': { es: 'Detalles del Pedido', en: 'Order Details', pt: 'Detalhes do Pedido' },
  'deliveryOrders.order.trackingCode': { es: 'Código de Seguimiento', en: 'Tracking Code', pt: 'Código de Rastreamento' },
  'deliveryOrders.order.estimatedPickup': { es: 'Recogida Estimada', en: 'Estimated Pickup', pt: 'Coleta Estimada' },
  'deliveryOrders.order.estimatedDelivery': { es: 'Entrega Estimada', en: 'Estimated Delivery', pt: 'Entrega Estimada' },
  'deliveryOrders.order.customer': { es: 'Cliente', en: 'Customer', pt: 'Cliente' },
  'deliveryOrders.order.instructions': { es: 'Instrucciones', en: 'Instructions', pt: 'Instruções' },
  'deliveryOrders.order.store': { es: 'Tienda', en: 'Store', pt: 'Loja' },
  'deliveryOrders.order.products': { es: 'Productos', en: 'Products', pt: 'Produtos' },
  'deliveryOrders.order.total': { es: 'Total', en: 'Total', pt: 'Total' },
  'deliveryOrders.order.deliveryInfo': { es: 'Información de Entrega', en: 'Delivery Information', pt: 'Informações de Entrega' },
  'deliveryOrders.order.deliveryFee': { es: 'Tarifa de Entrega', en: 'Delivery Fee', pt: 'Taxa de Entrega' },
  'deliveryOrders.order.riderPayment': { es: 'Pago al Repartidor', en: 'Rider Payment', pt: 'Pagamento do Entregador' },
  'deliveryOrders.actions.callCustomer': { es: 'Llamar Cliente', en: 'Call Customer', pt: 'Ligar Cliente' },
  'deliveryOrders.actions.callStore': { es: 'Llamar Tienda', en: 'Call Store', pt: 'Ligar Loja' },
  'deliveryOrders.actions.startNavigation': { es: 'Iniciar Navegación', en: 'Start Navigation', pt: 'Iniciar Navegação' },
  'deliveryOrders.export.title': { es: 'Exportar Pedidos', en: 'Export Orders', pt: 'Exportar Pedidos' },
  'deliveryOrders.export.format': { es: 'Formato', en: 'Format', pt: 'Formato' },
  'deliveryOrders.export.csv': { es: 'CSV', en: 'CSV', pt: 'CSV' },
  'deliveryOrders.export.excel': { es: 'Excel', en: 'Excel', pt: 'Excel' },
  'deliveryOrders.export.pdf': { es: 'PDF', en: 'PDF', pt: 'PDF' },
  'deliveryOrders.export.dateRange': { es: 'Rango de Fechas', en: 'Date Range', pt: 'Intervalo de Datas' },
  'deliveryOrders.export.all': { es: 'Todos', en: 'All', pt: 'Todos' },
  'deliveryOrders.export.lastWeek': { es: 'Última Semana', en: 'Last Week', pt: 'Última Semana' },
  'deliveryOrders.export.lastMonth': { es: 'Último Mes', en: 'Last Month', pt: 'Último Mês' },
  'deliveryOrders.export.custom': { es: 'Personalizado', en: 'Custom', pt: 'Personalizado' },
  'deliveryOrders.export.export': { es: 'Exportar', en: 'Export', pt: 'Exportar' },
  'deliveryOrders.export.cancel': { es: 'Cancelar', en: 'Cancel', pt: 'Cancelar' },
  'deliveryOrders.share.title': { es: 'Compartir Pedidos', en: 'Share Orders', pt: 'Compartilhar Pedidos' },
  'deliveryOrders.share.method': { es: 'Método', en: 'Method', pt: 'Método' },
  'deliveryOrders.share.email': { es: 'Email', en: 'Email', pt: 'Email' },
  'deliveryOrders.share.whatsapp': { es: 'WhatsApp', en: 'WhatsApp', pt: 'WhatsApp' },
  'deliveryOrders.share.link': { es: 'Enlace', en: 'Link', pt: 'Link' },
  'deliveryOrders.share.recipient': { es: 'Destinatario', en: 'Recipient', pt: 'Destinatário' },
  'deliveryOrders.share.message': { es: 'Mensaje', en: 'Message', pt: 'Mensagem' },
  'deliveryOrders.share.share': { es: 'Compartir', en: 'Share', pt: 'Compartilhar' },
  'deliveryOrders.share.cancel': { es: 'Cancelar', en: 'Cancel', pt: 'Cancelar' }
};

export class TranslationService {
  private currentLanguage: Language = 'es';

  constructor(language?: Language) {
    if (language) {
      this.currentLanguage = language;
    }
  }

  setLanguage(language: Language): void {
    this.currentLanguage = language;
    // Guardar en localStorage para persistencia
    localStorage.setItem('language', language);
  }

  getLanguage(): Language {
    return this.currentLanguage;
  }

  t(key: string): string {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    return translation[this.currentLanguage] || translation['es'] || key;
  }

  // Método para obtener traducción con parámetros
  tWithParams(key: string, params: Record<string, string>): string {
    let text = this.t(key);
    Object.entries(params).forEach(([param, value]) => {
      text = text.replace(new RegExp(`{{${param}}}`, 'g'), value);
    });
    return text;
  }

  // Obtener todas las traducciones para un idioma específico
  getAllForLanguage(language: Language): Record<string, string> {
    const result: Record<string, string> = {};
    Object.entries(translations).forEach(([key, values]) => {
      result[key] = values[language] || values['es'] || key;
    });
    return result;
  }

  // Obtener idioma del localStorage al inicializar
  initializeLanguage(): void {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['es', 'en', 'pt'].includes(savedLanguage)) {
      this.currentLanguage = savedLanguage;
    }
  }
}

// Instancia global del servicio de traducciones
export const translationService = new TranslationService();

// Inicializar con el idioma guardado
translationService.initializeLanguage();

// Hook personalizado para usar traducciones
export const useTranslation = () => {
  // Obtener el idioma actual del localStorage para sincronizar
  const currentLanguage = localStorage.getItem('language') as Language || 'es';
  translationService.setLanguage(currentLanguage);
  
  return {
    t: translationService.t.bind(translationService),
    tWithParams: translationService.tWithParams.bind(translationService),
    setLanguage: translationService.setLanguage.bind(translationService),
    getLanguage: translationService.getLanguage.bind(translationService)
  };
};
