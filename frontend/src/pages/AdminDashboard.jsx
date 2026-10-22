import { useMemo, useState } from "react";
import { Box, Grid, Stack } from "@chakra-ui/react";
import { KeyRound, ShieldCheck, Unlock, UserCog, Users } from "lucide-react";
import AppShell from "../components/layout/AppShell";
import PageHeader from "../components/ui/PageHeader";
import SectionCard from "../components/ui/SectionCard";
import StatCard from "../components/ui/StatCard";
import FacultyDirectory from "../components/faculty/FacultyDirectory";
import FacultyDetailDrawer from "../components/faculty/FacultyDetailDrawer";
import { DepartmentBarChart, EditAccessChart, RoleDonutChart } from "../components/charts/PortalCharts";
import { Stagger } from "../components/ui/motion";
import { useFacultyData } from "../hooks/useFacultyData";

export default function AdminDashboard({ user }) {
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

  const administrators = stats.roleList
    .filter((item) => item.label !== "faculty")
    .reduce((sum, item) => sum + item.value, 0);

  return (
    <AppShell>
      <PageHeader
        eyebrow={`Quality Enhancement Cell${user?.name ? ` · ${user.name}` : ""}`}
        title="Portal administration"
        description="Full control over faculty accounts, edit permissions and portal roles. Every permission change is emailed to the affected member."
      />

      <Stagger display="grid" gridTemplateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" }} gap={4}>
        <StatCard
          label="Registered faculty"
          value={stats.total}
          hint="All portal accounts"
          icon={Users}
          colorPalette="navy"
        />
        <StatCard
          label="Elevated roles"
          value={administrators}
          hint="Chairmen, OEC and QEC members"
          icon={UserCog}
          colorPalette="maroon"
        />
        <StatCard
          label="Unlocked records"
          value={stats.unlocked}
          hint="Self-service editing enabled"
          icon={Unlock}
          colorPalette="green"
        />
        <StatCard
          label="Departments"
          value={stats.departmentList.length}
          hint="Represented in the portal"
          icon={KeyRound}
          colorPalette="gold"
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
        title="Account & permission management"
        description="Lock or unlock records, promote roles and export verified CVs"
        icon={ShieldCheck}
        accent="maroon"
      >
        <FacultyDirectory
          canManage
          data={users}
          loading={loading}
          onReload={reload}
          onInspect={setInspecting}
        />
      </SectionCard>

      <FacultyDetailDrawer
        user={inspecting}
        open={Boolean(inspecting)}
        onClose={() => setInspecting(null)}
      />
    </AppShell>
  );
}
