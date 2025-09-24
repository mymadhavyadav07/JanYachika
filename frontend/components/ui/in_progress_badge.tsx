import { Badge } from '@/components/ui/badge'

const InProgressBadge = () => {
  return (
    <Badge className='rounded-full border-none bg-blue-600/10 text-blue-600 focus-visible:ring-blue-600/20 focus-visible:outline-none dark:bg-blue-400/10 dark:text-blue-400 dark:focus-visible:ring-blue-400/40 [a&]:hover:bg-blue-600/5 dark:[a&]:hover:bg-blue-400/5'>
      <span className='size-1.5 rounded-full bg-blue-600 dark:bg-blue-400' aria-hidden='true' />
      In-Progress
    </Badge>
  )
}

export default InProgressBadge
