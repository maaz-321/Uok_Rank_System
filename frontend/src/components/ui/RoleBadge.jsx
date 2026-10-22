import { Badge, Box, HStack } from "@chakra-ui/react";
import { ROLES, ROLE_META } from "../../lib/constants";

function Pill({ colorPalette, children, showDot = true, ...props }) {
  return (
    <HStack
      as="span"
      gap={1.5}
      px={2.5}
      py={1}
      borderRadius="full"
      bg={`${colorPalette}.subtle`}
      color={`${colorPalette}.fg`}
      fontSize="xs"
      fontWeight="bold"
      letterSpacing="wide"
      textTransform="uppercase"
      whiteSpace="nowrap"
      {...props}
    >
      {showDot && (
        <Box
          boxSize="6px"
          borderRadius="full"
          bg={`${colorPalette}.solid`}
          aria-hidden="true"
        />
      )}
      {children}
    </HStack>
  );
}

export default function RoleBadge({ role, showDot = true }) {
  const meta = ROLE_META[role] ?? {
    shortLabel: role || "Unknown",
    colorPalette: "gray",
  };

  return (
    <Pill colorPalette={meta.colorPalette} showDot={showDot}>
      {meta.shortLabel}
    </Pill>
  );
}

export function LockBadge({ isAllowed }) {
  return (
    <Pill colorPalette={isAllowed ? "green" : "red"}>
      {isAllowed ? "Unlocked" : "Locked"}
    </Pill>
  );
}

export function CountBadge({ count }) {
  return (
    <Badge
      colorPalette="maroon"
      variant="solid"
      size="sm"
      borderRadius="full"
      px={2}
      minW="22px"
      justifyContent="center"
    >
      {count}
    </Badge>
  );
}

export { ROLES };
