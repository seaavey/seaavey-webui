<script setup lang="ts">
import { Search, MoreHorizontal, ArrowUpDown, Pencil, Eye, ShieldOff, Shield, Save, Users } from "lucide-vue-next"
import { ref, reactive, nextTick } from "vue"
import { toast } from "vue-sonner"
import { Checkbox } from "~/components/ui/checkbox"
import { fetchGroups, updateGroup, muteGroup, unmuteGroup } from "~/lib/api"
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

interface Group {
  jid: string
  name: string
  members: number
  status: "active" | "muted"
  welcome?: boolean
  goodbye?: boolean
  antiSpam?: boolean
  antilink?: boolean
  antidelete?: boolean
  antitoxic?: boolean
  antinsfw?: boolean
  antiviewonce?: boolean
  autosticker?: boolean
  onlyAdmin?: boolean
  warnMax?: number
}

const { data: apiGroups, refresh } = await useAsyncData("groups", fetchGroups, { default: () => [], server: false })
const groups = computed(() => apiGroups.value as Group[])

const search = ref("")
const sorting = ref<SortingState>([])
const rowSelection = ref({})

const editDialogOpen = ref(false)
const editDialogKey = ref(0)
const detailDialogOpen = ref(false)
const muteDialogOpen = ref(false)
const editingGroup = reactive({
  name: "",
  jid: "",
  status: "" as "active" | "muted",
  welcome: false,
  goodbye: false,
  antiSpam: false,
  antilink: false,
  antidelete: false,
  antitoxic: false,
  antinsfw: false,
  antiviewonce: false,
  autosticker: false,
  onlyAdmin: false,
})
const viewingGroup = ref<Group | null>(null)
const muteTargetGroup = ref<Group | null>(null)

async function openEditDialog(group: Group) {
  const current = groups.value.find((g) => g.jid === group.jid) || group
  editingGroup.name = current.name
  editingGroup.jid = current.jid
  editingGroup.status = current.status
  editingGroup.welcome = !!current.welcome
  editingGroup.goodbye = !!current.goodbye
  editingGroup.antiSpam = !!current.antiSpam
  editingGroup.antilink = !!current.antilink
  editingGroup.antidelete = !!current.antidelete
  editingGroup.antitoxic = !!current.antitoxic
  editingGroup.antinsfw = !!current.antinsfw
  editingGroup.antiviewonce = !!current.antiviewonce
  editingGroup.autosticker = !!current.autosticker
  editingGroup.onlyAdmin = !!current.onlyAdmin
  editDialogKey.value++
  await nextTick()
  editDialogOpen.value = true
}

function openDetailDialog(group: Group) {
  viewingGroup.value = groups.value.find((g) => g.jid === group.jid) || group
  detailDialogOpen.value = true
}

function openMuteDialog(group: Group) {
  muteTargetGroup.value = group
  muteDialogOpen.value = true
}

async function handleConfirmMute() {
  if (!muteTargetGroup.value) return
  try {
    if (muteTargetGroup.value.status === "active") {
      await muteGroup(muteTargetGroup.value.jid)
      apiGroups.value = apiGroups.value.map((g) => g.jid === muteTargetGroup.value!.jid ? { ...g, status: "muted" as const } : g)
      toast.success("Group Muted", { description: `${muteTargetGroup.value.name} — bot will stop responding in this group` })
    } else {
      await unmuteGroup(muteTargetGroup.value.jid)
      apiGroups.value = apiGroups.value.map((g) => g.jid === muteTargetGroup.value!.jid ? { ...g, status: "active" as const } : g)
      toast.success("Group Unmuted", { description: `${muteTargetGroup.value.name} — bot will respond again` })
    }
    muteDialogOpen.value = false
  } catch (e) {
    toast.error("Failed to update group", { description: (e as Error).message })
  }
}

async function handleSaveGroup() {
  try {
    const updated = await updateGroup(editingGroup.jid, {
      name: editingGroup.name,
      status: editingGroup.status,
      welcome: editingGroup.welcome,
      goodbye: editingGroup.goodbye,
      antiSpam: editingGroup.antiSpam,
      antilink: editingGroup.antilink,
      antidelete: editingGroup.antidelete,
      antitoxic: editingGroup.antitoxic,
      antinsfw: editingGroup.antinsfw,
      antiviewonce: editingGroup.antiviewonce,
      autosticker: editingGroup.autosticker,
      onlyAdmin: editingGroup.onlyAdmin,
    })
    apiGroups.value = apiGroups.value.map((g) => g.jid === updated.jid ? updated : g)
    toast.success("Group Updated", { description: `Settings for ${editingGroup.name} have been saved` })
    editDialogOpen.value = false
  } catch (e) {
    toast.error("Failed to update group", { description: (e as Error).message })
  }
}
const columns: ColumnDef<Group>[] = [
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
    id: "actions",
    header: "Action",
  },
]

