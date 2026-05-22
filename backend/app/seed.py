"""
Database seeding script — populates the database with realistic demo data.
Run with: python -m app.seed
"""

import asyncio
import random
from datetime import datetime, timedelta, timezone, date
from app.core.database import engine, AsyncSessionLocal, Base
from app.core.security import hash_password
from app.models.user import User
from app.models.farmer import Farmer
from app.models.product import Product
from app.models.warehouse import Warehouse
from app.models.inventory import Inventory
from app.models.transport import Transport
from app.models.shipment import Shipment
from app.models.temperature_log import TemperatureLog


async def seed():
    """Create tables and populate with demo data."""
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # --- Users ---
        users = [
            User(email="admin@agrisupply.com", hashed_password=hash_password("admin123"), full_name="System Admin", role="admin"),
            User(email="farmer1@agrisupply.com", hashed_password=hash_password("farmer123"), full_name="Rajesh Kumar", role="farmer"),
            User(email="transport@agrisupply.com", hashed_password=hash_password("transport123"), full_name="Vikram Singh", role="transporter"),
        ]
        session.add_all(users)

        # --- Farmers ---
        farmer_data = [
            ("Rajesh Kumar", "9876543210", "rajesh@email.com", "123 Farm Road, Village Patel", "Nagpur", "Maharashtra", 25.5),
            ("Sunita Devi", "9876543211", "sunita@email.com", "45 Green Valley, Sector 12", "Lucknow", "Uttar Pradesh", 18.0),
            ("Mohan Patel", "9876543212", "mohan@email.com", "78 Wheat Lane, Near Bus Stand", "Indore", "Madhya Pradesh", 42.0),
            ("Lakshmi Rao", "9876543213", "lakshmi@email.com", "12 Paddy Fields, River Side", "Guntur", "Andhra Pradesh", 30.0),
            ("Arjun Singh", "9876543214", "arjun@email.com", "56 Orchard Road, Hill View", "Shimla", "Himachal Pradesh", 15.0),
            ("Priya Sharma", "9876543215", "priya@email.com", "90 Cotton Avenue, Industrial Area", "Ahmedabad", "Gujarat", 35.0),
            ("Ravi Verma", "9876543216", "ravi@email.com", "34 Mango Estate, GT Road", "Varanasi", "Uttar Pradesh", 22.0),
            ("Kamla Bai", "9876543217", "kamla@email.com", "67 Spice Garden, Market Road", "Kochi", "Kerala", 12.0),
            ("Deepak Yadav", "9876543218", "deepak@email.com", "23 Sugarcane Field, NH-44", "Bhopal", "Madhya Pradesh", 55.0),
            ("Anjali Kumari", "9876543219", "anjali@email.com", "89 Tea Plantation, Ridge Lane", "Darjeeling", "West Bengal", 20.0),
            ("Suresh Reddy", "9876543220", "suresh@email.com", "45 Vegetable Farm, Ring Road", "Hyderabad", "Telangana", 28.0),
            ("Meena Joshi", "9876543221", "meena@email.com", "12 Flower Garden, Temple Street", "Pune", "Maharashtra", 16.0),
            ("Bharat Nair", "9876543222", "bharat@email.com", "78 Coconut Groove, Beach Road", "Thiruvananthapuram", "Kerala", 33.0),
            ("Geeta Pandey", "9876543223", "geeta@email.com", "56 Lentil Field, Market Chowk", "Patna", "Bihar", 19.0),
            ("Vikash Gupta", "9876543224", "vikash@email.com", "34 Rice Paddy, Lake Road", "Raipur", "Chhattisgarh", 40.0),
        ]
        farmers = []
        for name, phone, email, address, city, state, area in farmer_data:
            f = Farmer(name=name, phone=phone, email=email, address=address, city=city, state=state, land_area_acres=area)
            farmers.append(f)
        session.add_all(farmers)
        await session.flush()

        # --- Products ---
        categories = ["Vegetables", "Fruits", "Grains", "Spices", "Dairy", "Pulses"]
        product_names = {
            "Vegetables": ["Tomatoes", "Onions", "Potatoes", "Cauliflower", "Spinach", "Brinjal", "Cabbage", "Carrots"],
            "Fruits": ["Mangoes", "Bananas", "Apples", "Oranges", "Grapes", "Pomegranates", "Guavas"],
            "Grains": ["Rice", "Wheat", "Corn", "Barley", "Millet", "Sorghum"],
            "Spices": ["Turmeric", "Chili Powder", "Cumin", "Coriander", "Black Pepper", "Cardamom"],
            "Dairy": ["Fresh Milk", "Curd", "Paneer", "Ghee", "Butter"],
            "Pulses": ["Toor Dal", "Moong Dal", "Chana Dal", "Urad Dal", "Masoor Dal"],
        }
        products = []
        for i in range(50):
            cat = random.choice(categories)
            name = random.choice(product_names[cat])
            farmer = random.choice(farmers)
            p = Product(
                farmer_id=farmer.id,
                name=name,
                category=cat,
                quantity_kg=round(random.uniform(100, 5000), 1),
                price_per_kg=round(random.uniform(10, 500), 2),
                harvest_date=date.today() - timedelta(days=random.randint(1, 90)),
                expiry_date=date.today() + timedelta(days=random.randint(7, 180)),
            )
            products.append(p)
        session.add_all(products)
        await session.flush()

        # --- Warehouses ---
        warehouse_data = [
            ("Green Valley Cold Storage", "NH-44, Industrial Zone", "Nagpur", 500, 320, "cold", -5, 5),
            ("AgriStore Dry Warehouse", "MIDC Area, Sector 7", "Pune", 1000, 650, "dry", None, None),
            ("FreshKeep Facility", "Food Park, Phase 2", "Hyderabad", 750, 480, "cold", -10, 2),
            ("Harvest Hub Mixed", "Agricultural Market Yard", "Indore", 600, 410, "mixed", 0, 25),
            ("ColdChain Express", "Logistics Park, Ring Road", "Delhi", 800, 560, "cold", -15, 0),
            ("Rural Agri Store", "Mandi Compound, GT Road", "Lucknow", 400, 280, "dry", None, None),
            ("Southern Cold Hub", "Port Area, Industrial Belt", "Chennai", 900, 720, "cold", -8, 4),
            ("Midwest Grain Store", "Railway Siding, Sector 3", "Bhopal", 1200, 890, "dry", None, None),
            ("Eastern Fresh Storage", "Cold Chain Park, NH-2", "Kolkata", 550, 320, "mixed", -2, 15),
            ("Western Agri Depot", "SEZ Zone, Plot 45", "Ahmedabad", 700, 510, "mixed", 0, 20),
        ]
        warehouses = []
        for name, loc, city, cap, load, stype, mint, maxt in warehouse_data:
            w = Warehouse(name=name, location=loc, city=city, capacity_tons=cap,
                         current_load_tons=load, storage_type=stype, min_temp=mint, max_temp=maxt)
            warehouses.append(w)
        session.add_all(warehouses)
        await session.flush()

        # --- Inventory ---
        inventory_items = []
        for _ in range(40):
            inv = Inventory(
                warehouse_id=random.choice(warehouses).id,
                product_id=random.choice(products).id,
                quantity_kg=round(random.uniform(50, 2000), 1),
            )
            inventory_items.append(inv)
        session.add_all(inventory_items)

        # --- Transports ---
        transport_data = [
            ("MH-12-AB-1234", "Reefer Truck", "Vikram Singh", "9871234567", 10, True),
            ("DL-01-CD-5678", "Box Truck", "Amit Kumar", "9871234568", 8, False),
            ("TN-09-EF-9012", "Reefer Van", "Suresh M", "9871234569", 5, True),
            ("GJ-05-GH-3456", "Open Truck", "Haresh Patel", "9871234570", 15, False),
            ("KA-01-IJ-7890", "Mini Reefer", "Ramesh B", "9871234571", 3, True),
            ("UP-32-KL-2345", "Container Truck", "Ajay Chauhan", "9871234572", 20, False),
            ("RJ-14-MN-6789", "Reefer Container", "Mahesh Sharma", "9871234573", 12, True),
            ("MP-04-OP-1122", "Pickup Van", "Dinesh Yadav", "9871234574", 2, False),
        ]
        transports = []
        for vn, vt, dn, dp, cap, ref in transport_data:
            t = Transport(vehicle_number=vn, vehicle_type=vt, driver_name=dn,
                         driver_phone=dp, capacity_tons=cap, is_refrigerated=ref)
            transports.append(t)
        session.add_all(transports)
        await session.flush()

        # --- Shipments ---
        statuses = ["pending", "in_transit", "delivered", "delivered", "in_transit"]
        cities = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad"]
        shipments = []
        for i in range(30):
            status = random.choice(statuses)
            shipped = datetime.now(timezone.utc) - timedelta(days=random.randint(1, 30)) if status != "pending" else None
            delivered = shipped + timedelta(days=random.randint(1, 5)) if status == "delivered" and shipped else None
            s = Shipment(
                product_id=random.choice(products).id,
                warehouse_id=random.choice(warehouses).id,
                transport_id=random.choice(transports).id,
                origin=random.choice(cities),
                destination=random.choice(cities),
                status=status,
                shipped_at=shipped,
                delivered_at=delivered,
            )
            shipments.append(s)
        session.add_all(shipments)
        await session.flush()

        # --- Temperature Logs ---
        temp_logs = []
        for i in range(200):
            # Some readings are normal, some trigger alerts
            is_alert = random.random() < 0.15  # 15% chance of alert
            if is_alert:
                temp = round(random.uniform(-20, -10) if random.random() < 0.5 else random.uniform(10, 30), 1)
            else:
                temp = round(random.uniform(-5, 5), 1)  # Normal cold storage range

            log = TemperatureLog(
                shipment_id=random.choice(shipments).id if random.random() < 0.4 else None,
                warehouse_id=random.choice(warehouses).id,
                temperature_celsius=temp,
                humidity_percent=round(random.uniform(30, 95), 1),
                alert_triggered=is_alert,
                recorded_at=datetime.now(timezone.utc) - timedelta(hours=random.randint(0, 168)),
            )
            temp_logs.append(log)
        session.add_all(temp_logs)

        await session.commit()
        print("[OK] Database seeded successfully!")
        print(f"   Data: {len(farmers)} farmers, {len(products)} products, {len(warehouses)} warehouses")
        print(f"   Shipments: {len(shipments)} shipments, {len(transports)} transports")
        print(f"   Temp Logs: {len(temp_logs)} temperature logs")
        print(f"   Users: 3 users (admin/farmer/transporter)")
        print(f"\n   Login credentials:")
        print(f"   Admin:       admin@agrisupply.com / admin123")
        print(f"   Farmer:      farmer1@agrisupply.com / farmer123")
        print(f"   Transporter: transport@agrisupply.com / transport123")


if __name__ == "__main__":
    asyncio.run(seed())
