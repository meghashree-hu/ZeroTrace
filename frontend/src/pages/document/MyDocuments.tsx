import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import api from "../../services/api";

import { FiEye, FiShare2, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";

type Doc = {
  documentId: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: string | Date;
  status: string;
};

const humanFileSize = (size: number) => {
  if (!size) return "0 KB";
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return (
    (size / Math.pow(1024, i)).toFixed(1) + " " + ["B", "KB", "MB", "GB"][i]
  );
};

const MyDocuments: React.FC = () => {
 
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Doc | null>(null);
 

  useEffect(() => {
    let mounted = true;
    const fetchDocs = async () => {
      setLoading(true);
      try {
        const res = await api.get("/documents");

if (!mounted) return;

setDocs(res.data.data);
      } catch (error: any) {
    toast.error(
        error.response?.data?.message ||
        "Failed to load documents"
    );
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
    return docs.filter((d) =>
      d.originalFileName.toLowerCase().includes(query.toLowerCase())
    );
  }, [docs, query]);

  const onView = (d: Doc) => setSelected(d);

  const onShare = (d: Doc) => {
    const email = prompt("Enter email to share with:");
    if (!email) return;
    // mock share; in real app, call share API
    toast.success(`Shared ${d.originalFileName} with ${email}`);
  };

  const onDelete = async (d: Doc) => {
    if (!confirm(`Delete "${d.originalFileName}" permanently?`)) return;
    try {
      // attempt delete API; if not present, remove locally
      await api.delete(`/documents/${d.documentId}`);
      setDocs((prev) => prev.filter((p) => p.documentId !== d.documentId));
      toast.success("Document deleted");
    } catch (error: any) {
    toast.error(
        error.response?.data?.message ||
        "Failed to delete document"
    );
}
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-800">My Documents</h2>
            <p className="text-sm text-slate-500">Secure documents stored on your ZeroTrace vault.</p>
          </div>

          <div className="w-full md:w-auto flex items-center gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents"
              className="px-4 py-2 rounded-lg bg-white/30 backdrop-blur-sm border border-white/20 placeholder-slate-400 outline-none focus:ring-2 focus:ring-sky-300"
            />
            <div className="text-sm text-slate-600">{filtered.length} results</div>
          </div>
        </header>

        <section className="glass-card p-4 md:p-6 rounded-2xl shadow border border-white/20">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] table-auto">
              <thead>
                <tr className="text-left text-xs text-slate-400 uppercase tracking-wider">
                  <th className="px-4 py-3">Document Name</th>
                  <th className="px-4 py-3">File Type</th>
                  <th className="px-4 py-3">File Size</th>
                  <th className="px-4 py-3">Upload Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                      Loading...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                      No documents found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((d) => (
                    <tr
                      key={d.documentId}
                      className="group hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 py-4 align-top">
                        <div className="font-medium text-slate-200">{d.originalFileName}</div>
                      </td>
                      <td className="px-4 py-4 align-top text-slate-400">{d.mimeType}</td>
                      <td className="px-4 py-4 align-top text-slate-400">{humanFileSize(d.fileSize)}</td>
                      <td className="px-4 py-4 align-top text-slate-400">{new Date(d.uploadedAt).toLocaleString()}</td>
                      <td className="px-4 py-4 align-top">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${d.status === 'ACTIVE' ? 'bg-sky-600/20 text-sky-600' : 'bg-amber-600/10 text-amber-500'}`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex items-center gap-2">
                          <button onClick={() => onView(d)} className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition">
                            <FiEye /> <span className="text-sm">View</span>
                          </button>
                          <button onClick={() => onShare(d)} className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition">
                            <FiShare2 /> <span className="text-sm">Share</span>
                          </button>
                          <button onClick={() => onDelete(d)} className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 transition">
                            <FiTrash2 /> <span className="text-sm">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* View modal */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
            <div className="relative z-10 max-w-2xl w-full glass-card p-6 rounded-xl shadow-lg border border-white/20">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">{selected.originalFileName}</h3>
                  <p className="text-sm text-slate-500">{selected.mimeType} • {humanFileSize(selected.fileSize)}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-500">Close</button>
              </div>

              <div className="mt-4 text-sm text-slate-600">
                Uploaded: {new Date(selected.uploadedAt).toLocaleString()}
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <button onClick={() => {toast("Preview not available in mock");}} className="px-4 py-2 rounded-lg bg-sky-600 text-white">Preview</button>
                <button onClick={() => { setSelected(null); }} className="px-4 py-2 rounded-lg bg-white/10">Close</button>
              </div>
            </div>
          </div>
        )}

      </div>

      <style>{`\n        .glass-card{background: linear-gradient(180deg, rgba(255,255,255,0.55), rgba(245,247,250,0.35)); backdrop-filter: blur(8px);}\n      `}</style>
    </MainLayout>
  );
};

export default MyDocuments;
