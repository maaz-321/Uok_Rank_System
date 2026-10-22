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
  NativeSelect,
  Stack,
  Text,
} from "@chakra-ui/react";
import { ArrowLeft, ArrowRight, Building2, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";
import API, { extractApiError } from "../api/axiosInstance";
import AuthBrandPanel from "../components/auth/AuthBrandPanel";
import { FormField } from "../components/ui/FormField";
import { registerSchema } from "../lib/validation";
import { DEPARTMENTS, ORG_NAME } from "../lib/constants";
import { MotionBox } from "../components/ui/motion";

const HIGHLIGHTS = [
  "One profile for HEC ranking dossiers and promotion files",
  "Qualifications stay verified and current through your academic form",
  "Your chairman, OEC and QEC all read the same trusted record",
];

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      department: "",
    },
    mode: "onSubmit",
  });

  const onSubmit = async (values) => {
    try {
      await API.post("/auth/register", {
        name: values.name,
        email: values.email,
        password: values.password,
        department: values.department,
      });

      toast.success("Account created", {
        description: "Your faculty account is ready. Sign in to complete your academic record.",
        duration: 5000,
      });
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error("Registration failed", { description: extractApiError(error) });
    }
  };

  return (
    <Flex minH="calc(100dvh - 60px)" align="center" justify="center" px={{ base: 4, md: 8 }} py={{ base: 8, md: 12 }}>
      <MotionBox
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        w="full"
        maxW="980px"
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
          <AuthBrandPanel
            eyebrow="Faculty registration"
            title={`Join the ${ORG_NAME} faculty network`}
            description="Register once, then keep your complete academic record current for HEC ranking submissions and departmental audits."
            bullets={HIGHLIGHTS}
          />

          <Box flex="1.15" p={{ base: 6, md: 10 }}>
            <Stack gap={6}>
              <Stack gap={1.5}>
                <HStack gap={2.5}>
                  <Box h="1px" w="8" bg="gold.solid" flexShrink={0} />
                  <Text fontSize="xs" fontWeight="bold" letterSpacing="widest" textTransform="uppercase" color="maroon.fg">
                    Faculty registration
                  </Text>
                </HStack>
                <Heading fontFamily="heading" fontSize={{ base: "xl", md: "2xl" }} fontWeight="extrabold" color="fg">
                  Create your account
                </Heading>
                <Text fontSize="sm" color="fg.muted">
                  Your role is set to <Text as="span" fontWeight="semibold" color="fg">Faculty Member</Text> and can be
                  upgraded by the QEC administrator.
                </Text>
              </Stack>

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Stack gap={5}>
                  <FormField label="Full name & academic title" error={errors.name?.message} required>
                    <InputGroup
                      startElement={<User size={17} />}
                      startElementProps={{ color: "fg.subtle" }}
                    >
                      <Input
                        type="text"
                        autoComplete="name"
                        placeholder="Dr. Muhammad Ali"
                        borderRadius="md"
                        {...register("name")}
                      />
                    </InputGroup>
                  </FormField>

                  <FormField label="Department" error={errors.department?.message} required>
                    <NativeSelect.Root>
                      <NativeSelect.Field
                        borderRadius="md"
                        pl="38px"
                        {...register("department")}
                      >
                        <option value="">-- Select your department --</option>
                        {DEPARTMENTS.map((department) => (
                          <option key={department} value={department}>
                            {department}
                          </option>
                        ))}
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                      <Box
                        position="absolute"
                        left={3}
                        top="50%"
                        transform="translateY(-50%)"
                        color="fg.subtle"
                        pointerEvents="none"
                        zIndex={1}
                      >
                        <Building2 size={17} />
                      </Box>
                    </NativeSelect.Root>
                  </FormField>

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

                  <FormField
                    label="Password"
                    error={errors.password?.message}
                    helperText="Minimum 8 characters."
                    required
                  >
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
                        autoComplete="new-password"
                        placeholder="••••••••"
                        borderRadius="md"
                        {...register("password")}
                      />
                    </InputGroup>
                  </FormField>

                  <FormField label="Confirm password" error={errors.confirmPassword?.message} required>
                    <InputGroup
                      startElement={<Lock size={17} />}
                      startElementProps={{ color: "fg.subtle" }}
                    >
                      <Input
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        borderRadius="md"
                        {...register("confirmPassword")}
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
                    loadingText="Creating account..."
                    transition="transform 160ms ease, box-shadow 200ms ease, filter 200ms ease"
                    _hover={{
                      transform: "translateY(-1px)",
                      boxShadow: "0 18px 40px rgba(128, 0, 0, 0.38)",
                      filter: "brightness(1.06)",
                    }}
                    _active={{ transform: "translateY(0)" }}
                  >
                    Create faculty account
                    <ArrowRight size={17} />
                  </Button>
                </Stack>
              </form>

              <HStack justify="center" gap={2}>
                <ChakraLink asChild color="fg.muted" fontSize="sm">
                  <Link to="/login">
                    <HStack gap={1.5}>
                      <ArrowLeft size={14} />
                      <Text>Back to sign in</Text>
                    </HStack>
                  </Link>
                </ChakraLink>
              </HStack>
            </Stack>
          </Box>
        </Flex>
      </MotionBox>
    </Flex>
  );
}
