interface Props {
  description: string;
  projectName?: string;
  className?: string;
}

export default function HomeHeroScene({ description, projectName, className }: Props) {
  const alt = projectName ? `${description} ${projectName}` : description;

  return (
    <img
      src="/assets/event-organizer-registration-3d.png"
      alt={alt}
      width={1448}
      height={1024}
      fetchPriority="high"
      decoding="async"
      draggable={false}
      className={className}
    />
  );
}
