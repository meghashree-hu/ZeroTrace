import React, { useEffect, useMemo, useRef, useState } from "react";
import { Copy, Link2, QrCode, ShieldCheck, Share2 } from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api";
import { generateShareLink } from "../../services/share.service";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { Input, Select, Toggle } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";

const accessModes = ["VIEW_PRINT", "PRINT_ONLY"];

const GenerateShare: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDocument, setSelectedDocument] = useState("");
  const [accessMode, setAccessMode] = useState(accessModes[0]);
  const [expiryMinutes, setExpiryMinutes] = useState(60);
  const [maxViews, setMaxViews] = useState(10);
  const [maxPrints, setMaxPrints] = useState(5);
  const [downloadAllowed, setDownloadAllowed] = useState(true);
  const [approvalRequired, setApprovalRequired] = useState(false);
  const [watermarkEnabled, setWatermarkEnabled] = useState(true);
  const [autoRevokeAfterPrint, setAutoRevokeAfterPrint] = useState(true);
  const [link, setLink] = useState("");
  const [shareToken, setShareToken] = useState("");
  const [shareStatus, setShareStatus] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(false);
  const generateInFlightRef = useRef(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await api.get("/documents");
        setDocuments(res.data.data);
        setSelectedDocument(res.data.data?.[0]?.documentId || "");
      } catch (error) {
        console.error(error);
      }
    };

    fetchDocuments();
  }, []);

  const selectedDocumentLabel = useMemo(
    () => documents.find((doc) => doc.documentId === selectedDocument)?.originalFileName || "",
    [documents, selectedDocument]
  );

  const copyLink = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    toast.success("Link copied");
  };

  const getFrontendOrigin = () => {
    const configuredOrigin = import.meta.env.VITE_FRONTEND_BASE_URL;
    const isLocalOrigin = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);

    return configuredOrigin || (isLocalOrigin ? window.location.origin : window.location.origin);
  };

  const handleGenerateShare = async () => {
    if (generateInFlightRef.current || loading) return;

    if (!selectedDocument) {
      toast.error("Please select a document first.");
      return;
    }

    generateInFlightRef.current = true;
    setLoading(true);

    try {
      const response = await generateShareLink({
        documentId: selectedDocument,
        accessMode,
        expiryMinutes,
        maxViews,
        maxPrints,
        downloadAllowed,
        approvalRequired,
        watermarkEnabled,
        autoRevokeAfterPrint,
        frontendOrigin: getFrontendOrigin(),
      });

      const shareData = response.data?.data;
      const share = shareData?.share;
      const shareToken = share?.shareToken;

      if (!shareToken) {
        throw new Error("Invalid response from share API");
      }

      const generatedLink = shareData?.shareUrl || `${window.location.origin}/share/${shareToken}`;
      setLink(generatedLink);
      setShareToken(shareToken);
      setShareStatus(share?.status || "");
      setExpiresAt(share?.expiresAt || "");
      setQrCode(shareData?.qrCode || "");
      toast.success(response.data?.message || "Share link generated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to generate share link");
    } finally {
      generateInFlightRef.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Secure sharing"
        title="Generate Share"
        description="Create protected temporary links for documents while keeping the existing access workflow intact."
        icon={<Share2 className="h-4 w-4" />}
      />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-white">Share configuration</h2>
            <p className="mt-1 text-sm text-slate-400">Configure the document and preview policy choices before generating a link.</p>
          </CardHeader>
          <CardContent className="space-y-5">
            <Select label="Document" value={selectedDocument} onChange={(e) => setSelectedDocument(e.target.value)}>
              {documents.map((doc) => (
                <option key={doc.documentId} value={doc.documentId}>
                  {doc.originalFileName}
                </option>
              ))}
            </Select>
            <Select label="Access Mode" value={accessMode} onChange={(e) => setAccessMode(e.target.value)}>
              {accessModes.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </Select>

            <div className="grid gap-4 md:grid-cols-3">
              <Input label="Expiry" type="number" value={expiryMinutes} onChange={(e) => setExpiryMinutes(Number(e.target.value))} />
              <Input label="Max Views" type="number" value={maxViews} onChange={(e) => setMaxViews(Number(e.target.value))} />
              <Input label="Max Prints" type="number" value={maxPrints} onChange={(e) => setMaxPrints(Number(e.target.value))} />
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              <Toggle label="Download allowed" checked={downloadAllowed} onChange={setDownloadAllowed} />
              <Toggle label="Approval required" checked={approvalRequired} onChange={setApprovalRequired} />
              <Toggle label="Watermark enabled" checked={watermarkEnabled} onChange={setWatermarkEnabled} />
              <Toggle label="Auto revoke after print" checked={autoRevokeAfterPrint} onChange={setAutoRevokeAfterPrint} />
            </div>

            <Button onClick={handleGenerateShare} disabled={loading} className="w-full">
              <ShieldCheck className="h-4 w-4" />
              {loading ? "Generating..." : "Generate Secure Link"}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Share preview</h2>
                <p className="mt-1 text-sm text-slate-400">Generated link, token, and QR details.</p>
              </div>
              <Badge tone={link ? "emerald" : "slate"}>{link ? "Ready to share" : "Awaiting generation"}</Badge>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Document</div>
                <div className="mt-2 text-sm font-medium text-slate-100">{selectedDocumentLabel || "No document selected"}</div>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Generated Link</div>
                  <Link2 className="h-4 w-4 text-cyan-300" />
                </div>
                <p className="break-all text-sm text-slate-200">{link || "No link generated yet."}</p>
                <Button type="button" onClick={copyLink} disabled={!link} className="mt-4 w-full">
                  <Copy className="h-4 w-4" />
                  Copy Link
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
                  <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-500">
                    QR Code
                    <QrCode className="h-4 w-4 text-cyan-300" />
                  </div>
                  <div className="flex h-44 items-center justify-center rounded-xl bg-slate-900/80">
                    {qrCode ? (
                      <img src={qrCode} alt="Share QR Code" className="h-full w-full rounded-xl object-contain p-3" />
                    ) : (
                      <QrCode className="h-12 w-12 text-slate-600" />
                    )}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Share Details</div>
                  <div className="mt-4 space-y-3 text-sm">
                    <div>
                      <div className="text-slate-500">Status</div>
                      <div className="mt-1 font-medium text-slate-200">{shareStatus || "No share generated"}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Expiry Time</div>
                      <div className="mt-1 text-slate-200">{expiresAt || "Not available"}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Share Token</div>
                      <div className="mt-1 break-all text-slate-200">{shareToken || "Not generated"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GenerateShare;
