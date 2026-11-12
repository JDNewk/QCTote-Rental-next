export type PreparedArticleImagePlan = {
  id: string;
  kind: "featured" | "body";
  recommendation: string;
  location?: string;
  width?: 33 | 50 | 75 | 100;
  altText?: string;
  required?: boolean;
  generationPrompt?: string;
  useQcToteReference?: boolean;
};

export type PreparedArticlePackage = {
  version: 2;
  title: string;
  slug: string;
  subtitle?: string;
  category?: string;
  authorName?: string;
  imageUrl?: string;
  readTime?: string;
  metaTitle?: string;
  metaDescription?: string;
  contentHtml: string;
  includeTableOfContents?: boolean;
  images?: PreparedArticleImagePlan[];
};

const booksArticle: PreparedArticlePackage = {
  version: 2,
  title: "How to Pack Books for Moving Without Making Boxes Too Heavy",
  slug: "how-to-pack-books-for-moving",
  subtitle: "A practical guide to packing books for a move while keeping boxes and moving totes manageable to carry.",
  category: "Moving Tips",
  authorName: "QC Tote Rental Editorial Team",
  readTime: "6 min read",
  metaTitle: "How to Pack Books for Moving Without Heavy Boxes",
  metaDescription: "Learn how to pack books for moving without creating boxes that are too heavy to carry. Get practical tips for sorting, packing, labeling and moving books.",
  includeTableOfContents: true,
  images: [
    {
      id: "featured-books",
      kind: "featured",
      required: true,
      recommendation: "Books being packed for a residential move beside a reusable heavy-duty moving tote.",
      altText: "Books being packed beside a reusable moving tote",
      useQcToteReference: true,
      generationPrompt: "Realistic residential moving scene with books being packed beside a heavy-duty reusable 27-gallon plastic moving tote modeled on the proportions and construction style of a Home Depot HDX 27-gallon tote. Black tote body with bright lime-green lid, sturdy rectangular stackable proportions, molded handles, practical home environment, natural light, no visible text, numbers, logos, labels, Home Depot branding, HDX branding, or manufacturer branding.",
    },
    {
      id: "balanced-book-load",
      kind: "body",
      location: "After Don't Fill a Large Container Entirely With Books",
      width: 50,
      altText: "Books packed with lighter belongings to keep a moving tote manageable",
      recommendation: "A partially packed tote containing several books plus lightweight folded linens to show sensible weight distribution.",
      useQcToteReference: true,
      generationPrompt: "Open heavy-duty reusable 27-gallon plastic moving tote containing a reasonable quantity of hardcover and paperback books together with lightweight folded linens, demonstrating sensible weight distribution rather than filling the entire tote with books. Black tote body with bright lime-green lid nearby, realistic residential packing environment, no text, numbers, logos, labels, Home Depot branding, HDX branding, or manufacturer branding.",
    },
    {
      id: "labeled-book-containers",
      kind: "body",
      location: "After Label Book Containers Clearly",
      width: 50,
      altText: "Moving totes organized by room and contents",
      recommendation: "Several reusable moving totes neatly organized by room during a residential move.",
      useQcToteReference: true,
      generationPrompt: "Several heavy-duty reusable 27-gallon moving totes neatly organized during a residential move, black tote bodies with bright lime-green lids, visual grouping by room without readable labels or text, realistic home environment, no logos, brand marks, numbers, Home Depot branding, HDX branding, or manufacturer branding.",
    },
  ],
  contentHtml: `
<p>Books do not look like one of the hardest things to pack until you fill an entire moving box with them and try to pick it up.</p>
<p>A single book may not weigh much, but a shelf's worth packed into one container can quickly become difficult to carry. Books can also be damaged during a move if they are packed loosely, overloaded, or exposed to moisture.</p>
<p>The goal is not to fit as many books as possible into every box. The goal is to pack them securely while keeping each container manageable for moving day.</p>
<h2>Start by Deciding Which Books Are Actually Moving</h2>
<p>Before you pack the first book, take a quick look through your collection.</p>
<p>Moving is a good opportunity to separate books into a few groups:</p>
<ul><li>Books you are keeping.</li><li>Books you may want to donate or give away.</li><li>Books you plan to sell.</li><li>Valuable or sentimental books that need extra protection.</li><li>Books you will want available immediately after moving.</li></ul>
<p>You do not need to turn this into a major decluttering project. Even removing a small number of books you no longer want means fewer heavy items to carry.</p>
<h2>Don't Fill a Large Container Entirely With Books</h2>
<p>This is one of the easiest packing mistakes to make.</p>
<p>A large moving box or tote may have enough physical space for dozens of books, but that does not mean filling every inch with books is practical.</p>
<p>Books are dense. A container full of nothing but books can become difficult to lift long before the container runs out of space.</p>
<ul><li>Spread books among multiple containers.</li><li>Stop adding books while the container is still comfortable to handle.</li><li>Use remaining space for lighter belongings when appropriate.</li><li>Test the weight before moving on to the next container.</li></ul>
<!--ARTICLE_IMAGE:balanced-book-load-->
<p>If you are using <a href="/moving-boxes">reusable moving totes</a>, the same principle applies. Capacity is not a target weight.</p>
<h2>Keep Books Secure While Packing</h2>
<p>Books should not slide around freely inside the container.</p>
<ul><li>Keep books together in stable rows or stacks.</li><li>Put heavier books toward the bottom.</li><li>Avoid forcing books into spaces where covers or bindings can bend.</li><li>Fill large empty spaces with appropriate lightweight packing material.</li><li>Keep books away from anything that could leak onto them.</li></ul>
<p>For valuable, collectible, or especially fragile books, consider wrapping them individually or using packaging appropriate for their condition.</p>
<h2>Watch the Weight as You Pack</h2>
<p>Do not wait until the container is finished to discover that it is too heavy.</p>
<ol><li>Add a layer or group of books.</li><li>Test the container's weight.</li><li>Add more only if it remains manageable.</li><li>Use lighter belongings or packing material for remaining space when appropriate.</li></ol>
<p>This may mean using more containers than you initially expected. That is better than discovering on moving day that several packed containers are difficult to move.</p>
<h2>Use Smaller Groups for Heavy Book Collections</h2>
<p>If you have several full bookshelves, break the collection into smaller groups.</p>
<ul><li>Pack one shelf at a time.</li><li>Keep related books together when useful.</li><li>Distribute especially heavy hardcover books among different containers.</li><li>Label each container as soon as it is packed.</li></ul>
<h2>Label Book Containers Clearly</h2>
<p>At minimum, identify the room and contents, such as Office - Books, Bedroom - Books, or Kids' Room - Books.</p>
<p>If a container is heavier than the others, marking it as heavy can help whoever is handling it know what to expect before lifting.</p>
<!--ARTICLE_IMAGE:labeled-book-containers-->
<h2>Keep Books Away From Moisture</h2>
<p>If you are moving on a wet or snowy day, avoid leaving book containers on wet pavement, in standing water, in an exposed truck or trailer, or in a damp garage or basement for an extended period.</p>
<h2>Should You Use Cardboard Boxes or Plastic Moving Totes for Books?</h2>
<p>Either can work when books are packed appropriately. Cardboard offers many size choices. Reusable plastic totes provide a rigid container with consistent dimensions and do not require cardboard-box assembly.</p>
<p>For QC Tote Rental customers, the important point is not to fill the entire tote with books. Use books as part of the load and monitor the weight as you pack.</p>
<p>For a broader container comparison, read <a href="/blog/moving-boxes-vs-plastic-totes">Moving Boxes vs. Plastic Totes: Which Is Worth It?</a></p>
<h2>How Many Moving Totes Do You Need?</h2>
<p>Books are one reason estimating a move by bedroom count alone can be misleading. Consider the number of bookshelves, hardcover versus paperback books, cookbooks, children's books, textbooks, office books, and books kept in storage.</p>
<p>For a room-by-room estimate, see <a href="/blog/how-many-moving-totes-do-i-need">How Many Moving Totes Do I Need?</a></p>
<h2>Moving Books in the Quad Cities</h2>
<p>If you are moving in Davenport, Bettendorf, Moline, Rock Island, or another community in the <a href="/service-area">QC Tote Rental service area</a>, reusable moving totes can be delivered before your move and collected after unpacking.</p>
<p><a href="/pricing">Compare moving tote packages</a> to determine which quantity fits the rest of your move, then <a href="/reserve">reserve moving totes</a> for your dates.</p>
<h2>Frequently Asked Questions</h2>
<h3>Should I fill an entire moving box with books?</h3><p>Not necessarily. Distribute books among multiple containers and monitor the weight as you pack.</p>
<h3>Should heavy books go on the bottom?</h3><p>Placing heavier books toward the bottom can help create a more stable container. Avoid packing books so tightly that covers or bindings bend.</p>
<h3>How do I keep books from moving around?</h3><p>Pack books securely and use appropriate lightweight packing material to fill excessive empty space.</p>
<h3>Should I label containers containing books?</h3><p>Yes. Identify the room and contents. If a container is considerably heavier than others, label it as heavy.</p>
<h3>Can I pack books in reusable plastic moving totes?</h3><p>Yes, but do not assume the tote should be filled completely with books. Monitor the weight and distribute heavy books among multiple containers.</p>
`,
};

const packages: Record<string, PreparedArticlePackage> = {
  "nov-13-how-to-pack-books": booksArticle,
};

export function getPreparedArticlePackage(packageId?: string) {
  if (!packageId) return null;
  return packages[packageId] ?? null;
}
