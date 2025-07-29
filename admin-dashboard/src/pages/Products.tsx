export default function Products() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <p className="text-gray-600">Manage your shop products here.</p>
      </div>
      
      <div className="card p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Products Management</h3>
        <p className="text-gray-600 mb-4">
          Product management functionality will be implemented here.
        </p>
        <button className="btn btn-primary">
          Add Product
        </button>
      </div>
    </div>
  )
}