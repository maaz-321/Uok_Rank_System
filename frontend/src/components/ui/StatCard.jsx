import { Box, Card, HStack, Stack, Text } from "@chakra-ui/react";
import { StaggerItem } from "./motion";

export default function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  colorPalette = "maroon",
  trend,
}) {
  return (
    <StaggerItem h="full">
      <Card.Root
        variant="outline"
        borderColor="border"
        bg="bg.panel"
        borderRadius="xl"
        h="full"
        position="relative"
        overflow="hidden"
        transition="transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease"
        _hover={{
          transform: "translateY(-3px)",
          boxShadow: "0 12px 30px color-mix(in srgb, var(--chakra-colors-fg) 12%, transparent)",
          borderColor: `${colorPalette}.border`,
        }}
      >
        <Box
          position="absolute"
          insetY={0}
          left={0}
          w="4px"
          bg={`${colorPalette}.solid`}
        />
        <Card.Body p={{ base: 4, md: 5 }}>
          <HStack justify="space-between" align="flex-start" gap={3}>
            <Stack gap={1} minW={0}>
              <Text
                fontSize="xs"
                fontWeight="bold"
                letterSpacing="widest"
                textTransform="uppercase"
                color="fg.muted"
              >
                {label}
              </Text>
              <Text
                fontFamily="heading"
                fontSize={{ base: "2xl", md: "3xl" }}
                fontWeight="extrabold"
                color="fg"
                lineHeight="1.1"
              >
                {value}
              </Text>
              {hint && (
                <Text fontSize="xs" color="fg.subtle">
                  {hint}
                </Text>
              )}
            </Stack>
            {Icon && (
              <Box
                flexShrink={0}
                display="grid"
                placeItems="center"
                w="44px"
                h="44px"
                borderRadius="xl"
                bg={`${colorPalette}.subtle`}
                color={`${colorPalette}.fg`}
              >
                <Icon size={22} />
              </Box>
            )}
          </HStack>
          {trend && (
            <Text mt={3} fontSize="xs" fontWeight="semibold" color={`${colorPalette}.fg`}>
              {trend}
            </Text>
          )}
        </Card.Body>
      </Card.Root>
    </StaggerItem>
  );
}
