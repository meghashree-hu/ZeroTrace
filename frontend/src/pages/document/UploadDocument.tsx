
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { FiUpload, FiTrash2, FiFile, FiChevronLeft } from "react-icons/fi";
import toast from "react-hot-toast";
import { uploadDocument } from "../../services/document.service";
import MainLayout from "../../layouts/MainLayout";


const UploadDocument: React.FC = () => {
 
  const navigate = useNavigate();

  const [documentName, setDocumentName] = useState("");
 
  const [accessMode, setAccessMode] = useState("VIEW_PRINT");
  const [expiryMinutes, setExpiryMinutes] = useState<number | "">(""
  );
  const [maxViews, setMaxViews] = useState<number | "">("");
  const [maxPrints, setMaxPrints] = useState<number | "">("");
  const [downloadAllowed, setDownloadAllowed] = useState(true);
  const [approvalRequired, setApprovalRequired] = useState(false);
  const [watermarkEnabled, setWatermarkEnabled] = useState(true);

  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files || []);
    if (dropped.length) setFiles((prev) => [...prev, ...dropped]);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const selectedFiles = e.target.files;

  if (!selectedFiles) return;

  setFiles((prev) => [...prev, ...Array.from(selectedFiles)]);
};

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setDocumentName("");
    
    setFiles([]);
    setUploadProgress(0);
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!files.length) {
      toast.error("Please select at least one file to upload.");
      return;
    }

    if (!documentName.trim()) {
      toast.error("Please enter a document name.");
      return;
    }

    const form = new FormData();
    // backend expects single file named 'document' (middleware.single)
    // if multiple selected, we'll upload only the first to respect backend
    form.append("document", files[0]);
    form.append("documentName", documentName);
    
    form.append("accessMode", accessMode);
    form.append("expiryMinutes", String(expiryMinutes || 15));
    form.append("maxViews", String(maxViews || 0));
    form.append("maxPrints", String(maxPrints || 0));
    form.append("downloadAllowed", String(downloadAllowed));
    form.append("approvalRequired", String(approvalRequired));
    form.append("watermarkEnabled", String(watermarkEnabled));

    try {
      setSubmitting(true);
      setUploadProgress(0);

      const response = await uploadDocument(form);

toast.success(response.message);

resetForm();

navigate("/dashboard");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || "Upload failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
      <MainLayout>
    <div className="min-h-[calc(100vh-4rem)] p-6 md:p-10 bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-700 mb-6"
        >
          <FiChevronLeft /> Back
        </button>

        <div className="glass-card relative overflow-hidden rounded-2xl p-6 md:p-10 shadow-lg border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-slate-800">
                Upload Document
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Securely upload documents with advanced access controls.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Premium</span>
              <div className="mt-1 text-sm font-medium text-slate-700">Cybersecurity</div>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-slate-700">Document Name</label>
                <input
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="Enter a descriptive name"
                  className="w-full bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-3 text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-sky-300"
                />

                
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700">Access Mode</label>
                <select
                  value={accessMode}
                  onChange={(e) => setAccessMode(e.target.value)}
                  className="w-full bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-sky-300"
                >
                  <option value="VIEW_PRINT">View & Print</option>
                  <option value="PRINT_ONLY">Print Only</option>
                </select>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-slate-600">Expiry (mins)</label>
                    <input
                      type="number"
                      value={expiryMinutes}
                      onChange={(e) => setExpiryMinutes(Number(e.target.value) || "")}
                      className="w-full bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-sky-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600">Max Views</label>
                    <input
                      type="number"
                      value={maxViews}
                      onChange={(e) => setMaxViews(Number(e.target.value) || "")}
                      className="w-full bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-sky-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-slate-600">Max Prints</label>
                    <input
                      type="number"
                      value={maxPrints}
                      onChange={(e) => setMaxPrints(Number(e.target.value) || "")}
                      className="w-full bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-sky-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600">Download Allowed</label>
                    <div className="mt-1">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={downloadAllowed}
                          onChange={(e) => setDownloadAllowed(e.target.checked)}
                          className="rounded text-sky-500"
                        />
                        <span className="text-sm text-slate-700">Allow</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={approvalRequired}
                      onChange={(e) => setApprovalRequired(e.target.checked)}
                      className="rounded text-sky-500"
                    />
                    <span className="text-sm text-slate-700">Require approval</span>
                  </label>

                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={watermarkEnabled}
                      onChange={(e) => setWatermarkEnabled(e.target.checked)}
                      className="rounded text-sky-500"
                    />
                    <span className="text-sm text-slate-700">Watermark</span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">File</label>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                className="mt-3 border-2 border-dashed border-white/20 bg-white/5 rounded-lg p-6 flex flex-col md:flex-row items-center gap-4"
              >
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-tr from-sky-400/20 to-white/10 text-sky-400">
                      <FiUpload size={22} />
                    </div>
                    <div>
                      <div className="text-slate-700 font-medium">Drag & drop file here</div>
                      <div className="text-xs text-slate-400">or click to select a file (first file will be uploaded)</div>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    onChange={onFileChange}
                  />
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg shadow"
                  >
                    Select File
                  </button>
                </div>
              </div>

              {files.length > 0 && (
                <div className="mt-4 grid gap-3">
                  {files.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-4 bg-white/5 border border-white/10 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-sky-400 p-2 rounded bg-white/10">
                          <FiFile />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-200">{f.name}</div>
                          <div className="text-xs text-slate-400">{(f.size / 1024).toFixed(1)} KB</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => removeFile(i)}
                          type="button"
                          className="text-rose-400 hover:text-white"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {uploadProgress > 0 && (
              <div>
                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 bg-sky-500"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="text-xs text-slate-400 mt-1">Uploading {uploadProgress}%</div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                }}
                className="px-4 py-2 rounded-lg bg-white/10 text-slate-700 hover:bg-white/20"
              >
                Reset
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-sky-600 to-slate-700 text-white font-semibold disabled:opacity-60"
              >
                {submitting ? "Uploading..." : "Upload Document"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`\n        .glass-card{background: linear-gradient(180deg, rgba(255,255,255,0.55), rgba(245,247,250,0.35)); backdrop-filter: blur(8px);}\n      `}</style>
    </div>
    </MainLayout>
  );
};

export default UploadDocument;
