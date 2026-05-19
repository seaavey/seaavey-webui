<script setup lang="ts">
import { ref, computed } from "vue"
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Terminal,
  Radio,
  ScrollText,
  Clock,
  Settings,
  Moon,
  Sun,
  Menu,
  X,
  Bot,
} from "lucide-vue-next"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb"

const colorMode = useColorMode()
const route = useRoute()
const sidebarOpen = ref(false)

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard, to: "/" },
  { name: "Groups", icon: MessageSquare, to: "/groups" },
  { name: "Users", icon: Users, to: "/users" },
  { name: "Commands", icon: Terminal, to: "/commands" },
  { name: "Broadcast", icon: Radio, to: "/broadcast" },
  { name: "Logs", icon: ScrollText, to: "/logs" },
  { name: "Schedules", icon: Clock, to: "/schedules" },
  { name: "Settings", icon: Settings, to: "/settings" },
]

const currentPageTitle = computed(() => {
  const current = navigation.find((item) => item.to === route.path)
  return current?.name ?? "Dashboard"
})

function toggleTheme() {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark"
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Sidebar overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-30 bg-black/50 lg:hidden"
      @click="sidebarOpen = false"
    />

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-200 lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <!-- Logo -->
      <div class="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Bot class="h-4 w-4 text-primary-foreground" />
        </div>
        <span class="text-lg font-semibold tracking-tight">SeaaveyBot</span>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 space-y-1 px-3 py-4">
        <NuxtLink
          v-for="item in navigation"
          :key="item.name"
          :to="item.to"
          class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          active-class="!bg-sidebar-accent !text-sidebar-accent-foreground"
          @click="sidebarOpen = false"
        >
          <component :is="item.icon" class="h-4 w-4" />
          {{ item.name }}
        </NuxtLink>
      </nav>

    </aside>

    <!-- Main content -->
    <main class="lg:pl-64">
      <!-- Topbar -->
      <header class="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6">
        <div class="flex items-center gap-3">
          <!-- Mobile menu button -->
          <button
            class="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground lg:hidden"
            @click="sidebarOpen = !sidebarOpen"
          >
            <Menu v-if="!sidebarOpen" class="h-5 w-5" />
            <X v-else class="h-5 w-5" />
          </button>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink as-child>
                  <NuxtLink to="/">Home</NuxtLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator v-if="route.path !== '/'" />
              <BreadcrumbItem v-if="route.path !== '/'">
                <BreadcrumbPage>{{ currentPageTitle }}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div class="flex items-center gap-2">
          <!-- Theme toggle -->
          <ClientOnly>
            <button
              class="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              @click="toggleTheme"
            >
              <Sun v-if="colorMode.value === 'dark'" class="h-4 w-4" />
              <Moon v-else class="h-4 w-4" />
            </button>
          </ClientOnly>
        </div>
      </header>

      <div class="p-6 lg:p-8">
        <slot />
      </div>
    </main>
  </div>
</template>
