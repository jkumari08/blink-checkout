import { useState } from "react";
import { Copy, Share2, Twitter, MessageCircle, TrendingUp, Eye, MousePointer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
}

interface ShareMetrics {
  platform: string;
  clicks: number;
  shares: number;
  conversions: number;
}

const SocialSharing = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [metrics, setMetrics] = useState<Record<string, ShareMetrics[]>>({});
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);

  // Load bulk products from localStorage
  const products = JSON.parse(localStorage.getItem("bulk_products") || "[]") as Product[];

  const generateShareUrl = (productId: string, platform: string) => {
    return `${window.location.origin}/?product=${productId}&ref=${platform.toLowerCase()}`;
  };

  const templates = {
    twitter: (product: Product, shareUrl: string) =>
      `🚀 I just listed: ${product.title} on @BlinkShop\n💰 ${product.price} USDC\n✨ Checkout in 400ms • No app needed\n${shareUrl}\n\n#SolanaGems #SocialCommerce`,
    discord: (product: Product, shareUrl: string) =>
      `📦 New Drop: ${product.title}\n━━━━━━━━━━━━━━━━━━━━━━\n🏷️ Price: ${product.price} USDC\n📝 ${product.description}\n⚡ Instant checkout on BlinkShop\n[Buy Now](${shareUrl})`,
    telegram: (product: Product, shareUrl: string) =>
      `🛍️ ${product.title}\n\n💵 ${product.price} USDC\n\n${product.description}\n\n⚡ Buy on BlinkShop: ${shareUrl}`,
  };

  const shareOnTwitter = (template: string, productId: string) => {
    const shareUrl = generateShareUrl(productId, "twitter");
    const text = encodeURIComponent(template.replace(/\[link\]/g, shareUrl));
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");

    // Track click
    trackShare(productId, "twitter");
  };

  const copyToClipboard = (text: string, platform: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPlatform(platform);
    setTimeout(() => setCopiedPlatform(null), 2000);
  };

  const trackShare = (productId: string, platform: string) => {
    const key = `share_metrics_${productId}`;
    const existing = JSON.parse(localStorage.getItem(key) || "{}");

    if (!existing[platform]) {
      existing[platform] = { platform, clicks: 0, shares: 1, conversions: 0 };
    } else {
      existing[platform].shares += 1;
    }

    localStorage.setItem(key, JSON.stringify(existing));
  };

  const getMetrics = (productId: string) => {
    const key = `share_metrics_${productId}`;
    return JSON.parse(localStorage.getItem(key) || "{}");
  };

  const simulateClick = (productId: string, platform: string) => {
    const key = `share_metrics_${productId}`;
    const existing = JSON.parse(localStorage.getItem(key) || "{}");

    if (!existing[platform]) {
      existing[platform] = { platform, clicks: 0, shares: 0, conversions: 0 };
    }

    existing[platform].clicks = (existing[platform].clicks || 0) + 1;

    // Random chance of conversion (20%)
    if (Math.random() < 0.2) {
      existing[platform].conversions = (existing[platform].conversions || 0) + 1;
    }

    localStorage.setItem(key, JSON.stringify(existing));
    setMetrics({ ...metrics });
  };

  if (products.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-16 px-4 pt-24">
          <div className="max-w-2xl mx-auto text-center">
          <Share2 className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <h1 className="text-3xl font-bold text-white mb-2">No Products Yet</h1>
          <p className="text-slate-300 mb-6">Upload products using Bulk Upload to start sharing</p>
          <Button onClick={() => (window.location.href = "/bulk-upload")} className="bg-blue-600 hover:bg-blue-700">
            Go to Bulk Upload
          </Button>
        </div>
      </div>
      </>
    );
  }

  const product = selectedProduct || products[0];
  const productMetrics = getMetrics(product.id);
  const totalClicks = (Object.values(productMetrics).reduce((sum: number, m: Record<string, number>) => sum + (m.clicks || 0), 0)) as number;
  const totalConversions = (Object.values(productMetrics).reduce((sum: number, m: Record<string, number>) => sum + (m.conversions || 0), 0)) as number;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-16 px-4 pt-24">
        <div className="max-w-5xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-white mb-3">Social Sharing</h1>
          <p className="text-lg text-slate-300">Pre-written templates & one-click sharing with analytics</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Product Selector */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg h-full">
              <CardHeader className="pb-4">
                <CardTitle>Your Products</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {products.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProduct(p)}
                      className={`w-full text-left p-3 rounded border transition ${
                        product.id === p.id
                          ? "bg-blue-600 border-blue-500 text-white"
                          : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      <p className="font-semibold text-sm truncate">{p.title}</p>
                      <p className="text-xs opacity-75">${p.price}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Preview & Templates */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Card */}
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-24 h-24 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200";
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg mb-1">{product.title}</h3>
                    <p className="text-sm text-slate-400 mb-2">{product.description}</p>
                    <p className="text-2xl font-bold text-blue-400">${product.price}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Templates */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Share Templates</CardTitle>
                <CardDescription>One-click sharing with automatic tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="twitter" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="twitter">
                      <Twitter className="w-4 h-4 mr-2" />
                      Twitter
                    </TabsTrigger>
                    <TabsTrigger value="discord">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Discord
                    </TabsTrigger>
                    <TabsTrigger value="telegram">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Telegram
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="twitter" className="space-y-3">
                    <div className="bg-slate-800 p-4 rounded border border-slate-700">
                      <p className="text-white text-sm whitespace-pre-wrap">
                        {templates.twitter(product, generateShareUrl(product.id, "twitter"))}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => shareOnTwitter(templates.twitter(product, generateShareUrl(product.id, "twitter")), product.id)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600"
                      >
                        <Twitter className="w-4 h-4 mr-2" />
                        Share on Twitter
                      </Button>
                      <Button
                        onClick={() => copyToClipboard(templates.twitter(product, generateShareUrl(product.id, "twitter")), "twitter")}
                        variant="outline"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    {copiedPlatform === "twitter" && (
                      <Alert className="bg-green-50 border-green-200">
                        <AlertDescription className="text-green-800">Copied to clipboard!</AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>

                  <TabsContent value="discord" className="space-y-3">
                    <div className="bg-slate-800 p-4 rounded border border-slate-700">
                      <p className="text-white text-sm whitespace-pre-wrap">
                        {templates.discord(product, generateShareUrl(product.id, "discord"))}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          copyToClipboard(templates.discord(product, generateShareUrl(product.id, "discord")), "discord");
                          trackShare(product.id, "discord");
                        }}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy for Discord
                      </Button>
                    </div>
                    {copiedPlatform === "discord" && (
                      <Alert className="bg-green-50 border-green-200">
                        <AlertDescription className="text-green-800">Copied to clipboard! Paste in Discord.</AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>

                  <TabsContent value="telegram" className="space-y-3">
                    <div className="bg-slate-800 p-4 rounded border border-slate-700">
                      <p className="text-white text-sm whitespace-pre-wrap">
                        {templates.telegram(product, generateShareUrl(product.id, "telegram"))}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          const url = `https://t.me/share/url?url=${encodeURIComponent(generateShareUrl(product.id, "telegram"))}&text=${encodeURIComponent(product.title)}`;
                          window.open(url, "_blank");
                          trackShare(product.id, "telegram");
                        }}
                        className="flex-1 bg-sky-600 hover:bg-sky-700"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share on Telegram
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Analytics Dashboard */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-400" />
              Share Analytics
            </CardTitle>
            <CardDescription>Track how your shares perform across platforms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded p-4 text-center">
                <p className="text-sm text-slate-600">Total Shares</p>
                <p className="text-3xl font-bold text-blue-900">
                  {(Object.values(productMetrics).reduce((sum: number, m: Record<string, number>) => sum + (m.shares || 0), 0) as number)}
                </p>
              </div>
              <div className="bg-cyan-50 rounded p-4 text-center">
                <p className="text-sm text-slate-600">Total Clicks</p>
                <p className="text-3xl font-bold text-cyan-900">{totalClicks}</p>
              </div>
              <div className="bg-green-50 rounded p-4 text-center">
                <p className="text-sm text-slate-600">Conversions</p>
                <p className="text-3xl font-bold text-green-600">{totalConversions}</p>
              </div>
            </div>

            {/* Platform Breakdown */}
            {Object.keys(productMetrics).length > 0 ? (
              <div className="space-y-4">
                <h3 className="font-semibold text-white text-lg">By Platform</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(productMetrics).map(([platform, data]: [string, Record<string, number>]) => (
                    <div key={platform} className="bg-slate-800 rounded border border-slate-700 p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-white capitalize">{platform}</h4>
                        {platform === "twitter" && <Twitter className="w-5 h-5 text-blue-400" />}
                        {platform === "discord" && <MessageCircle className="w-5 h-5 text-indigo-400" />}
                        {platform === "telegram" && <MessageCircle className="w-5 h-5 text-sky-400" />}
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-slate-300">
                          <span className="flex items-center gap-1">
                            <Share2 className="w-4 h-4" /> Shares
                          </span>
                          <span className="font-bold text-white">{data.shares || 0}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" /> Clicks
                          </span>
                          <span className="font-bold text-cyan-400">{data.clicks || 0}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="flex items-center gap-1">
                            <MousePointer className="w-4 h-4" /> Conversions
                          </span>
                          <span className="font-bold text-green-400">{data.conversions || 0}</span>
                        </div>
                        {(data.clicks || 0) > 0 && (
                          <div className="flex justify-between text-slate-300 pt-2 border-t border-slate-700">
                            <span>Conv. Rate</span>
                            <span className="font-bold text-green-400">
                              {(((data.conversions || 0) / (data.clicks || 1)) * 100).toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={() => simulateClick(product.id, platform)}
                        variant="outline"
                        className="w-full mt-4 text-xs"
                      >
                        Simulate Click
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Alert className="bg-slate-800 border-slate-700">
                <AlertDescription className="text-slate-300">
                  Share your product to see analytics here. Each share generates a unique tracking link.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};

export default SocialSharing;
