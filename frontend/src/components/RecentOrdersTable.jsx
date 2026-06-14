import { formatPrice } from "../utils/currency";

const getStatusBadge = (status) => {
  const map = {
    pending: "badge-warning",
    processing: "badge-info",
    shipped: "badge-primary",
    delivered: "badge-success",
    cancelled: "badge-error",
  };
  return `badge badge-sm ${map[status?.toLowerCase()] || "badge-ghost"}`;
};

const RecentOrdersTable = ({ orders, store, onDelete, onViewAll }) => {
  return (
    <div className="bg-base-100 rounded-2xl shadow-sm border border-base-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-base">Recent Orders</h3>
        <button
          onClick={onViewAll}
          className="btn btn-ghost btn-xs text-primary"
        >
          View All
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="table table-sm">
          <thead>
            <tr className="text-xs text-base-content/50 uppercase">
              <th>Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-base-content/40">
                  No orders yet
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-base-200/40">
                  <td className="font-mono text-xs font-medium">
                    #{order.id?.slice(-6)}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        {order.user?.name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {order.user?.name || "N/A"}
                        </p>
                        {order.user?.email && (
                          <p className="text-xs text-base-content/40 hidden md:block">
                            {order.user.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="text-sm">{order.orderItems?.length || 0}</td>
                  <td className="font-semibold text-sm">
                    {formatPrice(order.totalPrice || 0, store.currency)}
                  </td>
                  <td>
                    <span className={getStatusBadge(order.orderStatus)}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="text-xs text-base-content/60">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => onDelete(order.id)}
                      className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrdersTable;