const table = useVueTable({
  get data() { return groups.value },
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
      <DialogContent :key="editDialogKey" class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Group</DialogTitle>
          <DialogDescription>Update group settings</DialogDescription>
        </DialogHeader>
        <div class="space-y-5 py-2">
          <div class="grid gap-4 sm:grid-cols-2">
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
          </div>

          <Separator />

          <div>
            <p class="text-sm font-medium mb-3">Features</p>
            <div class="grid grid-cols-2 gap-3">
              <div class="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <span class="text-sm">Welcome</span>
                <Switch v-model="editingGroup.welcome" />
              </div>
              <div class="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <span class="text-sm">Goodbye</span>
                <Switch v-model="editingGroup.goodbye" />
              </div>
              <div class="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <span class="text-sm">Anti-Spam</span>
                <Switch v-model="editingGroup.antiSpam" />
              </div>
              <div class="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <span class="text-sm">Anti-Link</span>
                <Switch v-model="editingGroup.antilink" />
              </div>
              <div class="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <span class="text-sm">Anti-Delete</span>
                <Switch v-model="editingGroup.antidelete" />
              </div>
              <div class="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <span class="text-sm">Anti-Toxic</span>
                <Switch v-model="editingGroup.antitoxic" />
              </div>
              <div class="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <span class="text-sm">Anti-NSFW</span>
                <Switch v-model="editingGroup.antinsfw" />
              </div>
              <div class="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <span class="text-sm">Anti-ViewOnce</span>
                <Switch v-model="editingGroup.antiviewonce" />
              </div>
              <div class="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <span class="text-sm">Auto Sticker</span>
                <Switch v-model="editingGroup.autosticker" />
              </div>
              <div class="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <span class="text-sm">Only Admin</span>
                <Switch v-model="editingGroup.onlyAdmin" />
              </div>
            </div>
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
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle class="text-xl">{{ viewingGroup?.name }}</DialogTitle>
          <DialogDescription class="font-mono text-xs">{{ viewingGroup?.jid }}</DialogDescription>
        </DialogHeader>
        <div v-if="viewingGroup" class="space-y-5 py-2">
          <div class="flex items-center gap-6">
            <div class="flex items-center gap-2">
              <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Users class="h-4 w-4 text-primary" />
              </div>
              <div>
                <p class="text-lg font-semibold leading-none">{{ viewingGroup.members }}</p>
                <p class="text-xs text-muted-foreground">Members</p>
              </div>
            </div>
            <Badge :variant="viewingGroup.status === 'active' ? 'default' : 'secondary'" class="text-xs">
              {{ viewingGroup.status.charAt(0).toUpperCase() + viewingGroup.status.slice(1) }}
            </Badge>
          </div>

          <Separator />

          <div>
            <p class="text-sm font-medium mb-3">Features</p>
            <div class="grid grid-cols-2 gap-2">
              <div v-for="feature in [
                { label: 'Welcome', active: viewingGroup.welcome },
                { label: 'Goodbye', active: viewingGroup.goodbye },
                { label: 'Anti-Spam', active: viewingGroup.antiSpam },
                { label: 'Anti-Link', active: viewingGroup.antilink },
                { label: 'Anti-Delete', active: viewingGroup.antidelete },
                { label: 'Anti-Toxic', active: viewingGroup.antitoxic },
                { label: 'Anti-NSFW', active: viewingGroup.antinsfw },
                { label: 'Anti-ViewOnce', active: viewingGroup.antiviewonce },
                { label: 'Auto Sticker', active: viewingGroup.autosticker },
                { label: 'Only Admin', active: viewingGroup.onlyAdmin },
              ]" :key="feature.label" class="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <span class="text-sm">{{ feature.label }}</span>
                <span :class="['h-2 w-2 rounded-full', feature.active ? 'bg-emerald-500' : 'bg-muted-foreground/30']" />
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between rounded-md border border-border px-3 py-2">
            <span class="text-sm">Warn Max</span>
            <span class="text-sm font-medium">{{ viewingGroup.warnMax || 3 }}</span>
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
