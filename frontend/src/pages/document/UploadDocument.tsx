import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, ShieldCheck, Trash2, UploadCloud } from "lucide-react";
import toast from "react-hot-toast";

import { uploadDocument } from "../../services/document.service";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { PageHeader } from "../../components/ui/PageHeader";

const UploadDocument: React.FC = () => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

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
    setFiles([]);
    setUploadProgress(0);
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!files.length) {
      toast.error("Please select at least one file to upload.");
      return;
    }

    const form = new FormData();
    form.append("document", files[0]);

    try {
      setSubmitting(true);
      setUploadProgress(0);
      const response = await uploadDocument(form);
      toast.success(response.message);
      resetForm();
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || "Upload failed");
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Document intake"
        title="Upload Document"
        description="Securely upload a document before configuring share controls."
        icon={<UploadCloud className="h-4 w-4" />}
        actions={
          <Button variant="secondary" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        }
      />

      <form onSubmit={submit} className="space-y-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-white">File package</h2>
            <p className="mt-1 text-sm text-slate-400">The backend accepts one document per upload. If multiple files are selected, the first file is submitted.</p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">File</label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                className="rounded-2xl border border-dashed border-cyan-400/30 bg-cyan-400/5 p-6 transition hover:border-cyan-300/60 hover:bg-cyan-400/10"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-medium text-white">Drop a file here</div>
                      <div className="mt-1 text-sm text-slate-400">or select a local file to secure.</div>
                    </div>
                  </div>
                  <input ref={inputRef} type="file" className="hidden" onChange={onFileChange} />
                  <Button onClick={() => inputRef.current?.click()}>
                    <UploadCloud className="h-4 w-4" />
                    Select File
                  </Button>
                </div>
              </div>

              {files.length > 0 && (
                <div className="mt-4 grid gap-3">
                  {files.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-slate-950/50 p-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="rounded-lg bg-cyan-400/10 p-2 text-cyan-300">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-slate-100">{file.name}</div>
                          <div className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</div>
                        </div>
                      </div>
                      <Button variant="ghost" className="h-9 w-9 p-0 text-rose-300" onClick={() => removeFile(index)} aria-label="Remove file">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {uploadProgress > 0 && (
              <div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-2 bg-cyan-400" style={{ width: `${uploadProgress}%` }} />
                </div>
                <div className="mt-1 text-xs text-slate-400">Uploading {uploadProgress}%</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-4">
            <Badge tone="emerald"><ShieldCheck className="h-4 w-4" />Ready</Badge>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={resetForm}>Reset</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Uploading..." : "Upload Document"}
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default UploadDocument;
