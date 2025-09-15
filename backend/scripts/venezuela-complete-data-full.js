// Datos completos de Venezuela - Estados, Municipios y Parroquias
// Basado en datos oficiales del INE Venezuela

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

// Municipios completos de Venezuela (muestra representativa de cada estado)
const venezuelaMunicipalities = [
  // Distrito Capital
  { name: 'LIBERTADOR', code: 'DC01', stateCode: 'DC', capital: 'Caracas', isActive: true },

  // Anzoátegui (21 municipios)
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
  { name: 'MC GREGOR', code: 'AN16', stateCode: 'AN', capital: 'El Chaparro', isActive: true },
  { name: 'PIRITU', code: 'AN17', stateCode: 'AN', capital: 'Píritu', isActive: true },
  { name: 'SAN JUAN DE CAPISTRANO', code: 'AN18', stateCode: 'AN', capital: 'Boca de Uchire', isActive: true },
  { name: 'SANTA ANA', code: 'AN19', stateCode: 'AN', capital: 'Santa Ana', isActive: true },
  { name: 'SIMON BOLIVAR', code: 'AN20', stateCode: 'AN', capital: 'Lechería', isActive: true },
  { name: 'DIEGO BAUTISTA URBANEJA', code: 'AN21', stateCode: 'AN', capital: 'Lechería', isActive: true },

  // Miranda (21 municipios)
  { name: 'ACEVEDO', code: 'MI01', stateCode: 'MI', capital: 'Caucagua', isActive: true },
  { name: 'ANDRES BELLO', code: 'MI02', stateCode: 'MI', capital: 'San José de Barlovento', isActive: true },
  { name: 'BARUTA', code: 'MI03', stateCode: 'MI', capital: 'Baruta', isActive: true },
  { name: 'BRION', code: 'MI04', stateCode: 'MI', capital: 'Higuerote', isActive: true },
  { name: 'BUROZ', code: 'MI05', stateCode: 'MI', capital: 'Mamporal', isActive: true },
  { name: 'CARRIZAL', code: 'MI06', stateCode: 'MI', capital: 'Carrizal', isActive: true },
  { name: 'CHACAO', code: 'MI07', stateCode: 'MI', capital: 'Chacao', isActive: true },
  { name: 'CRISTOBAL ROJAS', code: 'MI08', stateCode: 'MI', capital: 'Charallave', isActive: true },
  { name: 'EL HATILLO', code: 'MI09', stateCode: 'MI', capital: 'El Hatillo', isActive: true },
  { name: 'GUAICAIPURO', code: 'MI10', stateCode: 'MI', capital: 'Los Teques', isActive: true },
  { name: 'INDEPENDENCIA', code: 'MI11', stateCode: 'MI', capital: 'Santa Teresa del Tuy', isActive: true },
  { name: 'LANDER', code: 'MI12', stateCode: 'MI', capital: 'Ocumare del Tuy', isActive: true },
  { name: 'LOS SALIAS', code: 'MI13', stateCode: 'MI', capital: 'San Antonio de los Altos', isActive: true },
  { name: 'PAEZ', code: 'MI14', stateCode: 'MI', capital: 'Río Chico', isActive: true },
  { name: 'PAZ CASTILLO', code: 'MI15', stateCode: 'MI', capital: 'Santa Lucía', isActive: true },
  { name: 'PEDRO GUAL', code: 'MI16', stateCode: 'MI', capital: 'Cúpira', isActive: true },
  { name: 'PLAZA', code: 'MI17', stateCode: 'MI', capital: 'Guarenas', isActive: true },
  { name: 'SIMON BOLIVAR', code: 'MI18', stateCode: 'MI', capital: 'San Francisco de Yare', isActive: true },
  { name: 'SUCRE', code: 'MI19', stateCode: 'MI', capital: 'Petare', isActive: true },
  { name: 'URDANETA', code: 'MI20', stateCode: 'MI', capital: 'Cúa', isActive: true },
  { name: 'ZAMORA', code: 'MI21', stateCode: 'MI', capital: 'Guatire', isActive: true },

  // Zulia (21 municipios)
  { name: 'ALMIRANTE PADILLA', code: 'ZU01', stateCode: 'ZU', capital: 'El Mojón', isActive: true },
  { name: 'BARALT', code: 'ZU02', stateCode: 'ZU', capital: 'San Timoteo', isActive: true },
  { name: 'CABIMAS', code: 'ZU03', stateCode: 'ZU', capital: 'Cabimas', isActive: true },
  { name: 'CATATUMBO', code: 'ZU04', stateCode: 'ZU', capital: 'Encontrados', isActive: true },
  { name: 'COLON', code: 'ZU05', stateCode: 'ZU', capital: 'San Carlos del Zulia', isActive: true },
  { name: 'FRANCISCO JAVIER PULGAR', code: 'ZU06', stateCode: 'ZU', capital: 'El Rosario', isActive: true },
  { name: 'JESUS ENRIQUE LOSSADA', code: 'ZU07', stateCode: 'ZU', capital: 'La Concepción', isActive: true },
  { name: 'JESUS MARIA SEMPRUN', code: 'ZU08', stateCode: 'ZU', capital: 'Santa Bárbara', isActive: true },
  { name: 'LA CAÑADA DE URDANETA', code: 'ZU09', stateCode: 'ZU', capital: 'Concepción', isActive: true },
  { name: 'LAGUNILLAS', code: 'ZU10', stateCode: 'ZU', capital: 'Ciudad Ojeda', isActive: true },
  { name: 'MACHIQUES DE PERIJA', code: 'ZU11', stateCode: 'ZU', capital: 'Machiques', isActive: true },
  { name: 'MARA', code: 'ZU12', stateCode: 'ZU', capital: 'San Rafael del Moján', isActive: true },
  { name: 'MARACAIBO', code: 'ZU13', stateCode: 'ZU', capital: 'Maracaibo', isActive: true },
  { name: 'MIRANDA', code: 'ZU14', stateCode: 'ZU', capital: 'Los Puertos de Altagracia', isActive: true },
  { name: 'PAEZ', code: 'ZU15', stateCode: 'ZU', capital: 'Sinamaica', isActive: true },
  { name: 'ROSARIO DE PERIJA', code: 'ZU16', stateCode: 'ZU', capital: 'La Villa del Rosario', isActive: true },
  { name: 'SAN FRANCISCO', code: 'ZU17', stateCode: 'ZU', capital: 'San Francisco', isActive: true },
  { name: 'SANTA RITA', code: 'ZU18', stateCode: 'ZU', capital: 'Santa Rita', isActive: true },
  { name: 'SIMON BOLIVAR', code: 'ZU19', stateCode: 'ZU', capital: 'Tía Juana', isActive: true },
  { name: 'SUCRE', code: 'ZU20', stateCode: 'ZU', capital: 'Bobures', isActive: true },
  { name: 'VALMORE RODRIGUEZ', code: 'ZU21', stateCode: 'ZU', capital: 'Bachaquero', isActive: true },

  // Carabobo (14 municipios)
  { name: 'BEJUMA', code: 'CA01', stateCode: 'CA', capital: 'Bejuma', isActive: true },
  { name: 'CARLOS ARVELO', code: 'CA02', stateCode: 'CA', capital: 'Güigüe', isActive: true },
  { name: 'DIEGO IBARRA', code: 'CA03', stateCode: 'CA', capital: 'Mariara', isActive: true },
  { name: 'GUACARA', code: 'CA04', stateCode: 'CA', capital: 'Guacara', isActive: true },
  { name: 'JUAN JOSE MORA', code: 'CA05', stateCode: 'CA', capital: 'Morón', isActive: true },
  { name: 'LIBERTADOR', code: 'CA06', stateCode: 'CA', capital: 'Tocuyito', isActive: true },
  { name: 'LOS GUAYOS', code: 'CA07', stateCode: 'CA', capital: 'Los Guayos', isActive: true },
  { name: 'MIRANDA', code: 'CA08', stateCode: 'CA', capital: 'Miranda', isActive: true },
  { name: 'MONTALBÁN', code: 'CA09', stateCode: 'CA', capital: 'Montalbán', isActive: true },
  { name: 'NAGUANAGUA', code: 'CA10', stateCode: 'CA', capital: 'Naguanagua', isActive: true },
  { name: 'PUERTO CABELLO', code: 'CA11', stateCode: 'CA', capital: 'Puerto Cabello', isActive: true },
  { name: 'SAN DIEGO', code: 'CA12', stateCode: 'CA', capital: 'San Diego', isActive: true },
  { name: 'SAN JOAQUIN', code: 'CA13', stateCode: 'CA', capital: 'San Joaquín', isActive: true },
  { name: 'VALENCIA', code: 'CA14', stateCode: 'CA', capital: 'Valencia', isActive: true },

  // Aragua (18 municipios)
  { name: 'BOLIVAR', code: 'AR01', stateCode: 'AR', capital: 'San Mateo', isActive: true },
  { name: 'CAMATAGUA', code: 'AR02', stateCode: 'AR', capital: 'Camatagua', isActive: true },
  { name: 'FRANCISCO LINARES ALCANTARA', code: 'AR03', stateCode: 'AR', capital: 'Santa Rita', isActive: true },
  { name: 'GIRARDOT', code: 'AR04', stateCode: 'AR', capital: 'Maracay', isActive: true },
  { name: 'JOSE ANGEL LAMAS', code: 'AR05', stateCode: 'AR', capital: 'Santa Cruz', isActive: true },
  { name: 'JOSE FELIX RIBAS', code: 'AR06', stateCode: 'AR', capital: 'La Victoria', isActive: true },
  { name: 'JOSE RAFAEL REVENGA', code: 'AR07', stateCode: 'AR', capital: 'El Consejo', isActive: true },
  { name: 'LIBERTADOR', code: 'AR08', stateCode: 'AR', capital: 'Palo Negro', isActive: true },
  { name: 'MARIO BRICEÑO IRAGORRY', code: 'AR09', stateCode: 'AR', capital: 'El Limón', isActive: true },
  { name: 'OCUMARE DE LA COSTA DE ORO', code: 'AR10', stateCode: 'AR', capital: 'Ocumare de la Costa', isActive: true },
  { name: 'SAN CASIMIRO', code: 'AR11', stateCode: 'AR', capital: 'San Casimiro', isActive: true },
  { name: 'SAN SEBASTIAN', code: 'AR12', stateCode: 'AR', capital: 'San Sebastián', isActive: true },
  { name: 'SANTIAGO MARIÑO', code: 'AR13', stateCode: 'AR', capital: 'Turmero', isActive: true },
  { name: 'SANTOS MICHELENA', code: 'AR14', stateCode: 'AR', capital: 'Las Tejerías', isActive: true },
  { name: 'SUCRE', code: 'AR15', stateCode: 'AR', capital: 'Cagua', isActive: true },
  { name: 'TOVAR', code: 'AR16', stateCode: 'AR', capital: 'Colonia Tovar', isActive: true },
  { name: 'URDANETA', code: 'AR17', stateCode: 'AR', capital: 'Barbacoas', isActive: true },
  { name: 'ZAMORA', code: 'AR18', stateCode: 'AR', capital: 'Villa de Cura', isActive: true }
];

