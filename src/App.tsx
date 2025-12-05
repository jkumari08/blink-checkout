import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "@/context/WalletContext";
import { Component } from "react";
import Index from "./pages/Index";
import CreateBlink from "./pages/CreateBlink";
import MyBlinks from "./pages/MyBlinks";
import MerchantDashboard from "./pages/MerchantDashboard";
import TransactionHistory from "./pages/TransactionHistory";
import Wishlist from "./pages/Wishlist";
import BulkProductUpload from "./pages/BulkProductUpload";
import SocialSharing from "./pages/SocialSharing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Error Boundary for catching rendering errors
class ErrorBoundary extends Component<{children: React.ReactNode}, {hasError: boolean, error?: Error}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error("ErrorBoundary caught error:", error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error("App Error:", error);
    console.error("Error stack:", error.stack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-red-900">
          <div className="text-center p-4 bg-red-800 rounded">
            <h1 className="text-2xl font-bold text-white mb-2">ERROR</h1>
            <p className="text-white mb-4">{this.state.error?.message || "Unknown error"}</p>
            <pre className="text-xs text-white overflow-auto mb-4">{this.state.error?.stack}</pre>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white text-red-900 rounded-lg font-bold"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const App = () => {
  console.log("App rendering");
  return (
    <ErrorBoundary>
      <WalletProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/create" element={<CreateBlink />} />
                <Route path="/my-blinks" element={<MyBlinks />} />
                <Route path="/dashboard" element={<MerchantDashboard />} />
                <Route path="/transactions" element={<TransactionHistory />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/bulk-upload" element={<BulkProductUpload />} />
                <Route path="/social-sharing" element={<SocialSharing />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </WalletProvider>
    </ErrorBoundary>
  );
};

export default App;
