export default function ServiceAreaPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <h1 className="text-4xl font-bold text-center mb-12">
        Service Area
      </h1>

      <p className="text-center text-gray-600 max-w-2xl mx-auto mb-16">
        We serve the Illinois & Iowa Quad Cities and surrounding communities.
      </p>

      {/* Side-by-side sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* Free Delivery Zone */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <span className="text-green-600 text-3xl">🟢</span> Free Delivery & Pickup
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 text-gray-700">
            <ul className="space-y-2">
              <li>Davenport, IA</li>
              <li>Bettendorf, IA</li>
              <li>Rock Island, IL</li>
              <li>Moline, IL</li>
              <li>East Moline, IL</li>
              <li>Silvis, IL</li>
            </ul>

            <ul className="space-y-2">
              <li>Milan, IL</li>
              <li>Geneseo, IL</li>
              <li>Coal Valley, IL</li>
              <li>Colona, IL</li>
              <li>Port Byron, IL</li>
              <li>LeClaire, IA</li>
            </ul>
          </div>
        </div>

        {/* Fee Applies Zone */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <span className="text-yellow-500 text-3xl">🟡</span> Fee Applies
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 text-gray-700">
            <ul className="space-y-2">
              <li>Muscatine, IA</li>
              <li>Clinton, IA</li>
              <li>Eldridge, IA</li>
            </ul>

            <ul className="space-y-2">
              <li>DeWitt, IA</li>
              <li>Orion, IL</li>
            </ul>
          </div>

          <p className="text-gray-600 mt-6">
            A $15 fee applies per leg (delivery or pickup) outside the free zone,
            or $30 if both stops are outside it.
          </p>
        </div>

      </div>

      <p className="text-gray-600 text-center max-w-xl mx-auto mt-16">
        Not seeing your town? Ask us — we may still be able to reach you.
      </p>

      <div className="text-center mt-12">
        <a
          href="/reserve"
          className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Reserve Your Totes
        </a>
      </div>
    </div>
  );
}
