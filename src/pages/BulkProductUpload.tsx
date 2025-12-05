import { useState } from "react";
import { Upload, Check, AlertCircle, Download, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";

interface ProductRow {
  title: string;
  description: string;
  price: string;
  image_url: string;
  category?: string;
}

interface UploadResult {
  success: number;
  failed: number;
  errors: { row: number; error: string }[];
  products: ProductRow[];
}

const BulkProductUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [parsedData, setParsedData] = useState<ProductRow[]>([]);

  const parseCSV = (content: string): ProductRow[] => {
    const lines = content.trim().split("\n");
    const header = lines[0].split(",").map((h) => h.trim().toLowerCase());

    return lines.slice(1).map((line) => {
      // Better CSV parsing that handles quoted values
      const values: string[] = [];
      let currentValue = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(currentValue.trim().replace(/^"|"$/g, ""));
          currentValue = "";
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.trim().replace(/^"|"$/g, ""));

      const row: Record<string, string> = {};
      header.forEach((key, index) => {
        row[key] = values[index] || "";
      });

      return row as unknown as ProductRow;
    });
  };

  const parseJSON = (content: string): ProductRow[] => {
    return JSON.parse(content);
  };

  const validateProduct = (product: ProductRow, rowIndex: number): { valid: boolean; error?: string } => {
    if (!product.title || !product.title.trim()) {
      return { valid: false, error: `Row ${rowIndex + 1}: Missing product title` };
    }
    if (!product.price || isNaN(parseFloat(product.price))) {
      return { valid: false, error: `Row ${rowIndex + 1}: Invalid price (must be a number)` };
    }
    if (!product.image_url || !product.image_url.trim()) {
      return { valid: false, error: `Row ${rowIndex + 1}: Missing image URL` };
    }
    if (product.price && parseFloat(product.price) <= 0) {
      return { valid: false, error: `Row ${rowIndex + 1}: Price must be greater than 0` };
    }

    return { valid: true };
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        let products: ProductRow[] = [];

        if (selectedFile.name.endsWith(".csv")) {
          products = parseCSV(content);
        } else if (selectedFile.name.endsWith(".json")) {
          products = parseJSON(content);
        } else {
          alert("Please upload a CSV or JSON file");
          return;
        }

        setParsedData(products);
      } catch (error) {
        alert("Error parsing file: " + (error as Error).message);
      }
    };

    reader.readAsText(selectedFile);
  };

  const processBatch = async () => {
    if (parsedData.length === 0) {
      alert("No products to upload");
      return;
    }

    setUploading(true);
    setProgress(0);

    const errors: { row: number; error: string }[] = [];
    const validProducts: ProductRow[] = [];
    const batchId = `batch_${Date.now()}`;

    // Simulate batch processing with validation
    for (let i = 0; i < parsedData.length; i++) {
      const product = parsedData[i];
      const validation = validateProduct(product, i);

      if (!validation.valid) {
        errors.push({ row: i + 1, error: validation.error || "Unknown error" });
      } else {
        // Store in localStorage with batch ID
        const products = JSON.parse(localStorage.getItem("bulk_products") || "[]");
        const newProduct = {
          id: `product_${batchId}_${i}`,
          title: product.title,
          description: product.description || "No description",
          price: parseFloat(product.price),
          image_url: product.image_url,
          category: product.category || "general",
          created_at: new Date().toISOString(),
          batch_id: batchId,
          status: "active",
        };

        products.push(newProduct);
        localStorage.setItem("bulk_products", JSON.stringify(products));
        validProducts.push(product);
      }

      // Update progress (simulate processing delay)
      setProgress(((i + 1) / parsedData.length) * 100);
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    setUploading(false);
    setResult({
      success: validProducts.length,
      failed: errors.length,
      errors,
      products: validProducts,
    });

    // Save batch summary
    const batches = JSON.parse(localStorage.getItem("upload_batches") || "[]");
    batches.push({
      batch_id: batchId,
      uploaded_at: new Date().toISOString(),
      total: parsedData.length,
      success: validProducts.length,
      failed: errors.length,
    });
    localStorage.setItem("upload_batches", JSON.stringify(batches));
  };

  const downloadTemplate = () => {
    const template = `title,description,price,image_url,category
"Red Running Shoes","Premium athletic running shoes with cushioning","49.99","https://images.unsplash.com/photo-1542291026-7eec264c27ff","footwear"
"Premium Yoga Mat","Non-slip eco-friendly yoga mat 6mm thick","24.99","https://images.unsplash.com/photo-1506126613408-eca07ce68773","fitness"
"Wireless Earbuds Pro","Noise-cancelling Bluetooth earbuds 30hr battery","89.99","https://images.unsplash.com/photo-1505740420928-5e560c06d30e","electronics"
"Winter Parka Jacket","Waterproof insulated jacket rated to -20C","129.99","https://images.unsplash.com/photo-1551028719-00167b16ebc5","apparel"
"Running Waist Belt","Lightweight water-resistant belt with pocket","19.99","https://images.unsplash.com/photo-1553062407-98eeb64c6a62","accessories"`;

    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(template));
    element.setAttribute("download", "products_template.csv");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadErrors = () => {
    if (!result || result.errors.length === 0) return;

    const errorCSV = ["Row,Error", ...result.errors.map((e) => `"${e.row}","${e.error}"`)].join(
      "\n"
    );

    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(errorCSV));
    element.setAttribute("download", "upload_errors.csv");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-16 px-4 pt-24">
        <div className="max-w-2xl mx-auto">
          <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-white mb-3">Bulk Upload</h1>
          <p className="text-lg text-slate-300">Scale your catalog instantly with CSV or JSON</p>
        </div>

        {/* Upload Section */}
        <Card className="mb-10 border-0 shadow-lg">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl">Import Products</CardTitle>
            <CardDescription className="text-base">Upload a CSV or JSON file with product details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:bg-slate-50 cursor-pointer transition">
              <input
                type="file"
                accept=".csv,.json"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer block">
                <Upload className="w-12 h-12 mx-auto mb-2 text-blue-600" />
                <p className="font-semibold text-slate-900">Click to upload or drag and drop</p>
                <p className="text-sm text-slate-500">CSV or JSON files (Max 50MB)</p>
              </label>
            </div>

            {file && (
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <p className="text-sm">
                  <span className="font-semibold text-blue-900">File selected:</span>{" "}
                  <span className="text-blue-700">{file.name}</span>
                  <span className="text-blue-600 ml-2">({parsedData.length} products detected)</span>
                </p>
              </div>
            )}

            <Button onClick={downloadTemplate} variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download CSV Template
            </Button>

            {parsedData.length > 0 && (
              <Button
                onClick={processBatch}
                disabled={uploading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {uploading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Process {parsedData.length} Products
                  </>
                )}
              </Button>
            )}

            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Processing...</span>
                  <span className="font-semibold text-slate-900">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        {result && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl flex items-center gap-3">
                {result.failed === 0 ? (
                  <>
                    <Check className="w-6 h-6 text-green-600" />
                    Upload Complete
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-6 h-6 text-amber-600" />
                    Upload Complete with Errors
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded p-4 text-center">
                  <p className="text-sm text-slate-600">Total Products</p>
                  <p className="text-3xl font-bold text-blue-900">{result.success + result.failed}</p>
                </div>
                <div className="bg-green-50 rounded p-4 text-center">
                  <p className="text-sm text-slate-600">Successful</p>
                  <p className="text-3xl font-bold text-green-600">{result.success}</p>
                </div>
                <div className="bg-red-50 rounded p-4 text-center">
                  <p className="text-sm text-slate-600">Failed</p>
                  <p className="text-3xl font-bold text-red-600">{result.failed}</p>
                </div>
              </div>

              {/* Success Message */}
              {result.failed === 0 && (
                <Alert className="bg-green-50 border-green-200">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    All products uploaded successfully! Your products are now live.
                  </AlertDescription>
                </Alert>
              )}

              {/* Errors */}
              {result.errors.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">Failed Rows</h3>
                    <Button onClick={downloadErrors} variant="outline" size="sm">
                      <Download className="w-3 h-3 mr-1" />
                      Download Errors
                    </Button>
                  </div>
                  <div className="bg-slate-50 rounded border border-slate-200 max-h-64 overflow-y-auto">
                    {result.errors.map((err, idx) => (
                      <div key={idx} className="border-b border-slate-200 p-3 last:border-b-0">
                        <p className="text-sm font-mono text-red-600">{err.error}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview Successful Products */}
              {result.success > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-900">
                    {result.success} Product{result.success !== 1 ? "s" : ""} Ready
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {result.products.slice(0, 4).map((product, idx) => (
                      <div key={idx} className="border border-slate-200 rounded p-3">
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="w-full h-24 object-cover rounded mb-2"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200";
                          }}
                        />
                        <p className="font-semibold text-sm text-slate-900 truncate">{product.title}</p>
                        <p className="text-sm text-blue-600 font-bold">${product.price}</p>
                      </div>
                    ))}
                  </div>
                  {result.success > 4 && (
                    <p className="text-sm text-slate-600">... and {result.success - 4} more products</p>
                  )}
                </div>
              )}

              <Button onClick={() => window.location.reload()} className="w-full">
                Upload Another File
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Feature Info */}
        {!result && (
          <Card className="bg-slate-50 border-0 shadow-lg mt-10">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl">How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-slate-900 min-w-6">1</span>
                  <span>Download the CSV template or prepare your JSON file</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-slate-900 min-w-6">2</span>
                  <span>Upload your file with up to 1000+ products</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-slate-900 min-w-6">3</span>
                  <span>System validates each product and processes in batches</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-slate-900 min-w-6">4</span>
                  <span>View results with success/error breakdown</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-slate-900 min-w-6">5</span>
                  <span>All products instantly available for sharing on social</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
      </div>
    </>
  );
};

export default BulkProductUpload;
