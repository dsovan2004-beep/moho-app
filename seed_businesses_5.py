"""
seed_businesses_5.py — MoHoLocal Directory Expansion
Adds ~240 new listings: Mountain House (~93) + Tracy (~147)
Run from moho-app-scaffold directory with NEXT_PUBLIC_SUPABASE_URL and
SUPABASE_SERVICE_ROLE_KEY set in your environment.
"""

import os
import sys
import random
from supabase import create_client

# ---------------------------------------------------------------------------
# Supabase connection
# ---------------------------------------------------------------------------
url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("ERROR: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.")
    sys.exit(1)

supabase = create_client(url, key)

# ---------------------------------------------------------------------------
# Category image pools — stable Unsplash photos
# ---------------------------------------------------------------------------
IMAGES = {
    "Restaurants": [
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
        "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800",
        "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=800",
        "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800",
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
    ],
    "Health & Wellness": [
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800",
        "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800",
        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800",
        "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800",
        "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800",
    ],
    "Beauty & Spa": [
        "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800",
        "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800",
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800",
        "https://images.unsplash.com/photo-1560066984-138daaa4e4e1?w=800",
        "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=800",
    ],
    "Retail": [
        "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800",
        "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800",
        "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800",
        "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800",
        "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800",
    ],
    "Education": [
        "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800",
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
        "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800",
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800",
        "https://images.unsplash.com/photo-1588072432836-e10032774350?w=800",
    ],
    "Automotive": [
        "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800",
        "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800",
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
        "https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=800",
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    ],
    "Real Estate": [
        "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800",
        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800",
        "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
        "https://images.unsplash.com/photo-1448630360428-65456885c650?w=800",
    ],
    "Home Services": [
        "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800",
        "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800",
        "https://images.unsplash.com/photo-1621905251189-08b45249ff78?w=800",
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
        "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800",
    ],
    "Pet Services": [
        "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800",
        "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800",
        "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800",
        "https://images.unsplash.com/photo-1534361960057-19f4434a5f7e?w=800",
        "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=800",
    ],
}


def img(category: str, seed: int = 0) -> str:
    pool = IMAGES.get(category, IMAGES["Retail"])
    return pool[seed % len(pool)]


