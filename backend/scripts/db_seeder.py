import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import random

def generate_products(category_map):
    products = []
    used_names = set()

    def add_prod(cat_name, name, price, specs):
        # Đảm bảo không bị trùng tên
        final_name = name
        counter = 2
        while final_name in used_names:
            final_name = f"{name} ({counter})"
            counter += 1
        used_names.add(final_name)

        brand = name.split(" ")[0]
        products.append({
            "name": final_name,
            "category_id": category_map[cat_name],
            "price": price,
            "stock": random.randint(5, 50),
            "image": f"https://via.placeholder.com/200?text={brand}",
            "specs": specs
        })

    # --- 1. CPU ---
    intel_models = [
        ("Core i3-12100F", 1800000, "LGA1700", "4 Cores 8 Threads | 58W"),
        ("Core i5-12400F", 3100000, "LGA1700", "6 Cores 12 Threads | 65W"),
        ("Core i5-13400F", 4500000, "LGA1700", "10 Cores 16 Threads | 65W"),
        ("Core i7-13700K", 9500000, "LGA1700", "16 Cores 24 Threads | 125W"),
        ("Core i9-14900K", 14500000, "LGA1700", "24 Cores 32 Threads | 125W"),
        ("Core i3-10100F", 1400000, "LGA1200", "4 Cores 8 Threads | 65W"),
        ("Core i5-10400F", 2200000, "LGA1200", "6 Cores 12 Threads | 65W"),
        ("Core i7-12700K", 8000000, "LGA1700", "12 Cores 20 Threads | 125W"),
        ("Core i9-13900K", 12500000, "LGA1700", "24 Cores 32 Threads | 125W"),
    ]
    amd_models = [
        ("Ryzen 5 3600", 1800000, "AM4", "6 Cores 12 Threads | 65W"),
        ("Ryzen 5 5600X", 3200000, "AM4", "6 Cores 12 Threads | 65W"),
        ("Ryzen 7 5700X", 4100000, "AM4", "8 Cores 16 Threads | 65W"),
        ("Ryzen 7 5800X3D", 7500000, "AM4", "8 Cores 16 Threads | 105W"),
        ("Ryzen 5 7600X", 5200000, "AM5", "6 Cores 12 Threads | 105W"),
        ("Ryzen 7 7700X", 7800000, "AM5", "8 Cores 16 Threads | 105W"),
        ("Ryzen 7 7800X3D", 10200000, "AM5", "8 Cores 16 Threads | 120W"),
        ("Ryzen 9 7900X", 11500000, "AM5", "12 Cores 24 Threads | 170W"),
        ("Ryzen 9 7950X", 15500000, "AM5", "16 Cores 32 Threads | 170W"),
    ]
    cpu_suffixes = ["Box Chính Hãng", "Tray", "Nhập Khẩu", "Box Fullbox"]
    cpu_pool = [(f"Intel CPU {m[0]}", m[1], m[2], m[3]) for m in intel_models] + \
               [(f"AMD CPU {m[0]}", m[1], m[2], m[3]) for m in amd_models]

    for _ in range(50):
        name, price, socket, spec = random.choice(cpu_pool)
        suffix = random.choice(cpu_suffixes)
        add_prod("CPU", f"{name} {suffix}", price + random.randint(-2, 2) * 100000, f"{socket} | {spec}")

    # --- 2. Mainboard ---
    main_brands = ["ASUS PRIME", "ASUS TUF Gaming", "ASUS ROG Strix", "MSI PRO", "MSI MAG Mortar", "GIGABYTE Aorus Elite", "ASRock Phantom Gaming"]
    main_chipsets = [
        ("H610M", "LGA1700", "DDR4", 1700000),
        ("B660M", "LGA1700", "DDR4", 2800000),
        ("B760M", "LGA1700", "DDR5", 3500000),
        ("Z790", "LGA1700", "DDR5", 6500000),
        ("H410M", "LGA1200", "DDR4", 1300000),
        ("B560M", "LGA1200", "DDR4", 2100000),
        ("B450M", "AM4", "DDR4", 1500000),
        ("B550M", "AM4", "DDR4", 2500000),
        ("X570", "AM4", "DDR4", 4000000),
        ("A620M", "AM5", "DDR5", 2200000),
        ("B650M", "AM5", "DDR5", 4200000),
        ("X670E", "AM5", "DDR5", 7500000),
    ]
    for _ in range(50):
        brand = random.choice(main_brands)
        chipset, socket, ram_type, price = random.choice(main_chipsets)
        ff = random.choice(["ATX", "Micro-ATX", "Mini-ITX"]) if "M" not in chipset else "Micro-ATX"
        add_prod("Mainboard", f"Mainboard {brand} {chipset}", price + random.randint(-3, 3) * 100000, f"{ff} | {socket} | {ram_type}")

    # --- 3. RAM ---
    ram_brands = [
        "Corsair Vengeance", "Kingston Fury Beast", "G.Skill Trident Z",
        "Adata XPG Lancer", "Teamgroup T-Force Delta", "PNY XLR8"
    ]
    ram_configs = [
        ("8GB (1x8GB) DDR4 3200MHz", "DDR4", 450000),
        ("16GB (2x8GB) DDR4 3200MHz", "DDR4", 950000),
        ("32GB (2x16GB) DDR4 3600MHz", "DDR4", 1900000),
        ("16GB (1x16GB) DDR5 4800MHz", "DDR5", 1100000),
        ("32GB (2x16GB) DDR5 5600MHz", "DDR5", 2100000),
        ("32GB (2x16GB) DDR5 6000MHz", "DDR5", 2900000),
        ("64GB (2x32GB) DDR5 6000MHz", "DDR5", 5500000),
    ]
    rgb_types = [" RGB", " ARGB", ""]
    for _ in range(50):
        brand = random.choice(ram_brands)
        cap_speed, ram_type, price = random.choice(ram_configs)
        rgb = random.choice(rgb_types)
        cap = cap_speed.split(" ")[0]
        speed = cap_speed.split(" ")[-1]
        add_prod("RAM", f"RAM {brand}{rgb} {cap} {speed}", price + random.randint(-1, 2) * 100000, cap_speed)

    # --- 4. VGA ---
    vga_brands = ["ASUS Dual", "ASUS ROG Strix", "MSI Ventus 2X", "MSI Gaming X Trio", "GIGABYTE Windforce", "ZOTAC Gaming Twin Edge"]
    vga_chips = [
        ("GTX 1650 4GB", 3200000, "75W"),
        ("RTX 3050 8GB", 5500000, "130W"),
        ("RTX 3060 12GB", 7500000, "170W"),
        ("RTX 3070 Ti 8GB", 11000000, "290W"),
        ("RTX 4060 8GB", 8500000, "115W"),
        ("RTX 4060 Ti 16GB", 12000000, "165W"),
        ("RTX 4070 SUPER 12GB", 17000000, "220W"),
        ("RTX 4080 SUPER 16GB", 32000000, "320W"),
        ("RX 6600 8GB", 5200000, "132W"),
        ("RX 6700 XT 12GB", 9500000, "230W"),
        ("RX 7800 XT 16GB", 14500000, "263W"),
    ]
    oc_types = [" OC Edition", " OC", " White OC", ""]
    for _ in range(50):
        brand = random.choice(vga_brands)
        chip, price, tdp = random.choice(vga_chips)
        oc = random.choice(oc_types)
        add_prod("VGA", f"Card Màn Hình {brand} {chip}{oc}", price + random.randint(-5, 5) * 100000, f"{chip.split(' ')[1]} | TDP: {tdp}")

    # --- 5. Nguồn (PSU) ---
    psu_brands = ["Corsair", "SeaSonic", "Cooler Master", "MSI MAG", "Xigmatek", "Deepcool", "Antec"]
    psu_configs = [
        (450, "80 Plus White", 650000),
        (550, "80 Plus Bronze", 950000),
        (650, "80 Plus Bronze Full Modular", 1400000),
        (750, "80 Plus Gold", 2100000),
        (850, "80 Plus Gold ATX 3.0", 3100000),
        (1000, "80 Plus Platinum", 4500000),
        (1200, "80 Plus Titanium", 7500000),
    ]
    for _ in range(50):
        brand = random.choice(psu_brands)
        watt, rating, price = random.choice(psu_configs)
        add_prod("Nguồn (PSU)", f"Nguồn {brand} {watt}W {rating}", price + random.randint(-1, 2) * 50000, f"{watt}W | {rating}")

    # --- 6. Vỏ Case ---
    case_brands = ["Montech Air", "Xigmatek Windmill", "Corsair 4000D", "NZXT H510", "Lian Li Lancool", "MIK Crusher", "Deepcool Matrexx"]
    colors = ["Black", "White", "Pink", "Gray"]
    case_types = ["ATX Mid Tower", "Micro-ATX Mini Tower", "Full Tower ATX", "Mini-ITX Desktop"]
    for _ in range(50):
        brand = random.choice(case_brands)
        color = random.choice(colors)
        case_type = random.choice(case_types)
        price = random.randint(5, 40) * 100000
        add_prod("Vỏ Case", f"Vỏ Case {brand} {color}", price, f"Hỗ trợ: {case_type} | Màu: {color} | Kèm Fan: {random.randint(0, 4)}")

    # --- 7. Ổ Cứng ---
    storage_brands = ["Samsung", "WD", "Kingston", "Crucial", "Seagate", "Lexar", "SK Hynix"]
    storage_configs = [
        ("256GB SSD SATA III", "SATA III 560MB/s", 500000),
        ("500GB SSD NVMe Gen 3", "NVMe PCIe 3.0 3500MB/s", 900000),
        ("1TB SSD NVMe Gen 4", "NVMe PCIe 4.0 7000MB/s", 1900000),
        ("2TB SSD NVMe Gen 4", "NVMe PCIe 4.0 7000MB/s", 3800000),
        ("1TB HDD 7200RPM", "SATA III 7200RPM 256MB Cache", 950000),
        ("2TB HDD 7200RPM", "SATA III 7200RPM 512MB Cache", 1600000),
    ]
    for _ in range(50):
        brand = random.choice(storage_brands)
        model_str, spec, price = random.choice(storage_configs)
        add_prod("Ổ Cứng", f"Ổ Cứng {brand} {model_str}", price + random.randint(-5, 5) * 10000, spec)

    # --- 8. Tản Nhiệt ---
    cooler_brands = ["Deepcool", "Thermalright", "Noctua", "Corsair", "NZXT", "be quiet!", "ID-Cooling"]
    cooler_configs = [
        ("Tản Khí Tháp Đơn", 450000, "Tản Khí | Hỗ trợ LGA1700/AM5"),
        ("Tản Khí Tháp Đôi ARGB", 950000, "Tản Khí Dual Fan | Hỗ trợ LGA1700/AM5"),
        ("Tản Nước AIO 240mm ARGB", 1800000, "Tản Nước AIO 240mm | Hỗ trợ LGA1700/AM5"),
        ("Tản Nước AIO 280mm ARGB", 2200000, "Tản Nước AIO 280mm | Hỗ trợ LGA1700/AM5"),
        ("Tản Nước AIO 360mm ARGB", 2800000, "Tản Nước AIO 360mm | Hỗ trợ LGA1700/AM5"),
    ]
    for _ in range(50):
        brand = random.choice(cooler_brands)
        type_str, price, spec = random.choice(cooler_configs)
        add_prod("Tản Nhiệt", f"Tản Nhiệt {brand} {type_str}", price + random.randint(-2, 5) * 100000, spec)

    return products
