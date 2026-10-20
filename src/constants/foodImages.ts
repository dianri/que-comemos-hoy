export interface FoodImageItem {
  id: string;
  name: string;
  url: string;
  tags: string[];
}

export const FOOD_IMAGES_CATALOG: FoodImageItem[] = [
  // =========================================================================
  // 1. ARROCES Y FIDEUÁS TRADICIONALES
  // =========================================================================
  {
    id: 'paella-valenciana',
    name: 'Paella Valenciana Tradicional',
    url: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=800&q=80',
    tags: ['paella valenciana', 'paella', 'arroz', 'arroces', 'pollo', 'conejo', 'bajoqueta', 'garrofo', 'valencia', 'tradicional'],
  },
  {
    id: 'arroz-a-banda',
    name: 'Arroz a Banda',
    url: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=800&q=80',
    tags: ['arroz a banda', 'arroz', 'arroces', 'pescado', 'pescados', 'alioli', 'marisco', 'salmorreta', 'alicante', 'tradicional'],
  },
  {
    id: 'arroz-negro',
    name: 'Arroz Negro con Sepia y Alioli',
    url: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80',
    tags: ['arroz negro', 'arroz', 'arroces', 'tinta', 'sepia', 'calamar', 'alioli', 'pescados', 'mediterraneo', 'tradicional'],
  },
  {
    id: 'arroz-bogavante',
    name: 'Arroz Caldoso con Bogavante',
    url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
    tags: ['arroz con bogavante', 'bogavante', 'arroz caldoso', 'arroz', 'arroces', 'marisco', 'pescados', 'cuchara', 'fiesta', 'tradicional'],
  },
  {
    id: 'fideua-marisco',
    name: 'Fideuà de Marisco y Gambas',
    url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    tags: ['fideua de marisco', 'fideua', 'fideuà', 'marisco', 'gambas', 'cigalas', 'fideos', 'pescados', 'arroces', 'alioli', 'gandia', 'tradicional'],
  },
  {
    id: 'arroz-caldoso-marinero',
    name: 'Arroz Caldoso Marinero',
    url: 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?auto=format&fit=crop&w=800&q=80',
    tags: ['arroz caldoso', 'marinero', 'arroz', 'arroces', 'pescados', 'marisco', 'cazuela', 'cuchara', 'tradicional'],
  },
  {
    id: 'arroz-al-horno',
    name: 'Arroz al Horno Tradicional (Cassola)',
    url: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=800&q=80',
    tags: ['arroz al horno', 'arroz', 'arroces', 'costillas', 'morcilla', 'garbanzos', 'patata', 'tomate', 'valenciano', 'carnes', 'horno', 'tradicional'],
  },
  {
    id: 'arroz-con-costra',
    name: 'Arroz con Costra',
    url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
    tags: ['arroz con costra', 'arroz', 'arroces', 'huevo batido', 'embutido', 'blanquito', 'elche', 'horno', 'carnes', 'tradicional'],
  },
  {
    id: 'paella-mixta',
    name: 'Paella Mixta de Carne y Marisco',
    url: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=800&q=80',
    tags: ['paella mixta', 'paella', 'arroz', 'arroces', 'pollo', 'gambas', 'mejillones', 'marisco', 'carnes', 'tradicional'],
  },
  {
    id: 'arroz-con-secreto',
    name: 'Arroz con Secreto Ibérico y Setas',
    url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
    tags: ['arroz con secreto', 'arroz', 'arroces', 'secreto', 'iberico', 'setas', 'boletus', 'paella', 'carnes', 'tradicional'],
  },
  {
    id: 'arroz-a-la-cubana',
    name: 'Arroz a la Cubana con Huevo y Plátano',
    url: 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?auto=format&fit=crop&w=800&q=80',
    tags: ['arroz a la cubana', 'arroz', 'arroces', 'huevo frito', 'tomate frito', 'platano', 'tradicional'],
  },

  // =========================================================================
  // 2. TAPAS, RACIONES Y APERITIVOS IBÉRICOS
  // =========================================================================
  {
    id: 'tortilla-patatas',
    name: 'Tortilla de Patatas Española',
    url: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=800&q=80',
    tags: ['tortilla de patatas', 'tortilla española', 'tortilla', 'patatas', 'huevo', 'cebolla', 'tapas', 'pincho', 'tradicional'],
  },
  {
    id: 'patatas-bravas',
    name: 'Patatas Bravas Crujientes',
    url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80',
    tags: ['patatas bravas', 'patatas', 'bravas', 'salsa picante', 'alioli', 'papas', 'tapas', 'aperitivo', 'tradicional'],
  },
  {
    id: 'croquetas-jamon-iberico',
    name: 'Croquetas de Jamón Ibérico',
    url: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80',
    tags: ['croquetas de jamon', 'croquetas', 'jamon iberico', 'bechamel', 'crujiente', 'tapas', 'carnes', 'tradicional'],
  },
  {
    id: 'croquetas-bacalao',
    name: 'Croquetas Caseras de Bacalao',
    url: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80',
    tags: ['croquetas de bacalao', 'croquetas', 'bacalao', 'bechamel', 'pescados', 'tapas', 'aperitivo', 'tradicional'],
  },
  {
    id: 'chopitos-fritos',
    name: 'Chopitos Fritos / Puntillitas',
    url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
    tags: ['chopitos', 'puntillitas', 'calamares', 'fritura', 'limon', 'pescados', 'tapas', 'andaluz', 'tradicional'],
  },
  {
    id: 'calamares-romana',
    name: 'Calamares a la Romana / Rabas',
    url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80',
    tags: ['calamares a la romana', 'calamares', 'rabas', 'rebozado', 'anillas', 'pescados', 'tapas', 'bocadillo', 'tradicional'],
  },
  {
    id: 'pulpo-a-la-gallega',
    name: 'Pulpo a la Gallega / Pulpo á Feira',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    tags: ['pulpo a la gallega', 'pulpo a feira', 'pulpo', 'pimenton de la vera', 'patatas', 'galicia', 'pescados', 'tapas', 'tradicional'],
  },
  {
    id: 'gambas-al-ajillo',
    name: 'Gambas al Ajillo en Cazuela de Barro',
    url: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80',
    tags: ['gambas al ajillo', 'gambas', 'ajo', 'guindilla', 'aceite de oliva', 'marisco', 'pescados', 'tapas', 'cazuela', 'tradicional'],
  },
  {
    id: 'pimientos-de-padron',
    name: 'Pimientos de Padrón Fritos',
    url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    tags: ['pimientos de padron', 'pimientos', 'padron', 'unos pican y otros no', 'galicia', 'sal gorda', 'tapas', 'saludable', 'tradicional'],
  },
  {
    id: 'revuelto-ajetes-gambas',
    name: 'Revuelto de Ajetes Tiernos y Gambas',
    url: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=800&q=80',
    tags: ['revuelto de ajetes', 'revuelto', 'ajetes', 'gambas', 'huevo', 'esparragos trigueros', 'tapas', 'saludable', 'tradicional'],
  },
  {
    id: 'huevos-rotos-jamon',
    name: 'Huevos Rotos con Jamón Ibérico',
    url: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=800&q=80',
    tags: ['huevos rotos', 'huevos estrellados', 'jamon iberico', 'patatas fritas', 'huevo frito', 'tapas', 'carnes', 'lucio', 'tradicional'],
  },
  {
    id: 'torreznos-soria',
    name: 'Torreznos de Soria Crujientes',
    url: 'https://images.unsplash.com/photo-1625938144755-652e08e359b7?auto=format&fit=crop&w=800&q=80',
    tags: ['torreznos de soria', 'torreznos', 'panceta', 'cerdo', 'corteza crujiente', 'carnes', 'tapas', 'soria', 'tradicional'],
  },
  {
    id: 'empanada-gallega',
    name: 'Empanada Gallega de Atún y Pimientos',
    url: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=800&q=80',
    tags: ['empanada gallega', 'empanada', 'atun', 'bonito', 'pimientos', 'cebolla', 'tomate', 'pescados', 'tapas', 'galicia', 'tradicional'],
  },
  {
    id: 'boquerones-fritos',
    name: 'Boquerones Fritos al Limón (Pescaíto)',
    url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
    tags: ['boquerones fritos', 'pescaito frito', 'boquerones', 'pescado', 'pescados', 'limon', 'tapas', 'andaluz', 'malaga', 'tradicional'],
  },
  {
    id: 'jamon-iberico-pan-tomaca',
    name: 'Jamón Ibérico de Bellota con Pa amb Tomàquet',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    tags: ['jamon iberico', 'pan tumaca', 'pa amb tomaquet', 'jamon de bellota', 'embutido', 'tapas', 'carnes', 'aperitivo', 'tradicional'],
  },
  {
    id: 'salpicon-marisco',
    name: 'Salpicón de Marisco y Pulpo',
    url: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&w=800&q=80',
    tags: ['salpicon de marisco', 'salpicon', 'pulpo', 'langostinos', 'mejillones', 'vinagreta', 'pescados', 'tapas', 'saludable', 'verano', 'tradicional'],
  },
  {
    id: 'tabla-quesos-espanoles',
    name: 'Tabla de Quesos Españoles con Nueces',
    url: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=800&q=80',
    tags: ['tabla de quesos', 'queso manchego', 'cabrales', 'idiazabal', 'tapas', 'aperitivo', 'tradicional'],
  },
  {
    id: 'tosta-gulas-ajo',
    name: 'Tosta de Gulas al Ajillo con Gambas',
    url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
    tags: ['tosta de gulas', 'gulas', 'ajillo', 'gambas', 'pintxo', 'tapas', 'pescados', 'aperitivo', 'tradicional'],
  },
  {
    id: 'patatas-a-lo-pobre',
    name: 'Patatas a lo Pobre con Pimientos',
    url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80',
    tags: ['patatas a lo pobre', 'patatas', 'papas', 'pimientos', 'cebolla', 'tapas', 'guarnicion', 'andaluz', 'tradicional'],
  },
  {
    id: 'flamenquines',
    name: 'Flamenquines Cordobeses',
    url: 'https://images.unsplash.com/photo-1625938144755-652e08e359b7?auto=format&fit=crop&w=800&q=80',
    tags: ['flamenquines', 'cordoba', 'lomo', 'jamon', 'empanado', 'carne', 'carnes', 'frito', 'tapas', 'tradicional'],
  },
  {
    id: 'sanjacobos',
    name: 'Sanjacobos Caseros Crujientes',
    url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80',
    tags: ['sanjacobos', 'jamon', 'queso fundido', 'empanado', 'carne', 'carnes', 'frito', 'tapas', 'tradicional'],
  },
  {
    id: 'ensaladilla-rusa',
    name: 'Ensaladilla Rusa Tradicional con Atún',
    url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    tags: ['ensaladilla rusa', 'ensaladilla', 'patata', 'atun', 'mayonesa', 'guisantes', 'tapas', 'tradicional', 'frio'],
  },
  {
    id: 'ensaladilla-de-mariscos',
    name: 'Ensaladilla de Mariscos y Langostinos',
    url: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&w=800&q=80',
    tags: ['ensaladilla de mariscos', 'ensaladilla', 'marisco', 'langostinos', 'gambas', 'patata', 'pescados', 'tapas', 'tradicional'],
  },
  {
    id: 'champinones-a-la-plancha',
    name: 'Champiñones al Ajillo a la Plancha',
    url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    tags: ['champinones a la plancha', 'champiñones', 'setas', 'ajo', 'perejil', 'plancha', 'saludable', 'tapas', 'tradicional'],
  },
  {
    id: 'gambas-a-la-plancha',
    name: 'Gambas Rojas a la Plancha con Sal Gorda',
    url: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80',
    tags: ['gambas a la plancha', 'gambas rojas', 'marisco', 'pescados', 'plancha', 'sal gorda', 'limon', 'tapas', 'tradicional'],
  },

  // =========================================================================
  // 3. PLATOS DE CUCHARA, GUISOS Y SOPAS TRADICIONALES
  // =========================================================================
  {
    id: 'cocido-madrileno',
    name: 'Cocido Madrileño Completo en Tres Vuelcos',
    url: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
    tags: ['cocido madrileño', 'cocido', 'garbanzos', 'sopa de fideos', 'morcillo', 'chorizo', 'tocino', 'repollo', 'sopa', 'sopas', 'cuchara', 'carnes', 'madrid', 'tradicional'],
  },
  {
    id: 'fabada-asturiana',
    name: 'Fabada Asturiana con Compango',
    url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
    tags: ['fabada asturiana', 'fabada', 'fabes', 'compango', 'chorizo asturiano', 'morcilla', 'panceta', 'asturias', 'cuchara', 'guiso', 'sopas', 'tradicional'],
  },
  {
    id: 'lentejas-chorizo',
    name: 'Lentejas Caseras de la Abuela con Chorizo',
    url: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
    tags: ['lentejas con chorizo', 'lentejas', 'guiso', 'chorizo', 'morcilla', 'legumbres', 'cuchara', 'estofado', 'sopas', 'abuela', 'tradicional'],
  },
  {
    id: 'marmitako-atun',
    name: 'Marmitako de Atún del Cantábrico',
    url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    tags: ['marmitako', 'bonito del norte', 'atun', 'patatas', 'pimiento choricero', 'guiso marinero', 'pescados', 'sopas', 'pais vasco', 'tradicional'],
  },
  {
    id: 'gazpacho-andaluz-tradicional',
    name: 'Gazpacho Andaluz Tradicional',
    url: 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=800&q=80',
    tags: ['gazpacho andaluz', 'gazpacho', 'tomate', 'pepino', 'pimiento', 'sopa fria', 'sopas', 'saludable', 'verano', 'andalucia', 'tradicional'],
  },
  {
    id: 'salmorejo-cordobes-jamon',
    name: 'Salmorejo Cordobés con Jamón y Huevo Duro',
    url: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80',
    tags: ['salmorejo cordobes', 'salmorejo', 'tomate', 'aceite de oliva', 'jamon', 'huevo duro', 'sopa fria', 'sopas', 'cuchara', 'andalucia', 'tradicional'],
  },
  {
    id: 'judias-con-almejas',
    name: 'Judías Blancas con Almejas',
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    tags: ['judias con almejas', 'alubias', 'almejas', 'legumbres', 'guiso', 'marisco', 'pescados', 'sopas', 'cuchara', 'tradicional'],
  },
  {
    id: 'patatas-a-la-riojana',
    name: 'Patatas a la Riojana con Chorizo',
    url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80',
    tags: ['patatas a la riojana', 'patatas riojana', 'chorizo', 'pimenton', 'patatas', 'guiso', 'cuchara', 'sopas', 'la rioja', 'tradicional'],
  },
  {
    id: 'pisto-manchego',
    name: 'Pisto Manchego con Huevo Frito',
    url: 'https://images.unsplash.com/photo-1572449043416-55f4685c9bb7?auto=format&fit=crop&w=800&q=80',
    tags: ['pisto manchego', 'pisto', 'verduras', 'huevo frito', 'tomate', 'calabacin', 'pimientos', 'saludable', 'sopas', 'la mancha', 'tradicional'],
  },
  {
    id: 'callos-a-la-madrilena',
    name: 'Callos a la Madrileña Tradicionales',
    url: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=800&q=80',
    tags: ['callos a la madrileña', 'callos', 'casqueria', 'chorizo', 'morcilla', 'pata', 'morro', 'picante', 'carnes', 'guiso', 'madrid', 'tradicional'],
  },
  {
    id: 'garbanzos-con-espinacas',
    name: 'Garbanzos con Espinacas a la Andaluza',
    url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    tags: ['garbanzos con espinacas', 'garbanzos', 'espinacas', 'legumbres', 'comino', 'pimenton', 'sevilla', 'saludable', 'sopas', 'cuchara', 'tradicional'],
  },
  {
    id: 'crema-calabaza-asada',
    name: 'Crema de Calabaza y Verduras de Temporada',
    url: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=800&q=80',
    tags: ['crema de calabaza', 'calabaza', 'puré', 'sopa', 'sopas', 'saludable', 'ligero', 'cuchara', 'verduras', 'tradicional'],
  },
  {
    id: 'caldo-de-pollo',
    name: 'Caldo de Pollo Casero con Fideos',
    url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
    tags: ['caldo de pollo', 'caldo', 'sopa', 'sopas', 'pollo', 'fideos', 'consome', 'reconfortante', 'invierno', 'tradicional'],
  },
  {
    id: 'sopa-de-mariscos',
    name: 'Sopa de Marisco y Pescado de Roca',
    url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    tags: ['sopa de mariscos', 'sopa', 'sopas', 'marisco', 'gambas', 'mejillones', 'fumet', 'pescados', 'caldo', 'navidad', 'tradicional'],
  },

  // =========================================================================
  // 4. CARNES, ASADOS Y GUISOS IBÉRICOS
  // =========================================================================
  {
    id: 'cachopo-asturiano',
    name: 'Cachopo Asturiano de Ternera y Jamón',
    url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80',
    tags: ['cachopo asturiano', 'cachopo', 'ternera', 'jamon iberico', 'queso fundido', 'empanado', 'patatas', 'carnes', 'asturias', 'tradicional'],
  },
  {
    id: 'rabo-de-toro',
    name: 'Rabo de Toro Estofado al Vino Tinto',
    url: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=800&q=80',
    tags: ['rabo de toro', 'estofado', 'vino tinto', 'carne melosa', 'cordoba', 'carnes', 'guiso', 'tradicional'],
  },
  {
    id: 'cordero-lechal-asado',
    name: 'Cordero Lechal Asado al Horno de Leña',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    tags: ['cordero asado', 'lechal', 'lechazo', 'castilla y leon', 'horno de leña', 'carnes', 'asado', 'fiesta', 'tradicional'],
  },
  {
    id: 'cochinillo-asado',
    name: 'Cochinillo Asado al Estilo Segoviano',
    url: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=800&q=80',
    tags: ['cochinillo asado', 'cochinillo', 'segovia', 'piel crujiente', 'cerdo', 'horno', 'carnes', 'asado', 'tradicional'],
  },
  {
    id: 'pollo-al-ajillo',
    name: 'Pollo al Ajillo Tradicional',
    url: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=80',
    tags: ['pollo al ajillo', 'pollo', 'ajo', 'vino blanco', 'romero', 'sarten', 'carnes', 'facil', 'abuela', 'tradicional'],
  },
  {
    id: 'albondigas-salsa-espanola',
    name: 'Albóndigas Caseras en Salsa Española',
    url: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=800&q=80',
    tags: ['albondigas en salsa', 'albondigas', 'carne picada', 'guisantes', 'salsa española', 'carnes', 'guiso', 'abuela', 'tradicional'],
  },
  {
    id: 'chuleton-a-la-brasa',
    name: 'Chuletón de Vaca Vieja a la Brasa',
    url: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80',
    tags: ['chuleton a la brasa', 'chuleton', 'vaca vieja', 'madurada', 'brasa', 'parrilla', 'sal gorda', 'carnes', 'tradicional'],
  },
  {
    id: 'lomo-de-orza',
    name: 'Lomo de Orza en Aceite de Oliva',
    url: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=800&q=80',
    tags: ['lomo de orza', 'lomo', 'cerdo', 'adobo', 'orza', 'conserva', 'carnes', 'tapas', 'castilla la mancha', 'tradicional'],
  },
  {
    id: 'oreja-a-la-plancha',
    name: 'Oreja a la Plancha con Salsa Brava',
    url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    tags: ['oreja a la plancha', 'oreja', 'casqueria', 'adobo', 'plancha', 'tapas', 'carnes', 'madrid', 'tradicional'],
  },
  {
    id: 'carrilleras-vino-tinto',
    name: 'Carrilleras de Ternera al Vino Tinto',
    url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    tags: ['carrilleras', 'carrillada', 'ternera', 'vino tinto', 'estofado', 'puré de patatas', 'carnes', 'guiso', 'tradicional'],
  },
  {
    id: 'costillas-ibericas-miel',
    name: 'Costillas de Cerdo Ibérico Asadas',
    url: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=800&q=80',
    tags: ['costillas asadas', 'costillas ibericas', 'cerdo ibérico', 'barbacoa', 'horno', 'carnes', 'asado', 'tradicional'],
  },
  {
    id: 'solomillo-pedro-ximenez',
    name: 'Solomillo de Cerdo al Pedro Ximénez',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    tags: ['solomillo pedro ximenez', 'solomillo', 'cerdo', 'vino dulce', 'pasas', 'salsa reducida', 'carnes', 'tradicional'],
  },
  {
    id: 'lacon-con-grelos',
    name: 'Lacón con Grelos y Cachelos',
    url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
    tags: ['lacon con grelos', 'lacon', 'grelos', 'chorizo', 'cachelos', 'patatas', 'galicia', 'carnes', 'tradicional'],
  },
  {
    id: 'pollo-asado',
    name: 'Pollo Asado al Horno con Patatas',
    url: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=80',
    tags: ['pollo asado', 'pollo', 'asado', 'horno', 'patatas', 'carne', 'carnes', 'domingo', 'tradicional'],
  },
  {
    id: 'magra-en-salsa',
    name: 'Magra de Cerdo con Tomate',
    url: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=800&q=80',
    tags: ['magra en salsa', 'magra con tomate', 'cerdo', 'carne', 'carnes', 'tomate frito', 'estofado', 'tradicional', 'tapa'],
  },
  {
    id: 'secreto-a-la-plancha',
    name: 'Secreto Ibérico a la Plancha con Sal Maldón',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    tags: ['secreto a la plancha', 'secreto', 'iberico', 'carne', 'carnes', 'cerdo', 'plancha', 'brasa', 'tradicional'],
  },
  {
    id: 'chuletas-cabeza-lomo',
    name: 'Chuletas de Cerdo a la Plancha',
    url: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=800&q=80',
    tags: ['chuletas de cabeza de lomo', 'chuletas', 'lomo', 'cerdo', 'carne', 'carnes', 'plancha', 'tradicional'],
  },
  {
    id: 'pechugas-de-pollo',
    name: 'Pechugas de Pollo a la Plancha',
    url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80',
    tags: ['pechugas de pollo', 'pechuga', 'pollo', 'plancha', 'carne', 'carnes', 'saludable', 'ligero'],
  },
  {
    id: 'rinones-encebollados',
    name: 'Riñones al Jerez Encebollados',
    url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    tags: ['riñones encebollados', 'riñones al jerez', 'casqueria', 'cebolla', 'jerez', 'carne', 'carnes', 'guiso', 'tradicional'],
  },
  {
    id: 'higado-encebollado',
    name: 'Hígado Encebollado Tradicional',
    url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    tags: ['higado encebollado', 'hígado', 'cebolla', 'carne', 'carnes', 'casqueria', 'abuela', 'tradicional'],
  },

  // =========================================================================
  // 5. PESCADOS Y MARISCOS DE NUESTRAS COSTAS
  // =========================================================================
  {
    id: 'merluza-a-la-vasca',
    name: 'Merluza a la Vasca en Salsa Verde',
    url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
    tags: ['merluza a la vasca', 'salsa verde', 'merluza', 'almejas', 'esparragos', 'guisantes', 'pescados', 'euskadi', 'tradicional'],
  },
  {
    id: 'bacalao-al-pil-pil',
    name: 'Bacalao al Pil-Pil Tradicional',
    url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
    tags: ['bacalao al pil pil', 'bacalao', 'pil pil', 'ajo confitado', 'guindilla', 'aceite de oliva virgen', 'pescados', 'vasco', 'tradicional'],
  },
  {
    id: 'dorada-a-la-sal',
    name: 'Dorada a la Sal con Verduras al Vapor',
    url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80',
    tags: ['dorada a la sal', 'dorada', 'pescado', 'pescados', 'horno', 'saludable', 'ligero', 'mediterraneo', 'tradicional'],
  },
  {
    id: 'boquerones-en-vinagre',
    name: 'Boquerones en Vinagre con Ajo y Perejil',
    url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
    tags: ['boquerones en vinagre', 'boquerones', 'anchoas', 'vinagre', 'perejil', 'ajo', 'aceite de oliva', 'tapas', 'pescados', 'tradicional'],
  },
  {
    id: 'atun-rojo-plancha',
    name: 'Atún Rojo de Almadraba a la Plancha',
    url: 'https://images.unsplash.com/photo-1501595091296-3aa970afb3ff?auto=format&fit=crop&w=800&q=80',
    tags: ['atun a la plancha', 'atun rojo', 'almadraba', 'cadiz', 'pescado azul', 'pescados', 'plancha', 'saludable', 'tradicional'],
  },
  {
    id: 'zarzuela-de-marisco',
    name: 'Zarzuela de Marisco y Pescado',
    url: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&w=800&q=80',
    tags: ['zarzuela de marisco', 'zarzuela', 'marisco', 'pescados', 'rape', 'gambas', 'mejillones', 'cigalas', 'guiso marinero', 'tradicional'],
  },
  {
    id: 'sepia-a-la-plancha',
    name: 'Sepia a la Plancha con Salsa Verde y Alioli',
    url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
    tags: ['sepia a la plancha', 'sepia', 'chocos', 'alioli', 'ajo', 'perejil', 'limon', 'pescados', 'tapas', 'plancha', 'tradicional'],
  },
  {
    id: 'lubina-al-horno',
    name: 'Lubina al Horno con Patatas Panadera',
    url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
    tags: ['lubina al horno', 'lubina', 'patatas panadera', 'pescado blanco', 'pescados', 'horno', 'saludable', 'tradicional'],
  },
  {
    id: 'calamares-en-su-tinta',
    name: 'Calamares en su Tinta con Arroz Blanco',
    url: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80',
    tags: ['calamares en su tinta', 'chipirones en su tinta', 'tinta de calamar', 'arroz blanco', 'pescados', 'guiso', 'tradicional'],
  },
  {
    id: 'almejas-a-la-marinera',
    name: 'Almejas a la Marinera',
    url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    tags: ['almejas a la marinera', 'almejas', 'marisco', 'salsa marinera', 'pimenton', 'pescados', 'tapas', 'galicia', 'tradicional'],
  },
  {
    id: 'salmon-plancha',
    name: 'Lomo de Salmón a la Plancha',
    url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80',
    tags: ['salmon', 'salmón', 'pescado azul', 'pescados', 'plancha', 'esparragos', 'saludable'],
  },
  {
    id: 'sardinas-a-la-plancha',
    name: 'Sardinas a la Plancha / Espetos',
    url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
    tags: ['sardinas a la plancha', 'sardinas', 'espeto', 'pescado azul', 'pescados', 'plancha', 'saludable', 'mediterraneo'],
  },

  // =========================================================================
  // 6. POSTRES Y REPOSTERÍA TRADICIONAL
  // =========================================================================
  {
    id: 'crema-catalana',
    name: 'Crema Catalana con Azúcar Quemada',
    url: 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?auto=format&fit=crop&w=800&q=80',
    tags: ['crema catalana', 'caramelo', 'azucar quemada', 'canela', 'limon', 'postre', 'postres', 'dulce', 'cataluna', 'tradicional'],
  },
  {
    id: 'tarta-de-santiago',
    name: 'Tarta de Santiago con Almendras',
    url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80',
    tags: ['tarta de santiago', 'almendra', 'cruz de santiago', 'azucar glas', 'galicia', 'tarta', 'postre', 'postres', 'dulce', 'tradicional'],
  },
  {
    id: 'churros-con-chocolate',
    name: 'Churros y Porras con Chocolate Caliente',
    url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    tags: ['churros con chocolate', 'churros', 'porras', 'chocolate a la taza', 'desayuno', 'merienda', 'postre', 'postres', 'madrid', 'tradicional'],
  },
  {
    id: 'arroz-con-leche',
    name: 'Arroz con Leche Cremoso y Canela',
    url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80',
    tags: ['arroz con leche', 'canela', 'corteza de limon', 'leche', 'asturias', 'postre', 'postres', 'dulce', 'abuela', 'tradicional'],
  },
  {
    id: 'torrijas-caseras',
    name: 'Torrijas Caseras de Leche y Miel',
    url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    tags: ['torrijas', 'semana santa', 'canela', 'miel', 'pan brioche', 'postre', 'postres', 'dulce', 'tradicional'],
  },
  {
    id: 'flan-de-huevo-casero',
    name: 'Flan de Huevo Casero con Caramelo',
    url: 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?auto=format&fit=crop&w=800&q=80',
    tags: ['flan de huevo', 'flan casero', 'caramelo liquido', 'nata', 'vainilla', 'postre', 'postres', 'dulce', 'tradicional'],
  },
  {
    id: 'membrillo-con-queso',
    name: 'Dulce de Membrillo con Queso Manchego',
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    tags: ['membrillo con queso', 'membrillo', 'carne de membrillo', 'queso manchego', 'postre', 'postres', 'tapas', 'dulce', 'tradicional'],
  },
  {
    id: 'cuajada-miel-nueces',
    name: 'Cuajada Tradicional con Miel y Nueces',
    url: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80',
    tags: ['cuajada', 'miel', 'nueces', 'leche de oveja', 'navarra', 'postre', 'postres', 'dulce', 'tradicional'],
  },
  {
    id: 'ensaimada-mallorquina',
    name: 'Ensaimada Mallorquina Tradicional',
    url: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80',
    tags: ['ensaimada', 'mallorca', 'baleares', 'bolleria', 'azucar glas', 'postre', 'postres', 'dulce', 'tradicional'],
  },
  {
    id: 'tarta-queso-la-vina',
    name: 'Tarta de Queso Horneada Estilo Donostia (La Viña)',
    url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80',
    tags: ['tarta de queso la viña', 'cheesecake', 'la viña', 'san sebastian', 'horneada', 'cremosa', 'tarta', 'postre', 'postres', 'dulce', 'tradicional'],
  },
  {
    id: 'postre-brownie',
    name: 'Brownie de Chocolate con Helado',
    url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    tags: ['brownie', 'chocolate', 'postre', 'postres', 'dulce', 'helado', 'nueces'],
  },
  {
    id: 'postre-tiramisu',
    name: 'Tiramisú Tradicional de Mascarpone',
    url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80',
    tags: ['tiramisu', 'tiramisú', 'cafe', 'cacao', 'mascarpone', 'postre', 'postres', 'italiana', 'dulce'],
  },

  // =========================================================================
  // 7. FAVORITOS INTERNACIONALES (PASTA, PIZZA, BURGERS, ASIÁTICA, ETC.)
  // =========================================================================
  {
    id: 'espaguetis-marinera',
    name: 'Espaguetis Frutti di Mare',
    url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    tags: ['espaguetis a la marinera', 'pasta', 'espaguetis', 'marisco', 'almejas', 'gambas', 'mejillones', 'italiana', 'pescados'],
  },
  {
    id: 'macarrones-con-tomate',
    name: 'Macarrones con Tomate y Queso Gratinado',
    url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
    tags: ['macarrones con tomate', 'macarrones', 'pasta', 'tomate', 'queso', 'gratinado', 'italiana', 'carne'],
  },
  {
    id: 'lasana-bolonesa',
    name: 'Lasaña Tradicional a la Boloñesa',
    url: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=800&q=80',
    tags: ['lasaña', 'lasana', 'lasagna', 'pasta', 'carne', 'carnes', 'bechamel', 'queso', 'italiana', 'horno'],
  },
  {
    id: 'pizza-margherita',
    name: 'Pizza Napolitana Margherita',
    url: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80',
    tags: ['pizza', 'pizza napolitana', 'italiana', 'queso', 'mozzarella', 'albahaca', 'tomate'],
  },
  {
    id: 'burger-smash',
    name: 'Hamburguesa Doble Smash con Queso',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    tags: ['hamburguesa', 'burger', 'carne', 'carnes', 'queso', 'cheddar', 'patatas', 'americana', 'rapida'],
  },
  {
    id: 'tacos-pastor',
    name: 'Tacos al Pastor Tradicionales',
    url: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=800&q=80',
    tags: ['tacos al pastor', 'tacos', 'mexicana', 'carne', 'carnes', 'cilantro', 'tortilla', 'picante'],
  },
  {
    id: 'sushi-variado',
    name: 'Bandeja de Sushi, Nigiris & Makis',
    url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
    tags: ['sushi', 'nigiri', 'maki', 'japonesa', 'salmón', 'atún', 'pescado', 'pescados'],
  },
  {
    id: 'ensalada-mediterranea',
    name: 'Ensalada Fresca Mediterránea',
    url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    tags: ['ensalada', 'saludable', 'verduras', 'tomate', 'lechuga', 'fresco', 'aceite de oliva'],
  },
  {
    id: 'patatas-fritas',
    name: 'Patatas Fritas Caseras',
    url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80',
    tags: ['patatas fritas', 'patatas', 'papas', 'fritas', 'guarnicion', 'french fries', 'tradicional', 'tapas'],
  },
  {
    id: 'nuggets-crujientes',
    name: 'Nuggets Caseros de Pollo Crujiente',
    url: 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=800&q=80',
    tags: ['nuggets', 'pollo', 'crujiente', 'frito', 'americana', 'snack', 'dip', 'carne'],
  },
];
