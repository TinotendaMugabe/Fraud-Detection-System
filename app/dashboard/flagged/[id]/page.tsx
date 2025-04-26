import { Metadata } from 'next'
import FlaggedTransactionDetailClient from "./client"

export const dynamic = 'force-dynamic'

type PageProps = {
  params: {
    id: string
  }
}

export default function Page({ params }: PageProps) {
  return <FlaggedTransactionDetailClient id={params.id} />
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `Transaction ${params.id}`,
  }
}