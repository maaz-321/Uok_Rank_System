import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  IconButton,
  Input,
  InputGroup,
  Link as ChakraLink,
  Stack,
  Text,
} from "@chakra-ui/react";
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import API, { extractApiError } from "../api/axiosInstance";
import AuthBrandPanel from "../components/auth/AuthBrandPanel";
import { FormField } from "../components/ui/FormField";
import { loginSchema } from "../lib/validation";
import { APP_NAME, ORG_NAME, ROLE_META, ROLES, STORAGE_KEYS } from "../lib/constants";
import { MotionBox } from "../components/ui/motion";

const HIGHLIGHTS = [
  "One authoritative academic record per faculty member",
  "QEC-controlled edit permissions with email notifications",
  "Instant PDF resume generation for ranking submissions",
];

export default function Login({ setUser }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: true },
    mode: "onSubmit",
  });

  const onSubmit = async (values) => {
    try {
      const res = await API.post("/auth/login", {
        email: values.email,
        password: values.password,
      });

      const payload = res.data?.user ? { ...res.data.user, token: res.data.token } : res.data;
      const token = res.data?.token ?? payload?.token;

      localStorage.setItem(STORAGE_KEYS.token, token);
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(payload));
      setUser(payload);

      const role = payload?.role ?? ROLES.FACULTY;
      const home = ROLE_META[role]?.home ?? "/dashboard";

      toast.success(`Welcome back, ${payload?.name?.split(" ")[0] ?? "colleague"}`, {
        description: ROLE_META[role]?.label ?? "Signed in successfully",
      });
      navigate(home, { replace: true });
    } catch (error) {
      toast.error("Sign in failed", { description: extractApiError(error, "Invalid email or password") });
    }
  };

  return (
    <Flex minH="calc(100dvh - 60px)" align="center" justify="center" px={{ base: 4, md: 8 }} py={{ base: 8, md: 12 }}>
      <MotionBox
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        w="full"
        maxW="1100px"
      >
        <Flex
          direction={{ base: "column", lg: "row" }}
          borderRadius="2xl"
          overflow="hidden"
          borderWidth="1px"
          borderColor="border"
          bg="bg.panel"
          boxShadow="0 24px 70px rgba(15, 23, 42, 0.16)"
        >
          {/* Brand panel */}
          <AuthBrandPanel
            eyebrow="Office of Rank Management"
            title={
              <>
                {ORG_NAME}
                <Text
                  as="span"
                  display="block"
                  color="gold.fg"
                  fontSize={{ base: "lg", md: "2xl" }}
                  mt={2}
                  letterSpacing="0"
                >
                  {APP_NAME}
                </Text>
              </>
            }
            description="A single source of truth for faculty academic records, ranking submissions and quality enhancement approvals."
            bullets={HIGHLIGHTS}
          />

          {/* Form panel */}
          <Box flex="1" p={{ base: 6, md: 10 }}>
            <Stack gap={6}>
              <Stack gap={1.5}>
                <HStack gap={2.5}>
                  <Box h="1px" w="8" bg="gold.solid" flexShrink={0} />
                  <Text fontSize="xs" fontWeight="bold" letterSpacing="widest" textTransform="uppercase" color="maroon.fg">
                    Secure access
                  </Text>
                </HStack>
                <Heading fontFamily="heading" fontSize={{ base: "xl", md: "2xl" }} fontWeight="extrabold" color="fg">
                  Sign in to your portal
                </Heading>
                <Text fontSize="sm" color="fg.muted">
                  Use your official university email address to continue.
                </Text>
              </Stack>

              <Box
                borderWidth="1px"
                borderColor="border"
                bg="bg.subtle"
                borderRadius="lg"
                px={4}
                py={3}
              >
                <HStack gap={3} align="flex-start">
                  <Box color="maroon.solid" flexShrink={0} mt="1px">
                    <AlertCircle size={17} />
                  </Box>
                  <Text fontSize="xs" color="fg.muted">
                    Accounts are provisioned by the Quality Enhancement Cell (QEC). If your
                    edit access is locked, contact your QEC administrator.
                  </Text>
                </HStack>
              </Box>

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Stack gap={5}>
                  <FormField label="Official email address" error={errors.email?.message} required>
                    <InputGroup
                      startElement={<Mail size={17} />}
                      startElementProps={{ color: "fg.subtle" }}
                    >
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder="faculty@uok.edu.pk"
                        borderRadius="md"
                        {...register("email")}
                      />
                    </InputGroup>
                  </FormField>

                  <FormField label="Password" error={errors.password?.message} required>
                    <InputGroup
                      startElement={<Lock size={17} />}
                      startElementProps={{ color: "fg.subtle" }}
                      endElement={
                        <IconButton
                          type="button"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowPassword((value) => !value)}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </IconButton>
                      }
                    >
                      <Input
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        borderRadius="md"
                        {...register("password")}
                      />
                    </InputGroup>
                  </FormField>

                  <Button
                    type="submit"
                    size="lg"
                    w="full"
                    className="uok-gold-sheen"
                    bgGradient="to-br"
                    gradientFrom="maroon.600"
                    gradientTo="maroon.900"
                    color="white"
                    fontWeight="bold"
                    letterSpacing="0.02em"
                    boxShadow="0 14px 34px rgba(128, 0, 0, 0.3)"
                    loading={isSubmitting}
                    loadingText="Authenticating..."
                    transition="transform 160ms ease, box-shadow 200ms ease, filter 200ms ease"
                    _hover={{
                      transform: "translateY(-1px)",
                      boxShadow: "0 18px 40px rgba(128, 0, 0, 0.38)",
                      filter: "brightness(1.06)",
                    }}
                    _active={{ transform: "translateY(0)" }}
                  >
                    Sign in
                    <ArrowRight size={17} />
                  </Button>
                </Stack>
              </form>

              <Text fontSize="sm" color="fg.muted" textAlign="center">
                Don&apos;t have an account?{" "}
                <ChakraLink asChild color="maroon.fg" fontWeight="semibold" _hover={{ textDecoration: "underline" }}>
                  <Link to="/register">Register faculty account</Link>
                </ChakraLink>
              </Text>
            </Stack>
          </Box>
        </Flex>
      </MotionBox>
    </Flex>
  );
}
