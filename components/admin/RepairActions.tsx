"use client"

import { useActionState, useState } from "react"
import { manageRepair, type RepairAdminState } from "@/lib/admin/repair-actions"

const initial: RepairAdminState = { status: "idle" }

export function RepairActions({ id }: { id: string }) {
  const [actionType, setActionType] = useState("approved")
  const [state, action, pending] = useActionState(manageRepair, initial)
  return (
    <form action={action} className="mt-5 space-y-3 border-t border-border pt-4">
      <input type="hidden" name="id" value={id} />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-xs font-medium">Action
          <select name="status" value={actionType} onChange={(event) => setActionType(event.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
            <option value="approved">Approve</option><option value="rejected">Reject</option><option value="rescheduled">Reschedule</option>
            <option value="diagnosing">Set: Diagnosing</option><option value="awaiting_approval">Set: Awaiting approval</option>
            <option value="repairing">Set: Repairing</option><option value="ready">Set: Ready</option>
            <option value="completed">Set: Completed</option><option value="cancelled">Set: Cancelled</option>
          </select>
        </label>
        {actionType === "rescheduled" && <div className="grid grid-cols-2 gap-2"><label className="space-y-1 text-xs font-medium">New date<input name="date" type="date" required className="h-10 w-full rounded-lg border border-input bg-background px-2 text-sm" /></label><label className="space-y-1 text-xs font-medium">New time<input name="time" type="time" required className="h-10 w-full rounded-lg border border-input bg-background px-2 text-sm" /></label></div>}
      </div>
      <label className="block space-y-1 text-xs font-medium">Message to customer<textarea name="message" required minLength={3} rows={2} placeholder="Explain the decision or status update" className="w-full rounded-lg border border-input bg-background p-3 text-sm" /></label>
      {state.message && <p className={`text-xs ${state.status === "error" ? "text-destructive" : "text-emerald-700"}`}>{state.message}</p>}
      <button disabled={pending} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">{pending ? "Updating…" : "Update and notify"}</button>
    </form>
  )
}
