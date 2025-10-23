import React, { useCallback, useMemo, useRef, useState } from "react";
import { createColumnHelper, Row } from "@tanstack/react-table";

import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  Modal,
  Row as BRow,
  Table as BTable,
} from "react-bootstrap";
import {
  BsTrash,
  BsDownload,
  BsUpload,
  BsArrowLeft,
  BsExclamationTriangle,
  BsSearch,
} from "react-icons/bs";
import { useNavigate } from "react-router-dom";

type Role = { id: number; name: string };
type Participant = {
  id: number;
  name: string;
  full_name: string;
  email: string;
  role: Role;
  parent: { id: number | null; name: string | null };
  handle?: string | null;
};

const columnHelper = createColumnHelper<Participant>();

const ALL_ROLES: Role[] = [
  { id: 1, name: "Participant" },
  { id: 2, name: "Mentor" },
  { id: 3, name: "Reader" },
  { id: 4, name: "Reviewer" },
  { id: 5, name: "Submitter" },
];

const initialParticipants: Participant[] = [
  {
    id: 1,
    name: "tjbrown8",
    full_name: "Brown, Taylor",
    email: "taylor.brown@example.edu",
    role: ALL_ROLES[0],
    parent: { id: 101, name: "efg" },
    handle: "taylorb",
  },
  {
    id: 2,
    name: "jdoe3",
    full_name: "Doe, Jane",
    email: "jane.doe@example.edu",
    role: ALL_ROLES[4],
    parent: { id: 102, name: "abz" },
    handle: "",
  },
  {
    id: 3,
    name: "sblack9",
    full_name: "Black, Sam",
    email: "sam.black@example.edu",
    role: ALL_ROLES[3],
    parent: { id: 103, name: "efg" },
  },
  {
    id: 4,
    name: "rgreen5",
    full_name: "Green, Riley",
    email: "riley.green@example.edu",
    role: ALL_ROLES[0],
    parent: { id: 104, name: "mno" },
    handle: "rgreen",
  },
  {
    id: 5,
    name: "mwhite7",
    full_name: "White, Morgan",
    email: "morgan.white@example.edu",
    role: ALL_ROLES[2],
    parent: { id: 105, name: "abz" },
  },
];

const prettyName = (full: string) => {
  const parts = full.split(",").map((s) => s.trim());
  if (parts.length >= 2) return `${parts[1]} ${parts[0]}`;
  return full;
};

