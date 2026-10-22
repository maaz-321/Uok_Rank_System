import { useMemo, useState } from "react";
import { Grid, HStack, Stack, Text } from "@chakra-ui/react";
import { GraduationCap, Lock, TrendingUp, Unlock, Users } from "lucide-react";
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
import { Avatar, Badge, Box, Flex } from "@chakra-ui/react";

export default function ChairmanDashboard({ user }) {
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

  return (
    <AppShell>
      <PageHeader
        eyebrow="Departmental oversight"
        title={`Chairman's console`}
        description={`Monitor faculty academic records, completeness and edit access across ${user?.department ?? "your department"}.`}
        actions={
          <HStack gap={2} flexWrap="wrap">
            <Badge colorPalette="navy" variant="subtle" borderRadius="full" px={3} py={1}>
              {stats.total} registered
            </Badge>
          </HStack>
        }
      />

      <Stagger display="grid" gridTemplateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" }} gap={4}>
        <StatCard
          label="Faculty on record"
          value={stats.total}
          hint="All registered portal accounts"
          icon={Users}
          colorPalette="navy"
        />
        <StatCard
          label="Records unlocked"
          value={stats.unlocked}
          hint="Can update their own details"
          icon={Unlock}
          colorPalette="green"
        />
        <StatCard
          label="Records locked"
          value={stats.locked}
          hint="Read-only until QEC restores access"
          icon={Lock}
          colorPalette="red"
        />
        <StatCard
          label="Departments"
          value={stats.departmentList.length}
          hint="Active teaching departments"
          icon={TrendingUp}
          colorPalette="maroon"
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
        title="Faculty directory"
        description="Review records, inspect qualifications and download verified CVs"
        icon={GraduationCap}
        accent="navy"
      >
        <FacultyDirectory
          data={users}
          loading={loading}
          onReload={reload}
          onInspect={setInspecting}
        />
      </SectionCard>

      <SectionCard title="Recently registered" description="Latest accounts created in the portal" icon={Users} accent="maroon">
        {stats.recent.length === 0 ? (
          <Text fontSize="sm" color="fg.muted">
            No registrations yet.
          </Text>
        ) : (
          <Stack gap={3}>
            {stats.recent.map((member) => (
              <Flex key={member._id} align="center" gap={3}>
                <Avatar.Root size="sm" bg="navy.subtle" color="navy.fg">
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
