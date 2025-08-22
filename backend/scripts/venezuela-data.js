// Datos de Venezuela - Estados, Municipios y Parroquias
// Basado en los datos proporcionados por el usuario

const venezuelaStates = [
  { name: 'DTTO. CAPITAL', code: 'DC', capital: 'Caracas', region: 'Central', isActive: true },
  { name: 'ANZOATEGUI', code: 'AN', capital: 'Barcelona', region: 'Oriental', isActive: true },
  { name: 'APURE', code: 'AP', capital: 'San Fernando de Apure', region: 'Los Llanos', isActive: true },
  { name: 'ARAGUA', code: 'AR', capital: 'Maracay', region: 'Central', isActive: true },
  { name: 'BARINAS', code: 'BA', capital: 'Barinas', region: 'Los Llanos', isActive: true },
  { name: 'BOLIVAR', code: 'BO', capital: 'Ciudad Bolívar', region: 'Guayana', isActive: true },
  { name: 'CARABOBO', code: 'CA', capital: 'Valencia', region: 'Central', isActive: true },
  { name: 'COJEDES', code: 'CO', capital: 'San Carlos', region: 'Central', isActive: true },
  { name: 'FALCON', code: 'FA', capital: 'Coro', region: 'Occidental', isActive: true },
  { name: 'GUARICO', code: 'GU', capital: 'San Juan de los Morros', region: 'Los Llanos', isActive: true },
  { name: 'LARA', code: 'LA', capital: 'Barquisimeto', region: 'Occidental', isActive: true },
  { name: 'MERIDA', code: 'ME', capital: 'Mérida', region: 'Occidental', isActive: true },
  { name: 'MIRANDA', code: 'MI', capital: 'Los Teques', region: 'Central', isActive: true },
  { name: 'MONAGAS', code: 'MO', capital: 'Maturín', region: 'Oriental', isActive: true },
  { name: 'NUEVA ESPARTA', code: 'NE', capital: 'La Asunción', region: 'Insular', isActive: true },
  { name: 'PORTUGUESA', code: 'PO', capital: 'Guanare', region: 'Los Llanos', isActive: true },
  { name: 'SUCRE', code: 'SU', capital: 'Cumaná', region: 'Oriental', isActive: true },
  { name: 'TACHIRA', code: 'TA', capital: 'San Cristóbal', region: 'Occidental', isActive: true },
  { name: 'TRUJILLO', code: 'TR', capital: 'Trujillo', region: 'Occidental', isActive: true },
  { name: 'YARACUY', code: 'YA', capital: 'San Felipe', region: 'Occidental', isActive: true },
  { name: 'ZULIA', code: 'ZU', capital: 'Maracaibo', region: 'Zuliana', isActive: true },
  { name: 'AMAZONAS', code: 'AM', capital: 'Puerto Ayacucho', region: 'Guayana', isActive: true },
  { name: 'DELTA AMACURO', code: 'DA', capital: 'Tucupita', region: 'Guayana', isActive: true },
  { name: 'LA GUAIRA', code: 'LG', capital: 'La Guaira', region: 'Central', isActive: true }
];

// Municipios - Solo algunos ejemplos para evitar token limits
// En la implementación completa se incluirían todos los municipios
const venezuelaMunicipalities = [
  // Distrito Capital
  { name: 'LIBERTADOR', code: 'DC01', stateCode: 'DC', capital: 'Caracas', isActive: true },
  
  // Anzoátegui
  { name: 'ANACO', code: 'AN01', stateCode: 'AN', capital: 'Anaco', isActive: true },
  { name: 'ARAGUA', code: 'AN02', stateCode: 'AN', capital: 'Aragua de Barcelona', isActive: true },
  { name: 'BOLIVAR', code: 'AN03', stateCode: 'AN', capital: 'Barcelona', isActive: true },
  
  // Miranda
  { name: 'GUAICAIPURO', code: 'MI01', stateCode: 'MI', capital: 'Los Teques', isActive: true },
  { name: 'SUCRE', code: 'MI02', stateCode: 'MI', capital: 'Petare', isActive: true },
  { name: 'BARUTA', code: 'MI03', stateCode: 'MI', capital: 'Baruta', isActive: true },
  
  // Zulia
  { name: 'MARACAIBO', code: 'ZU01', stateCode: 'ZU', capital: 'Maracaibo', isActive: true },
  { name: 'SAN FRANCISCO', code: 'ZU02', stateCode: 'ZU', capital: 'San Francisco', isActive: true }
];

// Parroquias - Solo algunos ejemplos
const venezuelaParishes = [
  // Libertador, Distrito Capital
  { name: 'ALTAGRACIA', code: 'DC0101', municipalityCode: 'DC01', isActive: true },
  { name: 'CANDELARIA', code: 'DC0102', municipalityCode: 'DC01', isActive: true },
  { name: 'CATEDRAL', code: 'DC0103', municipalityCode: 'DC01', isActive: true },
  
  // Anaco, Anzoátegui
  { name: 'ANACO', code: 'AN0101', municipalityCode: 'AN01', isActive: true },
  { name: 'SAN JOAQUIN', code: 'AN0102', municipalityCode: 'AN01', isActive: true },
  
  // Guaicaipuro, Miranda
  { name: 'LOS TEQUES', code: 'MI0101', municipalityCode: 'MI01', isActive: true },
  { name: 'CECILIO ACOSTA', code: 'MI0102', municipalityCode: 'MI01', isActive: true },
  
  // Maracaibo, Zulia
  { name: 'BOLIVAR', code: 'ZU0101', municipalityCode: 'ZU01', isActive: true },
  { name: 'COQUIVACOA', code: 'ZU0102', municipalityCode: 'ZU01', isActive: true }
];

module.exports = {
  venezuelaStates,
  venezuelaMunicipalities,
  venezuelaParishes
};
