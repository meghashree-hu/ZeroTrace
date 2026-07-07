import { useEffect, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Clock3,
  FileText,
  Printer,
  Share2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api";
import { Badge } from "../../components/ui/Badge";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { PageHeader } from "../../components/ui/PageHeader";

type DashboardStats = {
  documents: number;
  activeDocuments: number;
  expiredDocuments: number;
  revokedDocuments: number;
  secureShares: number;
  expiredShares: number;
  revokedShares: number;
  pendingRequests: number;
  approvedRequests: number;
  printedSessions: number;
  expiredSessions: number;
  revokedSessions: number;
  activeSessions: number;
  securePrints: number;
  recentActivity: Array<{ title: string; detail: string; time: string }>;
};

const initialStats: DashboardStats = {
  documents: 0,
  activeDocuments: 0,
  expiredDocuments: 0,
  revokedDocuments: 0,
  secureShares: 0,
  expiredShares: 0,
  revokedShares: 0,
  pendingRequests: 0,
  approvedRequests: 0,
  printedSessions: 0,
  expiredSessions: 0,
  revokedSessions: 0,
  activeSessions: 0,
  securePrints: 0,
  recentActivity: [],
};

function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await api.get("/documents/stats/summary");
        setStats({ ...initialStats, ...(response.data.data || {}) });
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const statCards = [
    { label: "Documents", value: stats.documents, change: `${stats.activeDocuments} active`, icon: FileText },
    { label: "Secure Shares", value: stats.secureShares, change: `${stats.expiredShares} expired`, icon: Share2 },
    { label: "Pending Requests", value: stats.pendingRequests, change: `${stats.pendingRequests} awaiting`, icon: Clock3 },
    { label: "Printed", value: stats.printedSessions || stats.securePrints, change: `${stats.securePrints} total prints`, icon: Printer },
  ];

  const statusRows = [
    ["Active documents", stats.activeDocuments],
    ["Expired documents", stats.expiredDocuments],
    ["Revoked documents", stats.revokedDocuments],
    ["Revoked shares", stats.revokedShares],
    ["Approved sessions", stats.approvedRequests],
    ["Expired sessions", stats.expiredSessions],
    ["Revoked sessions", stats.revokedSessions],
    ["Active sessions", stats.activeSessions],
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Enterprise threat protection"
        title="ZeroTrace Command Center"
        description="Monitor secure document flows, approvals, and audit events from one professional security console."
        icon={<ShieldCheck className="h-4 w-4" />}
        actions={<Badge tone="emerald"><Activity className="h-4 w-4" />Live backend data</Badge>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="group p-5 hover:-translate-y-0.5 hover:border-cyan-400/30">
              <div className="mb-4 inline-flex rounded-xl bg-cyan-400/10 p-3">
                <Icon className="h-5 w-5 text-cyan-300" />
              </div>
              <div className="text-3xl font-semibold text-white">{loading ? "..." : stat.value}</div>
              <div className="mt-1 text-sm text-slate-400">{stat.label}</div>
              <div className="mt-4 flex items-center gap-2 text-sm text-cyan-300">
                <ArrowUpRight className="h-4 w-4" />
                {stat.change}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Recent activity</h2>
              <p className="mt-1 text-sm text-slate-400">Latest backend session events.</p>
            </div>
            <Badge>Live</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.recentActivity.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-400">
                No recent activity found.
              </div>
            ) : (
              stats.recentActivity.map((item, index) => (
                <div key={`${item.title}-${index}`} className="flex items-start gap-3 rounded-xl border border-white/10 bg-slate-950/50 p-4 transition hover:border-cyan-400/30 hover:bg-white/[0.04]">
                  <div className="mt-0.5 rounded-lg bg-cyan-400/10 p-2 text-cyan-300">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium text-slate-100">{item.title}</div>
                      <div className="text-xs text-slate-500">{item.time ? new Date(item.time).toLocaleString() : ""}</div>
                    </div>
                    <div className="mt-1 text-sm text-slate-400">{item.detail}</div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-white">Security status</h2>
            <Badge tone="emerald">Backend</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {statusRows.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm">
                <span className="text-slate-400">{label}</span>
                <span className="font-medium text-slate-200">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
