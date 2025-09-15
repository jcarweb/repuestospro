// Marcas por tipo de vehículo - Específicas para Venezuela
export const vehicleBrands = {
  automovil: [
    // Marcas populares en Venezuela
    'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes', 'Audi', 
    'Volkswagen', 'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Mitsubishi', 'Lexus',
    'Peugeot', 'Renault', 'Fiat', 'Seat', 'Skoda', 'Volvo', 'Jaguar', 'Land Rover',
    'Datsun', 'Dongfeng', 'JAC Motors'
  ],
  motocicleta: [
    // Marcas específicas de Venezuela
    'Bera', 'Empire Keeway', 'Suzuki', 'Yamaha', 'Kawasaki', 'Toro', 'MD', 'Skygo', 
    'AVA', 'Haojue', 'Vefase', 'Ducati', 'Benelli', 'TVS',
    // Marcas adicionales populares
    'Honda', 'Bajaj', 'Zontes', 'CFMoto', 'KTM', 'Aprilia', 'Harley-Davidson', 'Triumph'
  ],
  camion: [
    // Marcas de camiones populares en Venezuela
    'Foton', 'Mack', 'Volvo', 'Iveco', 'Ford', 'Chevrolet', 'Dongfeng', 'Dina', 
    'JAC Motors', 'Mitsubishi Fuso', 'Datsun', 'Mercedes-Benz', 'Scania', 'MAN', 
    'Freightliner', 'Kenworth', 'International', 'Caterpillar'
  ],
  maquinaria_agricola: [
    // Marcas de maquinaria agrícola en Venezuela
    'John Deere', 'New Holland', 'Massey Ferguson', 'Fendt', 'Kubota', 'Deutz-Fahr', 
    'Case IH', 'Claas', 'JCB', 'Iseki',
    // Marcas adicionales
    'Valtra', 'Landini', 'McCormick', 'Same', 'Lamborghini', 'Antonio Carraro', 
    'Goldoni', 'Arbos', 'Solis', 'Mahindra', 'Tafe'
  ],
  maquinaria_industrial: [
    // Marcas de maquinaria industrial en Venezuela
    'Foton', 'Mack', 'Volvo', 'Dina', 'Iveco', 'Dongfeng', 'JAC', 'Hino', 'Isuzu', 
    'Maxus', 'Mercedes-Benz', 'Scania', 'MAN', 'Freightliner', 'Kenworth', 
    'International', 'Caterpillar', 'Chevrolet',
    // Maquinaria pesada adicional
    'Cat', 'Komatsu', 'XCMG', 'John Deere', 'Sany', 'Volvo CE', 'Liebherr', 
    'Hitachi', 'Doosan', 'Hyundai', 'JCB', 'Bobcat', 'Case',
    // Equipos de corte y soldadura
    'Miller', 'Hypertherm', 'ESAB', 'Lincoln Electric', 'Fronius', 'Kemppi',
    // Marcas locales venezolanas
    'Agrometal', 'Bombagua', 'Induveca', 'INVEVAL', 'Metalúrgica Venezolana',
    'Industrias Venoco', 'Maquinarias del Sur', 'Equipos Industriales CA'
  ]
};

// Función para obtener marcas por tipo de vehículo
export const getBrandsByVehicleType = (vehicleType: string): string[] => {
  return vehicleBrands[vehicleType as keyof typeof vehicleBrands] || vehicleBrands.automovil;
};

// Función para obtener todas las marcas únicas
export const getAllBrands = (): string[] => {
  const allBrands = new Set<string>();
  Object.values(vehicleBrands).forEach(brands => {
    brands.forEach(brand => allBrands.add(brand));
  });
  return Array.from(allBrands).sort();
};
