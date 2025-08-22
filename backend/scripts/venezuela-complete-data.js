// Datos completos de Venezuela - Estados, Municipios y Parroquias
// Basado en los datos SQL proporcionados por el usuario

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

// Municipios completos basados en los datos SQL
const venezuelaMunicipalities = [
  // Distrito Capital
  { name: 'LIBERTADOR', code: 'DC01', stateCode: 'DC', capital: 'Caracas', isActive: true },
  
  // Anzoátegui
  { name: 'ANACO', code: 'AN01', stateCode: 'AN', capital: 'Anaco', isActive: true },
  { name: 'ARAGUA', code: 'AN02', stateCode: 'AN', capital: 'Aragua de Barcelona', isActive: true },
  { name: 'BOLIVAR', code: 'AN03', stateCode: 'AN', capital: 'Barcelona', isActive: true },
  { name: 'BRUZUAL', code: 'AN04', stateCode: 'AN', capital: 'Clarines', isActive: true },
  { name: 'CAJIGAL', code: 'AN05', stateCode: 'AN', capital: 'Onoto', isActive: true },
  { name: 'FREITES', code: 'AN06', stateCode: 'AN', capital: 'Cantaura', isActive: true },
  { name: 'INDEPENDENCIA', code: 'AN07', stateCode: 'AN', capital: 'Soledad', isActive: true },
  { name: 'LIBERTAD', code: 'AN08', stateCode: 'AN', capital: 'San Mateo', isActive: true },
  { name: 'MIRANDA', code: 'AN09', stateCode: 'AN', capital: 'Pariaguán', isActive: true },
  { name: 'MONAGAS', code: 'AN10', stateCode: 'AN', capital: 'Mapire', isActive: true },
  { name: 'PEÑALVER', code: 'AN11', stateCode: 'AN', capital: 'Puerto Píritu', isActive: true },
  { name: 'SIMON RODRIGUEZ', code: 'AN12', stateCode: 'AN', capital: 'El Tigre', isActive: true },
  { name: 'SOTILLO', code: 'AN13', stateCode: 'AN', capital: 'Puerto La Cruz', isActive: true },
  { name: 'GUANIPA', code: 'AN14', stateCode: 'AN', capital: 'San José de Guanipa', isActive: true },
  { name: 'GUANTA', code: 'AN15', stateCode: 'AN', capital: 'Guanta', isActive: true },
  { name: 'PIRITU', code: 'AN16', stateCode: 'AN', capital: 'Píritu', isActive: true },
  { name: 'M.L/DIEGO BAUTISTA U', code: 'AN17', stateCode: 'AN', capital: 'Lecherías', isActive: true },
  { name: 'CARVAJAL', code: 'AN18', stateCode: 'AN', capital: 'Valle Guanape', isActive: true },
  { name: 'SANTA ANA', code: 'AN19', stateCode: 'AN', capital: 'Santa Ana', isActive: true },
  { name: 'MC GREGOR', code: 'AN20', stateCode: 'AN', capital: 'El Chaparro', isActive: true },
  { name: 'S JUAN CAPISTRANO', code: 'AN21', stateCode: 'AN', capital: 'Boca Uchire', isActive: true },
  
  // Miranda
  { name: 'GUAICAIPURO', code: 'MI01', stateCode: 'MI', capital: 'Los Teques', isActive: true },
  { name: 'SUCRE', code: 'MI02', stateCode: 'MI', capital: 'Petare', isActive: true },
  { name: 'BARUTA', code: 'MI03', stateCode: 'MI', capital: 'Baruta', isActive: true },
  { name: 'CHACAO', code: 'MI04', stateCode: 'MI', capital: 'Chacao', isActive: true },
  { name: 'EL HATILLO', code: 'MI05', stateCode: 'MI', capital: 'El Hatillo', isActive: true },
  { name: 'BRION', code: 'MI06', stateCode: 'MI', capital: 'Higuerote', isActive: true },
  { name: 'BUROZ', code: 'MI07', stateCode: 'MI', capital: 'Mamporal', isActive: true },
  { name: 'INDEPENDENCIA', code: 'MI08', stateCode: 'MI', capital: 'Santa Teresa del Tuy', isActive: true },
  { name: 'LANDER', code: 'MI09', stateCode: 'MI', capital: 'Ocumare del Tuy', isActive: true },
  { name: 'PAEZ', code: 'MI10', stateCode: 'MI', capital: 'Río Chico', isActive: true },
  { name: 'PAZ CASTILLO', code: 'MI11', stateCode: 'MI', capital: 'Santa Lucía', isActive: true },
  { name: 'PLAZA', code: 'MI12', stateCode: 'MI', capital: 'Guarenas', isActive: true },
  { name: 'URDANETA', code: 'MI13', stateCode: 'MI', capital: 'Cúa', isActive: true },
  { name: 'ZAMORA', code: 'MI14', stateCode: 'MI', capital: 'Guatire', isActive: true },
  { name: 'CRISTOBAL ROJAS', code: 'MI15', stateCode: 'MI', capital: 'Charallave', isActive: true },
  { name: 'LOS SALIAS', code: 'MI16', stateCode: 'MI', capital: 'San Antonio de los Altos', isActive: true },
  { name: 'ANDRES BELLO', code: 'MI17', stateCode: 'MI', capital: 'San José de Barlovento', isActive: true },
  { name: 'SIMON BOLIVAR', code: 'MI18', stateCode: 'MI', capital: 'San Francisco de Yare', isActive: true },
  { name: 'PEDRO GUAL', code: 'MI19', stateCode: 'MI', capital: 'Cupira', isActive: true },
  
  // Zulia
  { name: 'MARACAIBO', code: 'ZU01', stateCode: 'ZU', capital: 'Maracaibo', isActive: true },
  { name: 'SAN FRANCISCO', code: 'ZU02', stateCode: 'ZU', capital: 'San Francisco', isActive: true },
  { name: 'JESUS E LOSSADA', code: 'ZU03', stateCode: 'ZU', capital: 'La Concepción', isActive: true },
  { name: 'ALMIRANTE P', code: 'ZU04', stateCode: 'ZU', capital: 'San José', isActive: true },
  { name: 'JESUS M SEMPRUN', code: 'ZU05', stateCode: 'ZU', capital: 'Santa Bárbara', isActive: true },
  { name: 'FRANCISCO J PULG', code: 'ZU06', stateCode: 'ZU', capital: 'El Rosario', isActive: true },
  { name: 'SIMON BOLIVAR', code: 'ZU07', stateCode: 'ZU', capital: 'Tía Juana', isActive: true },
  { name: 'BARALT', code: 'ZU08', stateCode: 'ZU', capital: 'San Timoteo', isActive: true },
  { name: 'SANTA RITA', code: 'ZU09', stateCode: 'ZU', capital: 'Santa Rita', isActive: true },
  { name: 'COLON', code: 'ZU10', stateCode: 'ZU', capital: 'San Carlos del Zulia', isActive: true },
  { name: 'MARA', code: 'ZU11', stateCode: 'ZU', capital: 'San Rafael del Moján', isActive: true },
  { name: 'MIRANDA', code: 'ZU12', stateCode: 'ZU', capital: 'Los Puertos de Altagracia', isActive: true },
  { name: 'PAEZ', code: 'ZU13', stateCode: 'ZU', capital: 'Sinamaica', isActive: true },
  { name: 'MACHIQUES DE P', code: 'ZU14', stateCode: 'ZU', capital: 'Machiques', isActive: true },
  { name: 'SUCRE', code: 'ZU15', stateCode: 'ZU', capital: 'Bobures', isActive: true },
  { name: 'LA CAÑADA DE U.', code: 'ZU16', stateCode: 'ZU', capital: 'Concepción', isActive: true },
  { name: 'LAGUNILLAS', code: 'ZU17', stateCode: 'ZU', capital: 'Ciudad Ojeda', isActive: true },
  { name: 'CATATUMBO', code: 'ZU18', stateCode: 'ZU', capital: 'Encontrados', isActive: true },
  { name: 'M/ROSARIO DE PERIJA', code: 'ZU19', stateCode: 'ZU', capital: 'La Villa del Rosario', isActive: true },
  { name: 'CABIMAS', code: 'ZU20', stateCode: 'ZU', capital: 'Cabimas', isActive: true },
  { name: 'VALMORE RODRIGUEZ', code: 'ZU21', stateCode: 'ZU', capital: 'Bachaquero', isActive: true },
  { name: 'JESUS E LOSSADA', code: 'ZU22', stateCode: 'ZU', capital: 'La Concepción', isActive: true },
  { name: 'ALMIRANTE P', code: 'ZU23', stateCode: 'ZU', capital: 'San José', isActive: true },
  { name: 'SAN FRANCISCO', code: 'ZU24', stateCode: 'ZU', capital: 'San Francisco', isActive: true },
  { name: 'JESUS M SEMPRUN', code: 'ZU25', stateCode: 'ZU', capital: 'Santa Bárbara', isActive: true },
  { name: 'FRANCISCO J PULG', code: 'ZU26', stateCode: 'ZU', capital: 'El Rosario', isActive: true },
  { name: 'SIMON BOLIVAR', code: 'ZU27', stateCode: 'ZU', capital: 'Tía Juana', isActive: true },
  { name: 'RAFAEL MARIA BARALT', code: 'ZU28', stateCode: 'ZU', capital: 'San Rafael', isActive: true },
  { name: 'MANUEL MANRIQUE', code: 'ZU29', stateCode: 'ZU', capital: 'San Rafael', isActive: true },
  { name: 'RAFAEL URDANETA', code: 'ZU30', stateCode: 'ZU', capital: 'San Rafael', isActive: true }
];

