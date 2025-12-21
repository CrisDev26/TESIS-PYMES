# Guía rápida: Inserts y consultas de geografía (Ecuador)

Este archivo documenta cómo poblar y consultar las tablas de **países, provincias y ciudades** en la base de datos `PYMES`.

> Nota: Asume que ya ejecutaste el script de esquema (`pymes.sql` / `schema.sql`) y que las tablas `countries`, `provinces` y `cities` existen.

---

## 1. Insertar país (Ecuador)

```sql
INSERT INTO countries (name, iso_code, created_at)
VALUES ('Ecuador', 'EC', NOW());
```

Comprobar:

```sql
SELECT * FROM countries WHERE name = 'Ecuador';
```

---

## 2. Insertar provincias de Ecuador

Primero asegúrate de tener el país:

```sql
SELECT id, name FROM countries WHERE name = 'Ecuador';
```

Luego inserta las provincias (ajusta si quieres otra lista):

```sql
INSERT INTO provinces (country_id, name, created_at)
VALUES
  ((SELECT id FROM countries WHERE name = 'Ecuador'), 'Azuay', NOW()),
  ((SELECT id FROM countries WHERE name = 'Ecuador'), 'Bolívar', NOW()),
  ((SELECT id FROM countries WHERE name = 'Ecuador'), 'Cañar', NOW()),
  ((SELECT id FROM countries WHERE name = 'Ecuador'), 'Carchi', NOW()),
  ((SELECT id FROM countries WHERE name = 'Ecuador'), 'Chimborazo', NOW()),
  ((SELECT id FROM countries WHERE name = 'Ecuador'), 'Cotopaxi', NOW()),
  ((SELECT id FROM countries WHERE name = 'Ecuador'), 'El Oro', NOW()),
  ((SELECT id FROM countries WHERE name = 'Ecuador'), 'Esmeraldas', NOW()),
  ((SELECT id FROM countries WHERE name = 'Ecuador'), 'Galápagos', NOW()),
  ((SELECT id FROM countries WHERE name = 'Ecuador'), 'Guayas', NOW()),
  ((SELECT id FROM countries WHERE name = 'Ecuador'), 'Imbabura', NOW()),
  ((SELECT id FROM countries WHERE name = 'Ecuador'), 'Loja', NOW()),
  ((SELECT id FROM countries WHERE name = 'Ecuador'), 'Los Ríos', NOW()),
  ((SELECT id FROM countries WHERE name = 'Ecuador'), 'Manabí', NOW()),
  ((SELECT id FROM countries WHERE name = 'Ecuador'), 'Morona Santiago', NOW()),
  ((SELECT id FROM countries WHERE name = 'Ecuador'), 'Napo', NOW()),
  ((SELECT id FROM countries WHERE name = 'Ecuador'), 'Orellana', NOW()),
  ((SELECT id FROM countries WHERE name = 'Ecuador'), 'Pastaza', NOW()),
  ((SELECT id FROM countries WHERE name = 'Ecuador'), 'Pichincha', NOW()),
  ((SELECT id FROM countries WHERE name = 'Ecuador'), 'Santa Elena', NOW()),
  ((SELECT id FROM countries WHERE name = 'Ecuador'), 'Santo Domingo de los Tsáchilas', NOW()),
  ((SELECT id FROM countries WHERE name = 'Ecuador'), 'Sucumbíos', NOW()),
  ((SELECT id FROM countries WHERE name = 'Ecuador'), 'Tungurahua', NOW()),
  ((SELECT id FROM countries WHERE name = 'Ecuador'), 'Zamora Chinchipe', NOW());
```

Comprobar:

```sql
SELECT id, name
FROM provinces
WHERE country_id = (SELECT id FROM countries WHERE name = 'Ecuador')
ORDER BY name;
```

---

## 3. Insertar ciudades (capitales provinciales)

