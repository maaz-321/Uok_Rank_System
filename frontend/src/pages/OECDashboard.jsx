import { useMemo, useState } from "react";
import { Avatar, Badge, Box, Flex, Grid, HStack, Stack, Text } from "@chakra-ui/react";
import { ClipboardCheck, Lock, ShieldQuestion, Unlock, Users } from "lucide-react";
import AppShell from "../components/layout/AppShell";
import PageHeader from "../components/ui/PageHeader";
import SectionCard from "../components/ui/SectionCard";
import StatCard from "../components/ui/StatCard";
import FacultyDirectory from "../components/faculty/FacultyDirectory";
import FacultyDetailDrawer from "../components/faculty/FacultyDetailDrawer";
import { DepartmentBarChart, EditAccessChart, RoleDonutChart } from "../components/charts/PortalCharts";
import { Stagger } from "../components/ui/motion";
import { useFacultyData } from "../hooks/useFacultyData";
import { formatRelative, initials } from "../lib/format";
import { ROLE_META } from "../lib/constants";

export default function OECDashboard({ user }) {
  const { users, loading, stats, reload } = useFacultyData();
  const [inspecting, setInspecting] = useState(null);

  const departmentStats = useMemo(
    () =>
      stats.departmentList.map((item) => ({
        ...item,
        label: item.label.length > 16 ? `${item.label.slice(0, 15)}…` : item.label,
      })),
    [stats.departmentList],
  );

  const pendingVerification = users.filter((member) => member.role === "faculty").length;

  return (
    <AppShell>
      <PageHeader
        eyebrow={`Office oversight${user?.name ? ` · ${user.name}` : ""}`}
        title="OEC review desk"
        description="Audit submitted academic forms across departments, spot gaps in qualification data and export verified CVs for ranking dossiers."
        actions={
          <HStack gap={2} flexWrap="wrap">
            <Badge colorPalette="maroon" variant="subtle" borderRadius="full" px={3} py={1}>
              {ROLE_META.oec?.label ?? "OEC"}
            </Badge>
          </HStack>
        }
      />

      <Stagger display="grid" gridTemplateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" }} gap={4}>
        <StatCard
          label="Faculty on record"
          value={stats.total}
          hint="Accounts visible to the office"
          icon={Users}
          colorPalette="navy"
        />
        <StatCard
          label="Pending review"
          value={pendingVerification}
          hint="Faculty profiles awaiting a quality check"
          icon={ShieldQuestion}
          colorPalette="gold"
        />
        <StatCard
          label="Editable records"
          value={stats.unlocked}
          hint="Self-service updates enabled"
          icon={Unlock}
          colorPalette="green"
        />
        <StatCard
          label="Locked records"
          value={stats.locked}
          hint="Require QEC intervention"
          icon={Lock}
          colorPalette="red"
        />
      </Stagger>

      <Grid columns={{ base: 1, xl: 3 }} gap={4}>
        <Box gridColumn={{ xl: "span 2" }}>
          <DepartmentBarChart data={departmentStats} />
        </Box>
        <Stack gap={4}>
          <RoleDonutChart data={stats.roleList.filter((item) => item.value > 0)} />
          <EditAccessChart unlocked={stats.unlocked} locked={stats.locked} />
        </Stack>
      </Grid>

      <SectionCard
        title="Quality review queue"
        description="Inspect every submitted academic form and export the CV bundle"
        icon={ClipboardCheck}
        accent="maroon"
      >
        <FacultyDirectory
          data={users}
          loading={loading}
          onReload={reload}
          onInspect={setInspecting}
        />
      </SectionCard>

      <SectionCard title="Latest activity" description="Most recent account activity" icon={Users} accent="navy">
        {stats.recent.length === 0 ? (
          <Text fontSize="sm" color="fg.muted">
            No activity recorded yet.
          </Text>
        ) : (
          <Stack gap={3}>
            {stats.recent.map((member) => (
              <Flex key={member._id} align="center" gap={3}>
                <Avatar.Root size="sm" bg="maroon.subtle" color="maroon.fg">
                  <Avatar.Fallback fontWeight="bold">{initials(member.name)}</Avatar.Fallback>
                </Avatar.Root>
                <Stack gap={0} flex="1" minW={0}>
                  <Text fontSize="sm" fontWeight="semibold" color="fg" truncate>
                    {member.name}
                  </Text>
                  <Text fontSize="xs" color="fg.subtle" truncate>
                    {member.department || "Unassigned"} · {member.email}
                  </Text>
                </Stack>
                <Text fontSize="xs" color="fg.muted" whiteSpace="nowrap">
                  {formatRelative(member.createdAt)}
                </Text>
              </Flex>
            ))}
          </Stack>
        )}
      </SectionCard>

      <FacultyDetailDrawer
        user={inspecting}
        open={Boolean(inspecting)}
        onClose={() => setInspecting(null)}
      />
    </AppShell>
  );
}
