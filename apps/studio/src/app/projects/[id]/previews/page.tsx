import PreviewsPageClient from './PreviewsPageClient';

interface PreviewsPageProps {
  params: Promise<{ id: string }>;
}

export default function PreviewsPage({ params }: PreviewsPageProps) {
  const kicadCliPath = process.env.KICAD_CLI_PATH;
  const degradedMessage = kicadCliPath
    ? undefined
    : 'KiCad generation is in fixture mode. No real ERC/DRC validation.';

  return <PreviewsPageClient params={params} degradedMessage={degradedMessage} />;
}
