"""
Script para cargar datos de mock_tenders.json a la base de datos PostgreSQL
"""
import json
import sys
from datetime import datetime
from sqlalchemy.orm import Session
from core.database import SessionLocal, engine
from models.tender import Tender
import models  # Importar todos los modelos para crear las tablas

def load_tenders_from_json():
    """Carga licitaciones desde el archivo JSON"""
    try:
        with open('mock_tenders.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data.get('tenders', [])
    except FileNotFoundError:
        print("❌ Error: No se encontró el archivo mock_tenders.json")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"❌ Error al leer JSON: {e}")
        sys.exit(1)

def parse_date(date_str):
    """Convierte string de fecha a datetime"""
    if not date_str:
        return None
    try:
        # Intentar varios formatos
        for fmt in ['%Y-%m-%dT%H:%M:%S.%fZ', '%Y-%m-%dT%H:%M:%SZ', '%Y-%m-%d']:
            try:
                return datetime.strptime(date_str, fmt)
            except ValueError:
                continue
        return None
    except:
        return None

def seed_database():
    """Inserta datos en la base de datos"""
    # Crear todas las tablas si no existen
    print("📋 Creando tablas si no existen...")
    models.tender.Base.metadata.create_all(bind=engine)
    
    # Crear sesión
    db: Session = SessionLocal()
    
    try:
        # Cargar datos del JSON
        print("📂 Cargando datos de mock_tenders.json...")
        tenders_data = load_tenders_from_json()
        print(f"✅ Se encontraron {len(tenders_data)} licitaciones en el JSON")
        
        # Verificar cuántas ya existen
        existing_count = db.query(Tender).count()
        print(f"📊 Hay {existing_count} licitaciones en la base de datos")
        
        # Preguntar si desea eliminar datos existentes
        if existing_count > 0:
            response = input("\n⚠️  ¿Desea eliminar las licitaciones existentes y cargar nuevas? (s/n): ")
            if response.lower() == 's':
                print("🗑️  Eliminando licitaciones existentes...")
                db.query(Tender).delete()
                db.commit()
                print("✅ Licitaciones eliminadas")
            else:
                print("ℹ️  Se agregarán solo las licitaciones que no existan")
        
        # Insertar licitaciones
        print("\n💾 Insertando licitaciones en la base de datos...")
        inserted = 0
        skipped = 0
        errors = 0
        
        for idx, tender_data in enumerate(tenders_data, 1):
            try:
                # Verificar si ya existe
                existing = db.query(Tender).filter(
                    Tender.external_id == tender_data.get('external_id')
                ).first()
                
                if existing:
                    skipped += 1
                    continue
                
                # Mapear status correcto
                status = tender_data.get('status', 'active')
                if status == 'active':
                    status = 'Abierta'
                elif status == 'complete':
                    status = 'Cerrada'
                
                # Crear objeto Tender
                tender = Tender(
                    external_id=tender_data.get('external_id'),
                    ocid=tender_data.get('ocid'),
                    title=tender_data.get('title'),
                    description=tender_data.get('description'),
                    status=status,
                    main_category=tender_data.get('main_category'),
                    buyer_name=tender_data.get('buyer_name'),
                    buyer_ruc=tender_data.get('buyer_ruc'),
                    budget_amount=tender_data.get('budget_amount'),
                    budget_currency=tender_data.get('budget_currency', 'USD'),
                    tender_start_date=parse_date(tender_data.get('tender_start_date')),
                    tender_end_date=parse_date(tender_data.get('tender_end_date')),
                    tender_duration_days=tender_data.get('tender_duration_days'),
                    number_of_tenderers=tender_data.get('number_of_tenderers', 0),
                    procedure_type=tender_data.get('procedure_type'),
                    has_enquiries=tender_data.get('has_enquiries', False)
                )
                
                db.add(tender)
                inserted += 1
                
                # Commit cada 50 registros
                if inserted % 50 == 0:
                    db.commit()
                    print(f"  ✓ Procesadas {idx}/{len(tenders_data)} licitaciones... ({inserted} insertadas)")
                
            except Exception as e:
                errors += 1
                print(f"  ❌ Error en licitación {idx}: {str(e)}")
                continue
        
        # Commit final
        db.commit()
        
        # Resumen
        print("\n" + "="*60)
        print("📊 RESUMEN DE IMPORTACIÓN")
        print("="*60)
        print(f"✅ Insertadas:  {inserted}")
        print(f"⏭️  Omitidas:    {skipped}")
        print(f"❌ Errores:     {errors}")
        print(f"📈 Total en BD: {db.query(Tender).count()}")
        print("="*60)
        
        if inserted > 0:
            print("\n✨ ¡Datos cargados exitosamente!")
            print("\n💡 Ahora puedes actualizar el endpoint de recomendaciones para usar la BD")
        
    except Exception as e:
        print(f"\n❌ Error general: {str(e)}")
        db.rollback()
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    print("="*60)
    print("🔄 IMPORTACIÓN DE LICITACIONES A POSTGRESQL")
    print("="*60)
    print()
    seed_database()