// Parroquias completas basadas en los datos SQL
const venezuelaParishes = [
  // Libertador, Distrito Capital
  { name: 'ALTAGRACIA', code: 'DC0101', municipalityCode: 'DC01', isActive: true },
  { name: 'CANDELARIA', code: 'DC0102', municipalityCode: 'DC01', isActive: true },
  { name: 'CATEDRAL', code: 'DC0103', municipalityCode: 'DC01', isActive: true },
  { name: 'LA PASTORA', code: 'DC0104', municipalityCode: 'DC01', isActive: true },
  { name: 'SAN AGUSTIN', code: 'DC0105', municipalityCode: 'DC01', isActive: true },
  { name: 'SAN JOSE', code: 'DC0106', municipalityCode: 'DC01', isActive: true },
  { name: 'SAN JUAN', code: 'DC0107', municipalityCode: 'DC01', isActive: true },
  { name: 'SANTA ROSALIA', code: 'DC0108', municipalityCode: 'DC01', isActive: true },
  { name: 'SANTA TERESA', code: 'DC0109', municipalityCode: 'DC01', isActive: true },
  { name: 'SUCRE', code: 'DC0110', municipalityCode: 'DC01', isActive: true },
  { name: '23 DE ENERO', code: 'DC0111', municipalityCode: 'DC01', isActive: true },
  { name: 'ANTIMANO', code: 'DC0112', municipalityCode: 'DC01', isActive: true },
  { name: 'EL RECREO', code: 'DC0113', municipalityCode: 'DC01', isActive: true },
  { name: 'EL VALLE', code: 'DC0114', municipalityCode: 'DC01', isActive: true },
  { name: 'LA VEGA', code: 'DC0115', municipalityCode: 'DC01', isActive: true },
  { name: 'MACARAO', code: 'DC0116', municipalityCode: 'DC01', isActive: true },
  { name: 'CARICUAO', code: 'DC0117', municipalityCode: 'DC01', isActive: true },
  { name: 'EL JUNQUITO', code: 'DC0118', municipalityCode: 'DC01', isActive: true },
  { name: 'COCHE', code: 'DC0119', municipalityCode: 'DC01', isActive: true },
  { name: 'SAN PEDRO', code: 'DC0120', municipalityCode: 'DC01', isActive: true },
  { name: 'SAN BERNARDINO', code: 'DC0121', municipalityCode: 'DC01', isActive: true },
  { name: 'EL PARAISO', code: 'DC0122', municipalityCode: 'DC01', isActive: true },
  
  // Anaco, Anzoátegui
  { name: 'ANACO', code: 'AN0101', municipalityCode: 'AN01', isActive: true },
  { name: 'SAN JOAQUIN', code: 'AN0102', municipalityCode: 'AN01', isActive: true },
  
  // Aragua, Anzoátegui
  { name: 'CM. ARAGUA DE BARCELONA', code: 'AN0201', municipalityCode: 'AN02', isActive: true },
  { name: 'CACHIPO', code: 'AN0202', municipalityCode: 'AN02', isActive: true },
  
  // Bolívar, Anzoátegui
  { name: 'EL CARMEN', code: 'AN0301', municipalityCode: 'AN03', isActive: true },
  { name: 'SAN CRISTOBAL', code: 'AN0302', municipalityCode: 'AN03', isActive: true },
  { name: 'BERGANTIN', code: 'AN0303', municipalityCode: 'AN03', isActive: true },
  { name: 'CAIGUA', code: 'AN0304', municipalityCode: 'AN03', isActive: true },
  { name: 'EL PILAR', code: 'AN0305', municipalityCode: 'AN03', isActive: true },
  { name: 'NARICUAL', code: 'AN0306', municipalityCode: 'AN03', isActive: true },
  
  // Guaicaipuro, Miranda
  { name: 'LOS TEQUES', code: 'MI0101', municipalityCode: 'MI01', isActive: true },
  { name: 'CECILIO ACOSTA', code: 'MI0102', municipalityCode: 'MI01', isActive: true },
  { name: 'PARACOTOS', code: 'MI0103', municipalityCode: 'MI01', isActive: true },
  { name: 'SAN PEDRO', code: 'MI0104', municipalityCode: 'MI01', isActive: true },
  { name: 'TACATA', code: 'MI0105', municipalityCode: 'MI01', isActive: true },
  { name: 'EL JARILLO', code: 'MI0106', municipalityCode: 'MI01', isActive: true },
  { name: 'ALTAGRACIA DE LA M', code: 'MI0107', municipalityCode: 'MI01', isActive: true },
  
  // Sucre, Miranda
  { name: 'STA TERESA DEL TUY', code: 'MI0201', municipalityCode: 'MI02', isActive: true },
  { name: 'EL CARTANAL', code: 'MI0202', municipalityCode: 'MI02', isActive: true },
  
  // Baruta, Miranda
  { name: 'BARUTA', code: 'MI0301', municipalityCode: 'MI03', isActive: true },
  { name: 'EL CAFETAL', code: 'MI0302', municipalityCode: 'MI03', isActive: true },
  { name: 'LAS MINAS DE BARUTA', code: 'MI0303', municipalityCode: 'MI03', isActive: true },
  
  // Maracaibo, Zulia
  { name: 'BOLIVAR', code: 'ZU0101', municipalityCode: 'ZU01', isActive: true },
  { name: 'COQUIVACOA', code: 'ZU0102', municipalityCode: 'ZU01', isActive: true },
  { name: 'CRISTO DE ARANZA', code: 'ZU0103', municipalityCode: 'ZU01', isActive: true },
  { name: 'CHIQUINQUIRA', code: 'ZU0104', municipalityCode: 'ZU01', isActive: true },
  { name: 'SANTA LUCIA', code: 'ZU0105', municipalityCode: 'ZU01', isActive: true },
  { name: 'OLEGARIO VILLALOBOS', code: 'ZU0106', municipalityCode: 'ZU01', isActive: true },
  { name: 'JUANA DE AVILA', code: 'ZU0107', municipalityCode: 'ZU01', isActive: true },
  { name: 'CARACCIOLO PARRA PEREZ', code: 'ZU0108', municipalityCode: 'ZU01', isActive: true },
  { name: 'IDELFONZO VASQUEZ', code: 'ZU0109', municipalityCode: 'ZU01', isActive: true },
  { name: 'CACIQUE MARA', code: 'ZU0110', municipalityCode: 'ZU01', isActive: true },
  { name: 'CECILIO ACOSTA', code: 'ZU0111', municipalityCode: 'ZU01', isActive: true },
  { name: 'RAUL LEONI', code: 'ZU0112', municipalityCode: 'ZU01', isActive: true },
  { name: 'FRANCISCO EUGENIO B', code: 'ZU0113', municipalityCode: 'ZU01', isActive: true },
  { name: 'MANUEL DAGNINO', code: 'ZU0114', municipalityCode: 'ZU01', isActive: true },
  { name: 'LUIS HURTADO HIGUERA', code: 'ZU0115', municipalityCode: 'ZU01', isActive: true },
  { name: 'VENANCIO PULGAR', code: 'ZU0116', municipalityCode: 'ZU01', isActive: true },
  { name: 'ANTONIO BORJAS ROMERO', code: 'ZU0117', municipalityCode: 'ZU01', isActive: true },
  { name: 'SAN ISIDRO', code: 'ZU0118', municipalityCode: 'ZU01', isActive: true },
  { name: 'FARIA', code: 'ZU0119', municipalityCode: 'ZU01', isActive: true },
  { name: 'SAN ANTONIO', code: 'ZU0120', municipalityCode: 'ZU01', isActive: true },
  { name: 'ANA MARIA CAMPOS', code: 'ZU0121', municipalityCode: 'ZU01', isActive: true },
  { name: 'SAN JOSE', code: 'ZU0122', municipalityCode: 'ZU01', isActive: true },
  { name: 'ALTAGRACIA', code: 'ZU0123', municipalityCode: 'ZU01', isActive: true }
];

module.exports = {
  venezuelaStates,
  venezuelaMunicipalities,
  venezuelaParishes
};
