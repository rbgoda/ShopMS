export default function Customers() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-600">Manage your customers here.</p>
      </div>
      
      <div className="card p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Management</h3>
        <p className="text-gray-600 mb-4">
          Customer management functionality will be implemented here.
        </p>
        <button className="btn btn-primary">
          Add Customer
        </button>
      </div>
    </div>
  )
}