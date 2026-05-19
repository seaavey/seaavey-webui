<script setup lang="ts">
import { Send } from "lucide-vue-next"
import { ref } from "vue"
import { mockGroups } from "~/composables/mock-data"

const target = ref("all")
const message = ref("")
const sent = ref(false)

function handleSend() {
  if (!message.value.trim()) return
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
              <SelectItem value="all">All Groups ({{ mockGroups.length }})</SelectItem>
              <SelectItem v-for="group in mockGroups" :key="group.jid" :value="group.jid">
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
