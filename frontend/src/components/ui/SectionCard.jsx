import { Box, Card, Flex, HStack, Stack, Text } from "@chakra-ui/react";

export default function SectionCard({
  title,
  description,
  icon: Icon,
  actions,
  accent = "maroon",
  children,
  bodyPadding = { base: 4, md: 6 },
  ...props
}) {
  return (
    <Card.Root
      variant="outline"
      borderColor="border"
      borderWidth="1px"
      borderTopWidth="3px"
      borderTopColor={`${accent}.solid`}
      bg="bg.panel"
      borderRadius="xl"
      boxShadow="0 1px 2px color-mix(in srgb, var(--chakra-colors-fg) 6%, transparent)"
      overflow="hidden"
      {...props}
    >
      {(title || actions) && (
        <Card.Header
          px={bodyPadding}
          pt={bodyPadding}
          pb={title || description ? 3 : 0}
          borderBottomWidth={description ? "1px" : "0"}
          borderColor="border.muted"
        >
          <Flex align="center" justify="space-between" gap={4} wrap="wrap">
            <HStack gap={3} align="center" minW={0}>
              {Icon && (
                <Box
                  flexShrink={0}
                  display="grid"
                  placeItems="center"
                  w="38px"
                  h="38px"
                  borderRadius="lg"
                  bg={`${accent}.subtle`}
                  color={`${accent}.fg`}
                >
                  <Icon size={19} />
                </Box>
              )}
              <Stack gap={0.5} minW={0}>
                {title && (
                  <Text
                    fontFamily="heading"
                    fontSize="md"
                    fontWeight="bold"
                    color="fg"
                    lineHeight="1.2"
                  >
                    {title}
                  </Text>
                )}
                {description && (
                  <Text fontSize="sm" color="fg.muted">
                    {description}
                  </Text>
                )}
              </Stack>
            </HStack>
            {actions && <HStack gap={2}>{actions}</HStack>}
          </Flex>
        </Card.Header>
      )}

      <Card.Body px={bodyPadding} py={bodyPadding}>
        {children}
      </Card.Body>
    </Card.Root>
  );
}
