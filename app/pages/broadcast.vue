<script setup lang="ts">
import { Send } from "lucide-vue-next"
import { ref } from "vue"
import { toast } from "vue-sonner"
import { mockGroups } from "~/composables/mock-data"
import { fetchGroups, sendBroadcast } from "~/lib/api"

const { data: apiGroups } = await useAsyncData("broadcast-groups", fetchGroups, { default: () => [] })
const groups = computed(() => apiGroups.value?.length ? apiGroups.value : mockGroups)

const target = ref("all")
const message = ref("")
const sent = ref(false)

async function handleSend() {
  if (!message.value.trim()) return
  await sendBroadcast(target.value, message.value)
  toast.success("Broadcast Sent", { description: `Message delivered to ${target.value === 'all' ? 'all groups' : 'selected group'}` })
  sent.value = true
  setTimeout(() => {
    sent.value = false
    message.value = ""
  }, 2000)
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Broadcast</h1>
      <p class="text-sm text-muted-foreground">Send messages to groups</p>
    </div>

    <Card class="max-w-2xl">
      <CardHeader>
        <CardTitle class="text-base">New Broadcast</CardTitle>
        <CardDescription>Send a message to one or all groups</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label>Target</Label>
          <Select v-model="target">
            <SelectTrigger>
              <SelectValue placeholder="Select target" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Groups ({{ groups.length }})</SelectItem>
              <SelectItem v-for="group in groups" :key="group.jid" :value="group.jid">
                {{ group.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label>Message</Label>
          <Textarea
            v-model="message"
            placeholder="Type your broadcast message..."
            class="min-h-32 resize-none"
          />
        </div>
      </CardContent>
      <CardFooter class="flex items-center justify-between">
        <p v-if="sent" class="text-sm text-emerald-500">Message sent successfully!</p>
        <span v-else />
        <Button :disabled="!message.trim()" @click="handleSend">
          <Send class="mr-2 h-4 w-4" />
          Send Broadcast
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>
