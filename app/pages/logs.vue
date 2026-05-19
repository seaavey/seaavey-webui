<script setup lang="ts">
import { ref } from "vue"
import { ArrowUpDown } from "lucide-vue-next"
import { mockLogs } from "~/composables/mock-data"
import { Checkbox } from "~/components/ui/checkbox"
import { fetchLogs } from "~/lib/api"
import {
  useVueTable,
  FlexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/vue-table"

const { data: apiLogs } = await useAsyncData("logs", () => fetchLogs(), { default: () => [] })
const logs = computed(() => apiLogs.value?.length ? apiLogs.value : mockLogs)

const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const rowSelection = ref({})
const levelFilter = ref("all")

function setLevelFilter(level: string) {
  levelFilter.value = level
  if (level === "all") {
    columnFilters.value = []
  } else {
    columnFilters.value = [{ id: "level", value: level }]
  }
}

const columns: ColumnDef<(typeof mockLogs)[0]>[] = [
  {
    id: "select",
    enableSorting: false,
  },
  {
    accessorKey: "timestamp",
    header: "Timestamp",
  },
  {
    accessorKey: "level",
    header: "Level",
    filterFn: "equals",
  },
  {
    accessorKey: "message",
    header: "Message",
  },
]

const table = useVueTable({
  get data() { return logs.value },
  columns,
  state: {
    get sorting() { return sorting.value },
    get columnFilters() { return columnFilters.value },
    get rowSelection() { return rowSelection.value },
  },
  onSortingChange: (updater) => {
    sorting.value = typeof updater === "function" ? updater(sorting.value) : updater
  },
  onColumnFiltersChange: (updater) => {
    columnFilters.value = typeof updater === "function" ? updater(columnFilters.value) : updater
  },
  onRowSelectionChange: (updater) => {
    rowSelection.value = typeof updater === "function" ? updater(rowSelection.value) : updater
  },
  enableRowSelection: true,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
})

function levelColor(level: string) {
  switch (level) {
    case "info": return "text-blue-500"
    case "warn": return "text-amber-500"
    case "error": return "text-red-500"
    default: return "text-muted-foreground"
  }
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Logs</h1>
      <p class="text-sm text-muted-foreground">Bot activity logs</p>
    </div>

    <div class="flex items-center gap-2">
      <Button
        v-for="level in ['all', 'info', 'warn', 'error']"
        :key="level"
        :variant="levelFilter === level ? 'default' : 'outline'"
        size="sm"
        @click="setLevelFilter(level)"
      >
        {{ level === "all" ? "All" : level.charAt(0).toUpperCase() + level.slice(1) }}
      </Button>
      <Badge variant="secondary" class="ml-2">{{ table.getFilteredRowModel().rows.length }} entries</Badge>
    </div>

    <Card>
      <Table>
        <TableHeader>
          <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <TableHead v-for="header in headerGroup.headers" :key="header.id">
              <template v-if="header.id === 'select'">
                <Checkbox
                  :model-value="table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? 'indeterminate' : false"
                  @update:model-value="(val) => table.toggleAllPageRowsSelected(!!val)"
                />
              </template>
              <template v-else>
                <div
                  class="flex items-center gap-1"
                  :class="header.column.getCanSort() ? 'cursor-pointer select-none' : ''"
                  @click="header.column.getToggleSortingHandler()?.($event)"
                >
                  <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
                  <ArrowUpDown v-if="header.column.getCanSort()" class="h-3 w-3 text-muted-foreground" />
                </div>
              </template>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="row in table.getRowModel().rows" :key="row.id" :data-state="row.getIsSelected() ? 'selected' : undefined">
            <TableCell>
              <Checkbox
                :model-value="row.getIsSelected()"
                @update:model-value="(val) => row.toggleSelected(!!val)"
              />
            </TableCell>
            <TableCell class="shrink-0 text-xs text-muted-foreground font-mono whitespace-nowrap">
              {{ row.original.timestamp }}
            </TableCell>
            <TableCell>
              <Badge
                :class="levelColor(row.original.level)"
                variant="outline"
                class="uppercase text-xs"
              >
                {{ row.original.level }}
              </Badge>
            </TableCell>
            <TableCell class="text-sm">{{ row.original.message }}</TableCell>
          </TableRow>
          <TableRow v-if="table.getRowModel().rows.length === 0">
            <TableCell :colspan="columns.length" class="h-24 text-center text-muted-foreground">
              No logs found.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>

    <!-- Pagination -->
    <div class="flex items-center justify-between">
      <p class="text-sm text-muted-foreground">
        {{ table.getFilteredSelectedRowModel().rows.length }} of {{ table.getFilteredRowModel().rows.length }} selected
      </p>
      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" :disabled="!table.getCanPreviousPage()" @click="table.previousPage()">
          Previous
        </Button>
        <Button variant="outline" size="sm" :disabled="!table.getCanNextPage()" @click="table.nextPage()">
          Next
        </Button>
      </div>
    </div>
  </div>
</template>