// Parroquias representativas (una muestra de cada municipio importante)
const venezuelaParishes = [
  // Libertador, Distrito Capital (22 parroquias)
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
  { name: 'ARAGUA DE BARCELONA', code: 'AN0201', municipalityCode: 'AN02', isActive: true },
  { name: 'CACHIPO', code: 'AN0202', municipalityCode: 'AN02', isActive: true },

  // Bolívar, Anzoátegui
  { name: 'EL CARMEN', code: 'AN0301', municipalityCode: 'AN03', isActive: true },
  { name: 'SAN CRISTOBAL', code: 'AN0302', municipalityCode: 'AN03', isActive: true },
  { name: 'BERGANTIN', code: 'AN0303', municipalityCode: 'AN03', isActive: true },
  { name: 'CAIGUA', code: 'AN0304', municipalityCode: 'AN03', isActive: true },
  { name: 'EL PILAR', code: 'AN0305', municipalityCode: 'AN03', isActive: true },
  { name: 'NARICUAL', code: 'AN0306', municipalityCode: 'AN03', isActive: true },

  // Bruzual, Anzoátegui
  { name: 'CLARINES', code: 'AN0401', municipalityCode: 'AN04', isActive: true },
  { name: 'GUANAPE', code: 'AN0402', municipalityCode: 'AN04', isActive: true },
  { name: 'SABANA DE UCHIRE', code: 'AN0403', municipalityCode: 'AN04', isActive: true },

  // Cajigal, Anzoátegui
  { name: 'ONOTO', code: 'AN0501', municipalityCode: 'AN05', isActive: true },
  { name: 'SAN PABLO', code: 'AN0502', municipalityCode: 'AN05', isActive: true },

  // Freites, Anzoátegui
  { name: 'CANTAURA', code: 'AN0601', municipalityCode: 'AN06', isActive: true },
  { name: 'LIBERTADOR', code: 'AN0602', municipalityCode: 'AN06', isActive: true },
  { name: 'SANTA ROSA', code: 'AN0603', municipalityCode: 'AN06', isActive: true },
  { name: 'URICA', code: 'AN0604', municipalityCode: 'AN06', isActive: true },

  // Independencia, Anzoátegui
  { name: 'SOLEDAD', code: 'AN0701', municipalityCode: 'AN07', isActive: true },
  { name: 'MAMO', code: 'AN0702', municipalityCode: 'AN07', isActive: true },

  // Simon Rodriguez, Anzoátegui
  { name: 'EL TIGRE', code: 'AN1201', municipalityCode: 'AN12', isActive: true },
  { name: 'EDMUNDO BARRIOS', code: 'AN1202', municipalityCode: 'AN12', isActive: true },
  { name: 'MIGUEL OTERO SILVA', code: 'AN1203', municipalityCode: 'AN12', isActive: true },

  // Sotillo, Anzoátegui
  { name: 'PUERTO LA CRUZ', code: 'AN1301', municipalityCode: 'AN13', isActive: true },
  { name: 'POZUELOS', code: 'AN1302', municipalityCode: 'AN13', isActive: true },

  // Guaicaipuro, Miranda
  { name: 'LOS TEQUES', code: 'MI1001', municipalityCode: 'MI10', isActive: true },
  { name: 'CECILIO ACOSTA', code: 'MI1002', municipalityCode: 'MI10', isActive: true },
  { name: 'PARACOTOS', code: 'MI1003', municipalityCode: 'MI10', isActive: true },
  { name: 'SAN PEDRO', code: 'MI1004', municipalityCode: 'MI10', isActive: true },
  { name: 'TACATA', code: 'MI1005', municipalityCode: 'MI10', isActive: true },
  { name: 'EL JARILLO', code: 'MI1006', municipalityCode: 'MI10', isActive: true },
  { name: 'ALTAGRACIA DE LA MONTAÑA', code: 'MI1007', municipalityCode: 'MI10', isActive: true },

  // Sucre, Miranda
  { name: 'PETARE', code: 'MI1901', municipalityCode: 'MI19', isActive: true },
  { name: 'LEONCIO MARTINEZ', code: 'MI1902', municipalityCode: 'MI19', isActive: true },
  { name: 'CAUCAGUITA', code: 'MI1903', municipalityCode: 'MI19', isActive: true },
  { name: 'FILAS DE MARICHE', code: 'MI1904', municipalityCode: 'MI19', isActive: true },
  { name: 'LA DOLORITA', code: 'MI1905', municipalityCode: 'MI19', isActive: true },

  // Baruta, Miranda
  { name: 'BARUTA', code: 'MI0301', municipalityCode: 'MI03', isActive: true },
  { name: 'EL CAFETAL', code: 'MI0302', municipalityCode: 'MI03', isActive: true },
  { name: 'LAS MINAS DE BARUTA', code: 'MI0303', municipalityCode: 'MI03', isActive: true },

  // Chacao, Miranda
  { name: 'CHACAO', code: 'MI0701', municipalityCode: 'MI07', isActive: true },

  // El Hatillo, Miranda
  { name: 'EL HATILLO', code: 'MI0901', municipalityCode: 'MI09', isActive: true },

  // Maracaibo, Zulia
  { name: 'BOLIVAR', code: 'ZU1301', municipalityCode: 'ZU13', isActive: true },
  { name: 'COQUIVACOA', code: 'ZU1302', municipalityCode: 'ZU13', isActive: true },
  { name: 'CRISTO DE ARANZA', code: 'ZU1303', municipalityCode: 'ZU13', isActive: true },
  { name: 'CHIQUINQUIRA', code: 'ZU1304', municipalityCode: 'ZU13', isActive: true },
  { name: 'SANTA LUCIA', code: 'ZU1305', municipalityCode: 'ZU13', isActive: true },
  { name: 'OLEGARIO VILLALOBOS', code: 'ZU1306', municipalityCode: 'ZU13', isActive: true },
  { name: 'JUANA DE AVILA', code: 'ZU1307', municipalityCode: 'ZU13', isActive: true },
  { name: 'CARACCIOLO PARRA PEREZ', code: 'ZU1308', municipalityCode: 'ZU13', isActive: true },
  { name: 'IDELFONSO VASQUEZ', code: 'ZU1309', municipalityCode: 'ZU13', isActive: true },
  { name: 'CACIQUE MARA', code: 'ZU1310', municipalityCode: 'ZU13', isActive: true },
  { name: 'CECILIO ACOSTA', code: 'ZU1311', municipalityCode: 'ZU13', isActive: true },
  { name: 'RAUL LEONI', code: 'ZU1312', municipalityCode: 'ZU13', isActive: true },
  { name: 'FRANCISCO EUGENIO BUSTAMANTE', code: 'ZU1313', municipalityCode: 'ZU13', isActive: true },
  { name: 'MANUEL DAGNINO', code: 'ZU1314', municipalityCode: 'ZU13', isActive: true },
  { name: 'LUIS HURTADO HIGUERA', code: 'ZU1315', municipalityCode: 'ZU13', isActive: true },
  { name: 'VENANCIO PULGAR', code: 'ZU1316', municipalityCode: 'ZU13', isActive: true },
  { name: 'ANTONIO BORJAS ROMERO', code: 'ZU1317', municipalityCode: 'ZU13', isActive: true },
  { name: 'SAN ISIDRO', code: 'ZU1318', municipalityCode: 'ZU13', isActive: true },

  // San Francisco, Zulia
  { name: 'SAN FRANCISCO', code: 'ZU1701', municipalityCode: 'ZU17', isActive: true },
  { name: 'EL BAJO', code: 'ZU1702', municipalityCode: 'ZU17', isActive: true },
  { name: 'DOMITILA FLORES', code: 'ZU1703', municipalityCode: 'ZU17', isActive: true },
  { name: 'FRANCISCO OCHOA', code: 'ZU1704', municipalityCode: 'ZU17', isActive: true },
  { name: 'LOS CORTIJOS', code: 'ZU1705', municipalityCode: 'ZU17', isActive: true },
  { name: 'MARCIANO PARRA LEON', code: 'ZU1706', municipalityCode: 'ZU17', isActive: true },

  // Valencia, Carabobo
  { name: 'CATEDRAL', code: 'CA1401', municipalityCode: 'CA14', isActive: true },
  { name: 'EL SOCORRO', code: 'CA1402', municipalityCode: 'CA14', isActive: true },
  { name: 'MIGUEL PEÑA', code: 'CA1403', municipalityCode: 'CA14', isActive: true },
  { name: 'RAFAEL URDANETA', code: 'CA1404', municipalityCode: 'CA14', isActive: true },
  { name: 'SAN BLAS', code: 'CA1405', municipalityCode: 'CA14', isActive: true },
  { name: 'SAN JOSE', code: 'CA1406', municipalityCode: 'CA14', isActive: true },
  { name: 'SANTA ROSA', code: 'CA1407', municipalityCode: 'CA14', isActive: true },
  { name: 'NEGRO PRIMERO', code: 'CA1408', municipalityCode: 'CA14', isActive: true },

  // Girardot, Aragua
  { name: 'MARACAY', code: 'AR0401', municipalityCode: 'AR04', isActive: true },
  { name: 'ANDRÉS ELOY BLANCO', code: 'AR0402', municipalityCode: 'AR04', isActive: true },
  { name: 'LOS TACARIGUA', code: 'AR0403', municipalityCode: 'AR04', isActive: true },
  { name: 'LAS DELICIAS', code: 'AR0404', municipalityCode: 'AR04', isActive: true },
  { name: 'JOAQUIN CRESPO', code: 'AR0405', municipalityCode: 'AR04', isActive: true },
  { name: 'PEDRO JOSE OVALLES', code: 'AR0406', municipalityCode: 'AR04', isActive: true },
  { name: 'JOSE CASANOVA GODOY', code: 'AR0407', municipalityCode: 'AR04', isActive: true },
  { name: 'MADRE MARIA DE SAN JOSE', code: 'AR0408', municipalityCode: 'AR04', isActive: true },
  { name: 'JOSE VICENTE DE UNDA', code: 'AR0409', municipalityCode: 'AR04', isActive: true },
  { name: 'CHORONÍ', code: 'AR0410', municipalityCode: 'AR04', isActive: true }
];

module.exports = {
  venezuelaStates,
  venezuelaMunicipalities,
  venezuelaParishes
};