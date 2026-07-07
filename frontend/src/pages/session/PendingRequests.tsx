import React, { useEffect, useState } from "react";
import { CheckCircle2, Clock3, ShieldAlert, XCircle } from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/ui/PageHeader";
import { Table, Td, Th } from "../../components/ui/Table";

type PendingRequest = {
  sessionId: string;
  documentName: string;
  documentId: string;
  createdAt: string;
  requestTime?: string;
  requestTimestamp?: string;
  fingerprint?: string;
  deviceFingerprint?: string;
  deviceInfo?: any;
  browser?: string;
  operatingSystem?: string;
  deviceType?: string;
  ipAddress?: string;
  status: string;
};

const PendingRequests: React.FC = () => {
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingSessionId, setProcessingSessionId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<"approve" | "reject" | null>(null);

  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get("/session/pending");
      setRequests(res.data.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load pending requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!mounted) return;
      await fetchPendingRequests();
    };

    load();
    const interval = window.setInterval(load, 5000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  const approveRequest = async (sessionId: string) => {
    setProcessingSessionId(sessionId);
    setProcessingAction("approve");

    try {
      await api.post(`/session/${sessionId}/approve`);
      toast.success("Request approved");
      await fetchPendingRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve request");
    } finally {
      setProcessingSessionId(null);
      setProcessingAction(null);
    }
  };

  const rejectRequest = async (sessionId: string) => {
    setProcessingSessionId(sessionId);
    setProcessingAction("reject");

    try {
      await api.post(`/session/${sessionId}/reject`);
      toast.success("Request rejected");
      await fetchPendingRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reject request");
    } finally {
      setProcessingSessionId(null);
      setProcessingAction(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Approval queue"
        title="Pending Requests"
        description="Review incoming document access requests and approve or reject secure print sessions."
        icon={<ShieldAlert className="h-4 w-4" />}
        tone="amber"
        actions={<Badge tone="amber"><Clock3 className="h-4 w-4" />{requests.length} pending</Badge>}
      />

      <Card className="overflow-hidden">
        <Table>
          <thead className="bg-slate-950/70">
            <tr>
              <Th>Document Name</Th>
              <Th>Document ID</Th>
              <Th>Request Time</Th>
              <Th>Browser</Th>
              <Th>Operating System</Th>
              <Th>Device Type</Th>
              <Th>Fingerprint</Th>
              <Th>IP Address</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <Td colSpan={9} className="py-10 text-center">Loading requests...</Td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <Td colSpan={9} className="py-10 text-center">No pending requests</Td>
              </tr>
            ) : (
              requests.map((request) => (
                <tr key={request.sessionId} className="border-t border-white/10 transition hover:bg-white/[0.04]">
                  <Td className="font-medium text-slate-100">{request.documentName}</Td>
                  <Td>{request.documentId}</Td>
                  <Td>{new Date(request.requestTimestamp || request.requestTime || request.createdAt).toLocaleString()}</Td>
                  <Td>{request.browser || request.deviceInfo?.browser || ""}</Td>
                  <Td>{request.operatingSystem || request.deviceInfo?.operatingSystem || ""}</Td>
                  <Td>{request.deviceType || request.deviceInfo?.deviceType || ""}</Td>
                  <Td>{request.fingerprint || request.deviceFingerprint || ""}</Td>
                  <Td>{request.ipAddress || ""}</Td>
                  <Td>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="success"
                        onClick={() => approveRequest(request.sessionId)}
                        disabled={processingSessionId === request.sessionId && processingAction === "approve"}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {processingSessionId === request.sessionId && processingAction === "approve" ? "Approving..." : "Approve"}
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => rejectRequest(request.sessionId)}
                        disabled={processingSessionId === request.sessionId && processingAction === "reject"}
                      >
                        <XCircle className="h-4 w-4" />
                        {processingSessionId === request.sessionId && processingAction === "reject" ? "Rejecting..." : "Reject"}
                      </Button>
                    </div>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
};

export default PendingRequests;