```sql
INSERT INTO cities (province_id, name, created_at)
VALUES
  ((SELECT id FROM provinces WHERE name = 'Azuay'), 'Cuenca', NOW()),
  ((SELECT id FROM provinces WHERE name = 'Bolívar'), 'Guaranda', NOW()),
  ((SELECT id FROM provinces WHERE name = 'Cañar'), 'Azogues', NOW()),
  ((SELECT id FROM provinces WHERE name = 'Carchi'), 'Tulcán', NOW()),
  ((SELECT id FROM provinces WHERE name = 'Chimborazo'), 'Riobamba', NOW()),
  ((SELECT id FROM provinces WHERE name = 'Cotopaxi'), 'Latacunga', NOW()),
  ((SELECT id FROM provinces WHERE name = 'El Oro'), 'Machala', NOW()),
  ((SELECT id FROM provinces WHERE name = 'Esmeraldas'), 'Esmeraldas', NOW()),
  ((SELECT id FROM provinces WHERE name = 'Galápagos'), 'Puerto Baquerizo Moreno', NOW()),
  ((SELECT id FROM provinces WHERE name = 'Guayas'), 'Guayaquil', NOW()),
  ((SELECT id FROM provinces WHERE name = 'Imbabura'), 'Ibarra', NOW()),
  ((SELECT id FROM provinces WHERE name = 'Loja'), 'Loja', NOW()),
  ((SELECT id FROM provinces WHERE name = 'Los Ríos'), 'Babahoyo', NOW()),
  ((SELECT id FROM provinces WHERE name = 'Manabí'), 'Portoviejo', NOW()),
  ((SELECT id FROM provinces WHERE name = 'Morona Santiago'), 'Macas', NOW()),
  ((SELECT id FROM provinces WHERE name = 'Napo'), 'Tena', NOW()),
  ((SELECT id FROM provinces WHERE name = 'Orellana'), 'Francisco de Orellana', NOW()),
  ((SELECT id FROM provinces WHERE name = 'Pastaza'), 'Puyo', NOW()),
  ((SELECT id FROM provinces WHERE name = 'Pichincha'), 'Quito', NOW()),
  ((SELECT id FROM provinces WHERE name = 'Santa Elena'), 'Santa Elena', NOW()),
  ((SELECT id FROM provinces WHERE name = 'Santo Domingo de los Tsáchilas'), 'Santo Domingo', NOW()),
  ((SELECT id FROM provinces WHERE name = 'Sucumbíos'), 'Nueva Loja', NOW()),
  ((SELECT id FROM provinces WHERE name = 'Tungurahua'), 'Ambato', NOW()),
  ((SELECT id FROM provinces WHERE name = 'Zamora Chinchipe'), 'Zamora', NOW());
```

Comprobar:

```sql
SELECT c.id, c.name AS city, p.name AS province
FROM cities c
JOIN provinces p ON c.province_id = p.id
WHERE p.country_id = (SELECT id FROM countries WHERE name = 'Ecuador')
ORDER BY p.name, c.name;
```

---

## 4. Consultas útiles

### 4.1. Listar todos los países

```sql
SELECT id, name, iso_code
FROM countries
ORDER BY name;
```

### 4.2. Provincias de un país

```sql
SELECT p.id, p.name
FROM provinces p
JOIN countries c ON p.country_id = c.id
WHERE c.name = 'Ecuador'
ORDER BY p.name;
```

### 4.3. Ciudades de una provincia

```sql
SELECT id, name
FROM cities
WHERE province_id = (SELECT id FROM provinces WHERE name = 'Pichincha')
ORDER BY name;
```

### 4.4. Buscar ciudad con su provincia y país

```sql
SELECT 
  c.name       AS city,
  p.name       AS province,
  co.name      AS country
FROM cities c
JOIN provinces p ON c.province_id = p.id
JOIN countries co ON p.country_id = co.id
WHERE c.name ILIKE 'Quito';
```

---

> En producción, recuerda ejecutar estos `INSERT` solo una vez (o envolverlos con comprobaciones) para no duplicar datos.
