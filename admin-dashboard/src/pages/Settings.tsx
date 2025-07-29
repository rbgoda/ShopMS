export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Configure your shop settings here.</p>
      </div>
      
      <div className="card p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Shop Settings</h3>
        <p className="text-gray-600 mb-4">
          Settings management functionality will be implemented here.
        </p>
        <button className="btn btn-primary">
          Update Settings
        </button>
      </div>
    </div>
  )
}