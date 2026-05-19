<script setup lang="ts">
import { Plus, Trash2 } from "lucide-vue-next"
import { toast } from "vue-sonner"
import { mockSchedules } from "~/composables/mock-data"
import { fetchSchedules, deleteSchedule } from "~/lib/api"

const { data: apiSchedules, refresh } = await useAsyncData("schedules", fetchSchedules, { default: () => [] })
const schedules = computed(() => apiSchedules.value?.length ? apiSchedules.value : mockSchedules)

async function handleDelete(id: string) {
  await deleteSchedule(id)
  await refresh()
  toast.success("Schedule Deleted", { description: "Scheduled message has been removed" })
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Schedules</h1>
        <p class="text-sm text-muted-foreground">Manage scheduled messages</p>
      </div>
      <Button>
        <Plus class="mr-2 h-4 w-4" />
        New Schedule
      </Button>
    </div>

    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Cron</TableHead>
            <TableHead>Target</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Run</TableHead>
            <TableHead class="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="schedule in schedules" :key="schedule.id">
            <TableCell class="font-medium">{{ schedule.name }}</TableCell>
            <TableCell class="font-mono text-sm text-muted-foreground">{{ schedule.cron }}</TableCell>
            <TableCell>{{ schedule.target }}</TableCell>
            <TableCell>
              <Badge :variant="schedule.status === 'active' ? 'default' : 'secondary'">
                {{ schedule.status }}
              </Badge>
            </TableCell>
            <TableCell class="text-muted-foreground">{{ schedule.lastRun }}</TableCell>
            <TableCell>
              <Button variant="ghost" size="icon" @click="handleDelete(schedule.id)">
                <Trash2 class="h-4 w-4 text-destructive" />
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  </div>
</template>