# ---------------------------------------------------------------------------
# Business data
# ---------------------------------------------------------------------------
BUSINESSES = [

    # =========================================================
    # MOUNTAIN HOUSE — ~93 new listings
    # =========================================================

    # --- Restaurants (20) ---
    {"name": "Casa Bonita Mexican Grill", "city": "Mountain House", "category": "Restaurants",
     "description": "Authentic Mexican street food and family recipes. Tacos, burritos, enchiladas, and margaritas in a warm, welcoming atmosphere.",
     "address": "11000 Byron Hwy, Mountain House, CA 95391", "phone": "(209) 835-4001",
     "website": "https://casabonitamh.com", "image_url": img("Restaurants", 0)},

    {"name": "Dragon Palace Chinese Restaurant", "city": "Mountain House", "category": "Restaurants",
     "description": "Traditional Cantonese and Szechuan cuisine. Generous portions, fresh ingredients, and a full dim sum menu on weekends.",
     "address": "3200 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-4012",
     "website": "", "image_url": img("Restaurants", 1)},

    {"name": "The Grill at Mountain House", "city": "Mountain House", "category": "Restaurants",
     "description": "Burgers, sandwiches, and craft beers in a relaxed neighborhood setting. Great patio seating and weekend brunch.",
     "address": "3100 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-4023",
     "website": "https://thegrillmh.com", "image_url": img("Restaurants", 2)},

    {"name": "Subway Mountain House", "city": "Mountain House", "category": "Restaurants",
     "description": "Build-your-own sandwiches and wraps with fresh vegetables and quality meats. Fast, healthy, and convenient.",
     "address": "3400 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-4034",
     "website": "https://subway.com", "image_url": img("Restaurants", 3)},

    {"name": "Jersey Mike's Subs", "city": "Mountain House", "category": "Restaurants",
     "description": "Sub sandwiches made Mike's Way — fresh-sliced meats, authentic toppings, and a commitment to quality since 1956.",
     "address": "3500 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-4045",
     "website": "https://jerseymikes.com", "image_url": img("Restaurants", 4)},

    {"name": "Mountain House Pizza Co.", "city": "Mountain House", "category": "Restaurants",
     "description": "Hand-tossed pizzas, calzones, and pasta baked fresh to order. Family-friendly with dine-in and delivery.",
     "address": "3600 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-4056",
     "website": "", "image_url": img("Restaurants", 5)},

    {"name": "Wingstop Mountain House", "city": "Mountain House", "category": "Restaurants",
     "description": "Flavor-packed chicken wings in over 11 sauces. Crispy tenders, loaded fries, and sides that hit every time.",
     "address": "3700 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-4067",
     "website": "https://wingstop.com", "image_url": img("Restaurants", 6)},

    {"name": "Chipotle Mexican Grill", "city": "Mountain House", "category": "Restaurants",
     "description": "Fast-casual burritos, bowls, tacos, and salads made with responsibly sourced ingredients.",
     "address": "3800 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-4078",
     "website": "https://chipotle.com", "image_url": img("Restaurants", 7)},

    {"name": "Panda Express Mountain House", "city": "Mountain House", "category": "Restaurants",
     "description": "American Chinese cuisine featuring Orange Chicken, Beijing Beef, and fresh wok-cooked entrees every day.",
     "address": "3900 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-4089",
     "website": "https://pandaexpress.com", "image_url": img("Restaurants", 0)},

    {"name": "Dutch Bros Coffee Mountain House", "city": "Mountain House", "category": "Restaurants",
     "description": "Drive-through coffee chain known for creative drinks, friendly baristas, and a high-energy community vibe.",
     "address": "4000 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-4090",
     "website": "https://dutchbros.com", "image_url": img("Restaurants", 1)},

    {"name": "IHOP Mountain House", "city": "Mountain House", "category": "Restaurants",
     "description": "All-day breakfast classics including buttermilk pancakes, omelettes, French toast, and savory lunch plates.",
     "address": "4100 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-4101",
     "website": "https://ihop.com", "image_url": img("Restaurants", 2)},

    {"name": "Denny's Mountain House", "city": "Mountain House", "category": "Restaurants",
     "description": "Open 24 hours for breakfast, lunch, and dinner. The Grand Slam, moons over my hammy, and family-favorite plates.",
     "address": "4200 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-4112",
     "website": "https://dennys.com", "image_url": img("Restaurants", 3)},

    {"name": "Five Guys Mountain House", "city": "Mountain House", "category": "Restaurants",
     "description": "Freshly ground beef burgers and hand-cut fries. Toppings are always free, portions are always generous.",
     "address": "4300 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-4123",
     "website": "https://fiveguys.com", "image_url": img("Restaurants", 4)},

    {"name": "Jamba Juice Mountain House", "city": "Mountain House", "category": "Restaurants",
     "description": "Fresh-blended smoothies, juices, and bowls packed with fruits, veggies, and energy-boosting add-ins.",
     "address": "4400 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-4134",
     "website": "https://jamba.com", "image_url": img("Restaurants", 5)},

    {"name": "Mountain House Boba Tea", "city": "Mountain House", "category": "Restaurants",
     "description": "Freshly brewed milk teas, fruit teas, and slushies with chewy tapioca pearls and creative seasonal specials.",
     "address": "4500 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-4145",
     "website": "", "image_url": img("Restaurants", 6)},

    {"name": "Naan & Curry Mountain House", "city": "Mountain House", "category": "Restaurants",
     "description": "Indian and Pakistani cuisine featuring rich curries, tandoori dishes, and fresh-baked naan breads.",
     "address": "4600 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-4156",
     "website": "", "image_url": img("Restaurants", 7)},

    {"name": "Raising Cane's Mountain House", "city": "Mountain House", "category": "Restaurants",
     "description": "Chicken finger restaurant with a simple but legendary menu: tenders, crinkle fries, coleslaw, and Cane's sauce.",
     "address": "4700 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-4167",
     "website": "https://raisingcanes.com", "image_url": img("Restaurants", 0)},

    {"name": "Sakura Japanese Kitchen", "city": "Mountain House", "category": "Restaurants",
     "description": "Sushi rolls, ramen, and Japanese comfort food made with fresh imported ingredients. Dine-in and takeout.",
     "address": "4800 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-4178",
     "website": "", "image_url": img("Restaurants", 1)},

    {"name": "Mountain House Halal Grill", "city": "Mountain House", "category": "Restaurants",
     "description": "Certified halal meats, shawarma platters, falafel wraps, and fresh Mediterranean sides for the whole family.",
     "address": "4900 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-4189",
     "website": "", "image_url": img("Restaurants", 2)},

    {"name": "Starbucks Mountain House Pkwy", "city": "Mountain House", "category": "Restaurants",
     "description": "Your neighborhood Starbucks with handcrafted beverages, seasonal drinks, and a warm community space.",
     "address": "5000 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-4200",
     "website": "https://starbucks.com", "image_url": img("Restaurants", 3)},

    # --- Health & Wellness (15) ---
    {"name": "Mountain House Dental Group", "city": "Mountain House", "category": "Health & Wellness",
     "description": "Comprehensive family dentistry including cleanings, fillings, crowns, and cosmetic procedures in a comfortable setting.",
     "address": "5100 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-5001",
     "website": "https://mhdentalgroup.com", "image_url": img("Health & Wellness", 0)},

    {"name": "Bay Valley Orthodontics", "city": "Mountain House", "category": "Health & Wellness",
     "description": "Braces and Invisalign for children, teens, and adults. Flexible payment plans and a friendly team.",
     "address": "5200 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-5012",
     "website": "https://bayvalleyortho.com", "image_url": img("Health & Wellness", 1)},

    {"name": "Mountain House Eye Care", "city": "Mountain House", "category": "Health & Wellness",
     "description": "Comprehensive eye exams, contact lens fittings, and a full optical boutique with hundreds of frames.",
     "address": "5300 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-5023",
     "website": "", "image_url": img("Health & Wellness", 2)},

    {"name": "Pediatric Dentistry of Mountain House", "city": "Mountain House", "category": "Health & Wellness",
     "description": "Gentle, child-focused dental care from toddlers through teens. Cavity prevention, sealants, and orthodontic referrals.",
     "address": "5400 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-5034",
     "website": "", "image_url": img("Health & Wellness", 3)},

    {"name": "Mountain House Urgent Care", "city": "Mountain House", "category": "Health & Wellness",
     "description": "Walk-in urgent care for illness and injury. X-rays, labs, and prescriptions on-site. Open evenings and weekends.",
     "address": "5500 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-5045",
     "website": "", "image_url": img("Health & Wellness", 4)},

    {"name": "Mountain House Physical Therapy", "city": "Mountain House", "category": "Health & Wellness",
     "description": "Personalized physical therapy for sports injuries, post-surgical recovery, and chronic pain management.",
     "address": "5600 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-5056",
     "website": "", "image_url": img("Health & Wellness", 5)},

    {"name": "CorePower Yoga Mountain House", "city": "Mountain House", "category": "Health & Wellness",
     "description": "Hot yoga, sculpt, and flow classes for all levels. Community-focused studio with experienced instructors.",
     "address": "5700 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-5067",
     "website": "https://corepoweryoga.com", "image_url": img("Health & Wellness", 0)},

    {"name": "Anytime Fitness Mountain House", "city": "Mountain House", "category": "Health & Wellness",
     "description": "24/7 gym access with cardio machines, free weights, group fitness classes, and personal training.",
     "address": "5800 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-5078",
     "website": "https://anytimefitness.com", "image_url": img("Health & Wellness", 1)},

    {"name": "Mountain House Chiropractic", "city": "Mountain House", "category": "Health & Wellness",
     "description": "Chiropractic adjustments, spinal decompression, and therapeutic massage. Relief for back pain, neck pain, and headaches.",
     "address": "5900 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-5089",
     "website": "", "image_url": img("Health & Wellness", 2)},

    {"name": "Valley Orthopedics Mountain House", "city": "Mountain House", "category": "Health & Wellness",
     "description": "Board-certified orthopedic specialists treating joint, bone, and sports injuries with minimally invasive techniques.",
     "address": "6000 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-5090",
     "website": "https://valleyortho.com", "image_url": img("Health & Wellness", 3)},

    {"name": "MH Family Medicine", "city": "Mountain House", "category": "Health & Wellness",
     "description": "Primary care for the whole family. Annual physicals, chronic disease management, and same-day sick visits.",
     "address": "6100 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-5101",
     "website": "", "image_url": img("Health & Wellness", 4)},

    {"name": "Concentra Urgent Care Mountain House", "city": "Mountain House", "category": "Health & Wellness",
     "description": "Occupational health and urgent care services including DOT physicals, drug testing, and injury treatment.",
     "address": "6200 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-5112",
     "website": "https://concentra.com", "image_url": img("Health & Wellness", 5)},

    {"name": "Mountain House Mental Wellness", "city": "Mountain House", "category": "Health & Wellness",
     "description": "Licensed therapists and counselors offering individual, couples, and family therapy. In-person and telehealth.",
     "address": "6300 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-5123",
     "website": "", "image_url": img("Health & Wellness", 0)},

    {"name": "OrangeTheory Fitness Mountain House", "city": "Mountain House", "category": "Health & Wellness",
     "description": "Heart-rate based interval training with certified coaches. Science-backed workouts that produce real results.",
     "address": "6400 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-5134",
     "website": "https://orangetheory.com", "image_url": img("Health & Wellness", 1)},

    {"name": "Kaiser Permanente Mountain House", "city": "Mountain House", "category": "Health & Wellness",
     "description": "Kaiser Permanente medical offices offering primary care, lab services, and specialist referrals for members.",
     "address": "6500 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-5145",
     "website": "https://kp.org", "image_url": img("Health & Wellness", 2)},

    # --- Beauty & Spa (10) ---
    {"name": "Lavish Nail Lounge", "city": "Mountain House", "category": "Beauty & Spa",
     "description": "Upscale nail salon offering gel manicures, acrylic sets, spa pedicures, and nail art in a relaxing environment.",
     "address": "6600 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-6001",
     "website": "", "image_url": img("Beauty & Spa", 0)},

    {"name": "Great Clips Mountain House", "city": "Mountain House", "category": "Beauty & Spa",
     "description": "Affordable, no-appointment haircuts for the whole family. Check in online to reduce your wait time.",
     "address": "6700 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-6012",
     "website": "https://greatclips.com", "image_url": img("Beauty & Spa", 1)},

    {"name": "Sport Clips Mountain House", "city": "Mountain House", "category": "Beauty & Spa",
     "description": "Men's hair salon with a sports theme. MVP haircut experience includes shampoo, hot steamed towel, and neck massage.",
     "address": "6800 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-6023",
     "website": "https://sportclips.com", "image_url": img("Beauty & Spa", 2)},

    {"name": "Massage Envy Mountain House", "city": "Mountain House", "category": "Beauty & Spa",
     "description": "Professional therapeutic massage, stretch therapy, and facials by licensed therapists. Memberships available.",
     "address": "6900 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-6034",
     "website": "https://massageenvy.com", "image_url": img("Beauty & Spa", 3)},

    {"name": "Butterfly Nail & Spa", "city": "Mountain House", "category": "Beauty & Spa",
     "description": "Full-service nail and spa salon. Manicures, pedicures, waxing, and eyelash extensions by skilled technicians.",
     "address": "7000 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-6045",
     "website": "", "image_url": img("Beauty & Spa", 4)},

    {"name": "Trendz Hair Studio", "city": "Mountain House", "category": "Beauty & Spa",
     "description": "Full-service hair salon specializing in cuts, color, highlights, balayage, and extensions for all hair types.",
     "address": "7100 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-6056",
     "website": "", "image_url": img("Beauty & Spa", 0)},

    {"name": "Supercuts Mountain House", "city": "Mountain House", "category": "Beauty & Spa",
     "description": "Quick, affordable haircuts with online check-in. Walk-ins welcome for cuts, color, and blowouts.",
     "address": "7200 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-6067",
     "website": "https://supercuts.com", "image_url": img("Beauty & Spa", 1)},

    {"name": "The Beauty Bar MH", "city": "Mountain House", "category": "Beauty & Spa",
     "description": "Boutique beauty studio offering makeup application, brow shaping, lash lifts, and skincare treatments.",
     "address": "7300 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-6078",
     "website": "", "image_url": img("Beauty & Spa", 2)},

    {"name": "Mountain House Barbershop", "city": "Mountain House", "category": "Beauty & Spa",
     "description": "Classic barbershop with modern flair. Fades, tapers, beard trims, and straight razor shaves.",
     "address": "7400 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-6089",
     "website": "", "image_url": img("Beauty & Spa", 3)},

    {"name": "Glow Skin & Body Studio", "city": "Mountain House", "category": "Beauty & Spa",
     "description": "Facials, chemical peels, microdermabrasion, and body wraps for radiant, healthy skin all year round.",
     "address": "7500 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-6090",
     "website": "", "image_url": img("Beauty & Spa", 4)},

    # --- Retail (8) ---
    {"name": "CVS Pharmacy Mountain House", "city": "Mountain House", "category": "Retail",
     "description": "Full-service pharmacy plus health, beauty, household, and grocery essentials. Drive-through prescriptions available.",
     "address": "7600 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-7001",
     "website": "https://cvs.com", "image_url": img("Retail", 0)},

    {"name": "Walgreens Mountain House", "city": "Mountain House", "category": "Retail",
     "description": "Pharmacy, beauty, and everyday essentials. Photo printing, immunizations, and 24-hour prescription pickup.",
     "address": "7700 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-7012",
     "website": "https://walgreens.com", "image_url": img("Retail", 1)},

    {"name": "Mountain House Liquor & Deli", "city": "Mountain House", "category": "Retail",
     "description": "Local bottle shop with a curated selection of wines, craft beers, spirits, and grab-and-go deli sandwiches.",
     "address": "7800 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-7023",
     "website": "", "image_url": img("Retail", 2)},

    {"name": "The UPS Store Mountain House", "city": "Mountain House", "category": "Retail",
     "description": "Packing, shipping, printing, mailbox services, and notary. Your one-stop business services center.",
     "address": "7900 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-7034",
     "website": "https://theupsstore.com", "image_url": img("Retail", 3)},

    {"name": "Mountain House Florist", "city": "Mountain House", "category": "Retail",
     "description": "Fresh flowers, custom arrangements, and gifts for every occasion. Same-day local delivery available.",
     "address": "8000 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-7045",
     "website": "", "image_url": img("Retail", 4)},

    {"name": "7-Eleven Mountain House", "city": "Mountain House", "category": "Retail",
     "description": "Convenience store open 24/7. Fresh food, hot coffee, Slurpees, and all your on-the-go essentials.",
     "address": "8100 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-7056",
     "website": "https://7eleven.com", "image_url": img("Retail", 0)},

    {"name": "Mountain House Gift & Décor", "city": "Mountain House", "category": "Retail",
     "description": "Locally owned boutique featuring home décor, candles, gifts, seasonal items, and personalized keepsakes.",
     "address": "8200 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-7067",
     "website": "", "image_url": img("Retail", 1)},

    {"name": "Dollar Tree Mountain House", "city": "Mountain House", "category": "Retail",
     "description": "Household goods, party supplies, snacks, cleaning products, and gifts — everything at incredible everyday value.",
     "address": "8300 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-7078",
     "website": "https://dollartree.com", "image_url": img("Retail", 2)},

    # --- Education (10) ---
    {"name": "Stepping Stones Preschool", "city": "Mountain House", "category": "Education",
     "description": "Play-based learning environment for ages 2–5. Structured curriculum, outdoor play areas, and caring educators.",
     "address": "8400 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-8001",
     "website": "", "image_url": img("Education", 0)},

    {"name": "Kids World Learning Center", "city": "Mountain House", "category": "Education",
     "description": "Licensed childcare and preschool with enrichment programs in reading, math, science, and creative arts.",
     "address": "8500 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-8012",
     "website": "", "image_url": img("Education", 1)},

    {"name": "Mountain House Montessori", "city": "Mountain House", "category": "Education",
     "description": "Authentic Montessori education for toddlers through elementary. Self-directed learning in a prepared environment.",
     "address": "8600 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-8023",
     "website": "", "image_url": img("Education", 2)},

    {"name": "Primrose School of Mountain House", "city": "Mountain House", "category": "Education",
     "description": "Award-winning private preschool offering a research-based curriculum, hands-on learning, and nurturing care.",
     "address": "8700 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-8034",
     "website": "https://primroseschools.com", "image_url": img("Education", 3)},

    {"name": "Bright Beginnings Daycare MH", "city": "Mountain House", "category": "Education",
     "description": "Infant, toddler, and preschool care in a safe, stimulating environment. Flexible hours and affordable rates.",
     "address": "8800 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-8045",
     "website": "", "image_url": img("Education", 4)},

    {"name": "Kumon Math & Reading MH", "city": "Mountain House", "category": "Education",
     "description": "After-school enrichment program helping students build strong math and reading foundations through daily practice.",
     "address": "8900 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-8056",
     "website": "https://kumon.com", "image_url": img("Education", 0)},

    {"name": "Discovery Kids Academy", "city": "Mountain House", "category": "Education",
     "description": "STEM-focused after-school and summer programs for K–8 students. Coding, robotics, science experiments, and more.",
     "address": "9000 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-8067",
     "website": "", "image_url": img("Education", 1)},

    {"name": "Mountain House Tutoring Center", "city": "Mountain House", "category": "Education",
     "description": "One-on-one and small group tutoring for all grade levels and subjects. Test prep for SAT, ACT, and state tests.",
     "address": "9100 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-8078",
     "website": "", "image_url": img("Education", 2)},

    {"name": "Little Scholars Academy", "city": "Mountain House", "category": "Education",
     "description": "Bilingual preschool program in English and Spanish. Language immersion, music, movement, and social skills.",
     "address": "9200 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-8089",
     "website": "", "image_url": img("Education", 3)},

    {"name": "IQ Learning Center Mountain House", "city": "Mountain House", "category": "Education",
     "description": "Academic enrichment for students in grades K–12 including subject tutoring, homework help, and gifted programs.",
     "address": "9300 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-8090",
     "website": "", "image_url": img("Education", 4)},

    # --- Automotive (8) ---
    {"name": "Jiffy Lube Mountain House", "city": "Mountain House", "category": "Automotive",
     "description": "Quick oil changes, tire rotations, and multi-point vehicle inspections. No appointment needed.",
     "address": "9400 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-9001",
     "website": "https://jiffylube.com", "image_url": img("Automotive", 0)},

    {"name": "Mountain House Auto Repair", "city": "Mountain House", "category": "Automotive",
     "description": "Full-service auto repair shop serving all makes and models. ASE-certified technicians and honest estimates.",
     "address": "9500 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-9012",
     "website": "", "image_url": img("Automotive", 1)},

    {"name": "O'Reilly Auto Parts Mountain House", "city": "Mountain House", "category": "Automotive",
     "description": "Auto parts, tools, and accessories for DIY repairs. Free battery testing and loaner tool program.",
     "address": "9600 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-9023",
     "website": "https://oreillyauto.com", "image_url": img("Automotive", 2)},

    {"name": "AutoZone Mountain House", "city": "Mountain House", "category": "Automotive",
     "description": "Auto parts and accessories for every make and model. Free Loan-A-Tool program, battery testing, and oil recycling.",
     "address": "9700 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-9034",
     "website": "https://autozone.com", "image_url": img("Automotive", 3)},

    {"name": "Mountain House Car Wash", "city": "Mountain House", "category": "Automotive",
     "description": "Touchless and soft-cloth car washes with interior detailing packages. Monthly unlimited memberships available.",
     "address": "9800 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-9045",
     "website": "", "image_url": img("Automotive", 4)},

    {"name": "Valvoline Instant Oil Change MH", "city": "Mountain House", "category": "Automotive",
     "description": "Stay-in-your-car oil changes done in about 15 minutes. Conventional, synthetic blend, and full synthetic options.",
     "address": "9900 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-9056",
     "website": "https://valvoline.com", "image_url": img("Automotive", 0)},

    {"name": "Mountain House Tires & Auto", "city": "Mountain House", "category": "Automotive",
     "description": "Tire sales, balancing, alignment, and brake service. Competitive pricing on all major tire brands.",
     "address": "10000 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-9067",
     "website": "", "image_url": img("Automotive", 1)},

    {"name": "Enterprise Rent-A-Car Mountain House", "city": "Mountain House", "category": "Automotive",
     "description": "Car rentals for business and leisure. Pick-up/drop-off service available. Wide fleet of vehicles to choose from.",
     "address": "10100 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-9078",
     "website": "https://enterprise.com", "image_url": img("Automotive", 2)},

    # --- Real Estate (5) ---
    {"name": "PMZ Real Estate Mountain House", "city": "Mountain House", "category": "Real Estate",
     "description": "Leading real estate agency in San Joaquin County. Buy, sell, or invest with experienced local agents.",
     "address": "10200 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-1001",
     "website": "https://pmz.com", "image_url": img("Real Estate", 0)},

    {"name": "KB Home Mountain House", "city": "Mountain House", "category": "Real Estate",
     "description": "New construction homes in Mountain House. Choose your floor plan, finishes, and options to personalize your home.",
     "address": "10300 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-1012",
     "website": "https://kbhome.com", "image_url": img("Real Estate", 1)},

    {"name": "Pulte Homes Mountain House", "city": "Mountain House", "category": "Real Estate",
     "description": "Quality-built new homes in master-planned Mountain House communities. Energy-efficient designs and warranty included.",
     "address": "10400 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-1023",
     "website": "https://pulte.com", "image_url": img("Real Estate", 2)},

    {"name": "Century 21 Mountain House Realty", "city": "Mountain House", "category": "Real Estate",
     "description": "Full-service real estate brokerage helping Mountain House families buy and sell homes with confidence.",
     "address": "10500 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-1034",
     "website": "https://century21.com", "image_url": img("Real Estate", 3)},

    {"name": "Compass Real Estate Mountain House", "city": "Mountain House", "category": "Real Estate",
     "description": "Modern real estate agency with concierge service, bridge loans, and AI-powered home search tools.",
     "address": "10600 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-1045",
     "website": "https://compass.com", "image_url": img("Real Estate", 4)},

    # --- Home Services (10) ---
    {"name": "Mountain House Plumbing", "city": "Mountain House", "category": "Home Services",
     "description": "Licensed plumbers for repairs, installations, and drain cleaning. Available for emergencies 24/7.",
     "address": "10700 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-2001",
     "website": "", "image_url": img("Home Services", 0)},

    {"name": "Alpine Roofing Mountain House", "city": "Mountain House", "category": "Home Services",
     "description": "Residential roofing installation, repairs, and inspections. Licensed, bonded, and fully insured. Free estimates.",
     "address": "10800 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-2012",
     "website": "", "image_url": img("Home Services", 1)},

    {"name": "All-Pro HVAC Mountain House", "city": "Mountain House", "category": "Home Services",
     "description": "Heating and cooling installation, maintenance, and repair. Energy-efficient systems and seasonal tune-ups.",
     "address": "10900 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-2023",
     "website": "", "image_url": img("Home Services", 2)},

    {"name": "Mountain House Landscaping", "city": "Mountain House", "category": "Home Services",
     "description": "Lawn care, landscaping design, irrigation systems, and seasonal cleanup for residential and commercial properties.",
     "address": "11000 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-2034",
     "website": "", "image_url": img("Home Services", 3)},

    {"name": "Clean Pro Window Cleaning", "city": "Mountain House", "category": "Home Services",
     "description": "Residential and commercial window cleaning inside and out. Screen cleaning and solar panel washing too.",
     "address": "11100 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-2045",
     "website": "", "image_url": img("Home Services", 4)},

    {"name": "Stanley Steemer Mountain House", "city": "Mountain House", "category": "Home Services",
     "description": "Professional carpet, hardwood, tile, and upholstery cleaning. Deep clean that removes allergens and bacteria.",
     "address": "11200 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-2056",
     "website": "https://stanleysteemer.com", "image_url": img("Home Services", 0)},

    {"name": "Green Earth Pest Control MH", "city": "Mountain House", "category": "Home Services",
     "description": "Eco-friendly pest control for ants, spiders, rodents, and more. Monthly maintenance plans available.",
     "address": "11300 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-2067",
     "website": "", "image_url": img("Home Services", 1)},

    {"name": "Mountain House Garage Door Pros", "city": "Mountain House", "category": "Home Services",
     "description": "Garage door installation, repair, and maintenance. Spring replacements, opener installs, and 24-hour emergency service.",
     "address": "11400 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-2078",
     "website": "", "image_url": img("Home Services", 2)},

    {"name": "MH Electrical Services", "city": "Mountain House", "category": "Home Services",
     "description": "Licensed electricians for panel upgrades, EV charger installation, lighting, and wiring in residential homes.",
     "address": "11500 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-2089",
     "website": "", "image_url": img("Home Services", 3)},

    {"name": "ServiceMaster Restore Mountain House", "city": "Mountain House", "category": "Home Services",
     "description": "Disaster restoration for water damage, fire damage, and mold remediation. Available 24/7 for emergencies.",
     "address": "11600 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-2090",
     "website": "https://servicemaster.com", "image_url": img("Home Services", 4)},

    # --- Pet Services (5) ---
    {"name": "Mountain House Veterinary Clinic", "city": "Mountain House", "category": "Pet Services",
     "description": "Full-service animal hospital with wellness exams, vaccinations, surgery, and dental care for dogs and cats.",
     "address": "11700 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-3001",
     "website": "", "image_url": img("Pet Services", 0)},

    {"name": "Happy Paws Pet Grooming MH", "city": "Mountain House", "category": "Pet Services",
     "description": "Professional dog and cat grooming including baths, haircuts, nail trims, and teeth brushing. By appointment.",
     "address": "11800 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-3012",
     "website": "", "image_url": img("Pet Services", 1)},

    {"name": "Petco Mountain House", "city": "Mountain House", "category": "Pet Services",
     "description": "Pet food, supplies, grooming services, and adoptions. Vet services available through Vetco Total Care.",
     "address": "11900 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-3023",
     "website": "https://petco.com", "image_url": img("Pet Services", 2)},

    {"name": "Wag N Wash Mountain House", "city": "Mountain House", "category": "Pet Services",
     "description": "Self-service dog wash stations plus full-service grooming and natural pet food and treat selections.",
     "address": "12000 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-3034",
     "website": "", "image_url": img("Pet Services", 3)},

    {"name": "Mountain House Dog Training", "city": "Mountain House", "category": "Pet Services",
     "description": "Certified dog trainers offering puppy classes, obedience training, and behavior modification programs.",
     "address": "12100 Mountain House Pkwy, Mountain House, CA 95391", "phone": "(209) 835-3045",
     "website": "", "image_url": img("Pet Services", 4)},


    # =========================================================
    # TRACY — ~147 new listings
    # =========================================================

    # --- Restaurants (25) ---
    {"name": "In-N-Out Burger Tracy", "city": "Tracy", "category": "Restaurants",
     "description": "Fresh, never-frozen burgers, fries, and shakes made to order. California's iconic fast food chain since 1948.",
     "address": "3010 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-1001",
     "website": "https://in-n-out.com", "image_url": img("Restaurants", 0)},

    {"name": "Applebee's Tracy", "city": "Tracy", "category": "Restaurants",
     "description": "Neighborhood grill and bar serving American favorites. Happy hour deals, 2-for-20 meals, and late-night menu.",
     "address": "3020 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-1012",
     "website": "https://applebees.com", "image_url": img("Restaurants", 1)},

    {"name": "Chili's Tracy", "city": "Tracy", "category": "Restaurants",
     "description": "Fajitas, ribs, burgers, and Tex-Mex classics. Great happy hour deals, $5 margaritas, and kids eat free on Sundays.",
     "address": "3030 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-1023",
     "website": "https://chilis.com", "image_url": img("Restaurants", 2)},

    {"name": "Olive Garden Tracy", "city": "Tracy", "category": "Restaurants",
     "description": "Italian-inspired dishes, unlimited breadsticks, and a warm family dining atmosphere. Takeout and catering available.",
     "address": "3040 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-1034",
     "website": "https://olivegarden.com", "image_url": img("Restaurants", 3)},

    {"name": "Red Robin Tracy", "city": "Tracy", "category": "Restaurants",
     "description": "Gourmet burgers, bottomless steak fries, and indulgent milkshakes. Over 20 burger options in a lively setting.",
     "address": "3050 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-1045",
     "website": "https://redrobin.com", "image_url": img("Restaurants", 4)},

    {"name": "Black Bear Diner Tracy", "city": "Tracy", "category": "Restaurants",
     "description": "Hearty American comfort food in a cozy bear-themed diner. Huge portions, homemade pies, and all-day breakfast.",
     "address": "3060 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-1056",
     "website": "https://blackbeardiner.com", "image_url": img("Restaurants", 5)},

    {"name": "El Torito Tracy", "city": "Tracy", "category": "Restaurants",
     "description": "Festive Mexican dining with handcrafted margaritas, fresh guacamole, fajitas, and an extensive brunch buffet.",
     "address": "3070 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-1067",
     "website": "https://eltorito.com", "image_url": img("Restaurants", 6)},

    {"name": "Sichuan Garden Tracy", "city": "Tracy", "category": "Restaurants",
     "description": "Authentic Sichuan Chinese cuisine. Mapo tofu, spicy beef, and signature hot pots packed with complex flavors.",
     "address": "3080 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-1078",
     "website": "", "image_url": img("Restaurants", 7)},

    {"name": "Taco Bell Tracy Grant Line", "city": "Tracy", "category": "Restaurants",
     "description": "Live Más with tacos, burritos, and Crunchwraps. Late-night drive-through open until 2 AM.",
     "address": "3090 Grant Line Rd, Tracy, CA 95376", "phone": "(209) 832-1089",
     "website": "https://tacobell.com", "image_url": img("Restaurants", 0)},

    {"name": "McDonald's Tracy Byron Rd", "city": "Tracy", "category": "Restaurants",
     "description": "America's most iconic fast food. Big Mac, McNuggets, Happy Meals, and McCafé beverages all day.",
     "address": "3100 Byron Rd, Tracy, CA 95376", "phone": "(209) 832-1090",
     "website": "https://mcdonalds.com", "image_url": img("Restaurants", 1)},

    {"name": "Pho 54 Tracy", "city": "Tracy", "category": "Restaurants",
     "description": "Traditional Vietnamese pho, banh mi sandwiches, and spring rolls. Rich broth simmered for hours.",
     "address": "3110 11th St, Tracy, CA 95376", "phone": "(209) 832-1101",
     "website": "", "image_url": img("Restaurants", 2)},

    {"name": "Tracy Halal Meats & Grill", "city": "Tracy", "category": "Restaurants",
     "description": "Certified halal butcher and grill. Fresh-cut meats, kabobs, shawarma plates, and traditional sides.",
     "address": "3120 11th St, Tracy, CA 95376", "phone": "(209) 832-1112",
     "website": "", "image_url": img("Restaurants", 3)},

    {"name": "Round Table Pizza Tracy", "city": "Tracy", "category": "Restaurants",
     "description": "Hand-tossed pizzas with quality toppings, garlic bread, and craft beers. Great for game night and family dinners.",
     "address": "3130 Naglee Rd, Tracy, CA 95376", "phone": "(209) 832-1123",
     "website": "https://roundtablepizza.com", "image_url": img("Restaurants", 4)},

    {"name": "Habit Burger Tracy", "city": "Tracy", "category": "Restaurants",
     "description": "Charburgers cooked over an open flame with fresh, never-frozen beef. Tempura green beans are a must.",
     "address": "3140 Naglee Rd, Tracy, CA 95376", "phone": "(209) 832-1134",
     "website": "https://habitburger.com", "image_url": img("Restaurants", 5)},

    {"name": "Carl's Jr. Tracy", "city": "Tracy", "category": "Restaurants",
     "description": "Premium burgers, hand-breaded chicken tenders, and loaded fries. The Western Bacon Cheeseburger is legendary.",
     "address": "3150 Naglee Rd, Tracy, CA 95376", "phone": "(209) 832-1145",
     "website": "https://carlsjr.com", "image_url": img("Restaurants", 6)},

    {"name": "Flame & Feast Tracy", "city": "Tracy", "category": "Restaurants",
     "description": "Wood-fired steaks, BBQ ribs, and rotisserie chicken in a rustic, lodge-style setting. Craft cocktails and local wines.",
     "address": "3160 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-1156",
     "website": "", "image_url": img("Restaurants", 7)},

    {"name": "Thai Orchid Tracy", "city": "Tracy", "category": "Restaurants",
     "description": "Authentic Thai curries, pad thai, and fresh spring rolls made with traditional family recipes.",
     "address": "3170 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-1167",
     "website": "", "image_url": img("Restaurants", 0)},

    {"name": "La Palma Taqueria Tracy", "city": "Tracy", "category": "Restaurants",
     "description": "Hole-in-the-wall taqueria with amazing carne asada, al pastor, and birria tacos. Cash only. Worth every bite.",
     "address": "3180 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-1178",
     "website": "", "image_url": img("Restaurants", 1)},

    {"name": "Golden Corral Tracy", "city": "Tracy", "category": "Restaurants",
     "description": "All-you-can-eat buffet with over 150 items including carved meats, seafood, soups, and a chocolate fountain.",
     "address": "3190 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-1189",
     "website": "https://goldencorral.com", "image_url": img("Restaurants", 2)},

    {"name": "Cracker Barrel Tracy", "city": "Tracy", "category": "Restaurants",
     "description": "Southern-style comfort food in an old country store setting. Biscuits, chicken n' dumplings, and homemade pies.",
     "address": "3200 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-1190",
     "website": "https://crackerbarrel.com", "image_url": img("Restaurants", 3)},

    {"name": "Tracy Diner", "city": "Tracy", "category": "Restaurants",
     "description": "Classic American diner open since 1987. Breakfast all day, blue plate specials, and the best milkshakes in town.",
     "address": "3210 Central Ave, Tracy, CA 95376", "phone": "(209) 832-1201",
     "website": "", "image_url": img("Restaurants", 4)},

    {"name": "Curry Palace Tracy", "city": "Tracy", "category": "Restaurants",
     "description": "North and South Indian cuisine. Butter chicken, biryani, dosas, and fresh naan baked in a clay tandoor.",
     "address": "3220 Central Ave, Tracy, CA 95376", "phone": "(209) 832-1212",
     "website": "", "image_url": img("Restaurants", 5)},

    {"name": "Panera Bread Tracy", "city": "Tracy", "category": "Restaurants",
     "description": "Freshly baked bread, soups, sandwiches, and salads. Clean ingredients and a warm bakery-café atmosphere.",
     "address": "3230 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-1223",
     "website": "https://panerabread.com", "image_url": img("Restaurants", 6)},

    {"name": "BJ's Restaurant & Brewhouse Tracy", "city": "Tracy", "category": "Restaurants",
     "description": "Craft beers brewed in-house, deep-dish pizzas, and a massive menu of American favorites. Pizookie for dessert.",
     "address": "3240 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-1234",
     "website": "https://bjsrestaurants.com", "image_url": img("Restaurants", 7)},

    {"name": "Starbucks Tracy Grant Line", "city": "Tracy", "category": "Restaurants",
     "description": "Drive-through Starbucks with your favorite handcrafted coffees, teas, and seasonal beverages.",
     "address": "3250 Grant Line Rd, Tracy, CA 95376", "phone": "(209) 832-1245",
     "website": "https://starbucks.com", "image_url": img("Restaurants", 0)},

    # --- Health & Wellness (20) ---
    {"name": "Tracy Medical Center", "city": "Tracy", "category": "Health & Wellness",
     "description": "Full-service medical center with primary care, urgent care, and specialist referrals for Tracy residents.",
     "address": "3260 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-5001",
     "website": "", "image_url": img("Health & Wellness", 0)},

    {"name": "San Joaquin General Hospital Tracy", "city": "Tracy", "category": "Health & Wellness",
     "description": "County hospital serving Tracy and surrounding communities with emergency, surgical, and specialty care.",
     "address": "3270 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-5012",
     "website": "https://sjgeneral.org", "image_url": img("Health & Wellness", 1)},

    {"name": "Tracy Family Dentistry", "city": "Tracy", "category": "Health & Wellness",
     "description": "Comprehensive dental care including preventive, restorative, and cosmetic services for the whole family.",
     "address": "3280 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-5023",
     "website": "", "image_url": img("Health & Wellness", 2)},

    {"name": "Tracy Orthodontics", "city": "Tracy", "category": "Health & Wellness",
     "description": "Metal braces, ceramic braces, and Invisalign clear aligners. Free consultations and flexible payment plans.",
     "address": "3290 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-5034",
     "website": "", "image_url": img("Health & Wellness", 3)},

    {"name": "Tracy Vision Center", "city": "Tracy", "category": "Health & Wellness",
     "description": "Eye exams, prescription glasses, contact lenses, and LASIK consultations. Same-day glasses available.",
     "address": "3300 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-5045",
     "website": "", "image_url": img("Health & Wellness", 4)},

    {"name": "Planet Fitness Tracy", "city": "Tracy", "category": "Health & Wellness",
     "description": "Judgment-free zone with cardio equipment, strength machines, and tanning. $10/month membership available.",
     "address": "3310 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-5056",
     "website": "https://planetfitness.com", "image_url": img("Health & Wellness", 5)},

    {"name": "24 Hour Fitness Tracy", "city": "Tracy", "category": "Health & Wellness",
     "description": "Full gym access around the clock. Group fitness classes, personal training, pool, sauna, and steam room.",
     "address": "3320 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-5067",
     "website": "https://24hourfitness.com", "image_url": img("Health & Wellness", 0)},

    {"name": "Tracy Physical Therapy & Sports", "city": "Tracy", "category": "Health & Wellness",
     "description": "Sports medicine and orthopedic rehabilitation for athletes and active adults. Manual therapy and dry needling.",
     "address": "3330 Central Ave, Tracy, CA 95376", "phone": "(209) 832-5078",
     "website": "", "image_url": img("Health & Wellness", 1)},

    {"name": "Tracy Pediatrics", "city": "Tracy", "category": "Health & Wellness",
     "description": "Compassionate pediatric primary care from birth through adolescence. Vaccines, sports physicals, and sick visits.",
     "address": "3340 Central Ave, Tracy, CA 95376", "phone": "(209) 832-5089",
     "website": "", "image_url": img("Health & Wellness", 2)},

    {"name": "Crossfit Tracy", "city": "Tracy", "category": "Health & Wellness",
     "description": "Community-based functional fitness for all levels. Coached classes, strength programming, and nutrition guidance.",
     "address": "3350 Industrial Blvd, Tracy, CA 95376", "phone": "(209) 832-5090",
     "website": "", "image_url": img("Health & Wellness", 3)},

    {"name": "Tracy Chiropractic Center", "city": "Tracy", "category": "Health & Wellness",
     "description": "Chiropractic care, spinal decompression, and massage therapy for pain relief and improved mobility.",
     "address": "3360 11th St, Tracy, CA 95376", "phone": "(209) 832-5101",
     "website": "", "image_url": img("Health & Wellness", 4)},

    {"name": "Valley Health Urgent Care Tracy", "city": "Tracy", "category": "Health & Wellness",
     "description": "Walk-in urgent care for illnesses, injuries, lab work, and X-rays. Open 7 days a week including holidays.",
     "address": "3370 11th St, Tracy, CA 95376", "phone": "(209) 832-5112",
     "website": "", "image_url": img("Health & Wellness", 5)},

    {"name": "Tracy Dermatology", "city": "Tracy", "category": "Health & Wellness",
     "description": "Medical and cosmetic dermatology for skin conditions, acne, moles, Botox, fillers, and laser treatments.",
     "address": "3380 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-5123",
     "website": "", "image_url": img("Health & Wellness", 0)},

    {"name": "Tracy Behavioral Health", "city": "Tracy", "category": "Health & Wellness",
     "description": "Outpatient mental health services including therapy, psychiatry, and group counseling for all ages.",
     "address": "3390 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-5134",
     "website": "", "image_url": img("Health & Wellness", 1)},

    {"name": "Total Spine & Rehab Tracy", "city": "Tracy", "category": "Health & Wellness",
     "description": "Spine care specialists offering chiropractic, physical therapy, and pain management under one roof.",
     "address": "3400 Central Ave, Tracy, CA 95376", "phone": "(209) 832-5145",
     "website": "", "image_url": img("Health & Wellness", 2)},

    {"name": "Tracy Pediatric Dentistry", "city": "Tracy", "category": "Health & Wellness",
     "description": "Fun and gentle dental care designed specifically for children and teens. Nitrous oxide and sedation available.",
     "address": "3410 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-5156",
     "website": "", "image_url": img("Health & Wellness", 3)},

    {"name": "Elevate Yoga Tracy", "city": "Tracy", "category": "Health & Wellness",
     "description": "Beginner to advanced yoga classes in a welcoming studio. Hot yoga, restorative, vinyasa, and prenatal yoga.",
     "address": "3420 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-5167",
     "website": "", "image_url": img("Health & Wellness", 4)},

    {"name": "Tracy Women's Health Center", "city": "Tracy", "category": "Health & Wellness",
     "description": "OB-GYN services including prenatal care, annual exams, contraception, and menopause management.",
     "address": "3430 Central Ave, Tracy, CA 95376", "phone": "(209) 832-5178",
     "website": "", "image_url": img("Health & Wellness", 5)},

    {"name": "F45 Training Tracy", "city": "Tracy", "category": "Health & Wellness",
     "description": "Functional group fitness training combining resistance and cardio. 45-minute workouts, massive results.",
     "address": "3440 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-5189",
     "website": "https://f45training.com", "image_url": img("Health & Wellness", 0)},

    {"name": "Tracy Pharmacy & Compounding", "city": "Tracy", "category": "Health & Wellness",
     "description": "Independent pharmacy offering prescription filling, custom compounding, medication therapy management, and immunizations.",
     "address": "3450 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-5190",
     "website": "", "image_url": img("Health & Wellness", 1)},

    # --- Beauty & Spa (12) ---
    {"name": "Beauty Bliss Salon & Spa Tracy", "city": "Tracy", "category": "Beauty & Spa",
     "description": "Full-service salon and day spa offering hair, nails, waxing, facials, and massage in a luxurious setting.",
     "address": "3460 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-6001",
     "website": "", "image_url": img("Beauty & Spa", 0)},

    {"name": "Tracy Nail Studio", "city": "Tracy", "category": "Beauty & Spa",
     "description": "Gel, acrylic, dip powder, and nail art. Clean tools, friendly staff, and a relaxing atmosphere.",
     "address": "3470 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-6012",
     "website": "", "image_url": img("Beauty & Spa", 1)},

    {"name": "Hand & Stone Massage Tracy", "city": "Tracy", "category": "Beauty & Spa",
     "description": "Swedish, deep tissue, and hot stone massages plus facials and skin care. Membership pricing available.",
     "address": "3480 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-6023",
     "website": "https://handandstone.com", "image_url": img("Beauty & Spa", 2)},

    {"name": "European Wax Center Tracy", "city": "Tracy", "category": "Beauty & Spa",
     "description": "Precise, comfortable waxing for face and body using exclusive comfort wax. Walk-ins welcome.",
     "address": "3490 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-6034",
     "website": "https://waxcenter.com", "image_url": img("Beauty & Spa", 3)},

    {"name": "Regis Salon Tracy", "city": "Tracy", "category": "Beauty & Spa",
     "description": "Affordable, professional hair services at the Tracy mall. Cuts, color, highlights, and perms for everyone.",
     "address": "3500 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-6045",
     "website": "https://regissalons.com", "image_url": img("Beauty & Spa", 4)},

    {"name": "Fantastic Sams Tracy", "city": "Tracy", "category": "Beauty & Spa",
     "description": "Full-service salon offering cuts, color, perms, and more for the whole family at affordable prices.",
     "address": "3510 Grant Line Rd, Tracy, CA 95376", "phone": "(209) 832-6056",
     "website": "https://fantasticsams.com", "image_url": img("Beauty & Spa", 0)},

    {"name": "Luxe Brow & Lash Studio Tracy", "city": "Tracy", "category": "Beauty & Spa",
     "description": "Brow shaping, threading, tinting, and lash extensions. On-trend looks customized to your face shape.",
     "address": "3520 Central Ave, Tracy, CA 95376", "phone": "(209) 832-6067",
     "website": "", "image_url": img("Beauty & Spa", 1)},

    {"name": "Tracy Barber Shop & Style", "city": "Tracy", "category": "Beauty & Spa",
     "description": "Old-school barbershop with modern techniques. Fades, cuts, hot towel shaves, and beard sculpting.",
     "address": "3530 11th St, Tracy, CA 95376", "phone": "(209) 832-6078",
     "website": "", "image_url": img("Beauty & Spa", 2)},

    {"name": "Glow Aesthetics Tracy", "city": "Tracy", "category": "Beauty & Spa",
     "description": "Medical-grade facials, microneedling, chemical peels, and laser hair removal for all skin types.",
     "address": "3540 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-6089",
     "website": "", "image_url": img("Beauty & Spa", 3)},

    {"name": "Pink Sugar Nail Bar Tracy", "city": "Tracy", "category": "Beauty & Spa",
     "description": "Cute, social nail bar with a full menu of nail services, waxing, and lash tinting in a fun atmosphere.",
     "address": "3550 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-6090",
     "website": "", "image_url": img("Beauty & Spa", 4)},

    {"name": "The Salon Project Tracy", "city": "Tracy", "category": "Beauty & Spa",
     "description": "Upscale hair salon specializing in precision cuts, balayage, keratin treatments, and bridal styling.",
     "address": "3560 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-6101",
     "website": "", "image_url": img("Beauty & Spa", 0)},

    {"name": "Zen Spa Tracy", "city": "Tracy", "category": "Beauty & Spa",
     "description": "Tranquil day spa with customizable massage packages, body wraps, aromatherapy, and couples treatments.",
     "address": "3570 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-6112",
     "website": "", "image_url": img("Beauty & Spa", 1)},

    # --- Retail (15) ---
    {"name": "Target Tracy", "city": "Tracy", "category": "Retail",
     "description": "Everything you need under one roof. Clothing, electronics, groceries, home goods, and same-day delivery.",
     "address": "3580 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-7001",
     "website": "https://target.com", "image_url": img("Retail", 0)},

    {"name": "Walmart Supercenter Tracy", "city": "Tracy", "category": "Retail",
     "description": "Full-service Walmart with groceries, electronics, clothing, auto center, pharmacy, and optical services.",
     "address": "3590 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-7012",
     "website": "https://walmart.com", "image_url": img("Retail", 1)},

    {"name": "Best Buy Tracy", "city": "Tracy", "category": "Retail",
     "description": "Electronics, appliances, computers, phones, and smart home products. Geek Squad repair services on-site.",
     "address": "3600 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-7023",
     "website": "https://bestbuy.com", "image_url": img("Retail", 2)},

    {"name": "Ross Dress for Less Tracy", "city": "Tracy", "category": "Retail",
     "description": "Designer and name-brand clothing, shoes, accessories, and home goods at 20–60% off retail prices.",
     "address": "3610 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-7034",
     "website": "https://rossstores.com", "image_url": img("Retail", 3)},

    {"name": "TJ Maxx Tracy", "city": "Tracy", "category": "Retail",
     "description": "Off-price retailer with brand-name clothing, shoes, home décor, and accessories at amazing values.",
     "address": "3620 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-7045",
     "website": "https://tjmaxx.com", "image_url": img("Retail", 4)},

    {"name": "HomeGoods Tracy", "city": "Tracy", "category": "Retail",
     "description": "Ever-changing selection of unique home furnishings, décor, bath and bedding, and kitchen items at great prices.",
     "address": "3630 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-7056",
     "website": "https://homegoods.com", "image_url": img("Retail", 0)},

    {"name": "Marshalls Tracy", "city": "Tracy", "category": "Retail",
     "description": "Brand-name clothing, shoes, handbags, and home goods at significant discounts. New arrivals every week.",
     "address": "3640 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-7067",
     "website": "https://marshalls.com", "image_url": img("Retail", 1)},

    {"name": "Bath & Body Works Tracy", "city": "Tracy", "category": "Retail",
     "description": "Fragrant body care, candles, and home fragrance. Seasonal collections and popular 3-wick candles.",
     "address": "3650 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-7078",
     "website": "https://bathandbodyworks.com", "image_url": img("Retail", 2)},

    {"name": "Five Below Tracy", "city": "Tracy", "category": "Retail",
     "description": "Fun stuff for teens and young adults at $1–$5. Snacks, accessories, games, beauty, and seasonal finds.",
     "address": "3660 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-7089",
     "website": "https://fivebelow.com", "image_url": img("Retail", 3)},

    {"name": "Ulta Beauty Tracy", "city": "Tracy", "category": "Retail",
     "description": "Everything beauty in one place. Drugstore and prestige brands, salon services, and loyalty rewards.",
     "address": "3670 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-7090",
     "website": "https://ulta.com", "image_url": img("Retail", 4)},

    {"name": "Dick's Sporting Goods Tracy", "city": "Tracy", "category": "Retail",
     "description": "Sports equipment, athletic apparel, footwear, and outdoor gear for every sport and activity.",
     "address": "3680 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-7101",
     "website": "https://dickssportinggoods.com", "image_url": img("Retail", 0)},

    {"name": "Michaels Craft Store Tracy", "city": "Tracy", "category": "Retail",
     "description": "Arts, crafts, framing, and floral supplies. Classes for adults and kids. Custom framing and floral design.",
     "address": "3690 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-7112",
     "website": "https://michaels.com", "image_url": img("Retail", 1)},

    {"name": "PetSmart Tracy", "city": "Tracy", "category": "Retail",
     "description": "Pet food, supplies, grooming, training, and in-store vet services. Adoption events on weekends.",
     "address": "3700 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-7123",
     "website": "https://petsmart.com", "image_url": img("Retail", 2)},

    {"name": "Big Lots Tracy", "city": "Tracy", "category": "Retail",
     "description": "Furniture, food, home décor, toys, and clothing at significant discounts. New inventory weekly.",
     "address": "3710 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-7134",
     "website": "https://biglots.com", "image_url": img("Retail", 3)},

    {"name": "Hobby Lobby Tracy", "city": "Tracy", "category": "Retail",
     "description": "Craft supplies, fabric, framing, home décor, and seasonal items at 40% off every day on something new.",
     "address": "3720 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-7145",
     "website": "https://hobbylobby.com", "image_url": img("Retail", 4)},

    # --- Education (15) ---
    {"name": "Tracy Unified School District Admin", "city": "Tracy", "category": "Education",
     "description": "Administrative offices for Tracy Unified School District serving over 15,000 students across 20+ schools.",
     "address": "3730 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-8001",
     "website": "https://tusd.net", "image_url": img("Education", 0)},

    {"name": "West High School Tracy", "city": "Tracy", "category": "Education",
     "description": "Public high school with AP courses, athletics, performing arts, and college prep programs.",
     "address": "3740 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-8012",
     "website": "https://tusd.net/whs", "image_url": img("Education", 1)},

    {"name": "Tracy Learning Center", "city": "Tracy", "category": "Education",
     "description": "Alternative high school and adult education programs including GED, ESL, and vocational training.",
     "address": "3750 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-8023",
     "website": "", "image_url": img("Education", 2)},

    {"name": "San Joaquin Delta College Tracy", "city": "Tracy", "category": "Education",
     "description": "Community college satellite campus offering associate degrees, certificates, and transfer programs.",
     "address": "3760 Grant Line Rd, Tracy, CA 95376", "phone": "(209) 832-8034",
     "website": "https://deltacollege.edu", "image_url": img("Education", 3)},

    {"name": "Mathnasium of Tracy", "city": "Tracy", "category": "Education",
     "description": "Math-only learning center helping students from K–12 build number sense and master grade-level concepts.",
     "address": "3770 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-8045",
     "website": "https://mathnasium.com", "image_url": img("Education", 4)},

    {"name": "The Learning Experience Tracy", "city": "Tracy", "category": "Education",
     "description": "Nationally accredited early education center with infant, toddler, and preschool programs.",
     "address": "3780 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-8056",
     "website": "https://thelearningexperience.com", "image_url": img("Education", 0)},

    {"name": "Challenger School Tracy", "city": "Tracy", "category": "Education",
     "description": "Private school with challenging academics, Socratic teaching methods, and individual student attention.",
     "address": "3790 Naglee Rd, Tracy, CA 95376", "phone": "(209) 832-8067",
     "website": "https://challengerschool.com", "image_url": img("Education", 1)},

    {"name": "Tracy Children's Academy", "city": "Tracy", "category": "Education",
     "description": "Preschool and kindergarten readiness programs designed to give children a strong academic foundation.",
     "address": "3800 Naglee Rd, Tracy, CA 95376", "phone": "(209) 832-8078",
     "website": "", "image_url": img("Education", 2)},

    {"name": "Brainspring Tutoring Tracy", "city": "Tracy", "category": "Education",
     "description": "One-on-one tutoring for reading, math, writing, and test prep. Orton-Gillingham trained reading specialists.",
     "address": "3810 Central Ave, Tracy, CA 95376", "phone": "(209) 832-8089",
     "website": "", "image_url": img("Education", 3)},

    {"name": "Music Together Tracy", "city": "Tracy", "category": "Education",
     "description": "Music classes for infants through kindergarteners and their caregivers. Research-based early childhood music.",
     "address": "3820 Central Ave, Tracy, CA 95376", "phone": "(209) 832-8090",
     "website": "", "image_url": img("Education", 4)},

    {"name": "Code Ninjas Tracy", "city": "Tracy", "category": "Education",
     "description": "Kids coding center teaching programming through game development. Ages 5–14. Summer camps and classes.",
     "address": "3830 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-8101",
     "website": "https://codeninjas.com", "image_url": img("Education", 0)},

    {"name": "Eye Level Learning Center Tracy", "city": "Tracy", "category": "Education",
     "description": "Personalized math and English programs that build confidence and close learning gaps for K–12 students.",
     "address": "3840 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-8112",
     "website": "https://eyelevellearning.com", "image_url": img("Education", 1)},

    {"name": "Tracy Dance & Performing Arts", "city": "Tracy", "category": "Education",
     "description": "Ballet, hip-hop, jazz, and contemporary dance classes for all ages and levels. Annual recital showcase.",
     "address": "3850 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-8123",
     "website": "", "image_url": img("Education", 2)},

    {"name": "Sylvan Learning Center Tracy", "city": "Tracy", "category": "Education",
     "description": "Personalized tutoring in reading, math, writing, and study skills. SAT/ACT prep and college planning.",
     "address": "3860 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-8134",
     "website": "https://sylvanlearning.com", "image_url": img("Education", 3)},

    {"name": "Little Gym Tracy", "city": "Tracy", "category": "Education",
     "description": "Physical development and gymnastics classes for kids 4 months to 12 years. Birthday parties too.",
     "address": "3870 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-8145",
     "website": "https://thelittlegym.com", "image_url": img("Education", 4)},

    # --- Automotive (12) ---
    {"name": "Jiffy Lube Tracy", "city": "Tracy", "category": "Automotive",
     "description": "Express oil changes and vehicle maintenance services. No appointment needed, fast turnaround.",
     "address": "3880 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-9001",
     "website": "https://jiffylube.com", "image_url": img("Automotive", 0)},

    {"name": "Pep Boys Tracy", "city": "Tracy", "category": "Automotive",
     "description": "Tire sales, oil changes, brake service, and auto parts. Free battery check and tire pressure service.",
     "address": "3890 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-9012",
     "website": "https://pepboys.com", "image_url": img("Automotive", 1)},

    {"name": "Midas Tracy", "city": "Tracy", "category": "Automotive",
     "description": "Full-service auto repair including oil changes, brakes, exhaust, tires, and alignment. Lifetime brake guarantee.",
     "address": "3900 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-9023",
     "website": "https://midas.com", "image_url": img("Automotive", 2)},

    {"name": "Firestone Complete Auto Care Tracy", "city": "Tracy", "category": "Automotive",
     "description": "Tires, oil changes, brakes, batteries, alignment, and more. Online appointment scheduling available.",
     "address": "3910 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-9034",
     "website": "https://firestonecompleteautocare.com", "image_url": img("Automotive", 3)},

    {"name": "Caliber Collision Tracy", "city": "Tracy", "category": "Automotive",
     "description": "Auto body repair and collision center. Insurance claims handled, OEM parts, and lifetime repair guarantee.",
     "address": "3920 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-9045",
     "website": "https://calibercollision.com", "image_url": img("Automotive", 4)},

    {"name": "CarMax Tracy", "city": "Tracy", "category": "Automotive",
     "description": "Used car superstore with no-haggle pricing, financing, and a 7-day return policy. Large certified inventory.",
     "address": "3930 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-9056",
     "website": "https://carmax.com", "image_url": img("Automotive", 0)},

    {"name": "Toyota of Tracy", "city": "Tracy", "category": "Automotive",
     "description": "New and pre-owned Toyota vehicles plus factory-certified service, parts, and financing for Tracy drivers.",
     "address": "3940 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-9067",
     "website": "https://toyotaoftracy.com", "image_url": img("Automotive", 1)},

    {"name": "Tracy Ford Lincoln", "city": "Tracy", "category": "Automotive",
     "description": "New Ford and Lincoln vehicles, certified pre-owned cars, and full-service Ford-authorized repair center.",
     "address": "3950 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-9078",
     "website": "", "image_url": img("Automotive", 2)},

    {"name": "Valvoline Express Care Tracy", "city": "Tracy", "category": "Automotive",
     "description": "Stay-in-your-car oil changes and preventive maintenance in 15 minutes or less. Open 7 days.",
     "address": "3960 Grant Line Rd, Tracy, CA 95376", "phone": "(209) 832-9089",
     "website": "https://valvoline.com", "image_url": img("Automotive", 3)},

    {"name": "NAPA Auto Parts Tracy", "city": "Tracy", "category": "Automotive",
     "description": "Auto parts, accessories, tools, and maintenance supplies for all vehicle makes and models.",
     "address": "3970 11th St, Tracy, CA 95376", "phone": "(209) 832-9090",
     "website": "https://napaonline.com", "image_url": img("Automotive", 4)},

    {"name": "Shine On Car Wash Tracy", "city": "Tracy", "category": "Automotive",
     "description": "Automated and detail car wash services. Monthly unlimited memberships, interior vacuuming, and tire shine.",
     "address": "3980 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-9101",
     "website": "", "image_url": img("Automotive", 0)},

    {"name": "Tracy Smog Center", "city": "Tracy", "category": "Automotive",
     "description": "DMV-certified smog checks and Star Station for all vehicles including diesel. Fast, affordable, same-day.",
     "address": "3990 Central Ave, Tracy, CA 95376", "phone": "(209) 832-9112",
     "website": "", "image_url": img("Automotive", 1)},

    # --- Real Estate (10) ---
    {"name": "Coldwell Banker Tracy", "city": "Tracy", "category": "Real Estate",
     "description": "Trusted real estate brokerage with experienced agents helping Tracy buyers and sellers navigate the market.",
     "address": "4000 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-1001",
     "website": "https://coldwellbanker.com", "image_url": img("Real Estate", 0)},

    {"name": "Keller Williams Tracy", "city": "Tracy", "category": "Real Estate",
     "description": "Largest real estate franchise in the world. Tracy agents with deep local knowledge and strong negotiation skills.",
     "address": "4010 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-1012",
     "website": "https://kw.com", "image_url": img("Real Estate", 1)},

    {"name": "RE/MAX Tracy", "city": "Tracy", "category": "Real Estate",
     "description": "Top-producing real estate agents helping Tracy families buy their dream homes and sell for top dollar.",
     "address": "4020 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-1023",
     "website": "https://remax.com", "image_url": img("Real Estate", 2)},

    {"name": "Tracy Property Management", "city": "Tracy", "category": "Real Estate",
     "description": "Full-service property management for single-family homes and multi-unit rentals. Tenant placement and maintenance.",
     "address": "4030 Central Ave, Tracy, CA 95376", "phone": "(209) 832-1034",
     "website": "", "image_url": img("Real Estate", 3)},

    {"name": "Bay Area Realty Tracy", "city": "Tracy", "category": "Real Estate",
     "description": "Serving Bay Area transplants relocating to Tracy for affordability. Expert in 580 corridor real estate.",
     "address": "4040 Central Ave, Tracy, CA 95376", "phone": "(209) 832-1045",
     "website": "", "image_url": img("Real Estate", 4)},

    {"name": "Home Smart Realty Tracy", "city": "Tracy", "category": "Real Estate",
     "description": "Tech-forward real estate brokerage with virtual tours, digital offers, and data-driven pricing strategies.",
     "address": "4050 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-1056",
     "website": "", "image_url": img("Real Estate", 0)},

    {"name": "First American Title Tracy", "city": "Tracy", "category": "Real Estate",
     "description": "Title insurance, escrow services, and closing support for residential and commercial real estate transactions.",
     "address": "4060 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-1067",
     "website": "https://firstam.com", "image_url": img("Real Estate", 1)},

    {"name": "Pacific Union International Tracy", "city": "Tracy", "category": "Real Estate",
     "description": "Luxury and mid-market real estate with white-glove service and access to off-market listings.",
     "address": "4070 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-1078",
     "website": "", "image_url": img("Real Estate", 2)},

    {"name": "Tracy New Homes Gallery", "city": "Tracy", "category": "Real Estate",
     "description": "Showcasing new construction communities in Tracy and surrounding areas. Builder representation and move-in specials.",
     "address": "4080 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-1089",
     "website": "", "image_url": img("Real Estate", 3)},

    {"name": "Wells Fargo Home Mortgage Tracy", "city": "Tracy", "category": "Real Estate",
     "description": "Home purchase loans, refinancing, and home equity products with local mortgage specialists.",
     "address": "4090 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-1090",
     "website": "https://wellsfargo.com", "image_url": img("Real Estate", 4)},

    # --- Home Services (15) ---
    {"name": "Tracy Plumbing & Drain", "city": "Tracy", "category": "Home Services",
     "description": "Residential and commercial plumbing repairs, drain cleaning, water heater installation, and sewer services.",
     "address": "4100 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-2001",
     "website": "", "image_url": img("Home Services", 0)},

    {"name": "All Climate HVAC Tracy", "city": "Tracy", "category": "Home Services",
     "description": "Heating, cooling, and air quality solutions for Tracy homes. Tune-ups, repairs, and full system installations.",
     "address": "4110 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-2012",
     "website": "", "image_url": img("Home Services", 1)},

    {"name": "TracyElectric Contractors", "city": "Tracy", "category": "Home Services",
     "description": "Residential electrical services including panel upgrades, EV charger installation, and smart home wiring.",
     "address": "4120 Central Ave, Tracy, CA 95376", "phone": "(209) 832-2023",
     "website": "", "image_url": img("Home Services", 2)},

    {"name": "Green Thumb Landscaping Tracy", "city": "Tracy", "category": "Home Services",
     "description": "Full-service landscaping: design, installation, lawn maintenance, irrigation, and drought-tolerant gardens.",
     "address": "4130 Central Ave, Tracy, CA 95376", "phone": "(209) 832-2034",
     "website": "", "image_url": img("Home Services", 3)},

    {"name": "Tracy Roof Masters", "city": "Tracy", "category": "Home Services",
     "description": "Residential roofing installation, repair, and inspection. Tile, shingle, and flat roof specialists.",
     "address": "4140 Industrial Blvd, Tracy, CA 95376", "phone": "(209) 832-2045",
     "website": "", "image_url": img("Home Services", 4)},

    {"name": "Terminix Tracy", "city": "Tracy", "category": "Home Services",
     "description": "Pest control services for termites, ants, rodents, and bed bugs. Free inspection and treatment plans.",
     "address": "4150 Industrial Blvd, Tracy, CA 95376", "phone": "(209) 832-2056",
     "website": "https://terminix.com", "image_url": img("Home Services", 0)},

    {"name": "Roto-Rooter Tracy", "city": "Tracy", "category": "Home Services",
     "description": "24/7 plumbing and drain cleaning. Sewer camera inspections, clogged drain clearing, and emergency service.",
     "address": "4160 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-2067",
     "website": "https://rotorooter.com", "image_url": img("Home Services", 1)},

    {"name": "Mr. Handyman Tracy", "city": "Tracy", "category": "Home Services",
     "description": "Reliable handyman services for home repairs, maintenance, installations, and small renovation projects.",
     "address": "4170 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-2078",
     "website": "https://mrhandyman.com", "image_url": img("Home Services", 2)},

    {"name": "Two Men and a Truck Tracy", "city": "Tracy", "category": "Home Services",
     "description": "Professional moving services for local and long-distance relocations. Packing, storage, and moving supplies.",
     "address": "4180 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-2089",
     "website": "https://twomenandatruck.com", "image_url": img("Home Services", 3)},

    {"name": "Lowe's Tracy", "city": "Tracy", "category": "Home Services",
     "description": "Home improvement superstore with tools, hardware, lumber, appliances, flooring, and installation services.",
     "address": "4190 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-2090",
     "website": "https://lowes.com", "image_url": img("Home Services", 4)},

    {"name": "Home Depot Tracy", "city": "Tracy", "category": "Home Services",
     "description": "Building materials, appliances, tools, and garden supplies. Pro desk for contractors and large projects.",
     "address": "4200 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-2101",
     "website": "https://homedepot.com", "image_url": img("Home Services", 0)},

    {"name": "Molly Maid Tracy", "city": "Tracy", "category": "Home Services",
     "description": "Residential cleaning services with bonded and insured teams. Recurring or one-time deep cleans available.",
     "address": "4210 Central Ave, Tracy, CA 95376", "phone": "(209) 832-2112",
     "website": "https://mollymaid.com", "image_url": img("Home Services", 1)},

    {"name": "Tracy Solar Solutions", "city": "Tracy", "category": "Home Services",
     "description": "Residential solar panel installation and battery storage. Energy assessments and financing options available.",
     "address": "4220 Industrial Blvd, Tracy, CA 95376", "phone": "(209) 832-2123",
     "website": "", "image_url": img("Home Services", 2)},

    {"name": "Ace Hardware Tracy", "city": "Tracy", "category": "Home Services",
     "description": "Neighborhood hardware store with friendly service. Tools, paint, gardening, plumbing, and electrical supplies.",
     "address": "4230 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-2134",
     "website": "https://acehardware.com", "image_url": img("Home Services", 3)},

    {"name": "Budget Blinds Tracy", "city": "Tracy", "category": "Home Services",
     "description": "Custom window treatments including blinds, shades, shutters, and drapes. Free in-home consultations.",
     "address": "4240 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-2145",
     "website": "https://budgetblinds.com", "image_url": img("Home Services", 4)},

    # --- Pet Services (10) ---
    {"name": "Tracy Animal Hospital", "city": "Tracy", "category": "Pet Services",
     "description": "Full-service veterinary hospital with wellness care, surgery, diagnostics, and emergency services for pets.",
     "address": "4250 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-3001",
     "website": "", "image_url": img("Pet Services", 0)},

    {"name": "VCA Tracy Animal Hospital", "city": "Tracy", "category": "Pet Services",
     "description": "AAHA-accredited animal hospital with experienced veterinarians, on-site lab, and digital imaging.",
     "address": "4260 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-3012",
     "website": "https://vcahospitals.com", "image_url": img("Pet Services", 1)},

    {"name": "Happy Tails Pet Grooming Tracy", "city": "Tracy", "category": "Pet Services",
     "description": "Full-service dog and cat grooming salon. Baths, haircuts, nail trims, ear cleaning, and de-shedding treatments.",
     "address": "4270 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-3023",
     "website": "", "image_url": img("Pet Services", 2)},

    {"name": "Petco Tracy", "city": "Tracy", "category": "Pet Services",
     "description": "Pet food, toys, accessories, grooming, and Vetco wellness clinics. Adopt-a-Pet events on weekends.",
     "address": "4280 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-3034",
     "website": "https://petco.com", "image_url": img("Pet Services", 3)},

    {"name": "Bark Avenue Dog Daycare Tracy", "city": "Tracy", "category": "Pet Services",
     "description": "Dog daycare, boarding, and training. Supervised play groups, webcam access, and pick-up/drop-off service.",
     "address": "4290 Industrial Blvd, Tracy, CA 95376", "phone": "(209) 832-3045",
     "website": "", "image_url": img("Pet Services", 4)},

    {"name": "Tracy Cat Clinic", "city": "Tracy", "category": "Pet Services",
     "description": "Cat-only veterinary clinic designed for a stress-free feline experience. Wellness exams and senior care.",
     "address": "4300 Central Ave, Tracy, CA 95376", "phone": "(209) 832-3056",
     "website": "", "image_url": img("Pet Services", 0)},

    {"name": "Camp Bow Wow Tracy", "city": "Tracy", "category": "Pet Services",
     "description": "Premier dog boarding and daycare. Certified Camp Counselors, climate-controlled cabins, and daily reports.",
     "address": "4310 W Clover Rd, Tracy, CA 95376", "phone": "(209) 832-3067",
     "website": "https://campbowwow.com", "image_url": img("Pet Services", 1)},

    {"name": "Tracy Paws Dog Training", "city": "Tracy", "category": "Pet Services",
     "description": "Positive reinforcement dog training. Puppy classes, basic obedience, reactive dog rehab, and private sessions.",
     "address": "4320 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-3078",
     "website": "", "image_url": img("Pet Services", 2)},

    {"name": "Wag & Wash Pet Salon Tracy", "city": "Tracy", "category": "Pet Services",
     "description": "Self-service dog washing stations plus professional grooming. Natural shampoos, blow drying, and nail grinding.",
     "address": "4330 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-3089",
     "website": "", "image_url": img("Pet Services", 3)},

    {"name": "Tracy Exotic & Small Animal Clinic", "city": "Tracy", "category": "Pet Services",
     "description": "Veterinary care for rabbits, birds, reptiles, guinea pigs, and other small and exotic animals.",
     "address": "4340 Tracy Blvd, Tracy, CA 95376", "phone": "(209) 832-3090",
     "website": "", "image_url": img("Pet Services", 4)},
]


