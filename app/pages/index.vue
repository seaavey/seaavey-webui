<script setup lang="ts">
import {
  Wifi,
  Users,
  MessageSquare,
  Terminal,
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  Activity,
} from "lucide-vue-next"
import { fetchStats, fetchChartData, fetchActivity } from "~/lib/api"
import { mockStats, mockActivity, mockChartData } from "~/composables/mock-data"

const { data: apiStats } = await useAsyncData("stats", fetchStats, { default: () => null })
const { data: apiChart } = await useAsyncData("chart", fetchChartData, { default: () => null })
const { data: apiActivity } = await useAsyncData("activity", fetchActivity, { default: () => null })

const stats = computed(() => apiStats.value || mockStats)
const chartData = computed(() => apiChart.value?.length ? apiChart.value : mockChartData)
const activity = computed(() => apiActivity.value?.length ? apiActivity.value : mockActivity)
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p class="text-sm text-muted-foreground">Overview of your bot activity</p>
      </div>
      <div class="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5">
        <span class="relative flex h-2 w-2">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span class="text-xs font-medium text-emerald-500">Online</span>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card class="relative overflow-hidden">
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium">Uptime</CardTitle>
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
            <Clock class="h-4 w-4 text-emerald-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stats.uptime }}</div>
          <div class="mt-1 flex items-center gap-1 text-xs text-emerald-500">
            <Wifi class="h-3 w-3" />
            <span>Connected</span>
          </div>
        </CardContent>
      </Card>

      <Card class="relative overflow-hidden">
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium">Total Groups</CardTitle>
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
            <MessageSquare class="h-4 w-4 text-blue-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stats.totalGroups }}</div>
          <div class="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp class="h-3 w-3 text-emerald-500" />
            <span class="text-emerald-500">+3</span>
            <span>from last week</span>
          </div>
        </CardContent>
      </Card>

      <Card class="relative overflow-hidden">
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium">Total Users</CardTitle>
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
            <Users class="h-4 w-4 text-violet-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stats.totalUsers.toLocaleString() }}</div>
          <div class="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp class="h-3 w-3 text-emerald-500" />
            <span class="text-emerald-500">+12%</span>
            <span>from last month</span>
          </div>
        </CardContent>
      </Card>

      <Card class="relative overflow-hidden">
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium">Commands Today</CardTitle>
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
            <Zap class="h-4 w-4 text-amber-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stats.commandsToday }}</div>
          <div class="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Activity class="h-3 w-3" />
            <span>{{ stats.messagesProcessed.toLocaleString() }} messages processed</span>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Chart + Activity -->
    <div class="grid gap-6 lg:grid-cols-7">
      <!-- Chart -->
      <Card class="lg:col-span-4">
        <CardHeader class="flex flex-row items-center justify-between">
          <div>
            <CardTitle class="text-base">Command Usage</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </div>
          <div class="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
            <TrendingUp class="h-3 w-3 text-emerald-500" />
            <span class="font-medium text-emerald-500">+8.2%</span>
          </div>
        </CardHeader>
        <CardContent>
          <div class="flex h-52 items-end gap-2">
            <div
              v-for="item in chartData"
              :key="item.day"
              class="relative flex h-full flex-1 flex-col items-center justify-end gap-2"
            >
              <span class="text-xs font-medium text-foreground">{{ item.commands }}</span>
              <div
                class="w-full rounded-lg bg-emerald-500 transition-all hover:bg-emerald-400"
                :style="{ height: `${(item.commands / 250) * 100}%` }"
              />
              <span class="text-xs text-muted-foreground">{{ item.day }}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Recent Activity -->
      <Card class="lg:col-span-3">
        <CardHeader>
          <CardTitle class="text-base">Recent Activity</CardTitle>
          <CardDescription>Latest events</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div
              v-for="(item, i) in activity"
              :key="i"
              class="flex items-start gap-3"
            >
              <div
                :class="[
                  'mt-0.5 flex h-6 w-6 items-center justify-center rounded-full',
                  item.type === 'command' ? 'bg-blue-500/10' :
                  item.type === 'join' ? 'bg-emerald-500/10' :
                  'bg-amber-500/10'
                ]"
              >
                <Terminal v-if="item.type === 'command'" class="h-3 w-3 text-blue-500" />
                <Users v-else-if="item.type === 'join'" class="h-3 w-3 text-emerald-500" />
                <Activity v-else class="h-3 w-3 text-amber-500" />
              </div>
              <div class="flex-1 space-y-0.5">
                <p class="text-sm leading-tight">{{ item.text }}</p>
                <p class="text-xs text-muted-foreground">{{ item.time }}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
