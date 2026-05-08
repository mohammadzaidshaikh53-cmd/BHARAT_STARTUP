// lib/marketplace/taxonomy.js — Unified B2B Industry Taxonomy (SSoT)
// This is the single source of truth for all marketplace categories.
// Prepared for AI-native search and immersive 3D commerce.

export const MARKETPLACE_CATEGORIES = [
    {
        slug: 'fashion-textiles',
        title: 'Fashion & Textiles',
        shortTitle: 'Fashion',
        image: '/categories/fashion.png',
        banner: '/categories/banners/fashion-banner.jpg',
        icon: 'Shirt',
        color: 'from-pink-500 via-rose-500 to-red-500',
        accentColor: 'rose',
        featured: true,
        priority: 1,
        count: 12400,
        growth: '+23%',
        description: 'Apparel manufacturers, textile suppliers, apparel exporters, and fashion brands.',
        tags: ['Apparel', 'Garments', 'Textiles', 'Fashion', 'Exports'],
        certifications: ['OEKO-TEX', 'GOTS', 'BCI', 'GRS'],
        topCities: ['Surat', 'Ludhiana', 'Tirupur', 'Ahmedabad', 'Mumbai', 'Delhi'],
        avgOrderValue: '₹2.5L',
        moq: '500 units',
        subcategories: [
            { slug: 'mens-wear', title: "Men's Wear", count: 3200 },
            { slug: 'womens-wear', title: "Women's Wear", count: 4100 },
            { slug: 'kids-wear', title: "Kids' Wear", count: 1800 },
            { slug: 'fabrics-raw', title: 'Raw Fabrics', count: 2100 },
            { slug: 'yarns-fibers', title: 'Yarns & Fibers', count: 1500 },
            { slug: 'technical-textiles', title: 'Technical Textiles', count: 890 },
            { slug: 'home-textiles', title: 'Home Textiles', count: 1200 },
            { slug: 'denim', title: 'Denim & Jeanswear', count: 760 },
        ],
        seo: {
            title: 'Fashion & Textile Suppliers in India',
            description: 'Discover apparel manufacturers, textile suppliers, exporters, and garment businesses across India.',
        },
        immersive_config: {
            scene_id: 'textile_showroom',
            model_url: null, // Future GLB path
            ambient_light: 0.8,
            camera_pos: [0, 2, 5]
        },
        ai_metadata: {
            vector_boost: 1.2,
            industry_clusters: ['consumer_goods', 'manufacturing', 'apparel']
        }
    },
    {
        slug: 'electronics-electrical',
        title: 'Electronics & Electrical',
        shortTitle: 'Electronics',
        image: '/categories/electronics.png',
        banner: '/categories/banners/electronics-banner.jpg',
        icon: 'Cpu',
        color: 'from-blue-500 via-cyan-500 to-teal-400',
        accentColor: 'blue',
        featured: true,
        priority: 2,
        count: 28700,
        growth: '+31%',
        description: 'Electronic components, semiconductors, smart devices, and industrial automation.',
        tags: ['Electronics', 'PCB', 'IoT', 'Electrical', 'Components'],
        certifications: ['ISO 9001', 'IPC', 'RoHS', 'CE', 'UL'],
        topCities: ['Bangalore', 'Shenzhen', 'Gurugram', 'Noida', 'Hyderabad', 'Pune'],
        avgOrderValue: '₹5.8L',
        moq: '1000 units',
        subcategories: [
            { slug: 'semiconductors', title: 'Semiconductors & ICs', count: 4200 },
            { slug: 'passive-components', title: 'Passive Components', count: 3800 },
            { slug: 'pcba', title: 'PCB Assembly & Manufacturing', count: 2100 },
            { slug: 'consumer-electronics', title: 'Consumer Electronics', count: 5600 },
            { slug: 'industrial-automation', title: 'Industrial Automation', count: 3200 },
            { slug: 'led-lighting', title: 'LED & Lighting Solutions', count: 2800 },
            { slug: 'power-supplies', title: 'Power Supplies & Inverters', count: 1900 },
            { slug: 'cables-wires', title: 'Cables, Wires & Connectors', count: 4100 },
            { slug: 'telecom-equipment', title: 'Telecom Equipment', count: 1200 },
        ],
        seo: {
            title: 'Electronics Manufacturers & Suppliers',
            description: 'Find electronics suppliers, PCB manufacturers, electrical component businesses, and IoT startups.',
        },
        immersive_config: {
            scene_id: 'electronics_lab',
            model_url: null,
            ambient_light: 1.0,
            camera_pos: [2, 2, 8]
        },
        ai_metadata: {
            vector_boost: 1.5,
            industry_clusters: ['technology', 'industrial', 'hardware']
        }
    },
    {
        slug: 'machinery-industrial',
        title: 'Machinery & Industrial',
        shortTitle: 'Machinery',
        image: '/categories/machinery.png',
        banner: '/categories/banners/machinery-banner.jpg',
        icon: 'Cog',
        color: 'from-slate-600 via-gray-700 to-zinc-800',
        accentColor: 'slate',
        featured: true,
        priority: 3,
        count: 15600,
        growth: '+18%',
        description: 'Heavy machinery, CNC, packaging, automation, and engineering businesses.',
        tags: ['Industrial', 'Machines', 'Automation', 'Engineering'],
        certifications: ['ISO 9001', 'CE', 'OSHA', 'ISO 45001'],
        topCities: ['Ahmedabad', 'Pune', 'Rajkot', 'Coimbatore'],
        avgOrderValue: '₹12L',
        moq: '1 unit',
        subcategories: [
            { slug: 'cnc-machines', title: 'CNC Machines & Tools', count: 2100 },
            { slug: 'packaging-machinery', title: 'Packaging Machinery', count: 1800 },
            { slug: 'material-handling', title: 'Material Handling Equipment', count: 2400 },
            { slug: 'industrial-robots', title: 'Industrial Robotics', count: 890 },
            { slug: 'presses-stamping', title: 'Presses & Stamping', count: 1200 },
            { slug: 'welding-equipment', title: 'Welding & Cutting', count: 1600 },
            { slug: 'textile-machinery', title: 'Textile Machinery', count: 900 },
            { slug: 'food-processing', title: 'Food Processing Machinery', count: 1400 },
            { slug: 'plastic-machinery', title: 'Plastic Processing Machinery', count: 1100 },
            { slug: 'construction-equipment', title: 'Construction Equipment', count: 2300 },
        ],
        seo: {
            title: 'Industrial Machinery Suppliers in India',
            description: 'Find automation companies, industrial machine suppliers, heavy engineering firms, and machinery exporters.',
        },
        immersive_config: {
            scene_id: 'industrial_hall',
            model_url: null,
            ambient_light: 0.6,
            camera_pos: [5, 5, 15]
        },
        ai_metadata: {
            vector_boost: 1.1,
            industry_clusters: ['manufacturing', 'heavy_industry', 'engineering']
        }
    },
    {
        slug: 'food-beverage',
        title: 'Food & Beverage',
        shortTitle: 'Food',
        image: '/categories/food.png',
        banner: '/categories/banners/food-banner.jpg',
        icon: 'Apple',
        color: 'from-green-500 via-emerald-500 to-teal-600',
        accentColor: 'green',
        featured: true,
        priority: 4,
        count: 19800,
        growth: '+27%',
        description: 'FMCG, processed foods, beverages, ingredients, and packaged food suppliers.',
        tags: ['FMCG', 'Food', 'Beverages', 'Snacks'],
        certifications: ['FSSAI', 'ISO 22000', 'HACCP', 'USDA Organic', 'BRC'],
        topCities: ['Indore', 'Mumbai', 'Guwahati', 'Nashik', 'Ahmedabad', 'Delhi'],
        avgOrderValue: '₹3.2L',
        moq: '1000 kg',
        subcategories: [
            { slug: 'processed-foods', title: 'Processed & Packaged Foods', count: 4200 },
            { slug: 'beverages', title: 'Beverages & Soft Drinks', count: 2800 },
            { slug: 'dairy-products', title: 'Dairy & Dairy Alternatives', count: 1900 },
            { slug: 'spices-masalas', title: 'Spices & Masalas', count: 3600 },
            { slug: 'edible-oils', title: 'Edible Oils & Fats', count: 1200 },
            { slug: 'snacks-confectionery', title: 'Snacks & Confectionery', count: 2100 },
            { slug: 'organic-foods', title: 'Organic & Health Foods', count: 1500 },
            { slug: 'food-ingredients', title: 'Food Ingredients & Additives', count: 1800 },
            { slug: 'cold-chain', title: 'Cold Chain & Refrigeration', count: 700 },
        ],
        seo: {
            title: 'Food Processing & FMCG Suppliers',
            description: 'Discover packaged food suppliers, beverage brands, spice manufacturers, and FMCG startups.',
        },
        immersive_config: {
            scene_id: 'organic_market',
            model_url: null,
            ambient_light: 1.2,
            camera_pos: [0, 1.5, 4]
        },
        ai_metadata: {
            vector_boost: 1.0,
            industry_clusters: ['fmcg', 'agriculture', 'health']
        }
    },
    {
        slug: 'healthcare-pharma',
        title: 'Healthcare & Pharma',
        shortTitle: 'Health',
        image: '/categories/health.png',
        banner: '/categories/banners/health-banner.jpg',
        icon: 'HeartPulse',
        color: 'from-lime-500 via-green-500 to-emerald-600',
        accentColor: 'lime',
        featured: true,
        priority: 5,
        count: 12400,
        growth: '+34%',
        description: 'Pharmaceuticals, APIs, medical devices, diagnostics, and wellness manufacturers.',
        tags: ['Healthcare', 'Supplements', 'Fitness', 'Wellness'],
        certifications: ['GMP', 'FDA', 'CE', 'ISO 13485', 'WHO-GMP'],
        topCities: ['Hyderabad', 'Ahmedabad', 'Baddi', 'Vizag', 'Mumbai', 'Delhi', 'Bengaluru'],
        avgOrderValue: '₹8.5L',
        moq: 'Batch dependent',
        subcategories: [
            { slug: 'pharma-api', title: 'Pharmaceutical APIs', count: 1800 },
            { slug: 'formulations', title: 'Drug Formulations', count: 2100 },
            { slug: 'medical-devices', title: 'Medical Devices & Equipment', count: 3200 },
            { slug: 'diagnostics', title: 'Diagnostics & Testing Kits', count: 1400 },
            { slug: 'surgical-instruments', title: 'Surgical Instruments', count: 1100 },
            { slug: 'ppe-safety', title: 'PPE & Safety Equipment', count: 1600 },
            { slug: 'ayurvedic', title: 'Ayurvedic & Herbal', count: 900 },
            { slug: 'nutraceuticals', title: 'Nutraceuticals', count: 1200 },
            { slug: 'hospital-furniture', title: 'Hospital Furniture', count: 800 },
        ],
        seo: {
            title: 'Health & Wellness Suppliers',
            description: 'Explore supplement manufacturers, wellness startups, healthcare suppliers, and fitness brands.',
        },
        immersive_config: {
            scene_id: 'medical_showroom',
            model_url: null,
            ambient_light: 1.5,
            camera_pos: [0, 2, 6]
        },
        ai_metadata: {
            vector_boost: 1.4,
            industry_clusters: ['healthcare', 'pharma', 'science']
        }
    },
    {
        slug: 'automotive',
        title: 'Automotive & EV',
        shortTitle: 'Automotive',
        image: '/categories/automotive.jpg', // From lib
        icon: 'Car',
        color: 'from-red-600 via-rose-600 to-pink-600',
        featured: true,
        priority: 6,
        count: 22100,
        growth: '+42%',
        description: 'Auto components, EV parts, tyres, batteries, and charging infrastructure.',
        subcategories: [
            { slug: 'auto-components', title: 'Auto Components & Parts', count: 5600 },
            { slug: 'ev-components', title: 'EV Components & Batteries', count: 3200 },
            { slug: 'tyres-tubes', title: 'Tyres, Tubes & Wheels', count: 1800 },
            { slug: 'charging-infrastructure', title: 'EV Charging Infrastructure', count: 900 },
            { slug: 'two-wheeler-parts', title: 'Two-Wheeler Parts', count: 2400 },
            { slug: 'commercial-vehicle', title: 'Commercial Vehicle Parts', count: 1600 },
            { slug: 'automotive-electronics', title: 'Automotive Electronics', count: 2100 },
            { slug: 'aftermarket', title: 'Aftermarket & Accessories', count: 2800 },
            { slug: 'lubricants', title: 'Lubricants & Fluids', count: 1200 },
            { slug: 'sheet-metal', title: 'Sheet Metal & Fabrication', count: 700 },
        ],
        certifications: ['IATF 16949', 'ISO 26262', 'AIS', 'ARAI'],
        topCities: ['Chennai', 'Pune', 'Manesar', 'Sanand'],
        avgOrderValue: '₹6.2L',
        moq: '500 units',
        immersive_config: {
            scene_id: 'auto_expo_hall',
            model_url: null,
            ambient_light: 1.1,
            camera_pos: [10, 2, 20]
        },
        ai_metadata: {
            vector_boost: 1.3,
            industry_clusters: ['automotive', 'ev', 'transportation']
        }
    },
    {
        slug: 'footwear-shoes',
        title: 'Footwear & Shoes',
        shortTitle: 'Shoes',
        image: '/categories/shoes.png',
        banner: '/categories/banners/shoes-banner.jpg',
        icon: 'Footprints',
        color: 'from-orange-500 via-red-500 to-amber-500',
        accentColor: 'orange',
        featured: true,
        priority: 2, // From app/constants
        count: 5400, // Merged from lib's leather-goods or similar
        growth: '+18%',
        description: 'Sneaker brands, footwear factories, leather exporters, and shoe manufacturers.',
        tags: ['Sneakers', 'Footwear', 'Leather', 'Sports Shoes'],
        certifications: ['LEAF', 'ISO 9001', 'BIS', 'REACH'],
        topCities: ['Agra', 'Delhi', 'Mumbai', 'Kanpur', 'Chennai', 'Kolkata'],
        avgOrderValue: '₹3.5L',
        moq: '500 pairs',
        subcategories: [
            { slug: 'sports-shoes', title: 'Sports Shoes', count: 210 },
            { slug: 'formal-shoes', title: 'Formal Shoes', count: 160 },
            { slug: 'sandals', title: 'Sandals', count: 120 },
            { slug: 'boots', title: 'Boots', count: 90 },
            { slug: 'finished-leather', title: 'Finished Leather', count: 900 },
            { slug: 'footwear-manufacturing', title: 'Footwear Manufacturing', count: 1800 },
        ],
        seo: {
            title: 'Footwear Manufacturers & Shoe Suppliers',
            description: 'Explore footwear suppliers, sneaker manufacturers, leather exporters, and wholesale shoe businesses.',
        },
        immersive_config: {
            scene_id: 'footwear_loft',
            model_url: null,
            ambient_light: 0.9,
            camera_pos: [0, 1, 3]
        },
        ai_metadata: {
            vector_boost: 1.0,
            industry_clusters: ['consumer_goods', 'fashion', 'footwear']
        }
    },
    {
        slug: 'beauty-personal-care',
        title: 'Beauty & Personal Care',
        shortTitle: 'Beauty',
        image: '/categories/beauty.png',
        banner: '/categories/banners/beauty-banner.jpg',
        icon: 'Sparkles',
        color: 'from-fuchsia-500 via-pink-500 to-rose-500',
        accentColor: 'pink',
        featured: true,
        priority: 4,
        count: 540,
        growth: '+29%',
        description: 'Skincare brands, cosmetic suppliers, salons, beauty startups, and wellness manufacturers.',
        tags: ['Cosmetics', 'Skincare', 'Beauty', 'Salon', 'Wellness'],
        topCities: ['Mumbai', 'Delhi', 'Ahmedabad', 'Bengaluru'],
        subcategories: [
            { slug: 'skincare', title: 'Skincare', count: 180 },
            { slug: 'makeup', title: 'Makeup', count: 120 },
            { slug: 'haircare', title: 'Haircare', count: 90 },
            { slug: 'organic-beauty', title: 'Organic Beauty', count: 60 },
        ],
        seo: {
            title: 'Beauty Product Manufacturers & Suppliers',
            description: 'Discover cosmetic suppliers, skincare brands, wellness startups, and personal care manufacturers.',
        },
        immersive_config: {
            scene_id: 'beauty_boutique',
            model_url: null,
            ambient_light: 1.3,
            camera_pos: [0, 1.8, 5]
        },
        ai_metadata: {
            vector_boost: 1.1,
            industry_clusters: ['consumer_goods', 'beauty', 'wellness']
        }
    },
    {
        slug: 'furniture-interiors',
        title: 'Furniture & Interiors',
        shortTitle: 'Furniture',
        image: '/categories/furniture.png',
        banner: '/categories/banners/furniture-banner.jpg',
        icon: 'Sofa',
        color: 'from-amber-500 via-yellow-500 to-orange-600',
        accentColor: 'amber',
        featured: false,
        priority: 5,
        count: 320,
        growth: '+11%',
        description: 'Furniture manufacturers, office interior suppliers, home decor brands, and modular design companies.',
        tags: ['Furniture', 'Interior', 'Home Decor', 'Office'],
        topCities: ['Jodhpur', 'Delhi', 'Mumbai', 'Bengaluru'],
        subcategories: [
            { slug: 'office-furniture', title: 'Office Furniture', count: 90 },
            { slug: 'home-furniture', title: 'Home Furniture', count: 140 },
            { slug: 'modular-kitchens', title: 'Modular Kitchens', count: 40 },
        ],
        seo: {
            title: 'Furniture Manufacturers & Interior Suppliers',
            description: 'Explore furniture factories, office interior suppliers, modular kitchen manufacturers, and decor brands.',
        },
        immersive_config: {
            scene_id: 'modern_home_showroom',
            model_url: null,
            ambient_light: 0.85,
            camera_pos: [2, 2, 10]
        },
        ai_metadata: {
            vector_boost: 1.0,
            industry_clusters: ['home_decor', 'manufacturing', 'interiors']
        }
    },
    // ... Any other verticals from lib/marketplace/categories.js that weren't in app/constants
    {
        slug: 'chemicals-materials',
        title: 'Chemicals & Materials',
        image: '/categories/chemicals.jpg',
        icon: 'FlaskConical',
        color: 'from-violet-500 via-purple-500 to-fuchsia-500',
        featured: false,
        priority: 7,
        count: 18700,
        growth: '+15%',
        description: 'Industrial chemicals, polymers, paints, coatings, adhesives',
        subcategories: [
            { slug: 'industrial-chemicals', title: 'Industrial Chemicals', count: 4200 },
            { slug: 'polymers-resins', title: 'Polymers & Resins', count: 2800 },
            { slug: 'paints-coatings', title: 'Paints & Coatings', count: 2100 },
            { slug: 'adhesives-sealants', title: 'Adhesives & Sealants', count: 1600 },
            { slug: 'specialty-chemicals', title: 'Specialty Chemicals', count: 1900 },
            { slug: 'fertilizers', title: 'Fertilizers & Agrochemicals', count: 1400 },
            { slug: 'petrochemicals', title: 'Petrochemicals', count: 1200 },
            { slug: 'nanomaterials', title: 'Nanomaterials & Advanced', count: 500 },
        ],
        certifications: ['ISO 14001', 'REACH', 'GHS', 'BIS'],
        topCities: ['Ankleshwar', 'Vapi', 'Mumbai', 'Chennai'],
        avgOrderValue: '₹4.5L',
        moq: '1000 kg',
    },
    {
        slug: 'building-construction',
        title: 'Building & Construction',
        image: '/categories/construction.jpg',
        icon: 'HardHat',
        color: 'from-amber-500 via-yellow-500 to-orange-500',
        featured: false,
        priority: 8,
        count: 24300,
        growth: '+12%',
        description: 'Cement, steel, tiles, sanitary ware, construction chemicals',
        subcategories: [
            { slug: 'cement-concrete', title: 'Cement & Concrete', count: 1200 },
            { slug: 'steel-structural', title: 'Steel & Structural Materials', count: 3200 },
            { slug: 'tiles-ceramics', title: 'Tiles & Ceramics', count: 2800 },
            { slug: 'sanitary-ware', title: 'Sanitary Ware & Fittings', count: 1900 },
            { slug: 'construction-chemicals', title: 'Construction Chemicals', count: 1400 },
            { slug: 'doors-windows', title: 'Doors, Windows & Glass', count: 2100 },
            { slug: 'electrical-fittings', title: 'Electrical Fittings', count: 2600 },
            { slug: 'plumbing', title: 'Plumbing & Pipes', count: 1800 },
            { slug: 'wood-plywood', title: 'Wood, Plywood & Laminates', count: 1600 },
            { slug: 'modular-kitchen', title: 'Modular Kitchen & Furniture', count: 1200 },
            { slug: 'waterproofing', title: 'Waterproofing & Insulation', count: 900 },
            { slug: 'scaffolding', title: 'Scaffolding & Formwork', count: 700 },
        ],
        certifications: ['ISO 9001', 'BIS', 'Green Building', 'LEED'],
        topCities: ['Morbi', 'Jhagadia', 'Bhilwara', 'Kolkata'],
        avgOrderValue: '₹7.8L',
        moq: 'Lot basis',
    },
    {
        slug: 'it-software',
        title: 'IT & Software Services',
        image: '/categories/it-software.jpg',
        icon: 'Code2',
        color: 'from-cyan-400 via-blue-500 to-indigo-500',
        featured: false,
        priority: 13,
        count: 15400,
        growth: '+38%',
        description: 'SaaS, enterprise software, AI/ML, cloud, cybersecurity, IoT',
        subcategories: [
            { slug: 'enterprise-software', title: 'Enterprise Software', count: 3200 },
            { slug: 'saas', title: 'SaaS Solutions', count: 2800 },
            { slug: 'ai-ml', title: 'AI & Machine Learning', count: 1900 },
            { slug: 'cloud-services', title: 'Cloud & DevOps', count: 2100 },
            { slug: 'cybersecurity', title: 'Cybersecurity', count: 1400 },
            { slug: 'iot', title: 'IoT & Embedded Systems', count: 1200 },
            { slug: 'blockchain', title: 'Blockchain & Web3', count: 600 },
            { slug: 'data-analytics', title: 'Data Analytics & BI', count: 1600 },
            { slug: 'mobile-apps', title: 'Mobile App Development', count: 1400 },
            { slug: 'erp-crm', title: 'ERP & CRM Implementation', count: 1100 },
        ],
        certifications: ['ISO 27001', 'SOC 2', 'CMMI', 'GDPR'],
        topCities: ['Bangalore', 'Hyderabad', 'Pune', 'Chennai'],
        avgOrderValue: '₹15L/project',
        moq: 'Project basis',
    },
];

