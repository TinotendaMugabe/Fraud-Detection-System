import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldAlertIcon } from "lucide-react"

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-md space-y-6 text-center">
        <ShieldAlertIcon className="h-12 w-12 mx-auto text-destructive" />
        <h1 className="text-3xl font-bold">Authentication Error</h1>
        <p className="text-muted-foreground">
          There was a problem with your authentication. The link may have expired or is invalid.
        </p>
        <div className="pt-4">
          <Button asChild>
            <Link href="/login">Return to Login</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
