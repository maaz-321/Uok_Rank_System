import { useMemo, useState } from "react";
import {
  Flex,
  HStack,
  IconButton,
  Input,
  InputGroup,
  Pagination,
  Portal,
  Select,
  Table,
  Text,
  createListCollection,
} from "@chakra-ui/react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import EmptyStateCard from "./EmptyStateCard";

/**
 * Generic data table built on TanStack Table v9 + Chakra UI table primitives.
 *
 * columns: [{ id, header, accessorKey / accessorFn, cell, meta: { align } }]
 */
export default function DataTable({
  data,
  columns,
  searchKeys = [],
  searchPlaceholder = "Search records...",
  initialPageSize = 8,
  emptyTitle = "No records found",
  emptyDescription = "Try adjusting your search or filters.",
  emptyIcon,
  toolbar,
  onRowClick,
  caption,
}) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, _columnId, value) => {
      if (!value) return true;
      const needle = String(value).toLowerCase();
      return searchKeys.some((key) => {
        const cell = row.original?.[key];
        return cell !== undefined && cell !== null && String(cell).toLowerCase().includes(needle);
      });
    },
    initialState: { pagination: { pageSize: initialPageSize } },
  });

  const rows = table.getRowModel().rows;
  const total = table.getFilteredRowModel().rows.length;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;

  const pageSizeOptions = useMemo(
    () => [...new Set([initialPageSize, initialPageSize * 2, initialPageSize * 4])],
    [initialPageSize],
  );

  const pageSizeItems = useMemo(
    () => pageSizeOptions.map((size) => ({ label: `${size} rows`, value: String(size) })),
    [pageSizeOptions],
  );

  const pageSizeCollection = useMemo(
    () => createListCollection({ items: pageSizeItems }),
    [pageSizeItems],
  );

  return (
    <Flex direction="column" gap={4}>
      {(searchKeys.length > 0 || toolbar) && (
        <Flex gap={3} wrap="wrap" align="center" justify="space-between">
          <InputGroup
            maxW={{ base: "full", sm: "340px" }}
            startElement={<Search size={16} />}
            startElementProps={{ color: "fg.subtle" }}
            endElement={
              globalFilter ? (
                <IconButton
                  aria-label="Clear search"
                  size="xs"
                  variant="ghost"
                  onClick={() => setGlobalFilter("")}
                >
                  <X size={14} />
                </IconButton>
              ) : null
            }
          >
            <Input
              placeholder={searchPlaceholder}
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              borderRadius="md"
              aria-label={searchPlaceholder}
            />
          </InputGroup>

          <HStack gap={3} ml="auto">
            {toolbar}
            <Select.Root
              size="sm"
              width="auto"
              collection={pageSizeCollection}
              value={[String(pageSize)]}
              onValueChange={(details) => {
                const next = details.value?.[0];
                if (next) table.setPageSize(Number(next));
              }}
            >
              <Select.HiddenSelect />
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder="Rows" />
                  <Select.Indicator />
                </Select.Trigger>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    <Select.List>
                      {pageSizeCollection.items.map((item) => (
                        <Select.Item key={item.value} item={item}>
                          <Select.ItemText>{item.label}</Select.ItemText>
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.List>
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
          </HStack>
        </Flex>
      )}

      {rows.length === 0 ? (
        <EmptyStateCard icon={emptyIcon} title={emptyTitle} description={emptyDescription} compact />
      ) : (
        <Table.ScrollArea
          borderWidth="1px"
          borderColor="border"
          borderRadius="lg"
          bg="bg.panel"
        >
          <Table.Root size="sm" interactive={Boolean(onRowClick)} variant="line">
            {caption && <Table.Caption>{caption}</Table.Caption>}
            <Table.Header>
              {table.getHeaderGroups().map((headerGroup) => (
                <Table.Row key={headerGroup.id} bg="bg.subtle">
                  {headerGroup.headers.map((header) => {
                    const sortable = header.column.getCanSort();
                    const align = header.column.columnDef.meta?.align ?? "left";
                    const sorted = header.column.getIsSorted();
                    return (
                      <Table.ColumnHeader
                        key={header.id}
                        aria-sort={
                          sorted === "asc"
                            ? "ascending"
                            : sorted === "desc"
                              ? "descending"
                              : "none"
                        }
                        textAlign={align}
                        whiteSpace="nowrap"
                        color="fg.muted"
                        fontSize="xs"
                        letterSpacing="wide"
                        textTransform="uppercase"
                      >
                        {header.isPlaceholder ? null : sortable ? (
                          <HStack
                            as="button"
                            type="button"
                            justify={align === "right" ? "flex-end" : "flex-start"}
                            gap={1}
                            w="full"
                            onClick={header.column.getToggleSortingHandler()}
                            _hover={{ color: "maroon.fg" }}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {sorted === "asc" ? (
                              <ArrowUp size={13} />
                            ) : sorted === "desc" ? (
                              <ArrowDown size={13} />
                            ) : (
                              <ArrowUpDown size={13} opacity={0.5} />
                            )}
                          </HStack>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </Table.ColumnHeader>
                    );
                  })}
                </Table.Row>
              ))}
            </Table.Header>

            <Table.Body>
              {rows.map((row) => (
                <Table.Row
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  cursor={onRowClick ? "pointer" : "default"}
                  _hover={{ bg: "bg.subtle" }}
                >
                  {row.getVisibleCells().map((cell) => {
                    const align = cell.column.columnDef.meta?.align ?? "left";
                    return (
                      <Table.Cell key={cell.id} textAlign={align} whiteSpace="nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </Table.Cell>
                    );
                  })}
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>
      )}

      {rows.length > 0 && (
        <Flex align="center" justify="space-between" gap={3} wrap="wrap">
          <Text fontSize="xs" color="fg.muted">
            Showing{" "}
            <Text as="span" fontWeight="bold" color="fg">
              {pageIndex * pageSize + 1}–{Math.min((pageIndex + 1) * pageSize, total)}
            </Text>{" "}
            of <Text as="span" fontWeight="bold" color="fg">{total}</Text> records
          </Text>

          <Pagination.Root
            size="sm"
            count={table.getPageCount()}
            page={pageIndex + 1}
            onPageChange={(details) => table.setPageIndex(details.page - 1)}
          >
            <HStack gap={1}>
              <Pagination.PrevTrigger asChild>
                <IconButton aria-label="Previous page" variant="outline" size="sm">
                  <ChevronLeft size={15} />
                </IconButton>
              </Pagination.PrevTrigger>
              <Pagination.Items
                render={(page) => (
                  <Pagination.Item key={page.value} value={page.value}>
                    {page.value}
                  </Pagination.Item>
                )}
              />
              <Pagination.NextTrigger asChild>
                <IconButton aria-label="Next page" variant="outline" size="sm">
                  <ChevronRight size={15} />
                </IconButton>
              </Pagination.NextTrigger>
            </HStack>
          </Pagination.Root>
        </Flex>
      )}
    </Flex>
  );
}
