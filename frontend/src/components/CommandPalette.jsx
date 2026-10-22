import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  Portal,
  Box,
  Text,
  Kbd,
  HStack,
} from "@chakra-ui/react";
import { Command } from "cmdk";
import {
  Building2,
  Download,
  FileText,
  Globe,
  LayoutDashboard,
  LogOut,
  Moon,
  Search,
  Sun,
  UserCog,
} from "lucide-react";
import { useColorMode } from "../providers/ColorModeProvider";
import { ROLE_META, ROLES } from "../lib/constants";

const COMMANDS = [
  {
    id: "dashboard",
    label: "Go to my dashboard",
    icon: LayoutDashboard,
    roles: [ROLES.FACULTY, ROLES.CHAIRMAN, ROLES.OEC, ROLES.QEC],
  },
  {
    id: "academic",
    label: "My academic record",
    icon: FileText,
    roles: [ROLES.FACULTY],
  },
  {
    id: "department",
    label: "Department faculty records",
    icon: Building2,
    roles: [ROLES.CHAIRMAN],
  },
  {
    id: "institution",
    label: "Institution-wide records",
    icon: Globe,
    roles: [ROLES.OEC],
  },
  {
    id: "control",
    label: "QEC control panel",
    icon: UserCog,
    roles: [ROLES.QEC],
  },
];

export default function CommandPalette({ user, onLogout }) {
  const navigate = useNavigate();
  const { resolvedMode, toggleColorMode } = useColorMode();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const items = useMemo(() => {
    if (!user) return [];
    const role = user.role;
    const roleMeta = ROLE_META[role] ?? ROLE_META[ROLES.FACULTY];

    return COMMANDS.filter((command) => command.roles.includes(role)).map((command) => ({
      ...command,
      run: () => navigate(roleMeta.home),
    }));
  }, [user, navigate]);

  if (!user) return null;

  const runAndClose = (fn) => {
    setOpen(false);
    fn();
  };

  return (
    <Dialog.Root open={open} onOpenChange={(details) => setOpen(details.open)} placement="center">
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <Dialog.Positioner>
          <Dialog.Content
            maxW="xl"
            borderRadius="xl"
            borderWidth="1px"
            borderColor="border"
            bg="bg.panel"
            overflow="hidden"
            boxShadow="0 24px 70px rgba(15, 23, 42, 0.32)"
          >
            <Command label="Global command menu" loop>
              <Box px={4} py={3} borderBottomWidth="1px" borderColor="border">
                <HStack gap={3}>
                  <Search size={17} color="var(--chakra-colors-fg-subtle)" />
                  <Command.Input
                    placeholder="Search commands…"
                    style={{
                      width: "100%",
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      color: "var(--chakra-colors-fg)",
                      fontSize: "15px",
                    }}
                  />
                  <Kbd size="sm">Esc</Kbd>
                </HStack>
              </Box>

              <Command.List
                style={{ maxHeight: "22rem", overflowY: "auto", padding: "8px" }}
              >
                <Command.Empty>
                  <Text p={4} fontSize="sm" color="fg.muted">
                    No matching commands.
                  </Text>
                </Command.Empty>

                <Command.Group heading="Navigation">
                  {items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Command.Item
                        key={item.id}
                        value={`${item.label} ${item.id}`}
                        onSelect={() => runAndClose(item.run)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "10px 12px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          color: "var(--chakra-colors-fg)",
                        }}
                        className="cmd-item"
                      >
                        <Icon size={16} />
                        <Text fontSize="sm">{item.label}</Text>
                      </Command.Item>
                    );
                  })}
                </Command.Group>

                <Command.Group heading="Actions">
                  <Command.Item
                    value="toggle theme"
                    onSelect={() => runAndClose(toggleColorMode)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      color: "var(--chakra-colors-fg)",
                    }}
                    className="cmd-item"
                  >
                    {resolvedMode === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                    <Text fontSize="sm">
                      Switch to {resolvedMode === "dark" ? "light" : "dark"} mode
                    </Text>
                  </Command.Item>

                  <Command.Item
                    value="download my cv"
                    onSelect={() => runAndClose(() => navigate("/dashboard"))}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      color: "var(--chakra-colors-fg)",
                    }}
                    className="cmd-item"
                  >
                    <Download size={16} />
                    <Text fontSize="sm">My CV / resume</Text>
                  </Command.Item>

                  <Command.Item
                    value="sign out"
                    onSelect={() => runAndClose(onLogout)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      color: "var(--chakra-colors-red-fg)",
                    }}
                    className="cmd-item"
                  >
                    <LogOut size={16} />
                    <Text fontSize="sm">Sign out</Text>
                  </Command.Item>
                </Command.Group>
              </Command.List>
            </Command>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
