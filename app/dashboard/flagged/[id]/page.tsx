import FlaggedTransactionDetailClient from "./client"

type PageProps = {
  params: {
    id: string
  }
}

export default function Page({ params }: PageProps) {
  return <FlaggedTransactionDetailClient id={params.id} />
}
