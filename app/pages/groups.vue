<script setup lang="ts">
import { Search, MoreHorizontal, ArrowUpDown, Pencil, Eye, ShieldOff, Shield, Save } from "lucide-vue-next"
import { ref, reactive } from "vue"
import { mockGroups } from "~/composables/mock-data"
import { Checkbox } from "~/components/ui/checkbox"
import {
  useVueTable,
  FlexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type SortingState,
} from "@tanstack/vue-table"

const search = ref("")
const sorting = ref<SortingState>([])
const rowSelection = ref({})

const editDialogOpen = ref(false)
const detailDialogOpen = ref(false)
const muteDialogOpen = ref(false)
const editingGroup = reactive({
  name: "",
  jid: "",
  status: "" as "active" | "muted",
  welcome: false,
  antiSpam: false,
})
const viewingGroup = ref<(typeof mockGroups)[0] | null>(null)
const muteTargetGroup = ref<(typeof mockGroups)[0] | null>(null)

function openEditDialog(group: (typeof mockGroups)[0]) {
  editingGroup.name = group.name
  editingGroup.jid = group.jid
  editingGroup.status = group.status
  editingGroup.welcome = group.welcome
  editingGroup.antiSpam = group.antiSpam
  editDialogOpen.value = true
}

function openDetailDialog(group: (typeof mockGroups)[0]) {
  viewingGroup.value = group
  detailDialogOpen.value = true
}

function openMuteDialog(group: (typeof mockGroups)[0]) {
  muteTargetGroup.value = group
  muteDialogOpen.value = true
}

function handleConfirmMute() {
  muteDialogOpen.value = false
}

function handleSaveGroup() {
  editDialogOpen.value = false
}
const columns: ColumnDef<(typeof mockGroups)[0]>[] = [
  {
    id: "select",
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "members",
    header: "Members",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "welcome",
    header: "Welcome",
  },
  {
    accessorKey: "antiSpam",
    header: "Anti-Spam",
  },
  {
    id: "actions",
    header: "Action",
  },
]

const table = useVueTable({
  data: mockGroups,
  columns,
  state: {
    get sorting() { return sorting.value },
    get globalFilter() { return search.value },
    get rowSelection() { return rowSelection.value },
  },
  onSortingChange: (updater) => {
    sorting.value = typeof updater === "function" ? updater(sorting.value) : updater
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
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Groups</h1>
      <p class="text-sm text-muted-foreground">Manage your bot's group settings</p>
    </div>

    <div class="flex items-center gap-4">
      <div class="relative flex-1 max-w-sm">
        <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input v-model="search" placeholder="Search groups..." class="pl-9" />
      </div>
      <Badge variant="secondary">{{ table.getFilteredRowModel().rows.length }} groups</Badge>
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
            <TableCell class="font-medium">{{ row.original.name }}</TableCell>
            <TableCell>{{ row.original.members }}</TableCell>
            <TableCell>
              <Badge :variant="row.original.status === 'active' ? 'default' : 'secondary'">
                {{ row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1) }}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge :variant="row.original.welcome ? 'default' : 'outline'">
                {{ row.original.welcome ? "On" : "Off" }}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge :variant="row.original.antiSpam ? 'default' : 'outline'">
                {{ row.original.antiSpam ? "On" : "Off" }}
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
                  <DropdownMenuItem :class="row.original.status === 'active' ? 'text-destructive' : ''" @click="openMuteDialog(row.original)">
                    <ShieldOff v-if="row.original.status === 'active'" class="mr-2 h-4 w-4" />
                    <Shield v-else class="mr-2 h-4 w-4" />
                    {{ row.original.status === 'active' ? 'Mute Group' : 'Unmute Group' }}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
          <TableRow v-if="table.getRowModel().rows.length === 0">
            <TableCell :colspan="columns.length" class="h-24 text-center text-muted-foreground">
              No groups found.
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
    <!-- Edit Group Dialog -->
    <Dialog v-model:open="editDialogOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Group</DialogTitle>
          <DialogDescription>Update group settings</DialogDescription>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <Label>Name</Label>
            <Input v-model="editingGroup.name" />
          </div>
          <div class="space-y-2">
            <Label>Status</Label>
            <Select v-model="editingGroup.status">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="muted">Muted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium">Welcome Message</p>
              <p class="text-xs text-muted-foreground">Greet new members automatically</p>
            </div>
            <Switch v-model:checked="editingGroup.welcome" />
          </div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium">Anti-Spam</p>
              <p class="text-xs text-muted-foreground">Filter spam messages</p>
            </div>
            <Switch v-model:checked="editingGroup.antiSpam" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="editDialogOpen = false">Cancel</Button>
          <Button @click="handleSaveGroup">
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
          <DialogTitle>Group Details</DialogTitle>
          <DialogDescription>Full group information</DialogDescription>
        </DialogHeader>
        <div v-if="viewingGroup" class="space-y-4 py-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-muted-foreground">Name</p>
              <p class="text-sm font-medium">{{ viewingGroup.name }}</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Status</p>
              <Badge :variant="viewingGroup.status === 'active' ? 'default' : 'secondary'">
                {{ viewingGroup.status.charAt(0).toUpperCase() + viewingGroup.status.slice(1) }}
              </Badge>
            </div>
            <div class="col-span-2">
              <p class="text-xs text-muted-foreground">JID</p>
              <p class="text-sm font-mono">{{ viewingGroup.jid }}</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Members</p>
              <p class="text-sm font-medium">{{ viewingGroup.members }}</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Welcome</p>
              <Badge :variant="viewingGroup.welcome ? 'default' : 'outline'">
                {{ viewingGroup.welcome ? "On" : "Off" }}
              </Badge>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Anti-Spam</p>
              <Badge :variant="viewingGroup.antiSpam ? 'default' : 'outline'">
                {{ viewingGroup.antiSpam ? "On" : "Off" }}
              </Badge>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="detailDialogOpen = false">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Mute/Unmute Confirmation Dialog -->
    <Dialog v-model:open="muteDialogOpen">
      <DialogContent class="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {{ muteTargetGroup?.status === 'active' ? 'Mute Group' : 'Unmute Group' }}
          </DialogTitle>
          <DialogDescription>
            {{ muteTargetGroup?.status === 'active'
              ? `Are you sure you want to mute ${muteTargetGroup?.name}? The bot will stop responding in this group.`
              : `Are you sure you want to unmute ${muteTargetGroup?.name}? The bot will start responding in this group again.`
            }}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-2">
          <Button variant="outline" @click="muteDialogOpen = false">Cancel</Button>
          <Button
            :variant="muteTargetGroup?.status === 'active' ? 'destructive' : 'default'"
            @click="handleConfirmMute"
          >
            <ShieldOff v-if="muteTargetGroup?.status === 'active'" class="mr-2 h-4 w-4" />
            <Shield v-else class="mr-2 h-4 w-4" />
            {{ muteTargetGroup?.status === 'active' ? 'Mute' : 'Unmute' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
