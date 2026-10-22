import { Box, Flex, Heading, HStack, Stack, Text } from "@chakra-ui/react";
import { ShieldCheck } from "lucide-react";
import BrandMark from "../ui/BrandMark";
import ThemeToggle from "../ui/ThemeToggle";
import { CURRENT_YEAR, ORG_NAME } from "../../lib/constants";

export default function AuthBrandPanel({
  eyebrow,
  title,
  description,
  bullets = [],
  footer,
}) {
  return (
    <Box
      flex="1"
      position="relative"
      overflow="hidden"
      color="fg"
      p={{ base: 7, md: 10 }}
      display={{ base: "block", lg: "flex" }}
      flexDirection="column"
      justifyContent="space-between"
      gap={8}
      borderRightWidth={{ base: 0, lg: "1px" }}
      borderRightColor="border"
      minH={{ base: "auto", lg: "580px" }}
    >
      <Flex align="center" justify="space-between" gap={4}>
        <BrandMark size="lg" showTagline={false} />
        <ThemeToggle />
      </Flex>

      <Stack gap={6} position="relative" zIndex={1}>
        {eyebrow && (
          <HStack gap={2.5}>
            <Box h="1px" w="8" bg="gold.solid" />
            <Text
              fontSize="xs"
              fontWeight="bold"
              letterSpacing="0.22em"
              textTransform="uppercase"
              color="gold.fg"
            >
              {eyebrow}
            </Text>
          </HStack>
        )}

        <Heading
          fontFamily="heading"
          fontSize={{ base: "2xl", md: "4xl" }}
          fontWeight="extrabold"
          lineHeight="1.08"
          letterSpacing="-0.01em"
          color="fg"
        >
          {title}
        </Heading>

        {description && (
          <Text color="fg.muted" fontSize="sm" maxW="46ch" lineHeight="1.7">
            {description}
          </Text>
        )}

        {bullets.length > 0 && (
          <Stack gap={2.5}>
            {bullets.map((item) => (
              <HStack
                key={item}
                gap={3}
                align="flex-start"
                px={3.5}
                py={2.5}
                borderRadius="lg"
                bg="bg.subtle"
                borderWidth="1px"
                borderColor="border"
              >
                <Box mt="1px" color="maroon.fg" flexShrink={0}>
                  <ShieldCheck size={16} />
                </Box>
                <Text fontSize="sm" color="fg" lineHeight="1.5">
                  {item}
                </Text>
              </HStack>
            ))}
          </Stack>
        )}
      </Stack>

      <Stack gap={3} position="relative" zIndex={1}>
        <Box h="1px" w="full" bgGradient="to-r" gradientFrom="gold.solid" gradientTo="transparent" opacity={0.6} />
        <Text fontSize="xs" color="fg.subtle">
          {footer ?? `© ${CURRENT_YEAR} Office of Rank Management — ${ORG_NAME}`}
        </Text>
      </Stack>
    </Box>
  );
}
