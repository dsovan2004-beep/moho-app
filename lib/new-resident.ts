import { CITIES, RELAUNCH_CITY_NAMES } from "./cities";
export const RESIDENT_CITIES = RELAUNCH_CITY_NAMES.map(
  (name) => CITIES.find((city) => city.name === name)!,
);
export const RESIDENT_CHECKED = "November 6, 2026";
export type ResidentResource = { title: string; detail: string; href: string };
const finder: ResidentResource = {
  title: "Confirm your school district",
  detail:
    "Check the district for your home address before starting enrollment. A city name does not establish school placement.",
  href: "https://www.sjcoe.org/schools/school-finder",
};
export const RESIDENT_RESOURCES: Record<
  string,
  { utilities: ResidentResource[]; schools: ResidentResource[] }
> = {
  "mountain-house": {
    utilities: [
      {
        title: "City utilities and waste",
        detail:
          "City water and wastewater information; West Valley Disposal provides waste collection. Follow the city’s current setup instructions.",
        href: "https://www.mountainhouseca.gov/241/Utilities-Waste",
      },
      {
        title: "Electricity: MID · Gas: PG&E",
        detail:
          "The city identifies Modesto Irrigation District for electricity and PG&E for gas. Use its official provider links and confirm service at your address.",
        href: "https://www.mountainhouseca.gov/241/Utilities-Waste",
      },
    ],
    schools: [
      finder,
      {
        title: "Lammersville enrollment",
        detail:
          "Official 2026–27 registration instructions. Confirm boundaries and placement with the district; placement depends on capacity.",
        href: "https://www.lammersvilleschooldistrict.net/apps/pages/index.jsp?pREC_ID=1478050&type=d&uREC_ID=1243883",
      },
    ],
  },
  tracy: {
    utilities: [
      {
        title: "Start city utility service",
        detail:
          "Contact city Finance to arrange water, sewer and garbage service. The city identifies Tracy Disposal for collection.",
        href: "https://www.cityoftracy.org/Departments/Public-Works/FAQs",
      },
      {
        title: "Waste and recycling",
        detail:
          "Official city collection and recycling information. Confirm your collection schedule when starting service.",
        href: "https://www.cityoftracy.org/Departments/Public-Works/Recycling-Solid-Waste",
      },
    ],
    schools: [
      finder,
      {
        title: "Tracy Unified boundaries",
        detail:
          "Check the official locator first. Not every Tracy address belongs to Tracy Unified.",
        href: "https://www.tracy.k12.ca.us/parentstudent-information/zoned-schoolboundaries",
      },
      {
        title: "Tracy Unified enrollment",
        detail:
          "If your address is within this district, follow its online enrollment instructions.",
        href: "https://www.tracy.k12.ca.us/parents/aeries-online-enrollment",
      },
    ],
  },
  lathrop: {
    utilities: [
      {
        title: "Start water and sewer service",
        detail:
          "City guidance for new residents includes water/sewer setup and utility-provider contacts. Confirm the provider for your address.",
        href: "https://www.ci.lathrop.ca.us/community/page/new-residents",
      },
      {
        title: "Trash: Republic Services",
        detail:
          "Residential waste is provided by Republic Services and billed separately from city water/sewer. Use the city page for setup contacts.",
        href: "https://www.ci.lathrop.ca.us/parksrec/page/residential-waste-services",
      },
    ],
    schools: [
      finder,
      {
        title: "Lathrop school district guidance",
        detail:
          "The city links Manteca and Banta district resources. River Islands families should confirm the applicable district and charter enrollment process.",
        href: "https://www.ci.lathrop.ca.us/community/page/schools",
      },
    ],
  },
  manteca: {
    utilities: [
      {
        title: "Start city utility service",
        detail:
          "Use the city’s Move-In Application instructions and review required documents on the official site.",
        href: "https://www.manteca.gov/277/Utility-Information",
      },
      {
        title: "City waste collection",
        detail:
          "City Waste Management provides residential collection information, service-day lookup and pickup resources.",
        href: "https://www.manteca.gov/397/Waste-Management",
      },
    ],
    schools: [
      finder,
      {
        title: "Manteca Unified registration",
        detail:
          "Official new-student registration instructions. Confirm your address and school assignment with the district.",
        href: "https://www.mantecausd.net/our-district/registration",
      },
    ],
  },
};
export function residentLinks(city: string) {
  const query = new URLSearchParams({ city }).toString();
  return {
    directory: `/directory?${query}`,
    events: `/events?${query}`,
    classes: `/classes?${query}`,
    community: `/community?${query}`,
    pets: `/lost-and-found?${query}`,
  };
}
