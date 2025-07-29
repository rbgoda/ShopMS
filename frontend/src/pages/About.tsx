import { useShop } from '../contexts/ShopContext'

export default function About() {
  const { shop } = useShop()

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">About {shop?.name}</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="prose prose-lg mx-auto">
          <p className="text-gray-600 mb-6">
            Welcome to {shop?.name}! We are dedicated to providing high-quality products 
            and exceptional customer service. Our team is passionate about delivering 
            the best shopping experience for our customers.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-600 mb-6">
            To offer premium products at competitive prices while maintaining the highest 
            standards of customer satisfaction and service excellence.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="text-gray-600">
            {shop?.address && <p className="mb-2">Address: {shop.address}</p>}
            {shop?.phone && <p className="mb-2">Phone: {shop.phone}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}