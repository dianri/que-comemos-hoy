-- Script de inserción masiva del recetario tradicional completo
-- Usuario creador: dianrie@hotmail.com

DO $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT := 'dianrie@hotmail.com';
  v_creator_name TEXT := 'dianrie@hotmail.com';
BEGIN
  -- Obtener el UUID del usuario registrado si existe
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_user_email LIMIT 1;
  IF v_user_id IS NULL THEN
    v_user_id := '3cd5afb2-1613-47ae-9cf2-f220f5b1eb92'::UUID;
  END IF;

  -- 1. Lentejas
  IF NOT EXISTS (SELECT 1 FROM public.foods WHERE lower(name) = 'lentejas') THEN
    INSERT INTO public.foods (name, image_url, category, description, votes_count, created_by, user_id, user_email)
    VALUES (
      'Lentejas',
      'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
      'Tradicional',
      'Lentejas tradicionales de la abuela cocinadas a fuego lento con chorizo, morcilla, patata, zanahoria y su sofrito de cebolla con pimentón dulce de la Vera.',
      0, v_creator_name, v_user_id, v_user_email
    );
  END IF;

  -- 2. Fideuà
  IF NOT EXISTS (SELECT 1 FROM public.foods WHERE lower(name) IN ('fideuà', 'fideua')) THEN
    INSERT INTO public.foods (name, image_url, category, description, votes_count, created_by, user_id, user_email)
    VALUES (
      'Fideuà',
      'https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=800&q=80',
      'Arroces',
      'Auténtica fideuà marinera con fideo fino tostado en paella, sepia fresca, gambas rojas, mejillones y un caldo concentrado de morralla servido con alioli casero.',
      0, v_creator_name, v_user_id, v_user_email
    );
  END IF;

  -- 3. Asado
  IF NOT EXISTS (SELECT 1 FROM public.foods WHERE lower(name) = 'asado') THEN
    INSERT INTO public.foods (name, image_url, category, description, votes_count, created_by, user_id, user_email)
    VALUES (
      'Asado',
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      'Carnes',
      'Jugoso asado de carne al horno sazonado con hierbas provenzales, romero fresco, ajos machacados y una guarnición de patatas panaderas doradas en su propio jugo.',
      0, v_creator_name, v_user_id, v_user_email
    );
  END IF;

  -- 4. Patatas fritas
  IF NOT EXISTS (SELECT 1 FROM public.foods WHERE lower(name) = 'patatas fritas') THEN
    INSERT INTO public.foods (name, image_url, category, description, votes_count, created_by, user_id, user_email)
    VALUES (
      'Patatas fritas',
      'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80',
      'Tradicional',
      'Patatas caseras cortadas a mano, fritas en aceite de oliva virgen extra en dos temperaturas para lograr un exterior crujiente y un interior tierno y cremoso, con sal en escamas.',
      0, v_creator_name, v_user_id, v_user_email
    );
  END IF;

  -- 5. Patatas a lo pobre
  IF NOT EXISTS (SELECT 1 FROM public.foods WHERE lower(name) = 'patatas a lo pobre') THEN
    INSERT INTO public.foods (name, image_url, category, description, votes_count, created_by, user_id, user_email)
    VALUES (
      'Patatas a lo pobre',
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80',
      'Tradicional',
      'Clásico plato andaluz de patatas cortadas en rodajas pochadas suavemente en aceite de oliva con pimiento verde, cebolla en juliana, ajitos dorados y un toque de vinagre.',
      0, v_creator_name, v_user_id, v_user_email
    );
  END IF;

  -- 6. Espaguetis a la marinera
  IF NOT EXISTS (SELECT 1 FROM public.foods WHERE lower(name) = 'espaguetis a la marinera') THEN
    INSERT INTO public.foods (name, image_url, category, description, votes_count, created_by, user_id, user_email)
    VALUES (
      'Espaguetis a la marinera',
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
      'Italiana',
      'Espaguetis al dente salteados con almejas, gambones, mejillones y anillas de calamar en una salsa suave de ajo, tomate cherry, vino blanco y perejil fresco picado.',
      0, v_creator_name, v_user_id, v_user_email
    );
  END IF;

  -- 7. Albóndigas
  IF NOT EXISTS (SELECT 1 FROM public.foods WHERE lower(name) IN ('albóndigas', 'albondigas')) THEN
    INSERT INTO public.foods (name, image_url, category, description, votes_count, created_by, user_id, user_email)
    VALUES (
      'Albóndigas',
      'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=800&q=80',
      'Carnes',
      'Jugosas albóndigas caseras de carne mixta de ternera y cerdo especiadas con ajo y perejil, cocinadas a fuego lento en una rica salsa de tomate casero, cebolla pochada y guisantes tiernos.',
      0, v_creator_name, v_user_id, v_user_email
    );
  END IF;

  -- 8. Magra en salsa
  IF NOT EXISTS (SELECT 1 FROM public.foods WHERE lower(name) = 'magra en salsa') THEN
    INSERT INTO public.foods (name, image_url, category, description, votes_count, created_by, user_id, user_email)
    VALUES (
      'Magra en salsa',
      'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=800&q=80',
      'Carnes',
      'Tiernos dados de magra de cerdo ibérico estofados en una salsa tradicional de tomate maduro frito, pimientos asados, cebolla pochada y vino blanco hasta deshacerse en boca.',
      0, v_creator_name, v_user_id, v_user_email
    );
  END IF;

  -- 9. Macarrones con tomate
  IF NOT EXISTS (SELECT 1 FROM public.foods WHERE lower(name) = 'macarrones con tomate') THEN
    INSERT INTO public.foods (name, image_url, category, description, votes_count, created_by, user_id, user_email)
    VALUES (
      'Macarrones con tomate',
      'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
      'Italiana',
      'El gran clásico familiar: macarrones bañados en salsa de tomate frito casero con carne picada sofrita, cebolla dulce y gratinados al horno con generoso queso rallado.',
      0, v_creator_name, v_user_id, v_user_email
    );
  END IF;

  -- 10. Arroz a la cubana
  IF NOT EXISTS (SELECT 1 FROM public.foods WHERE lower(name) = 'arroz a la cubana') THEN
    INSERT INTO public.foods (name, image_url, category, description, votes_count, created_by, user_id, user_email)
    VALUES (
      'Arroz a la cubana',
      'https://images.unsplash.com/photo-1596560548464-f010549b84d7?auto=format&fit=crop&w=800&q=80',
      'Arroces',
      'Arroz blanco de grano redondo salteado al ajillo, acompañado de dos huevos fritos con puntilla, salsa de tomate frito casera y plátano maduro caramelizado a la plancha.',
      0, v_creator_name, v_user_id, v_user_email
    );
  END IF;

  -- 11. Lasaña (actualizar si ya existe para asociarla a dianrie)
  IF NOT EXISTS (SELECT 1 FROM public.foods WHERE lower(name) IN ('lasaña', 'lasana')) THEN
    INSERT INTO public.foods (name, image_url, category, description, votes_count, created_by, user_id, user_email)
    VALUES (
      'Lasaña',
      'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=800&q=80',
      'Italiana',
      'Capas de pasta fresca rellenas de salsa boloñesa lenta con ternera picada y hortalizas, cubierta de una suave bechamel casera a la nuez moscada y gratinada con queso parmesano.',
      0, v_creator_name, v_user_id, v_user_email
    );
  ELSE
    UPDATE public.foods
    SET
      description = 'Capas de pasta fresca rellenas de salsa boloñesa lenta con ternera picada y hortalizas, cubierta de una suave bechamel casera a la nuez moscada y gratinada con queso parmesano.',
      image_url = 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=800&q=80',
      created_by = v_creator_name,
      user_id = v_user_id,
      user_email = v_user_email
    WHERE lower(name) IN ('lasaña', 'lasana');
  END IF;

  -- 12. Salmón
  IF NOT EXISTS (SELECT 1 FROM public.foods WHERE lower(name) IN ('salmón', 'salmon')) THEN
    INSERT INTO public.foods (name, image_url, category, description, votes_count, created_by, user_id, user_email)
    VALUES (
      'Salmón',
      'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80',
      'Pescados',
      'Lomo de salmón fresco a la plancha con la piel bien crujiente, servido con espárragos verdes trigueros, gajos de limón y un toque aromático de eneldo fresco y pimienta negra recién molida.',
      0, v_creator_name, v_user_id, v_user_email
    );
  END IF;

  -- 13. Pechugas de pollo
  IF NOT EXISTS (SELECT 1 FROM public.foods WHERE lower(name) = 'pechugas de pollo') THEN
    INSERT INTO public.foods (name, image_url, category, description, votes_count, created_by, user_id, user_email)
    VALUES (
      'Pechugas de pollo',
      'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80',
      'Carnes',
      'Filetes tiernos de pechuga de pollo marinados con limón, aceite de oliva virgen extra, ajo machacado y orégano, marcados a la plancha a fuego vivo para que queden jugosos por dentro.',
      0, v_creator_name, v_user_id, v_user_email
    );
  END IF;

  -- 14. Chuletas de cabeza de lomo
  IF NOT EXISTS (SELECT 1 FROM public.foods WHERE lower(name) = 'chuletas de cabeza de lomo') THEN
    INSERT INTO public.foods (name, image_url, category, description, votes_count, created_by, user_id, user_email)
    VALUES (
      'Chuletas de cabeza de lomo',
      'https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=800&q=80',
      'Carnes',
      'Jugosas chuletas de cabeza de lomo de cerdo doradas en sartén de hierro con sal gorda marina, aromatizadas con ajos enteros chafados y pimientos verdes fritos de guarnición.',
      0, v_creator_name, v_user_id, v_user_email
    );
  END IF;

  -- 15. Arroz con secreto
  IF NOT EXISTS (SELECT 1 FROM public.foods WHERE lower(name) = 'arroz con secreto') THEN
    INSERT INTO public.foods (name, image_url, category, description, votes_count, created_by, user_id, user_email)
    VALUES (
      'Arroz con secreto',
      'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
      'Arroces',
      'Arroz meloso o en paella preparado con dados de secreto ibérico bien dorados, setas silvestres de temporada (boletus), ajetes tiernos y un caldo de carne concentrado reducido a fuego lento.',
      0, v_creator_name, v_user_id, v_user_email
    );
  END IF;

  -- 16. Salmorejo
  IF NOT EXISTS (SELECT 1 FROM public.foods WHERE lower(name) = 'salmorejo') THEN
    INSERT INTO public.foods (name, image_url, category, description, votes_count, created_by, user_id, user_email)
    VALUES (
      'Salmorejo',
      'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80',
      'Sopas',
      'Crema fría cordobesa elaborada con tomates maduros de pera, pan de telera, aceite de oliva virgen extra de Jaén y un toque de ajo, coronada con virutas de jamón ibérico y huevo duro picado.',
      0, v_creator_name, v_user_id, v_user_email
    );
  END IF;

  -- 17. Gazpacho
  IF NOT EXISTS (SELECT 1 FROM public.foods WHERE lower(name) = 'gazpacho') THEN
    INSERT INTO public.foods (name, image_url, category, description, votes_count, created_by, user_id, user_email)
    VALUES (
      'Gazpacho',
      'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=800&q=80',
      'Sopas',
      'Refrescante sopa fría andaluza triturada con tomates rojos, pepino, pimiento verde italiano, diente de ajo, vinagre de Jerez y aceite de oliva virgen extra servida bien fría.',
      0, v_creator_name, v_user_id, v_user_email
    );
  END IF;

  -- 18. Pollo asado
  IF NOT EXISTS (SELECT 1 FROM public.foods WHERE lower(name) = 'pollo asado') THEN
    INSERT INTO public.foods (name, image_url, category, description, votes_count, created_by, user_id, user_email)
    VALUES (
      'Pollo asado',
      'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=80',
      'Carnes',
      'Pollo entero asado lentamente al horno hasta conseguir una piel dorada y crujiente, macerado con limón, tomillo, romero, vino blanco y una cama de patatas panaderas confitadas.',
      0, v_creator_name, v_user_id, v_user_email
    );
  END IF;

  -- 19. Ensaladilla rusa
  IF NOT EXISTS (SELECT 1 FROM public.foods WHERE lower(name) = 'ensaladilla rusa') THEN
    INSERT INTO public.foods (name, image_url, category, description, votes_count, created_by, user_id, user_email)
    VALUES (
      'Ensaladilla rusa',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
      'Tradicional',
      'La reina de las tapas: dados de patata y zanahoria cocidas al dente, lomos de atún claro en aceite de oliva, guisantes finos, huevo duro picado y una cremosa mayonesa casera decorada con pimientos morrones.',
      0, v_creator_name, v_user_id, v_user_email
    );
  END IF;

  -- 20. Ensaladilla de mariscos
  IF NOT EXISTS (SELECT 1 FROM public.foods WHERE lower(name) = 'ensaladilla de mariscos') THEN
    INSERT INTO public.foods (name, image_url, category, description, votes_count, created_by, user_id, user_email)
    VALUES (
      'Ensaladilla de mariscos',
      'https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&w=800&q=80',
      'Pescados',
      'Fresca ensaladilla marinera a base de patata tierna, colas de langostinos cocidos, bocaditos de cangrejo, huevo duro y una suave salsa tártara ligera con un toque de cebollino picado.',
      0, v_creator_name, v_user_id, v_user_email
    );
  END IF;

  -- 21. Riñones encebollados
  IF NOT EXISTS (SELECT 1 FROM public.foods WHERE lower(name) IN ('riñones encebollados', 'rinones encebollados')) THEN
    INSERT INTO public.foods (name, image_url, category, description, votes_count, created_by, user_id, user_email)
    VALUES (
      'Riñones encebollados',
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
      'Carnes',
      'Clásico de la cocina tradicional de taberna: riñones limpios salteados a fuego vivo y estofados con abundante cebolla pochada en juliana, ajos laminados y una reducción de vino fino de Jerez.',
      0, v_creator_name, v_user_id, v_user_email
    );
  END IF;

  -- 22. Hígado encebollado
  IF NOT EXISTS (SELECT 1 FROM public.foods WHERE lower(name) IN ('hígado encebollado', 'higado encebollado')) THEN
    INSERT INTO public.foods (name, image_url, category, description, votes_count, created_by, user_id, user_email)
    VALUES (
      'Hígado encebollado',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
      'Carnes',
      'Filetes de hígado fresco cocinados rápidamente a la plancha para conservar toda su ternura, cubiertos con una generosa cama de cebolla caramelizada lentamente con pimentón dulce y vino blanco.',
      0, v_creator_name, v_user_id, v_user_email
    );
  END IF;

  -- 23. Croquetas
  IF NOT EXISTS (SELECT 1 FROM public.foods WHERE lower(name) = 'croquetas') THEN
    INSERT INTO public.foods (name, image_url, category, description, votes_count, created_by, user_id, user_email)
    VALUES (
      'Croquetas',
      'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80',
      'Tradicional',
      'Croquetas caseras de jamón ibérico con bechamel sedosa elaborada a mano con leche entera de caserío, doble rebozado en huevo y pan rallado crujiente fritas en aceite de oliva limpio.',
      0, v_creator_name, v_user_id, v_user_email
    );
  END IF;

  -- 24. Flamenquines
  IF NOT EXISTS (SELECT 1 FROM public.foods WHERE lower(name) = 'flamenquines') THEN
    INSERT INTO public.foods (name, image_url, category, description, votes_count, created_by, user_id, user_email)
    VALUES (
      'Flamenquines',
      'https://images.unsplash.com/photo-1625938144755-652e08e359b7?auto=format&fit=crop&w=800&q=80',
      'Carnes',
      'Rollo cordobés tradicional de cinta de lomo de cerdo tierno relleno de lonchas de jamón serrano y queso fundente, empanado finamente y frito hasta quedar dorado y extra crujiente.',
      0, v_creator_name, v_user_id, v_user_email
    );
  END IF;

  -- 25. Sanjacobos
  IF NOT EXISTS (SELECT 1 FROM public.foods WHERE lower(name) = 'sanjacobos') THEN
    INSERT INTO public.foods (name, image_url, category, description, votes_count, created_by, user_id, user_email)
    VALUES (
      'Sanjacobos',
      'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80',
      'Carnes',
      'Lonchas gruesas de jamón cocido extra rellenas de queso semicurado cremoso que funde al primer bocado, empanadas artesanalmente con pan crujiente y fritas al momento.',
      0, v_creator_name, v_user_id, v_user_email
    );
  END IF;

  -- 26. Nuggets
  IF NOT EXISTS (SELECT 1 FROM public.foods WHERE lower(name) = 'nuggets') THEN
    INSERT INTO public.foods (name, image_url, category, description, votes_count, created_by, user_id, user_email)
    VALUES (
      'Nuggets',
      'https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=800&q=80',
      'Americana',
      'Bocaditos crujientes de pechuga de pollo picada y sazonada con especias suaves, rebozado tipo tempura dorado y crocante, servidos con salsa barbacoa casera y mostaza dulce.',
      0, v_creator_name, v_user_id, v_user_email
    );
  END IF;

  -- 27. Merluza a la plancha
  IF NOT EXISTS (SELECT 1 FROM public.foods WHERE lower(name) = 'merluza a la plancha') THEN
    INSERT INTO public.foods (name, image_url, category, description, votes_count, created_by, user_id, user_email)
    VALUES (
      'Merluza a la plancha',
      'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
      'Pescados',
      'Lomos de merluza fresca del Cantábrico cocinados a la plancha con unas gotas de aceite de oliva virgen extra, ajos dorados laminados, una pizca de guindilla y perejil fresco picado.',
      0, v_creator_name, v_user_id, v_user_email
    );
  END IF;

  -- 28. Caldo de pollo
  IF NOT EXISTS (SELECT 1 FROM public.foods WHERE lower(name) = 'caldo de pollo') THEN
    INSERT INTO public.foods (name, image_url, category, description, votes_count, created_by, user_id, user_email)
    VALUES (
      'Caldo de pollo',
      'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
      'Sopas',
      'Reconfortante caldo casero cocido durante horas a fuego lento con pollo de corral, hueso de jamón, puerro, apio, zanahoria y nabo, servido humeante con fideos finos tipo lluvia.',
      0, v_creator_name, v_user_id, v_user_email
    );
  END IF;

  -- 29. Sopa de mariscos
  IF NOT EXISTS (SELECT 1 FROM public.foods WHERE lower(name) = 'sopa de mariscos') THEN
    INSERT INTO public.foods (name, image_url, category, description, votes_count, created_by, user_id, user_email)
    VALUES (
      'Sopa de mariscos',
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
      'Sopas',
      'Sabroso caldo marinero elaborado a partir de fumet de pescado de roca y cabezas de gambón, con tropezones de almejas, mejillones, calamares y colas de langostino al azafrán.',
      0, v_creator_name, v_user_id, v_user_email
    );
  END IF;

  -- 30. Gambas a la plancha
  IF NOT EXISTS (SELECT 1 FROM public.foods WHERE lower(name) = 'gambas a la plancha') THEN
    INSERT INTO public.foods (name, image_url, category, description, votes_count, created_by, user_id, user_email)
    VALUES (
      'Gambas a la plancha',
      'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80',
      'Pescados',
      'Gambas rojas frescas cocinadas vuelta y vuelta sobre una plancha muy caliente cubierta con sal gorda marina, regadas con un chorrito de aceite de oliva virgen y zumo de limón recién exprimido.',
      0, v_creator_name, v_user_id, v_user_email
    );
  END IF;

  -- 31. Champiñones a la plancha
  IF NOT EXISTS (SELECT 1 FROM public.foods WHERE lower(name) IN ('champiñones a la plancha', 'champinones a la plancha')) THEN
    INSERT INTO public.foods (name, image_url, category, description, votes_count, created_by, user_id, user_email)
    VALUES (
      'Champiñones a la plancha',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
      'Saludable',
      'Sombreros de champiñones frescos dorados en la plancha a fuego vivo, aderezados con un majado tradicional de ajo, perejil fresco, unas gotas de vino blanco y taquitos de jamón serrano.',
      0, v_creator_name, v_user_id, v_user_email
    );
  END IF;

  -- 32. Sardinas a la plancha
  IF NOT EXISTS (SELECT 1 FROM public.foods WHERE lower(name) = 'sardinas a la plancha') THEN
    INSERT INTO public.foods (name, image_url, category, description, votes_count, created_by, user_id, user_email)
    VALUES (
      'Sardinas a la plancha',
      'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
      'Pescados',
      'Sardinas enteras bien frescas cocinadas a la plancha con sal marina gruesa hasta que la piel quede crujiente y la carne tierna y jugosa, servidas con limón natural.',
      0, v_creator_name, v_user_id, v_user_email
    );
  END IF;

  -- 33. Secreto a la plancha
  IF NOT EXISTS (SELECT 1 FROM public.foods WHERE lower(name) = 'secreto a la plancha') THEN
    INSERT INTO public.foods (name, image_url, category, description, votes_count, created_by, user_id, user_email)
    VALUES (
      'Secreto a la plancha',
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      'Carnes',
      'Corte selecto de secreto ibérico de bellota sellado a fuego muy vivo para caramelizar su grasa entreverada, dejando el interior tierno y jugoso con escamas de sal Maldon.',
      0, v_creator_name, v_user_id, v_user_email
    );
  END IF;

END $$;
