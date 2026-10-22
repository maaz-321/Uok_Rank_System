import { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Drawer,
  Flex,
  Grid,
  HStack,
  Portal,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Download, GraduationCap, Mail, MapPin, Phone, User } from "lucide-react";
import { toast } from "sonner";
import API, { downloadFile, extractApiError } from "../../api/axiosInstance";
import { formatDate, initials, safeFileName } from "../../lib/format";
import RoleBadge, { LockBadge } from "../ui/RoleBadge";
import EmptyStateCard from "../ui/EmptyStateCard";

function DetailRow({ icon: Icon, label, value }) {
  return (
    <HStack gap={3} align="flex-start">
      <Box color="fg.subtle" pt="2px">
        <Icon size={15} />
      </Box>
      <Stack gap={0}>
        <Text fontSize="xs" fontWeight="bold" letterSpacing="wide" textTransform="uppercase" color="fg.subtle">
          {label}
        </Text>
        <Text fontSize="sm" color="fg">
          {value || "—"}
        </Text>
      </Stack>
    </HStack>
  );
}

export default function FacultyDetailDrawer({ user, open, onClose }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const load = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const res = await API.get(`/admin/users/${user._id}`);
      setDetails(res.data ?? null);
    } catch (error) {
      toast.error("Could not load faculty details", { description: extractApiError(error) });
      setDetails(null);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadFile(`/admin/download-cv/${user._id}`, `${safeFileName(user.name)}_Resume.pdf`);
      toast.success("CV downloaded");
    } catch (error) {
      toast.error("CV unavailable", {
        description: error?.message ?? "This faculty member has not submitted an academic form yet.",
      });
    } finally {
      setDownloading(false);
    }
  };

  const academic = details?.academic;

  return (
    <Drawer.Root open={open} onOpenChange={(detailsState) => !detailsState.open && onClose()} size="md" placement="end">
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content borderLeftWidth="1px" borderColor="border" bg="bg.panel">
            <Drawer.Header borderBottomWidth="1px" borderColor="border" pb={4}>
              <HStack gap={3}>
                <Box
                  display="grid"
                  placeItems="center"
                  w="42px"
                  h="42px"
                  borderRadius="full"
                  bg="maroon.subtle"
                  color="maroon.fg"
                  fontWeight="bold"
                >
                  {initials(user?.name)}
                </Box>
                <Stack gap={0.5}>
                  <Text fontFamily="heading" fontWeight="bold" color="fg">
                    {user?.name}
                  </Text>
                  <HStack gap={2}>
                    <RoleBadge role={user?.role} />
                    <LockBadge isAllowed={Boolean(user?.isEditAllowed)} />
                  </HStack>
                </Stack>
              </HStack>
            </Drawer.Header>

            <Drawer.Body py={6}>
              {loading ? (
                <Stack gap={3}>
                  <Skeleton h="80px" borderRadius="lg" />
                  <Skeleton h="120px" borderRadius="lg" />
                  <Skeleton h="180px" borderRadius="lg" />
                </Stack>
              ) : (
                <Stack gap={6}>
                  <Box borderWidth="1px" borderColor="border" borderRadius="lg" p={4} bg="bg.subtle">
                    <Grid columns={{ base: 1, sm: 2 }} gap={4}>
                      <DetailRow icon={Mail} label="Email" value={user?.email} />
                      <DetailRow icon={User} label="Department" value={user?.department} />
                      <DetailRow icon={Phone} label="Phone" value={details?.user?.phone} />
                      <DetailRow
                        icon={MapPin}
                        label="Domicile district"
                        value={academic?.domicileDistrict}
                      />
                      <DetailRow
                        icon={GraduationCap}
                        label="Date of birth"
                        value={formatDate(academic?.dateOfBirth)}
                      />
                      <DetailRow
                        icon={User}
                        label="Registered on"
                        value={formatDate(user?.createdAt)}
                      />
                    </Grid>
                  </Box>

                  <Stack gap={3}>
                    <Text
                      fontFamily="heading"
                      fontSize="xs"
                      fontWeight="bold"
                      letterSpacing="widest"
                      textTransform="uppercase"
                      color="maroon.fg"
                    >
                      Qualifications
                    </Text>

                    {academic?.qualifications?.length ? (
                      academic.qualifications.map((qualification, index) => (
                        <Box
                          key={qualification._id ?? index}
                          borderWidth="1px"
                          borderColor="border"
                          borderRadius="lg"
                          p={4}
                        >
                          <Flex justify="space-between" gap={3} align="flex-start">
                            <Stack gap={0.5}>
                              <Text fontWeight="semibold" color="fg" fontSize="sm">
                                {qualification.degreeTitle}
                              </Text>
                              <Text fontSize="xs" color="fg.muted">
                                {qualification.boardOrUniversity}
                              </Text>
                            </Stack>
                            <Badge colorPalette="navy" variant="subtle" borderRadius="full">
                              {qualification.degreeLevel}
                            </Badge>
                          </Flex>
                          <Grid columns={{ base: 2, sm: 4 }} gap={3} mt={3}>
                            <DetailRow icon={User} label="Passing year" value={qualification.passingYear} />
                            <DetailRow icon={User} label="Marks" value={`${qualification.obtainedMarks} / ${qualification.totalMarks}`} />
                            <DetailRow icon={User} label="Percentage" value={`${qualification.percentage ?? "—"}%`} />
                            <DetailRow icon={User} label="CGPA" value={qualification.cgpa ?? "—"} />
                            <DetailRow icon={User} label="Roll no." value={qualification.rollNumber} />
                            <DetailRow icon={User} label="Division" value={qualification.gradeOrDivision} />
                          </Grid>
                        </Box>
                      ))
                    ) : (
                      <EmptyStateCard
                        compact
                        icon={GraduationCap}
                        title="No qualifications submitted"
                        description="This faculty member has not completed the academic web form yet."
                      />
                    )}
                  </Stack>
                </Stack>
              )}
            </Drawer.Body>

            <Drawer.Footer borderTopWidth="1px" borderColor="border" gap={3}>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button
                colorPalette="maroon"
                onClick={handleDownload}
                loading={downloading}
                loadingText="Preparing..."
              >
                <Download size={16} />
                Download CV
              </Button>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