const ParticipantsDemo: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  const [requireQuiz] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [alert, setAlert] = useState<{
    variant: "success" | "info" | "danger";
    message: string;
  } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    participant: Participant | null;
  }>({
    show: false,
    participant: null,
  });
  const navigate = useNavigate();
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const closeAlert = useCallback(() => setAlert(null), []);
  const showInfo = useCallback((message: string) => setAlert({ variant: "info", message }), []);
  const showSuccess = useCallback(
    (message: string) => setAlert({ variant: "success", message }),
    []
  );
  const showError = useCallback((message: string) => setAlert({ variant: "danger", message }), []);

  const onRoleChange = useCallback(
    (id: number, newRoleId: number) => {
      const r = ALL_ROLES.find((x) => x.id === newRoleId) ?? ALL_ROLES[0];
      setParticipants((prev) => prev.map((p) => (p.id === id ? { ...p, role: r } : p)));
      showSuccess("Role updated successfully");
    },
    [showSuccess]
  );

  const onRemoveClick = useCallback((participant: Participant) => {
    setDeleteModal({ show: true, participant });
  }, []);

  const onConfirmDelete = useCallback(() => {
    if (deleteModal.participant) {
      setParticipants((prev) => prev.filter((p) => p.id !== deleteModal.participant!.id));
      showSuccess(`${deleteModal.participant.name} removed successfully`);
    }
    setDeleteModal({ show: false, participant: null });
  }, [deleteModal.participant, showSuccess]);

  const onCancelDelete = useCallback(() => {
    setDeleteModal({ show: false, participant: null });
  }, []);

  const onCopyFromCourse = useCallback(() => {
    showInfo("Copy from course triggered");
  }, [showInfo]);

  const onCopyToCourse = useCallback(() => {
    showInfo("Copy to course triggered");
  }, [showInfo]);

  const onImportClick = useCallback(() => importInputRef.current?.click(), []);
  const onBack = useCallback(() => navigate(-1), [navigate]);

  const onImportFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      try {
        const file = e.target.files?.[0];
        if (!file) return;
        const text = await file.text();
        const lines = text
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean);
        if (lines.length === 0) return;
        let start = 0;
        const header = lines[0].toLowerCase();
        if (header.includes("username") || header.includes("email")) start = 1;
        const nextId = (arr: Participant[]) =>
          arr.length ? Math.max(...arr.map((p) => p.id)) + 1 : 1;
        const added: Participant[] = [];
        for (let i = start; i < lines.length; i++) {
          const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
          const [
            username = "",
            fullName = "",
            email = "",
            parentName = "",
            handle = "",
            roleName = "Participant",
          ] = cols;
          const role =
            ALL_ROLES.find((r) => r.name.toLowerCase() === roleName.toLowerCase()) ?? ALL_ROLES[0];
          added.push({
            id: 0,
            name: username || `user${i}`,
            full_name: fullName || "Last, First",
            email: email || `user${i}@example.edu`,
            role,
            parent: { id: null, name: parentName || null },
            handle,
          });
        }
        setParticipants((prev) => {
          const baseId = nextId(prev);
          const numbered = added.map((p, idx) => ({ ...p, id: baseId + idx }));
          return [...prev, ...numbered];
        });
        showSuccess(`Imported ${added.length} participants`);
      } catch {
        showError("Import failed");
      } finally {
        e.target.value = "";
      }
    },
    [showError, showSuccess]
  );

  const onExport = useCallback(() => {
    const rows = participants;
    const headers = ["Username", "Name", "Email", "Parent", "Handle", "Role"];
    const csvRows = [headers.join(",")];
    rows.forEach((r) => {
      const row = [
        r.name ?? "",
        prettyName(r.full_name ?? ""),
        r.email ?? "",
        r.parent?.name ?? "",
        r.handle ?? "",
        r.role?.name ?? "",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",");
      csvRows.push(row);
    });
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "participants.csv";
    a.click();
    URL.revokeObjectURL(url);
    showSuccess("Exported successfully");
  }, [participants, showSuccess]);

  const filteredParticipants = useMemo(() => {
    if (!searchValue.trim()) return participants;
    const search = searchValue.toLowerCase();
    return participants.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.full_name.toLowerCase().includes(search) ||
        p.email.toLowerCase().includes(search) ||
        (p.handle && p.handle.toLowerCase().includes(search)) ||
        (p.parent?.name && p.parent.name.toLowerCase().includes(search))
    );
  }, [participants, searchValue]);

  const columns = useMemo(() => {
    return [
      columnHelper.accessor("name", {
        id: "username",
        header: "Username",
        cell: ({ row }) => (
          <div style={{ fontWeight: 600, color: "#1a202c", fontSize: "0.875rem" }}>
            {row.original.name}
          </div>
        ),
        enableSorting: true,
      }),
      columnHelper.accessor("full_name", {
        id: "name",
        header: "Name",
        cell: ({ row }) => {
          const handle = row.original.handle?.trim();
          return (
            <div>
              <div style={{ color: "#2d3748", fontSize: "0.875rem", fontWeight: 500 }}>
                {prettyName(row.original.full_name ?? "")}
              </div>
              {handle && (
                <div style={{ color: "#a0aec0", fontSize: "0.75rem", marginTop: "0.15rem" }}>
                  @{handle}
                </div>
              )}
            </div>
          );
        },
        enableSorting: true,
      }),
      columnHelper.accessor("email", {
        header: "Email",
        cell: ({ getValue }) => (
          <span style={{ color: "#718096", fontSize: "0.8rem" }}>{getValue() ?? ""}</span>
        ),
        enableSorting: true,
      }),
      columnHelper.accessor((row) => row.parent?.name ?? "", {
        id: "parent",
        header: "Parent",
        cell: ({ getValue }) => (
          <span style={{ color: "#a0aec0", fontSize: "0.8rem" }}>{getValue() || "—"}</span>
        ),
        enableSorting: true,
      }),
      columnHelper.display({
        id: "actions_available",
        header: "Actions",
        cell: () => (
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            <Badge
              bg="success"
              style={{
                fontSize: "0.7rem",
                padding: "0.3rem 0.6rem",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.2rem",
                borderRadius: "0.375rem",
              }}
            >
              Submit
            </Badge>
            <Badge
              bg="info"
              style={{
                fontSize: "0.7rem",
                padding: "0.3rem 0.6rem",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.2rem",
                borderRadius: "0.375rem",
              }}
            >
              Review
            </Badge>
            {requireQuiz && (
              <Badge
                bg="warning"
                style={{
                  fontSize: "0.7rem",
                  padding: "0.3rem 0.6rem",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.2rem",
                  borderRadius: "0.375rem",
                }}
              >
                Quiz
              </Badge>
            )}
          </div>
        ),
        enableSorting: false,
      }),
      columnHelper.display({
        id: "participant_role",
        header: "Role",
        cell: ({ row }) => (
          <Form.Select
            size="sm"
            aria-label="Participant Role"
            value={row.original.role?.id}
            onChange={(e) => onRoleChange(row.original.id, parseInt(e.target.value, 10))}
            style={{
              fontSize: "0.8rem",
              padding: "0.35rem 0.6rem",
              minWidth: "120px",
              cursor: "pointer",
              border: "1px solid #cbd5e0",
              borderRadius: "0.375rem",
              fontWeight: 500,
              color: "#2d3748",
            }}
          >
            {ALL_ROLES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Form.Select>
        ),
        enableSorting: false,
      }),
      columnHelper.display({
        id: "action_remove",
        header: "Action",
        cell: ({ row }: { row: Row<Participant> }) => (
          <Button
            variant="outline-danger"
            size="sm"
            title="Remove participant"
            onClick={() => onRemoveClick(row.original)}
            style={{
              padding: "0.35rem 0.6rem",
              fontSize: "0.875rem",
              borderRadius: "0.375rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BsTrash size={14} />
          </Button>
        ),
        enableSorting: false,
      }),
    ];
  }, [onRemoveClick, onRoleChange, requireQuiz]);

  return (
    <>
      <div
        style={{
          backgroundColor: "#f7fafc",
          minHeight: "100vh",
          paddingTop: "1.5rem",
          paddingBottom: "2rem",
        }}
      >
        <Container fluid style={{ maxWidth: "1600px" }}>
          <BRow className="mb-3">
            <Col>
              <h1
                style={{
                  fontSize: "1.875rem",
                  fontWeight: 700,
                  color: "#1a202c",
                  marginBottom: "0.25rem",
                }}
              >
                Manage Participants
              </h1>
              <p style={{ color: "#718096", fontSize: "0.9rem", marginBottom: 0 }}>
                View and manage assignment participants
              </p>
            </Col>
          </BRow>

          {alert && (
            <BRow className="mb-3">
              <Col>
                <Alert
                  variant={alert.variant}
                  onClose={closeAlert}
                  dismissible
                  style={{
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                    padding: "0.875rem 1.25rem",
                    border: "none",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  {alert.message}
                </Alert>
              </Col>
            </BRow>
          )}

          <BRow className="mb-3">
            <Col>
              <Card
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "0.75rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  backgroundColor: "#ffffff",
                }}
              >
                <Card.Body style={{ padding: "1.25rem" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "1rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.625rem",
                        alignItems: "center",
                        flex: "1 1 auto",
                      }}
                    >
                      <div
                        style={{
                          position: "relative",
                          minWidth: "300px",
                          maxWidth: "450px",
                          flex: "1 1 auto",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            pointerEvents: "none",
                          }}
                        >
                          <BsSearch size={16} style={{ color: "#9aa5b1" }} />
                        </div>
                        <Form.Control
                          type="text"
                          placeholder="Search participants..."
                          value={searchValue}
                          onChange={(e) => setSearchValue(e.target.value)}
                          style={{
                            paddingLeft: "44px",
                            fontSize: "0.9rem",
                            borderRadius: "0.6rem",
                            border: "1px solid #e2e8f0",
                            height: "40px",
                            boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
                          }}
                        />
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={onCopyFromCourse}
                        style={{
                          fontSize: "0.8125rem",
                          padding: "0.5rem 1rem",
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          borderRadius: "0.5rem",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                        }}
                      >
                        <BsDownload size={14} />
                        Copy from Course
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={onCopyToCourse}
                        style={{
                          fontSize: "0.8125rem",
                          padding: "0.5rem 1rem",
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          borderRadius: "0.5rem",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                        }}
                      >
                        <BsUpload size={14} />
                        Copy to Course
                      </Button>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={onImportClick}
                        style={{
                          fontSize: "0.8125rem",
                          padding: "0.5rem 1rem",
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          borderRadius: "0.5rem",
                        }}
                      >
                        <BsUpload size={14} />
                        Import CSV
                      </Button>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={onExport}
                        style={{
                          fontSize: "0.8125rem",
                          padding: "0.5rem 1rem",
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          borderRadius: "0.5rem",
                        }}
                      >
                        <BsDownload size={14} />
                        Export CSV
                      </Button>
                    </div>
                    <Button
                      variant="outline-dark"
                      size="sm"
                      onClick={onBack}
                      style={{
                        fontSize: "0.8125rem",
                        padding: "0.5rem 1rem",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        borderRadius: "0.5rem",
                      }}
                    >
                      <BsArrowLeft size={14} />
                      Back
                    </Button>
                  </div>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    ref={importInputRef}
                    onChange={onImportFileChange}
                    style={{ display: "none" }}
                  />
                </Card.Body>
              </Card>
            </Col>
          </BRow>

          <BRow>
            <Col>
              <Card
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "0.75rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  overflow: "hidden",
                  backgroundColor: "#ffffff",
                }}
              >
                <div className="table-responsive" style={{ padding: "1rem" }}>
                  <BTable className="table table-sm table-striped table-hover align-middle">
                    <thead
                      style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e5e7eb" }}
                    >
                      <tr>
                        <th style={{ color: "#111827", fontWeight: 700 }}>Username</th>
                        <th style={{ color: "#111827", fontWeight: 700 }}>Name</th>
                        <th style={{ color: "#111827", fontWeight: 700 }}>Email</th>
                        <th style={{ color: "#111827", fontWeight: 700 }}>Parent</th>
                        <th style={{ color: "#111827", fontWeight: 700 }}>Actions</th>
                        <th style={{ color: "#111827", fontWeight: 700 }}>Role</th>
                        <th style={{ color: "#111827", fontWeight: 700 }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredParticipants.map((p) => (
                        <tr key={p.id}>
                          <td>
                            <div
                              style={{ fontWeight: 600, color: "#1a202c", fontSize: "0.875rem" }}
                            >
                              {p.name}
                            </div>
                          </td>
                          <td>
                            <div
                              style={{ color: "#2d3748", fontSize: "0.875rem", fontWeight: 500 }}
                            >
                              {prettyName(p.full_name ?? "")}
                            </div>
                            {p.handle?.trim() && (
                              <div
                                style={{
                                  color: "#a0aec0",
                                  fontSize: "0.75rem",
                                  marginTop: "0.15rem",
                                }}
                              >
                                @{p.handle}
                              </div>
                            )}
                          </td>
                          <td>
                            <span style={{ color: "#718096", fontSize: "0.8rem" }}>
                              {p.email ?? ""}
                            </span>
                          </td>
                          <td>
                            <span style={{ color: "#a0aec0", fontSize: "0.8rem" }}>
                              {p.parent?.name || "—"}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                              <Badge bg="primary" className="rounded-pill px-3 py-1 fw-semibold">
                                Submit
                              </Badge>
                              <Badge bg="primary" className="rounded-pill px-3 py-1 fw-semibold">
                                Review
                              </Badge>
                              {requireQuiz && (
                                <Badge bg="primary" className="rounded-pill px-3 py-1 fw-semibold">
                                  Quiz
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td style={{ minWidth: 140 }}>
                            <Form.Select
                              size="sm"
                              aria-label="Participant Role"
                              value={p.role?.id}
                              onChange={(e) => onRoleChange(p.id, parseInt(e.target.value, 10))}
                              style={{
                                fontSize: "0.8rem",
                                padding: "0.35rem 0.6rem",
                                cursor: "pointer",
                                border: "1px solid #cbd5e0",
                                borderRadius: "0.375rem",
                                fontWeight: 500,
                                color: "#2d3748",
                              }}
                            >
                              {ALL_ROLES.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.name}
                                </option>
                              ))}
                            </Form.Select>
                          </td>
                          <td>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              title="Remove participant"
                              onClick={() => onRemoveClick(p)}
                              style={{
                                padding: "0.35rem 0.6rem",
                                fontSize: "0.875rem",
                                borderRadius: "0.375rem",
                              }}
                            >
                              <BsTrash size={14} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </BTable>
                </div>
              </Card>
            </Col>
          </BRow>
        </Container>
      </div>

      <Modal
        show={deleteModal.show}
        onHide={onCancelDelete}
        centered
        style={{
          backdropFilter: "blur(2px)",
        }}
      >
        <Modal.Header
          closeButton
          style={{
            border: "none",
            paddingBottom: "0.5rem",
            backgroundColor: "#fff5f5",
          }}
        >
          <Modal.Title
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "#c53030",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <BsExclamationTriangle size={24} />
            Confirm Delete
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "1.5rem", backgroundColor: "#fff5f5" }}>
          <p style={{ fontSize: "0.9375rem", color: "#2d3748", marginBottom: "0.5rem" }}>
            Are you sure you want to remove{" "}
            <strong style={{ color: "#1a202c" }}>{deleteModal.participant?.name}</strong>?
          </p>
          <p style={{ fontSize: "0.875rem", color: "#718096", marginBottom: 0 }}>
            This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer
          style={{ border: "none", padding: "1rem 1.5rem", backgroundColor: "#fff5f5" }}
        >
          <Button
            variant="outline-secondary"
            onClick={onCancelDelete}
            style={{
              fontSize: "0.875rem",
              padding: "0.5rem 1.25rem",
              fontWeight: 600,
              borderRadius: "0.5rem",
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirmDelete}
            style={{
              fontSize: "0.875rem",
              padding: "0.5rem 1.25rem",
              fontWeight: 600,
              borderRadius: "0.5rem",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ParticipantsDemo;