// ─── HELPERS & DERIVED CONSTANTS ───

export const FEATURED_CATEGORIES =
    MARKETPLACE_CATEGORIES.filter(c => c.featured).sort((a, b) => a.priority - b.priority);

export const ALL_CATEGORIES_SORTED =
    [...MARKETPLACE_CATEGORIES].sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return (b.count || 0) - (a.count || 0);
    });

export const getCategoryBySlug = (slug) =>
    MARKETPLACE_CATEGORIES.find(c => c.slug === slug);

export const getSubcategoryBySlug = (categorySlug, subcategorySlug) => {
    const category = getCategoryBySlug(categorySlug);
    return category?.subcategories?.find(sub => sub.slug === subcategorySlug);
};

export const getAllSubcategories = () =>
    MARKETPLACE_CATEGORIES.flatMap(c =>
        c.subcategories?.map(s => ({ ...s, parent: c.slug, parentCategory: c.slug, parentTitle: c.title })) || []
    );

export const getCategoryStats = () => {
    return MARKETPLACE_CATEGORIES.reduce(
        (acc, category) => {
            acc.totalCategories += 1;
            acc.totalSuppliers += (category.count || 0);
            if (category.featured) acc.featuredCategories += 1;
            return acc;
        },
        {
            totalCategories: 0,
            totalSuppliers: 0,
            featuredCategories: 0,
            total: MARKETPLACE_CATEGORIES.reduce((sum, c) => sum + (c.count || 0), 0),
            totalSubcategories: getAllSubcategories().length,
            fastestGrowing: [...MARKETPLACE_CATEGORIES].sort((a, b) =>
                parseFloat(b.growth || 0) - parseFloat(a.growth || 0)
            )[0],
        }
    );
};
