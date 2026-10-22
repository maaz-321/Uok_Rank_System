import { Box, HStack, Stack, Text } from "@chakra-ui/react";
import { APP_NAME, ORG_NAME } from "../../lib/constants";

const SIZES = {
  sm: { img: "30px", title: "xs", tag: "2xs" },
  md: { img: "40px", title: "md", tag: "xs" },
  lg: { img: "56px", title: "lg", tag: "sm" },
};

/**
 * Plain crest mark: the logo image only, without any plaque, gradient,
 * border, shadow or hover animation.
 */
export default function BrandMark({
  compact = false,
  showTagline = true,
  size = "md",
}) {
  const s = SIZES[size] ?? SIZES.md;

  return (
    <HStack gap={{ base: 2.5, sm: 3 }} minW={0}>
      <Box
        as="img"
        src="/ku-official-logo.png"
        alt={`${ORG_NAME} logo`}
        flexShrink={0}
        h={s.img}
        w="auto"
        objectFit="contain"
        /* The crest is a deep monochrome red, so it needs a lift on dark surfaces. */
        _dark={{ filter: "brightness(1.75) saturate(1.05)" }}
      />

      {!compact && (
        <Stack
          gap="0.5"
          minW={0}
          pl={{ base: 2.5, sm: 3 }}
          borderLeftWidth="1px"
          borderColor="border"
        >
          <Text
            fontFamily="heading"
            fontWeight="extrabold"
            fontSize={s.title}
            letterSpacing="0.055em"
            textTransform="uppercase"
            color="fg"
            lineHeight="1.15"
            truncate
          >
            {ORG_NAME}
          </Text>
          {showTagline && (
            <Text
              fontSize={s.tag}
              fontWeight="bold"
              letterSpacing="0.15em"
              textTransform="uppercase"
              color="gold.fg"
              lineHeight="1.3"
              truncate
            >
              {APP_NAME}
            </Text>
          )}
        </Stack>
      )}
    </HStack>
  );
}
