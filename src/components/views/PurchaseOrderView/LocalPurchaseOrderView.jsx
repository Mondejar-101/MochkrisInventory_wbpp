import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

const LocalPurchaseOrderView = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Local Purchase Orders</h2>
        <button
          onClick={() => navigate('/purchase-orders/local/create')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Local PO
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Local purchase orders will be listed here.</p>
        {/* Add your local purchase order list/table component here */}
      </div>
    </div>
  );
};

export default LocalPurchaseOrderView;
