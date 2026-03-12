"""
seed_businesses_6.py — MoHoLocal Directory Expansion
Adds ~360 new listings: Lathrop (~106) + Manteca (~154) + Brentwood (~100)
Run with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment.
"""
import os, sys
from supabase import create_client

url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
if not url or not key:
    print("ERROR: env vars missing"); sys.exit(1)

supabase = create_client(url, key)

IMAGES = {
    "Restaurants": [
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
        "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800",
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
        "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800",
        "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=800",
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
        "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800",
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

DESCS = {
    "Restaurants": [
        "Local favorite serving fresh, made-to-order meals in a welcoming neighborhood setting.",
        "Family-owned restaurant with authentic recipes, generous portions, and friendly service.",
        "Casual dining with a diverse menu covering breakfast, lunch, and dinner daily.",
        "Quick-service restaurant known for quality ingredients and consistent flavors.",
        "Community gathering spot with great food, craft drinks, and a warm atmosphere.",
        "Neighborhood eatery serving comfort food classics with a local twist.",
        "Popular spot for families and groups. Diverse menu, great value, and fast service.",
        "Fresh flavors, locally sourced ingredients, and a menu that changes with the seasons.",
    ],
    "Health & Wellness": [
        "Dedicated healthcare providers offering compassionate, patient-centered care.",
        "Modern facility with experienced professionals focused on your long-term health.",
        "Trusted local practice delivering comprehensive wellness services for all ages.",
        "Board-certified specialists with a commitment to preventive and restorative care.",
        "Community health provider offering convenient appointments and evidence-based treatment.",
        "Wellness-focused practice combining traditional medicine with holistic approaches.",
    ],
    "Beauty & Spa": [
        "Expert stylists and technicians dedicated to making you look and feel your best.",
        "Relaxing environment offering premium beauty services at competitive prices.",
        "Full-service salon with skilled professionals and top-of-the-line products.",
        "Boutique studio specializing in personalized beauty treatments for every client.",
        "Your local beauty destination offering quality services in a comfortable setting.",
    ],
    "Retail": [
        "Locally loved shop offering a curated selection of quality products and gifts.",
        "One-stop shop with competitive prices, wide selection, and excellent customer service.",
        "Community retailer stocking everyday essentials plus unique local finds.",
        "Friendly neighborhood store with knowledgeable staff and convenient hours.",
        "Quality merchandise at great value with a focus on customer satisfaction.",
    ],
    "Education": [
        "Nurturing learning environment dedicated to student success and academic growth.",
        "Passionate educators delivering engaging curriculum in a supportive community.",
        "Comprehensive programs designed to prepare students for future success.",
        "Safe, stimulating environment where children develop skills and confidence.",
        "Experienced instructors offering personalized learning for every student.",
    ],
    "Automotive": [
        "Certified technicians providing honest, reliable auto service and repairs.",
        "Full-service auto shop with transparent pricing and fast turnaround.",
        "Trusted neighborhood auto service center for all makes and models.",
        "Professional auto care with preventive maintenance and expert diagnostics.",
        "Quality parts and service keeping local vehicles running safely and efficiently.",
    ],
    "Real Estate": [
        "Experienced local agents helping buyers and sellers navigate the market with confidence.",
        "Full-service real estate brokerage with deep knowledge of the local market.",
        "Dedicated professionals committed to finding the right home for every family.",
        "Results-driven real estate team with a proven track record in the community.",
        "Trusted real estate advisors offering personalized guidance from search to close.",
    ],
    "Home Services": [
        "Licensed and insured professionals delivering quality home services on time.",
        "Reliable local contractors with years of experience and satisfied customers.",
        "Expert home service team committed to quality workmanship and fair pricing.",
        "Trusted neighborhood service provider for repairs, maintenance, and installations.",
        "Skilled tradespeople bringing professionalism and care to every job.",
    ],
    "Pet Services": [
        "Compassionate pet care professionals who treat every animal like their own.",
        "Trusted local provider offering quality services for your beloved pets.",
        "Skilled and caring team dedicated to the health and happiness of your pets.",
        "Your neighborhood pet care destination with friendly, experienced staff.",
        "Quality pet services delivered with love, patience, and professional expertise.",
    ],
}


def img(cat, seed=0):
    pool = IMAGES.get(cat, IMAGES["Retail"])
    return pool[seed % len(pool)]


def desc(cat, seed=0):
    pool = DESCS.get(cat, DESCS["Retail"])
    return pool[seed % len(pool)]


# ---------------------------------------------------------------------------
# Compact format: (name, city, category, address, phone, website)
# ---------------------------------------------------------------------------
RAW = [

    # =========================================================
    # LATHROP — ~106 listings
    # =========================================================

    # Restaurants (20)
    ("McDonald's Lathrop", "Lathrop", "Restaurants", "100 Spartan Way, Lathrop, CA 95330", "(209) 858-1001", "https://mcdonalds.com"),
    ("Burger King Lathrop", "Lathrop", "Restaurants", "200 Spartan Way, Lathrop, CA 95330", "(209) 858-1002", "https://bk.com"),
    ("Taco Bell Lathrop", "Lathrop", "Restaurants", "300 Spartan Way, Lathrop, CA 95330", "(209) 858-1003", "https://tacobell.com"),
    ("Subway Lathrop", "Lathrop", "Restaurants", "400 Spartan Way, Lathrop, CA 95330", "(209) 858-1004", "https://subway.com"),
    ("Starbucks Lathrop", "Lathrop", "Restaurants", "500 Spartan Way, Lathrop, CA 95330", "(209) 858-1005", "https://starbucks.com"),
    ("Dutch Bros Lathrop", "Lathrop", "Restaurants", "600 Spartan Way, Lathrop, CA 95330", "(209) 858-1006", "https://dutchbros.com"),
    ("Panda Express Lathrop", "Lathrop", "Restaurants", "700 Spartan Way, Lathrop, CA 95330", "(209) 858-1007", "https://pandaexpress.com"),
    ("Jack in the Box Lathrop", "Lathrop", "Restaurants", "800 Spartan Way, Lathrop, CA 95330", "(209) 858-1008", "https://jackinthebox.com"),
    ("Carl's Jr Lathrop", "Lathrop", "Restaurants", "900 River Islands Pkwy, Lathrop, CA 95330", "(209) 858-1009", "https://carlsjr.com"),
    ("Chipotle Lathrop", "Lathrop", "Restaurants", "1000 River Islands Pkwy, Lathrop, CA 95330", "(209) 858-1010", "https://chipotle.com"),
    ("La Esperanza Mexican Grill Lathrop", "Lathrop", "Restaurants", "1100 River Islands Pkwy, Lathrop, CA 95330", "(209) 858-1011", ""),
    ("Golden Bowl Chinese Lathrop", "Lathrop", "Restaurants", "1200 Golden Valley Rd, Lathrop, CA 95330", "(209) 858-1012", ""),
    ("Lathrop Sushi Bar", "Lathrop", "Restaurants", "1300 Golden Valley Rd, Lathrop, CA 95330", "(209) 858-1013", ""),
    ("River Islands Café", "Lathrop", "Restaurants", "1400 River Islands Pkwy, Lathrop, CA 95330", "(209) 858-1014", ""),
    ("Wingstop Lathrop", "Lathrop", "Restaurants", "1500 Spartan Way, Lathrop, CA 95330", "(209) 858-1015", "https://wingstop.com"),
    ("Denny's Lathrop", "Lathrop", "Restaurants", "1600 Spartan Way, Lathrop, CA 95330", "(209) 858-1016", "https://dennys.com"),
    ("Papa Murphy's Lathrop", "Lathrop", "Restaurants", "1700 Spartan Way, Lathrop, CA 95330", "(209) 858-1017", "https://papamurphys.com"),
    ("Lathrop Pizza Kitchen", "Lathrop", "Restaurants", "1800 Golden Valley Rd, Lathrop, CA 95330", "(209) 858-1018", ""),
    ("Habit Burger Lathrop", "Lathrop", "Restaurants", "1900 River Islands Pkwy, Lathrop, CA 95330", "(209) 858-1019", "https://habitburger.com"),
    ("Jersey Mike's Lathrop", "Lathrop", "Restaurants", "2000 Spartan Way, Lathrop, CA 95330", "(209) 858-1020", "https://jerseymikes.com"),

    # Health & Wellness (15)
    ("Lathrop Family Dentistry", "Lathrop", "Health & Wellness", "100 Lathrop Rd, Lathrop, CA 95330", "(209) 858-5001", ""),
    ("River Islands Dental", "Lathrop", "Health & Wellness", "200 River Islands Pkwy, Lathrop, CA 95330", "(209) 858-5002", ""),
    ("Lathrop Urgent Care", "Lathrop", "Health & Wellness", "300 Spartan Way, Lathrop, CA 95330", "(209) 858-5003", ""),
    ("Planet Fitness Lathrop", "Lathrop", "Health & Wellness", "400 Lathrop Rd, Lathrop, CA 95330", "(209) 858-5004", "https://planetfitness.com"),
    ("Anytime Fitness Lathrop", "Lathrop", "Health & Wellness", "500 Golden Valley Rd, Lathrop, CA 95330", "(209) 858-5005", "https://anytimefitness.com"),
    ("Lathrop Chiropractic", "Lathrop", "Health & Wellness", "600 Spartan Way, Lathrop, CA 95330", "(209) 858-5006", ""),
    ("Lathrop Eye Care", "Lathrop", "Health & Wellness", "700 Lathrop Rd, Lathrop, CA 95330", "(209) 858-5007", ""),
    ("Valley Pediatrics Lathrop", "Lathrop", "Health & Wellness", "800 River Islands Pkwy, Lathrop, CA 95330", "(209) 858-5008", ""),
    ("Lathrop Physical Therapy", "Lathrop", "Health & Wellness", "900 Spartan Way, Lathrop, CA 95330", "(209) 858-5009", ""),
    ("Sutter Health Lathrop", "Lathrop", "Health & Wellness", "1000 Lathrop Rd, Lathrop, CA 95330", "(209) 858-5010", "https://sutterhealth.org"),
    ("Lathrop Orthodontics", "Lathrop", "Health & Wellness", "1100 Golden Valley Rd, Lathrop, CA 95330", "(209) 858-5011", ""),
    ("Core Yoga Lathrop", "Lathrop", "Health & Wellness", "1200 River Islands Pkwy, Lathrop, CA 95330", "(209) 858-5012", ""),
    ("Lathrop Mental Health Services", "Lathrop", "Health & Wellness", "1300 Spartan Way, Lathrop, CA 95330", "(209) 858-5013", ""),
    ("Central Valley Dermatology Lathrop", "Lathrop", "Health & Wellness", "1400 Lathrop Rd, Lathrop, CA 95330", "(209) 858-5014", ""),
    ("Lathrop Pharmacy", "Lathrop", "Health & Wellness", "1500 Golden Valley Rd, Lathrop, CA 95330", "(209) 858-5015", ""),

    # Beauty & Spa (8)
    ("Great Clips Lathrop", "Lathrop", "Beauty & Spa", "100 Lathrop Rd, Lathrop, CA 95330", "(209) 858-6001", "https://greatclips.com"),
    ("Sport Clips Lathrop", "Lathrop", "Beauty & Spa", "200 Spartan Way, Lathrop, CA 95330", "(209) 858-6002", "https://sportclips.com"),
    ("Lathrop Nail Studio", "Lathrop", "Beauty & Spa", "300 River Islands Pkwy, Lathrop, CA 95330", "(209) 858-6003", ""),
    ("Supercuts Lathrop", "Lathrop", "Beauty & Spa", "400 Lathrop Rd, Lathrop, CA 95330", "(209) 858-6004", "https://supercuts.com"),
    ("Lathrop Barbershop & Style", "Lathrop", "Beauty & Spa", "500 Golden Valley Rd, Lathrop, CA 95330", "(209) 858-6005", ""),
    ("Serenity Spa Lathrop", "Lathrop", "Beauty & Spa", "600 River Islands Pkwy, Lathrop, CA 95330", "(209) 858-6006", ""),
    ("Massage Envy Lathrop", "Lathrop", "Beauty & Spa", "700 Spartan Way, Lathrop, CA 95330", "(209) 858-6007", "https://massageenvy.com"),
    ("Blush Salon Lathrop", "Lathrop", "Beauty & Spa", "800 Lathrop Rd, Lathrop, CA 95330", "(209) 858-6008", ""),

    # Retail (12)
    ("Target Lathrop", "Lathrop", "Retail", "100 Spartan Way, Lathrop, CA 95330", "(209) 858-7001", "https://target.com"),
    ("Walmart Lathrop", "Lathrop", "Retail", "200 Lathrop Rd, Lathrop, CA 95330", "(209) 858-7002", "https://walmart.com"),
    ("CVS Pharmacy Lathrop", "Lathrop", "Retail", "300 Golden Valley Rd, Lathrop, CA 95330", "(209) 858-7003", "https://cvs.com"),
    ("Ross Dress for Less Lathrop", "Lathrop", "Retail", "400 Spartan Way, Lathrop, CA 95330", "(209) 858-7004", "https://rossstores.com"),
    ("Dollar Tree Lathrop", "Lathrop", "Retail", "500 River Islands Pkwy, Lathrop, CA 95330", "(209) 858-7005", "https://dollartree.com"),
    ("Five Below Lathrop", "Lathrop", "Retail", "600 Lathrop Rd, Lathrop, CA 95330", "(209) 858-7006", "https://fivebelow.com"),
    ("Big Lots Lathrop", "Lathrop", "Retail", "700 Golden Valley Rd, Lathrop, CA 95330", "(209) 858-7007", "https://biglots.com"),
    ("Ulta Beauty Lathrop", "Lathrop", "Retail", "800 Spartan Way, Lathrop, CA 95330", "(209) 858-7008", "https://ulta.com"),
    ("Lathrop Gift & Flower Shop", "Lathrop", "Retail", "900 River Islands Pkwy, Lathrop, CA 95330", "(209) 858-7009", ""),
    ("The UPS Store Lathrop", "Lathrop", "Retail", "1000 Lathrop Rd, Lathrop, CA 95330", "(209) 858-7010", "https://theupsstore.com"),
    ("Walgreens Lathrop", "Lathrop", "Retail", "1100 Golden Valley Rd, Lathrop, CA 95330", "(209) 858-7011", "https://walgreens.com"),
    ("7-Eleven Lathrop", "Lathrop", "Retail", "1200 Spartan Way, Lathrop, CA 95330", "(209) 858-7012", "https://7eleven.com"),

    # Education (10)
    ("Mossdale Elementary School", "Lathrop", "Education", "100 Spartan Way, Lathrop, CA 95330", "(209) 858-8001", ""),
    ("Lathrop High School", "Lathrop", "Education", "200 Lathrop Rd, Lathrop, CA 95330", "(209) 858-8002", ""),
    ("River Islands K-8 School", "Lathrop", "Education", "300 River Islands Pkwy, Lathrop, CA 95330", "(209) 858-8003", ""),
    ("Lathrop Preschool Academy", "Lathrop", "Education", "400 Golden Valley Rd, Lathrop, CA 95330", "(209) 858-8004", ""),
    ("Bright Minds Learning Center Lathrop", "Lathrop", "Education", "500 Spartan Way, Lathrop, CA 95330", "(209) 858-8005", ""),
    ("Kumon Math & Reading Lathrop", "Lathrop", "Education", "600 Lathrop Rd, Lathrop, CA 95330", "(209) 858-8006", "https://kumon.com"),
    ("Lathrop Dance Academy", "Lathrop", "Education", "700 River Islands Pkwy, Lathrop, CA 95330", "(209) 858-8007", ""),
    ("Little Stars Montessori Lathrop", "Lathrop", "Education", "800 Golden Valley Rd, Lathrop, CA 95330", "(209) 858-8008", ""),
    ("Sylvan Learning Lathrop", "Lathrop", "Education", "900 Spartan Way, Lathrop, CA 95330", "(209) 858-8009", "https://sylvanlearning.com"),
    ("Code Ninjas Lathrop", "Lathrop", "Education", "1000 Lathrop Rd, Lathrop, CA 95330", "(209) 858-8010", "https://codeninjas.com"),

    # Automotive (10)
    ("Jiffy Lube Lathrop", "Lathrop", "Automotive", "100 Lathrop Rd, Lathrop, CA 95330", "(209) 858-9001", "https://jiffylube.com"),
    ("AutoZone Lathrop", "Lathrop", "Automotive", "200 Spartan Way, Lathrop, CA 95330", "(209) 858-9002", "https://autozone.com"),
    ("O'Reilly Auto Parts Lathrop", "Lathrop", "Automotive", "300 Golden Valley Rd, Lathrop, CA 95330", "(209) 858-9003", "https://oreillyauto.com"),
    ("Firestone Lathrop", "Lathrop", "Automotive", "400 River Islands Pkwy, Lathrop, CA 95330", "(209) 858-9004", "https://firestonecompleteautocare.com"),
    ("Lathrop Auto Repair", "Lathrop", "Automotive", "500 Lathrop Rd, Lathrop, CA 95330", "(209) 858-9005", ""),
    ("Valvoline Lathrop", "Lathrop", "Automotive", "600 Spartan Way, Lathrop, CA 95330", "(209) 858-9006", "https://valvoline.com"),
    ("Lathrop Car Wash & Detail", "Lathrop", "Automotive", "700 Golden Valley Rd, Lathrop, CA 95330", "(209) 858-9007", ""),
    ("Lathrop Smog Check", "Lathrop", "Automotive", "800 River Islands Pkwy, Lathrop, CA 95330", "(209) 858-9008", ""),
    ("Pep Boys Lathrop", "Lathrop", "Automotive", "900 Lathrop Rd, Lathrop, CA 95330", "(209) 858-9009", "https://pepboys.com"),
    ("NAPA Auto Parts Lathrop", "Lathrop", "Automotive", "1000 Spartan Way, Lathrop, CA 95330", "(209) 858-9010", "https://napaonline.com"),

    # Real Estate (8)
    ("PMZ Real Estate Lathrop", "Lathrop", "Real Estate", "100 Lathrop Rd, Lathrop, CA 95330", "(209) 858-1101", "https://pmz.com"),
    ("Coldwell Banker Lathrop", "Lathrop", "Real Estate", "200 Golden Valley Rd, Lathrop, CA 95330", "(209) 858-1102", "https://coldwellbanker.com"),
    ("Keller Williams Lathrop", "Lathrop", "Real Estate", "300 Spartan Way, Lathrop, CA 95330", "(209) 858-1103", "https://kw.com"),
    ("River Islands Realty", "Lathrop", "Real Estate", "400 River Islands Pkwy, Lathrop, CA 95330", "(209) 858-1104", ""),
    ("Century 21 Lathrop", "Lathrop", "Real Estate", "500 Lathrop Rd, Lathrop, CA 95330", "(209) 858-1105", "https://century21.com"),
    ("Lathrop Property Management", "Lathrop", "Real Estate", "600 Golden Valley Rd, Lathrop, CA 95330", "(209) 858-1106", ""),
    ("New Home Gallery Lathrop", "Lathrop", "Real Estate", "700 River Islands Pkwy, Lathrop, CA 95330", "(209) 858-1107", ""),
    ("RE/MAX Lathrop", "Lathrop", "Real Estate", "800 Spartan Way, Lathrop, CA 95330", "(209) 858-1108", "https://remax.com"),

    # Home Services (13)
    ("Lathrop Plumbing Co.", "Lathrop", "Home Services", "100 Golden Valley Rd, Lathrop, CA 95330", "(209) 858-2001", ""),
    ("All-Climate HVAC Lathrop", "Lathrop", "Home Services", "200 Spartan Way, Lathrop, CA 95330", "(209) 858-2002", ""),
    ("Lathrop Roofing Pros", "Lathrop", "Home Services", "300 River Islands Pkwy, Lathrop, CA 95330", "(209) 858-2003", ""),
    ("Green Thumb Landscaping Lathrop", "Lathrop", "Home Services", "400 Lathrop Rd, Lathrop, CA 95330", "(209) 858-2004", ""),
    ("Lathrop Electrical Services", "Lathrop", "Home Services", "500 Golden Valley Rd, Lathrop, CA 95330", "(209) 858-2005", ""),
    ("Terminix Lathrop", "Lathrop", "Home Services", "600 Spartan Way, Lathrop, CA 95330", "(209) 858-2006", "https://terminix.com"),
    ("Home Depot Lathrop", "Lathrop", "Home Services", "700 Lathrop Rd, Lathrop, CA 95330", "(209) 858-2007", "https://homedepot.com"),
    ("Lowe's Lathrop", "Lathrop", "Home Services", "800 River Islands Pkwy, Lathrop, CA 95330", "(209) 858-2008", "https://lowes.com"),
    ("Mr. Handyman Lathrop", "Lathrop", "Home Services", "900 Golden Valley Rd, Lathrop, CA 95330", "(209) 858-2009", "https://mrhandyman.com"),
    ("Stanley Steemer Lathrop", "Lathrop", "Home Services", "1000 Spartan Way, Lathrop, CA 95330", "(209) 858-2010", "https://stanleysteemer.com"),
    ("Lathrop Solar Solutions", "Lathrop", "Home Services", "1100 Lathrop Rd, Lathrop, CA 95330", "(209) 858-2011", ""),
    ("Roto-Rooter Lathrop", "Lathrop", "Home Services", "1200 River Islands Pkwy, Lathrop, CA 95330", "(209) 858-2012", "https://rotorooter.com"),
    ("ServiceMaster Lathrop", "Lathrop", "Home Services", "1300 Golden Valley Rd, Lathrop, CA 95330", "(209) 858-2013", "https://servicemaster.com"),

    # Pet Services (10)
    ("Lathrop Veterinary Clinic", "Lathrop", "Pet Services", "100 Spartan Way, Lathrop, CA 95330", "(209) 858-3001", ""),
    ("VCA Lathrop Animal Hospital", "Lathrop", "Pet Services", "200 River Islands Pkwy, Lathrop, CA 95330", "(209) 858-3002", "https://vcahospitals.com"),
    ("Happy Paws Grooming Lathrop", "Lathrop", "Pet Services", "300 Lathrop Rd, Lathrop, CA 95330", "(209) 858-3003", ""),
    ("Petco Lathrop", "Lathrop", "Pet Services", "400 Golden Valley Rd, Lathrop, CA 95330", "(209) 858-3004", "https://petco.com"),
    ("PetSmart Lathrop", "Lathrop", "Pet Services", "500 Spartan Way, Lathrop, CA 95330", "(209) 858-3005", "https://petsmart.com"),
    ("Camp Bow Wow Lathrop", "Lathrop", "Pet Services", "600 River Islands Pkwy, Lathrop, CA 95330", "(209) 858-3006", "https://campbowwow.com"),
    ("Lathrop Dog Training Center", "Lathrop", "Pet Services", "700 Lathrop Rd, Lathrop, CA 95330", "(209) 858-3007", ""),
    ("River Islands Pet Grooming", "Lathrop", "Pet Services", "800 Golden Valley Rd, Lathrop, CA 95330", "(209) 858-3008", ""),
    ("Wag & Wash Lathrop", "Lathrop", "Pet Services", "900 Spartan Way, Lathrop, CA 95330", "(209) 858-3009", ""),
    ("Lathrop Cat & Dog Clinic", "Lathrop", "Pet Services", "1000 River Islands Pkwy, Lathrop, CA 95330", "(209) 858-3010", ""),


    # =========================================================
    # MANTECA — ~154 listings
    # =========================================================

    # Restaurants (28)
    ("In-N-Out Burger Manteca", "Manteca", "Restaurants", "1600 N Main St, Manteca, CA 95336", "(209) 239-1001", "https://in-n-out.com"),
    ("Applebee's Manteca", "Manteca", "Restaurants", "1610 N Main St, Manteca, CA 95336", "(209) 239-1002", "https://applebees.com"),
    ("Chili's Manteca", "Manteca", "Restaurants", "1620 N Main St, Manteca, CA 95336", "(209) 239-1003", "https://chilis.com"),
    ("Olive Garden Manteca", "Manteca", "Restaurants", "1630 N Main St, Manteca, CA 95336", "(209) 239-1004", "https://olivegarden.com"),
    ("Black Bear Diner Manteca", "Manteca", "Restaurants", "1640 N Main St, Manteca, CA 95336", "(209) 239-1005", "https://blackbeardiner.com"),
    ("Red Robin Manteca", "Manteca", "Restaurants", "1650 W Yosemite Ave, Manteca, CA 95336", "(209) 239-1006", "https://redrobin.com"),
    ("Starbucks Manteca Main", "Manteca", "Restaurants", "1660 W Yosemite Ave, Manteca, CA 95336", "(209) 239-1007", "https://starbucks.com"),
    ("Dutch Bros Manteca", "Manteca", "Restaurants", "1670 W Yosemite Ave, Manteca, CA 95336", "(209) 239-1008", "https://dutchbros.com"),
    ("Panda Express Manteca", "Manteca", "Restaurants", "1680 N Main St, Manteca, CA 95336", "(209) 239-1009", "https://pandaexpress.com"),
    ("Chipotle Manteca", "Manteca", "Restaurants", "1690 N Main St, Manteca, CA 95336", "(209) 239-1010", "https://chipotle.com"),
    ("Habit Burger Manteca", "Manteca", "Restaurants", "1700 W Yosemite Ave, Manteca, CA 95336", "(209) 239-1011", "https://habitburger.com"),
    ("Five Guys Manteca", "Manteca", "Restaurants", "1710 W Yosemite Ave, Manteca, CA 95336", "(209) 239-1012", "https://fiveguys.com"),
    ("BJ's Restaurant Manteca", "Manteca", "Restaurants", "1720 N Main St, Manteca, CA 95336", "(209) 239-1013", "https://bjsrestaurants.com"),
    ("Panera Bread Manteca", "Manteca", "Restaurants", "1730 N Main St, Manteca, CA 95336", "(209) 239-1014", "https://panerabread.com"),
    ("Round Table Pizza Manteca", "Manteca", "Restaurants", "1740 W Yosemite Ave, Manteca, CA 95336", "(209) 239-1015", "https://roundtablepizza.com"),
    ("Golden Corral Manteca", "Manteca", "Restaurants", "1750 W Yosemite Ave, Manteca, CA 95336", "(209) 239-1016", "https://goldencorral.com"),
    ("Cracker Barrel Manteca", "Manteca", "Restaurants", "1760 N Main St, Manteca, CA 95336", "(209) 239-1017", "https://crackerbarrel.com"),
    ("El Torito Manteca", "Manteca", "Restaurants", "1770 N Main St, Manteca, CA 95336", "(209) 239-1018", "https://eltorito.com"),
    ("Raising Cane's Manteca", "Manteca", "Restaurants", "1780 W Yosemite Ave, Manteca, CA 95336", "(209) 239-1019", "https://raisingcanes.com"),
    ("Wingstop Manteca", "Manteca", "Restaurants", "1790 W Yosemite Ave, Manteca, CA 95336", "(209) 239-1020", "https://wingstop.com"),
    ("Manteca Halal Grill", "Manteca", "Restaurants", "1800 N Main St, Manteca, CA 95336", "(209) 239-1021", ""),
    ("Pho Saigon Manteca", "Manteca", "Restaurants", "1810 N Main St, Manteca, CA 95336", "(209) 239-1022", ""),
    ("Casa Azteca Manteca", "Manteca", "Restaurants", "1820 W Yosemite Ave, Manteca, CA 95336", "(209) 239-1023", ""),
    ("Manteca Sushi & Teriyaki", "Manteca", "Restaurants", "1830 W Yosemite Ave, Manteca, CA 95336", "(209) 239-1024", ""),
    ("Denny's Manteca", "Manteca", "Restaurants", "1840 N Main St, Manteca, CA 95336", "(209) 239-1025", "https://dennys.com"),
    ("IHOP Manteca", "Manteca", "Restaurants", "1850 N Main St, Manteca, CA 95336", "(209) 239-1026", "https://ihop.com"),
    ("Curry House Manteca", "Manteca", "Restaurants", "1860 W Yosemite Ave, Manteca, CA 95336", "(209) 239-1027", ""),
    ("Manteca Boba & Tea House", "Manteca", "Restaurants", "1870 W Yosemite Ave, Manteca, CA 95336", "(209) 239-1028", ""),

    # Health & Wellness (22)
    ("Doctors Medical Center Manteca", "Manteca", "Health & Wellness", "1900 N Main St, Manteca, CA 95336", "(209) 239-5001", ""),
    ("Kaiser Permanente Manteca", "Manteca", "Health & Wellness", "1910 N Main St, Manteca, CA 95336", "(209) 239-5002", "https://kp.org"),
    ("Manteca Family Dentistry", "Manteca", "Health & Wellness", "1920 W Yosemite Ave, Manteca, CA 95336", "(209) 239-5003", ""),
    ("Manteca Orthodontics", "Manteca", "Health & Wellness", "1930 W Yosemite Ave, Manteca, CA 95336", "(209) 239-5004", ""),
    ("Manteca Eye Care Center", "Manteca", "Health & Wellness", "1940 N Main St, Manteca, CA 95336", "(209) 239-5005", ""),
    ("Planet Fitness Manteca", "Manteca", "Health & Wellness", "1950 N Main St, Manteca, CA 95336", "(209) 239-5006", "https://planetfitness.com"),
    ("24 Hour Fitness Manteca", "Manteca", "Health & Wellness", "1960 W Yosemite Ave, Manteca, CA 95336", "(209) 239-5007", "https://24hourfitness.com"),
    ("OrangeTheory Manteca", "Manteca", "Health & Wellness", "1970 W Yosemite Ave, Manteca, CA 95336", "(209) 239-5008", "https://orangetheory.com"),
    ("Manteca Physical Therapy", "Manteca", "Health & Wellness", "1980 N Main St, Manteca, CA 95336", "(209) 239-5009", ""),
    ("Manteca Chiropractic Center", "Manteca", "Health & Wellness", "1990 N Main St, Manteca, CA 95336", "(209) 239-5010", ""),
    ("Valley Urgent Care Manteca", "Manteca", "Health & Wellness", "2000 W Yosemite Ave, Manteca, CA 95336", "(209) 239-5011", ""),
    ("Manteca Pediatrics", "Manteca", "Health & Wellness", "2010 W Yosemite Ave, Manteca, CA 95336", "(209) 239-5012", ""),
    ("Crossfit Manteca", "Manteca", "Health & Wellness", "2020 N Main St, Manteca, CA 95336", "(209) 239-5013", ""),
    ("Manteca Yoga Studio", "Manteca", "Health & Wellness", "2030 N Main St, Manteca, CA 95336", "(209) 239-5014", ""),
    ("Manteca Women's Health", "Manteca", "Health & Wellness", "2040 W Yosemite Ave, Manteca, CA 95336", "(209) 239-5015", ""),
    ("Concentra Urgent Care Manteca", "Manteca", "Health & Wellness", "2050 W Yosemite Ave, Manteca, CA 95336", "(209) 239-5016", "https://concentra.com"),
    ("Manteca Dermatology", "Manteca", "Health & Wellness", "2060 N Main St, Manteca, CA 95336", "(209) 239-5017", ""),
    ("Manteca Pediatric Dentistry", "Manteca", "Health & Wellness", "2070 N Main St, Manteca, CA 95336", "(209) 239-5018", ""),
    ("F45 Training Manteca", "Manteca", "Health & Wellness", "2080 W Yosemite Ave, Manteca, CA 95336", "(209) 239-5019", "https://f45training.com"),
    ("Manteca Behavioral Health", "Manteca", "Health & Wellness", "2090 W Yosemite Ave, Manteca, CA 95336", "(209) 239-5020", ""),
    ("Manteca Pharmacy & Wellness", "Manteca", "Health & Wellness", "2100 N Main St, Manteca, CA 95336", "(209) 239-5021", ""),
    ("Valley Spine & Rehab Manteca", "Manteca", "Health & Wellness", "2110 N Main St, Manteca, CA 95336", "(209) 239-5022", ""),

    # Beauty & Spa (12)
    ("Great Clips Manteca", "Manteca", "Beauty & Spa", "2120 W Yosemite Ave, Manteca, CA 95336", "(209) 239-6001", "https://greatclips.com"),
    ("Sport Clips Manteca", "Manteca", "Beauty & Spa", "2130 W Yosemite Ave, Manteca, CA 95336", "(209) 239-6002", "https://sportclips.com"),
    ("Manteca Nail Bar", "Manteca", "Beauty & Spa", "2140 N Main St, Manteca, CA 95336", "(209) 239-6003", ""),
    ("Massage Envy Manteca", "Manteca", "Beauty & Spa", "2150 N Main St, Manteca, CA 95336", "(209) 239-6004", "https://massageenvy.com"),
    ("European Wax Center Manteca", "Manteca", "Beauty & Spa", "2160 W Yosemite Ave, Manteca, CA 95336", "(209) 239-6005", "https://waxcenter.com"),
    ("Supercuts Manteca", "Manteca", "Beauty & Spa", "2170 W Yosemite Ave, Manteca, CA 95336", "(209) 239-6006", "https://supercuts.com"),
    ("Manteca Barbershop", "Manteca", "Beauty & Spa", "2180 N Main St, Manteca, CA 95336", "(209) 239-6007", ""),
    ("Hand & Stone Manteca", "Manteca", "Beauty & Spa", "2190 N Main St, Manteca, CA 95336", "(209) 239-6008", "https://handandstone.com"),
    ("Glow Aesthetics Manteca", "Manteca", "Beauty & Spa", "2200 W Yosemite Ave, Manteca, CA 95336", "(209) 239-6009", ""),
    ("Manteca Hair Studio", "Manteca", "Beauty & Spa", "2210 W Yosemite Ave, Manteca, CA 95336", "(209) 239-6010", ""),
    ("Zen Day Spa Manteca", "Manteca", "Beauty & Spa", "2220 N Main St, Manteca, CA 95336", "(209) 239-6011", ""),
    ("Luxe Lash & Brow Manteca", "Manteca", "Beauty & Spa", "2230 N Main St, Manteca, CA 95336", "(209) 239-6012", ""),

    # Retail (18)
    ("Target Manteca", "Manteca", "Retail", "2240 W Yosemite Ave, Manteca, CA 95336", "(209) 239-7001", "https://target.com"),
    ("Walmart Supercenter Manteca", "Manteca", "Retail", "2250 W Yosemite Ave, Manteca, CA 95336", "(209) 239-7002", "https://walmart.com"),
    ("Best Buy Manteca", "Manteca", "Retail", "2260 N Main St, Manteca, CA 95336", "(209) 239-7003", "https://bestbuy.com"),
    ("Ross Dress for Less Manteca", "Manteca", "Retail", "2270 N Main St, Manteca, CA 95336", "(209) 239-7004", "https://rossstores.com"),
    ("TJ Maxx Manteca", "Manteca", "Retail", "2280 W Yosemite Ave, Manteca, CA 95336", "(209) 239-7005", "https://tjmaxx.com"),
    ("HomeGoods Manteca", "Manteca", "Retail", "2290 W Yosemite Ave, Manteca, CA 95336", "(209) 239-7006", "https://homegoods.com"),
    ("Bath & Body Works Manteca", "Manteca", "Retail", "2300 N Main St, Manteca, CA 95336", "(209) 239-7007", "https://bathandbodyworks.com"),
    ("Ulta Beauty Manteca", "Manteca", "Retail", "2310 N Main St, Manteca, CA 95336", "(209) 239-7008", "https://ulta.com"),
    ("Dick's Sporting Goods Manteca", "Manteca", "Retail", "2320 W Yosemite Ave, Manteca, CA 95336", "(209) 239-7009", "https://dickssportinggoods.com"),
    ("Michaels Manteca", "Manteca", "Retail", "2330 W Yosemite Ave, Manteca, CA 95336", "(209) 239-7010", "https://michaels.com"),
    ("Marshalls Manteca", "Manteca", "Retail", "2340 N Main St, Manteca, CA 95336", "(209) 239-7011", "https://marshalls.com"),
    ("Five Below Manteca", "Manteca", "Retail", "2350 N Main St, Manteca, CA 95336", "(209) 239-7012", "https://fivebelow.com"),
    ("Dollar Tree Manteca", "Manteca", "Retail", "2360 W Yosemite Ave, Manteca, CA 95336", "(209) 239-7013", "https://dollartree.com"),
    ("Hobby Lobby Manteca", "Manteca", "Retail", "2370 W Yosemite Ave, Manteca, CA 95336", "(209) 239-7014", "https://hobbylobby.com"),
    ("CVS Pharmacy Manteca", "Manteca", "Retail", "2380 N Main St, Manteca, CA 95336", "(209) 239-7015", "https://cvs.com"),
    ("Walgreens Manteca", "Manteca", "Retail", "2390 N Main St, Manteca, CA 95336", "(209) 239-7016", "https://walgreens.com"),
    ("Manteca Florist & Gifts", "Manteca", "Retail", "2400 W Yosemite Ave, Manteca, CA 95336", "(209) 239-7017", ""),
    ("The UPS Store Manteca", "Manteca", "Retail", "2410 W Yosemite Ave, Manteca, CA 95336", "(209) 239-7018", "https://theupsstore.com"),

    # Education (15)
    ("Manteca Unified School District", "Manteca", "Education", "2420 N Main St, Manteca, CA 95336", "(209) 239-8001", "https://musd.net"),
    ("East Union High School", "Manteca", "Education", "2430 N Main St, Manteca, CA 95336", "(209) 239-8002", ""),
    ("Sierra High School Manteca", "Manteca", "Education", "2440 W Yosemite Ave, Manteca, CA 95336", "(209) 239-8003", ""),
    ("Primrose School Manteca", "Manteca", "Education", "2450 W Yosemite Ave, Manteca, CA 95336", "(209) 239-8004", "https://primroseschools.com"),
    ("The Learning Experience Manteca", "Manteca", "Education", "2460 N Main St, Manteca, CA 95336", "(209) 239-8005", "https://thelearningexperience.com"),
    ("Kumon Manteca", "Manteca", "Education", "2470 N Main St, Manteca, CA 95336", "(209) 239-8006", "https://kumon.com"),
    ("Mathnasium Manteca", "Manteca", "Education", "2480 W Yosemite Ave, Manteca, CA 95336", "(209) 239-8007", "https://mathnasium.com"),
    ("Sylvan Learning Manteca", "Manteca", "Education", "2490 W Yosemite Ave, Manteca, CA 95336", "(209) 239-8008", "https://sylvanlearning.com"),
    ("Little Gym Manteca", "Manteca", "Education", "2500 N Main St, Manteca, CA 95336", "(209) 239-8009", "https://thelittlegym.com"),
    ("Manteca Dance Academy", "Manteca", "Education", "2510 N Main St, Manteca, CA 95336", "(209) 239-8010", ""),
    ("Manteca Montessori School", "Manteca", "Education", "2520 W Yosemite Ave, Manteca, CA 95336", "(209) 239-8011", ""),
    ("Code Ninjas Manteca", "Manteca", "Education", "2530 W Yosemite Ave, Manteca, CA 95336", "(209) 239-8012", "https://codeninjas.com"),
    ("Challenger School Manteca", "Manteca", "Education", "2540 N Main St, Manteca, CA 95336", "(209) 239-8013", "https://challengerschool.com"),
    ("Manteca Preschool & Daycare", "Manteca", "Education", "2550 N Main St, Manteca, CA 95336", "(209) 239-8014", ""),
    ("Music Together Manteca", "Manteca", "Education", "2560 W Yosemite Ave, Manteca, CA 95336", "(209) 239-8015", ""),

    # Automotive (15)
    ("Jiffy Lube Manteca", "Manteca", "Automotive", "2570 W Yosemite Ave, Manteca, CA 95336", "(209) 239-9001", "https://jiffylube.com"),
    ("Pep Boys Manteca", "Manteca", "Automotive", "2580 N Main St, Manteca, CA 95336", "(209) 239-9002", "https://pepboys.com"),
    ("Firestone Manteca", "Manteca", "Automotive", "2590 N Main St, Manteca, CA 95336", "(209) 239-9003", "https://firestonecompleteautocare.com"),
    ("Midas Manteca", "Manteca", "Automotive", "2600 W Yosemite Ave, Manteca, CA 95336", "(209) 239-9004", "https://midas.com"),
    ("AutoZone Manteca", "Manteca", "Automotive", "2610 W Yosemite Ave, Manteca, CA 95336", "(209) 239-9005", "https://autozone.com"),
    ("O'Reilly Auto Parts Manteca", "Manteca", "Automotive", "2620 N Main St, Manteca, CA 95336", "(209) 239-9006", "https://oreillyauto.com"),
    ("Caliber Collision Manteca", "Manteca", "Automotive", "2630 N Main St, Manteca, CA 95336", "(209) 239-9007", "https://calibercollision.com"),
    ("CarMax Manteca", "Manteca", "Automotive", "2640 W Yosemite Ave, Manteca, CA 95336", "(209) 239-9008", "https://carmax.com"),
    ("Toyota of Manteca", "Manteca", "Automotive", "2650 W Yosemite Ave, Manteca, CA 95336", "(209) 239-9009", ""),
    ("Valvoline Manteca", "Manteca", "Automotive", "2660 N Main St, Manteca, CA 95336", "(209) 239-9010", "https://valvoline.com"),
    ("NAPA Auto Parts Manteca", "Manteca", "Automotive", "2670 N Main St, Manteca, CA 95336", "(209) 239-9011", "https://napaonline.com"),
    ("Manteca Car Wash", "Manteca", "Automotive", "2680 W Yosemite Ave, Manteca, CA 95336", "(209) 239-9012", ""),
    ("Manteca Smog Center", "Manteca", "Automotive", "2690 W Yosemite Ave, Manteca, CA 95336", "(209) 239-9013", ""),
    ("Enterprise Rent-A-Car Manteca", "Manteca", "Automotive", "2700 N Main St, Manteca, CA 95336", "(209) 239-9014", "https://enterprise.com"),
    ("Manteca Ford Dealership", "Manteca", "Automotive", "2710 N Main St, Manteca, CA 95336", "(209) 239-9015", ""),

    # Real Estate (12)
    ("PMZ Real Estate Manteca", "Manteca", "Real Estate", "2720 W Yosemite Ave, Manteca, CA 95336", "(209) 239-1201", "https://pmz.com"),
    ("Coldwell Banker Manteca", "Manteca", "Real Estate", "2730 W Yosemite Ave, Manteca, CA 95336", "(209) 239-1202", "https://coldwellbanker.com"),
    ("Keller Williams Manteca", "Manteca", "Real Estate", "2740 N Main St, Manteca, CA 95336", "(209) 239-1203", "https://kw.com"),
    ("RE/MAX Manteca", "Manteca", "Real Estate", "2750 N Main St, Manteca, CA 95336", "(209) 239-1204", "https://remax.com"),
    ("Century 21 Manteca", "Manteca", "Real Estate", "2760 W Yosemite Ave, Manteca, CA 95336", "(209) 239-1205", "https://century21.com"),
    ("Manteca Property Management", "Manteca", "Real Estate", "2770 W Yosemite Ave, Manteca, CA 95336", "(209) 239-1206", ""),
    ("Compass Realty Manteca", "Manteca", "Real Estate", "2780 N Main St, Manteca, CA 95336", "(209) 239-1207", "https://compass.com"),
    ("Bay Area Home Search Manteca", "Manteca", "Real Estate", "2790 N Main St, Manteca, CA 95336", "(209) 239-1208", ""),
    ("First American Title Manteca", "Manteca", "Real Estate", "2800 W Yosemite Ave, Manteca, CA 95336", "(209) 239-1209", "https://firstam.com"),
    ("Manteca New Homes Gallery", "Manteca", "Real Estate", "2810 W Yosemite Ave, Manteca, CA 95336", "(209) 239-1210", ""),
    ("Wells Fargo Home Mortgage Manteca", "Manteca", "Real Estate", "2820 N Main St, Manteca, CA 95336", "(209) 239-1211", "https://wellsfargo.com"),
    ("Manteca Investment Properties", "Manteca", "Real Estate", "2830 N Main St, Manteca, CA 95336", "(209) 239-1212", ""),

    # Home Services (17)
    ("Manteca Plumbing & Drain", "Manteca", "Home Services", "2840 W Yosemite Ave, Manteca, CA 95336", "(209) 239-2001", ""),
    ("All-Pro HVAC Manteca", "Manteca", "Home Services", "2850 W Yosemite Ave, Manteca, CA 95336", "(209) 239-2002", ""),
    ("Manteca Roofing Co.", "Manteca", "Home Services", "2860 N Main St, Manteca, CA 95336", "(209) 239-2003", ""),
    ("Green Thumb Landscaping Manteca", "Manteca", "Home Services", "2870 N Main St, Manteca, CA 95336", "(209) 239-2004", ""),
    ("Manteca Electrical Services", "Manteca", "Home Services", "2880 W Yosemite Ave, Manteca, CA 95336", "(209) 239-2005", ""),
    ("Terminix Manteca", "Manteca", "Home Services", "2890 W Yosemite Ave, Manteca, CA 95336", "(209) 239-2006", "https://terminix.com"),
    ("Home Depot Manteca", "Manteca", "Home Services", "2900 N Main St, Manteca, CA 95336", "(209) 239-2007", "https://homedepot.com"),
    ("Lowe's Manteca", "Manteca", "Home Services", "2910 N Main St, Manteca, CA 95336", "(209) 239-2008", "https://lowes.com"),
    ("Roto-Rooter Manteca", "Manteca", "Home Services", "2920 W Yosemite Ave, Manteca, CA 95336", "(209) 239-2009", "https://rotorooter.com"),
    ("Molly Maid Manteca", "Manteca", "Home Services", "2930 W Yosemite Ave, Manteca, CA 95336", "(209) 239-2010", "https://mollymaid.com"),
    ("Stanley Steemer Manteca", "Manteca", "Home Services", "2940 N Main St, Manteca, CA 95336", "(209) 239-2011", "https://stanleysteemer.com"),
    ("Manteca Solar Solutions", "Manteca", "Home Services", "2950 N Main St, Manteca, CA 95336", "(209) 239-2012", ""),
    ("Budget Blinds Manteca", "Manteca", "Home Services", "2960 W Yosemite Ave, Manteca, CA 95336", "(209) 239-2013", "https://budgetblinds.com"),
    ("Two Men and a Truck Manteca", "Manteca", "Home Services", "2970 W Yosemite Ave, Manteca, CA 95336", "(209) 239-2014", "https://twomenandatruck.com"),
    ("Mr. Handyman Manteca", "Manteca", "Home Services", "2980 N Main St, Manteca, CA 95336", "(209) 239-2015", "https://mrhandyman.com"),
    ("Ace Hardware Manteca", "Manteca", "Home Services", "2990 N Main St, Manteca, CA 95336", "(209) 239-2016", "https://acehardware.com"),
    ("ServiceMaster Manteca", "Manteca", "Home Services", "3000 W Yosemite Ave, Manteca, CA 95336", "(209) 239-2017", "https://servicemaster.com"),

    # Pet Services (15)
    ("Manteca Veterinary Clinic", "Manteca", "Pet Services", "3010 W Yosemite Ave, Manteca, CA 95336", "(209) 239-3001", ""),
    ("VCA Manteca Animal Hospital", "Manteca", "Pet Services", "3020 N Main St, Manteca, CA 95336", "(209) 239-3002", "https://vcahospitals.com"),
    ("Happy Tails Grooming Manteca", "Manteca", "Pet Services", "3030 N Main St, Manteca, CA 95336", "(209) 239-3003", ""),
    ("Petco Manteca", "Manteca", "Pet Services", "3040 W Yosemite Ave, Manteca, CA 95336", "(209) 239-3004", "https://petco.com"),
    ("PetSmart Manteca", "Manteca", "Pet Services", "3050 W Yosemite Ave, Manteca, CA 95336", "(209) 239-3005", "https://petsmart.com"),
    ("Camp Bow Wow Manteca", "Manteca", "Pet Services", "3060 N Main St, Manteca, CA 95336", "(209) 239-3006", "https://campbowwow.com"),
    ("Manteca Dog Training", "Manteca", "Pet Services", "3070 N Main St, Manteca, CA 95336", "(209) 239-3007", ""),
    ("Bark Avenue Daycare Manteca", "Manteca", "Pet Services", "3080 W Yosemite Ave, Manteca, CA 95336", "(209) 239-3008", ""),
    ("Wag & Wash Manteca", "Manteca", "Pet Services", "3090 W Yosemite Ave, Manteca, CA 95336", "(209) 239-3009", ""),
    ("Manteca Cat Clinic", "Manteca", "Pet Services", "3100 N Main St, Manteca, CA 95336", "(209) 239-3010", ""),
    ("Manteca Exotic Pet Care", "Manteca", "Pet Services", "3110 N Main St, Manteca, CA 95336", "(209) 239-3011", ""),
    ("Central Valley Vet Manteca", "Manteca", "Pet Services", "3120 W Yosemite Ave, Manteca, CA 95336", "(209) 239-3012", ""),
    ("Furever Friends Grooming Manteca", "Manteca", "Pet Services", "3130 W Yosemite Ave, Manteca, CA 95336", "(209) 239-3013", ""),
    ("Manteca Pet Supply Store", "Manteca", "Pet Services", "3140 N Main St, Manteca, CA 95336", "(209) 239-3014", ""),
    ("Elite Dog Training Manteca", "Manteca", "Pet Services", "3150 N Main St, Manteca, CA 95336", "(209) 239-3015", ""),


    # =========================================================
    # BRENTWOOD — ~100 additional listings
    # =========================================================

    # Restaurants (20)
    ("In-N-Out Burger Brentwood", "Brentwood", "Restaurants", "2001 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-1001", "https://in-n-out.com"),
    ("Lazy Dog Restaurant Brentwood", "Brentwood", "Restaurants", "2011 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-1002", "https://lazydogrestaurants.com"),
    ("BJ's Restaurant Brentwood", "Brentwood", "Restaurants", "2021 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-1003", "https://bjsrestaurants.com"),
    ("Chili's Brentwood", "Brentwood", "Restaurants", "2031 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-1004", "https://chilis.com"),
    ("Olive Garden Brentwood", "Brentwood", "Restaurants", "2041 Balfour Rd, Brentwood, CA 94513", "(925) 516-1005", "https://olivegarden.com"),
    ("Black Bear Diner Brentwood", "Brentwood", "Restaurants", "2051 Balfour Rd, Brentwood, CA 94513", "(925) 516-1006", "https://blackbeardiner.com"),
    ("Red Robin Brentwood", "Brentwood", "Restaurants", "2061 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-1007", "https://redrobin.com"),
    ("Habit Burger Brentwood", "Brentwood", "Restaurants", "2071 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-1008", "https://habitburger.com"),
    ("Five Guys Brentwood", "Brentwood", "Restaurants", "2081 Balfour Rd, Brentwood, CA 94513", "(925) 516-1009", "https://fiveguys.com"),
    ("Panera Bread Brentwood", "Brentwood", "Restaurants", "2091 Balfour Rd, Brentwood, CA 94513", "(925) 516-1010", "https://panerabread.com"),
    ("Starbucks Brentwood Sand Creek", "Brentwood", "Restaurants", "2101 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-1011", "https://starbucks.com"),
    ("Dutch Bros Brentwood", "Brentwood", "Restaurants", "2111 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-1012", "https://dutchbros.com"),
    ("Brentwood Sushi & Grill", "Brentwood", "Restaurants", "2121 Balfour Rd, Brentwood, CA 94513", "(925) 516-1013", ""),
    ("Casa Perico Mexican Grill Brentwood", "Brentwood", "Restaurants", "2131 Balfour Rd, Brentwood, CA 94513", "(925) 516-1014", ""),
    ("Pho Brentwood", "Brentwood", "Restaurants", "2141 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-1015", ""),
    ("Round Table Pizza Brentwood", "Brentwood", "Restaurants", "2151 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-1016", "https://roundtablepizza.com"),
    ("Raising Cane's Brentwood", "Brentwood", "Restaurants", "2161 Balfour Rd, Brentwood, CA 94513", "(925) 516-1017", "https://raisingcanes.com"),
    ("Wingstop Brentwood", "Brentwood", "Restaurants", "2171 Balfour Rd, Brentwood, CA 94513", "(925) 516-1018", "https://wingstop.com"),
    ("IHOP Brentwood", "Brentwood", "Restaurants", "2181 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-1019", "https://ihop.com"),
    ("Curry Leaf Indian Restaurant Brentwood", "Brentwood", "Restaurants", "2191 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-1020", ""),

    # Health & Wellness (15)
    ("Brentwood Family Medicine", "Brentwood", "Health & Wellness", "2201 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-5001", ""),
    ("Brentwood Dental Group", "Brentwood", "Health & Wellness", "2211 Balfour Rd, Brentwood, CA 94513", "(925) 516-5002", ""),
    ("Brentwood Orthodontics", "Brentwood", "Health & Wellness", "2221 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-5003", ""),
    ("Kaiser Permanente Brentwood", "Brentwood", "Health & Wellness", "2231 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-5004", "https://kp.org"),
    ("Sutter Health Brentwood", "Brentwood", "Health & Wellness", "2241 Balfour Rd, Brentwood, CA 94513", "(925) 516-5005", "https://sutterhealth.org"),
    ("Anytime Fitness Brentwood", "Brentwood", "Health & Wellness", "2251 Balfour Rd, Brentwood, CA 94513", "(925) 516-5006", "https://anytimefitness.com"),
    ("Planet Fitness Brentwood", "Brentwood", "Health & Wellness", "2261 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-5007", "https://planetfitness.com"),
    ("OrangeTheory Brentwood", "Brentwood", "Health & Wellness", "2271 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-5008", "https://orangetheory.com"),
    ("Brentwood Urgent Care", "Brentwood", "Health & Wellness", "2281 Balfour Rd, Brentwood, CA 94513", "(925) 516-5009", ""),
    ("Brentwood Chiropractic", "Brentwood", "Health & Wellness", "2291 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-5010", ""),
    ("Brentwood Physical Therapy", "Brentwood", "Health & Wellness", "2301 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-5011", ""),
    ("Brentwood Eye Care", "Brentwood", "Health & Wellness", "2311 Balfour Rd, Brentwood, CA 94513", "(925) 516-5012", ""),
    ("Brentwood Pediatrics", "Brentwood", "Health & Wellness", "2321 Balfour Rd, Brentwood, CA 94513", "(925) 516-5013", ""),
    ("F45 Training Brentwood", "Brentwood", "Health & Wellness", "2331 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-5014", "https://f45training.com"),
    ("Brentwood Yoga & Wellness", "Brentwood", "Health & Wellness", "2341 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-5015", ""),

    # Beauty & Spa (10)
    ("Great Clips Brentwood", "Brentwood", "Beauty & Spa", "2351 Balfour Rd, Brentwood, CA 94513", "(925) 516-6001", "https://greatclips.com"),
    ("Sport Clips Brentwood", "Brentwood", "Beauty & Spa", "2361 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-6002", "https://sportclips.com"),
    ("Brentwood Nail Bar", "Brentwood", "Beauty & Spa", "2371 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-6003", ""),
    ("Massage Envy Brentwood", "Brentwood", "Beauty & Spa", "2381 Balfour Rd, Brentwood, CA 94513", "(925) 516-6004", "https://massageenvy.com"),
    ("European Wax Center Brentwood", "Brentwood", "Beauty & Spa", "2391 Balfour Rd, Brentwood, CA 94513", "(925) 516-6005", "https://waxcenter.com"),
    ("Brentwood Barbershop", "Brentwood", "Beauty & Spa", "2401 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-6006", ""),
    ("Glow Skin Studio Brentwood", "Brentwood", "Beauty & Spa", "2411 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-6007", ""),
    ("Hand & Stone Brentwood", "Brentwood", "Beauty & Spa", "2421 Balfour Rd, Brentwood, CA 94513", "(925) 516-6008", "https://handandstone.com"),
    ("Supercuts Brentwood", "Brentwood", "Beauty & Spa", "2431 Balfour Rd, Brentwood, CA 94513", "(925) 516-6009", "https://supercuts.com"),
    ("Brentwood Hair & Color Studio", "Brentwood", "Beauty & Spa", "2441 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-6010", ""),

    # Retail (10)
    ("Target Brentwood", "Brentwood", "Retail", "2451 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-7001", "https://target.com"),
    ("Best Buy Brentwood", "Brentwood", "Retail", "2461 Balfour Rd, Brentwood, CA 94513", "(925) 516-7002", "https://bestbuy.com"),
    ("Ross Dress for Less Brentwood", "Brentwood", "Retail", "2471 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-7003", "https://rossstores.com"),
    ("TJ Maxx Brentwood", "Brentwood", "Retail", "2481 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-7004", "https://tjmaxx.com"),
    ("Bath & Body Works Brentwood", "Brentwood", "Retail", "2491 Balfour Rd, Brentwood, CA 94513", "(925) 516-7005", "https://bathandbodyworks.com"),
    ("Ulta Beauty Brentwood", "Brentwood", "Retail", "2501 Balfour Rd, Brentwood, CA 94513", "(925) 516-7006", "https://ulta.com"),
    ("Michaels Brentwood", "Brentwood", "Retail", "2511 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-7007", "https://michaels.com"),
    ("Dick's Sporting Goods Brentwood", "Brentwood", "Retail", "2521 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-7008", "https://dickssportinggoods.com"),
    ("Five Below Brentwood", "Brentwood", "Retail", "2531 Balfour Rd, Brentwood, CA 94513", "(925) 516-7009", "https://fivebelow.com"),
    ("Dollar Tree Brentwood", "Brentwood", "Retail", "2541 Balfour Rd, Brentwood, CA 94513", "(925) 516-7010", "https://dollartree.com"),

    # Education (8)
    ("Heritage High School Brentwood", "Brentwood", "Education", "2551 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-8001", ""),
    ("Primrose School Brentwood", "Brentwood", "Education", "2561 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-8002", "https://primroseschools.com"),
    ("Kumon Brentwood", "Brentwood", "Education", "2571 Balfour Rd, Brentwood, CA 94513", "(925) 516-8003", "https://kumon.com"),
    ("Mathnasium Brentwood", "Brentwood", "Education", "2581 Balfour Rd, Brentwood, CA 94513", "(925) 516-8004", "https://mathnasium.com"),
    ("Little Gym Brentwood", "Brentwood", "Education", "2591 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-8005", "https://thelittlegym.com"),
    ("Sylvan Learning Brentwood", "Brentwood", "Education", "2601 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-8006", "https://sylvanlearning.com"),
    ("Brentwood Dance Academy", "Brentwood", "Education", "2611 Balfour Rd, Brentwood, CA 94513", "(925) 516-8007", ""),
    ("Brentwood Montessori", "Brentwood", "Education", "2621 Balfour Rd, Brentwood, CA 94513", "(925) 516-8008", ""),

    # Automotive (8)
    ("Jiffy Lube Brentwood", "Brentwood", "Automotive", "2631 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-9001", "https://jiffylube.com"),
    ("AutoZone Brentwood", "Brentwood", "Automotive", "2641 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-9002", "https://autozone.com"),
    ("Firestone Brentwood", "Brentwood", "Automotive", "2651 Balfour Rd, Brentwood, CA 94513", "(925) 516-9003", "https://firestonecompleteautocare.com"),
    ("Caliber Collision Brentwood", "Brentwood", "Automotive", "2661 Balfour Rd, Brentwood, CA 94513", "(925) 516-9004", "https://calibercollision.com"),
    ("Brentwood Auto Repair", "Brentwood", "Automotive", "2671 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-9005", ""),
    ("Valvoline Brentwood", "Brentwood", "Automotive", "2681 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-9006", "https://valvoline.com"),
    ("Brentwood Car Wash & Detail", "Brentwood", "Automotive", "2691 Balfour Rd, Brentwood, CA 94513", "(925) 516-9007", ""),
    ("Brentwood Smog Check", "Brentwood", "Automotive", "2701 Balfour Rd, Brentwood, CA 94513", "(925) 516-9008", ""),

    # Real Estate (8)
    ("Coldwell Banker Brentwood", "Brentwood", "Real Estate", "2711 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-1301", "https://coldwellbanker.com"),
    ("Keller Williams Brentwood", "Brentwood", "Real Estate", "2721 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-1302", "https://kw.com"),
    ("RE/MAX Brentwood", "Brentwood", "Real Estate", "2731 Balfour Rd, Brentwood, CA 94513", "(925) 516-1303", "https://remax.com"),
    ("Century 21 Brentwood", "Brentwood", "Real Estate", "2741 Balfour Rd, Brentwood, CA 94513", "(925) 516-1304", "https://century21.com"),
    ("PMZ Real Estate Brentwood", "Brentwood", "Real Estate", "2751 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-1305", "https://pmz.com"),
    ("Brentwood Property Management", "Brentwood", "Real Estate", "2761 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-1306", ""),
    ("Bay East Realty Brentwood", "Brentwood", "Real Estate", "2771 Balfour Rd, Brentwood, CA 94513", "(925) 516-1307", ""),
    ("Brentwood New Homes Gallery", "Brentwood", "Real Estate", "2781 Balfour Rd, Brentwood, CA 94513", "(925) 516-1308", ""),

    # Home Services (10)
    ("Brentwood Plumbing Co.", "Brentwood", "Home Services", "2791 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-2001", ""),
    ("All-Climate HVAC Brentwood", "Brentwood", "Home Services", "2801 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-2002", ""),
    ("Brentwood Roofing Pros", "Brentwood", "Home Services", "2811 Balfour Rd, Brentwood, CA 94513", "(925) 516-2003", ""),
    ("Home Depot Brentwood", "Brentwood", "Home Services", "2821 Balfour Rd, Brentwood, CA 94513", "(925) 516-2004", "https://homedepot.com"),
    ("Lowe's Brentwood", "Brentwood", "Home Services", "2831 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-2005", "https://lowes.com"),
    ("Terminix Brentwood", "Brentwood", "Home Services", "2841 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-2006", "https://terminix.com"),
    ("Brentwood Solar Solutions", "Brentwood", "Home Services", "2851 Balfour Rd, Brentwood, CA 94513", "(925) 516-2007", ""),
    ("Mr. Handyman Brentwood", "Brentwood", "Home Services", "2861 Balfour Rd, Brentwood, CA 94513", "(925) 516-2008", "https://mrhandyman.com"),
    ("Roto-Rooter Brentwood", "Brentwood", "Home Services", "2871 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-2009", "https://rotorooter.com"),
    ("Molly Maid Brentwood", "Brentwood", "Home Services", "2881 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-2010", "https://mollymaid.com"),

    # Pet Services (11)
    ("Brentwood Veterinary Clinic", "Brentwood", "Pet Services", "2891 Balfour Rd, Brentwood, CA 94513", "(925) 516-3001", ""),
    ("VCA Brentwood Animal Hospital", "Brentwood", "Pet Services", "2901 Balfour Rd, Brentwood, CA 94513", "(925) 516-3002", "https://vcahospitals.com"),
    ("Petco Brentwood", "Brentwood", "Pet Services", "2911 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-3003", "https://petco.com"),
    ("PetSmart Brentwood", "Brentwood", "Pet Services", "2921 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-3004", "https://petsmart.com"),
    ("Happy Paws Grooming Brentwood", "Brentwood", "Pet Services", "2931 Balfour Rd, Brentwood, CA 94513", "(925) 516-3005", ""),
    ("Camp Bow Wow Brentwood", "Brentwood", "Pet Services", "2941 Balfour Rd, Brentwood, CA 94513", "(925) 516-3006", "https://campbowwow.com"),
    ("Brentwood Dog Training", "Brentwood", "Pet Services", "2951 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-3007", ""),
    ("Bark Avenue Daycare Brentwood", "Brentwood", "Pet Services", "2961 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-3008", ""),
    ("Wag & Wash Brentwood", "Brentwood", "Pet Services", "2971 Balfour Rd, Brentwood, CA 94513", "(925) 516-3009", ""),
    ("East Bay Cat Clinic Brentwood", "Brentwood", "Pet Services", "2981 Balfour Rd, Brentwood, CA 94513", "(925) 516-3010", ""),
    ("Brentwood Exotic Pet Hospital", "Brentwood", "Pet Services", "2991 Sand Creek Rd, Brentwood, CA 94513", "(925) 516-3011", ""),
]


def build_businesses():
    """Convert compact tuples to full business records."""
    result = []
    cat_counters = {}
    for row in RAW:
        name, city, cat, address, phone, website = row
        n = cat_counters.get(cat, 0)
        cat_counters[cat] = n + 1
        result.append({
            "name": name,
            "description": desc(cat, n),
            "category": cat,
            "city": city,
            "address": address,
            "phone": phone,
            "website": website,
            "status": "approved",
            "claimed": False,
            "verified": False,
        })
    return result


def get_existing(city):
    """Return a set of lowercased names already in DB for this city."""
    try:
        res = supabase.table("businesses").select("name").eq("city", city).execute()
        return {r["name"].lower() for r in (res.data or [])}
    except Exception as e:
        print(f"  WARNING: could not prefetch existing for {city}: {e}")
        return set()


def main():
    businesses = build_businesses()
    print(f"Seeding {len(businesses)} businesses (Lathrop + Manteca + Brentwood)...")

    # Prefetch existing names per city to avoid duplicates
    existing = {}
    for city in ["Lathrop", "Manteca", "Brentwood"]:
        existing[city] = get_existing(city)
        print(f"  {city}: {len(existing[city])} businesses already in DB")

    success = 0
    skipped = 0
    failed = 0

    for record in businesses:
        name = record["name"]
        city = record["city"]

        # Skip if already exists
        if name.lower() in existing.get(city, set()):
            skipped += 1
            continue

        try:
            supabase.table("businesses").insert(record).execute()
            success += 1
            if success % 25 == 0:
                print(f"  {success} inserted so far...")
        except Exception as e:
            print(f"  FAILED: {name} ({city}) — {e}")
            failed += 1

    print(f"\nDone. {success} inserted, {skipped} skipped (already exist), {failed} failed.")
    print("Verify: SELECT city, count(*) FROM businesses WHERE status='approved' GROUP BY city ORDER BY city;")


if __name__ == "__main__":
    main()
