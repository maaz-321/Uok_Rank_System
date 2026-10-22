import { Box, Flex } from "@chakra-ui/react";
import { PageTransition } from "../ui/motion";

export default function AppShell({ children, maxW = "1200px" }) {
  return (
    <Box as="main" flex="1" w="full">
      <PageTransition
        maxW={maxW}
        mx="auto"
        px={{ base: 4, sm: 6, lg: 8 }}
        pt={{ base: 5, md: 8 }}
        pb={{ base: 12, md: 16 }}
      >
        <Flex direction="column" gap={6}>
          {children}
        </Flex>
      </PageTransition>
    </Box>
  );
}
