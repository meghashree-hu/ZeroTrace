import React, { useEffect, useMemo, useState } from "react";
import { Eye, FileText, Search, Share2, Shield, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api";
import { extendShareExpiry, getShareHistory, revokeShare } from "../../services/share.service";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { PageHeader } from "../../components/ui/PageHeader";
import { Table, Td, Th } from "../../components/ui/Table";

type Doc = {
  documentId: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: string | Date;
  status: string;
};

type ShareHistoryItem = {
  shareId: string;
  documentId: string;
  documentName: string;
  status: string;
  viewsUsed: number;
  printsUsed: number;
  createdTime: string;
  expiryTime: string;
  lastAccess: string;
  device: any;
  ip: string;
};

const humanFileSize = (size: number) => {
  if (!size) return "0 KB";
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return (size / Math.pow(1024, i)).toFixed(1) + " " + ["B", "KB", "MB", "GB"][i];
};

const statusTone = (status: string) => {
  if (status === "ACTIVE") return "emerald";
  if (status === "REQUESTED") return "amber";
  if (status === "REVOKED" || status === "EXPIRED") return "rose";
  return "slate";
};

const MyDocuments: React.FC = () => {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Doc | null>(null);
  const [shareHistory, setShareHistory] = useState<ShareHistoryItem[]>([]);

  useEffect(() => {
    let mounted = true;
    const fetchDocs = async () => {
      setLoading(true);
      try {
        const [res, historyRes] = await Promise.all([
          api.get("/documents"),
          getShareHistory(),
        ]);
        if (!mounted) return;
        setDocs(res.data.data);
        setShareHistory(historyRes.data.data || []);
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to load documents");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchDocs();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return docs;
    return docs.filter((d) => d.originalFileName.toLowerCase().includes(query.toLowerCase()));
  }, [docs, query]);

  const onShare = (d: Doc) => {
    toast(`Use Generate Share to configure a recipient for ${d.originalFileName}`);
  };

  const refreshShareHistory = async () => {
    const historyRes = await getShareHistory();
    setShareHistory(historyRes.data.data || []);
  };

  const onRevokeShare = async (shareId: string) => {
    try {
      await revokeShare(shareId);
      toast.success("Share revoked");
      await refreshShareHistory();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to revoke share");
    }
  };

  const onExtendShare = async (shareId: string) => {
    const minutes = Number(prompt("Extend expiry by how many minutes?", "60"));
    if (!minutes) return;

    try {
      await extendShareExpiry(shareId, minutes);
      toast.success("Share expiry extended");
      await refreshShareHistory();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to extend share");
    }
  };

  const onDelete = async (d: Doc) => {
    if (!confirm(`Delete "${d.originalFileName}" permanently?`)) return;
    try {
      await api.delete(`/documents/${d.documentId}`);
      setDocs((prev) => prev.filter((p) => p.documentId !== d.documentId));
      toast.success("Document deleted");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete document");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Protected vault"
        title="My Documents"
        description="Manage secured documents stored in your ZeroTrace workspace."
        icon={<Shield className="h-4 w-4" />}
        actions={
          <>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents"
              icon={<Search className="h-4 w-4 text-cyan-300" />}
              className="sm:min-w-72"
            />
            <Badge tone="slate">{filtered.length} results</Badge>
          </>
        }
      />

      <Card className="overflow-hidden">
        <Table>
          <thead className="bg-slate-950/70">
            <tr>
              <Th>Document</Th>
              <Th>Type</Th>
              <Th>Size</Th>
              <Th>Upload date</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <Td colSpan={6} className="py-10 text-center">Loading documents...</Td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <Td colSpan={6} className="py-10 text-center">No documents found.</Td>
              </tr>
            ) : (
              filtered.map((doc) => (
                <tr key={doc.documentId} className="border-t border-white/10 transition hover:bg-white/[0.04]">
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-cyan-400/10 p-2.5 text-cyan-300">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-100">{doc.originalFileName}</div>
                        <div className="text-xs text-slate-500">Protected document</div>
                      </div>
                    </div>
                  </Td>
                  <Td>{doc.mimeType}</Td>
                  <Td>{humanFileSize(doc.fileSize)}</Td>
                  <Td>{new Date(doc.uploadedAt).toLocaleString()}</Td>
                  <Td><Badge tone={statusTone(doc.status)}>{doc.status}</Badge></Td>
                  <Td>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button variant="secondary" onClick={() => setSelected(doc)}>
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                      <Button variant="secondary" onClick={() => onShare(doc)}>
                        <Share2 className="h-4 w-4" />
                        Share
                      </Button>
                      <Button variant="danger" onClick={() => onDelete(doc)}>
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-white/10 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-white">Share History</h2>
          <p className="mt-1 text-sm text-slate-400">Real share records grouped by document.</p>
        </div>
        <Table>
          <thead className="bg-slate-950/70">
            <tr>
              <Th>Document Name</Th>
              <Th>Document ID</Th>
              <Th>Status</Th>
              <Th>Views Used</Th>
              <Th>Prints Used</Th>
              <Th>Created Time</Th>
              <Th>Expiry Time</Th>
              <Th>Last Access</Th>
              <Th>Device</Th>
              <Th>IP</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {shareHistory.length === 0 ? (
              <tr>
                <Td colSpan={11} className="py-10 text-center">No share history found.</Td>
              </tr>
            ) : (
              shareHistory.map((share) => (
                <tr key={share.shareId} className="border-t border-white/10 transition hover:bg-white/[0.04]">
                  <Td className="font-medium text-slate-100">{share.documentName}</Td>
                  <Td>{share.documentId}</Td>
                  <Td><Badge tone={statusTone(share.status)}>{share.status}</Badge></Td>
                  <Td>{share.viewsUsed}</Td>
                  <Td>{share.printsUsed}</Td>
                  <Td>{share.createdTime ? new Date(share.createdTime).toLocaleString() : ""}</Td>
                  <Td>{share.expiryTime ? new Date(share.expiryTime).toLocaleString() : ""}</Td>
                  <Td>{share.lastAccess ? new Date(share.lastAccess).toLocaleString() : ""}</Td>
                  <Td className="max-w-xs whitespace-normal">{share.device ? JSON.stringify(share.device) : ""}</Td>
                  <Td>{share.ip}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="danger" onClick={() => onRevokeShare(share.shareId)}>Revoke Share</Button>
                      <Button variant="secondary" onClick={() => onExtendShare(share.shareId)}>Extend Expiry</Button>
                    </div>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>

      {selected && (
        <Modal title={selected.originalFileName} onClose={() => setSelected(null)}>
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Type</div>
                <div className="mt-2 text-sm text-slate-200">{selected.mimeType}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Size</div>
                <div className="mt-2 text-sm text-slate-200">{humanFileSize(selected.fileSize)}</div>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-300">
              Uploaded: {new Date(selected.uploadedAt).toLocaleString()}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setSelected(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MyDocuments;
