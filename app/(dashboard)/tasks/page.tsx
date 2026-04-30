import { Suspense } from "react"
import { MyTasksPage } from "@/components/tasks/MyTasksPage"

export default function Page() {
  return (
    <Suspense fallback={null}>
      <MyTasksPage />
    </Suspense>
  )
}
