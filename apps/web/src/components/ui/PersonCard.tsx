import { Card, CardBody, CardTitle, cn } from './Card'
import { ResponsiveImage } from './ResponsiveImage'

interface PersonCardProps {
  name: string
  role?: string
  qualifications?: string
  specialisation?: string
  photoUrl?: string
  photoAlt?: string
  className?: string
}

const roleLabels: Record<string, string> = {
  founder: 'Founder',
  team: 'Team Member',
  adviser: 'Adviser',
  writer: 'Writer',
  reviewer: 'Reviewer',
  volunteer: 'Volunteer',
  'outreach-manager': 'Outreach Manager',
}

export function PersonCard({
  name,
  role,
  qualifications,
  specialisation,
  photoUrl,
  photoAlt,
  className,
}: PersonCardProps) {
  const roleLabel = role ? (roleLabels[role] ?? role.charAt(0).toUpperCase() + role.slice(1)) : ''

  return (
    <Card className={cn('h-full', className)}>
      <CardBody className="flex h-full flex-col items-center py-6 text-center">
        {photoUrl ? (
          <ResponsiveImage
            src={photoUrl}
            alt={photoAlt ?? name}
            ratio="1/1"
            displayWidth={128}
            sizes="96px"
            className="h-24 w-24 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-24 w-24 items-center justify-center rounded-full bg-leaf-100 font-display text-2xl font-semibold text-leaf-700"
          >
            {name.charAt(0).toUpperCase()}
          </span>
        )}
        <CardTitle className="mt-3">{name}</CardTitle>
        {roleLabel ? (
          <p className="text-xs font-medium uppercase tracking-wide text-leaf-700">{roleLabel}</p>
        ) : null}
        {specialisation ? (
          <p className="text-sm font-medium text-ink-700">{specialisation}</p>
        ) : null}
        {qualifications ? <p className="text-sm text-ink-600">{qualifications}</p> : null}
      </CardBody>
    </Card>
  )
}