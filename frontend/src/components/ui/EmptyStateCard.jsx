import { Box, EmptyState, Stack, Text } from "@chakra-ui/react";
import { SearchX } from "lucide-react";

export default function EmptyStateCard({ icon: Icon = SearchX, title, description, action, compact = false }) {
  return (
    <Box
      position="relative"
      borderWidth="1px"
      borderStyle="dashed"
      borderColor="border"
      borderRadius="xl"
      bg="bg.subtle"
      py={compact ? 8 : 14}
      px={6}
      className="uok-grid-bg"
    >
      <EmptyState.Root>
        <EmptyState.Indicator>
          <Box
            display="grid"
            placeItems="center"
            w="56px"
            h="56px"
            borderRadius="full"
            bg="maroon.subtle"
            color="maroon.fg"
          >
            <Icon size={24} />
          </Box>
        </EmptyState.Indicator>
        <Stack gap={1.5} align="center" textAlign="center">
          <EmptyState.Title>
            <Text fontFamily="heading" fontWeight="bold" color="fg">
              {title}
            </Text>
          </EmptyState.Title>
          {description && (
            <EmptyState.Description>
              <Text color="fg.muted" fontSize="sm" maxW="46ch">
                {description}
              </Text>
            </EmptyState.Description>
          )}
          {action}
        </Stack>
      </EmptyState.Root>
    </Box>
  );
}
