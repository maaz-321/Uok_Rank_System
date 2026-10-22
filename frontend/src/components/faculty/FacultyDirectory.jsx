import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Dialog,
  Flex,
  HStack,
  Portal,
  RadioGroup,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Download, Eye, FileText, Lock, ShieldCheck, Unlock } from "lucide-react";
import { toast } from "sonner";
import API, { downloadFile, extractApiError } from "../../api/axiosInstance";
import { ROLE_META, ROLE_OPTIONS } from "../../lib/constants";
import { formatDate, initials, safeFileName } from "../../lib/format";
import DataTable from "../ui/DataTable";
import RoleBadge, { LockBadge } from "../ui/RoleBadge";
import ConfirmDialog from "../ui/ConfirmDialog";

const DEPT_FILTER_ALL = "all";

export default function FacultyDirectory({
  canManage = false,
  onInspect,
  data,
  loading: loadingProp,
  onReload,
}) {
  const [internalUsers, setInternalUsers] = useState([]);
  const [internalLoading, setInternalLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [department, setDepartment] = useState(DEPT_FILTER_ALL);
  const [roleFilter, setRoleFilter] = useState("all");
  const [roleTarget, setRoleTarget] = useState(null);
  const [nextRole, setNextRole] = useState("faculty");
  const [confirmToggle, setConfirmToggle] = useState(null);
  const [working, setWorking] = useState(false);

  const isControlled = data !== undefined;
  const users = isControlled ? data : internalUsers;
  const loading = isControlled ? Boolean(loadingProp) : internalLoading;

  const load = useCallback(async () => {
    if (isControlled) {
      await onReload?.();
      return;
    }
    setInternalLoading(true);
    try {
      const res = await API.get("/admin/faculty-list");
      const list = Array.isArray(res.data) ? res.data : [];
      setInternalUsers(list);
    } catch (error) {
      toast.error("Could not load the faculty directory", {
        description: extractApiError(error),
      });
    } finally {
      setInternalLoading(false);
    }
  }, [isControlled, onReload]);

  useEffect(() => {
    if (!isControlled) load();
  }, [isControlled, load]);

  const departments = useMemo(
    () => [...new Set(users.map((user) => user.department).filter(Boolean))].sort(),
    [users],
  );

  const filtered = useMemo(
    () =>
      users.filter((user) => {
        const matchesDepartment = department === DEPT_FILTER_ALL || user.department === department;
        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        return matchesDepartment && matchesRole;
      }),
    [users, department, roleFilter],
  );

  const handleToggleEdit = async () => {
    if (!confirmToggle) return;
    setWorking(true);
    try {
      await API.put("/admin/toggle-edit", {
        userId: confirmToggle._id,
        allowEdit: !confirmToggle.isEditAllowed,
      });
      toast.success(
        confirmToggle.isEditAllowed
          ? `${confirmToggle.name} has been locked`
          : `${confirmToggle.name} can now edit their record`,
      );
      setConfirmToggle(null);
      await load();
    } catch (error) {
      toast.error("Permission update failed", { description: extractApiError(error) });
    } finally {
      setWorking(false);
    }
  };

  const handleRoleChange = async () => {
    if (!roleTarget) return;
    setWorking(true);
    try {
      await API.put("/admin/change-role", {
        targetUserId: roleTarget._id,
        newRole: nextRole,
      });
      toast.success(`${roleTarget.name} is now ${ROLE_META[nextRole]?.label ?? nextRole}`);
      setRoleTarget(null);
      await load();
    } catch (error) {
      toast.error("Role update failed", { description: extractApiError(error) });
    } finally {
      setWorking(false);
    }
  };

  const handleDownloadCV = async (user) => {
    setBusyId(user._id);
    try {
      await downloadFile(`/admin/download-cv/${user._id}`, `${safeFileName(user.name)}_Resume.pdf`);
      toast.success("CV downloaded");
    } catch (error) {
      toast.error("CV unavailable", {
        description: error?.message ?? "This faculty member has not submitted an academic form yet.",
      });
    } finally {
      setBusyId(null);
    }
  };

  const columns = useMemo(
    () => [
      {
        id: "name",
        header: "Faculty member",
        accessorKey: "name",
        cell: ({ row }) => (
          <HStack gap={3}>
            <Avatar.Root size="sm" bg="maroon.subtle" color="maroon.fg">
              <Avatar.Fallback fontWeight="bold">{initials(row.original.name)}</Avatar.Fallback>
            </Avatar.Root>
            <Stack gap={0}>
              <Text fontWeight="semibold" color="fg" fontSize="sm">
                {row.original.name}
              </Text>
              <Text fontSize="xs" color="fg.subtle">
                {row.original.email}
              </Text>
            </Stack>
          </HStack>
        ),
      },
      {
        id: "department",
        header: "Department",
        accessorKey: "department",
        cell: ({ getValue }) => (
          <Text fontSize="sm" color="fg.muted">
            {getValue() || "—"}
          </Text>
        ),
      },
      {
        id: "role",
        header: "Role",
        accessorKey: "role",
        cell: ({ getValue }) => <RoleBadge role={getValue()} />,
      },
      {
        id: "isEditAllowed",
        header: "Edit access",
        accessorKey: "isEditAllowed",
        cell: ({ getValue }) => <LockBadge isAllowed={Boolean(getValue())} />,
      },
      {
        id: "createdAt",
        header: "Registered",
        accessorKey: "createdAt",
        cell: ({ getValue }) => (
          <Text fontSize="sm" color="fg.muted">
            {formatDate(getValue())}
          </Text>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => (
          <HStack gap={1} justify="flex-end">
            <Button
              size="xs"
              variant="ghost"
              colorPalette="navy"
              onClick={(event) => {
                event.stopPropagation();
                onInspect?.(row.original);
              }}
            >
              <Eye size={14} />
              View
            </Button>
            <Button
              size="xs"
              variant="ghost"
              colorPalette="maroon"
              loading={busyId === row.original._id}
              onClick={(event) => {
                event.stopPropagation();
                handleDownloadCV(row.original);
              }}
            >
              <Download size={14} />
              CV
            </Button>
            {canManage && (
              <>
                <Button
                  size="xs"
                  variant="ghost"
                  colorPalette={row.original.isEditAllowed ? "red" : "green"}
                  onClick={(event) => {
                    event.stopPropagation();
                    setConfirmToggle(row.original);
                  }}
                >
                  {row.original.isEditAllowed ? <Lock size={14} /> : <Unlock size={14} />}
                  {row.original.isEditAllowed ? "Lock" : "Unlock"}
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  colorPalette="gold"
                  onClick={(event) => {
                    event.stopPropagation();
                    setRoleTarget(row.original);
                    setNextRole(row.original.role ?? "faculty");
                  }}
                >
                  <ShieldCheck size={14} />
                  Role
                </Button>
              </>
            )}
          </HStack>
        ),
        meta: { align: "right" },
      },
    ],
    [busyId, canManage, onInspect],
  );

  return (
    <Stack gap={4}>
      <Flex gap={3} wrap="wrap" align="center">
        <HStack gap={2} wrap="wrap">
          <Button
            size="sm"
            variant={department === DEPT_FILTER_ALL ? "solid" : "outline"}
            colorPalette="navy"
            onClick={() => setDepartment(DEPT_FILTER_ALL)}
          >
            All departments
          </Button>
          {departments.map((item) => (
            <Button
              key={item}
              size="sm"
              variant={department === item ? "solid" : "outline"}
              colorPalette="navy"
              onClick={() => setDepartment(item)}
            >
              {item}
            </Button>
          ))}
        </HStack>

        <HStack gap={2} ml="auto" wrap="wrap">
          {["all", ...ROLE_OPTIONS.map((option) => option.value)].map((role) => (
            <Button
              key={role}
              size="sm"
              variant={roleFilter === role ? "solid" : "outline"}
              colorPalette="maroon"
              onClick={() => setRoleFilter(role)}
            >
              {role === "all" ? "All roles" : (ROLE_META[role]?.shortLabel ?? role)}
            </Button>
          ))}
        </HStack>
      </Flex>

      <DataTable
        data={filtered}
        columns={columns}
        searchKeys={["name", "email", "department"]}
        searchPlaceholder="Search by name, email or department..."
        initialPageSize={8}
        emptyIcon={FileText}
        emptyTitle={loading ? "Loading faculty directory..." : "No faculty found"}
        emptyDescription="Adjust the department or role filters, or search by name or email."
        onRowClick={(user) => onInspect?.(user)}
      />

      <ConfirmDialog
        open={Boolean(confirmToggle)}
        onClose={() => setConfirmToggle(null)}
        onConfirm={handleToggleEdit}
        loading={working}
        colorPalette={confirmToggle?.isEditAllowed ? "red" : "green"}
        title={confirmToggle?.isEditAllowed ? "Lock this record?" : "Unlock this record?"}
        description={
          confirmToggle?.isEditAllowed
            ? `${confirmToggle?.name} will no longer be able to edit their personal or academic details. They will be emailed automatically.`
            : `${confirmToggle?.name} will regain the ability to edit their personal and academic details. They will be emailed automatically.`
        }
        confirmLabel={confirmToggle?.isEditAllowed ? "Lock record" : "Unlock record"}
      />

      <Dialog.Root
        open={Boolean(roleTarget)}
        onOpenChange={(details) => {
          if (!details.open) setRoleTarget(null);
        }}
        placement="center"
        motionPreset="scale"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content borderRadius="xl" borderWidth="1px" borderColor="border" bg="bg.panel" maxW="md">
              <Dialog.Header>
                <Dialog.Title fontFamily="heading" fontWeight="bold" color="fg">
                  Change portal role
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Text fontSize="sm" color="fg.muted" mb={4}>
                  Update the access level for <Text as="span" fontWeight="bold" color="fg">{roleTarget?.name}</Text>.
                  The role takes effect the next time they sign in.
                </Text>
                <RadioGroup.Root
                  value={nextRole}
                  onValueChange={(details) => setNextRole(details.value)}
                >
                  <Stack gap={3}>
                    {ROLE_OPTIONS.map((option) => (
                      <RadioGroup.Item
                        key={option.value}
                        value={option.value}
                        borderWidth="1px"
                        borderColor="border"
                        borderRadius="lg"
                        p={3}
                      >
                        <RadioGroup.ItemHiddenInput />
                        <RadioGroup.ItemControl />
                        <RadioGroup.ItemText>
                          <Stack gap={0.5}>
                            <Text fontWeight="semibold" color="fg" fontSize="sm">
                              {option.label}
                            </Text>
                            <Text fontSize="xs" color="fg.muted">
                              {option.description}
                            </Text>
                          </Stack>
                        </RadioGroup.ItemText>
                      </RadioGroup.Item>
                    ))}
                  </Stack>
                </RadioGroup.Root>
              </Dialog.Body>
              <Dialog.Footer gap={3}>
                <Button variant="outline" onClick={() => setRoleTarget(null)} disabled={working}>
                  Cancel
                </Button>
                <Button colorPalette="maroon" onClick={handleRoleChange} loading={working} loadingText="Updating...">
                  Update role
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Stack>
  );
}
