import { RouterProvider } from "react-router-dom";
import { Suspense } from "react";
import RouterConfig from "../routerConfig/RouterConfig.jsx";
import LoadingSpinner from "../shared/LoadingSpinner/LoadingSpinner.jsx";

const _app = () => {
  return (
    <div className="py-24 min-h-screen bg-gray-900 text-white relative overflow-hidden">
      <Suspense fallback={<LoadingSpinner />}>
        <RouterProvider
          router={RouterConfig}
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        />
      </Suspense>
    </div>
  );
};
export default _app;
