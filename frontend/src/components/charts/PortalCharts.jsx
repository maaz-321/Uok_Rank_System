import { Box, Card, Flex, HStack, Stack, Text } from "@chakra-ui/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PALETTE = ["#800000", "#d4af37", "#1a365d", "#a93333", "#2d568c", "#86691d"];

function ChartCard({ title, description, children, height = 280, action }) {
  return (
    <Card.Root
      variant="outline"
      borderColor="border"
      bg="bg.panel"
      borderRadius="xl"
      h="full"
      overflow="hidden"
    >
      <Card.Header px={{ base: 4, md: 5 }} pt={{ base: 4, md: 5 }} pb={2}>
        <Flex align="center" justify="space-between" gap={3}>
          <Stack gap={0.5}>
            <Text fontFamily="heading" fontWeight="bold" color="fg" fontSize="md">
              {title}
            </Text>
            {description && (
              <Text fontSize="xs" color="fg.muted">
                {description}
              </Text>
            )}
          </Stack>
          {action}
        </Flex>
      </Card.Header>
      <Card.Body px={{ base: 2, md: 4 }} pb={{ base: 4, md: 5 }}>
        <Box h={`${height}px`} w="full">
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        </Box>
      </Card.Body>
    </Card.Root>
  );
}

export function DepartmentBarChart({ data }) {
  return (
    <ChartCard
      title="Faculty distribution"
      description="Registered faculty members per department"
      height={300}
    >
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: -18 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip cursor={{ fill: "rgba(128,0,0,0.06)" }} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={42}>
          {data.map((entry, index) => (
            <Cell key={entry.label} fill={PALETTE[index % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ChartCard>
  );
}

export function RoleDonutChart({ data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <ChartCard title="Role allocation" description="How portal roles are distributed" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          innerRadius="55%"
          outerRadius="82%"
          paddingAngle={3}
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={entry.label} fill={PALETTE[index % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => (
            <Text as="span" fontSize="xs" color="fg.muted">
              {value}
            </Text>
          )}
        />
      </PieChart>
      <Box position="absolute" pointerEvents="none" display="none" data-total={total} />
    </ChartCard>
  );
}

export function EditAccessChart({ unlocked, locked }) {
  const data = [
    { label: "Unlocked", value: unlocked },
    { label: "Locked", value: locked },
  ];

  return (
    <ChartCard title="Edit permission" description="Faculty record edit access" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          innerRadius="58%"
          outerRadius="85%"
          paddingAngle={4}
          stroke="none"
        >
          <Cell fill="#16a34a" />
          <Cell fill="#dc2626" />
        </Pie>
        <Tooltip />
        <Legend
          verticalAlign="bottom"
          height={32}
          formatter={(value) => (
            <Text as="span" fontSize="xs" color="fg.muted">
              {value}
            </Text>
          )}
        />
      </PieChart>
    </ChartCard>
  );
}

export function ChartLegend({ items }) {
  return (
    <HStack gap={4} wrap="wrap">
      {items.map((item) => (
        <HStack key={item.label} gap={2}>
          <Box boxSize="10px" borderRadius="full" bg={item.color} />
          <Text fontSize="xs" color="fg.muted">
            {item.label}
          </Text>
        </HStack>
      ))}
    </HStack>
  );
}
