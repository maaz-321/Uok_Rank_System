import { useCallback, useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Input,
  NativeSelect,
  Progress,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  GraduationCap,
  Lock,
  Plus,
  Save,
  Trash2,
  Unlock,
  User,
} from "lucide-react";
import { toast } from "sonner";
import API, { downloadFile, extractApiError } from "../api/axiosInstance";
import AppShell from "../components/layout/AppShell";
import PageHeader from "../components/ui/PageHeader";
import SectionCard from "../components/ui/SectionCard";
import StatCard from "../components/ui/StatCard";
import { FormField, FormRow, FormSection } from "../components/ui/FormField";
import { Stagger } from "../components/ui/motion";
import { academicSchema } from "../lib/validation";
import { DEGREE_LEVELS, GENDERS } from "../lib/constants";
import { computePercentage, safeFileName } from "../lib/format";

const EMPTY_ACADEMIC = {
  fatherName: "",
  cnicOrBForm: "",
  gender: "",
  dateOfBirth: "",
  domicileDistrict: "",
  postalAddress: "",
  permanentAddress: "",
  qualifications: [
    {
      degreeLevel: "",
      degreeTitle: "",
      boardOrUniversity: "",
      rollNumber: "",
      seatOrEnrolmentNo: "",
      passingYear: "",
      majorSubjects: "",
      obtainedMarks: "",
      totalMarks: "",
      cgpa: "",
      gradeOrDivision: "",
      documentUrl: "",
    },
  ],
};

