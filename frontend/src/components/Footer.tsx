import { useShop } from '../contexts/ShopContext'

export default function Footer() {
  const { shop } = useShop()

  return (
    <footer className="bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Shop info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4">{shop?.name}</h3>
            {shop?.address && (
              <p className="text-gray-300 mb-2">{shop.address}</p>
            )}
            {shop?.phone && (
              <p className="text-gray-300 mb-2">Phone: {shop.phone}</p>
            )}
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-300 hover:text-white">Home</a></li>
              <li><a href="/products" className="text-gray-300 hover:text-white">Products</a></li>
              <li><a href="/about" className="text-gray-300 hover:text-white">About</a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-white">Contact</a></li>
            </ul>
          </div>

          {/* Customer service */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white">Shipping Info</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Returns</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Size Guide</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">FAQ</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700">
          <p className="text-center text-gray-400">
            © {new Date().getFullYear()} {shop?.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}