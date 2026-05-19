<script setup lang="ts">
import { Search, ArrowUpDown, MoreHorizontal, Pencil, Eye, ToggleLeft, ToggleRight, Save } from "lucide-vue-next"
import { ref, reactive, computed, watch } from "vue"
import { toast } from "vue-sonner"
import { mockCommands } from "~/composables/mock-data"
import { Checkbox } from "~/components/ui/checkbox"
import { fetchCommands, updateCommand, enableCommand, disableCommand } from "~/lib/api"
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

const { data: apiCommands, refresh } = await useAsyncData("commands", fetchCommands, { default: () => [] })
const commands = computed(() => apiCommands.value?.length ? apiCommands.value : mockCommands)

const search = ref("")
const sorting = ref<SortingState>([])
const rowSelection = ref({})
const categoryFilter = ref("all")
const columnFilters = ref<ColumnFiltersState>([])

const categories = computed(() => [...new Set(commands.value.map((c: any) => c.category))])

watch(categoryFilter, (val) => {
  if (val === "all") {
    columnFilters.value = []
  } else {
    columnFilters.value = [{ id: "category", value: val }]
  }
})
const editDialogOpen = ref(false)
const detailDialogOpen = ref(false)
const toggleDialogOpen = ref(false)

const editingCommand = reactive({
  name: "",
  category: "",
  enabled: true,
})
const viewingCommand = ref<(typeof mockCommands)[0] | null>(null)
const toggleTargetCommand = ref<(typeof mockCommands)[0] | null>(null)

function openEditDialog(cmd: (typeof mockCommands)[0]) {
  editingCommand.name = cmd.name
  editingCommand.category = cmd.category
  editingCommand.enabled = cmd.enabled
  editDialogOpen.value = true
}

function openDetailDialog(cmd: (typeof mockCommands)[0]) {
  viewingCommand.value = cmd
  detailDialogOpen.value = true
}

function openToggleDialog(cmd: (typeof mockCommands)[0]) {
  toggleTargetCommand.value = cmd
  toggleDialogOpen.value = true
}

function handleSaveCommand() {
  updateCommand(editingCommand.name, {
    category: editingCommand.category,
    enabled: editingCommand.enabled,
  }).then(() => {
    refresh()
    toast.success("Command Updated", { description: `.${editingCommand.name} settings have been saved` })
  })
  editDialogOpen.value = false
}

function handleConfirmToggle() {
  if (toggleTargetCommand.value) {
    if (toggleTargetCommand.value.enabled) {
      disableCommand(toggleTargetCommand.value.name).then(() => {
        refresh()
        toast.warning("Command Disabled", { description: `.${toggleTargetCommand.value!.name} is now disabled for all users` })
      })
    } else {
      enableCommand(toggleTargetCommand.value.name).then(() => {
        refresh()
        toast.success("Command Enabled", { description: `.${toggleTargetCommand.value!.name} is now available for all users` })
      })
    }
  }
  toggleDialogOpen.value = false
}

const columns: ColumnDef<(typeof mockCommands)[0]>[] = [
  {
    id: "select",
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: "Command",
  },
  {
    accessorKey: "category",
    header: "Category",
    filterFn: "equals",
  },
  {
    accessorKey: "usageCount",
    header: "Usage",
  },
  {
    accessorKey: "enabled",
    header: "Status",
  },
  {
    id: "actions",
    header: "Action",
  },
]

