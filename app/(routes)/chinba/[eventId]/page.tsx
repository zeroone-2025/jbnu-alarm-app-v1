import EventPageClient from './EventPageClient';

// Server Component - generateStaticParams를 export할 수 있음
export async function generateStaticParams() {
  // test-event만 정적으로 생성
  return [
    {
      eventId: 'test-event',
    },
  ];
}

// 동적 파라미터 비활성화 (output: 'export'에서는 필수)
export const dynamicParams = false;

interface PageProps {
  params: Promise<{
    eventId: string;
  }>;
}

export default async function EventPage({ params }: PageProps) {
  const { eventId } = await params;
  return <EventPageClient eventId={eventId} />;
}
