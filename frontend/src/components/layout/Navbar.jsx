import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Drawer,
  Flex,
  HStack,
  IconButton,
  Menu,
  Portal,
  Separator,
  Stack,
  Text,
} from "@chakra-ui/react";
import { ChevronDown, LayoutDashboard, LogOut, Menu as MenuIcon, User } from "lucide-react";
import BrandMark from "../ui/BrandMark";
import RoleBadge from "../ui/RoleBadge";
import ThemeToggle from "../ui/ThemeToggle";
import { ROLE_META, ROLES } from "../../lib/constants";
import { initials } from "../../lib/format";

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const roleMeta = ROLE_META[user?.role] ?? ROLE_META[ROLES.FACULTY];

  const handleLogout = () => {
    localStorage.removeItem("uok_token");
    localStorage.removeItem("uok_user");
    setUser(null);
    navigate("/login", { replace: true });
  };

  const goToDashboard = () => navigate(roleMeta.home);

  return (
    <Box
      as="header"
      position="sticky"
      top={0}
      zIndex={50}
      borderBottomWidth="1px"
      borderColor="border"
      bg="bg.panel"
      boxShadow="0 12px 34px -22px rgba(15, 23, 42, 0.45)"
      className="uok-glass"
    >
      <Box h="2px" bgGradient="to-r" gradientFrom="maroon.solid" gradientVia="gold.solid" gradientTo="navy.solid" />

      <Flex
        maxW="1200px"
        mx="auto"
        px={{ base: 4, sm: 6, lg: 8 }}
        py={3}
        align="center"
        justify="space-between"
        gap={4}
      >
        <Flex
          as="button"
          type="button"
          onClick={() => navigate(user ? roleMeta.home : "/login")}
          cursor="pointer"
          align="center"
          minW={0}
          p={0}
          bg="transparent"
          borderRadius="lg"
          _focusVisible={{ outline: "2px solid", outlineColor: "maroon.focusRing", outlineOffset: "4px" }}
          aria-label={user ? `Go to ${roleMeta.label}` : "Go to sign in"}
        >
          <BrandMark compact />
        </Flex>

        <HStack gap={2}>
          <ThemeToggle />

          {user ? (
            <>
              <Menu.Root placement="bottom-end">
                <Menu.Trigger asChild>
                  <Button
                    variant="ghost"
                    h="auto"
                    py={1.5}
                    px={2}
                    borderRadius="full"
                    _hover={{ bg: "bg.muted" }}
                    aria-label="Account menu"
                  >
                    <HStack gap={2.5}>
                      <Avatar.Root size="sm" bg="maroon.solid" color="white" fontWeight="bold">
                        <Avatar.Fallback name={user.name}>{initials(user.name)}</Avatar.Fallback>
                      </Avatar.Root>
                      <Stack gap={0} align="flex-start" display={{ base: "none", md: "flex" }}>
                        <Text fontSize="sm" fontWeight="bold" color="fg" lineHeight="1.2" maxW="160px" truncate>
                          {user.name}
                        </Text>
                        <Text fontSize="2xs" color="fg.muted" textTransform="uppercase" letterSpacing="wider" fontWeight="semibold">
                          {roleMeta.shortLabel}
                        </Text>
                      </Stack>
                      <ChevronDown size={15} className="nav-chevron" />
                    </HStack>
                  </Button>
                </Menu.Trigger>

                <Portal>
                  <Menu.Positioner>
                    <Menu.Content
                      minW="260px"
                      borderRadius="lg"
                      borderWidth="1px"
                      borderColor="border"
                      bg="bg.panel"
                      boxShadow="0 16px 40px rgba(15, 23, 42, 0.18)"
                      p={2}
                    >
                      <Box px={3} py={2.5}>
                        <Text fontWeight="bold" color="fg" fontSize="sm" truncate>
                          {user.name}
                        </Text>
                        <Text fontSize="xs" color="fg.muted" truncate mb={2}>
                          {user.email}
                        </Text>
                        <RoleBadge role={user.role} />
                      </Box>
                      <Separator my={2} />
                      <Menu.Item
                        value="dashboard"
                        onSelect={goToDashboard}
                        borderRadius="md"
                        gap={2.5}
                      >
                        <LayoutDashboard size={16} />
                        <Text fontSize="sm">Go to dashboard</Text>
                      </Menu.Item>
                      <Menu.Item
                        value="profile"
                        onSelect={goToDashboard}
                        borderRadius="md"
                        gap={2.5}
                      >
                        <User size={16} />
                        <Text fontSize="sm">My academic record</Text>
                      </Menu.Item>
                      <Separator my={2} />
                      <Menu.Item
                        value="logout"
                        onSelect={handleLogout}
                        borderRadius="md"
                        gap={2.5}
                        color="red.fg"
                        _hover={{ bg: "red.subtle", color: "red.fg" }}
                      >
                        <LogOut size={16} />
                        <Text fontSize="sm" fontWeight="semibold">
                          Sign out
                        </Text>
                      </Menu.Item>
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </Menu.Root>

              <IconButton
                aria-label="Open navigation"
                variant="ghost"
                display={{ base: "inline-flex", lg: "none" }}
                onClick={() => setDrawerOpen(true)}
              >
                <MenuIcon size={20} />
              </IconButton>
            </>
          ) : (
            <HStack gap={2}>
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                Sign in
              </Button>
              <Button
                colorPalette="maroon"
                size="sm"
                onClick={() => navigate("/register")}
                display={{ base: "none", sm: "inline-flex" }}
              >
                Register
              </Button>
            </HStack>
          )}
        </HStack>
      </Flex>

      <Drawer.Root open={drawerOpen} onOpenChange={(details) => setDrawerOpen(details.open)} placement="right">
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content bg="bg.panel" borderLeftWidth="1px" borderColor="border">
              <Drawer.Header borderBottomWidth="1px" borderColor="border" pb={4}>
                <Drawer.Title>
                  <BrandMark compact />
                </Drawer.Title>
                <Drawer.CloseTrigger asChild>
                  <IconButton aria-label="Close navigation" size="sm" variant="ghost">
                    ✕
                  </IconButton>
                </Drawer.CloseTrigger>
              </Drawer.Header>

              <Drawer.Body>
                {user ? (
                  <Stack gap={5}>
                    <Stack gap={2}>
                      <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="widest" color="fg.subtle">
                        Signed in as
                      </Text>
                      <Text fontWeight="bold" color="fg">
                        {user.name}
                      </Text>
                      <Text fontSize="xs" color="fg.muted">
                        {user.email}
                      </Text>
                      <Box mt={1}>
                        <RoleBadge role={user.role} />
                      </Box>
                    </Stack>

                    <Separator />

                    <Stack gap={2}>
                      <Button
                        colorPalette="maroon"
                        justifyContent="flex-start"
                        onClick={() => {
                          setDrawerOpen(false);
                          goToDashboard();
                        }}
                      >
                        <LayoutDashboard size={16} />
                        Dashboard
                      </Button>
                      <Button
                        variant="outline"
                        colorPalette="red"
                        justifyContent="flex-start"
                        onClick={() => {
                          setDrawerOpen(false);
                          handleLogout();
                        }}
                      >
                        <LogOut size={16} />
                        Sign out
                      </Button>
                    </Stack>

                    <Text fontSize="xs" color="fg.subtle">
                      {roleMeta.description}
                    </Text>
                  </Stack>
                ) : (
                  <Stack gap={3}>
                    <Button colorPalette="maroon" onClick={() => navigate("/login")}>
                      Sign in
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/register")}>
                      Register faculty account
                    </Button>
                  </Stack>
                )}
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </Box>
  );
}
