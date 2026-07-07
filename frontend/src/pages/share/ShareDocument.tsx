import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2, Printer, ShieldCheck, ShieldX } from "lucide-react";

import {
  fetchShareDetails,
  getSessionStatus,
  requestAccess,
  securePrint,
} from "../../services/share.service";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";

type ShareDetails = {
  share: {
    shareId: string;
    shareToken: string;
    status: string;
    expiresAt: string;
    documentId: string;
    ownerId: string;
    ownerName: string;
    ownerEmail: string;
    accessMode: string;
    maxViews: number;
    maxPrints: number;
  };
  document: {
    documentId: string;
    originalFileName: string;
    mimeType: string;
    fileSize: number;
    status: string;
    uploadedAt: string;
  };
};

const pageBg = "min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_32%),linear-gradient(135deg,#020617_0%,#0b1120_48%,#111827_100%)]";

const ShareDocument = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shareDetails, setShareDetails] = useState<ShareDetails | null>(null);
  const [message, setMessage] = useState("");
  const [sessionStatus, setSessionStatus] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [shouldPollStatus, setShouldPollStatus] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const loadShare = async () => {
      if (!shareToken) {
        setError("Invalid share token.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetchShareDetails(shareToken);
        const details = response.data.data as ShareDetails;
        setShareDetails(details);
      } catch (err: any) {
        setError(err.response?.data?.message || "Unable to load share details.");
      } finally {
        setLoading(false);
      }
    };

    loadShare();
  }, [shareToken]);

  useEffect(() => {
    if (!shouldPollStatus || !shareToken || !sessionId) return;
    const fingerprint = getDeviceFingerprint();

    const pollStatus = async () => {
      try {
        const response = await getSessionStatus(shareToken, sessionId, fingerprint);
        const status = response.data.status;
        setSessionStatus(status);
        setSessionId(response.data.sessionId || null);

        if (status === "APPROVED") {
          setMessage("Print permission granted.");
          setShouldPollStatus(false);
        }

        if (status === "REVOKED" || status === "REJECTED") {
          setMessage("The owner rejected your request.");
          setShouldPollStatus(false);
        }

        if (status === "EXPIRED") {
          setMessage("Your approved session has expired. Please request access again.");
          setShouldPollStatus(false);
        }
      } catch (err: any) {
        const statusCode = err.response?.status;
        if (statusCode === 403 || statusCode === 404 || statusCode === 410) {
          setShouldPollStatus(false);
        }
        setMessage(err.response?.data?.message || "Unable to check request status.");
      }
    };

    pollStatus();
    const interval = window.setInterval(pollStatus, 2000);

    return () => {
      window.clearInterval(interval);
    };
  }, [shareToken, shouldPollStatus, sessionId]);

  const handleRequestAccess = async () => {
    if (!shareToken) return;

    const fingerprint = getDeviceFingerprint();
    const deviceInfo = getDeviceInfo();

    try {
      setActionLoading(true);
      const response = await requestAccess(shareToken, fingerprint, deviceInfo);
      const status = response.data?.data?.status || "REQUESTED";
      setMessage("Your request has been sent to the owner.");
      setSessionStatus(status);
      setSessionId(response.data?.data?.sessionId || null);
      setShouldPollStatus(status === "REQUESTED" || status === "APPROVED");
    } catch (err: any) {
      setShouldPollStatus(false);
      setMessage(err.response?.data?.message || "Failed to send request.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSecurePrint = async () => {
    if (!shareToken) return;

    try {
      setActionLoading(true);
      const fingerprint = getDeviceFingerprint();
      const response = await securePrint(shareToken, fingerprint, sessionId || undefined);

      const contentType = typeof response.headers["content-type"] === "string"
        ? response.headers["content-type"]
        : "application/octet-stream";
      const blob = new Blob([response.data], { type: contentType });
      const fileUrl = window.URL.createObjectURL(blob);
      const watermarkText = `${new Date().toLocaleString()} - ${fingerprint} - ${shareDetails?.document.documentId} - ZeroTrace Secure Print`;

      const printHtml = `
        <html>
          <head>
            <title>Secure Print</title>
            <style>
              html,body{height:100%;margin:0}
              .watermark{
                position:fixed;
                top:0;left:0;right:0;bottom:0;
                pointer-events:none;
                z-index:9999;
                overflow:hidden;
              }
              .watermark div{
                position:absolute;
                width:200%;
                text-align:center;
                left:-50%;
                transform:rotate(-45deg);
                color:rgba(0,0,0,0.08);
                font-size:28px;
                font-weight:700;
                white-space:nowrap;
              }
              @media print{
                .watermark{display:block}
              }
            </style>
          </head>
          <body>
            <div class="watermark">
              <div>${escapeHtml(watermarkText)}</div>
            </div>
            <iframe src="${fileUrl}" style="width:100%;height:100vh;border:none;" sandbox></iframe>
          </body>
        </html>
      `;

      const wrapperBlob = new Blob([printHtml], { type: "text/html" });
      const wrapperUrl = window.URL.createObjectURL(wrapperBlob);
      const printWindow = window.open(wrapperUrl, "_blank");
      if (printWindow) {
        printWindow.focus();
        printWindow.onload = () => printWindow.print();
      }
    } catch (err: any) {
      let errorMessage = err.response?.data?.message || "Unable to access secure print.";
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          errorMessage = JSON.parse(text).message || errorMessage;
        } catch (e) {
          errorMessage = "Unable to access secure print.";
        }
      }
      setMessage(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const getDeviceInfo = () => {
    return {
      userAgent: navigator.userAgent,
      browser: getBrowserName(),
      operatingSystem: getOperatingSystem(),
      deviceType: getDeviceType(),
      platform: navigator.platform,
      language: navigator.language,
      screen: { width: window.screen.width, height: window.screen.height },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  };

  const getDeviceType = () => {
    const agent = navigator.userAgent.toLowerCase();
    if (/ipad|tablet/.test(agent)) return "Tablet";
    if (/mobi|iphone|android/.test(agent)) return "Mobile";
    return "Desktop";
  };

  const getBrowserName = () => {
    const agent = navigator.userAgent;
    if (agent.includes("Edg/")) return "Microsoft Edge";
    if (agent.includes("Chrome/")) return "Chrome";
    if (agent.includes("Firefox/")) return "Firefox";
    if (agent.includes("Safari/")) return "Safari";
    return "Unknown";
  };

  const getOperatingSystem = () => {
    const platform = navigator.platform.toLowerCase();
    const agent = navigator.userAgent.toLowerCase();
    if (platform.includes("win")) return "Windows";
    if (platform.includes("mac")) return "macOS";
    if (agent.includes("android")) return "Android";
    if (/iphone|ipad|ipod/.test(agent)) return "iOS";
    if (platform.includes("linux")) return "Linux";
    return "Unknown";
  };

  const getDeviceFingerprint = () => {
    const str = [
      navigator.userAgent,
      navigator.platform,
      `${window.screen.width}x${window.screen.height}`,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      navigator.language,
      navigator.platform,
    ].join("||");
    try {
      return btoa(str);
    } catch (e) {
      return encodeURIComponent(str);
    }
  };

  const escapeHtml = (unsafe: string) => {
    return unsafe.replace(/[&<"'>]/g, function (m) {
      switch (m) {
        case "&": return "&amp;";
        case "<": return "&lt;";
        case ">": return "&gt;";
        case '"': return "&quot;";
        case "'": return "&#039;";
        default: return m;
      }
    });
  };

  if (loading) {
    return (
      <div className={`${pageBg} flex items-center justify-center px-4`}>
        <Card className="p-8 text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-cyan-300" />
          <p className="mt-4 text-lg font-medium text-slate-200">Loading secure print details...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${pageBg} flex items-center justify-center px-4`}>
        <Card className="w-full max-w-md p-8">
          <ShieldX className="mb-4 h-10 w-10 text-rose-300" />
          <h1 className="text-xl font-semibold text-white">Secure Print Failed</h1>
          <p className="mt-3 text-sm text-slate-400">{error}</p>
        </Card>
      </div>
    );
  }

  const isPending = sessionStatus === "REQUESTED";
  const isApproved = sessionStatus === "APPROVED";
  const isRejected = sessionStatus === "REVOKED" || sessionStatus === "REJECTED";
  const canRequest = !isPending && !isApproved && !isRejected;
  const currentStatus = sessionStatus || shareDetails?.share.status || "";
  const expiresLabel = shareDetails?.share.expiresAt
    ? new Date(shareDetails.share.expiresAt).toLocaleString()
    : "Not specified";

  return (
    <div className={`${pageBg} flex items-center justify-center px-4 py-8`}>
      <Card className="w-full max-w-2xl overflow-hidden">
        <CardHeader className="text-center">
          <Badge><ShieldCheck className="h-4 w-4" />Secure Print Request</Badge>
          <h1 className="mt-4 text-3xl font-semibold text-white">{shareDetails?.document.originalFileName}</h1>
          <p className="mt-2 text-sm text-slate-400">Request owner approval before opening the protected print flow.</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-slate-950/50 p-5">
              <p className="text-sm text-slate-500">Document Name</p>
              <p className="mt-3 text-sm font-medium text-slate-200">{shareDetails?.document.originalFileName}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950/50 p-5">
              <p className="text-sm text-slate-500">Document ID</p>
              <p className="mt-3 text-sm font-medium text-slate-200">{shareDetails?.document.documentId}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950/50 p-5">
              <p className="text-sm text-slate-500">Owner Name</p>
              <p className="mt-3 text-sm font-medium text-slate-200">{shareDetails?.share.ownerName || shareDetails?.share.ownerId}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950/50 p-5">
              <p className="text-sm text-slate-500">Owner Email</p>
              <p className="mt-3 text-sm font-medium text-slate-200">{shareDetails?.share.ownerEmail}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950/50 p-5">
              <p className="text-sm text-slate-500">Access Mode</p>
              <p className="mt-3 text-sm font-medium text-slate-200">{shareDetails?.share.accessMode}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-slate-950/50 p-5">
              <p className="text-sm text-slate-500">Current Status</p>
              <div className="mt-3">
                <Badge tone={isApproved ? "emerald" : isRejected ? "rose" : isPending ? "amber" : "slate"}>
                  {currentStatus}
                </Badge>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950/50 p-5">
              <p className="text-sm text-slate-500">Expiry</p>
              <p className="mt-3 text-sm font-medium text-slate-200">{expiresLabel}</p>
            </div>
          </div>

          {isRejected && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-5">
              <p className="text-sm font-semibold text-rose-200">Access Denied</p>
              <p className="mt-2 text-sm text-rose-300">The owner rejected your request.</p>
            </div>
          )}

          {isApproved && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5">
              <p className="text-sm font-semibold text-emerald-200">Print permission granted.</p>
            </div>
          )}

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            {canRequest && (
              <Button onClick={handleRequestAccess} disabled={actionLoading} className="w-full sm:w-auto">
                {actionLoading ? "Requesting..." : "Request Print Access"}
              </Button>
            )}

            {isPending && (
              <Button disabled className="w-full sm:w-auto">
                Waiting for owner's approval...
              </Button>
            )}

            {isApproved && (
              <Button onClick={handleSecurePrint} disabled={actionLoading} className="w-full sm:w-auto">
                <Printer className="h-4 w-4" />
                {actionLoading ? "Opening secure print..." : "Secure Print"}
              </Button>
            )}
          </div>

          {message && (
            <p className={`text-center text-sm ${isRejected ? "text-rose-300" : "text-slate-400"}`}>
              {message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ShareDocument;
