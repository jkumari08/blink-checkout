import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Transaction {
  id: string;
  productName: string;
  amount: number;
  token: string;
  timestamp: number;
  type: "buy" | "sell";
  counterparty: string;
  txHash: string;
}

const TransactionHistory = () => {
  const { publicKey } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<"all" | "buy" | "sell">("all");

  useEffect(() => {
    // Load transactions from localStorage
    if (publicKey) {
      const stored = localStorage.getItem(`transactions_${publicKey.toString()}`);
      if (stored) {
        setTransactions(JSON.parse(stored));
      }
    }
  }, [publicKey]);

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === "all") return true;
    return tx.type === filter;
  });

  const exportToCSV = () => {
    if (filteredTransactions.length === 0) {
      alert("No transactions to export");
      return;
    }

    const headers = ["Date", "Type", "Product", "Amount", "Token", "Counterparty", "Hash"];
    const rows = filteredTransactions.map((tx) => [
      new Date(tx.timestamp).toISOString(),
      tx.type.toUpperCase(),
      tx.productName,
      tx.amount.toString(),
      tx.token,
      tx.counterparty.slice(0, 8) + "...",
      tx.txHash,
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Transaction History</h1>
            <p className="text-muted-foreground">
              View all your purchases and sales on BlinkShop
            </p>
          </div>

          {!publicKey ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">Connect your wallet to view transactions</p>
            </Card>
          ) : filteredTransactions.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No transactions yet</p>
              <p className="text-sm text-muted-foreground">
                Start by creating a product or making a purchase
              </p>
            </Card>
          ) : (
            <>
              {/* Filters */}
              <div className="flex gap-3 mb-6 flex-wrap">
                <Button
                  variant={filter === "all" ? "hero" : "outline"}
                  onClick={() => setFilter("all")}
                >
                  All ({transactions.length})
                </Button>
                <Button
                  variant={filter === "buy" ? "hero" : "outline"}
                  onClick={() => setFilter("buy")}
                >
                  Purchases ({transactions.filter((t) => t.type === "buy").length})
                </Button>
                <Button
                  variant={filter === "sell" ? "hero" : "outline"}
                  onClick={() => setFilter("sell")}
                >
                  Sales ({transactions.filter((t) => t.type === "sell").length})
                </Button>
                <Button variant="outline" onClick={exportToCSV} className="ml-auto">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>

              {/* Transactions List */}
              <div className="space-y-3">
                {filteredTransactions.map((tx) => (
                  <Card
                    key={tx.id}
                    className="p-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {tx.type === "buy" ? (
                          <ArrowDownLeft className="w-5 h-5 text-primary" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{tx.productName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {tx.type === "buy" ? "Purchased from" : "Sold to"}{" "}
                          {tx.counterparty.slice(0, 8)}...
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {tx.type === "buy" ? "-" : "+"} {tx.amount} {tx.token}
                      </p>
                      <a
                        href={`https://explorer.solana.com/tx/${tx.txHash}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        View on Explorer
                      </a>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-8">
                <Card className="p-4 text-center">
                  <p className="text-2xl font-bold gradient-text">
                    {transactions.filter((t) => t.type === "buy").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Purchases</p>
                </Card>
                <Card className="p-4 text-center">
                  <p className="text-2xl font-bold gradient-text">
                    {transactions.filter((t) => t.type === "sell").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Sales</p>
                </Card>
                <Card className="p-4 text-center">
                  <p className="text-2xl font-bold gradient-text">
                    {(
                      transactions.reduce((sum, tx) => sum + tx.amount, 0) / transactions.length
                    ).toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">Avg Transaction</p>
                </Card>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TransactionHistory;
