import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

interface WishlistItem {
  id: string;
  productName: string;
  description: string;
  price: number;
  image: string;
  merchantWallet: string;
  addedDate: number;
}

const Wishlist = () => {
  const { publicKey } = useWallet();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  useEffect(() => {
    if (publicKey) {
      const stored = localStorage.getItem(`wishlist_${publicKey.toString()}`);
      if (stored) {
        setWishlist(JSON.parse(stored));
      }
    }
  }, [publicKey]);

  const removeFromWishlist = (id: string) => {
    const updated = wishlist.filter((item) => item.id !== id);
    setWishlist(updated);
    if (publicKey) {
      localStorage.setItem(`wishlist_${publicKey.toString()}`, JSON.stringify(updated));
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop";
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">My Wishlist</h1>
            <p className="text-muted-foreground">
              Products you want to buy later
            </p>
          </div>

          {!publicKey ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">Connect your wallet to view wishlist</p>
            </Card>
          ) : wishlist.length === 0 ? (
            <Card className="p-8 text-center">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4 text-lg">Your wishlist is empty</p>
              <p className="text-sm text-muted-foreground mb-6">
                Browse products and click the heart icon to save them for later
              </p>
              <Link to="/">
                <Button variant="hero">Browse Products</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((item) => (
                <Card
                  key={item.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
                >
                  {/* Image */}
                  <div className="aspect-video overflow-hidden bg-secondary/50">
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                      {item.productName}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-bold gradient-text">{item.price} USDC</span>
                      <span className="text-xs text-muted-foreground">
                        Added {new Date(item.addedDate).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button variant="hero" className="flex-1" disabled>
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeFromWishlist(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist;
