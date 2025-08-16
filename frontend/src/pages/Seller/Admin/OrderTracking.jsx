const statusSteps = [
  { key: "pending", label: "Pending" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipping" },
  { key: "delivered", label: "Delivered" },
  { key: "rated", label: "Rated" }
];

function OrderTracking({ currentStatus }) {
  const currentIndex = statusSteps.findIndex(s => s.key === currentStatus);

  return (
    <div className="flex items-center justify-between w-full max-w-4xl mx-auto mt-4">
      {statusSteps.map((status, index) => {
        const isActive = index <= currentIndex;

        return (
          <div key={status.key} className="flex-1 flex items-center">
            {/* Circle */}
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-full border-4 
              ${isActive ? "border-green-500 bg-green-100" : "border-gray-300 bg-gray-100"}`}
            >
              {isActive ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-gray-400 text-sm">{index + 1}</span>
              )}
            </div>

            {/* Connector line */}
            {index < statusSteps.length - 1 && (
              <div
                className={`flex-1 h-1 ${index < currentIndex ? "bg-green-500" : "bg-gray-300"}`}
              ></div>
            )}
          </div>
        );
      })}
    </div>
  );
}