const table = useVueTable({
  get data() { return commands.value },
  columns,
  state: {
    get sorting() { return sorting.value },
    get globalFilter() { return search.value },
    get rowSelection() { return rowSelection.value },
    get columnFilters() { return columnFilters.value },
  },
  onSortingChange: (updater) => {
    sorting.value = typeof updater === "function" ? updater(sorting.value) : updater
  },
  onRowSelectionChange: (updater) => {
    rowSelection.value = typeof updater === "function" ? updater(rowSelection.value) : updater
  },
  onColumnFiltersChange: (updater) => {
    columnFilters.value = typeof updater === "function" ? updater(columnFilters.value) : updater
  },
  enableRowSelection: true,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Commands</h1>
      <p class="text-sm text-muted-foreground">Manage bot commands</p>
    </div>

    <div class="flex items-center gap-4">
      <div class="relative flex-1 max-w-sm">
        <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input v-model="search" placeholder="Search commands..." class="pl-9" />
      </div>
      <Select v-model="categoryFilter">
        <SelectTrigger class="w-40">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem v-for="cat in categories" :key="cat" :value="cat" class="capitalize">
            {{ cat.charAt(0).toUpperCase() + cat.slice(1) }}
          </SelectItem>
        </SelectContent>
      </Select>
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
            <TableCell class="font-medium font-mono">{{ row.original.name }}</TableCell>
            <TableCell>
              <Badge variant="outline" class="capitalize">{{ row.original.category }}</Badge>
            </TableCell>
            <TableCell>{{ (row.original.usageCount || 0).toLocaleString() }}</TableCell>
            <TableCell>
              <Badge :variant="row.original.enabled ? 'default' : 'secondary'">
                {{ row.original.enabled ? "Enabled" : "Disabled" }}
              </Badge>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal class="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="openEditDialog(row.original)">
                    <Pencil class="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="openDetailDialog(row.original)">
                    <Eye class="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem :class="row.original.enabled ? 'text-destructive' : ''" @click="openToggleDialog(row.original)">
                    <ToggleLeft v-if="row.original.enabled" class="mr-2 h-4 w-4" />
                    <ToggleRight v-else class="mr-2 h-4 w-4" />
                    {{ row.original.enabled ? 'Disable' : 'Enable' }}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
          <TableRow v-if="table.getRowModel().rows.length === 0">
            <TableCell :colspan="columns.length" class="h-24 text-center text-muted-foreground">
              No commands found.
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

    <!-- Edit Command Dialog -->
    <Dialog v-model:open="editDialogOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Command</DialogTitle>
          <DialogDescription>Update command settings</DialogDescription>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <Label>Command Name</Label>
            <Input v-model="editingCommand.name" />
          </div>
          <div class="space-y-2">
            <Label>Category</Label>
            <Select v-model="editingCommand.category">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="cat in categories" :key="cat" :value="cat">
                  {{ cat.charAt(0).toUpperCase() + cat.slice(1) }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium">Enabled</p>
              <p class="text-xs text-muted-foreground">Allow users to use this command</p>
            </div>
            <Switch v-model:checked="editingCommand.enabled" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="editDialogOpen = false">Cancel</Button>
          <Button @click="handleSaveCommand">
            <Save class="mr-2 h-4 w-4" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- View Details Dialog -->
    <Dialog v-model:open="detailDialogOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Command Details</DialogTitle>
          <DialogDescription>Full command information</DialogDescription>
        </DialogHeader>
        <div v-if="viewingCommand" class="space-y-4 py-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-muted-foreground">Command</p>
              <p class="text-sm font-medium font-mono">.{{ viewingCommand.name }}</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Category</p>
              <Badge variant="outline">{{ viewingCommand.category }}</Badge>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Usage Count</p>
              <p class="text-sm font-medium">{{ (viewingCommand.usageCount || 0).toLocaleString() }}</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Status</p>
              <Badge :variant="viewingCommand.enabled ? 'default' : 'secondary'">
                {{ viewingCommand.enabled ? "Enabled" : "Disabled" }}
              </Badge>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="detailDialogOpen = false">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Enable/Disable Confirmation Dialog -->
    <Dialog v-model:open="toggleDialogOpen">
      <DialogContent class="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {{ toggleTargetCommand?.enabled ? 'Disable Command' : 'Enable Command' }}
          </DialogTitle>
          <DialogDescription>
            {{ toggleTargetCommand?.enabled
              ? `Are you sure you want to disable .${toggleTargetCommand?.name}? Users will no longer be able to use this command.`
              : `Are you sure you want to enable .${toggleTargetCommand?.name}? Users will be able to use this command again.`
            }}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-2">
          <Button variant="outline" @click="toggleDialogOpen = false">Cancel</Button>
          <Button
            :variant="toggleTargetCommand?.enabled ? 'destructive' : 'default'"
            @click="handleConfirmToggle"
          >
            <ToggleLeft v-if="toggleTargetCommand?.enabled" class="mr-2 h-4 w-4" />
            <ToggleRight v-else class="mr-2 h-4 w-4" />
            {{ toggleTargetCommand?.enabled ? 'Disable' : 'Enable' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
