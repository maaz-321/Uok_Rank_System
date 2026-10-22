import { Field, SimpleGrid, Stack, Text } from "@chakra-ui/react";

export function FormField({
  label,
  error,
  helperText,
  required,
  children,
  ...rootProps
}) {
  return (
    <Field.Root invalid={Boolean(error)} required={required} {...rootProps}>
      <Field.Label fontWeight="semibold" color="fg">
        {label}
      </Field.Label>
      {children}
      {error ? (
        <Field.ErrorText fontSize="xs" fontWeight="medium">
          {error}
        </Field.ErrorText>
      ) : helperText ? (
        <Field.HelperText fontSize="xs" color="fg.subtle">
          {helperText}
        </Field.HelperText>
      ) : null}
    </Field.Root>
  );
}

export function FormRow({ children, columns = { base: 1, md: 2 }, gap = 4, ...props }) {
  return (
    <SimpleGrid columns={columns} gap={gap} {...props}>
      {children}
    </SimpleGrid>
  );
}

export function FormSection({ title, description, children, columns = { base: 1, md: 2 }, gap = 4 }) {
  return (
    <Stack gap={4}>
      {(title || description) && (
        <Stack gap={0.5}>
          {title && (
            <Text
              as="h3"
              fontFamily="heading"
              fontSize="xs"
              fontWeight="bold"
              letterSpacing="widest"
              textTransform="uppercase"
              color="maroon.fg"
              mb={0}
            >
              {title}
            </Text>
          )}
          {description && (
            <Text fontSize="xs" color="fg.muted" mb={0}>
              {description}
            </Text>
          )}
        </Stack>
      )}
      <SimpleGrid columns={columns} gap={gap}>
        {children}
      </SimpleGrid>
    </Stack>
  );
}
