<script setup lang="ts">
import { Search, MoreHorizontal, ArrowUpDown, Pencil, Eye, Ban, UserCheck, Save } from "lucide-vue-next"
import { ref, reactive } from "vue"
import { toast } from "vue-sonner"
import { Checkbox } from "~/components/ui/checkbox"
import { fetchUsers, updateUser, banUser, unbanUser } from "~/lib/api"
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

const { data: apiUsers, refresh } = await useAsyncData("users", fetchUsers, { default: () => [], server: false })
const users = computed(() => apiUsers.value)

const search = ref("")
const sorting = ref<SortingState>([])
const rowSelection = ref({})

interface User {
  jid: string
  name: string
  status: "active" | "banned"
  lastSeen?: string
  commands?: number
}

const editDialogOpen = ref(false)
const detailDialogOpen = ref(false)
const banDialogOpen = ref(false)
const editingUser = reactive({
  name: "",
  jid: "",
  status: "" as "active" | "banned",
})
const viewingUser = ref<User | null>(null)
const banTargetUser = ref<User | null>(null)

function openEditDialog(user: User) {
  editingUser.name = user.name
  editingUser.jid = user.jid
  editingUser.status = user.status
  editDialogOpen.value = true
}

function openDetailDialog(user: User) {
  viewingUser.value = user
  detailDialogOpen.value = true
}

function openBanDialog(user: User) {
  banTargetUser.value = user
  banDialogOpen.value = true
}

function handleConfirmBan() {
  if (banTargetUser.value) {
    if (banTargetUser.value.status === "active") {
      banUser(banTargetUser.value.jid).then(() => {
        refresh()
        toast.success("User Banned", { description: `${banTargetUser.value!.name} has been banned from using bot commands` })
      })
    } else {
      unbanUser(banTargetUser.value.jid).then(() => {
        refresh()
        toast.success("User Unbanned", { description: `${banTargetUser.value!.name} can now use bot commands again` })
      })
    }
  }
  banDialogOpen.value = false
}

function handleSaveUser() {
  updateUser(editingUser.jid, { name: editingUser.name, status: editingUser.status }).then(() => {
    refresh()
    toast.success("User Updated", { description: `Changes to ${editingUser.name} have been saved` })
  })
  editDialogOpen.value = false
}

const columns: ColumnDef<User>[] = [
  {
    id: "select",
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "jid",
    header: "JID",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "lastSeen",
    header: "Last Seen",
  },
  {
    accessorKey: "commands",
    header: "Commands",
  },
  {
    id: "actions",
    header: "Action",
  },
]

const table = useVueTable({
  get data() { return users.value },
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
      <h1 class="text-2xl font-bold tracking-tight">Users</h1>
      <p class="text-sm text-muted-foreground">Manage registered users</p>
    </div>

    <div class="flex items-center gap-4">
      <div class="relative flex-1 max-w-sm">
        <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input v-model="search" placeholder="Search users..." class="pl-9" />
      </div>
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
            <TableCell class="text-xs text-muted-foreground font-mono">{{ row.original.jid }}</TableCell>
            <TableCell>
              <Badge :variant="row.original.status === 'active' ? 'default' : 'destructive'">
                {{ row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1) }}
              </Badge>
            </TableCell>
            <TableCell class="text-muted-foreground">{{ row.original.lastSeen }}</TableCell>
            <TableCell>{{ row.original.commands }}</TableCell>
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
                  <DropdownMenuItem :class="row.original.status === 'active' ? 'text-destructive' : ''" @click="openBanDialog(row.original)">
                    <Ban v-if="row.original.status === 'active'" class="mr-2 h-4 w-4" />
                    <UserCheck v-else class="mr-2 h-4 w-4" />
                    {{ row.original.status === 'active' ? 'Ban User' : 'Unban User' }}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
          <TableRow v-if="table.getRowModel().rows.length === 0">
            <TableCell :colspan="columns.length" class="h-24 text-center text-muted-foreground">
              No users found.
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

    <!-- Edit User Dialog -->
    <Dialog v-model:open="editDialogOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update user information</DialogDescription>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <Label>Name</Label>
            <Input v-model="editingUser.name" />
          </div>
          <div class="space-y-2">
            <Label>JID</Label>
            <Input v-model="editingUser.jid" disabled class="opacity-60" />
          </div>
          <div class="space-y-2">
            <Label>Status</Label>
            <Select v-model="editingUser.status">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="editDialogOpen = false">Cancel</Button>
          <Button @click="handleSaveUser">
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
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>Full user information</DialogDescription>
        </DialogHeader>
        <div v-if="viewingUser" class="space-y-4 py-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-muted-foreground">Name</p>
              <p class="text-sm font-medium">{{ viewingUser.name }}</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Status</p>
              <Badge :variant="viewingUser.status === 'active' ? 'default' : 'destructive'">
                {{ viewingUser.status.charAt(0).toUpperCase() + viewingUser.status.slice(1) }}
              </Badge>
            </div>
            <div class="col-span-2">
              <p class="text-xs text-muted-foreground">JID</p>
              <p class="text-sm font-mono">{{ viewingUser.jid }}</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Last Seen</p>
              <p class="text-sm">{{ viewingUser.lastSeen }}</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Commands Used</p>
              <p class="text-sm font-medium">{{ viewingUser.commands }}</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="detailDialogOpen = false">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Ban/Unban Confirmation Dialog -->
    <Dialog v-model:open="banDialogOpen">
      <DialogContent class="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {{ banTargetUser?.status === 'active' ? 'Ban User' : 'Unban User' }}
          </DialogTitle>
          <DialogDescription>
            {{ banTargetUser?.status === 'active'
              ? `Are you sure you want to ban ${banTargetUser?.name}? They will no longer be able to use bot commands.`
              : `Are you sure you want to unban ${banTargetUser?.name}? They will be able to use bot commands again.`
            }}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-2">
          <Button variant="outline" @click="banDialogOpen = false">Cancel</Button>
          <Button
            :variant="banTargetUser?.status === 'active' ? 'destructive' : 'default'"
            @click="handleConfirmBan"
          >
            <Ban v-if="banTargetUser?.status === 'active'" class="mr-2 h-4 w-4" />
            <UserCheck v-else class="mr-2 h-4 w-4" />
            {{ banTargetUser?.status === 'active' ? 'Ban' : 'Unban' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
