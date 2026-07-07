import { useEffect, useState } from "react";
import { Filter, Search, ShieldCheck } from "lucide-react";

import { getAuditLogs } from "../../services/audit.service";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";

const AuditLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAuditLogs();
        setLogs(res.data.data || []);
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Audit stream"
        title="Audit Logs"
        description="A cybersecurity event timeline with visibility into protected document actions."
        icon={<ShieldCheck className="h-4 w-4" />}
        actions={
          <>
            <Input placeholder="Search logs" icon={<Search className="h-4 w-4 text-cyan-300" />} />
            <Button variant="secondary">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </>
        }
      />

      <Card className="p-5 sm:p-6">
        {loading ? (
          <div className="py-10 text-center text-sm text-slate-400">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-400">No logs found</div>
        ) : (
          <div className="relative space-y-4 before:absolute before:bottom-2 before:left-4 before:top-2 before:w-px before:bg-white/10">
            {logs.map((log) => (
              <div key={log.logId} className="relative flex gap-4 rounded-xl border border-white/10 bg-slate-950/50 p-4 transition hover:border-cyan-400/30 hover:bg-white/[0.04]">
                <div className="relative z-10 mt-1 h-8 w-8 rounded-full border border-cyan-400/30 bg-cyan-400/10" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Badge tone="cyan">{log.action}</Badge>
                    <span className="text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Document</div>
                      <div className="mt-1 text-slate-200">{log.documentName || log.documentId || "System"}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Document ID</div>
                      <div className="mt-1 text-slate-200">{log.documentId || "-"}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Status</div>
                      <div className="mt-1 text-slate-200">{log.status || log.action}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.14em] text-slate-500">IP</div>
                      <div className="mt-1 text-slate-200">{log.ipAddress || "-"}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AuditLogs;
