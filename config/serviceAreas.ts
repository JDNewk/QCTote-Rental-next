export type ServiceArea = {
  slug: string;
  city: string;
  state: string;
  stateName: string;
  localIntro: string;
  nearbyText: string;
};

export const serviceAreas: ServiceArea[] = [
  {
    slug: "moving-tote-rental-davenport-ia",
    city: "Davenport",
    state: "IA",
    stateName: "Iowa",
    localIntro:
      "From apartment moves to moves across the Quad Cities, Davenport customers can pack on their schedule using sturdy, stackable totes delivered directly to their door.",
    nearbyText:
      "We serve Davenport and nearby Iowa and Illinois Quad Cities communities.",
  },
  {
    slug: "moving-tote-rental-bettendorf-ia",
    city: "Bettendorf",
    state: "IA",
    stateName: "Iowa",
    localIntro:
      "Whether you are moving into a Bettendorf home, changing apartments, or preparing for a renovation, reusable moving totes keep packing organized without cardboard or tape.",
    nearbyText:
      "We serve Bettendorf and nearby Iowa and Illinois Quad Cities communities.",
  },
  {
    slug: "moving-tote-rental-leclaire-ia",
    city: "LeClaire",
    state: "IA",
    stateName: "Iowa",
    localIntro:
      "LeClaire customers can simplify local moves, downsizing projects, and home renovations with reusable moving totes that arrive clean and ready to pack.",
    nearbyText:
      "We serve LeClaire and surrounding communities within the QC Tote Rental service area.",
  },
  {
    slug: "moving-tote-rental-moline-il",
    city: "Moline",
    state: "IL",
    stateName: "Illinois",
    localIntro:
      "For moves throughout Moline and the surrounding Quad Cities, uniform reusable totes make it easier to pack, stack, transport, and unpack your belongings.",
    nearbyText:
      "We serve Moline and nearby Illinois and Iowa Quad Cities communities.",
  },
  {
    slug: "moving-tote-rental-rock-island-il",
    city: "Rock Island",
    state: "IL",
    stateName: "Illinois",
    localIntro:
      "Rock Island residents can skip the cardboard box hunt and use durable moving totes for household moves, apartment moves, downsizing, and temporary storage projects.",
    nearbyText:
      "We serve Rock Island and nearby Illinois and Iowa Quad Cities communities.",
  },
  {
    slug: "moving-tote-rental-east-moline-il",
    city: "East Moline",
    state: "IL",
    stateName: "Illinois",
    localIntro:
      "East Moline customers can pack with sturdy, reusable totes that stack neatly and eliminate the need to assemble and dispose of cardboard boxes.",
    nearbyText:
      "We serve East Moline and surrounding Quad Cities communities.",
  },
  {
    slug: "moving-tote-rental-silvis-il",
    city: "Silvis",
    state: "IL",
    stateName: "Illinois",
    localIntro:
      "Moving, decluttering, or renovating in Silvis is easier with reusable plastic totes delivered ready to pack and collected after the rental period.",
    nearbyText:
      "We serve Silvis and surrounding communities within the QC Tote Rental service area.",
  },
  {
    slug: "moving-tote-rental-milan-il",
    city: "Milan",
    state: "IL",
    stateName: "Illinois",
    localIntro:
      "Milan customers can use reusable moving totes for household moves, garage projects, downsizing, and other jobs that benefit from sturdy, stackable containers.",
    nearbyText:
      "We serve Milan and surrounding communities within the QC Tote Rental service area.",
  },
  {
    slug: "moving-tote-rental-geneseo-il",
    city: "Geneseo",
    state: "IL",
    stateName: "Illinois",
    localIntro:
      "Geneseo customers can make packing simpler with durable 27-gallon moving totes delivered to their door and picked up when the move or project is complete.",
    nearbyText:
      "We serve Geneseo and surrounding communities within the QC Tote Rental service area.",
  },
];

export function getServiceAreaBySlug(slug: string) {
  return serviceAreas.find((area) => area.slug === slug);
}