export default function FacultyDashboard({ user }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isEditAllowed, setIsEditAllowed] = useState(Boolean(user?.isEditAllowed));
  const [savedAt, setSavedAt] = useState(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(academicSchema),
    defaultValues: EMPTY_ACADEMIC,
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({ control, name: "qualifications" });

  const values = watch();
  const isDirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(EMPTY_ACADEMIC),
    [values],
  );

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/user/academic");
      if (res.data) {
        const record = res.data;
        reset({
          fatherName: record.fatherName ?? "",
          cnicOrBForm: record.cnicOrBForm ?? "",
          gender: record.gender ?? "",
          dateOfBirth: record.dateOfBirth ? String(record.dateOfBirth).slice(0, 10) : "",
          domicileDistrict: record.domicileDistrict ?? "",
          postalAddress: record.postalAddress ?? "",
          permanentAddress: record.permanentAddress ?? "",
          qualifications:
            record.qualifications?.length > 0
              ? record.qualifications.map((qualification) => ({
                  degreeLevel: qualification.degreeLevel ?? "",
                  degreeTitle: qualification.degreeTitle ?? "",
                  boardOrUniversity: qualification.boardOrUniversity ?? "",
                  rollNumber: qualification.rollNumber ?? "",
                  seatOrEnrolmentNo: qualification.seatOrEnrolmentNo ?? "",
                  passingYear: qualification.passingYear ?? "",
                  majorSubjects: qualification.majorSubjects ?? "",
                  obtainedMarks: qualification.obtainedMarks ?? "",
                  totalMarks: qualification.totalMarks ?? "",
                  cgpa: qualification.cgpa ?? "",
                  gradeOrDivision: qualification.gradeOrDivision ?? "",
                  documentUrl: qualification.documentUrl ?? "",
                }))
              : EMPTY_ACADEMIC.qualifications,
        });
        setIsEditAllowed(record.isVerified ? true : user?.isEditAllowed !== false);
      }
    } catch (error) {
      if (error?.response?.status !== 404) {
        toast.error("Could not load your academic record", {
          description: extractApiError(error),
        });
      }
      setIsEditAllowed(user?.isEditAllowed !== false);
    } finally {
      setLoading(false);
    }
  }, [reset, user?.isEditAllowed]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const completion = useMemo(() => {
    const fields = [
      values.fatherName,
      values.cnicOrBForm,
      values.gender,
      values.dateOfBirth,
      values.domicileDistrict,
      values.postalAddress,
      values.permanentAddress,
    ];
    const filled = fields.filter((value) => String(value ?? "").trim().length > 0).length;
    const qualification = values.qualifications?.[0];
    const qualificationFilled = qualification?.degreeTitle && qualification?.boardOrUniversity ? 1 : 0;
    return Math.round(((filled + qualificationFilled) / 8) * 100);
  }, [values]);

  const onSubmit = async (formValues) => {
    if (!isEditAllowed) {
      toast.error("Editing is locked", {
        description: "The QEC has locked your academic record. Contact them to restore access.",
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formValues,
        qualifications: formValues.qualifications.map((qualification) => ({
          ...qualification,
          obtainedMarks: Number(qualification.obtainedMarks),
          totalMarks: Number(qualification.totalMarks),
          passingYear: Number(qualification.passingYear),
          percentage: computePercentage(qualification.obtainedMarks, qualification.totalMarks),
          cgpa: qualification.cgpa === "" || qualification.cgpa === undefined ? null : Number(qualification.cgpa),
        })),
      };

      await API.post("/user/academic", payload);
      setSavedAt(new Date());
      toast.success("Academic record saved", {
        description: "Your profile is now visible to the department and QEC panels.",
      });
    } catch (error) {
      toast.error("Could not save your record", { description: extractApiError(error) });
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadCV = async () => {
    setDownloading(true);
    try {
      await downloadFile("/user/download-cv", `${safeFileName(user?.name)}_UOK_Resume.pdf`);
      toast.success("CV downloaded");
    } catch (error) {
      toast.error("CV is not available yet", {
        description: error?.message ?? "Save your academic record before downloading the CV.",
      });
    } finally {
      setDownloading(false);
    }
  };

  const qualificationCount = values.qualifications?.length ?? 0;

  return (
    <AppShell>
      <PageHeader
        eyebrow={`${user?.department ?? "Faculty"} Department`}
        title={`Welcome, ${user?.name?.split(" ")[0] ?? "Faculty"}`}
        description="Keep your academic record accurate — it powers HEC ranking submissions, departmental audits and your auto-generated CV."
        actions={
          <>
            <Button
              variant="outline"
              colorPalette="navy"
              onClick={handleDownloadCV}
              loading={downloading}
              loadingText="Preparing..."
            >
              <Download size={16} />
              Download PDF CV
            </Button>
            <Button
              colorPalette="maroon"
              onClick={handleSubmit(onSubmit)}
              loading={saving}
              loadingText="Saving..."
              disabled={!isEditAllowed}
            >
              <Save size={16} />
              Save record
            </Button>
          </>
        }
      />

      <Alert.Root
        status={isEditAllowed ? "success" : "error"}
        borderRadius="xl"
        borderWidth="1px"
        alignItems="flex-start"
      >
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title fontSize="sm">
            {isEditAllowed ? "Profile editing is unlocked" : "Profile editing is locked by QEC"}
          </Alert.Title>
          <Alert.Description fontSize="sm">
            {isEditAllowed
              ? "You can update your personal details and qualifications. Every save is visible to your chairman, OEC and the QEC panel."
              : "Your record is read-only. Contact the Quality Enhancement Cell to request edit access again."}
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>

      <Stagger display="grid" gridTemplateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" }} gap={4}>
        <StatCard
          label="Record completion"
          value={`${completion}%`}
          hint="Personal details + first qualification"
          icon={CheckCircle2}
          colorPalette={completion === 100 ? "green" : "maroon"}
        />
        <StatCard
          label="Qualifications"
          value={qualificationCount}
          hint="Degrees listed in your record"
          icon={GraduationCap}
          colorPalette="navy"
        />
        <StatCard
          label="Edit access"
          value={isEditAllowed ? "Unlocked" : "Locked"}
          hint="Controlled by the QEC panel"
          icon={isEditAllowed ? Unlock : Lock}
          colorPalette={isEditAllowed ? "green" : "red"}
        />
        <StatCard
          label="Last saved"
          value={loading ? "Loading…" : savedAt ? savedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
          hint={
            loading
              ? "Fetching your academic record"
              : savedAt
                ? savedAt.toLocaleDateString()
                : "No changes saved in this session"
          }
          icon={Save}
          colorPalette="gold"
        />
      </Stagger>

      <SectionCard
        title="Personal & contact details"
        description="Exactly as printed on your official records"
        icon={User}
        accent="maroon"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack gap={6}>
            <FormSection title="Identity">
              <FormField label="Father / Guardian name" error={errors.fatherName?.message} required>
                <Input borderRadius="md" disabled={!isEditAllowed} {...register("fatherName")} />
              </FormField>

              <FormField label="CNIC / B-Form number" error={errors.cnicOrBForm?.message} required>
                <Input
                  borderRadius="md"
                  placeholder="42101-1234567-8"
                  disabled={!isEditAllowed}
                  {...register("cnicOrBForm")}
                />
              </FormField>

              <FormField label="Gender" error={errors.gender?.message} required>
                <NativeSelect.Root>
                  <NativeSelect.Field borderRadius="md" disabled={!isEditAllowed} {...register("gender")}>
                    <option value="">-- Select --</option>
                    {GENDERS.map((gender) => (
                      <option key={gender} value={gender}>
                        {gender}
                      </option>
                    ))}
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
              </FormField>

              <FormField label="Date of birth" error={errors.dateOfBirth?.message} required>
                <Input
                  type="date"
                  borderRadius="md"
                  disabled={!isEditAllowed}
                  {...register("dateOfBirth")}
                />
              </FormField>
            </FormSection>

            <FormSection title="Residency">
              <FormField label="Domicile district" error={errors.domicileDistrict?.message} required>
                <Input
                  borderRadius="md"
                  placeholder="Karachi"
                  disabled={!isEditAllowed}
                  {...register("domicileDistrict")}
                />
              </FormField>

              <FormField label="Postal address" error={errors.postalAddress?.message} required>
                <Textarea
                  borderRadius="md"
                  rows={3}
                  resize="vertical"
                  disabled={!isEditAllowed}
                  {...register("postalAddress")}
                />
              </FormField>

              <FormField
                label="Permanent address"
                error={errors.permanentAddress?.message}
                required
                gridColumn={{ base: "auto", md: "span 2" }}
              >
                <Textarea
                  borderRadius="md"
                  rows={3}
                  resize="vertical"
                  disabled={!isEditAllowed}
                  {...register("permanentAddress")}
                />
              </FormField>
            </FormSection>
          </Stack>
        </form>
      </SectionCard>

      <SectionCard
        title="Academic qualifications"
        description="Add every degree that should appear on your CV"
        icon={GraduationCap}
        accent="navy"
        actions={
          <Button
            size="sm"
            variant="outline"
            colorPalette="navy"
            disabled={!isEditAllowed}
            onClick={() =>
              append({
                degreeLevel: "",
                degreeTitle: "",
                boardOrUniversity: "",
                rollNumber: "",
                seatOrEnrolmentNo: "",
                passingYear: "",
                majorSubjects: "",
                obtainedMarks: "",
                totalMarks: "",
                cgpa: "",
                gradeOrDivision: "",
                documentUrl: "",
              })
            }
          >
            <Plus size={15} />
            Add qualification
          </Button>
        }
      >
        <Stack gap={4}>
          {errors.qualifications && (
            <Alert.Root status="error" borderRadius="lg" borderWidth="1px">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title fontSize="sm">
                  {errors.qualifications.message ??
                    errors.qualifications.root?.message ??
                    "Please fix the highlighted qualification fields."}
                </Alert.Title>
              </Alert.Content>
            </Alert.Root>
          )}

          {fields.map((field, index) => {
            const qualificationErrors = errors.qualifications?.[index] ?? {};
            return (
              <Box
                key={field.id}
                borderWidth="1px"
                borderColor="border"
                borderRadius="lg"
                bg="bg.subtle"
                overflow="hidden"
              >
                <Flex
                  px={4}
                  py={3}
                  align="center"
                  justify="space-between"
                  gap={3}
                  borderBottomWidth="1px"
                  borderColor="border"
                  bg="bg.panel"
                >
                  <HStack gap={2.5} minW={0}>
                    <Box
                      display="grid"
                      placeItems="center"
                      w="28px"
                      h="28px"
                      borderRadius="full"
                      bg="navy.subtle"
                      color="navy.fg"
                      fontSize="xs"
                      fontWeight="bold"
                    >
                      {index + 1}
                    </Box>
                    <Text fontWeight="semibold" color="fg" fontSize="sm" truncate>
                      {values.qualifications?.[index]?.degreeTitle || "New qualification"}
                    </Text>
                    {values.qualifications?.[index]?.degreeLevel && (
                      <Badge colorPalette="navy" variant="subtle" size="xs" borderRadius="full">
                        {values.qualifications[index].degreeLevel}
                      </Badge>
                    )}
                  </HStack>
                  <IconButton
                    aria-label="Remove qualification"
                    size="xs"
                    variant="ghost"
                    colorPalette="red"
                    disabled={!isEditAllowed || fields.length === 1}
                    onClick={() => remove(index)}
                  >
                    <Trash2 size={14} />
                  </IconButton>
                </Flex>

                <Box p={4}>
                  <Stack gap={5}>
                    <FormRow columns={{ base: 1, md: 3 }}>
                      <FormField
                        label="Degree level"
                        error={qualificationErrors.degreeLevel?.message}
                        required
                      >
                        <NativeSelect.Root>
                          <NativeSelect.Field
                            borderRadius="md"
                            disabled={!isEditAllowed}
                            {...register(`qualifications.${index}.degreeLevel`)}
                          >
                            <option value="">-- Select --</option>
                            {DEGREE_LEVELS.map((level) => (
                              <option key={level} value={level}>
                                {level}
                              </option>
                            ))}
                          </NativeSelect.Field>
                          <NativeSelect.Indicator />
                        </NativeSelect.Root>
                      </FormField>

                      <FormField
                        label="Degree title"
                        error={qualificationErrors.degreeTitle?.message}
                        required
                      >
                        <Input
                          borderRadius="md"
                          placeholder="Ph.D. in Computer Science"
                          disabled={!isEditAllowed}
                          {...register(`qualifications.${index}.degreeTitle`)}
                        />
                      </FormField>

                      <FormField
                        label="Board / University"
                        error={qualificationErrors.boardOrUniversity?.message}
                        required
                      >
                        <Input
                          borderRadius="md"
                          placeholder="University of Karachi"
                          disabled={!isEditAllowed}
                          {...register(`qualifications.${index}.boardOrUniversity`)}
                        />
                      </FormField>
                    </FormRow>

                    <FormRow columns={{ base: 1, md: 3 }}>
                      <FormField label="Roll number" error={qualificationErrors.rollNumber?.message}>
                        <Input
                          borderRadius="md"
                          disabled={!isEditAllowed}
                          {...register(`qualifications.${index}.rollNumber`)}
                        />
                      </FormField>

                      <FormField
                        label="Seat / enrolment no."
                        error={qualificationErrors.seatOrEnrolmentNo?.message}
                      >
                        <Input
                          borderRadius="md"
                          disabled={!isEditAllowed}
                          {...register(`qualifications.${index}.seatOrEnrolmentNo`)}
                        />
                      </FormField>

                      <FormField label="Passing year" error={qualificationErrors.passingYear?.message} required>
                        <Input
                          type="number"
                          borderRadius="md"
                          placeholder="2021"
                          disabled={!isEditAllowed}
                          {...register(`qualifications.${index}.passingYear`)}
                        />
                      </FormField>
                    </FormRow>

                    <FormRow columns={{ base: 1, md: 2 }}>
                      <FormField
                        label="Major / discipline"
                        error={qualificationErrors.majorSubjects?.message}
                      >
                        <Input
                          borderRadius="md"
                          placeholder="Software Engineering"
                          disabled={!isEditAllowed}
                          {...register(`qualifications.${index}.majorSubjects`)}
                        />
                      </FormField>

                      <FormField label="Grade / division" error={qualificationErrors.gradeOrDivision?.message}>
                        <Input
                          borderRadius="md"
                          placeholder="First Class"
                          disabled={!isEditAllowed}
                          {...register(`qualifications.${index}.gradeOrDivision`)}
                        />
                      </FormField>
                    </FormRow>

                    <FormRow columns={{ base: 2, md: 4 }}>
                      <FormField
                        label="Obtained marks"
                        error={qualificationErrors.obtainedMarks?.message}
                        required
                      >
                        <Input
                          type="number"
                          borderRadius="md"
                          disabled={!isEditAllowed}
                          {...register(`qualifications.${index}.obtainedMarks`)}
                        />
                      </FormField>

                      <FormField
                        label="Total marks"
                        error={qualificationErrors.totalMarks?.message}
                        required
                      >
                        <Input
                          type="number"
                          borderRadius="md"
                          disabled={!isEditAllowed}
                          {...register(`qualifications.${index}.totalMarks`)}
                        />
                      </FormField>

                      <FormField label="Percentage (auto)" helperText="Calculated on save">
                        <Input
                          borderRadius="md"
                          readOnly
                          value={
                            values.qualifications?.[index]?.totalMarks
                              ? `${computePercentage(
                                  values.qualifications[index].obtainedMarks,
                                  values.qualifications[index].totalMarks,
                                )}%`
                              : ""
                          }
                        />
                      </FormField>

                      <FormField label="CGPA (optional)" error={qualificationErrors.cgpa?.message}>
                        <Input
                          type="number"
                          step="0.01"
                          borderRadius="md"
                          placeholder="3.75"
                          disabled={!isEditAllowed}
                          {...register(`qualifications.${index}.cgpa`)}
                        />
                      </FormField>
                    </FormRow>
                  </Stack>
                </Box>
              </Box>
            );
          })}

          <Flex justify="flex-end" gap={3} pt={2}>
            <Button
              colorPalette="maroon"
              onClick={handleSubmit(onSubmit)}
              loading={saving}
              loadingText="Saving..."
              disabled={!isEditAllowed}
              size="lg"
            >
              <Save size={17} />
              Save academic record
            </Button>
          </Flex>

          {!isEditAllowed && (
            <HStack
              gap={2.5}
              px={4}
              py={3}
              borderRadius="lg"
              bg="red.subtle"
              color="red.fg"
              fontSize="sm"
            >
              <AlertTriangle size={16} />
              <Text>Editing is disabled — the QEC has locked this profile.</Text>
            </HStack>
          )}
        </Stack>
      </SectionCard>

      <Progress.Root
        value={completion}
        size="sm"
        colorPalette={completion === 100 ? "green" : "maroon"}
        borderRadius="full"
      >
        <Progress.Track borderRadius="full" bg="bg.muted">
          <Progress.Range borderRadius="full" />
        </Progress.Track>
      </Progress.Root>

      <Text fontSize="xs" color="fg.subtle" textAlign="center">
        {isDirty ? "You have unsaved changes." : "All changes are saved."}
      </Text>
    </AppShell>
  );
}
