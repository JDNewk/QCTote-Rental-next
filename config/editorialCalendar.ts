export type EditorialCalendarItem = {
  publishDate: string;
  title: string;
  slug: string;
  intent: "Local / customer intent" | "Helpful / informational" | "Seasonal / local";
  packageId?: string;
};

export const editorialCalendar: EditorialCalendarItem[] = [
  { publishDate: "2026-11-10", title: "Where to Get Moving Boxes in the Quad Cities: Buy, Find Free, or Rent Totes?", slug: "where-to-get-moving-boxes-quad-cities", intent: "Local / customer intent" },
  { publishDate: "2026-11-13", title: "How to Pack Books for Moving Without Making Boxes Too Heavy", slug: "how-to-pack-books-for-moving", intent: "Helpful / informational", packageId: "nov-13-how-to-pack-books" },
  { publishDate: "2026-11-17", title: "Moving During the Holidays: A Quad Cities Packing Timeline", slug: "moving-during-holidays-quad-cities", intent: "Seasonal / local" },
  { publishDate: "2026-11-20", title: "How to Pack Holiday Decorations for a Move", slug: "how-to-pack-holiday-decorations-for-moving", intent: "Helpful / informational" },
  { publishDate: "2026-11-24", title: "Moving Boxes in Davenport: What Are Your Options?", slug: "moving-boxes-davenport-ia-options", intent: "Local / customer intent" },
  { publishDate: "2026-11-27", title: "What Should You Pack First When Moving?", slug: "what-to-pack-first-when-moving", intent: "Helpful / informational" },
  { publishDate: "2026-12-01", title: "Apartment Moving Checklist for the Quad Cities", slug: "apartment-moving-checklist-quad-cities", intent: "Local / customer intent" },
  { publishDate: "2026-12-04", title: "How to Pack Clothes for Moving Without Using Dozens of Boxes", slug: "how-to-pack-clothes-for-moving", intent: "Helpful / informational" },
  { publishDate: "2026-12-08", title: "Moving Boxes in Bettendorf: Buying vs. Renting Reusable Totes", slug: "moving-boxes-bettendorf-ia", intent: "Local / customer intent" },
  { publishDate: "2026-12-11", title: "How to Label Moving Boxes Room by Room", slug: "how-to-label-moving-boxes-room-by-room", intent: "Helpful / informational" },
  { publishDate: "2026-12-15", title: "Moving in Winter: A Quad Cities Moving and Packing Guide", slug: "winter-moving-guide-quad-cities", intent: "Seasonal / local" },
  { publishDate: "2026-12-18", title: "How to Pack a Kitchen for Moving: A Step-by-Step Checklist", slug: "how-to-pack-a-kitchen-for-moving", intent: "Helpful / informational" },
  { publishDate: "2026-12-22", title: "Need Moving Boxes After Christmas? Quad Cities Moving Options", slug: "moving-boxes-after-christmas-quad-cities", intent: "Seasonal / local" },
  { publishDate: "2026-12-29", title: "Moving Boxes in Moline and Rock Island: Local Options", slug: "moving-boxes-moline-rock-island", intent: "Local / customer intent" },
  { publishDate: "2027-01-01", title: "Decluttering Before a Move: Keep, Donate, Sell, or Discard?", slug: "decluttering-before-a-move", intent: "Helpful / informational" },
  { publishDate: "2027-01-05", title: "Moving Back to College: A Packing Guide for Students and Families", slug: "moving-back-to-college-packing-guide", intent: "Seasonal / local" },
  { publishDate: "2027-01-08", title: "What Should You Pack Last When Moving?", slug: "what-to-pack-last-when-moving", intent: "Helpful / informational" },
  { publishDate: "2027-01-12", title: "How Far in Advance Should You Reserve Moving Totes?", slug: "how-far-in-advance-reserve-moving-totes", intent: "Local / customer intent" },
  { publishDate: "2027-01-15", title: "How to Pack a Home Office for Moving", slug: "how-to-pack-a-home-office-for-moving", intent: "Helpful / informational" },
  { publishDate: "2027-01-19", title: "What Size Moving Boxes Do You Need for Different Household Items?", slug: "what-size-moving-boxes-do-you-need", intent: "Local / customer intent" },
  { publishDate: "2027-01-22", title: "How to Pack Kids' Rooms for a Move", slug: "how-to-pack-kids-rooms-for-moving", intent: "Helpful / informational" },
  { publishDate: "2027-01-26", title: "Moving From Iowa to Illinois or Illinois to Iowa: A Quad Cities Checklist", slug: "moving-iowa-illinois-quad-cities-checklist", intent: "Local / customer intent" },
  { publishDate: "2027-01-29", title: "How to Pack Fragile Kitchen Items for Moving", slug: "how-to-pack-fragile-kitchen-items", intent: "Helpful / informational" },
  { publishDate: "2027-02-02", title: "What to Put in Your First-Night Moving Box", slug: "first-night-moving-box", intent: "Helpful / informational" },
];
