import tailwindcss from "@tailwindcss/vite"

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2025-07-15",
	devtools: { enabled: true },
	vite: {
		plugins: [tailwindcss()],
		optimizeDeps: {
			include: [
				'@tanstack/vue-table',
				'@vue/devtools-core',
				'@vue/devtools-kit',
				'@vueuse/core',
				'class-variance-authority',
				'clsx',
				'lucide-vue-next',
				'reka-ui',
				'tailwind-merge',
			]
		}
	},
	css: ["~/assets/css/tailwind.css", "vue-sonner/style.css"],
	components: [
		{ path: "~/components", pathPrefix: false },
	],
	shadcn: {
		prefix: "",
		componentDir: "./app/components/ui",
	},
	modules: ["shadcn-nuxt", "@nuxtjs/color-mode"]
});
