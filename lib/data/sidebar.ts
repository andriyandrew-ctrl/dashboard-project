export type NavItemId = "projects" | "performance"

export type NavItem = {
    id: NavItemId
    label: string
    badge?: number
}

export const navItems: NavItem[] = [
    { id: "projects", label: "Projects" },
    { id: "performance", label: "Performance" },
]

export const footerItems = []
