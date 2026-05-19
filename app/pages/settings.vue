<script setup lang="ts">
import { Save, Globe, Wifi, WifiOff } from "lucide-vue-next"
import CloudflareIcon from "~/components/icons/CloudflareIcon.vue"
import TailscaleIcon from "~/components/icons/TailscaleIcon.vue"
import { ref } from "vue"
import { toast } from "vue-sonner"
import { fetchSettings, updateSettings } from "~/lib/api"

const { data: apiSettings } = await useAsyncData("settings", fetchSettings, { default: () => null })

const settings = ref({
  botName: apiSettings.value?.botName || "SeaaveyBot",
  ownerNumber: apiSettings.value?.ownerNumber || "",
  prefix: apiSettings.value?.prefix || ".",
  apiKey: apiSettings.value?.apiKey || "",
  autoRead: apiSettings.value?.autoRead ?? true,
  selfMode: apiSettings.value?.selfMode ?? false,
  publicMode: apiSettings.value?.publicMode ?? true,
})

const tunnel = ref({
  provider: "cloudflare" as "cloudflare" | "tailscale",
  enabled: false,
  cloudflare: {
    token: "",
    domain: "bot.example.com",
  },
  tailscale: {
    authKey: "",
    hostname: "seaaveybot",
  },
})

const saved = ref(false)

async function handleSave() {
  await updateSettings(settings.value)
  toast.success("Settings Saved", { description: "Bot configuration has been updated" })
  saved.value = true
  setTimeout(() => { saved.value = false }, 2000)
}

function toggleTunnel() {
  tunnel.value.enabled = !tunnel.value.enabled
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Settings</h1>
      <p class="text-sm text-muted-foreground">Configure your bot</p>
    </div>

    <Card class="max-w-2xl">
      <CardHeader>
        <CardTitle class="text-base">General Settings</CardTitle>
        <CardDescription>Basic bot configuration</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label>Bot Name</Label>
            <Input v-model="settings.botName" />
          </div>
          <div class="space-y-2">
            <Label>Owner Number</Label>
            <Input v-model="settings.ownerNumber" />
          </div>
          <div class="space-y-2">
            <Label>Command Prefix</Label>
            <Input v-model="settings.prefix" />
          </div>
          <div class="space-y-2">
            <Label>API Key</Label>
            <Input v-model="settings.apiKey" type="password" />
          </div>
        </div>

        <Separator />

        <div class="space-y-4">
          <h3 class="text-sm font-medium">Behavior</h3>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium">Auto Read Messages</p>
              <p class="text-xs text-muted-foreground">Automatically mark messages as read</p>
            </div>
            <Switch v-model:checked="settings.autoRead" />
          </div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium">Self Mode</p>
              <p class="text-xs text-muted-foreground">Only respond to owner messages</p>
            </div>
            <Switch v-model:checked="settings.selfMode" />
          </div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium">Public Mode</p>
              <p class="text-xs text-muted-foreground">Allow all users to use commands</p>
            </div>
            <Switch v-model:checked="settings.publicMode" />
          </div>
        </div>
      </CardContent>
      <CardFooter class="flex items-center justify-between">
        <p v-if="saved" class="text-sm text-emerald-500">Settings saved!</p>
        <span v-else />
        <Button @click="handleSave">
          <Save class="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </CardFooter>
    </Card>
    <Card class="max-w-2xl">
      <CardHeader>
        <CardTitle class="text-base flex items-center gap-2">
          <Globe class="h-4 w-4" />
          Tunneling
        </CardTitle>
        <CardDescription>Expose your bot to the internet via secure tunnel</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <!-- Status -->
        <div class="flex items-center justify-between rounded-lg border border-border p-4">
          <div class="flex items-center gap-3">
            <div :class="['flex h-9 w-9 items-center justify-center rounded-full', tunnel.enabled ? 'bg-emerald-500/10' : 'bg-muted']">
              <Wifi v-if="tunnel.enabled" class="h-4 w-4 text-emerald-500" />
              <WifiOff v-else class="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p class="text-sm font-medium">{{ tunnel.enabled ? 'Tunnel Active' : 'Tunnel Inactive' }}</p>
              <p class="text-xs text-muted-foreground">
                {{ tunnel.enabled ? `Connected via ${tunnel.provider === 'cloudflare' ? 'Cloudflare' : 'Tailscale'}` : 'Not connected' }}
              </p>
            </div>
          </div>
          <Button
            :variant="tunnel.enabled ? 'destructive' : 'default'"
            size="sm"
            @click="toggleTunnel"
          >
            {{ tunnel.enabled ? 'Disconnect' : 'Connect' }}
          </Button>
        </div>

        <!-- Provider selection -->
        <div class="space-y-2">
          <Label>Provider</Label>
          <div class="grid grid-cols-2 gap-3">
            <button
              :class="['flex items-center gap-3 rounded-lg border p-3 text-left transition-colors', tunnel.provider === 'cloudflare' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50']"
              @click="tunnel.provider = 'cloudflare'"
            >
              <CloudflareIcon class="h-5 w-5 text-orange-500" />
              <div>
                <p class="text-sm font-medium">Cloudflare</p>
                <p class="text-xs text-muted-foreground">Tunnel via cloudflared</p>
              </div>
            </button>
            <button
              :class="['flex items-center gap-3 rounded-lg border p-3 text-left transition-colors', tunnel.provider === 'tailscale' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50']"
              @click="tunnel.provider = 'tailscale'"
            >
              <TailscaleIcon class="h-5 w-5 text-blue-500" />
              <div>
                <p class="text-sm font-medium">Tailscale</p>
                <p class="text-xs text-muted-foreground">Mesh VPN access</p>
              </div>
            </button>
          </div>
        </div>

        <Separator />

        <!-- Cloudflare config -->
        <div v-if="tunnel.provider === 'cloudflare'" class="space-y-4">
          <div class="space-y-2">
            <Label>Tunnel Token</Label>
            <Input v-model="tunnel.cloudflare.token" type="password" placeholder="eyJhIjoixxxxxxx..." />
          </div>
          <div class="space-y-2">
            <Label>Domain</Label>
            <Input v-model="tunnel.cloudflare.domain" placeholder="bot.example.com" />
          </div>
        </div>

        <!-- Tailscale config -->
        <div v-if="tunnel.provider === 'tailscale'" class="space-y-4">
          <div class="space-y-2">
            <Label>Auth Key</Label>
            <Input v-model="tunnel.tailscale.authKey" type="password" placeholder="tskey-auth-xxxxx" />
          </div>
          <div class="space-y-2">
            <Label>Hostname</Label>
            <Input v-model="tunnel.tailscale.hostname" placeholder="seaaveybot" />
          </div>
        </div>
      </CardContent>
    </Card>

    </div>
</template>
