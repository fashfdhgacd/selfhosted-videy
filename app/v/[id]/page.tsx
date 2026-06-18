import { redirect } from 'next/navigation'

export default function ShortRedirect({ params }: { params: { id: string } }) {
  redirect(`/watch/${params.id}`)
}