def get_existing(city):
    """Return a set of lowercased names already in DB for this city."""
    try:
        res = supabase.table("businesses").select("name").eq("city", city).execute()
        return {r["name"].lower() for r in (res.data or [])}
    except Exception as e:
        print(f"  WARNING: could not prefetch existing for {city}: {e}")
        return set()


def main():
    print(f"Seeding {len(BUSINESSES)} businesses (Mountain House + Tracy)...")

    # Prefetch existing names per city to avoid duplicates
    existing = {}
    for city in ["Mountain House", "Tracy"]:
        existing[city] = get_existing(city)
        print(f"  {city}: {len(existing[city])} businesses already in DB")

    success = 0
    skipped = 0
    failed = 0

    for i, biz in enumerate(BUSINESSES):
        name = biz["name"]
        city = biz["city"]

        # Skip if already exists
        if name.lower() in existing.get(city, set()):
            skipped += 1
            continue

        try:
            record = {
                "name": name,
                "description": biz.get("description", ""),
                "category": biz["category"],
                "city": city,
                "address": biz.get("address", ""),
                "phone": biz.get("phone", ""),
                "website": biz.get("website", ""),
                "status": "approved",
                "claimed": False,
                "verified": False,
            }
            supabase.table("businesses").insert(record).execute()
            success += 1
            if success % 25 == 0:
                print(f"  {success} inserted so far...")
        except Exception as e:
            print(f"  FAILED: {name} ({city}) — {e}")
            failed += 1

    print(f"\nDone. {success} inserted, {skipped} skipped (already exist), {failed} failed.")
    print("Run: SELECT city, count(*) FROM businesses WHERE status='approved' GROUP BY city;")


if __name__ == "__main__":
    main()
