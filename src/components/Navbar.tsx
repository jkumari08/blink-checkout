import { Button } from "@/components/ui/button";
import { Zap, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import WalletButton from "@/components/WalletButton";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSectionScroll = (sectionId: string) => {
    if (location.pathname !== "/") {
      navigate("/");
      // Wait for page to load, then scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        element?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      element?.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">BlinkShop</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              Home
            </Link>
            <Link to="/create" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              Create
            </Link>
            <Link to="/my-blinks" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              My Blinks
            </Link>
            <Link to="/transactions" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              Transactions
            </Link>
            <Link to="/wishlist" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              Wishlist
            </Link>
            <Link to="/bulk-upload" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              Bulk Upload
            </Link>
            <Link to="/social-sharing" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              Share
            </Link>
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              Earnings
            </Link>
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center">
            <WalletButton />
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-slide-up">
            <div className="flex flex-col gap-4">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link to="/create" className="text-muted-foreground hover:text-foreground transition-colors">
                Create Blink
              </Link>
              <Link to="/my-blinks" className="text-muted-foreground hover:text-foreground transition-colors">
                My Blinks
              </Link>
              <Link to="/transactions" className="text-muted-foreground hover:text-foreground transition-colors">
                Transactions
              </Link>
              <Link to="/wishlist" className="text-muted-foreground hover:text-foreground transition-colors">
                Wishlist
              </Link>
              <Link to="/bulk-upload" className="text-muted-foreground hover:text-foreground transition-colors">
                Bulk Upload
              </Link>
              <Link to="/social-sharing" className="text-muted-foreground hover:text-foreground transition-colors">
                Share
              </Link>
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                Earnings
              </Link>
              <button onClick={() => handleSectionScroll("features")} className="text-muted-foreground hover:text-foreground transition-colors text-left bg-none border-none cursor-pointer">
                Features
              </button>
              <button onClick={() => handleSectionScroll("how-it-works")} className="text-muted-foreground hover:text-foreground transition-colors text-left bg-none border-none cursor-pointer">
                How it Works
              </button>
              <div className="pt-4 border-t border-border">
                <WalletButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
