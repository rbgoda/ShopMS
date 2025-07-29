export default function Orders() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600">Manage customer orders here.</p>
      </div>
      
      <div className="card p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Order Management</h3>
        <p className="text-gray-600 mb-4">
          Order management functionality will be implemented here.
        </p>
        <button className="btn btn-primary">
          Create Order
        </button>
      </div>
    </div>
  )
}