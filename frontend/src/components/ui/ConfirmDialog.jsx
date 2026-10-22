import { Button, Dialog, Portal, Stack, Text } from "@chakra-ui/react";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  colorPalette = "maroon",
  loading = false,
}) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details) => {
        if (!details.open) onClose();
      }}
      placement="center"
      motionPreset="scale"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            borderRadius="xl"
            borderWidth="1px"
            borderColor="border"
            bg="bg.panel"
            boxShadow="0 24px 60px rgba(15, 23, 42, 0.28)"
            maxW="md"
          >
            <Dialog.Header pb={1}>
              <Dialog.Title fontFamily="heading" fontWeight="bold" color="fg">
                {title}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Text color="fg.muted" fontSize="sm">
                {description}
              </Text>
            </Dialog.Body>
            <Dialog.Footer gap={3}>
              <Stack direction="row" gap={3} w="full" justify="flex-end">
                <Button variant="outline" onClick={onClose} disabled={loading}>
                  {cancelLabel}
                </Button>
                <Button
                  colorPalette={colorPalette}
                  onClick={onConfirm}
                  loading={loading}
                  loadingText="Working..."
                >
                  {confirmLabel}
                </Button>
              </Stack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
