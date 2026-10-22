import { Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { PageTransition } from "./motion";

export default function PageHeader({ eyebrow, title, description, actions, children }) {
  return (
    <PageTransition mb={{ base: 5, md: 7 }}>
      <Flex
        direction={{ base: "column", md: "row" }}
        align={{ base: "stretch", md: "flex-end" }}
        justify="space-between"
        gap={4}
      >
        <Stack gap={1.5} minW={0}>
          {eyebrow && (
            <Text
              fontSize="xs"
              fontWeight="bold"
              letterSpacing="widest"
              textTransform="uppercase"
              color="maroon.fg"
            >
              {eyebrow}
            </Text>
          )}
          <Heading
            as="h1"
            fontFamily="heading"
            fontSize={{ base: "xl", md: "3xl" }}
            fontWeight="extrabold"
            letterSpacing="tight"
            color="fg"
            lineHeight="1.15"
          >
            {title}
          </Heading>
          {description && (
            <Text color="fg.muted" fontSize={{ base: "sm", md: "md" }} maxW="62ch">
              {description}
            </Text>
          )}
        </Stack>

        {actions && (
          <Flex gap={2.5} wrap="wrap" flexShrink={0}>
            {actions}
          </Flex>
        )}
      </Flex>
      {children}
    </PageTransition>
  );
}
